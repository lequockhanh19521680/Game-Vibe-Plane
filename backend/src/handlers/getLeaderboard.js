const { getTopScores, getCountryLeaderboard } = require("../utils/dynamodb");

/**
 * Filter a list of leaderboard entries to keep only the highest-scoring entry
 * for each unique clientIP. Assumes the input list is already sorted by score (desc).
 * @param {Array<object>} leaderboard - The raw leaderboard list.
 * @param {number} limit - The maximum number of entries to return.
 * @returns {Array<object>} Filtered leaderboard.
 */
function filterUniqueClients(leaderboard, limit) {
  const uniqueIPs = new Set();
  const filteredLeaderboard = [];

  for (const entry of leaderboard) {
    // Chỉ lọc bằng IP nếu IP tồn tại và không phải IP local/test
    if (
      entry.clientIP &&
      entry.clientIP !== "127.0.0.1" &&
      entry.clientIP !== "localhost"
    ) {
      if (!uniqueIPs.has(entry.clientIP)) {
        uniqueIPs.add(entry.clientIP);
        filteredLeaderboard.push(entry);
      }
    } else {
      // Nếu IP bị thiếu hoặc là local, ta vẫn coi userId là duy nhất (hành vi mặc định)
      filteredLeaderboard.push(entry);
    }

    if (filteredLeaderboard.length >= limit) {
      break;
    }
  }

  // Đảm bảo không vượt quá giới hạn
  return filteredLeaderboard.slice(0, limit);
}

/**
 * Get the global or country-specific leaderboard
 */
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
      body: "",
    };
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  };

  try {
    console.log("Get leaderboard event:", JSON.stringify(event, null, 2));

    const queryParams = event.queryStringParameters || {};
    // Lấy một danh sách lớn hơn gấp đôi để có đủ dữ liệu sau khi lọc trùng IP
    const fetchLimit = Math.min(parseInt(queryParams.limit) || 10, 100);
    const country = queryParams.country;

    let leaderboard;

    if (country) {
      // Lấy danh sách cho quốc gia
      leaderboard = await getCountryLeaderboard(country, fetchLimit * 2);
    } else {
      // Lấy danh sách Global
      leaderboard = await getTopScores(fetchLimit * 2);
    }

    // Áp dụng bộ lọc IP duy nhất (Yêu cầu 2)
    const filteredLeaderboard = filterUniqueClients(leaderboard, fetchLimit);

    const formattedLeaderboard = filteredLeaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      score: entry.score,
      survivalTime: entry.survivalTime,
      country: entry.country,
      countryCode: entry.countryCode,
      deathCause: entry.deathCause,
      timestamp: entry.timestamp,
      createdAt: entry.createdAt,
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        leaderboard: formattedLeaderboard,
        total: formattedLeaderboard.length,
        country: country || "global",
        timestamp: Date.now(),
        note: "Leaderboard filtered to show one highest score per unique client IP.",
      }),
    };
  } catch (error) {
    console.error("Error getting leaderboard:", error);
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
