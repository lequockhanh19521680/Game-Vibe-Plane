const { putItem, getItem, updateItem } = require("../utils/dynamodb");
const { getCountryFromIP, extractIPFromEvent } = require("../utils/geoip");
const { sanitizeInput, validateScore } = require("../utils/security");
const { getCorsHeaders } = require("../utils/cors");

/**
 * Calculate player's global rank (approximate)
 */
async function calculatePlayerRank(score) {
  try {
    const { scanItems } = require("../utils/dynamodb");
    // Scan is a simple way to calculate rank in DynamoDB without complex GSIs.
    // For large-scale applications, a more sophisticated ranking system would be needed.
    const allScores = await scanItems(process.env.SCORES_TABLE, {
      ProjectionExpression: "score",
    });
    const higherScores = allScores.filter((item) => item.score > score);
    return higherScores.length + 1;
  } catch (error) {
    console.error("Error calculating rank:", error);
    return null; // Return null on error, don't block response
  }
}

/**
 * Submit a game result. Only updates the score if it is a new high score,
 * but ALWAYS updates player metadata (username, country) and triggers the stream.
 * The country stats update is now handled by the processScoreUpdate Lambda via DynamoDB Streams.
 */
exports.handler = async (event) => {
  // Get Origin header for CORS
  const origin = event.headers.origin || event.headers.Origin;
  // Specify allowed methods for this endpoint
  const corsHeaders = getCorsHeaders(origin, "POST, OPTIONS");

  // Handle OPTIONS preflight request (Serverless framework cors:true might handle this, but explicit is safer)
  if (
    event.httpMethod === "OPTIONS" ||
    event.requestContext?.http?.method === "OPTIONS"
  ) {
    return {
      statusCode: 204, // No Content
      headers: corsHeaders,
      body: "",
    };
  }

  // Check if origin is allowed before proceeding with POST logic
  if (!corsHeaders["Access-Control-Allow-Origin"]) {
    console.warn(`CORS check failed for origin: ${origin}. Aborting request.`);
    return {
      statusCode: 403, // Forbidden
      headers: { "Content-Type": "application/json" }, // No CORS headers needed for rejection
      body: JSON.stringify({
        error: "CORS Forbidden",
        message: `Origin ${origin} is not allowed.`,
      }),
    };
  }

  try {
    console.log("Submit score event:", JSON.stringify(event, null, 2));
    const body = JSON.parse(event.body || "{}");
    const { username, score, survivalTime, deathCause, userId, fingerprint } =
      body;

    // --- SECURITY: Validate score and survivalTime ---
    const scoreValidation = validateScore(score, survivalTime);
    if (!scoreValidation.isValid) {
      console.warn(
        `Invalid score submission rejected for userId ${userId}: ${scoreValidation.reason}`
      );
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers in error response
        body: JSON.stringify({
          error: "Invalid score submission",
          reason: scoreValidation.reason,
        }),
      };
    }

    let validatedScore = Math.floor(score);

    if (
      !userId ||
      !username ||
      typeof score !== "number" ||
      typeof survivalTime !== "number"
    ) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
        body: JSON.stringify({
          error: "Missing required fields",
          required: ["userId", "username", "score", "survivalTime"],
        }),
      };
    }

    const existingScoreItem = await getItem(process.env.SCORES_TABLE, {
      userId,
    });

    let isNewHighScore = false;
    let dbOperationPromise;
    const clientIP = body.clientIP || extractIPFromEvent(event);
    const countryInfo = clientIP
      ? await getCountryFromIP(clientIP)
      : { country: "Unknown", countryCode: "XX" };
    const timestamp = Date.now();
    const isoTimestamp = new Date(timestamp).toISOString();

    if (!existingScoreItem || validatedScore > existingScoreItem.score) {
      // Case 1: New high score OR first submission (userId does not exist)
      isNewHighScore = true;
      console.log(
        `New high score detected: ${validatedScore}. Overwriting old score: ${
          existingScoreItem?.score || 0
        }`
      );

      const newScoreRecord = {
        userId,
        username: sanitizeInput(username.substring(0, 20)), // SECURITY: Sanitize & Limit length
        score: validatedScore,
        survivalTime: Math.floor(survivalTime),
        deathCause: deathCause || "unknown",
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        city: countryInfo.city || null,
        region: countryInfo.region || null,
        clientIP,
        fingerprint: fingerprint || null,
        userAgent: body.userAgent || event.headers?.["user-agent"],
        timestamp, // Use numerical timestamp for potential sorting/filtering
        createdAt: existingScoreItem
          ? existingScoreItem.createdAt
          : isoTimestamp,
        updatedAt: isoTimestamp,
        gameType: "default", // For GSI querying
      };

      // Use putItem to overwrite with the new high score + metadata
      dbOperationPromise = putItem(process.env.SCORES_TABLE, newScoreRecord);
    } else {
      // Case 2: Score is NOT a new high score (or is equal)
      // Only update metadata (username, last game info) to trigger stream and fix name changes.
      console.log(
        "Not a new high score, updating metadata (username/last game data) only."
      );

      const currentScore = existingScoreItem.score;

      // Use UpdateItem to ONLY update non-score-related metadata
      dbOperationPromise = updateItem(
        process.env.SCORES_TABLE,
        { userId },
        "SET #u = :username, #ca = :country, #cc = :countryCode, lastSurvivalTime = :lastSurvivalTime, lastDeathCause = :lastDeathCause, updatedAt = :updatedAt, #fp = :fingerprint, #ua = :userAgent, lastScore = :lastScore, #ts = :timestamp", // Added timestamp
        {
          ":username": sanitizeInput(username.substring(0, 20)), // SECURITY: Sanitize & Limit length
          ":country": countryInfo.country,
          ":countryCode": countryInfo.countryCode,
          ":lastSurvivalTime": Math.floor(survivalTime),
          ":lastDeathCause": deathCause || "unknown",
          ":updatedAt": isoTimestamp,
          ":fingerprint": fingerprint || null,
          ":userAgent": body.userAgent || event.headers?.["user-agent"],
          ":lastScore": validatedScore, // Store the last game's score
          ":timestamp": timestamp, // Update numerical timestamp
        },
        {
          ExpressionAttributeNames: {
            "#u": "username",
            "#ca": "country",
            "#cc": "countryCode",
            "#fp": "fingerprint",
            "#ua": "userAgent",
            "#ts": "timestamp", // Added alias for timestamp
          },
        }
      );

      validatedScore = currentScore; // Use the old high score for rank calculation in response
    }

    await dbOperationPromise;
    console.log("Game result processed. Stream triggered for userId:", userId);

    // Calculate rank AFTER DB operation completes
    const rank = await calculatePlayerRank(validatedScore);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
      body: JSON.stringify({
        success: true,
        isNewHighScore: isNewHighScore,
        userId,
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        rank: rank,
        message: isNewHighScore
          ? "New high score submitted successfully"
          : "Game result submitted, metadata updated.",
      }),
    };
  } catch (error) {
    console.error("Error submitting score:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
