const { v4: uuidv4 } = require('uuid');

const leaderboardService = require('../../services/leaderboardService');
const { validateEvent, schemas } = require('../../utils/validation');
const ApiResponse = require('../../utils/response');
const { logger } = require('../../utils/logger');
const CONSTANTS = require('../../config/constants');

/**
 * Get Country Leaderboard Handler
 * Returns the leaderboard for a specific country
 */
exports.handler = async (event) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    requestId,
    handler: 'getCountryLeaderboard',
  });

  contextLogger.info('Get country leaderboard request received', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParams: event.pathParameters,
    queryParams: event.queryStringParameters,
  });

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return ApiResponse.corsResponse();
    }

    // Validate path and query parameters
    const pathValidation = validateEvent(event, schemas.pathParameters.countryCode);
    if (!pathValidation.isValid) {
      contextLogger.warn('Path validation failed', {
        error: pathValidation.error,
        details: pathValidation.details,
      });
      return ApiResponse.validationError(pathValidation.error, pathValidation.details);
    }

    const queryValidation = validateEvent(event, schemas.queryParameters.leaderboard);
    if (!queryValidation.isValid) {
      contextLogger.warn('Query validation failed', {
        error: queryValidation.error,
        details: queryValidation.details,
      });
      return ApiResponse.validationError(queryValidation.error, queryValidation.details);
    }

    const { countryCode } = pathValidation.data;
    const { limit } = queryValidation.data;
    const effectiveLimit = limit || CONSTANTS.LEADERBOARD.DEFAULT_LIMIT;

    // Validate country code
    const upperCountryCode = countryCode.toUpperCase();
    if (!CONSTANTS.SUPPORTED_COUNTRIES.includes(upperCountryCode)) {
      contextLogger.warn('Unsupported country code', { countryCode: upperCountryCode });
      return ApiResponse.validationError(
        `Unsupported country code: ${upperCountryCode}`,
        {
          supportedCountries: CONSTANTS.SUPPORTED_COUNTRIES,
        }
      );
    }

    contextLogger.info('Fetching country leaderboard', {
      countryCode: upperCountryCode,
      limit: effectiveLimit,
    });

    // Get country leaderboard
    const leaderboard = await leaderboardService.getCountryLeaderboard(
      upperCountryCode,
      effectiveLimit
    );

    const duration = Date.now() - startTime;
    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      200,
      duration
    );

    contextLogger.info('Country leaderboard retrieved successfully', {
      countryCode: upperCountryCode,
      entriesReturned: leaderboard.length,
      limit: effectiveLimit,
      duration,
    });

    const responseData = {
      leaderboard,
      metadata: {
        type: 'country',
        country: upperCountryCode,
        limit: effectiveLimit,
        entriesReturned: leaderboard.length,
        lastUpdated: new Date().toISOString(),
      },
    };

    return ApiResponse.success(
      responseData,
      `Country leaderboard for ${upperCountryCode} retrieved successfully`
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to get country leaderboard', {
      duration,
      errorMessage: error.message,
    }, error);

    contextLogger.logApiCall(
      event.httpMethod,
      event.path,
      500,
      duration
    );

    if (error.message?.includes('Unsupported country code')) {
      return ApiResponse.validationError(error.message);
    }

    return ApiResponse.databaseError('Failed to retrieve country leaderboard');
  }
};