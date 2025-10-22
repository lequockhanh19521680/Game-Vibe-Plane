const { getCorsHeaders } = require("../utils/cors");

/**
 * Health check endpoint
 */
exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers = getCorsHeaders(origin, "GET, OPTIONS");

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
