const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const WEBSOCKET_TABLE = process.env.WEBSOCKET_TABLE;

exports.handler = async (event) => {
  console.log('Cleanup connections scheduled event:', JSON.stringify(event, null, 2));

  try {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    
    // Scan for expired connections
    const scanParams = {
      TableName: WEBSOCKET_TABLE,
      FilterExpression: 'attribute_exists(#ttl) AND #ttl < :now',
      ExpressionAttributeNames: {
        '#ttl': 'ttl'
      },
      ExpressionAttributeValues: {
        ':now': now
      },
      ProjectionExpression: 'connectionId'
    };

    const expiredConnections = [];
    let lastEvaluatedKey = null;

    do {
      if (lastEvaluatedKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await dynamodb.scan(scanParams).promise();
      
      if (result.Items) {
        expiredConnections.push(...result.Items);
      }

      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`Found ${expiredConnections.length} expired connections`);

    // Delete expired connections in batches
    if (expiredConnections.length > 0) {
      const batchSize = 25; // DynamoDB batch write limit
      const batches = [];

      for (let i = 0; i < expiredConnections.length; i += batchSize) {
        const batch = expiredConnections.slice(i, i + batchSize);
        batches.push(batch);
      }

      for (const batch of batches) {
        const deleteRequests = batch.map(conn => ({
          DeleteRequest: {
            Key: { connectionId: conn.connectionId }
          }
        }));

        const batchWriteParams = {
          RequestItems: {
            [WEBSOCKET_TABLE]: deleteRequests
          }
        };

        await dynamodb.batchWrite(batchWriteParams).promise();
        console.log(`Deleted batch of ${deleteRequests.length} expired connections`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        cleanedUp: expiredConnections.length,
        message: `Cleaned up ${expiredConnections.length} expired connections`
      })
    };

  } catch (error) {
    console.error('Error cleaning up connections:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};