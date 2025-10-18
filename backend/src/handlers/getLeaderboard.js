const { getTopScores } = require('../utils/dynamodb');

/**
 * Get the global leaderboard
 */
exports.handler = async (event) => {
  try {
    console.log('Get leaderboard event:', JSON.stringify(event, null, 2));

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit) || 10, 100); // Max 100 entries
    const country = queryParams.country;

    let leaderboard;
    
    if (country) {
      // Get country-specific leaderboard
      const { getCountryLeaderboard } = require('../utils/dynamodb');
      leaderboard = await getCountryLeaderboard(country, limit);
    } else {
      // Get global leaderboard
      leaderboard = await getTopScores(limit);
    }

    // Format the response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      username: entry.username,
      score: entry.score,
      survivalTime: entry.survivalTime,
      country: entry.country,
      countryCode: entry.countryCode,
      deathCause: entry.deathCause,
      timestamp: entry.timestamp,
      createdAt: entry.createdAt
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        leaderboard: formattedLeaderboard,
        total: formattedLeaderboard.length,
        country: country || 'global',
        timestamp: Date.now()
      })
    };

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};