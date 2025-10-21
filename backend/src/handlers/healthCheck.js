/**
 * Health check endpoint
 */
exports.handler = async (event) => {
  // NOTE: The OPTIONS preflight request and CORS headers are now handled by API Gateway
  // based on the configuration in `serverless.yml`.

  try {
    return {
      statusCode: 200,
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
      body: JSON.stringify({
        success: false,
        error: "Health check failed",
        message: error.message,
      }),
    };
  }
};
