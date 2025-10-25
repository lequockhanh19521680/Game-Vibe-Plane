const { docClient, TABLES } = require('../../config/database');
const { logger } = require('../../utils/logger');
const ApiResponse = require('../../utils/response');

/**
 * Health Check Handler
 * Provides system health status and basic diagnostics
 */
exports.handler = async (event) => {
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    handler: 'healthCheck',
  });

  contextLogger.info('Health check request received', {
    httpMethod: event.httpMethod,
    path: event.path,
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ApiResponse.corsResponse();
    }

    const healthData = {
      service: 'game-vibe-plane',
      version: '2.0.0',
      stage: process.env.STAGE || 'unknown',
      region: process.env.REGION || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      checks: {},
    };

    // Check DynamoDB connectivity
    try {
      const dbStartTime = Date.now();
      
      // Test connection by describing one of our tables
      await docClient.send({
        TableName: TABLES.GAME_SESSIONS,
        Key: { sessionId: 'health-check-non-existent' },
      });
      
      const dbDuration = Date.now() - dbStartTime;
      
      healthData.checks.database = {
        status: 'healthy',
        responseTime: dbDuration,
        tables: {
          gameSessions: TABLES.GAME_SESSIONS,
          leaderboard: TABLES.LEADERBOARD,
          websocketConnections: TABLES.WEBSOCKET_CONNECTIONS,
        },
      };
    } catch (dbError) {
      contextLogger.warn('Database health check failed', {}, dbError);
      
      healthData.checks.database = {
        status: 'unhealthy',
        error: dbError.message,
        tables: {
          gameSessions: TABLES.GAME_SESSIONS,
          leaderboard: TABLES.LEADERBOARD,
          websocketConnections: TABLES.WEBSOCKET_CONNECTIONS,
        },
      };
    }

    // Check WebSocket endpoint
    if (process.env.WEBSOCKET_ENDPOINT) {
      healthData.checks.websocket = {
        status: 'configured',
        endpoint: process.env.WEBSOCKET_ENDPOINT,
      };
    } else {
      healthData.checks.websocket = {
        status: 'not_configured',
      };
    }

    // Overall health status
    const allChecksHealthy = Object.values(healthData.checks)
      .every(check => check.status === 'healthy' || check.status === 'configured');
    
    healthData.status = allChecksHealthy ? 'healthy' : 'degraded';

    const duration = Date.now() - startTime;
    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      200,
      duration
    );

    contextLogger.info('Health check completed', {
      status: healthData.status,
      duration,
      checksPerformed: Object.keys(healthData.checks).length,
    });

    return ApiResponse.success(
      healthData,
      `Service is ${healthData.status}`
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Health check failed', {
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      500,
      duration
    );

    const errorHealthData = {
      service: 'game-vibe-plane',
      version: '2.0.0',
      stage: process.env.STAGE || 'unknown',
      region: process.env.REGION || 'unknown',
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error.message,
    };

    return ApiResponse.error(
      'Health check failed',
      500,
      'HEALTH_CHECK_ERROR',
      errorHealthData
    );
  }
};