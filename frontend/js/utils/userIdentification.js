// User Identification System
// Creates and stores a unique, persistent user ID in localStorage.

class UserIdentification {
  constructor() {
    this.localStorageKey = "stellarDriftUserId"; // Key for storing the ID
    this.userId = null;
    this.initialized = false;
  }

  /**
   * Initializes the user ID.
   * Tries to load an existing ID from localStorage, otherwise creates a new one.
   */
  initialize() {
    if (this.initialized) return;

    try {
      const savedId = localStorage.getItem(this.localStorageKey);
      if (savedId) {
        this.userId = savedId;
        console.log("Loaded saved User ID:", this.userId);
      } else {
        this.userId = this.generateNewId();
        localStorage.setItem(this.localStorageKey, this.userId);
        console.log("Generated and stored new User ID:", this.userId);
      }
    } catch (error) {
      console.error(
        "Error accessing localStorage. Using a temporary ID.",
        error
      );
      // Fallback if localStorage is not available (e.g., private browsing)
      this.userId = this.generateNewId();
    }

    this.initialized = true;
  }

  /**
   * Generates a new unique user ID.
   * Uses crypto.randomUUID() if available for a robust ID, otherwise falls back to a simpler method.
   * @returns {string} A new unique user ID.
   */
  generateNewId() {
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
   * Initializes if it hasn't been done yet.
   * @returns {string} The user's unique ID.
   */
  getUserId() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.userId;
  }

  /**
   * Checks if the user ID has been initialized.
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
