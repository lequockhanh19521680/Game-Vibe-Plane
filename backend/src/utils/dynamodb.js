const AWS = require("aws-sdk");

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || "us-east-1",
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
 * Get top scores using an efficient GSI query.
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

  try {
    const result = await dynamodb.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error("Error getting top scores:", error);
    throw error;
  }
}

/**
 * Get top countries by total score
 */
async function getTopCountries(limit = 10) {
  // This can be a scan since the number of countries is relatively small.
  // For larger scale, a GSI on totalScore would be better.
  const params = {
    TableName: process.env.COUNTRIES_TABLE,
    Limit: 100, // Scan more items and sort in memory for accuracy
  };

  try {
    const result = await dynamodb.scan(params).promise();

    // Sort by totalScore descending
    const sortedItems = (result.Items || []).sort(
      (a, b) => b.totalScore - a.totalScore
    );

    return sortedItems.slice(0, limit);
  } catch (error) {
    console.error("Error getting top countries:", error);
    throw error;
  }
}

/**
 * Get country-specific leaderboard
 */
async function getCountryLeaderboard(country, limit = 10) {
  const params = {
    TableName: process.env.SCORES_TABLE,
    IndexName: "CountryIndex",
    KeyConditionExpression: "country = :country",
    ExpressionAttributeValues: {
      ":country": country,
    },
    ScanIndexForward: false, // Sort by score descending
    Limit: limit,
  };

  try {
    const result = await queryItems(process.env.SCORES_TABLE, params);
    return result || [];
  } catch (error) {
    console.error("Error getting country leaderboard:", error);
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
};
