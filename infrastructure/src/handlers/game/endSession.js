const { v4: uuidv4 } = require('uuid');

const gameSessionService = require('../../services/gameSessionService');
const leaderboardService = require('../../services/leaderboardService');
const websocketService = require('../../services/websocketService');
const { validateEvent, schemas } = require('../../utils/validation');
const ApiResponse = require('../../utils/response');
const { logger } = require('../../utils/logger');
const CONSTANTS = require('../../config/constants');

/**
 * End Game Session Handler
 * Ends a game session and updates the leaderboard
 */
exports.handler = async (event) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    requestId,
    handler: 'endGameSession',
  });

  contextLogger.info('End game session request received', {
    httpMethod: event.httpMethod,
    path: event.path,
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ApiResponse.corsResponse();
    }

    // Validate request
    const validation = validateEvent(event, schemas.endGameSession);
    if (!validation.isValid) {
      contextLogger.warn('Validation failed', {
        error: validation.error,
        details: validation.details,
      });
      return ApiResponse.validationError(validation.error, validation.details);
    }

    const { sessionId, score, survivalTime, deathCause, gameStats } = validation.data;

    contextLogger.info('Ending game session', {
      sessionId,
      score,
      survivalTime,
      deathCause,
    });

    // End game session
    const completedSession = await gameSessionService.endSession(
      sessionId,
      score,
      survivalTime,
      deathCause,
      gameStats
    );

    if (!completedSession) {
      contextLogger.warn('Game session not found', { sessionId });
      return ApiResponse.notFound('Game session not found');
    }

    // Update leaderboard asynchronously (don't wait for completion)
    leaderboardService.updateLeaderboard(completedSession)
      .then(() => {
        contextLogger.info('Leaderboard updated successfully', {
          sessionId,
          userId: completedSession.userId,
          score,
        });

        // Broadcast leaderboard update to WebSocket clients
        return Promise.all([
          leaderboardService.getGlobalLeaderboard(10),
          completedSession.country ? 
            leaderboardService.getCountryLeaderboard(completedSession.country, 10) : 
            null,
        ]);
      })
      .then(([globalLeaderboard, countryLeaderboard]) => {
        // Initialize WebSocket client if needed
        if (process.env.WEBSOCKET_ENDPOINT) {
          websocketService.initializeClient(process.env.WEBSOCKET_ENDPOINT);
          
          // Broadcast updates
          const updateData = {
            type: 'leaderboard_update',
            global: globalLeaderboard,
            country: countryLeaderboard,
            newEntry: {
              userId: completedSession.userId,
              username: completedSession.username,
              score: completedSession.score,
              country: completedSession.country,
            },
          };

          websocketService.broadcastLeaderboardUpdate(updateData);
        }
      })
      .catch((error) => {
        contextLogger.error('Failed to update leaderboard or broadcast', {
          sessionId,
          userId: completedSession.userId,
        }, error);
      });

    const duration = Date.now() - startTime;
    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      200,
      duration,
      completedSession.userId
    );

    contextLogger.info('Game session ended successfully', {
      sessionId,
      userId: completedSession.userId,
      score,
      duration,
    });

    // Return response with session details and user rank
    const responseData = {
      sessionId: completedSession.sessionId,
      userId: completedSession.userId,
      username: completedSession.username,
      score: completedSession.score,
      survivalTime: completedSession.survivalTime,
      country: completedSession.country,
      deathCause: completedSession.deathCause,
      gameStats: completedSession.gameStats,
      endTime: completedSession.endTime,
    };

    // Try to get user rank (don't fail if this fails)
    try {
      const [globalRank, countryRank] = await Promise.all([
        leaderboardService.getUserGlobalRank(completedSession.userId, score),
        completedSession.country ? 
          leaderboardService.getUserCountryRank(completedSession.userId, score, completedSession.country) :
          null,
      ]);

      responseData.rankings = {
        global: globalRank,
        country: countryRank,
      };
    } catch (rankError) {
      contextLogger.warn('Failed to get user rankings', {
        sessionId,
        userId: completedSession.userId,
      }, rankError);
    }

    return ApiResponse.success(
      responseData,
      'Game session ended successfully'
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to end game session', {
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      500,
      duration
    );

    if (error.message === 'Game session not found') {
      return ApiResponse.notFound('Game session not found');
    }

    if (error.message === 'Game session is not active') {
      return ApiResponse.conflict('Game session is not active');
    }

    return ApiResponse.error(
      'Failed to end game session',
      500,
      'INTERNAL_ERROR'
    );
  }
};