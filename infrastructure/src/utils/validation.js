const Joi = require('joi');
const CONSTANTS = require('../config/constants');

/**
 * Input validation schemas and utilities
 * Ensures data integrity and security
 */

// Common validation patterns
const patterns = {
  userId: Joi.string().uuid().required(),
  sessionId: Joi.string().uuid().required(),
  username: Joi.string()
    .min(CONSTANTS.GAME.MIN_USERNAME_LENGTH)
    .max(CONSTANTS.GAME.MAX_USERNAME_LENGTH)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required(),
  score: Joi.number()
    .integer()
    .min(CONSTANTS.GAME.MIN_SCORE)
    .max(CONSTANTS.GAME.MAX_SCORE)
    .required(),
  survivalTime: Joi.number()
    .integer()
    .min(0)
    .max(CONSTANTS.GAME.MAX_SURVIVAL_TIME)
    .required(),
  country: Joi.string()
    .length(2)
    .uppercase()
    .valid(...CONSTANTS.SUPPORTED_COUNTRIES)
    .optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(CONSTANTS.LEADERBOARD.MAX_LIMIT)
    .default(CONSTANTS.LEADERBOARD.DEFAULT_LIMIT),
};

// Validation schemas
const schemas = {
  createGameSession: Joi.object({
    userId: patterns.userId,
    username: patterns.username,
    country: patterns.country,
  }),

  endGameSession: Joi.object({
    sessionId: patterns.sessionId,
    score: patterns.score,
    survivalTime: patterns.survivalTime,
    deathCause: Joi.string().max(100).optional(),
    gameStats: Joi.object({
      enemiesDestroyed: Joi.number().integer().min(0).optional(),
      powerUpsCollected: Joi.number().integer().min(0).optional(),
      distanceTraveled: Joi.number().min(0).optional(),
    }).optional(),
  }),

  getLeaderboard: Joi.object({
    limit: patterns.limit,
    country: patterns.country,
  }),

  websocketMessage: Joi.object({
    action: Joi.string().valid('ping', 'subscribe', 'unsubscribe').required(),
    data: Joi.object().optional(),
  }),

  pathParameters: {
    sessionId: Joi.object({
      sessionId: patterns.sessionId,
    }),
    countryCode: Joi.object({
      countryCode: patterns.country.required(),
    }),
  },

  queryParameters: {
    leaderboard: Joi.object({
      limit: patterns.limit,
      country: patterns.country,
    }),
  },
};

/**
 * Validate request data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Joi schema
 * @returns {Object} - Validation result
 */
function validateData(data, schema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    return {
      isValid: false,
      error: 'Validation failed',
      details,
    };
  }

  return {
    isValid: true,
    data: value,
  };
}

/**
 * Middleware for validating Lambda event data
 * @param {Object} event - Lambda event
 * @param {Object} schema - Joi schema
 * @returns {Object} - Validation result with parsed data
 */
function validateEvent(event, schema) {
  let data = {};

  // Parse body if present
  if (event.body) {
    try {
      data = JSON.parse(event.body);
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid JSON in request body',
        details: [{ field: 'body', message: 'Must be valid JSON' }],
      };
    }
  }

  // Add path parameters
  if (event.pathParameters) {
    data = { ...data, ...event.pathParameters };
  }

  // Add query parameters
  if (event.queryStringParameters) {
    data = { ...data, ...event.queryStringParameters };
  }

  return validateData(data, schema);
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize username
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result
 */
function validateUsername(username) {
  const sanitized = sanitizeInput(username);
  return validateData({ username: sanitized }, Joi.object({ username: patterns.username }));
}

module.exports = {
  schemas,
  patterns,
  validateData,
  validateEvent,
  sanitizeInput,
  validateUsername,
};