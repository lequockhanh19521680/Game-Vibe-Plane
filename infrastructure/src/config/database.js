const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// DynamoDB configuration optimized for cost and performance
const dynamoDBConfig = {
  region: process.env.REGION || 'ap-southeast-1',
  maxAttempts: 3,
  retryMode: 'adaptive',
};

// Create DynamoDB client
const dynamoDBClient = new DynamoDBClient(dynamoDBConfig);

// Create document client with optimized configuration
const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table names
const TABLES = {
  GAME_SESSIONS: process.env.GAME_SESSIONS_TABLE,
  LEADERBOARD: process.env.LEADERBOARD_TABLE,
  WEBSOCKET_CONNECTIONS: process.env.WEBSOCKET_CONNECTIONS_TABLE,
};

// Indexes
const INDEXES = {
  USER_SESSIONS: 'UserSessionsIndex',
  SCORE_INDEX: 'ScoreIndex',
  COUNTRY_LEADERBOARD: 'CountryLeaderboardIndex',
  USER_SCORE: 'UserScoreIndex',
  USER_CONNECTION: 'UserConnectionIndex',
};

module.exports = {
  docClient,
  TABLES,
  INDEXES,
  dynamoDBClient,
};