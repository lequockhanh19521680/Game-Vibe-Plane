// Application constants
const CONSTANTS = {
  // Game configuration
  GAME: {
    MAX_SCORE: 999999,
    MIN_SCORE: 0,
    MAX_SURVIVAL_TIME: 3600, // 1 hour in seconds
    MAX_USERNAME_LENGTH: 20,
    MIN_USERNAME_LENGTH: 2,
  },

  // Leaderboard configuration
  LEADERBOARD: {
    GLOBAL_TYPE: 'GLOBAL',
    COUNTRY_TYPE: 'COUNTRY',
    MAX_ENTRIES: 100,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },

  // WebSocket configuration
  WEBSOCKET: {
    CONNECTION_TTL: 86400, // 24 hours in seconds
    MAX_MESSAGE_SIZE: 32768, // 32KB
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
  },

  // API configuration
  API: {
    MAX_REQUEST_SIZE: '1mb',
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
    },
  },

  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    GAME_SESSION_NOT_FOUND: 'GAME_SESSION_NOT_FOUND',
    INVALID_SCORE: 'INVALID_SCORE',
    DATABASE_ERROR: 'DATABASE_ERROR',
    WEBSOCKET_ERROR: 'WEBSOCKET_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Countries (ISO 3166-1 alpha-2 codes)
  SUPPORTED_COUNTRIES: [
    'VN', 'US', 'GB', 'DE', 'FR', 'JP', 'KR', 'CN', 'IN', 'BR',
    'CA', 'AU', 'IT', 'ES', 'RU', 'MX', 'ID', 'TR', 'SA', 'ZA',
  ],

  // Cache TTL (in seconds)
  CACHE_TTL: {
    LEADERBOARD: 60, // 1 minute
    GAME_SESSION: 300, // 5 minutes
    USER_STATS: 600, // 10 minutes
  },
};

module.exports = CONSTANTS;