// Logic to dynamically load the appropriate game configuration.
// IMPORTANT: This file must be loaded AFTER gameConfig.js AND gameConfigMobile.js
// in index.html, but BEFORE any file that uses the GAME_CONFIG object.

// Global placeholder for the actual configuration object
window.GAME_CONFIG_FINAL = {};

/**
 * Merges two configuration objects.
 * @param {object} baseConfig The default/base configuration.
 * @param {object} overrides The configuration settings to override the base.
 * @returns {object} The merged configuration.
 */
function mergeConfig(baseConfig, overrides) {
  const merged = { ...baseConfig };

  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      // Check if the property is an object (and not null/array/Date)
      if (
        typeof overrides[key] === "object" &&
        overrides[key] !== null &&
        !Array.isArray(overrides[key])
      ) {
        // Recursive merge for nested objects
        merged[key] = mergeConfig(merged[key] || {}, overrides[key]);
      } else {
        // Directly assign primitive value or array
        merged[key] = overrides[key];
      }
    }
  }
  return merged;
}

/**
 * Determines and sets the final GAME_CONFIG.
 * You must ensure that window.GAME_CONFIG and window.GAME_CONFIG_MOBILE are available globally.
 */
function loadFinalConfig() {
  // 1. Get base configuration (assuming gameConfig.js loads to window.GAME_CONFIG)
  const desktopConfig = window.GAME_CONFIG || {};

  // 2. Check for mobile environment (simple heuristic)
  const isMobile =
    window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

  if (isMobile && window.GAME_CONFIG_MOBILE) {
    // If mobile and mobile config is defined, merge desktop (base) with mobile (overrides)
    console.log("Loading Mobile Configuration overrides...");
    window.GAME_CONFIG_FINAL = mergeConfig(
      desktopConfig,
      window.GAME_CONFIG_MOBILE
    );
  } else {
    // Default to desktop configuration
    console.log("Loading Desktop Configuration.");
    window.GAME_CONFIG_FINAL = desktopConfig;
  }

  // Replace the old global GAME_CONFIG reference (optional, but cleaner)
  window.GAME_CONFIG = window.GAME_CONFIG_FINAL;
}

// Ensure loadFinalConfig runs after the document is fully loaded
document.addEventListener("DOMContentLoaded", loadFinalConfig);

// If running in a context where DOMContentLoaded is too late, run immediately:
loadFinalConfig();
