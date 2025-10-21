const { getTopCountries } = require("../utils/dynamodb");
const { getCorsHeaders } = require("../utils/cors");

function filterUniqueClients(leaderboard, limit) {
  const uniqueIdentifiers = new Set();
  const filteredLeaderboard = [];
  for (const entry of leaderboard) {
    const identifier = entry.fingerprint || entry.userId;
    if (!identifier) continue;
    if (!uniqueIdentifiers.has(identifier)) {
      uniqueIdentifiers.add(identifier);
      filteredLeaderboard.push(entry);
    }
    if (filteredLeaderboard.length >= limit) break;
  }
  return filteredLeaderboard.slice(0, limit);
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers = getCorsHeaders(origin, "GET, OPTIONS");

  try {
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit) || 10, 50);
    const fetchLimit = limit * 2;
    const countries = await getTopCountries(fetchLimit);

    const formattedCountries = await Promise.all(
      countries.map(async (country, index) => {
        const { getCountryLeaderboard } = require("../utils/dynamodb");
        const topPlayersRaw = await getCountryLeaderboard(
          country.country,
          country.playerCount || 100
        );
        const top10PercentCount = Math.max(
          1,
          Math.ceil(country.playerCount * 0.1)
        );
        const top10PercentPlayers = topPlayersRaw.slice(0, top10PercentCount);
        const top10PercentScore = top10PercentPlayers.reduce(
          (sum, player) => sum + player.score,
          0
        );
        const topPlayersUnique = filterUniqueClients(topPlayersRaw, 10);

        return {
          rank: index + 1,
          country: country.country,
          totalScore: country.totalScore,
          top10PercentScore,
          playerCount: country.playerCount,
          averageScore: country.averageScore,
          topPlayers: topPlayersUnique.slice(0, 3),
          lastUpdated: country.lastUpdated,
        };
      })
    );

    formattedCountries.sort(
      (a, b) => b.top10PercentScore - a.top10PercentScore
    );
    const finalCountries = formattedCountries.slice(0, limit);
    finalCountries.forEach((country, index) => {
      country.rank = index + 1;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        countries: finalCountries,
        total: finalCountries.length,
        timestamp: Date.now(),
        note: "Countries ranked by top 10% of players score. Top players listed by unique fingerprint (or user ID).",
      }),
    };
  } catch (error) {
    console.error("Error getting country leaderboard:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
