const AWS = require('aws-sdk');
const { putItem, deleteItem, scanItems } = require('./dynamodb');

// Configure API Gateway Management API
let apiGatewayManagementApi;

function initializeApiGateway(event) {
  if (!apiGatewayManagementApi) {
    const { stage, domainName } = event.requestContext;
    const endpoint = process.env.IS_OFFLINE 
      ? 'http://localhost:3001'
      : `https://${domainName}/${stage}`;
    
    apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      endpoint
    });
  }
  return apiGatewayManagementApi;
}

/**
 * Store WebSocket connection
 */
async function storeConnection(connectionId) {
  const ttl = Math.floor(Date.now() / 1000) + (2 * 60 * 60); // 2 hours TTL
  
  await putItem(process.env.WEBSOCKET_TABLE, {
    connectionId,
    ttl,
    connectedAt: Date.now()
  });
}

/**
 * Remove WebSocket connection
 */
async function removeConnection(connectionId) {
  await deleteItem(process.env.WEBSOCKET_TABLE, { connectionId });
}

/**
 * Get all active connections
 */
async function getActiveConnections() {
  const connections = await scanItems(process.env.WEBSOCKET_TABLE);
  return connections.map(conn => conn.connectionId);
}

/**
 * Send message to a specific connection
 */
async function sendToConnection(apiGateway, connectionId, data) {
  try {
    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    }).promise();
    
    return { success: true };
  } catch (error) {
    if (error.statusCode === 410) {
      // Connection is stale, remove it
      console.log(`Removing stale connection: ${connectionId}`);
      await removeConnection(connectionId);
    }
    throw error;
  }
}

/**
 * Broadcast message to all connections
 */
async function broadcastToAll(event, data) {
  const apiGateway = initializeApiGateway(event);
  const connections = await getActiveConnections();
  
  const sendPromises = connections.map(async (connectionId) => {
    try {
      await sendToConnection(apiGateway, connectionId, data);
    } catch (error) {
      console.error(`Failed to send to connection ${connectionId}:`, error);
    }
  });

  await Promise.allSettled(sendPromises);
  
  return {
    sent: connections.length,
    data
  };
}

/**
 * Send leaderboard update to all connections
 */
async function broadcastLeaderboardUpdate(event, leaderboardData) {
  const message = {
    type: 'leaderboard_update',
    timestamp: Date.now(),
    data: leaderboardData
  };

  return await broadcastToAll(event, message);
}

/**
 * Send country leaderboard update to all connections
 */
async function broadcastCountryUpdate(event, countryData) {
  const message = {
    type: 'country_update',
    timestamp: Date.now(),
    data: countryData
  };

  return await broadcastToAll(event, message);
}

module.exports = {
  initializeApiGateway,
  storeConnection,
  removeConnection,
  getActiveConnections,
  sendToConnection,
  broadcastToAll,
  broadcastLeaderboardUpdate,
  broadcastCountryUpdate
};