const { v4: uuidv4 } = require('uuid');

const gameSessionService = require('../../services/gameSessionService');
const { validateEvent, schemas } = require('../../utils/validation');
const ApiResponse = require('../../utils/response');
const { logger } = require('../../utils/logger');

/**
 * Create Game Session Handler
 * Creates a new game session for a user
 */
exports.handler = async (event) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    requestId,
    handler: 'createGameSession',
  });

  contextLogger.info('Create game session request received', {
    httpMethod: event.httpMethod,
    path: event.path,
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ApiResponse.corsResponse();
    }

    // Validate request
    const validation = validateEvent(event, schemas.createGameSession);
    if (!validation.isValid) {
      contextLogger.warn('Validation failed', {
        error: validation.error,
        details: validation.details,
      });
      return ApiResponse.validationError(validation.error, validation.details);
    }

    const { userId, username, country } = validation.data;

    // Get client IP for geo-location
    const clientIp = event.requestContext?.identity?.sourceIp || 
                    event.headers['X-Forwarded-For']?.split(',')[0]?.trim() ||
                    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    null;

    contextLogger.info('Creating game session', {
      userId,
      username,
      country,
      clientIp,
    });

    // Create game session
    const gameSession = await gameSessionService.createSession(
      userId,
      username,
      clientIp,
      country
    );

    const duration = Date.now() - startTime;
    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      201,
      duration,
      userId
    );

    contextLogger.info('Game session created successfully', {
      sessionId: gameSession.sessionId,
      userId,
      duration,
    });

    return ApiResponse.success(
      {
        sessionId: gameSession.sessionId,
        userId: gameSession.userId,
        username: gameSession.username,
        country: gameSession.country,
        createdAt: gameSession.createdAt,
      },
      'Game session created successfully',
      201
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to create game session', {
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      500,
      duration
    );

    if (error.name === 'ConditionalCheckFailedException') {
      return ApiResponse.conflict('Game session already exists');
    }

    return ApiResponse.error(
      'Failed to create game session',
      500,
      'INTERNAL_ERROR'
    );
  }
};