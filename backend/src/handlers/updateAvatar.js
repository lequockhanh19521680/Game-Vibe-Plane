const AWS = require('aws-sdk');
const { corsHeaders } = require('../utils/cors');
const { validateInput } = require('../utils/security');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const AVATARS_TABLE = process.env.AVATARS_TABLE;

exports.handler = async (event) => {
  console.log('Update avatar request:', JSON.stringify(event, null, 2));

  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid JSON in request body'
        }),
      };
    }

    const { userId, avatar } = requestBody;

    // Validate required fields
    if (!userId || !avatar) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing required fields: userId, avatar'
        }),
      };
    }

    // Validate user ID
    if (!validateInput(userId, 'userId')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid userId format'
        }),
      };
    }

    // Validate avatar data
    if (!avatar.type || !['predefined', 'custom'].includes(avatar.type)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid avatar type. Must be "predefined" or "custom"'
        }),
      };
    }

    // Additional validation based on avatar type
    if (avatar.type === 'predefined') {
      if (!avatar.category || !avatar.id || !avatar.emoji) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Predefined avatar must include category, id, and emoji'
          }),
        };
      }
    } else if (avatar.type === 'custom') {
      if (!avatar.url) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Custom avatar must include url'
          }),
        };
      }
    }

    // Update avatar in DynamoDB
    const updateParams = {
      TableName: AVATARS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET avatar = :avatar, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':avatar': {
          ...avatar,
          updatedAt: new Date().toISOString()
        },
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(updateParams).promise();

    console.log('Avatar updated successfully for user:', userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        avatar: result.Attributes.avatar
      }),
    };

  } catch (error) {
    console.error('Error updating avatar:', error);

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