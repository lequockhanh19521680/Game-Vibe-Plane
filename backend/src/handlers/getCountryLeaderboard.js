const { getTopCountries } = require("../utils/dynamodb");

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
 * Get the country leaderboard (top countries by total score)
 */
exports.handler = async (event) => {
  try {
    console.log(
      "Get country leaderboard event:",
      JSON.stringify(event, null, 2)
    );

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit) || 10, 50); // Max 50 countries
    // Lấy một danh sách lớn hơn gấp đôi để đảm bảo tính toán xếp hạng chính xác
    const fetchLimit = limit * 2;

    // Lấy top countries (sắp xếp theo totalScore GSI)
    const countries = await getTopCountries(fetchLimit);

    // Tính toán điểm quốc gia dựa trên 10% người chơi hàng đầu
    const formattedCountries = await Promise.all(
      countries.map(async (country, index) => {
        // Lấy tất cả người chơi trong quốc gia này để tính 10%
        const { getCountryLeaderboard } = require("../utils/dynamodb");
        // Lấy một danh sách lớn để đảm bảo ta có đủ dữ liệu người chơi
        const topPlayersRaw = await getCountryLeaderboard(
          country.country,
          country.playerCount || 100
        );

        // Tính toán 10% điểm cao nhất (giữ nguyên logic xếp hạng quốc gia)
        const top10PercentCount = Math.max(
          1,
          Math.ceil(country.playerCount * 0.1)
        );
        const top10PercentPlayers = topPlayersRaw.slice(0, top10PercentCount);
        const top10PercentScore = top10PercentPlayers.reduce(
          (sum, player) => sum + player.score,
          0
        );

        // Áp dụng bộ lọc IP duy nhất cho danh sách top players được hiển thị
        const topPlayersUniqueIP = filterUniqueClients(topPlayersRaw, 10);

        return {
          rank: index + 1,
          country: country.country,
          totalScore: country.totalScore,
          top10PercentScore, // Tiêu chí xếp hạng chính
          playerCount: country.playerCount,
          averageScore: country.averageScore,
          topPlayers: topPlayersUniqueIP.slice(0, 3), // CHỈ HIỂN THỊ top 3 người chơi có IP duy nhất
          lastUpdated: country.lastUpdated,
        };
      })
    );

    // Sắp xếp theo top 10% điểm (tiêu chí xếp hạng chính)
    formattedCountries.sort(
      (a, b) => b.top10PercentScore - a.top10PercentScore
    );

    // Áp dụng giới hạn cuối cùng
    const finalCountries = formattedCountries.slice(0, limit);

    // Cập nhật lại thứ hạng sau khi sắp xếp và giới hạn
    finalCountries.forEach((country, index) => {
      country.rank = index + 1;
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        countries: finalCountries,
        total: finalCountries.length,
        timestamp: Date.now(),
        note: "Countries ranked by top 10% of players score. Top players listed by unique IP.",
      }),
    };
  } catch (error) {
    console.error("Error getting country leaderboard:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
