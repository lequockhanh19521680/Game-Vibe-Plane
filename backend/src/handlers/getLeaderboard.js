const { getTopScores, getCountryLeaderboard } = require("../utils/dynamodb");

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
 * Get the global or country-specific leaderboard
 */
exports.handler = async (event) => {
  // NOTE: The OPTIONS preflight request and CORS headers are now handled by API Gateway
  // based on the configuration in `serverless.yml`.

  try {
    console.log("Get leaderboard event:", JSON.stringify(event, null, 2));

    const queryParams = event.queryStringParameters || {};
    // Fetch a larger list to have enough data after filtering for uniqueness
    const fetchLimit = Math.min(parseInt(queryParams.limit) || 10, 100);
    const country = queryParams.country;

    let leaderboard;

    if (country) {
      // Get leaderboard for a specific country
      leaderboard = await getCountryLeaderboard(country, fetchLimit * 2);
    } else {
      // Get global leaderboard
      leaderboard = await getTopScores(fetchLimit * 2);
    }

    // Apply the unique fingerprint (or userId) filter
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
      body: JSON.stringify({
        success: true,
        leaderboard: formattedLeaderboard,
        total: formattedLeaderboard.length,
        country: country || "global",
        timestamp: Date.now(),
        note: "Leaderboard filtered to show one highest score per unique fingerprint (or user ID).",
      }),
    };
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
