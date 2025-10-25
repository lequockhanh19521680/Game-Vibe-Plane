const websocketService = require('../../services/websocketService');
const { validateData, schemas } = require('../../utils/validation');
const { logger } = require('../../utils/logger');

/**
 * WebSocket Message Handler
 * Handles incoming WebSocket messages
 */
exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const messageBody = event.body;
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    connectionId,
    handler: 'websocketMessage',
  });

  contextLogger.info('WebSocket message received', {
    connectionId,
    messageLength: messageBody?.length || 0,
  });

  try {
    // Initialize WebSocket service with the correct endpoint
    const stage = event.requestContext.stage;
    const domainName = event.requestContext.domainName;
    const endpoint = `https://${domainName}/${stage}`;
    
    websocketService.initializeClient(endpoint);

    // Validate message size
    if (messageBody && messageBody.length > 32768) { // 32KB limit
      contextLogger.warn('Message too large', {
        connectionId,
        messageSize: messageBody.length,
      });

      const errorResponse = {
        action: 'error',
        success: false,
        message: 'Message too large',
        timestamp: new Date().toISOString(),
      };

      await websocketService.sendToConnection(connectionId, errorResponse);
      return { statusCode: 200 };
    }

    // Handle the message
    const response = await websocketService.handleMessage(connectionId, messageBody);
    
    // Parse the response and send it back
    let responseObj;
    try {
      responseObj = JSON.parse(response);
    } catch (parseError) {
      contextLogger.error('Failed to parse response', {
        connectionId,
        response,
      }, parseError);
      
      responseObj = {
        action: 'error',
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      };
    }

    // Send response back to client
    const sendSuccess = await websocketService.sendToConnection(connectionId, responseObj);
    
    const duration = Date.now() - startTime;
    contextLogger.logPerformance('websocket_message', duration, {
      connectionId,
      messageLength: messageBody?.length || 0,
      sendSuccess,
    });

    if (sendSuccess) {
      contextLogger.info('WebSocket message processed successfully', {
        connectionId,
        action: responseObj.action,
        duration,
      });
    } else {
      contextLogger.warn('Failed to send response to client', {
        connectionId,
        duration,
      });
    }

    return {
      statusCode: 200,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to handle WebSocket message', {
      connectionId,
      messageBody: messageBody?.substring(0, 100), // Log first 100 chars only
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logPerformance('websocket_message_error', duration, {
      connectionId,
      error: error.message,
    });

    // Try to send error response to client
    try {
      const errorResponse = {
        action: 'error',
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      };

      await websocketService.sendToConnection(connectionId, errorResponse);
    } catch (sendError) {
      contextLogger.error('Failed to send error response', {
        connectionId,
      }, sendError);
    }

    return {
      statusCode: 200,
    };
  }
};