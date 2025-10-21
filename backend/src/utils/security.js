/**
 * Chứa các hàm tiện ích liên quan đến bảo mật.
 */

/**
 * Làm sạch (sanitize) chuỗi đầu vào để ngăn chặn tấn công XSS cơ bản.
 * Chuyển đổi các ký tự HTML đặc biệt thành các thực thể an toàn.
 * @param {string} str Chuỗi cần làm sạch.
 * @returns {string} Chuỗi đã được làm sạch.
 */
const sanitizeInput = (str) => {
  if (typeof str !== "string") return str;
  // Thay thế các ký tự có thể dùng để chèn mã độc
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * Xác thực điểm số và thời gian chơi để chống gian lận.
 * @param {number} score Điểm số người chơi gửi lên.
 * @param {number} survivalTime Thời gian sống sót (tính bằng giây).
 * @returns {{isValid: boolean, reason?: string}} Đối tượng chứa kết quả xác thực.
 */
const validateScore = (score, survivalTime) => {
  const MAX_SCORE = 1000000; // Giới hạn điểm số tối đa hợp lý
  const MAX_POINTS_PER_SECOND = 5000; // Giới hạn số điểm tối đa có thể kiếm được mỗi giây

  if (score < 0 || survivalTime < 0) {
    return { isValid: false, reason: "Negative score or time is not allowed." };
  }

  if (score > MAX_SCORE) {
    return {
      isValid: false,
      reason: `Score exceeds maximum limit of ${MAX_SCORE}.`,
    };
  }

  // Nếu thời gian chơi rất ngắn, điểm không thể quá cao
  if (survivalTime < 5 && score > 25000) {
    return {
      isValid: false,
      reason: "Score is too high for the short survival time.",
    };
  }

  // Kiểm tra tỷ lệ điểm/thời gian. Bỏ qua nếu thời gian bằng 0 để tránh chia cho 0.
  if (survivalTime > 0 && score / survivalTime > MAX_POINTS_PER_SECOND) {
    return {
      isValid: false,
      reason: "Score-to-time ratio is implausibly high.",
    };
  }

  return { isValid: true };
};

module.exports = {
  sanitizeInput,
  validateScore,
};
