// Backend API Configuration

const BACKEND_CONFIG = {
  // Enable/disable backend integration
  USE_BACKEND: true,
  // Fallback to local storage if backend is unavailable
  FALLBACK_TO_LOCAL: true,
  // REMOVED: Unused endpoint rotation settings
  // ENABLE_ENDPOINT_ROTATION: true,
  // ENDPOINT_ROTATION_INTERVAL: 3600000, // 1 hour
};

// API Service for communicating with backend
const BackendAPI = {
  /**
   * Initialize API with endpoints
   */
  async initialize() {
    if (window.endpointManager) {
      await window.endpointManager.initialize();

      // REMOVED: Unused endpoint rotation interval
      // if (BACKEND_CONFIG.ENABLE_ENDPOINT_ROTATION) {
      //   setInterval(() => {
      //     window.endpointManager.rotateEndpoints();
      //   }, BACKEND_CONFIG.ENDPOINT_ROTATION_INTERVAL);
      // }
    }
  },

  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    if (window.endpointManager && window.endpointManager.getApiEndpoint()) {
      return window.endpointManager.getApiEndpoint();
    }

    // Fallback for development
    if (window.location.hostname === "localhost") {
      return "http://localhost:3000";
    }

    console.error("Could not determine API base URL.");
    return null;
  },

  /**
   * Get WebSocket URL
   */
  getWsUrl() {
    if (window.endpointManager && window.endpointManager.getWsEndpoint()) {
      return window.endpointManager.getWsEndpoint();
    }

    // Fallback for development
    if (window.location.hostname === "localhost") {
      return "ws://localhost:3001";
    }

    console.error("Could not determine WebSocket URL.");
    return null;
  },

  /**
   * Submit game score to backend
   */
  async submitScore(username, score, survivalTime, deathCause) {
    const apiBaseUrl = this.getApiBaseUrl();

    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log(
        "Backend integration disabled or URL missing, using local storage only"
      );
      return null; // Return null if backend is disabled or URL not found
    }

    try {
      // Get user identification data
      let userId = null;
      let fingerprint = null;

      if (
        window.userIdentification &&
        window.userIdentification.isInitialized()
      ) {
        userId = window.userIdentification.getUserId();
        fingerprint = window.userIdentification.getFingerprint();
      } else {
        console.warn(
          "UserIdentification not initialized before submitting score."
        );
        // Attempt to initialize if not already done
        if (window.userIdentification) {
          await window.userIdentification.initialize();
          userId = window.userIdentification.getUserId();
          fingerprint = window.userIdentification.getFingerprint();
        }
      }

      // Ensure userId is present before submitting
      if (!userId) {
        console.error("Cannot submit score without a userId.");
        return null;
      }

      const response = await fetch(`${apiBaseUrl}/submit-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Consider adding authentication headers if implemented
        },
        body: JSON.stringify({
          username: username || "Me", // Default username
          score: Math.floor(score), // Ensure integer score
          survivalTime: Math.floor(survivalTime), // Ensure integer time
          deathCause: deathCause || "unknown",
          userId: userId, // Persistent user identifier
          fingerprint: fingerprint, // Device fingerprint
          userAgent: navigator.userAgent, // Include user agent
          timestamp: new Date().toISOString(), // Use ISO string timestamp
        }),
      });

      if (!response.ok) {
        // Log more details on error
        const errorBody = await response.text();
        console.error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Score submitted successfully to backend:", data);
      return data;
    } catch (error) {
      console.error("Error submitting score to backend:", error);

      // Handle fallback explicitly
      if (BACKEND_CONFIG.FALLBACK_TO_LOCAL) {
        console.log("Falling back to local storage due to submission error.");
        // The actual fallback save happens in the gameOver state logic
      }

      return null; // Indicate failure
    }
  },

  /**
   * Fetch leaderboard from backend
   */
  async fetchLeaderboard(limit = 100, country = null) {
    const apiBaseUrl = this.getApiBaseUrl();

    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log(
        "Backend integration disabled or URL missing, using local storage only"
      );
      return null;
    }

    try {
      let url = `${apiBaseUrl}/leaderboard?limit=${limit}`;
      if (country) {
        url += `&country=${encodeURIComponent(country)}`; // Ensure country name is URL encoded
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `HTTP error fetching leaderboard! status: ${response.status}, body: ${errorBody}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Leaderboard fetched successfully from backend:", data);
      return data;
    } catch (error) {
      console.error("Error fetching leaderboard from backend:", error);

      if (BACKEND_CONFIG.FALLBACK_TO_LOCAL) {
        console.log("Falling back to local storage due to fetch error.");
        // The dashboard logic will handle showing local scores
      }

      return null; // Indicate failure
    }
  },

  /**
   * Fetch leaderboard by country
   */
  async fetchLeaderboardByCountry(country = null, limit = 10) {
    const apiBaseUrl = this.getApiBaseUrl();

    if (!BACKEND_CONFIG.USE_BACKEND || !apiBaseUrl) {
      console.log("Backend integration disabled or URL missing");
      return null;
    }

    try {
      let url = `${apiBaseUrl}/leaderboard/country?limit=${limit}`;
      if (country) {
        url += `&country=${encodeURIComponent(country)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `HTTP error fetching country leaderboard! status: ${response.status}, body: ${errorBody}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Country leaderboard fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("Error fetching country leaderboard:", error);
      // No explicit fallback here, dashboard handles lack of data
      return null;
    }
  },
};

// Make BackendAPI globally available
window.BackendAPI = BackendAPI;
window.BACKEND_CONFIG = BACKEND_CONFIG;
