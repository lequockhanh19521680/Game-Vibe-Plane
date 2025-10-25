const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { PutCommand, DeleteCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const { docClient, TABLES, INDEXES } = require('../config/database');
const { logger } = require('../utils/logger');
const ApiResponse = require('../utils/response');
const CONSTANTS = require('../config/constants');

/**
 * WebSocket Service
 * Handles WebSocket connections and real-time messaging
 */
class WebSocketService {
  constructor() {
    this.apiGatewayClient = null;
  }

  /**
   * Initialize API Gateway Management client
   * @param {string} endpoint - WebSocket API endpoint
   */
  initializeClient(endpoint) {
    if (!this.apiGatewayClient) {
      this.apiGatewayClient = new ApiGatewayManagementApiClient({
        endpoint,
        region: process.env.REGION,
      });
    }
  }

  /**
   * Store WebSocket connection
   * @param {string} connectionId - WebSocket connection ID
   * @param {string} userId - User ID (optional)
   * @returns {Promise<void>}
   */
  async storeConnection(connectionId, userId = null) {
    const startTime = Date.now();

    try {
      const now = Date.now();
      const connection = {
        connectionId,
        userId,
        connectedAt: now,
        lastActivity: now,
        ttl: Math.floor(now / 1000) + CONSTANTS.WEBSOCKET.CONNECTION_TTL,
      };

      const command = new PutCommand({
        TableName: TABLES.WEBSOCKET_CONNECTIONS,
        Item: connection,
      });

      await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('PUT', TABLES.WEBSOCKET_CONNECTIONS, duration);
      logger.logWebSocketEvent('CONNECT', connectionId, userId);

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to store WebSocket connection', {
        connectionId,
        userId,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Remove WebSocket connection
   * @param {string} connectionId - WebSocket connection ID
   * @returns {Promise<void>}
   */
  async removeConnection(connectionId) {
    const startTime = Date.now();

    try {
      const command = new DeleteCommand({
        TableName: TABLES.WEBSOCKET_CONNECTIONS,
        Key: { connectionId },
      });

      await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('DELETE', TABLES.WEBSOCKET_CONNECTIONS, duration);
      logger.logWebSocketEvent('DISCONNECT', connectionId);

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to remove WebSocket connection', {
        connectionId,
        duration,
      }, error);
      // Don't throw error for disconnect operations
    }
  }

  /**
   * Update connection activity
   * @param {string} connectionId - WebSocket connection ID
   * @param {string} userId - User ID (optional)
   * @returns {Promise<void>}
   */
  async updateConnectionActivity(connectionId, userId = null) {
    const startTime = Date.now();

    try {
      const now = Date.now();
      
      let updateExpression = 'SET lastActivity = :lastActivity, #ttl = :ttl';
      const expressionAttributeValues = {
        ':lastActivity': now,
        ':ttl': Math.floor(now / 1000) + CONSTANTS.WEBSOCKET.CONNECTION_TTL,
      };
      const expressionAttributeNames = {
        '#ttl': 'ttl',
      };

      // Update userId if provided
      if (userId) {
        updateExpression += ', userId = :userId';
        expressionAttributeValues[':userId'] = userId;
      }

      const command = new UpdateCommand({
        TableName: TABLES.WEBSOCKET_CONNECTIONS,
        Key: { connectionId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
      });

      await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATE', TABLES.WEBSOCKET_CONNECTIONS, duration);

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to update connection activity', {
        connectionId,
        userId,
        duration,
      }, error);
      // Don't throw error for activity updates
    }
  }

  /**
   * Get connection details
   * @param {string} connectionId - WebSocket connection ID
   * @returns {Object|null} - Connection details or null
   */
  async getConnection(connectionId) {
    const startTime = Date.now();

    try {
      const command = new GetCommand({
        TableName: TABLES.WEBSOCKET_CONNECTIONS,
        Key: { connectionId },
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('GET', TABLES.WEBSOCKET_CONNECTIONS, duration);

      return result.Item || null;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get connection', {
        connectionId,
        duration,
      }, error);
      return null;
    }
  }

  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @returns {Array} - Array of connections
   */
  async getUserConnections(userId) {
    const startTime = Date.now();

    try {
      const command = new QueryCommand({
        TableName: TABLES.WEBSOCKET_CONNECTIONS,
        IndexName: INDEXES.USER_CONNECTION,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.WEBSOCKET_CONNECTIONS, duration, result.Items?.length || 0);

      return result.Items || [];
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get user connections', {
        userId,
        duration,
      }, error);
      return [];
    }
  }

  /**
   * Send message to a specific connection
   * @param {string} connectionId - WebSocket connection ID
   * @param {Object} message - Message to send
   * @returns {Promise<boolean>} - Success status
   */
  async sendToConnection(connectionId, message) {
    if (!this.apiGatewayClient) {
      logger.error('API Gateway client not initialized');
      return false;
    }

    try {
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
      });

      await this.apiGatewayClient.send(command);

      logger.logWebSocketEvent('MESSAGE_SENT', connectionId);
      return true;

    } catch (error) {
      if (error.statusCode === 410) {
        // Connection is stale, remove it
        logger.info('Stale connection detected, removing', { connectionId });
        await this.removeConnection(connectionId);
      } else {
        logger.error('Failed to send message to connection', {
          connectionId,
          error: error.message,
        }, error);
      }
      return false;
    }
  }

  /**
   * Send message to user (all their connections)
   * @param {string} userId - User ID
   * @param {Object} message - Message to send
   * @returns {Promise<number>} - Number of successful sends
   */
  async sendToUser(userId, message) {
    try {
      const connections = await this.getUserConnections(userId);
      
      if (connections.length === 0) {
        logger.debug('No connections found for user', { userId });
        return 0;
      }

      const sendPromises = connections.map(connection =>
        this.sendToConnection(connection.connectionId, message)
      );

      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      logger.info('Broadcast message to user', {
        userId,
        totalConnections: connections.length,
        successfulSends: successCount,
      });

      return successCount;

    } catch (error) {
      logger.error('Failed to send message to user', { userId }, error);
      return 0;
    }
  }

  /**
   * Broadcast message to all connections
   * @param {Object} message - Message to broadcast
   * @param {Array} excludeConnections - Connection IDs to exclude
   * @returns {Promise<number>} - Number of successful sends
   */
  async broadcastToAll(message, excludeConnections = []) {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to implement pagination for large numbers of connections
      const command = new ScanCommand({
        TableName: TABLES.WEBSOCKET_CONNECTIONS,
        ProjectionExpression: 'connectionId',
      });

      const result = await docClient.send(command);
      const connections = result.Items || [];

      const filteredConnections = connections.filter(
        connection => !excludeConnections.includes(connection.connectionId)
      );

      if (filteredConnections.length === 0) {
        logger.debug('No connections to broadcast to');
        return 0;
      }

      const sendPromises = filteredConnections.map(connection =>
        this.sendToConnection(connection.connectionId, message)
      );

      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      logger.info('Broadcast message to all connections', {
        totalConnections: filteredConnections.length,
        successfulSends: successCount,
      });

      return successCount;

    } catch (error) {
      logger.error('Failed to broadcast message', {}, error);
      return 0;
    }
  }

  /**
   * Handle incoming WebSocket message
   * @param {string} connectionId - WebSocket connection ID
   * @param {string} messageBody - Raw message body
   * @returns {Object} - Response object
   */
  async handleMessage(connectionId, messageBody) {
    try {
      // Update connection activity
      await this.updateConnectionActivity(connectionId);

      // Parse message
      let message;
      try {
        message = JSON.parse(messageBody);
      } catch (error) {
        return ApiResponse.websocketResponse('error', null, false, 'Invalid JSON message');
      }

      const { action, data } = message;

      switch (action) {
        case 'ping':
          return ApiResponse.websocketResponse('pong', { timestamp: Date.now() });

        case 'subscribe':
          // Handle subscription logic (e.g., to leaderboard updates)
          logger.info('WebSocket subscription', { connectionId, data });
          return ApiResponse.websocketResponse('subscribed', { topic: data?.topic });

        case 'unsubscribe':
          // Handle unsubscription logic
          logger.info('WebSocket unsubscription', { connectionId, data });
          return ApiResponse.websocketResponse('unsubscribed', { topic: data?.topic });

        default:
          return ApiResponse.websocketResponse('error', null, false, `Unknown action: ${action}`);
      }

    } catch (error) {
      logger.error('Failed to handle WebSocket message', {
        connectionId,
        messageBody,
      }, error);
      return ApiResponse.websocketResponse('error', null, false, 'Internal server error');
    }
  }

  /**
   * Send leaderboard update to all connected clients
   * @param {Object} leaderboardData - Updated leaderboard data
   * @returns {Promise<number>} - Number of successful sends
   */
  async broadcastLeaderboardUpdate(leaderboardData) {
    const message = ApiResponse.websocketResponse('leaderboard_update', leaderboardData);
    
    try {
      const parsedMessage = JSON.parse(message);
      return await this.broadcastToAll(parsedMessage);
    } catch (error) {
      logger.error('Failed to broadcast leaderboard update', {}, error);
      return 0;
    }
  }
}

module.exports = new WebSocketService();