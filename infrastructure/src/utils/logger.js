/**
 * Centralized logging utility with structured logging
 * Optimized for CloudWatch Logs and cost-effective monitoring
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

class Logger {
  constructor(context = {}) {
    this.context = {
      service: 'game-vibe-plane',
      stage: process.env.STAGE || 'dev',
      region: process.env.REGION || 'ap-southeast-1',
      ...context,
    };
  }

  _log(level, message, data = {}, error = null) {
    if (LOG_LEVELS[level] > LOG_LEVEL) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Use console methods for CloudWatch integration
    const output = JSON.stringify(logEntry);
    
    switch (level) {
      case 'ERROR':
        console.error(output);
        break;
      case 'WARN':
        console.warn(output);
        break;
      case 'DEBUG':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  error(message, data = {}, error = null) {
    this._log('ERROR', message, data, error);
  }

  warn(message, data = {}) {
    this._log('WARN', message, data);
  }

  info(message, data = {}) {
    this._log('INFO', message, data);
  }

  debug(message, data = {}) {
    this._log('DEBUG', message, data);
  }

  // Create child logger with additional context
  child(additionalContext = {}) {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }

  // Log API request/response
  logApiCall(method, path, statusCode, duration, userId = null) {
    this.info('API call', {
      method,
      path,
      statusCode,
      duration,
      userId,
      type: 'api_call',
    });
  }

  // Log database operations
  logDbOperation(operation, table, duration, itemCount = 1) {
    this.info('Database operation', {
      operation,
      table,
      duration,
      itemCount,
      type: 'db_operation',
    });
  }

  // Log WebSocket events
  logWebSocketEvent(event, connectionId, userId = null) {
    this.info('WebSocket event', {
      event,
      connectionId,
      userId,
      type: 'websocket_event',
    });
  }

  // Log performance metrics
  logPerformance(operation, duration, metadata = {}) {
    this.info('Performance metric', {
      operation,
      duration,
      ...metadata,
      type: 'performance',
    });
  }
}

// Create default logger instance
const logger = new Logger();

module.exports = {
  Logger,
  logger,
  LOG_LEVELS,
};