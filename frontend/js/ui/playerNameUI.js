// Player Name UI Manager
// Handles player name input, validation, and storage

class PlayerNameUI {
  constructor() {
    this.playerName = "";
    this.isValid = false;
    this.minLength = 2;
    this.maxLength = 20;
    this.initialized = false;
  }

  /**
   * Initialize player name UI system
   */
  initialize() {
    if (this.initialized) return;

    this.setupNameInput();
    this.loadSavedName();
    this.updateStartButton();
    this.initialized = true;

    console.log("Player Name UI initialized");
  }

  /**
   * Setup name input event listeners
   */
  setupNameInput() {
    const nameInput = document.getElementById("player-name-input");
    const startButton = document.getElementById("start-button");

    if (!nameInput || !startButton) {
      console.warn("Player name input or start button not found");
      return;
    }

    // Real-time validation as user types
    nameInput.addEventListener("input", (e) => {
      const value = e.target.value;
      this.validateName(value);
      this.updateStartButton();
      this.updateInputVisuals(nameInput);
    });

    // Save name on Enter key
    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && this.isValid) {
        this.saveName();
        // Try to start game if name is valid
        if (this.hasValidName()) {
          startButton.click();
        }
      }
    });
  }

  /**
   * Validate player name
   * @param {string} name - The name to validate.
   */
  validateName(name) {
    const trimmedName = name.trim();

    if (
      trimmedName.length >= this.minLength &&
      trimmedName.length <= this.maxLength
    ) {
      this.isValid = true;
      this.playerName = trimmedName;
    } else {
      this.isValid = false;
      this.playerName = "";
    }
  }

  /**
   * Update start button state based on name validation
   */
  updateStartButton() {
    const startButton = document.getElementById("start-button");
    if (!startButton) return;

    if (this.isValid) {
      startButton.classList.remove("disabled");
      startButton.disabled = false;
    } else {
      startButton.classList.add("disabled");
      startButton.disabled = true;
    }
  }

  /**
   * Update input visual feedback
   * @param {HTMLInputElement} nameInput - The input element.
   */
  updateInputVisuals(nameInput) {
    nameInput.classList.remove("valid", "invalid");

    if (nameInput.value.trim().length === 0) {
      return;
    }

    if (this.isValid) {
      nameInput.classList.add("valid");
    } else {
      nameInput.classList.add("invalid");
    }
  }

  /**
   * Load saved player name from localStorage
   */
  loadSavedName() {
    try {
      const savedName = localStorage.getItem("stellarDriftPlayerName");
      if (savedName) {
        const nameInput = document.getElementById("player-name-input");
        if (nameInput) {
          nameInput.value = savedName;
          this.validateName(savedName);
          this.updateStartButton();
          this.updateInputVisuals(nameInput);
        }
      }
    } catch (error) {
      console.error("Error loading saved player name:", error);
    }
  }

  /**
   * Save player name to localStorage
   */
  saveName() {
    if (this.isValid && this.playerName) {
      try {
        localStorage.setItem("stellarDriftPlayerName", this.playerName);
        console.log("Player name saved:", this.playerName);
      } catch (error) {
        console.error("Error saving player name:", error);
      }
    }
  }

  /**
   * Get current player name
   * @returns {string} The current player name.
   */
  getPlayerName() {
    return this.playerName;
  }

  /**
   * Check if player has a valid name
   * @returns {boolean} True if the name is valid.
   */
  hasValidName() {
    return this.isValid;
  }

  /**
   * Show name input and focus it.
   */
  show() {
    const nameInput = document.getElementById("player-name-input");
    if (nameInput) {
      nameInput.focus();
      nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

// Create global instance
const playerNameUI = new PlayerNameUI();

// Export for use
window.PlayerNameUI = PlayerNameUI;
window.playerNameUI = playerNameUI;
