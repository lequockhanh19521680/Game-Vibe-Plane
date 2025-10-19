const { v4: uuidv4 } = require("uuid");
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
 * Submit a new score to the leaderboard
 */
exports.handler = async (event) => {
  // Thêm xử lý OPTIONS request cho CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    console.log("Submit score event:", JSON.stringify(event, null, 2));

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          error: "Invalid JSON in request body",
          message: error.message,
        }),
      };
    }

    // Validate required fields
    const { username, score, survivalTime, deathCause, userId, fingerprint } =
      body;

    if (
      !username ||
      typeof score !== "number" ||
      typeof survivalTime !== "number"
    ) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify({
          error: "Missing required fields",
          required: ["username", "score", "survivalTime"],
        }),
      };
    }

    // Extract IP and get country information
    const clientIP = body.clientIP || extractIPFromEvent(event);
    console.log("Client IP:", clientIP);

    let countryInfo = { country: "Unknown", countryCode: "XX" };
    if (clientIP) {
      try {
        countryInfo = await getCountryFromIP(clientIP);
        console.log("Country info:", countryInfo);
      } catch (error) {
        console.error("Error getting country info:", error);
      }
    }

    // Create score record
    const scoreId = uuidv4();
    const timestamp = Date.now();

    const scoreRecord = {
      id: scoreId,
      username: username.substring(0, 50), // Limit username length
      score: Math.floor(score),
      survivalTime: Math.floor(survivalTime),
      deathCause: deathCause || "unknown",
      country: countryInfo.country,
      countryCode: countryInfo.countryCode,
      city: countryInfo.city || null,
      region: countryInfo.region || null,
      clientIP: clientIP,
      userId: userId || null, // Unique user identifier
      fingerprint: fingerprint || null, // Browser fingerprint
      userAgent: body.userAgent || event.headers?.["user-agent"],
      timestamp,
      createdAt: new Date().toISOString(),
    };

    // Store the score
    await putItem(process.env.SCORES_TABLE, scoreRecord);
    console.log("Score stored:", scoreRecord);

    // Update country statistics
    await updateCountryStats(countryInfo.country, Math.floor(score));

    // Trigger real-time leaderboard updates
    await triggerLeaderboardUpdate(event);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        scoreId,
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        rank: await calculatePlayerRank(Math.floor(score)),
        message: "Score submitted successfully",
      }),
    };
  } catch (error) {
    console.error("Error submitting score:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

/**
 * Update country statistics
 */
async function updateCountryStats(country, score) {
  if (!country || country === "Unknown") return;

  try {
    // Get existing country record
    const existingRecord = await getItem(process.env.COUNTRIES_TABLE, {
      country,
    });

    if (existingRecord) {
      // Update existing record
      const newTotalScore = existingRecord.totalScore + score;
      const newPlayerCount = existingRecord.playerCount + 1;
      const newAverageScore = Math.floor(newTotalScore / newPlayerCount);

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
      // Create new country record
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
    // Don't throw error here as it's not critical for score submission
  }
}

/**
 * Calculate player rank (approximate)
 */
async function calculatePlayerRank(score) {
  try {
    // This is a simplified rank calculation
    // In production, you might want to use a more sophisticated approach
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
 * Trigger real-time leaderboard updates
 */
async function triggerLeaderboardUpdate(event) {
  try {
    console.log("Triggering real-time leaderboard update...");

    // Get updated global leaderboard
    const globalLeaderboard = await getTopScores(10);

    // 1. Lấy top quốc gia từ DynamoDB (chỉ có totalScore, playerCount)
    let countryLeaderboardRaw = await getTopCountries(10);

    // 2. Tái tạo logic tính toán top 10% score và sắp xếp lại
    const formattedCountries = await Promise.all(
      countryLeaderboardRaw.map(async (country) => {
        // Lấy top 50 người chơi của quốc gia này để đảm bảo có đủ dữ liệu để tính top 10%
        const topPlayers = await getCountryLeaderboard(country.country, 50);

        // Tính toán top 10% score (hoặc ít nhất 1 người chơi)
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
          top10PercentScore, // Thêm trường này vào dữ liệu
          playerCount: country.playerCount,
          averageScore: country.averageScore,
        };
      })
    );

    // 3. Sắp xếp lại theo top 10% score (tiêu chí xếp hạng chính)
    formattedCountries.sort(
      (a, b) => b.top10PercentScore - a.top10PercentScore
    );

    // 4. Cập nhật Rank sau khi sắp xếp
    formattedCountries.forEach((country, index) => {
      country.rank = index + 1;
    });

    // Broadcast updates to all connected WebSocket clients
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
        // Sử dụng formattedCountries đã được sắp xếp và tính toán đầy đủ
        countries: formattedCountries,
      }),
    ]);

    console.log("Real-time leaderboard updates broadcasted successfully");
  } catch (error) {
    console.error("Error triggering leaderboard update:", error);
    // Don't throw error to avoid breaking score submission
  }
}
