const { storeConnection, removeConnection } = require('../utils/websocket');

/**
 * Handle WebSocket connection
 */
exports.connectHandler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    console.log('WebSocket connection:', connectionId);

    // Store the connection
    await storeConnection(connectionId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected successfully' })
    };
  } catch (error) {
    console.error('WebSocket connect error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Connection failed' })
    };
  }
};

/**
 * Handle WebSocket disconnection
 */
exports.disconnectHandler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    console.log('WebSocket disconnection:', connectionId);

    // Remove the connection
    await removeConnection(connectionId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected successfully' })
    };
  } catch (error) {
    console.error('WebSocket disconnect error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Disconnection failed' })
    };
  }
};

/**
 * Handle default WebSocket messages
 */
exports.defaultHandler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body || '{}');
    
    console.log('WebSocket message from', connectionId, ':', body);

    // Handle different message types
    switch (body.action) {
      case 'ping':
        // Send pong response back to client
        const { sendToConnection, initializeApiGateway } = require('../utils/websocket');
        const apiGateway = initializeApiGateway(event);
        
        await sendToConnection(apiGateway, connectionId, {
          type: 'pong',
          timestamp: Date.now()
        });
        
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Pong sent' })
        };
        
      case 'subscribe':
        // Client wants to subscribe to real-time updates
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            type: 'subscribed',
            message: 'Successfully subscribed to real-time updates',
            timestamp: Date.now() 
          })
        };
        
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Unknown action',
            supportedActions: ['ping', 'subscribe']
          })
        };
    }
  } catch (error) {
    console.error('WebSocket default handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Message processing failed' })
    };
  }
};