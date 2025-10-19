const { getTopScores, getCountryLeaderboard } = require("../utils/dynamodb");

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
    const limit = Math.min(parseInt(queryParams.limit) || 10, 100);
    const country = queryParams.country;

    let leaderboard;

    if (country) {
      leaderboard = await getCountryLeaderboard(country, limit);
    } else {
      leaderboard = await getTopScores(limit);
    }

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId, // CHANGED: from id to userId
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
