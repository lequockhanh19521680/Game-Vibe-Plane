// Backend API Configuration
// After deploying the backend, update the API_BASE_URL with your actual API Gateway endpoint
// Example: 'https://abc123.execute-api.us-east-1.amazonaws.com/prod'

const BACKEND_CONFIG = {
  // Enable/disable backend integration
  USE_BACKEND: true,
  // Fallback to local storage if backend is unavailable
  FALLBACK_TO_LOCAL: true,
  // Security settings
  ENABLE_ENDPOINT_ROTATION: true,
  ENDPOINT_ROTATION_INTERVAL: 3600000, // 1 hour
};

// API Service for communicating with backend
const BackendAPI = {
  /**
   * Initialize API with secure endpoints
   */
  async initialize() {
    if (window.endpointManager) {
      await window.endpointManager.initialize();
      
      // Set up endpoint rotation if enabled
      if (BACKEND_CONFIG.ENABLE_ENDPOINT_ROTATION) {
        setInterval(() => {
          window.endpointManager.rotateEndpoints();
        }, BACKEND_CONFIG.ENDPOINT_ROTATION_INTERVAL);
      }
    }
  },

  /**
   * Get secure API base URL
   */
  getApiBaseUrl() {
    if (window.endpointManager && window.endpointManager.getApiEndpoint()) {
      return window.endpointManager.getApiEndpoint();
    }
    
    // Fallback for development
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }
    
    return null;
  },

  /**
   * Get secure WebSocket URL
   */
  getWsUrl() {
    if (window.endpointManager && window.endpointManager.getWsEndpoint()) {
      return window.endpointManager.getWsEndpoint();
    }
    
    // Fallback for development
    if (window.location.hostname === 'localhost') {
      return 'ws://localhost:3001';
    }
    
    return null;
  },
  /**
   * Get client IP address (backend will also detect it from request headers)
   */
  async getClientIP() {
    try {
      // Try multiple IP detection services
      const services = ["https://api.ipify.org?format=json"];

      for (const service of services) {
        try {
          const response = await fetch(service, { timeout: 3000 });
          const data = await response.json();
          return data.ip || data.IP || null;
        } catch (err) {
          continue;
        }
      }
      return null;
    } catch (error) {
      console.log("Could not detect client IP:", error);
      return null;
    }
  },

  /**
   * Submit game score to backend
   */
  async submitScore(username, score, survivalTime, deathCause) {
    const apiBaseUrl = this.getApiBaseUrl();
    
    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log("Backend integration disabled, using local storage only");
      return null;
    }

    try {
      // Get client IP (optional, backend can also extract from headers)
      const clientIP = await this.getClientIP();
      
      // Get user identification
      let userId = null;
      let fingerprint = null;
      
      if (window.userIdentification && window.userIdentification.isInitialized()) {
        const userInfo = window.userIdentification.getUserInfo();
        userId = userInfo.userId;
        fingerprint = userInfo.fingerprint;
      }

      const response = await fetch(
        `${apiBaseUrl}/submit-score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username || "Me",
            score: Math.floor(score),
            survivalTime: Math.floor(survivalTime),
            deathCause: deathCause || "unknown",
            clientIP: clientIP, // Send client IP to backend
            userId: userId, // Unique user identifier
            fingerprint: fingerprint, // Browser fingerprint
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Score submitted to backend:", data);
      return data;
    } catch (error) {
      console.error("Error submitting score to backend:", error);

      if (BACKEND_CONFIG.FALLBACK_TO_LOCAL) {
        console.log("Falling back to local storage");
      }

      return null;
    }
  },

  /**
   * Fetch leaderboard from backend
   */
  async fetchLeaderboard(limit = 100, country = null) {
    const apiBaseUrl = this.getApiBaseUrl();
    
    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log("Backend integration disabled, using local storage only");
      return null;
    }

    try {
      let url = `${apiBaseUrl}/leaderboard?limit=${limit}`;
      if (country) {
        url += `&country=${country}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Leaderboard fetched from backend:", data);
      return data;
    } catch (error) {
      console.error("Error fetching leaderboard from backend:", error);

      if (BACKEND_CONFIG.FALLBACK_TO_LOCAL) {
        console.log("Falling back to local storage");
      }

      return null;
    }
  },

  /**
   * Fetch leaderboard by country
   */
  async fetchLeaderboardByCountry(country = null, limit = 10) {
    const apiBaseUrl = this.getApiBaseUrl();
    
    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log("Backend integration disabled");
      return null;
    }

    try {
      let url = `${apiBaseUrl}/leaderboard/country?limit=${limit}`;
      if (country) {
        url += `&country=${country}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching country leaderboard:", error);
      return null;
    }
  },

  /**
   * Fetch death statistics from backend
   */
  async fetchDeathStatistics() {
    const apiBaseUrl = this.getApiBaseUrl();
    
    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log("Backend integration disabled");
      return null;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/death-stats`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching death statistics:", error);
      return null;
    }
  },

  /**
   * Test connection to backend
   */
  async testConnection() {
    const apiBaseUrl = this.getApiBaseUrl();
    
    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      throw new Error("Backend integration disabled");
    }

    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Backend connection test failed:", error);
      throw error;
    }
  },
};

// Make BackendAPI globally available
window.BackendAPI = BackendAPI;
window.BACKEND_CONFIG = BACKEND_CONFIG;
