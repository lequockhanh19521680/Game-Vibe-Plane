const allowedOrigins = [
  "http://game-vibe-plane-pipeline-stagingbucket-hplrema47c4v.s3-website-ap-southeast-1.amazonaws.com",
  "https://d35gbzghcxrk3x.cloudfront.net",
  "http://113.185.74.105",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
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
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": allowedMethods,
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else {
    // Để an toàn, bạn có thể không trả về header này nếu origin không được phép,
    // hoặc trả về một origin mặc định nếu cần.
    // Ở đây, chúng ta chỉ thêm header nếu origin hợp lệ.
  }

  return headers;
}

module.exports = {
  getCorsHeaders,
  allowedOrigins,
};
