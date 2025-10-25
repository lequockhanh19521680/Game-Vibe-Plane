const { getTopScores, getCountryLeaderboard } = require("../utils/dynamodb");
const { getCorsHeaders } = require("../utils/cors");
const { fetchAvatarsForUsers } = require("../utils/avatar");

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
    const fetchLimit = Math.min(parseInt(queryParams.limit) || 10, 100);
    const country = queryParams.country;

    let leaderboard;

    if (country) {
      leaderboard = await getCountryLeaderboard(country, fetchLimit * 2);
    } else {
      leaderboard = await getTopScores(fetchLimit * 2);
    }

    const filteredLeaderboard = filterUniqueClients(leaderboard, fetchLimit);

    // Fetch avatars for all users in the leaderboard
    const userIds = filteredLeaderboard.map(entry => entry.userId);
    const avatarMap = await fetchAvatarsForUsers(userIds);

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
      avatar: avatarMap[entry.userId] || null, // Include avatar data
    }));

    return {
      statusCode: 200,
      headers,
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
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
