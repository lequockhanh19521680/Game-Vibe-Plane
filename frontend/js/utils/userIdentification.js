// User Identification System
// Creates a unique user ID based on the user's IP address.

class UserIdentification {
  constructor() {
    this.localStorageKey = "stellarDriftUserId"; // Key for storing the ID
    this.userId = null;
    this.clientIP = null;
    this.initialized = false;
    this.loadSavedId(); // Load saved ID on initialization
  }

  loadSavedId() {
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
   * Initialize user identification.
   */
  async initialize() {
    if (this.userId && this.initialized) return this.userId; // Return existing ID

    try {
      // Get the client's IP address
      this.clientIP = await this.getClientIP();

      // Create a unique user ID based on the IP
      this.userId = await this.generateUniqueUserId();
      this.storeUserId(); // Save the new ID to localStorage

      this.initialized = true;
      console.log("User ID initialized based on IP:", this.userId);

      return this.userId;
    } catch (error) {
      console.error("Error initializing user identification:", error);
      // Fallback: If IP cannot be fetched, generate a random ID
      this.userId = this.generateFallbackId();
      this.initialized = true;
      this.storeUserId(); // Save the fallback ID
      return this.userId;
    }
  }

  /**
   * Get client IP.
   */
  async getClientIP() {
    try {
      // Try multiple services for reliability
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
   * Generate a unique user ID based on IP address.
   */
  async generateUniqueUserId() {
    const combinedString = this.clientIP || "no-ip";
    const hashedId = await this.hashString(combinedString);
    return "user_ip_" + hashedId.substr(0, 12);
  }

  /**
   * Hash a string using the Web Crypto API.
   */
  async hashString(str) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      // Fallback for environments that don't support crypto
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }

  /**
   * Generate a random fallback ID.
   */
  generateFallbackId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return "user_fallback_" + timestamp + "_" + random;
  }

  /**
   * Get the current user ID.
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Check if initialized.
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get full user info.
   */
  getUserInfo() {
    return {
      userId: this.userId,
      clientIP: this.clientIP,
      initialized: this.initialized,
    };
  }
}

// Create a global instance
const userIdentification = new UserIdentification();

// Export for use
window.UserIdentification = UserIdentification;
window.userIdentification = userIdentification;
