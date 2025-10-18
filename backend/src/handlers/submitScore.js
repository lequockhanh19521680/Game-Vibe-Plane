const { v4: uuidv4 } = require('uuid');
const { putItem, getItem, updateItem } = require('../utils/dynamodb');
const { getCountryFromIP, extractIPFromEvent } = require('../utils/geoip');

/**
 * Submit a new score to the leaderboard
 */
exports.handler = async (event) => {
  try {
    console.log('Submit score event:', JSON.stringify(event, null, 2));

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          message: error.message
        })
      };
    }

    // Validate required fields
    const { username, score, survivalTime, deathCause } = body;
    
    if (!username || typeof score !== 'number' || typeof survivalTime !== 'number') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['username', 'score', 'survivalTime']
        })
      };
    }

    // Extract IP and get country information
    const clientIP = body.clientIP || extractIPFromEvent(event);
    console.log('Client IP:', clientIP);

    let countryInfo = { country: 'Unknown', countryCode: 'XX' };
    if (clientIP) {
      try {
        countryInfo = await getCountryFromIP(clientIP);
        console.log('Country info:', countryInfo);
      } catch (error) {
        console.error('Error getting country info:', error);
      }
    }

    // Create score record
    const scoreId = uuidv4();
    const timestamp = Date.now();
    
    const scoreRecord = {
      id: scoreId,
      username: username.substring(0, 50), // Limit username length
      score: Math.floor(score),
      survivalTime: Math.floor(survivalTime),
      deathCause: deathCause || 'unknown',
      country: countryInfo.country,
      countryCode: countryInfo.countryCode,
      city: countryInfo.city || null,
      region: countryInfo.region || null,
      clientIP: clientIP,
      userAgent: body.userAgent || event.headers?.['user-agent'],
      timestamp,
      createdAt: new Date().toISOString()
    };

    // Store the score
    await putItem(process.env.SCORES_TABLE, scoreRecord);
    console.log('Score stored:', scoreRecord);

    // Update country statistics
    await updateCountryStats(countryInfo.country, Math.floor(score));

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        scoreId,
        country: countryInfo.country,
        countryCode: countryInfo.countryCode,
        rank: await calculatePlayerRank(Math.floor(score)),
        message: 'Score submitted successfully'
      })
    };

  } catch (error) {
    console.error('Error submitting score:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

/**
 * Update country statistics
 */
async function updateCountryStats(country, score) {
  if (!country || country === 'Unknown') return;

  try {
    // Get existing country record
    const existingRecord = await getItem(process.env.COUNTRIES_TABLE, { country });
    
    if (existingRecord) {
      // Update existing record
      const newTotalScore = existingRecord.totalScore + score;
      const newPlayerCount = existingRecord.playerCount + 1;
      const newAverageScore = Math.floor(newTotalScore / newPlayerCount);
      
      await updateItem(
        process.env.COUNTRIES_TABLE,
        { country },
        'SET totalScore = :totalScore, playerCount = :playerCount, averageScore = :averageScore, lastUpdated = :lastUpdated',
        {
          ':totalScore': newTotalScore,
          ':playerCount': newPlayerCount,
          ':averageScore': newAverageScore,
          ':lastUpdated': new Date().toISOString()
        }
      );
    } else {
      // Create new country record
      await putItem(process.env.COUNTRIES_TABLE, {
        country,
        totalScore: score,
        playerCount: 1,
        averageScore: score,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating country stats:', error);
    // Don't throw error here as it's not critical for score submission
  }
}

/**
 * Calculate player rank (approximate)
 */
async function calculatePlayerRank(score) {
  try {
    // This is a simplified rank calculation
    // In production, you might want to use a more sophisticated approach
    const { scanItems } = require('../utils/dynamodb');
    
    const allScores = await scanItems(process.env.SCORES_TABLE, {
      ProjectionExpression: 'score'
    });
    
    const higherScores = allScores.filter(item => item.score > score);
    return higherScores.length + 1;
    
  } catch (error) {
    console.error('Error calculating rank:', error);
    return null;
  }
}