const { putItem, getItem, updateItem } = require("../utils/dynamodb");
const { getCountryFromIP, extractIPFromEvent } = require("../utils/geoip");

/**
 * Update country statistics. This should ONLY be called when a new high score
 * is submitted for a given userId, as the ScoresTable only holds the highest score.
 * @param {string} country - The country of the player.
 * @param {number} newScore - The new high score.
 * @param {object|null} oldScoreItem - The previous highest score item for the user, if any.
 */
async function updateCountryStats(country, newScore, oldScoreItem) {
  if (!country || country === "Unknown") return;

  try {
    // Tính toán sự khác biệt về điểm số. Nếu là người chơi mới, scoreDifference = newScore.
    const oldScore = oldScoreItem ? oldScoreItem.score : 0;
    const scoreDifference = newScore - oldScore;
    const playerCountIncrement = oldScoreItem ? 0 : 1; // Chỉ tăng số lượng người chơi nếu đây là lần gửi đầu tiên

    // Sử dụng UpdateExpression với increment để cập nhật an toàn
    await updateItem(
      process.env.COUNTRIES_TABLE,
      { country },
      "SET totalScore = if_not_exists(totalScore, :startTotal) + :scoreDiff, \
            playerCount = if_not_exists(playerCount, :startCount) + :playerInc, \
            lastUpdated = :lastUpdated \
            REMOVE averageScore", // Loại bỏ averageScore khỏi SET vì nó được tính toán lại trong Get handler.
      {
        ":scoreDiff": scoreDifference,
        ":playerInc": playerCountIncrement,
        ":lastUpdated": new Date().toISOString(),
        ":startTotal": 0,
        ":startCount": 0,
      }
    );
    console.log(`Country stats for ${country} updated successfully.`);
  } catch (error) {
    console.error("Error updating country stats:", error);
    // Lỗi không quan trọng, không cần re-throw
  }
}

/**
 * Calculate player's global rank (approximate)
 */
async function calculatePlayerRank(score) {
  try {
    const { scanItems } = require("../utils/dynamodb");
    // Scan là cách đơn giản để tính rank trong DynamoDB nếu không dùng GSI phức tạp.
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
 * Submit a game result. Only updates the score if it is a new high score,
 * nhưng LUÔN cập nhật metadata của người chơi (username, country) và kích hoạt stream.
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
    let validatedScore = Math.floor(score); // Sử dụng `let` để có thể thay đổi giá trị này

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

    let isNewHighScore = false;
    let dbOperationPromise;
    const clientIP = body.clientIP || extractIPFromEvent(event);
    const countryInfo = clientIP
      ? await getCountryFromIP(clientIP)
      : { country: "Unknown", countryCode: "XX" };
    const timestamp = Date.now();

    // --- Xác định đây có phải là high score mới hay không ---
    if (!existingScoreItem || validatedScore > existingScoreItem.score) {
      // Trường hợp 1: Kỷ lục mới HOẶC gửi lần đầu (userId chưa tồn tại)
      isNewHighScore = true;
      console.log(
        `New high score detected: ${validatedScore}. Overwriting old score: ${existingScoreItem?.score || 0}`
      );

      const newScoreRecord = {
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

      // Sử dụng putItem để ghi đè với high score mới + metadata
      dbOperationPromise = putItem(process.env.SCORES_TABLE, newScoreRecord);

      // Cập nhật thống kê quốc gia vì tổng điểm đã thay đổi
      await updateCountryStats(
        countryInfo.country,
        validatedScore,
        existingScoreItem
      );
    } else {
      // Trường hợp 2: Điểm KHÔNG phải là high score mới (hoặc bằng điểm cũ)
      // Chỉ cập nhật metadata (username, thông tin game cuối) để kích hoạt stream và sửa lỗi đổi tên.
      // DO NOT cập nhật điểm high score hoặc thống kê quốc gia.

      console.log(
        "Not a new high score, updating metadata (username/last game data) only."
      );

      const currentScore = existingScoreItem.score;

      // Sử dụng UpdateItem để CHỈ cập nhật metadata không liên quan đến điểm (bao gồm username mới nhất)
      dbOperationPromise = updateItem(
        process.env.SCORES_TABLE,
        { userId },
        "SET #u = :username, #ca = :country, #cc = :countryCode, lastSurvivalTime = :lastSurvivalTime, lastDeathCause = :lastDeathCause, updatedAt = :updatedAt, #fp = :fingerprint, #ua = :userAgent, lastScore = :lastScore",
        {
          ":username": username.substring(0, 50),
          ":country": countryInfo.country,
          ":countryCode": countryInfo.countryCode,
          ":lastSurvivalTime": Math.floor(survivalTime),
          ":lastDeathCause": deathCause || "unknown",
          ":updatedAt": new Date().toISOString(),
          ":fingerprint": fingerprint || null,
          ":userAgent": body.userAgent || event.headers?.["user-agent"],
          ":lastScore": validatedScore, // Lưu điểm game cuối (lastScore)
        },
        {
          ExpressionAttributeNames: {
            "#u": "username",
            "#ca": "country",
            "#cc": "countryCode",
            "#fp": "fingerprint",
            "#ua": "userAgent",
          },
        }
      );

      // Sử dụng điểm high score cũ để tính rank trong phản hồi
      validatedScore = currentScore;
    }

    await dbOperationPromise;
    console.log("Game result processed. Stream triggered for userId:", userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        isNewHighScore: isNewHighScore,
        userId,
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        rank: await calculatePlayerRank(validatedScore),
        message: isNewHighScore
          ? "New high score submitted successfully"
          : "Game result submitted, metadata updated.",
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
