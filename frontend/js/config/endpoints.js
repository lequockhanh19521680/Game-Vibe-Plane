// Endpoint Configuration with Security
// This file contains obfuscated endpoint configurations

class EndpointManager {
  constructor() {
    this.initialized = false;
    this.endpoints = {};
    this.wsEndpoint = null;
  }

  /**
   * Initialize endpoints with modern configuration system
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // First, try to use the new environment configuration system
      if (window.environmentConfig) {
        await this.initializeFromEnvironment();
      } else {
        // Fallback to the legacy obfuscated system
        await this.initializeLegacy();
      }

      this.initialized = true;
      console.log("Endpoints initialized:", {
        api: this.endpoints.api ? "configured" : "not configured",
        websocket: this.endpoints.ws ? "configured" : "not configured",
        source: window.environmentConfig ? "environment" : "legacy",
      });
    } catch (error) {
      console.error("Failed to initialize endpoints:", error);
      // Fallback to environment detection
      this.initializeFallback();
    }
  }

  /**
   * Initialize from modern environment configuration
   */
  async initializeFromEnvironment() {
    const config = window.environmentConfig.initialize();

    this.endpoints.api = config.apiBaseUrl;
    this.endpoints.ws = config.websocketUrl;
    this.endpoints.timeout = config.apiTimeout;
    this.endpoints.reconnectAttempts = config.websocketReconnectAttempts;
    this.endpoints.reconnectDelay = config.websocketReconnectDelay;
    this.endpoints.timestamp = Date.now();

    // Validate URLs
    if (this.endpoints.api && !this.isValidUrl(this.endpoints.api)) {
      console.warn("Invalid API URL detected, falling back to legacy system");
      await this.initializeLegacy();
    }
  }

  /**
   * Initialize using legacy obfuscated system (fallback)
   */
  async initializeLegacy() {
    // Obfuscated endpoint data (fallback for existing deployments)
    const obfuscatedData = {
      // Dùng Base64 encoded URL mẫu, bạn cần thay thế bằng URL thật của bạn
      // Ví dụ: https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod
      api: "aHR0cHM6Ly93b3JrLmV4ZWN1dGUtYXBpLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb20vcHJvZA==",
      // Ví dụ: wss://YOUR_WS_ID.execute-api.YOUR_REGION.amazonaws.com/prod
      ws: "d3NzOi8vd3MubGltc2VydmVyLmV4ZWN1dGUtYXBpLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb20vcHJvZA==",
      // Additional security token
      token: "c3RlbGxhcl9kcmlmdF9zZWN1cmVfdG9rZW5fdjE=",
    };

    // Decode endpoints
    this.endpoints.api = this.decode(obfuscatedData.api);
    this.endpoints.ws = this.decode(obfuscatedData.ws);
    this.endpoints.token = this.decode(obfuscatedData.token);

    // Add timestamp-based validation
    this.endpoints.timestamp = Date.now();
  }

  /**
   * Decode base64 strings
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
      // Fallback for local development
      this.endpoints.api = "http://localhost:3000";
      this.endpoints.ws = "ws://localhost:3001";
    } else {
      // Fallback cho môi trường Production (nếu Base64 và ENV đều thất bại)
      // Cần một URL mặc định an toàn cho Production, ví dụ:
      // (BẠN CẦN THAY THẾ CHÍNH XÁC URL CỦA BẠN VÀO ĐÂY)
      this.endpoints.api = "https://default-api.example.com/prod"; // Thay thế bằng URL API thật của bạn
      this.endpoints.ws = "wss://default-ws.example.com/prod"; // Thay thế bằng URL WS thật của bạn

      // Nếu không muốn có fallback Production, hãy để null:
      this.endpoints.api = null;
      this.endpoints.ws = null;
    }

    this.initialized = true;
  }

  /**
   * Get API endpoint with validation
   */
  getApiEndpoint() {
    // FIXED: Removed console.error to stop noisy logs during initialization
    if (!this.initialized) {
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
    // FIXED: Removed console.error to stop noisy logs during initialization
    if (!this.initialized) {
      return null;
    }

    return this.endpoints.ws;
  }

  /**
   * Get security token
   */
  getToken() {
    // FIXED: Removed console.error to stop noisy logs during initialization
    if (!this.initialized) {
      return null;
    }

    return this.endpoints.token;
  }

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Validate endpoint health
   */
  async validateEndpoints() {
    if (!this.endpoints.api) return false;

    try {
      const timeout = this.endpoints.timeout || 5000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.endpoints.api}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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
