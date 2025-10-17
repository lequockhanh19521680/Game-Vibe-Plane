// Mobile Optimization and Detection Utilities
// This script runs early to detect mobile devices and apply optimizations

(function () {
  "use strict";

  // Early mobile detection (before DOM fully loads)
  function earlyMobileDetection() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    return isMobile || isSmallScreen || isTouchDevice;
  }

  // Apply early mobile optimizations
  function applyEarlyMobileOptimizations() {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
    document.head.appendChild(meta);

    // Add mobile-optimized class early
    document.documentElement.classList.add("mobile-optimized");

    // Prevent scroll behaviors
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    // Add CSS custom properties for mobile scaling
    document.documentElement.style.setProperty("--mobile-scale", "0.8");
    document.documentElement.style.setProperty("--mobile-font-scale", "0.75");

    // Optimize touch performance
    document.addEventListener(
      "touchstart",
      function (e) {
        // Prevent default behaviors that might interfere with gameplay
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener(
      "touchend",
      function (e) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // Add performance optimizations
    if (window.devicePixelRatio > 1) {
      // High DPI display - reduce canvas resolution for performance
      document.documentElement.style.setProperty("--canvas-scale", "0.75");
    }
  }

  // Enhanced mobile game configuration
  function configureMobileGameplay() {
    if (window.GAME_CONFIG && window.GAME_CONFIG.ui.mobile) {
      // Additional mobile-specific config adjustments
      const mobile = window.GAME_CONFIG.ui.mobile;

      // Make warnings more visible on mobile
      if (window.GAME_CONFIG.ui.warning.universal) {
        window.GAME_CONFIG.ui.warning.universal.mobile.radiusMultiplier = 1.8;
        window.GAME_CONFIG.ui.warning.universal.mobile.durationMultiplier = 1.5;
        window.GAME_CONFIG.ui.warning.universal.mobile.pulseSpeedMultiplier = 1.5;
      }

      // Adjust difficulty for mobile
      if (mobile.detected) {
        // Make game slightly easier on mobile
        window.GAME_CONFIG.difficulty.baseSpawnInterval *= 1.2;
        window.GAME_CONFIG.difficulty.speedIncreaseStep *= 0.8;
        window.GAME_CONFIG.asteroids.baseSpeed *= 0.9;
        window.GAME_CONFIG.missiles.baseSpeed *= 0.85;

        // Increase warning times
        window.GAME_CONFIG.blackHoles.warningDuration *= 1.3;
        window.GAME_CONFIG.missiles.warningDuration *= 1.3;
        window.GAME_CONFIG.ui.warning.universal.duration *= 1.3;
      }
    }
  }

  // Enhanced warning creation for mobile
  function createMobileEnhancedWarning(x, y, type, options = {}) {
    const isMobile =
      document.documentElement.classList.contains("mobile-optimized");

    if (isMobile) {
      // Enhanced mobile warning properties
      const mobileOptions = {
        ...options,
        radius: (options.radius || 30) * 1.5,
        duration: (options.duration || 120) * 1.3,
        effectRadius:
          (options.effectRadius || null) && options.effectRadius * 1.2,
        pulseBrighter: true,
        showDirectionHint: true,
      };

      return mobileOptions;
    }

    return options;
  }

  // Optimize touch input for gameplay
  function optimizeTouchInput() {
    let lastTouchTime = 0;
    const touchThrottle = 16; // ~60fps

    document.addEventListener(
      "touchmove",
      function (e) {
        const now = Date.now();
        if (now - lastTouchTime > touchThrottle) {
          lastTouchTime = now;

          if (e.touches.length > 0 && window.mouse) {
            window.mouse.x = e.touches[0].clientX;
            window.mouse.y = e.touches[0].clientY;
          }
        }
      },
      { passive: true }
    );
  }

  // Initialize mobile optimizations
  function initMobileOptimizations() {
    if (earlyMobileDetection()) {
      console.log("Mobile device detected - applying optimizations");
      applyEarlyMobileOptimizations();

      // Wait for GAME_CONFIG to be available
      const checkGameConfig = setInterval(() => {
        if (window.GAME_CONFIG) {
          clearInterval(checkGameConfig);
          window.GAME_CONFIG.ui.mobile.detected = true;
          configureMobileGameplay();
        }
      }, 50);

      // Set up touch optimizations when DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", optimizeTouchInput);
      } else {
        optimizeTouchInput();
      }
    }
  }

  // Make functions globally available
  window.MobileOptimizer = {
    isMobile: earlyMobileDetection,
    createEnhancedWarning: createMobileEnhancedWarning,
    applyOptimizations: applyEarlyMobileOptimizations,
  };

  // Auto-initialize
  initMobileOptimizations();
})();
