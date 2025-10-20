const { getTopCountries } = require("../utils/dynamodb");

/**
 * Filter a list of leaderboard entries to keep only the highest-scoring entry
 * for each unique fingerprint (or userId as a fallback).
 * Assumes the input list is already sorted by score (desc).
 * @param {Array<object>} leaderboard - The raw leaderboard list.
 * @param {number} limit - The maximum number of entries to return.
 * @returns {Array<object>} Filtered leaderboard.
 */
function filterUniqueClients(leaderboard, limit) {
  const uniqueIdentifiers = new Set();
  const filteredLeaderboard = [];

  for (const entry of leaderboard) {
    // Prioritize fingerprint, fallback to userId if fingerprint is not available.
    const identifier = entry.fingerprint || entry.userId;

    // Skip if no identifier is present (rare case)
    if (!identifier) {
      continue;
    }

    if (!uniqueIdentifiers.has(identifier)) {
      uniqueIdentifiers.add(identifier);
      filteredLeaderboard.push(entry);
    }

    if (filteredLeaderboard.length >= limit) {
      break;
    }
  }

  // Ensure limit is respected
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
    // Fetch a larger list to ensure accurate ranking calculations
    const fetchLimit = limit * 2;

    // Get top countries (sorted by totalScore GSI)
    const countries = await getTopCountries(fetchLimit);

    // Calculate country score based on top 10% of players
    const formattedCountries = await Promise.all(
      countries.map(async (country, index) => {
        // Get all players for this country to calculate top 10%
        const { getCountryLeaderboard } = require("../utils/dynamodb");
        // Fetch a large list to ensure we have enough player data
        const topPlayersRaw = await getCountryLeaderboard(
          country.country,
          country.playerCount || 100
        );

        // Calculate top 10% score (main country ranking criteria)
        const top10PercentCount = Math.max(
          1,
          Math.ceil(country.playerCount * 0.1)
        );
        const top10PercentPlayers = topPlayersRaw.slice(0, top10PercentCount);
        const top10PercentScore = top10PercentPlayers.reduce(
          (sum, player) => sum + player.score,
          0
        );

        // Apply unique fingerprint filter for the displayed top players list
        const topPlayersUnique = filterUniqueClients(topPlayersRaw, 10);

        return {
          rank: index + 1,
          country: country.country,
          totalScore: country.totalScore,
          top10PercentScore, // Main ranking criteria
          playerCount: country.playerCount,
          averageScore: country.averageScore,
          topPlayers: topPlayersUnique.slice(0, 3), // ONLY SHOW top 3 unique players
          lastUpdated: country.lastUpdated,
        };
      })
    );

    // Sort by top 10% score (the main ranking criteria)
    formattedCountries.sort(
      (a, b) => b.top10PercentScore - a.top10PercentScore
    );

    // Apply the final limit
    const finalCountries = formattedCountries.slice(0, limit);

    // Re-assign ranks after sorting and limiting
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
        note: "Countries ranked by top 10% of players score. Top players listed by unique fingerprint (or user ID).",
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
