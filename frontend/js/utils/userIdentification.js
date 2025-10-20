// User Identification System
// Creates a unique user ID and a device fingerprint.

class UserIdentification {
  constructor() {
    this.localStorageKey = "stellarDriftUserId"; // Key for storing the user ID
    this.userId = null;
    this.fingerprint = null; // To store the device fingerprint
    this.initialized = false;
    this._initializationPromise = null;
  }

  /**
   * Initializes the user ID and device fingerprint.
   * This is now an async operation.
   */
  initialize() {
    if (this._initializationPromise) {
      return this._initializationPromise;
    }

    this._initializationPromise = (async () => {
      try {
        // 1. Initialize User ID from localStorage (synchronous)
        const savedId = localStorage.getItem(this.localStorageKey);
        if (savedId) {
          this.userId = savedId;
          console.log("Loaded saved User ID:", this.userId);
        } else {
          this.userId = this.generateNewUserId();
          localStorage.setItem(this.localStorageKey, this.userId);
          console.log("Generated and stored new User ID:", this.userId);
        }

        // 2. Initialize FingerprintJS (asynchronous)
        await this._loadFingerprintJs();
        if (window.FingerprintJS) {
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          this.fingerprint = result.visitorId;
          console.log("Device Fingerprint:", this.fingerprint);
        } else {
          throw new Error("FingerprintJS library failed to load.");
        }
      } catch (error) {
        console.error("Error during identification initialization:", error);
        // Fallback if localStorage or FingerprintJS fails
        if (!this.userId) {
          this.userId = this.generateNewUserId();
        }
        this.fingerprint = null; // Ensure fingerprint is null on error
      } finally {
        this.initialized = true;
      }
    })();

    return this._initializationPromise;
  }

  /**
   * Dynamically loads the FingerprintJS script.
   * @returns {Promise<void>}
   */
  _loadFingerprintJs() {
    return new Promise((resolve, reject) => {
      if (window.FingerprintJS) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = "https://openfpcdn.io/fingerprintjs/v3";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) =>
        reject(
          new Error(
            `Failed to load FingerprintJS script. Error: ${err.message}`
          )
        );
      document.head.appendChild(script);
    });
  }

  /**
   * Generates a new unique user ID.
   * @returns {string} A new unique user ID.
   */
  generateNewUserId() {
    if (crypto && crypto.randomUUID) {
      return `user_${crypto.randomUUID()}`;
    }
    // Fallback for older browsers or non-secure contexts
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `user_${timestamp}_${random}`;
  }

  /**
   * Gets the current user ID.
   * @returns {string} The user's unique ID.
   */
  getUserId() {
    if (!this.initialized) {
      console.warn(
        "UserIdentification not initialized. Call initialize() first."
      );
    }
    return this.userId;
  }

  /**
   * Gets the device fingerprint.
   * @returns {string|null} The device fingerprint, or null if not available.
   */
  getFingerprint() {
    if (!this.initialized) {
      console.warn(
        "UserIdentification not initialized. Call initialize() first."
      );
    }
    return this.fingerprint;
  }

  /**
   * Checks if the system has been initialized.
   * @returns {boolean} True if initialized, otherwise false.
   */
  isInitialized() {
    return this.initialized;
  }
}

// Create a global instance
const userIdentification = new UserIdentification();

// Export for use in other modules if needed, or attach to window
window.UserIdentification = UserIdentification;
window.userIdentification = userIdentification;
