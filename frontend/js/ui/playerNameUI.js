// Player Name UI Manager
// Handles player name input, validation, and storage

class PlayerNameUI {
  constructor() {
    this.playerName = "";
    this.isValid = false;
    this.minLength = 2;
    this.maxLength = 20;
    this.initialized = false;
    this.nameInput = null; // Store reference to input element
    this.startButton = null; // Store reference to start button
  }

  /**
   * Initialize player name UI system
   */
  initialize() {
    if (this.initialized) return;

    this.nameInput = document.getElementById("player-name-input");
    this.startButton = document.getElementById("start-button");

    if (!this.nameInput || !this.startButton) {
      console.error(
        "Player name input or start button not found during initialization."
      );
      return;
    }

    this.setupNameInput();
    this.loadSavedName();
    this.updateStartButton(); // Initial state update
    this.updateInputVisuals(); // Initial visual state
    this.initialized = true;

    console.log("Player Name UI initialized");
  }

  /**
   * Setup name input event listeners
   */
  setupNameInput() {
    // Real-time validation as user types
    this.nameInput.addEventListener("input", (e) => {
      const value = e.target.value;
      this.validateName(value);
      this.updateStartButton();
      this.updateInputVisuals();
    });

    // Save name on Enter key and attempt to start game
    this.nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent default form submission if applicable
        if (this.isValid) {
          this.saveName();
          // Directly click the start button if valid
          this.startButton.click();
        } else {
          // Optionally provide feedback if name is invalid on Enter
          this.show(); // Refocus input if invalid
          if (typeof showEventText === "function") {
            showEventText("Please enter a valid name (2-20 characters).");
          }
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
      this.playerName = trimmedName; // Store the valid, trimmed name
    } else {
      this.isValid = false;
      // Keep playerName potentially non-empty for visual feedback,
      // but isValid flag prevents saving/starting.
      this.playerName = trimmedName; // Store trimmed name for consistency
    }
  }

  /**
   * Update start button state based on name validation
   */
  updateStartButton() {
    if (this.isValid) {
      this.startButton.classList.remove("disabled");
      this.startButton.disabled = false;
    } else {
      this.startButton.classList.add("disabled");
      this.startButton.disabled = true;
    }
  }

  /**
   * Update input visual feedback
   */
  updateInputVisuals() {
    this.nameInput.classList.remove("valid", "invalid");

    // Only add validation class if the input is not empty
    if (this.nameInput.value.length > 0) {
      if (this.isValid) {
        this.nameInput.classList.add("valid");
      } else {
        this.nameInput.classList.add("invalid");
      }
    }
  }

  /**
   * Load saved player name from localStorage
   */
  loadSavedName() {
    try {
      const savedName = localStorage.getItem("stellarDriftPlayerName");
      if (savedName) {
        this.nameInput.value = savedName;
        // Re-validate the loaded name
        this.validateName(savedName);
        // Update UI based on validation result
        this.updateStartButton();
        this.updateInputVisuals();
      } else {
        // If no saved name, ensure initial state is invalid
        this.validateName(""); // Explicitly validate empty string
        this.updateStartButton();
        this.updateInputVisuals();
      }
    } catch (error) {
      console.error("Error loading saved player name:", error);
      // Ensure invalid state on error
      this.validateName("");
      this.updateStartButton();
      this.updateInputVisuals();
    }
  }

  /**
   * Save player name to localStorage
   */
  saveName() {
    // Only save if the name is currently valid AND the stored playerName is not empty
    if (this.isValid && this.playerName) {
      try {
        localStorage.setItem("stellarDriftPlayerName", this.playerName);
        console.log("Player name saved:", this.playerName);
      } catch (error) {
        console.error("Error saving player name:", error);
      }
    } else {
      console.warn("Attempted to save invalid or empty player name.");
    }
  }

  /**
   * Get current valid player name
   * @returns {string} The current valid player name, or an empty string if invalid.
   */
  getPlayerName() {
    // Return the stored playerName only if it's currently considered valid
    return this.isValid ? this.playerName : "";
  }

  /**
   * Check if player has a valid name currently entered/loaded
   * @returns {boolean} True if the name is valid.
   */
  hasValidName() {
    return this.isValid;
  }

  /**
   * Show name input and focus it.
   */
  show() {
    if (this.nameInput) {
      this.nameInput.focus();
      // Scroll into view if needed, especially on mobile
      if (typeof this.nameInput.scrollIntoView === "function") {
        this.nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
}

// Create global instance
const playerNameUI = new PlayerNameUI();

// Export for use
window.PlayerNameUI = PlayerNameUI;
window.playerNameUI = playerNameUI;
