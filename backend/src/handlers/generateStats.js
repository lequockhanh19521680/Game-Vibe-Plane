const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatch();

const SCORES_TABLE = process.env.SCORES_TABLE;
const COUNTRIES_TABLE = process.env.COUNTRIES_TABLE;

exports.handler = async (event) => {
  console.log('Generate stats scheduled event:', JSON.stringify(event, null, 2));

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
    const yesterdayEnd = yesterdayStart + (24 * 60 * 60 * 1000) - 1;

    // Get daily statistics
    const stats = await generateDailyStats(yesterdayStart, yesterdayEnd);
    
    // Send metrics to CloudWatch
    await sendMetricsToCloudWatch(stats, yesterday);

    console.log('Daily stats generated successfully:', stats);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        stats: stats,
        date: yesterday.toISOString().split('T')[0]
      })
    };

  } catch (error) {
    console.error('Error generating daily stats:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

async function generateDailyStats(startTime, endTime) {
  // Query scores updated within the time range
  const scanParams = {
    TableName: SCORES_TABLE,
    FilterExpression: '#timestamp BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#timestamp': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':start': startTime,
      ':end': endTime
    }
  };

  const scores = [];
  let lastEvaluatedKey = null;

  do {
    if (lastEvaluatedKey) {
      scanParams.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await dynamodb.scan(scanParams).promise();
    
    if (result.Items) {
      scores.push(...result.Items);
    }

    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  // Calculate statistics
  const stats = {
    totalPlayers: scores.length,
    totalScore: scores.reduce((sum, score) => sum + score.score, 0),
    averageScore: 0,
    highestScore: 0,
    averageSurvivalTime: 0,
    uniqueCountries: new Set(),
    deathCauses: {},
    topCountries: {}
  };

  if (scores.length > 0) {
    stats.averageScore = Math.round(stats.totalScore / scores.length);
    stats.highestScore = Math.max(...scores.map(s => s.score));
    stats.averageSurvivalTime = Math.round(
      scores.reduce((sum, score) => sum + (score.survivalTime || 0), 0) / scores.length
    );

    // Analyze countries
    scores.forEach(score => {
      if (score.country) {
        stats.uniqueCountries.add(score.country);
        stats.topCountries[score.country] = (stats.topCountries[score.country] || 0) + 1;
      }

      // Analyze death causes
      const deathCause = score.deathCause || 'unknown';
      stats.deathCauses[deathCause] = (stats.deathCauses[deathCause] || 0) + 1;
    });

    stats.uniqueCountries = stats.uniqueCountries.size;
    
    // Convert to sorted arrays
    stats.topCountries = Object.entries(stats.topCountries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    stats.deathCauses = Object.entries(stats.deathCauses)
      .sort(([,a], [,b]) => b - a)
      .map(([cause, count]) => ({ cause, count }));
  }

  return stats;
}

async function sendMetricsToCloudWatch(stats, date) {
  const namespace = 'GameVibePlane/DailyStats';
  const timestamp = date;

  const metricData = [
    {
      MetricName: 'TotalPlayers',
      Value: stats.totalPlayers,
      Unit: 'Count',
      Timestamp: timestamp
    },
    {
      MetricName: 'TotalScore',
      Value: stats.totalScore,
      Unit: 'Count',
      Timestamp: timestamp
    },
    {
      MetricName: 'AverageScore',
      Value: stats.averageScore,
      Unit: 'Count',
      Timestamp: timestamp
    },
    {
      MetricName: 'HighestScore',
      Value: stats.highestScore,
      Unit: 'Count',
      Timestamp: timestamp
    },
    {
      MetricName: 'AverageSurvivalTime',
      Value: stats.averageSurvivalTime,
      Unit: 'Seconds',
      Timestamp: timestamp
    },
    {
      MetricName: 'UniqueCountries',
      Value: stats.uniqueCountries,
      Unit: 'Count',
      Timestamp: timestamp
    }
  ];

  // Send metrics in batches (CloudWatch limit is 20 per request)
  const batchSize = 20;
  for (let i = 0; i < metricData.length; i += batchSize) {
    const batch = metricData.slice(i, i + batchSize);
    
    const params = {
      Namespace: namespace,
      MetricData: batch
    };

    await cloudwatch.putMetricData(params).promise();
  }

  console.log(`Sent ${metricData.length} metrics to CloudWatch`);
}