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
      // Obfuscated endpoint data (in production, this could be fetched from a secure endpoint)
      const obfuscatedData = {
        // Base64 encoded API endpoint
        api: 'aHR0cHM6Ly8wamZlaWl2ZnBiLmV4ZWN1dGUtYXBpLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb20vcHJvZA==',
        // Base64 encoded WebSocket endpoint  
        ws: 'd3NzOi8vaWU4MWh4b2lvNy5leGVjdXRlLWFwaS5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tL3Byb2Q=',
        // Additional security token (could be used for API key rotation)
        token: 'c3RlbGxhcl9kcmlmdF9zZWN1cmVfdG9rZW5fdjE='
      };

      // Decode endpoints
      this.endpoints.api = this.decode(obfuscatedData.api);
      this.endpoints.ws = this.decode(obfuscatedData.ws);
      this.endpoints.token = this.decode(obfuscatedData.token);

      // Add timestamp-based validation
      this.endpoints.timestamp = Date.now();
      
      this.initialized = true;
      console.log('Endpoints initialized securely');
      
    } catch (error) {
      console.error('Failed to initialize endpoints:', error);
      // Fallback to environment detection
      this.initializeFallback();
    }
  }

  /**
   * Decode base64 strings
   */
  decode(encoded) {
    try {
      return atob(encoded);
    } catch (error) {
      console.error('Decode error:', error);
      return null;
    }
  }

  /**
   * Fallback initialization
   */
  initializeFallback() {
    // Check if we're in development
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      this.endpoints.api = 'http://localhost:3000';
      this.endpoints.ws = 'ws://localhost:3001';
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
      console.error('Endpoints not initialized');
      return null;
    }

    // Add timestamp validation (endpoints expire after 1 hour)
    if (Date.now() - this.endpoints.timestamp > 3600000) {
      console.warn('Endpoints expired, reinitializing...');
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
      console.error('Endpoints not initialized');
      return null;
    }

    return this.endpoints.ws;
  }

  /**
   * Get security token
   */
  getToken() {
    if (!this.initialized) {
      console.error('Endpoints not initialized');
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
        method: 'GET',
        timeout: 5000
      });
      
      return response.ok;
    } catch (error) {
      console.error('Endpoint validation failed:', error);
      return false;
    }
  }

  /**
   * Rotate endpoints (for security)
   */
  async rotateEndpoints() {
    console.log('Rotating endpoints for security...');
    this.initialized = false;
    await this.initialize();
  }
}

// Create global instance
const endpointManager = new EndpointManager();

// Export for use
window.EndpointManager = EndpointManager;
window.endpointManager = endpointManager;