const { getTopScores, getTopCountries } = require("../utils/dynamodb");
const {
  broadcastLeaderboardUpdate,
  broadcastCountryUpdate,
} = require("../utils/websocket");

/**
 * Process DynamoDB stream events for real-time leaderboard updates
 */
exports.handler = async (event) => {
  try {
    console.log(
      "Processing DynamoDB stream event:",
      JSON.stringify(event, null, 2)
    );

    for (const record of event.Records) {
      if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
        // New score added or updated
        await processScoreChange(record);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Stream processed successfully" }),
    };
  } catch (error) {
    console.error("Error processing DynamoDB stream:", error);
    throw error;
  }
};

/**
 * Process a score change and broadcast updates
 */
async function processScoreChange(record) {
  try {
    const newImage = record.dynamodb.NewImage;

    if (!newImage) return;

    // Extract score data
    const scoreData = {
      id: newImage.id?.S,
      username: newImage.username?.S,
      score: parseInt(newImage.score?.N || "0"),
      country: newImage.country?.S,
      timestamp: parseInt(newImage.timestamp?.N || "0"),
    };

    console.log("Processing score change:", scoreData);

    // Get updated leaderboards
    const [globalLeaderboard, countryLeaderboard] = await Promise.all([
      getTopScores(10),
      getTopCountries(10),
    ]);

    // Broadcast updates to all connected clients
    // The websocket utility now initializes itself using environment variables,
    // so we no longer need to pass the event object.
    await Promise.all([
      broadcastLeaderboardUpdate({
        type: "global",
        leaderboard: globalLeaderboard.map((entry, index) => ({
          rank: index + 1,
          username: entry.username,
          score: entry.score,
          country: entry.country,
          countryCode: entry.countryCode, // Ensure countryCode is broadcasted
          survivalTime: entry.survivalTime, // Ensure survivalTime is broadcasted
          timestamp: entry.timestamp,
        })),
      }),
      broadcastCountryUpdate({
        type: "countries",
        countries: countryLeaderboard.map((country, index) => ({
          rank: index + 1,
          country: country.country,
          totalScore: country.totalScore,
          playerCount: country.playerCount,
          averageScore: country.averageScore,
          countryCode: country.countryCode, // Ensure countryCode is broadcasted
        })),
      }),
    ]);

    console.log("Broadcasted leaderboard updates");
  } catch (error) {
    console.error("Error processing score change:", error);
    // Don't throw here to avoid retries
  }
}
