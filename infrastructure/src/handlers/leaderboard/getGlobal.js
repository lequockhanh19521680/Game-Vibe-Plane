const { v4: uuidv4 } = require('uuid');

const leaderboardService = require('../../services/leaderboardService');
const { validateEvent, schemas } = require('../../utils/validation');
const ApiResponse = require('../../utils/response');
const { logger } = require('../../utils/logger');
const CONSTANTS = require('../../config/constants');

/**
 * Get Global Leaderboard Handler
 * Returns the global leaderboard with top players
 */
exports.handler = async (event) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    requestId,
    handler: 'getGlobalLeaderboard',
  });

  contextLogger.info('Get global leaderboard request received', {
    httpMethod: event.httpMethod,
    path: event.path,
    queryParams: event.queryStringParameters,
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ApiResponse.corsResponse();
    }

    // Validate query parameters
    const validation = validateEvent(event, schemas.queryParameters.leaderboard);
    if (!validation.isValid) {
      contextLogger.warn('Validation failed', {
        error: validation.error,
        details: validation.details,
      });
      return ApiResponse.validationError(validation.error, validation.details);
    }

    const { limit } = validation.data;
    const effectiveLimit = limit || CONSTANTS.LEADERBOARD.DEFAULT_LIMIT;

    contextLogger.info('Fetching global leaderboard', {
      limit: effectiveLimit,
    });

    // Get global leaderboard
    const leaderboard = await leaderboardService.getGlobalLeaderboard(effectiveLimit);

    // Get leaderboard statistics
    let stats = null;
    try {
      stats = await leaderboardService.getLeaderboardStats();
    } catch (statsError) {
      contextLogger.warn('Failed to get leaderboard stats', {}, statsError);
    }

    const duration = Date.now() - startTime;
    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      200,
      duration
    );

    contextLogger.info('Global leaderboard retrieved successfully', {
      entriesReturned: leaderboard.length,
      limit: effectiveLimit,
      duration,
    });

    const responseData = {
      leaderboard,
      metadata: {
        type: 'global',
        limit: effectiveLimit,
        entriesReturned: leaderboard.length,
        lastUpdated: new Date().toISOString(),
      },
    };

    if (stats) {
      responseData.metadata.totalPlayers = stats.totalPlayers;
    }

    return ApiResponse.success(
      responseData,
      'Global leaderboard retrieved successfully'
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to get global leaderboard', {
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      500,
      duration
    );

    return ApiResponse.databaseError('Failed to retrieve global leaderboard');
  }
};