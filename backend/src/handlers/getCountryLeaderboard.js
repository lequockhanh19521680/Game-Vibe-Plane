const { getTopCountries, getCountryLeaderboard } = require("../utils/dynamodb"); // Import getCountryLeaderboard directly
const { getCorsHeaders } = require("../utils/cors");

// Helper to filter unique clients (fingerprint or userId) - Keep for topPlayers display
function filterUniqueClients(leaderboard, limit) {
  const uniqueIdentifiers = new Set();
  const filteredLeaderboard = [];
  for (const entry of leaderboard) {
    // Prefer fingerprint, fallback to userId
    const identifier = entry.fingerprint || entry.userId;
    // Skip entries without a unique identifier
    if (!identifier) continue;
    // Add entry if identifier hasn't been seen
    if (!uniqueIdentifiers.has(identifier)) {
      uniqueIdentifiers.add(identifier);
      filteredLeaderboard.push(entry);
    }
    // Stop if we reach the limit
    if (filteredLeaderboard.length >= limit) break;
  }
  // Ensure we don't exceed the intended limit due to rounding/filtering
  return filteredLeaderboard.slice(0, limit);
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  // Define allowed HTTP methods for this endpoint
  const headers = getCorsHeaders(origin, "GET, OPTIONS");

  try {
    const queryParams = event.queryStringParameters || {};
    // Get requested limit, default to 10, max 50
    const limit = Math.min(parseInt(queryParams.limit) || 10, 50);
    // Fetch slightly more initially to account for potential duplicates
    const fetchLimit = limit * 2;

    // Get the list of countries sorted by their total score (initial sort - can keep this)
    const countries = await getTopCountries(fetchLimit);

    // Process each country to calculate the score of its top 10% unique players
    const formattedCountries = await Promise.all(
      countries.map(async (country) => {
        // Fetch a larger list of players for the country to calculate the top 10%
        // Fetch *all* players if playerCount is low, otherwise fetch a reasonable amount
        // Limit fetch to avoid excessive reads, e.g., max 200 players per country for ranking calc
        const playersToFetch = Math.min(200, country.playerCount || 100);
        const topPlayersRaw = await getCountryLeaderboard(
          country.country,
          playersToFetch
        );

        // **CHANGE 1: Calculate top 10% count (minimum 1 player)**
        const top10PercentCount = Math.max(
          1,
          Math.ceil((country.playerCount || topPlayersRaw.length) * 0.1) // Use actual player count if available, else use fetched count
        );

        // Take the top 10% players based on score (already sorted by DynamoDB)
        const top10PercentPlayers = topPlayersRaw.slice(0, top10PercentCount);

        // **CHANGE 1: Calculate total score of the top 10% players**
        const top10PercentScore = top10PercentPlayers.reduce(
          (sum, player) => sum + player.score,
          0
        );

        // Filter for top 3 unique players for display purposes (uses different logic)
        const top3UniquePlayers = filterUniqueClients(topPlayersRaw, 3);

        return {
          // Keep rank calculation for later, after final sorting
          country: country.country,
          totalScore: country.totalScore, // Keep overall total score
          top10PercentScore: top10PercentScore, // **CHANGE 1: Use the new top 10% score**
          playerCount: country.playerCount,
          averageScore: country.averageScore,
          // Include top 3 unique players for display
          topPlayers: top3UniquePlayers.map((p) => ({
            username: p.username,
            score: p.score,
            userId: p.userId, // Include userId for potential frontend use
          })),
          lastUpdated: country.lastUpdated,
        };
      })
    );

    // **CHANGE 1: Sort countries based on the calculated top10PercentScore**
    formattedCountries.sort(
      (a, b) => b.top10PercentScore - a.top10PercentScore
    );

    // Take the top 'limit' countries after sorting
    const finalCountries = formattedCountries.slice(0, limit);

    // Assign final ranks based on the new sorting
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
        // **CHANGE 1: Update note about ranking method**
        note: "Countries ranked by the total score of their top 10% players. Top 3 unique players listed.",
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
