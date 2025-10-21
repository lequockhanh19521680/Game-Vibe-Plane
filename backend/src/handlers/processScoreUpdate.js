const AWS = require("aws-sdk");
const {
  getTopScores,
  getTopCountries,
  updateCountryStats,
} = require("../utils/dynamodb");
const {
  broadcastLeaderboardUpdate,
  broadcastCountryUpdate,
} = require("../utils/websocket");

/**
 * Process DynamoDB stream events from the Scores table for real-time updates.
 * This function is the core of the real-time leaderboard system.
 */
exports.handler = async (event) => {
  console.log(
    `Processing ${event.Records.length} records from DynamoDB stream.`
  );

  // A map to aggregate changes per country to avoid redundant updates
  const countryChanges = new Map();

  for (const record of event.Records) {
    const oldImage = record.dynamodb.OldImage
      ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
      : null;
    const newImage = record.dynamodb.NewImage
      ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
      : null;

    let scoreChange = 0;
    let playerCountChange = 0;
    let country = null;

    if (record.eventName === "INSERT") {
      // A new player score has been added
      scoreChange = newImage.score;
      playerCountChange = 1; // A new player for this country
      country = newImage.country;
    } else if (record.eventName === "MODIFY") {
      // An existing player's score or metadata has been updated
      scoreChange = newImage.score - (oldImage ? oldImage.score : 0);
      country = newImage.country;

      // Check if the country has changed
      if (oldImage && oldImage.country !== newImage.country) {
        // Player moved from old country to new country
        // Decrement old country
        const oldCountry = oldImage.country;
        if (oldCountry && oldCountry !== "Unknown") {
          const change = countryChanges.get(oldCountry) || {
            scoreChange: 0,
            playerCountChange: 0,
          };
          change.scoreChange -= oldImage.score;
          change.playerCountChange -= 1;
          countryChanges.set(oldCountry, change);
        }
        // Increment new country
        playerCountChange = 1;
      } else {
        // Player count doesn't change if country is the same
        playerCountChange = 0;
      }
    } else if (record.eventName === "REMOVE") {
      // A player score has been deleted
      scoreChange = -oldImage.score;
      playerCountChange = -1;
      country = oldImage.country;
    }

    // Aggregate the changes for the affected country
    if (country && country !== "Unknown") {
      const existingChange = countryChanges.get(country) || {
        scoreChange: 0,
        playerCountChange: 0,
      };
      existingChange.scoreChange += scoreChange;
      existingChange.playerCountChange += playerCountChange;
      countryChanges.set(country, existingChange);
    }
  }

  // If there are changes, process them
  if (countryChanges.size > 0) {
    console.log("Aggregated country changes:", countryChanges);

    // Atomically update all affected countries in parallel
    const updatePromises = [];
    for (const [country, changes] of countryChanges.entries()) {
      updatePromises.push(
        updateCountryStats(
          country,
          changes.scoreChange,
          changes.playerCountChange
        )
      );
    }
    await Promise.all(updatePromises);
    console.log("Successfully updated country statistics.");

    // After all updates, fetch the latest leaderboards and broadcast
    await fetchAndBroadcastUpdates();
  } else {
    // Even if no country stats changed (e.g., only username update),
    // it's still good to broadcast the latest leaderboard to reflect the name change.
    console.log(
      "No country stats changed, but broadcasting leaderboards for consistency."
    );
    await fetchAndBroadcastUpdates();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Stream processed successfully. ${event.Records.length} records handled.`,
    }),
  };
};

/**
 * Fetches the latest global and country leaderboards and broadcasts them.
 */
async function fetchAndBroadcastUpdates() {
  try {
    const [globalLeaderboard, countryLeaderboard] = await Promise.all([
      getTopScores(10),
      getTopCountries(10), // This will now use the corrected GSI
    ]);

    // Format data for broadcasting
    const globalData = {
      type: "global",
      leaderboard: globalLeaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        score: entry.score,
        country: entry.country,
        countryCode: entry.countryCode,
        survivalTime: entry.survivalTime,
        userId: entry.userId, // Important for frontend rank change animation
      })),
    };

    const countryData = {
      type: "countries",
      countries: countryLeaderboard.map((country, index) => ({
        rank: index + 1,
        country: country.country,
        totalScore: country.totalScore,
        playerCount: country.playerCount,
        averageScore:
          country.playerCount > 0
            ? Math.round(country.totalScore / country.playerCount)
            : 0,
        countryCode: country.countryCode,
      })),
    };

    // Broadcast updates to all connected clients
    await Promise.all([
      broadcastLeaderboardUpdate(globalData),
      broadcastCountryUpdate(countryData),
    ]);

    console.log("Broadcasted leaderboard updates to all clients.");
  } catch (error) {
    console.error("Error fetching and broadcasting updates:", error);
    // We don't throw here to prevent the Lambda from retrying on broadcast failures
  }
}
