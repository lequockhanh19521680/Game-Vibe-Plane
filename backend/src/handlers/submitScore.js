const {
  putItem,
  getItem,
  updateItem,
  getTopScores,
  getTopCountries,
  getCountryLeaderboard,
} = require("../utils/dynamodb");
const { getCountryFromIP, extractIPFromEvent } = require("../utils/geoip");
const {
  broadcastLeaderboardUpdate,
  broadcastCountryUpdate,
} = require("../utils/websocket");

/**
 * Update country statistics
 * @param {string} country - The country of the player.
 * @param {number} score - The new score.
 * @param {object|null} oldScoreItem - The previous score item for the user, if any.
 */
async function updateCountryStats(country, score, oldScoreItem) {
  if (!country || country === "Unknown") return;

  try {
    const scoreDifference = oldScoreItem ? score - oldScoreItem.score : score;
    const playerCountIncrement = oldScoreItem ? 0 : 1;

    // Get the current country data first to calculate the new average
    const countryData = await getItem(process.env.COUNTRIES_TABLE, { country });

    if (countryData) {
      const newTotalScore = (countryData.totalScore || 0) + scoreDifference;
      const newPlayerCount =
        (countryData.playerCount || 0) + playerCountIncrement;
      const newAverageScore =
        newPlayerCount > 0 ? Math.floor(newTotalScore / newPlayerCount) : 0;

      await updateItem(
        process.env.COUNTRIES_TABLE,
        { country },
        "SET totalScore = :totalScore, playerCount = :playerCount, averageScore = :averageScore, lastUpdated = :lastUpdated",
        {
          ":totalScore": newTotalScore,
          ":playerCount": newPlayerCount,
          ":averageScore": newAverageScore,
          ":lastUpdated": new Date().toISOString(),
        }
      );
    } else {
      // First time player from this country
      await putItem(process.env.COUNTRIES_TABLE, {
        country,
        totalScore: score,
        playerCount: 1,
        averageScore: score,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating country stats:", error);
    // Non-critical error, so we don't re-throw
  }
}

/**
 * Calculate player's global rank.
 * Note: This is an approximation and can be inefficient at scale.
 * @param {number} score - The player's score.
 */
async function calculatePlayerRank(score) {
  try {
    const { scanItems } = require("../utils/dynamodb");
    const allScores = await scanItems(process.env.SCORES_TABLE, {
      ProjectionExpression: "score",
    });
    const higherScores = allScores.filter((item) => item.score > score);
    return higherScores.length + 1;
  } catch (error) {
    console.error("Error calculating rank:", error);
    return null;
  }
}

/**
 * Trigger real-time leaderboard updates via WebSocket.
 */
async function triggerLeaderboardUpdate(event) {
  try {
    console.log("Triggering real-time leaderboard update...");

    const [globalLeaderboard, countryLeaderboardRaw] = await Promise.all([
      getTopScores(10),
      getTopCountries(10),
    ]);

    // Re-calculate country scores to ensure accuracy for broadcasting
    const formattedCountries = await Promise.all(
      countryLeaderboardRaw.map(async (country) => {
        const topPlayers = await getCountryLeaderboard(country.country, 50);
        const top10PercentCount = Math.max(
          1,
          Math.ceil(country.playerCount * 0.1)
        );
        const top10PercentPlayers = topPlayers.slice(0, top10PercentCount);
        const top10PercentScore = top10PercentPlayers.reduce(
          (sum, player) => sum + player.score,
          0
        );

        return {
          country: country.country,
          totalScore: country.totalScore,
          top10PercentScore,
          playerCount: country.playerCount,
          averageScore: country.averageScore,
        };
      })
    );

    formattedCountries.sort(
      (a, b) => b.top10PercentScore - a.top10PercentScore
    );
    formattedCountries.forEach((c, i) => {
      c.rank = i + 1;
    });

    await Promise.all([
      broadcastLeaderboardUpdate(event, {
        type: "global",
        leaderboard: globalLeaderboard.map((entry, index) => ({
          rank: index + 1,
          username: entry.username,
          score: entry.score,
          country: entry.country,
          countryCode: entry.countryCode,
          survivalTime: entry.survivalTime,
          timestamp: entry.timestamp,
        })),
      }),
      broadcastCountryUpdate(event, {
        type: "countries",
        countries: formattedCountries,
      }),
    ]);

    console.log("Real-time leaderboard updates broadcasted successfully");
  } catch (error) {
    console.error("Error triggering leaderboard update:", error);
  }
}

/**
 * Submit a new score to the leaderboard
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
      body: "",
    };
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  try {
    console.log("Submit score event:", JSON.stringify(event, null, 2));
    const body = JSON.parse(event.body || "{}");
    const { username, score, survivalTime, deathCause, userId, fingerprint } =
      body;
    const validatedScore = Math.floor(score);

    if (
      !userId ||
      !username ||
      typeof score !== "number" ||
      typeof survivalTime !== "number"
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing required fields",
          required: ["userId", "username", "score", "survivalTime"],
        }),
      };
    }

    const existingScoreItem = await getItem(process.env.SCORES_TABLE, {
      userId,
    });

    if (existingScoreItem && validatedScore <= existingScoreItem.score) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: "Score not higher than previous best.",
          rank: await calculatePlayerRank(existingScoreItem.score),
        }),
      };
    }

    const clientIP = body.clientIP || extractIPFromEvent(event);
    const countryInfo = clientIP
      ? await getCountryFromIP(clientIP)
      : { country: "Unknown", countryCode: "XX" };

    const timestamp = Date.now();
    const scoreRecord = {
      userId,
      username: username.substring(0, 50),
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
      timestamp,
      createdAt: existingScoreItem
        ? existingScoreItem.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leaderboard: "global",
    };

    await putItem(process.env.SCORES_TABLE, scoreRecord);
    console.log("Score stored/updated:", scoreRecord);

    await updateCountryStats(
      countryInfo.country,
      validatedScore,
      existingScoreItem
    );
    await triggerLeaderboardUpdate(event);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        userId,
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        rank: await calculatePlayerRank(validatedScore),
        message: "Score submitted successfully",
      }),
    };
  } catch (error) {
    console.error("Error submitting score:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
