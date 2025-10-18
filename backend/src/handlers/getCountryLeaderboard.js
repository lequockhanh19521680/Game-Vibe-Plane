const { getTopCountries } = require('../utils/dynamodb');

/**
 * Get the country leaderboard (top countries by total score)
 */
exports.handler = async (event) => {
  try {
    console.log('Get country leaderboard event:', JSON.stringify(event, null, 2));

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(parseInt(queryParams.limit) || 10, 50); // Max 50 countries

    // Get top countries
    const countries = await getTopCountries(limit);

    // Calculate country scores based on top 10% of players
    const formattedCountries = await Promise.all(
      countries.map(async (country, index) => {
        // Get top players from this country for more detailed stats
        const { getCountryLeaderboard } = require('../utils/dynamodb');
        const topPlayers = await getCountryLeaderboard(country.country, 10);
        
        // Calculate top 10% score (or at least top 1 player)
        const top10PercentCount = Math.max(1, Math.ceil(country.playerCount * 0.1));
        const top10PercentPlayers = topPlayers.slice(0, top10PercentCount);
        const top10PercentScore = top10PercentPlayers.reduce((sum, player) => sum + player.score, 0);

        return {
          rank: index + 1,
          country: country.country,
          totalScore: country.totalScore,
          top10PercentScore,
          playerCount: country.playerCount,
          averageScore: country.averageScore,
          topPlayers: top10PercentPlayers.slice(0, 3), // Show top 3 players
          lastUpdated: country.lastUpdated
        };
      })
    );

    // Sort by top 10% score (this is the main ranking criteria)
    formattedCountries.sort((a, b) => b.top10PercentScore - a.top10PercentScore);
    
    // Update ranks after sorting
    formattedCountries.forEach((country, index) => {
      country.rank = index + 1;
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        countries: formattedCountries,
        total: formattedCountries.length,
        timestamp: Date.now(),
        note: 'Countries ranked by top 10% of players score'
      })
    };

  } catch (error) {
    console.error('Error getting country leaderboard:', error);
    
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