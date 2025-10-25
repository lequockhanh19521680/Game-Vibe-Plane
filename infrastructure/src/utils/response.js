const CONSTANTS = require('../config/constants');

/**
 * Standardized API response utility
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  static success(data = null, message = 'Success', statusCode = CONSTANTS.HTTP_STATUS.OK) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  static error(
    message = 'Internal Server Error',
    statusCode = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode = CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
    details = null
  ) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: JSON.stringify({
        success: false,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  static validationError(message, details = null) {
    return this.error(
      message,
      CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
      details
    );
  }

  static notFound(message = 'Resource not found') {
    return this.error(
      message,
      CONSTANTS.HTTP_STATUS.NOT_FOUND,
      CONSTANTS.ERROR_CODES.GAME_SESSION_NOT_FOUND
    );
  }

  static conflict(message = 'Resource conflict') {
    return this.error(
      message,
      CONSTANTS.HTTP_STATUS.CONFLICT,
      CONSTANTS.ERROR_CODES.INVALID_SCORE
    );
  }

  static tooManyRequests(message = 'Too many requests') {
    return this.error(
      message,
      CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS,
      CONSTANTS.ERROR_CODES.VALIDATION_ERROR
    );
  }

  static databaseError(message = 'Database operation failed') {
    return this.error(
      message,
      CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
      CONSTANTS.ERROR_CODES.DATABASE_ERROR
    );
  }

  // WebSocket response format
  static websocketResponse(action, data = null, success = true, message = null) {
    return JSON.stringify({
      action,
      success,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // CORS preflight response
  static corsResponse() {
    return {
      statusCode: CONSTANTS.HTTP_STATUS.OK,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }
}

module.exports = ApiResponse;