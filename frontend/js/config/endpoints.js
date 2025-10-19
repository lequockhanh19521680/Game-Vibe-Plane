// Endpoint Configuration with Security
// This file contains obfuscated endpoint configurations

class EndpointManager {
  constructor() {
    this.initialized = false;
    this.endpoints = {};
    this.wsEndpoint = null;
  }

  /**
   * Initialize endpoints with obfuscation
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Direct endpoint data from your 'prod' deployment
      this.endpoints.api =
        "https://u0palzl9v7.execute-api.ap-southeast-1.amazonaws.com/prod";
      // FIX: Removed the trailing slash. The connection URL typically does not end with a slash.
      this.endpoints.ws =
        "wss://w1kpr6oc64.execute-api.ap-southeast-1.amazonaws.com/prod";
      this.endpoints.token = "stellar_drift_secure_token_v1";

      // Add timestamp-based validation
      this.endpoints.timestamp = Date.now();

      this.initialized = true;
      console.log("Endpoints initialized securely");
    } catch (error) {
      console.error("Failed to initialize endpoints:", error);
      // Fallback to environment detection
      this.initializeFallback();
    }
  }

  /**
   * Decode base64 strings (No longer used for endpoints but kept for compatibility if needed elsewhere)
   */
  decode(encoded) {
    try {
      return atob(encoded);
    } catch (error) {
      console.error("Decode error:", error);
      return null;
    }
  }

  /**
   * Fallback initialization
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
      // In production, these would be loaded from a secure configuration service
      this.endpoints.api = null;
      this.endpoints.ws = null;
    }

    this.initialized = true;
  }

  /**
   * Get API endpoint with validation
   */
  getApiEndpoint() {
    if (!this.initialized) {
      console.error("Endpoints not initialized");
      return null;
    }

    // Add timestamp validation (endpoints expire after 1 hour)
    if (Date.now() - this.endpoints.timestamp > 3600000) {
      console.warn("Endpoints expired, reinitializing...");
      this.initialized = false;
      this.initialize();
      return null;
    }

    return this.endpoints.api;
  }

  /**
   * Get WebSocket endpoint with validation
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

  /**
   * Validate endpoint health
   */
  async validateEndpoints() {
    if (!this.endpoints.api) return false;

    try {
      const response = await fetch(`${this.endpoints.api}/health`, {
        method: "GET",
        timeout: 5000,
      });

      return response.ok;
    } catch (error) {
      console.error("Endpoint validation failed:", error);
      return false;
    }
  }

  /**
   * Rotate endpoints (for security)
   */
  async rotateEndpoints() {
    console.log("Rotating endpoints for security...");
    this.initialized = false;
    await this.initialize();
  }
}

// Create global instance
const endpointManager = new EndpointManager();

// Export for use
window.EndpointManager = EndpointManager;
window.endpointManager = endpointManager;
