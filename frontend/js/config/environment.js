// Environment Configuration Manager
// Handles environment variables and configuration with fallbacks

class EnvironmentConfig {
  constructor() {
    this.config = {};
    this.initialized = false;
    this.isDevelopment = false;
    this.isProduction = false;
  }

  /**
   * Initialize environment configuration
   */
  initialize() {
    if (this.initialized) return this.config;

    // Detect environment
    this.detectEnvironment();
    
    // Load configuration
    this.loadConfiguration();
    
    // Validate critical settings
    this.validateConfiguration();
    
    this.initialized = true;
    console.log('Environment configuration loaded:', {
      environment: this.config.environment,
      apiUrl: this.config.apiBaseUrl ? 'configured' : 'not configured',
      websocketUrl: this.config.websocketUrl ? 'configured' : 'not configured',
      debug: this.config.debugMode
    });
    
    return this.config;
  }

  /**
   * Detect current environment
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Development detection
    this.isDevelopment = (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.includes('dev') ||
      protocol === 'file:'
    );
    
    this.isProduction = !this.isDevelopment;
  }

  /**
   * Load configuration from various sources
   */
  loadConfiguration() {
    // Default configuration
    const defaults = {
      environment: this.isDevelopment ? 'development' : 'production',
      apiBaseUrl: null,
      websocketUrl: null,
      debugMode: this.isDevelopment,
      showConsoleLogs: this.isDevelopment,
      gameVersion: '1.0.0',
      maxPlayersLeaderboard: 10,
      apiTimeout: 10000,
      websocketReconnectAttempts: 3,
      websocketReconnectDelay: 5000,
      enableAnalytics: true,
      enableLeaderboard: true,
      enableRealTimeUpdates: true,
      devApiBaseUrl: 'http://localhost:3000',
      devWebsocketUrl: 'ws://localhost:3001',
      devMockData: false
    };

    // Try to load from environment variables (if using a bundler like Vite)
    const envConfig = this.loadFromEnvVariables();
    
    // Try to load from embedded configuration
    const embeddedConfig = this.loadEmbeddedConfiguration();
    
    // Try to load from localStorage override
    const localConfig = this.loadFromLocalStorage();
    
    // Merge configurations (priority: local > embedded > env > defaults)
    this.config = {
      ...defaults,
      ...envConfig,
      ...embeddedConfig,
      ...localConfig
    };

    // Apply environment-specific overrides
    if (this.isDevelopment) {
      this.config.apiBaseUrl = this.config.devApiBaseUrl || this.config.apiBaseUrl;
      this.config.websocketUrl = this.config.devWebsocketUrl || this.config.websocketUrl;
      this.config.debugMode = true;
      this.config.showConsoleLogs = true;
    }
  }

  /**
   * Load from environment variables (Vite style)
   */
  loadFromEnvVariables() {
    const config = {};
    
    // Check if we have access to import.meta.env (Vite)
    if (typeof import !== 'undefined' && import.meta && import.meta.env) {
      const env = import.meta.env;
      
      config.apiBaseUrl = env.VITE_API_BASE_URL;
      config.websocketUrl = env.VITE_WEBSOCKET_URL;
      config.environment = env.VITE_ENVIRONMENT;
      config.debugMode = env.VITE_DEBUG_MODE === 'true';
      config.showConsoleLogs = env.VITE_SHOW_CONSOLE_LOGS === 'true';
      config.gameVersion = env.VITE_GAME_VERSION;
      config.maxPlayersLeaderboard = parseInt(env.VITE_MAX_PLAYERS_LEADERBOARD) || 10;
      config.apiTimeout = parseInt(env.VITE_API_TIMEOUT) || 10000;
      config.websocketReconnectAttempts = parseInt(env.VITE_WEBSOCKET_RECONNECT_ATTEMPTS) || 3;
      config.websocketReconnectDelay = parseInt(env.VITE_WEBSOCKET_RECONNECT_DELAY) || 5000;
      config.enableAnalytics = env.VITE_ENABLE_ANALYTICS !== 'false';
      config.enableLeaderboard = env.VITE_ENABLE_LEADERBOARD !== 'false';
      config.enableRealTimeUpdates = env.VITE_ENABLE_REAL_TIME_UPDATES !== 'false';
      config.devApiBaseUrl = env.VITE_DEV_API_BASE_URL;
      config.devWebsocketUrl = env.VITE_DEV_WEBSOCKET_URL;
      config.devMockData = env.VITE_DEV_MOCK_DATA === 'true';
    }
    
    // Check for process.env (Node.js style, might be available if bundled)
    if (typeof process !== 'undefined' && process.env) {
      const env = process.env;
      
      config.apiBaseUrl = config.apiBaseUrl || env.VITE_API_BASE_URL;
      config.websocketUrl = config.websocketUrl || env.VITE_WEBSOCKET_URL;
      config.environment = config.environment || env.VITE_ENVIRONMENT;
    }
    
    return config;
  }

