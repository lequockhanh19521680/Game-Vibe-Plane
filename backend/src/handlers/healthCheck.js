/**
 * Health check endpoint
 */
exports.handler = async (event) => {
  // Thêm xử lý OPTIONS request cho CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "",
    };
  }

  try {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        error: "Health check failed",
        message: error.message,
      }),
    };
  }
};
