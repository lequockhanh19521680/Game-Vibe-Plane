/**
 * Backend API Configuration
 * Update these endpoints after deploying the backend infrastructure
 */

const BACKEND_CONFIG = {
  // API Gateway REST endpoint (update after deployment)
  API_BASE_URL: "https://your-api-gateway-url.execute-api.ap-southeast-1.amazonaws.com/dev",
  
  // WebSocket endpoint (update after deployment)
  WEBSOCKET_URL: "wss://your-websocket-url.execute-api.ap-southeast-1.amazonaws.com/dev",
  
  // Feature flags
  USE_BACKEND: true,
  FALLBACK_TO_LOCAL: true,
  
  // API endpoints
  ENDPOINTS: {
    // Game session management
    CREATE_SESSION: "/game/session",
    END_SESSION: "/game/session/{sessionId}/end",
    
    // Leaderboards
    GLOBAL_LEADERBOARD: "/leaderboard/global",
    COUNTRY_LEADERBOARD: "/leaderboard/country/{countryCode}",
    
    // System
    HEALTH_CHECK: "/health",
  },
  
  // Request configuration
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // WebSocket configuration
  WEBSOCKET_CONFIG: {
    RECONNECT_INTERVAL: 5000, // 5 seconds
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
  },
};

// Environment-specific overrides
const ENVIRONMENT_CONFIGS = {
  development: {
    API_BASE_URL: "http://localhost:3000/dev",
    WEBSOCKET_URL: "ws://localhost:3001",
    USE_BACKEND: false,
    FALLBACK_TO_LOCAL: true,
  },
  
  staging: {
    API_BASE_URL: "https://your-staging-api.execute-api.ap-southeast-1.amazonaws.com/staging",
    WEBSOCKET_URL: "wss://your-staging-ws.execute-api.ap-southeast-1.amazonaws.com/staging",
  },
  
  production: {
    API_BASE_URL: "https://your-prod-api.execute-api.ap-southeast-1.amazonaws.com/prod",
    WEBSOCKET_URL: "wss://your-prod-ws.execute-api.ap-southeast-1.amazonaws.com/prod",
    FALLBACK_TO_LOCAL: false,
  },
};

// Detect environment (you can also set this via build process)
const CURRENT_ENVIRONMENT = (() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (window.location.hostname.includes('staging') || window.location.hostname.includes('dev')) {
    return 'staging';
  }
  
  return 'production';
})();

// Merge configurations
const FINAL_CONFIG = {
  ...BACKEND_CONFIG,
  ...(ENVIRONMENT_CONFIGS[CURRENT_ENVIRONMENT] || {}),
  ENVIRONMENT: CURRENT_ENVIRONMENT,
};

// Helper functions
const API_HELPERS = {
  /**
   * Build full API URL
   * @param {string} endpoint - Endpoint path
   * @param {Object} params - URL parameters to replace
   * @returns {string} Full URL
   */
  buildUrl(endpoint, params = {}) {
    let url = FINAL_CONFIG.API_BASE_URL + endpoint;
    
    // Replace path parameters
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    
    return url;
  },

  /**
   * Build WebSocket URL
   * @param {Object} queryParams - Query parameters
   * @returns {string} WebSocket URL
   */
  buildWebSocketUrl(queryParams = {}) {
    const url = new URL(FINAL_CONFIG.WEBSOCKET_URL);
    
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    return url.toString();
  },

  /**
   * Get request headers
   * @returns {Object} Request headers
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  },

  /**
   * Handle API response
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} Parsed response
   */
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return data;
  },

  /**
   * Make API request with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(url, options = {}) {
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    let lastError;
    
    for (let attempt = 1; attempt <= FINAL_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          FINAL_CONFIG.REQUEST_TIMEOUT
        );

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return await this.handleResponse(response);
        
      } catch (error) {
        lastError = error;
        
        if (attempt < FINAL_CONFIG.RETRY_ATTEMPTS) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
    
    throw lastError;
  },
};

// Export configuration and helpers
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { FINAL_CONFIG, API_HELPERS };
} else {
  // Browser environment
  window.BACKEND_CONFIG = FINAL_CONFIG;
  window.API_HELPERS = API_HELPERS;
}

// Log configuration in development
if (CURRENT_ENVIRONMENT === 'development') {
  console.log('Backend Configuration:', FINAL_CONFIG);
}