  /**
   * Load embedded configuration (fallback for the current system)
   */
  loadEmbeddedConfiguration() {
    // This provides compatibility with the existing endpoint system
    const config = {};
    
    // Use the existing endpoint manager if available
    if (window.endpointManager && window.endpointManager.initialized) {
      config.apiBaseUrl = window.endpointManager.getApiEndpoint();
      config.websocketUrl = window.endpointManager.getWsEndpoint();
    }
    
    return config;
  }

  /**
   * Load from localStorage (for runtime overrides)
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('stellarDriftConfig');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load configuration from localStorage:', error);
    }
    
    return {};
  }

  /**
   * Validate critical configuration
   */
  validateConfiguration() {
    const warnings = [];
    
    if (!this.config.apiBaseUrl) {
      warnings.push('API Base URL not configured - leaderboard features may not work');
    }
    
    if (!this.config.websocketUrl) {
      warnings.push('WebSocket URL not configured - real-time updates may not work');
    }
    
    if (this.config.apiBaseUrl && !this.isValidUrl(this.config.apiBaseUrl)) {
      warnings.push('API Base URL appears to be invalid');
    }
    
    if (this.config.websocketUrl && !this.isValidWebSocketUrl(this.config.websocketUrl)) {
      warnings.push('WebSocket URL appears to be invalid');
    }
    
    if (warnings.length > 0 && this.config.showConsoleLogs) {
      console.warn('Configuration warnings:', warnings);
    }
  }

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate WebSocket URL format
   */
  isValidWebSocketUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    if (!this.initialized) {
      this.initialize();
    }
    
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * Set configuration value (runtime override)
   */
  set(key, value, persist = false) {
    if (!this.initialized) {
      this.initialize();
    }
    
    this.config[key] = value;
    
    if (persist) {
      this.saveToLocalStorage();
    }
  }

  /**
   * Save current configuration to localStorage
   */
  saveToLocalStorage() {
    try {
      // Only save non-sensitive configuration
      const toSave = {
        debugMode: this.config.debugMode,
        showConsoleLogs: this.config.showConsoleLogs,
        enableAnalytics: this.config.enableAnalytics,
        enableLeaderboard: this.config.enableLeaderboard,
        enableRealTimeUpdates: this.config.enableRealTimeUpdates
      };
      
      localStorage.setItem('stellarDriftConfig', JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save configuration to localStorage:', error);
    }
  }

  /**
   * Get all configuration
   */
  getAll() {
    if (!this.initialized) {
      this.initialize();
    }
    
    return { ...this.config };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    const featureMap = {
      analytics: 'enableAnalytics',
      leaderboard: 'enableLeaderboard',
      realTimeUpdates: 'enableRealTimeUpdates',
      debug: 'debugMode'
    };
    
    const configKey = featureMap[feature];
    return configKey ? this.get(configKey, false) : false;
  }

  /**
   * Get environment info
   */
  getEnvironmentInfo() {
    return {
      environment: this.config.environment,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      debugMode: this.config.debugMode,
      version: this.config.gameVersion
    };
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    localStorage.removeItem('stellarDriftConfig');
    this.initialized = false;
    this.initialize();
  }
}

// Create global instance
const environmentConfig = new EnvironmentConfig();

// Export for use
window.EnvironmentConfig = EnvironmentConfig;
window.environmentConfig = environmentConfig;

// Compatibility function for easy access
window.getConfig = (key, defaultValue) => environmentConfig.get(key, defaultValue);
window.isFeatureEnabled = (feature) => environmentConfig.isFeatureEnabled(feature);