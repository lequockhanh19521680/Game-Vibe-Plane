// Player Name UI Manager
// Handles retrieving, validating, and saving the player's name

class PlayerNameUI {
  constructor() {
    this.inputElement = null;
    this.localStorageKey = "vibePlanePlayerName"; // Use a specific key
  }

  /**
   * Initialize the player name UI, find the input element, and load saved name.
   */
  initialize() {
    this.inputElement = document.getElementById("player-name-input");
    if (!this.inputElement) {
      console.error(
        "Player name input element (#player-name-input) not found!"
      );
      return;
    }

    // Load saved name from localStorage
    const savedName = localStorage.getItem(this.localStorageKey);
    if (savedName) {
      this.inputElement.value = savedName;
      console.log("Loaded saved player name:", savedName);
    } else {
      console.log("No saved player name found.");
    }

    // Add event listener to save name on input change (optional, good for persistence)
    // this.inputElement.addEventListener('input', () => this.saveName());

    console.log("PlayerNameUI initialized");
  }

  /**
   * Retrieves the current player name from the input field.
   * @returns {string} The trimmed player name or an empty string if input not found.
   */
  getPlayerName() {
    if (!this.inputElement) {
      console.error("Cannot get player name, input element not initialized.");
      return ""; // Return empty string if input isn't found
    }
    return this.inputElement.value.trim(); // Trim whitespace
  }

  /**
   * Validates the player name (must be 2-20 characters).
   * @param {string} name - The name to validate.
   * @returns {boolean} True if the name is valid, false otherwise.
   */
  validateName(name) {
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const isValid = trimmedName.length >= 2 && trimmedName.length <= 20;
    console.log(`[PlayerNameUI] Validating name "${trimmedName}": ${isValid}`);
    return isValid;
  }

  /**
   * Saves the current player name to localStorage if it's valid.
   */
  saveName() {
    const currentName = this.getPlayerName(); // Gets the trimmed name
    if (this.validateName(currentName)) {
      try {
        localStorage.setItem(this.localStorageKey, currentName);
        console.log("Saved player name to localStorage:", currentName);
      } catch (error) {
        console.error("Error saving player name to localStorage:", error);
      }
    } else {
      console.log("Player name not saved because it's invalid.");
    }
  }
}

// Create a global instance
const playerNameUI = new PlayerNameUI();
window.PlayerNameUI = PlayerNameUI;
window.playerNameUI = playerNameUI;
