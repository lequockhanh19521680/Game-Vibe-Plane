const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const AVATARS_TABLE = process.env.AVATARS_TABLE;

/**
 * Fetch avatars for multiple users
 * @param {string[]} userIds - Array of user IDs
 * @returns {Object} Map of userId to avatar data
 */
async function fetchAvatarsForUsers(userIds) {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  try {
    // Use batchGet to fetch multiple avatars efficiently
    const batchGetParams = {
      RequestItems: {
        [AVATARS_TABLE]: {
          Keys: userIds.map(userId => ({ userId }))
        }
      }
    };

    const result = await dynamodb.batchGet(batchGetParams).promise();
    const avatarMap = {};

    if (result.Responses && result.Responses[AVATARS_TABLE]) {
      result.Responses[AVATARS_TABLE].forEach(item => {
        avatarMap[item.userId] = item.avatar;
      });
    }

    return avatarMap;
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return {}; // Return empty map on error, don't fail the whole request
  }
}

/**
 * Fetch avatar for a single user
 * @param {string} userId - User ID
 * @returns {Object|null} Avatar data or null if not found
 */
async function fetchAvatarForUser(userId) {
  if (!userId) {
    return null;
  }

  try {
    const getParams = {
      TableName: AVATARS_TABLE,
      Key: { userId }
    };

    const result = await dynamodb.get(getParams).promise();
    return result.Item ? result.Item.avatar : null;
  } catch (error) {
    console.error('Error fetching avatar for user:', userId, error);
    return null; // Return null on error, don't fail the whole request
  }
}

module.exports = {
  fetchAvatarsForUsers,
  fetchAvatarForUser
};