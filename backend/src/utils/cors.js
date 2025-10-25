const allowedOrigins = [
  "http://game-vibe-plane-pipeline-stagingbucket-hplrema47c4v.s3-website-ap-southeast-1.amazonaws.com",
  "https://d35gbzghcxrk3x.cloudfront.net",
  "http://113.185.74.105",
  "http://localhost:8080", // Development
  "http://127.0.0.1:8080", // Development
  "https://vibeplane.io", // Production domain
  "https://dieinside.itch.io/vibe-plane",
  "https://html-classic.itch.zone",
];

/**
 * Lấy các header CORS dựa trên origin của yêu cầu.
 * @param {string} origin - Header 'Origin' từ yêu cầu.
 * @param {string} [allowedMethods="GET, OPTIONS"] - Các phương thức HTTP được phép.
 * @returns {object} - Một đối tượng chứa các header CORS.
 */
function getCorsHeaders(origin, allowedMethods = "GET, OPTIONS") {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token", // Keep standard headers
    "Access-Control-Allow-Methods": allowedMethods, // Use the provided methods
  };

  // Only add Allow-Origin if the request origin is in our list
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (!origin && allowedMethods.includes("GET")) {
    // Allow GET requests even without an origin header (e.g., direct access, curl)
    // Avoid allowing POST without origin check
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    // If origin is not allowed, don't add the header. The browser will block it.
    console.warn(`CORS: Origin "${origin}" not allowed.`);
  }

  return headers;
}

module.exports = {
  getCorsHeaders,
  allowedOrigins,
};
