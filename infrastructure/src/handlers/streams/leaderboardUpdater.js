const leaderboardService = require('../../services/leaderboardService');
const websocketService = require('../../services/websocketService');
const { logger } = require('../../utils/logger');

/**
 * Leaderboard Updater Handler
 * Processes DynamoDB stream events to update leaderboards in real-time
 */
exports.handler = async (event) => {
  const startTime = Date.now();
  
  const contextLogger = logger.child({
    handler: 'leaderboardUpdater',
    recordCount: event.Records?.length || 0,
  });

  contextLogger.info('DynamoDB stream event received', {
    recordCount: event.Records?.length || 0,
  });

  try {
    // Initialize WebSocket service
    if (process.env.WEBSOCKET_ENDPOINT) {
      websocketService.initializeClient(process.env.WEBSOCKET_ENDPOINT);
    }

    const processedSessions = [];
    const errors = [];

    // Process each record in the stream
    for (const record of event.Records) {
      try {
        contextLogger.debug('Processing DynamoDB record', {
          eventName: record.eventName,
          dynamodb: {
            keys: record.dynamodb?.Keys,
            newImage: record.dynamodb?.NewImage ? 'present' : 'absent',
            oldImage: record.dynamodb?.OldImage ? 'present' : 'absent',
          },
        });

        // Only process INSERT and MODIFY events for completed sessions
        if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
          const newImage = record.dynamodb?.NewImage;
          
          if (!newImage) {
            contextLogger.warn('No new image in record', {
              eventName: record.eventName,
            });
            continue;
          }

          // Convert DynamoDB record to JavaScript object
          const gameSession = unmarshallDynamoDBRecord(newImage);
          
          // Only process completed sessions with scores
          if (gameSession.status === 'COMPLETED' && 
              gameSession.score !== undefined && 
              gameSession.score !== null) {
            
            contextLogger.info('Processing completed game session', {
              sessionId: gameSession.sessionId,
              userId: gameSession.userId,
              score: gameSession.score,
              country: gameSession.country,
            });

            // Update leaderboard
            await leaderboardService.updateLeaderboard(gameSession);
            processedSessions.push(gameSession);

            contextLogger.info('Leaderboard updated for session', {
              sessionId: gameSession.sessionId,
              userId: gameSession.userId,
              score: gameSession.score,
            });
          }
        }
      } catch (recordError) {
        contextLogger.error('Failed to process DynamoDB record', {
          eventName: record.eventName,
          errorMessage: recordError.message,
        }, recordError);
        
        errors.push({
          record: record.eventName,
          error: recordError.message,
        });
      }
    }

    // Broadcast leaderboard updates if we processed any sessions
    if (processedSessions.length > 0 && process.env.WEBSOCKET_ENDPOINT) {
      try {
        // Get updated leaderboards
        const [globalLeaderboard, countryLeaderboards] = await Promise.all([
          leaderboardService.getGlobalLeaderboard(10),
          getUniqueCountryLeaderboards(processedSessions),
        ]);

        // Prepare broadcast data
        const updateData = {
          type: 'leaderboard_update',
          global: globalLeaderboard,
          countries: countryLeaderboards,
          newEntries: processedSessions.map(session => ({
            userId: session.userId,
            username: session.username,
            score: session.score,
            country: session.country,
            timestamp: session.endTime || session.updatedAt,
          })),
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all connected clients
        const broadcastCount = await websocketService.broadcastLeaderboardUpdate(updateData);
        
        contextLogger.info('Leaderboard updates broadcasted', {
          processedSessions: processedSessions.length,
          broadcastCount,
          globalEntries: globalLeaderboard.length,
          countryBoards: Object.keys(countryLeaderboards).length,
        });

      } catch (broadcastError) {
        contextLogger.error('Failed to broadcast leaderboard updates', {
          processedSessions: processedSessions.length,
        }, broadcastError);
      }
    }

    const duration = Date.now() - startTime;
    contextLogger.logPerformance('leaderboard_update_stream', duration, {
      recordsProcessed: event.Records.length,
      sessionsProcessed: processedSessions.length,
      errors: errors.length,
    });

    contextLogger.info('DynamoDB stream processing completed', {
      recordsProcessed: event.Records.length,
      sessionsProcessed: processedSessions.length,
      errors: errors.length,
      duration,
    });

    // Return success even if some records failed
    return {
      batchItemFailures: [], // We handle errors gracefully
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    contextLogger.error('Failed to process DynamoDB stream', {
      recordCount: event.Records?.length || 0,
      duration,
      errorMessage: error.message,
    }, error);

    // Don't throw error to avoid retries
    return {
      batchItemFailures: [],
    };
  }
};

/**
 * Convert DynamoDB record to JavaScript object
 * @param {Object} dynamoRecord - DynamoDB record
 * @returns {Object} - JavaScript object
 */
function unmarshallDynamoDBRecord(dynamoRecord) {
  const result = {};
  
  for (const [key, value] of Object.entries(dynamoRecord)) {
    if (value.S !== undefined) {
      result[key] = value.S;
    } else if (value.N !== undefined) {
      result[key] = Number(value.N);
    } else if (value.BOOL !== undefined) {
      result[key] = value.BOOL;
    } else if (value.M !== undefined) {
      result[key] = unmarshallDynamoDBRecord(value.M);
    } else if (value.L !== undefined) {
      result[key] = value.L.map(item => {
        if (item.S) return item.S;
        if (item.N) return Number(item.N);
        if (item.BOOL !== undefined) return item.BOOL;
        if (item.M) return unmarshallDynamoDBRecord(item.M);
        return item;
      });
    } else if (value.NULL) {
      result[key] = null;
    }
  }
  
  return result;
}

/**
 * Get leaderboards for unique countries from processed sessions
 * @param {Array} sessions - Processed game sessions
 * @returns {Object} - Country leaderboards
 */
async function getUniqueCountryLeaderboards(sessions) {
  const uniqueCountries = [...new Set(sessions
    .filter(session => session.country)
    .map(session => session.country))];

  const countryLeaderboards = {};

  await Promise.all(uniqueCountries.map(async (country) => {
    try {
      const leaderboard = await leaderboardService.getCountryLeaderboard(country, 10);
      countryLeaderboards[country] = leaderboard;
    } catch (error) {
      logger.warn('Failed to get country leaderboard', { country }, error);
    }
  }));

  return countryLeaderboards;
}