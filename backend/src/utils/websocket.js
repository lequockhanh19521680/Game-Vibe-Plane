const AWS = require("aws-sdk");
const { putItem, deleteItem, scanItems } = require("./dynamodb");

// Configure API Gateway Management API
// This is created once and reused.
let apiGatewayManagementApi;

function initializeApiGateway() {
  if (!apiGatewayManagementApi) {
    const stage = process.env.STAGE;
    const apiId = process.env.WEBSOCKET_API_ID;
    const region = process.env.AWS_REGION;

    const endpoint = process.env.IS_OFFLINE
      ? "http://localhost:3001"
      : `${apiId}.execute-api.${region}.amazonaws.com/${stage}`;

    console.log(
      `Initializing ApiGatewayManagementApi with endpoint: ${endpoint}`
    );

    apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endpoint,
    });
  }
  return apiGatewayManagementApi;
}

/**
 * Store WebSocket connection
 */
async function storeConnection(connectionId) {
  const ttl = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2 hours TTL

  await putItem(process.env.WEBSOCKET_TABLE, {
    connectionId,
    ttl,
    connectedAt: Date.now(),
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
  return connections.map((conn) => conn.connectionId);
}

/**
 * Send message to a specific connection
 */
async function sendToConnection(connectionId, data) {
  const apiGateway = initializeApiGateway();
  try {
    await apiGateway
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      })
      .promise();

    return { success: true };
  } catch (error) {
    if (error.statusCode === 410) {
      // Connection is stale, remove it
      console.log(`Removing stale connection: ${connectionId}`);
      await removeConnection(connectionId);
    } else {
      // Log other errors without throwing, as one failed send shouldn't stop all
      console.error(`Failed to send to connection ${connectionId}:`, error);
    }
    return { success: false, error };
  }
}

/**
 * Broadcast message to all connections
 */
async function broadcastToAll(data) {
  const connections = await getActiveConnections();

  const sendPromises = connections.map(async (connectionId) => {
    return sendToConnection(connectionId, data);
  });

  const results = await Promise.allSettled(sendPromises);
  const sentCount = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  console.log(
    `Broadcast attempted to ${connections.length} clients, succeeded for ${sentCount}.`
  );

  return {
    attempted: connections.length,
    sent: sentCount,
    data,
  };
}

/**
 * Send leaderboard update to all connections
 */
async function broadcastLeaderboardUpdate(leaderboardData) {
  const message = {
    type: "leaderboard_update",
    timestamp: Date.now(),
    data: leaderboardData,
  };

  return await broadcastToAll(message);
}

/**
 * Send country leaderboard update to all connections
 */
async function broadcastCountryUpdate(countryData) {
  const message = {
    type: "country_update",
    timestamp: Date.now(),
    data: countryData,
  };

  return await broadcastToAll(message);
}

module.exports = {
  initializeApiGateway, // Keep export for websocket handler if needed
  storeConnection,
  removeConnection,
  getActiveConnections,
  sendToConnection,
  broadcastToAll,
  broadcastLeaderboardUpdate,
  broadcastCountryUpdate,
};
