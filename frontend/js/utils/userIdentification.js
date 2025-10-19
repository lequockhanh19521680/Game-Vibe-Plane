// User Identification System
// Tạo unique user ID dựa trên địa chỉ IP của người dùng

class UserIdentification {
  constructor() {
    this.localStorageKey = "stellarDriftUserId"; // Key để lưu trữ ID
    this.userId = null;
    this.clientIP = null;
    this.initialized = false;
    this.loadSavedId(); // Tải ID đã lưu ngay khi khởi tạo
  }

  loadSavedId() {
    // Tải ID từ localStorage nếu tồn tại
    try {
      const savedId = localStorage.getItem(this.localStorageKey);
      if (savedId) {
        this.userId = savedId;
        this.initialized = true;
        console.log("Loaded saved User ID:", this.userId);
      }
    } catch (error) {
      console.error("Error loading saved User ID:", error);
    }
  }

  storeUserId() {
    // Hàm lưu ID
    if (this.userId) {
      try {
        localStorage.setItem(this.localStorageKey, this.userId);
        console.log("Stored new User ID:", this.userId);
      } catch (error) {
        console.error("Error storing User ID:", error);
      }
    }
  }

  /**
   * Khởi tạo user identification
   */
  async initialize() {
    if (this.userId && this.initialized) return this.userId; // Trả về ID đã có

    try {
      // Lấy địa chỉ IP của client
      this.clientIP = await this.getClientIP();

      // Tạo user ID duy nhất dựa trên IP
      this.userId = await this.generateUniqueUserId();
      this.storeUserId(); // Lưu ID mới vào localStorage

      this.initialized = true;
      console.log("User ID initialized based on IP:", this.userId);

      return this.userId;
    } catch (error) {
      console.error("Error initializing user identification:", error);
      // Fallback: Nếu không lấy được IP, tạo ID ngẫu nhiên
      this.userId = this.generateFallbackId();
      this.initialized = true;
      this.storeUserId(); // Lưu ID dự phòng
      return this.userId;
    }
  }

  /**
   * Lấy client IP
   */
  async getClientIP() {
    try {
      // Thử nhiều service để lấy IP, tăng độ tin cậy
      const services = [
        "https://api.ipify.org?format=json",
        "https://ipapi.co/json/",
        "https://api.ip.sb/jsonip",
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, {
            signal: AbortSignal.timeout(3000),
          });
          const data = await response.json();
          const ip = data.ip || data.IP || data.query;
          if (ip) return ip;
        } catch (err) {
          console.warn(`IP service ${service} failed. Trying next...`);
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error("Could not detect client IP:", error);
      return null;
    }
  }

  /**
   * Tạo unique user ID chỉ dựa trên IP
   */
  async generateUniqueUserId() {
    const components = [
      this.clientIP || "no-ip", // Chỉ sử dụng IP
    ];

    const combinedString = components.join("_");
    const hashedId = await this.hashString(combinedString);

    // Tạo ID ngắn gọn hơn
    return "user_ip_" + hashedId.substr(0, 12);
  }

  /**
   * Băm chuỗi bằng Web Crypto API
   */
  async hashString(str) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      // Fallback cho môi trường không hỗ trợ crypto
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Chuyển thành số nguyên 32bit
      }
      return Math.abs(hash).toString(16);
    }
  }

  /**
   * Tạo ID dự phòng ngẫu nhiên
   */
  generateFallbackId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return "user_fallback_" + timestamp + "_" + random;
  }

  /**
   * Lấy user ID hiện tại
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Kiểm tra xem đã khởi tạo chưa
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Lấy thông tin user đầy đủ
   */
  getUserInfo() {
    return {
      userId: this.userId,
      fingerprint: null, // Không còn sử dụng fingerprint
      clientIP: this.clientIP,
      initialized: this.initialized,
    };
  }
}

// Tạo instance global
const userIdentification = new UserIdentification();

// Export cho sử dụng
window.UserIdentification = UserIdentification;
window.userIdentification = userIdentification;
