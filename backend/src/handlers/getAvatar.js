const AWS = require('aws-sdk');
const { corsHeaders } = require('../utils/cors');
const { validateInput } = require('../utils/security');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const AVATARS_TABLE = process.env.AVATARS_TABLE;

exports.handler = async (event) => {
  console.log('Get avatar request:', JSON.stringify(event, null, 2));

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    const userId = event.pathParameters?.userId;

    // Validate user ID
    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing userId parameter'
        }),
      };
    }

    if (!validateInput(userId, 'userId')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid userId format'
        }),
      };
    }

    // Get avatar from DynamoDB
    const getParams = {
      TableName: AVATARS_TABLE,
      Key: { userId }
    };

    const result = await dynamodb.get(getParams).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Avatar not found for user'
        }),
      };
    }

    console.log('Avatar retrieved successfully for user:', userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        avatar: result.Item.avatar,
        updatedAt: result.Item.updatedAt
      }),
    };

  } catch (error) {
    console.error('Error getting avatar:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};