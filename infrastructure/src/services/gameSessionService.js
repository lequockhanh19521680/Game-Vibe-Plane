const { PutCommand, GetCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');

const { docClient, TABLES, INDEXES } = require('../config/database');
const { logger } = require('../utils/logger');
const CONSTANTS = require('../config/constants');

/**
 * Game Session Service
 * Handles all game session related operations
 */
class GameSessionService {
  /**
   * Create a new game session
   * @param {string} userId - User ID
   * @param {string} username - Username
   * @param {string} clientIp - Client IP address for geo-location
   * @param {string} country - Optional country override
   * @returns {Object} - Created game session
   */
  async createSession(userId, username, clientIp, country = null) {
    const startTime = Date.now();
    
    try {
      // Detect country from IP if not provided
      let detectedCountry = country;
      if (!detectedCountry && clientIp) {
        const geo = geoip.lookup(clientIp);
        detectedCountry = geo?.country || 'US'; // Default to US if detection fails
      }

      // Validate country
      if (detectedCountry && !CONSTANTS.SUPPORTED_COUNTRIES.includes(detectedCountry)) {
        detectedCountry = 'US';
      }

      const sessionId = uuidv4();
      const now = Date.now();

      const gameSession = {
        sessionId,
        userId,
        username,
        country: detectedCountry,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        startTime: now,
        clientIp,
        ttl: Math.floor(now / 1000) + (24 * 60 * 60), // 24 hours TTL
      };

      const command = new PutCommand({
        TableName: TABLES.GAME_SESSIONS,
        Item: gameSession,
        ConditionExpression: 'attribute_not_exists(sessionId)',
      });

      await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('PUT', TABLES.GAME_SESSIONS, duration);
      logger.info('Game session created', {
        sessionId,
        userId,
        username,
        country: detectedCountry,
      });

      return gameSession;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to create game session', {
        userId,
        username,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get game session by ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} - Game session or null if not found
   */
  async getSession(sessionId) {
    const startTime = Date.now();

    try {
      const command = new GetCommand({
        TableName: TABLES.GAME_SESSIONS,
        Key: { sessionId },
      });

      const result = await docClient.send(command);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('GET', TABLES.GAME_SESSIONS, duration);

      return result.Item || null;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get game session', {
        sessionId,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * End game session with score
   * @param {string} sessionId - Session ID
   * @param {number} score - Final score
   * @param {number} survivalTime - Survival time in seconds
   * @param {string} deathCause - Cause of death
   * @param {Object} gameStats - Additional game statistics
   * @returns {Object} - Updated game session
   */
  async endSession(sessionId, score, survivalTime, deathCause = null, gameStats = {}) {
    const startTime = Date.now();

    try {
      // First, get the current session to validate it exists and is active
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }

      if (session.status !== 'ACTIVE') {
        throw new Error('Game session is not active');
      }

      const now = Date.now();
      const actualSurvivalTime = Math.floor((now - session.startTime) / 1000);

      // Validate survival time (allow some tolerance for network delays)
      if (Math.abs(survivalTime - actualSurvivalTime) > 30) {
        logger.warn('Survival time mismatch detected', {
          sessionId,
          providedTime: survivalTime,
          actualTime: actualSurvivalTime,
          difference: Math.abs(survivalTime - actualSurvivalTime),
        });
        // Use the actual calculated time for security
        survivalTime = actualSurvivalTime;
      }

      const updateExpression = `
        SET 
          #status = :status,
          #score = :score,
          #survivalTime = :survivalTime,
          #endTime = :endTime,
          #updatedAt = :updatedAt,
          #deathCause = :deathCause,
          #gameStats = :gameStats
      `;

      const expressionAttributeNames = {
        '#status': 'status',
        '#score': 'score',
        '#survivalTime': 'survivalTime',
        '#endTime': 'endTime',
        '#updatedAt': 'updatedAt',
        '#deathCause': 'deathCause',
        '#gameStats': 'gameStats',
      };

      const expressionAttributeValues = {
        ':status': 'COMPLETED',
        ':score': score,
        ':survivalTime': survivalTime,
        ':endTime': now,
        ':updatedAt': now,
        ':deathCause': deathCause,
        ':gameStats': gameStats,
        ':activeStatus': 'ACTIVE',
      };

      const command = new UpdateCommand({
        TableName: TABLES.GAME_SESSIONS,
        Key: { sessionId },
        UpdateExpression: updateExpression,
        ConditionExpression: '#status = :activeStatus',
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATE', TABLES.GAME_SESSIONS, duration);
      logger.info('Game session ended', {
        sessionId,
        userId: session.userId,
        score,
        survivalTime,
        deathCause,
      });

      return result.Attributes;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to end game session', {
        sessionId,
        score,
        survivalTime,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get user's game sessions
   * @param {string} userId - User ID
   * @param {number} limit - Number of sessions to return
   * @returns {Array} - Array of game sessions
   */
  async getUserSessions(userId, limit = 10) {
    const startTime = Date.now();

    try {
      const command = new QueryCommand({
        TableName: TABLES.GAME_SESSIONS,
        IndexName: INDEXES.USER_SESSIONS,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Sort by createdAt descending
        Limit: limit,
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.GAME_SESSIONS, duration, result.Items?.length || 0);

      return result.Items || [];
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get user sessions', {
        userId,
        limit,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get user's best score
   * @param {string} userId - User ID
   * @returns {Object|null} - Best game session or null
   */
  async getUserBestScore(userId) {
    const startTime = Date.now();

    try {
      const command = new QueryCommand({
        TableName: TABLES.GAME_SESSIONS,
        IndexName: INDEXES.SCORE_INDEX,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Sort by score descending
        Limit: 1,
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.GAME_SESSIONS, duration, result.Items?.length || 0);

      return result.Items?.[0] || null;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get user best score', {
        userId,
        duration,
      }, error);
      throw error;
    }
  }
}

module.exports = new GameSessionService();