/**
 * Health check endpoint
 */
const allowedOrigins = [
  "http://game-vibe-plane-pipeline-stagingbucket-hplrema47c4v.s3-website-ap-southeast-1.amazonaws.com",
  "https://d35gbzghcxrk3x.cloudfront.net",
  "http://113.185.74.105",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  if (
    event.httpMethod === "OPTIONS" ||
    event.requestContext?.http?.method === "OPTIONS"
  ) {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  try {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Game Vibe Plane Backend is healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        environment: process.env.STAGE || "dev",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Health check failed",
        message: error.message,
      }),
    };
  }
};
