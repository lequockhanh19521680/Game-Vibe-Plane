const AWS = require("aws-sdk");

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  ...(process.env.IS_OFFLINE && {
    endpoint: "http://localhost:8000",
  }),
});

/**
 * Put item to DynamoDB table. This will create a new item or overwrite an existing one.
 */
async function putItem(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await dynamodb.put(params).promise();
    return { success: true };
  } catch (error) {
    console.error("DynamoDB put error:", error);
    throw error;
  }
}

/**
 * Get item from DynamoDB table
 */
async function getItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    const result = await dynamodb.get(params).promise();
    return result.Item || null;
  } catch (error) {
    console.error("DynamoDB get error:", error);
    throw error;
  }
}

/**
 * Query items from DynamoDB table
 */
async function queryItems(tableName, options = {}) {
  const params = {
    TableName: tableName,
    ...options,
  };

  try {
    const result = await dynamodb.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error("DynamoDB query error:", error);
    throw error;
  }
}

/**
 * Scan items from DynamoDB table
 */
async function scanItems(tableName, options = {}) {
  const params = {
    TableName: tableName,
    ...options,
  };

  try {
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error("DynamoDB scan error:", error);
    throw error;
  }
}

/**
 * Update item in DynamoDB table
 */
async function updateItem(
  tableName,
  key,
  updateExpression,
  expressionAttributeValues,
  options = {}
) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
    ...options,
  };

  try {
    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error("DynamoDB update error:", error);
    throw error;
  }
}

/**
 * Delete item from DynamoDB table
 */
async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    await dynamodb.delete(params).promise();
    return { success: true };
  } catch (error) {
    console.error("DynamoDB delete error:", error);
    throw error;
  }
}

/**
 * Get top scores using the GlobalLeaderboard GSI.
 */
async function getTopScores(limit = 10) {
  const params = {
    TableName: process.env.SCORES_TABLE,
    IndexName: "GlobalLeaderboard",
    KeyConditionExpression: "gameType = :gameType",
    ExpressionAttributeValues: {
      ":gameType": "default",
    },
    ScanIndexForward: false, // Sort by score in descending order
    Limit: limit,
  };
  return queryItems(process.env.SCORES_TABLE, params);
}

/**
 * Get top countries by aggregating scores from the main table
 * (Simplified approach - no separate countries table needed for this scale)
 */
async function getTopCountries(limit = 10) {
  try {
    // For 1-1000 users, we can scan and aggregate in memory
    const allScores = await scanItems(process.env.SCORES_TABLE, {
      ProjectionExpression: "country, score"
    });
    
    const countryStats = {};
    allScores.forEach(item => {
      if (!countryStats[item.country]) {
        countryStats[item.country] = { totalScore: 0, playerCount: 0 };
      }
      countryStats[item.country].totalScore += item.score;
      countryStats[item.country].playerCount += 1;
    });
    
    return Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        totalScore: stats.totalScore,
        playerCount: stats.playerCount,
        averageScore: Math.round(stats.totalScore / stats.playerCount)
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting top countries:", error);
    return [];
  }
}

/**
 * Get country-specific leaderboard using the CountryLeaderboard GSI.
 */
async function getCountryLeaderboard(country, limit = 10) {
  const params = {
    TableName: process.env.SCORES_TABLE,
    IndexName: "CountryLeaderboard",
    KeyConditionExpression: "country = :country",
    ExpressionAttributeValues: {
      ":country": country,
    },
    ScanIndexForward: false,
    Limit: limit,
  };
  return queryItems(process.env.SCORES_TABLE, params);
}

/**
 * Country stats are now calculated on-demand from the main scores table
 * This function is kept for backward compatibility but does nothing
 * @param {string} country - The name of the country.
 * @param {number} scoreChange - The delta to apply to totalScore.
 * @param {number} playerCountChange - The delta to apply to playerCount.
 */
async function updateCountryStats(country, scoreChange, playerCountChange) {
  // No-op - country stats are calculated on-demand for better cost optimization
  console.log(`Country stats update skipped for ${country} (calculated on-demand)`);
  return null;
}

module.exports = {
  dynamodb,
  putItem,
  getItem,
  queryItems,
  scanItems,
  updateItem,
  deleteItem,
  getTopScores,
  getTopCountries,
  getCountryLeaderboard,
  updateCountryStats, // Export the new function
};
