const websocketService = require('../../services/websocketService');
const { logger } = require('../../utils/logger');
const CONSTANTS = require('../../config/constants');

/**
 * WebSocket Connect Handler
 * Handles new WebSocket connections
 */
exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    connectionId,
    handler: 'websocketConnect',
  });

  contextLogger.info('WebSocket connection request received', {
    connectionId,
    sourceIp: event.requestContext.identity?.sourceIp,
    userAgent: event.requestContext.identity?.userAgent,
  });

  try {
    // Initialize WebSocket service with the correct endpoint
    const stage = event.requestContext.stage;
    const domainName = event.requestContext.domainName;
    const endpoint = `https://${domainName}/${stage}`;
    
    websocketService.initializeClient(endpoint);

    // Extract user ID from query parameters if available
    const queryParams = event.queryStringParameters || {};
    const userId = queryParams.userId || null;

    contextLogger.info('Storing WebSocket connection', {
      connectionId,
      userId,
    });

    // Store the connection
    await websocketService.storeConnection(connectionId, userId);

    const duration = Date.now() - startTime;
    contextLogger.logPerformance('websocket_connect', duration, {
      connectionId,
      userId,
    });

    contextLogger.info('WebSocket connection established successfully', {
      connectionId,
      userId,
      duration,
    });

    // Send welcome message
    const welcomeMessage = {
      action: 'connected',
      data: {
        connectionId,
        timestamp: new Date().toISOString(),
        message: 'Welcome to Game Vibe Plane real-time updates!',
      },
      success: true,
    };

    // Send welcome message (don't wait for completion)
    websocketService.sendToConnection(connectionId, welcomeMessage)
      .catch((error) => {
        contextLogger.warn('Failed to send welcome message', {
          connectionId,
        }, error);
      });

    return {
      statusCode: 200,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to handle WebSocket connection', {
      connectionId,
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logPerformance('websocket_connect_error', duration, {
      connectionId,
      error: error.message,
    });

    // Return success even on error to avoid connection rejection
    // The connection will be cleaned up by TTL if not properly stored
    return {
      statusCode: 200,
    };
  }
};