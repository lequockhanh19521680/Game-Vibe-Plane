// Endpoint Configuration with Security
// This file contains endpoint configurations

class EndpointManager {
  constructor() {
    this.initialized = false;
    this.endpoints = {};
    this.wsEndpoint = null; // Storing wsEndpoint separately might be redundant
  }

  /**
   * Initialize endpoints
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Direct endpoint data from your 'prod' deployment
      this.endpoints.api =
        "https://otpedzrgnk.execute-api.ap-southeast-1.amazonaws.com/prod";
      // WebSocket endpoint, trailing slash removed.
      this.endpoints.ws =
        "wss://27elhcgzu9.execute-api.ap-southeast-1.amazonaws.com/prod";
      this.endpoints.token = "stellar_drift_secure_token_v1";

      // Add timestamp for potential future validation/rotation
      this.endpoints.timestamp = Date.now();

      this.initialized = true;
      console.log("Endpoints initialized");
    } catch (error) {
      console.error("Failed to initialize endpoints:", error);
      // Fallback to environment detection if direct assignment fails
      this.initializeFallback();
    }
  }

  /**
   * Fallback initialization (primarily for development)
   */
  initializeFallback() {
    // Check if we're in development
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isDevelopment) {
      this.endpoints.api = "http://localhost:3000";
      this.endpoints.ws = "ws://localhost:3001";
    } else {
      // Production fallback if direct init fails (should ideally not happen)
      console.error(
        "Production endpoint initialization failed, falling back to null."
      );
      this.endpoints.api = null;
      this.endpoints.ws = null;
    }

    this.initialized = true;
  }

  /**
   * Get API endpoint
   */
  getApiEndpoint() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }
    // Simple timestamp validation example (e.g., re-initialize if older than 1 hour)
    // if (Date.now() - this.endpoints.timestamp > 3600000) {
    //   console.warn("Endpoints potentially stale, consider reinitializing...");
    //   // Optionally re-initialize:
    //   // this.initialized = false;
    //   // this.initialize();
    //   // return null; // or return the stale endpoint
    // }
    return this.endpoints.api;
  }

  /**
   * Get WebSocket endpoint
   */
  getWsEndpoint() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }
    return this.endpoints.ws;
  }

  /**
   * Get security token
   */
  getToken() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }
    return this.endpoints.token;
  }

  // REMOVED: Unused decode function
  // decode(encoded) { ... }

  // REMOVED: Unused validateEndpoints function
  // async validateEndpoints() { ... }

  // REMOVED: Unused rotateEndpoints function and associated interval in backendApi.js
  // async rotateEndpoints() { ... }
}

// Create global instance
const endpointManager = new EndpointManager();

// Export for use
window.EndpointManager = EndpointManager;
window.endpointManager = endpointManager;
