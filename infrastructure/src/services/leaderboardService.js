const { PutCommand, QueryCommand, UpdateCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const { docClient, TABLES, INDEXES } = require('../config/database');
const { logger } = require('../utils/logger');
const CONSTANTS = require('../config/constants');

/**
 * Leaderboard Service
 * Handles all leaderboard related operations with optimized queries
 */
class LeaderboardService {
  /**
   * Update leaderboard entry for a user
   * @param {Object} gameSession - Completed game session
   * @returns {Promise<void>}
   */
  async updateLeaderboard(gameSession) {
    const startTime = Date.now();

    try {
      const { userId, username, score, country, survivalTime, createdAt } = gameSession;

      // Prepare leaderboard entries
      const entries = [];

      // Global leaderboard entry
      const globalEntry = {
        leaderboardType: CONSTANTS.LEADERBOARD.GLOBAL_TYPE,
        score: score,
        userId,
        username,
        country,
        survivalTime,
        timestamp: createdAt,
        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
      };

      entries.push({
        PutRequest: {
          Item: globalEntry,
        },
      });

      // Country leaderboard entry (if country is available)
      if (country) {
        const countryEntry = {
          leaderboardType: `${CONSTANTS.LEADERBOARD.COUNTRY_TYPE}_${country}`,
          score: score,
          userId,
          username,
          country,
          survivalTime,
          timestamp: createdAt,
          ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
        };

        entries.push({
          PutRequest: {
            Item: countryEntry,
          },
        });
      }

      // Batch write entries
      if (entries.length > 0) {
        const command = new BatchWriteCommand({
          RequestItems: {
            [TABLES.LEADERBOARD]: entries,
          },
        });

        await docClient.send(command);
      }

      const duration = Date.now() - startTime;
      logger.logDbOperation('BATCH_WRITE', TABLES.LEADERBOARD, duration, entries.length);
      logger.info('Leaderboard updated', {
        userId,
        score,
        country,
        entriesCreated: entries.length,
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to update leaderboard', {
        userId: gameSession.userId,
        score: gameSession.score,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get global leaderboard
   * @param {number} limit - Number of entries to return
   * @returns {Array} - Leaderboard entries
   */
  async getGlobalLeaderboard(limit = CONSTANTS.LEADERBOARD.DEFAULT_LIMIT) {
    const startTime = Date.now();

    try {
      const command = new QueryCommand({
        TableName: TABLES.LEADERBOARD,
        KeyConditionExpression: 'leaderboardType = :type',
        ExpressionAttributeValues: {
          ':type': CONSTANTS.LEADERBOARD.GLOBAL_TYPE,
        },
        ScanIndexForward: false, // Sort by score descending
        Limit: Math.min(limit, CONSTANTS.LEADERBOARD.MAX_ENTRIES),
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.LEADERBOARD, duration, result.Items?.length || 0);

      // Format response with rankings
      const leaderboard = (result.Items || []).map((item, index) => ({
        rank: index + 1,
        userId: item.userId,
        username: item.username,
        score: item.score,
        country: item.country,
        survivalTime: item.survivalTime,
        timestamp: item.timestamp,
      }));

      return leaderboard;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get global leaderboard', {
        limit,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get country-specific leaderboard
   * @param {string} country - Country code (ISO 3166-1 alpha-2)
   * @param {number} limit - Number of entries to return
   * @returns {Array} - Leaderboard entries
   */
  async getCountryLeaderboard(country, limit = CONSTANTS.LEADERBOARD.DEFAULT_LIMIT) {
    const startTime = Date.now();

    try {
      // Validate country code
      if (!CONSTANTS.SUPPORTED_COUNTRIES.includes(country.toUpperCase())) {
        throw new Error(`Unsupported country code: ${country}`);
      }

      const countryCode = country.toUpperCase();
      const leaderboardType = `${CONSTANTS.LEADERBOARD.COUNTRY_TYPE}_${countryCode}`;

      const command = new QueryCommand({
        TableName: TABLES.LEADERBOARD,
        KeyConditionExpression: 'leaderboardType = :type',
        ExpressionAttributeValues: {
          ':type': leaderboardType,
        },
        ScanIndexForward: false, // Sort by score descending
        Limit: Math.min(limit, CONSTANTS.LEADERBOARD.MAX_ENTRIES),
      });

      const result = await docClient.send(command);

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.LEADERBOARD, duration, result.Items?.length || 0);

      // Format response with rankings
      const leaderboard = (result.Items || []).map((item, index) => ({
        rank: index + 1,
        userId: item.userId,
        username: item.username,
        score: item.score,
        country: item.country,
        survivalTime: item.survivalTime,
        timestamp: item.timestamp,
      }));

      return leaderboard;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get country leaderboard', {
        country,
        limit,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get user's rank in global leaderboard
   * @param {string} userId - User ID
   * @param {number} score - User's score
   * @returns {Object} - User rank information
   */
  async getUserGlobalRank(userId, score) {
    const startTime = Date.now();

    try {
      // Query all scores higher than user's score
      const command = new QueryCommand({
        TableName: TABLES.LEADERBOARD,
        KeyConditionExpression: 'leaderboardType = :type AND score > :score',
        ExpressionAttributeValues: {
          ':type': CONSTANTS.LEADERBOARD.GLOBAL_TYPE,
          ':score': score,
        },
        Select: 'COUNT',
      });

      const result = await docClient.send(command);
      const rank = (result.Count || 0) + 1;

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.LEADERBOARD, duration);

      return {
        userId,
        score,
        globalRank: rank,
        totalPlayers: rank, // Minimum number of players (could be more)
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get user global rank', {
        userId,
        score,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get user's rank in country leaderboard
   * @param {string} userId - User ID
   * @param {number} score - User's score
   * @param {string} country - Country code
   * @returns {Object} - User rank information
   */
  async getUserCountryRank(userId, score, country) {
    const startTime = Date.now();

    try {
      const countryCode = country.toUpperCase();
      const leaderboardType = `${CONSTANTS.LEADERBOARD.COUNTRY_TYPE}_${countryCode}`;

      // Query all scores higher than user's score in the same country
      const command = new QueryCommand({
        TableName: TABLES.LEADERBOARD,
        KeyConditionExpression: 'leaderboardType = :type AND score > :score',
        ExpressionAttributeValues: {
          ':type': leaderboardType,
          ':score': score,
        },
        Select: 'COUNT',
      });

      const result = await docClient.send(command);
      const rank = (result.Count || 0) + 1;

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.LEADERBOARD, duration);

      return {
        userId,
        score,
        country: countryCode,
        countryRank: rank,
        totalCountryPlayers: rank, // Minimum number of players in country
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get user country rank', {
        userId,
        score,
        country,
        duration,
      }, error);
      throw error;
    }
  }

  /**
   * Get leaderboard statistics
   * @returns {Object} - Leaderboard statistics
   */
  async getLeaderboardStats() {
    const startTime = Date.now();

    try {
      // Get total number of players in global leaderboard
      const globalCommand = new QueryCommand({
        TableName: TABLES.LEADERBOARD,
        KeyConditionExpression: 'leaderboardType = :type',
        ExpressionAttributeValues: {
          ':type': CONSTANTS.LEADERBOARD.GLOBAL_TYPE,
        },
        Select: 'COUNT',
      });

      const globalResult = await docClient.send(globalCommand);

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', TABLES.LEADERBOARD, duration);

      return {
        totalPlayers: globalResult.Count || 0,
        supportedCountries: CONSTANTS.SUPPORTED_COUNTRIES,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to get leaderboard stats', { duration }, error);
      throw error;
    }
  }

  /**
   * Clean up old leaderboard entries (for maintenance)
   * @param {number} daysToKeep - Number of days to keep entries
   * @returns {number} - Number of entries deleted
   */
  async cleanupOldEntries(daysToKeep = 365) {
    const startTime = Date.now();
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    try {
      // This would typically be implemented as a separate maintenance function
      // For now, we rely on TTL to automatically clean up old entries
      logger.info('Leaderboard cleanup initiated', {
        cutoffTime,
        daysToKeep,
      });

      const duration = Date.now() - startTime;
      return 0; // TTL handles cleanup automatically
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to cleanup leaderboard', {
        daysToKeep,
        duration,
      }, error);
      throw error;
    }
  }
}

module.exports = new LeaderboardService();