const websocketService = require('../../services/websocketService');
const { logger } = require('../../utils/logger');

/**
 * WebSocket Disconnect Handler
 * Handles WebSocket disconnections and cleanup
 */
exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    connectionId,
    handler: 'websocketDisconnect',
  });

  contextLogger.info('WebSocket disconnection request received', {
    connectionId,
  });

  try {
    // Get connection details before removing
    const connection = await websocketService.getConnection(connectionId);
    
    if (connection) {
      contextLogger.info('Removing WebSocket connection', {
        connectionId,
        userId: connection.userId,
        connectedAt: connection.connectedAt,
        connectionDuration: Date.now() - connection.connectedAt,
      });
    } else {
      contextLogger.warn('Connection not found in database', {
        connectionId,
      });
    }

    // Remove the connection
    await websocketService.removeConnection(connectionId);

    const duration = Date.now() - startTime;
    contextLogger.logPerformance('websocket_disconnect', duration, {
      connectionId,
      userId: connection?.userId,
    });

    contextLogger.info('WebSocket connection removed successfully', {
      connectionId,
      userId: connection?.userId,
      duration,
    });

    return {
      statusCode: 200,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to handle WebSocket disconnection', {
      connectionId,
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logPerformance('websocket_disconnect_error', duration, {
      connectionId,
      error: error.message,
    });

    // Return success even on error
    // Connection cleanup will be handled by TTL
    return {
      statusCode: 200,
    };
  }
};