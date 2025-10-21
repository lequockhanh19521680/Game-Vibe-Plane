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
 * Get top scores using the ScoreIndex GSI.
 */
async function getTopScores(limit = 10) {
  const params = {
    TableName: process.env.SCORES_TABLE,
    IndexName: "ScoreIndex",
    KeyConditionExpression: "leaderboard = :leaderboard",
    ExpressionAttributeValues: {
      ":leaderboard": "global",
    },
    ScanIndexForward: false, // Sort by score in descending order
    Limit: limit,
  };
  return queryItems(process.env.SCORES_TABLE, params);
}

/**
 * Get top countries using the corrected TotalScoreIndex GSI.
 */
async function getTopCountries(limit = 10) {
  const params = {
    TableName: process.env.COUNTRIES_TABLE,
    IndexName: "TotalScoreIndex",
    KeyConditionExpression: "#ranking = :ranking",
    ExpressionAttributeNames: {
      "#ranking": "ranking",
    },
    ExpressionAttributeValues: {
      ":ranking": "all_countries", // Use the constant partition key
    },
    ScanIndexForward: false, // Sort by totalScore in descending order
    Limit: limit,
  };
  return queryItems(process.env.COUNTRIES_TABLE, params);
}

/**
 * Get country-specific leaderboard using the CountryIndex GSI.
 */
async function getCountryLeaderboard(country, limit = 10) {
  const params = {
    TableName: process.env.SCORES_TABLE,
    IndexName: "CountryIndex",
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
 * Atomically updates the statistics for a given country.
 * This function is designed to be called by the stream processor.
 * @param {string} country - The name of the country.
 * @param {number} scoreChange - The delta to apply to totalScore.
 * @param {number} playerCountChange - The delta to apply to playerCount.
 */
async function updateCountryStats(country, scoreChange, playerCountChange) {
  if (!country || country === "Unknown") {
    return; // Do not track stats for Unknown country
  }

  const params = {
    TableName: process.env.COUNTRIES_TABLE,
    Key: { country },
    UpdateExpression:
      "SET #ranking = :ranking, #lastUpdated = :timestamp ADD #totalScore :scoreChange, #playerCount :playerCountChange",
    ExpressionAttributeNames: {
      "#ranking": "ranking",
      "#totalScore": "totalScore",
      "#playerCount": "playerCount",
      "#lastUpdated": "lastUpdated",
    },
    ExpressionAttributeValues: {
      ":ranking": "all_countries", // Constant value for the GSI partition key
      ":scoreChange": scoreChange,
      ":playerCountChange": playerCountChange,
      ":timestamp": new Date().toISOString(),
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await dynamodb.update(params).promise();
    console.log(`Updated stats for ${country}:`, result.Attributes);

    // After updating, recalculate the average score
    const updatedAttrs = result.Attributes;
    if (updatedAttrs && updatedAttrs.playerCount > 0) {
      const averageScore = Math.round(
        updatedAttrs.totalScore / updatedAttrs.playerCount
      );
      await updateItem(
        process.env.COUNTRIES_TABLE,
        { country },
        "SET averageScore = :avg",
        { ":avg": averageScore }
      );
    }

    return result.Attributes;
  } catch (error) {
    console.error(`Error updating stats for country ${country}:`, error);
    throw error;
  }
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
