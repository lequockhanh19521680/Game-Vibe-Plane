// Player Name UI Manager
// Handles player name input, validation, and storage

class PlayerNameUI {
  constructor() {
    this.playerName = '';
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
    
    console.log('Player Name UI initialized');
  }

  /**
   * Setup name input event listeners
   */
  setupNameInput() {
    const nameInput = document.getElementById('player-name-input');
    const startButton = document.getElementById('start-button');
    
    if (!nameInput || !startButton) {
      console.warn('Player name input or start button not found');
      return;
    }

    // Real-time validation as user types
    nameInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      this.validateName(value);
      this.updateStartButton();
      this.updateInputVisuals(nameInput);
    });

    // Validation on blur
    nameInput.addEventListener('blur', (e) => {
      const value = e.target.value.trim();
      this.validateName(value);
      this.updateStartButton();
      this.updateInputVisuals(nameInput);
    });

    // Save name on Enter key
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.isValid) {
        this.saveName();
        // Try to start game if name is valid
        if (this.hasValidName()) {
          startButton.click();
        }
      }
    });

    // Handle paste events
    nameInput.addEventListener('paste', (e) => {
      setTimeout(() => {
        const value = e.target.value.trim();
        this.validateName(value);
        this.updateStartButton();
        this.updateInputVisuals(nameInput);
      }, 10);
    });
  }

  /**
   * Validate player name
   */
  validateName(name) {
    const trimmedName = name.trim();
    
    // Check length
    if (trimmedName.length < this.minLength) {
      this.isValid = false;
      return { valid: false, message: `Name must be at least ${this.minLength} characters` };
    }
    
    if (trimmedName.length > this.maxLength) {
      this.isValid = false;
      return { valid: false, message: `Name must be no more than ${this.maxLength} characters` };
    }

    // Check for invalid characters (allow letters, numbers, spaces, basic symbols)
    const validPattern = /^[a-zA-Z0-9\s\-_\.!@#$%^&*()+=\[\]{}|;:,.<>?~`'"]+$/;
    if (!validPattern.test(trimmedName)) {
      this.isValid = false;
      return { valid: false, message: 'Name contains invalid characters' };
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['admin', 'bot', 'null', 'undefined', 'system'];
    const lowerName = trimmedName.toLowerCase();
    for (const word of inappropriateWords) {
      if (lowerName.includes(word)) {
        this.isValid = false;
        return { valid: false, message: 'Please choose a different name' };
      }
    }

    // Name is valid
    this.playerName = trimmedName;
    this.isValid = true;
    return { valid: true, message: 'Name looks good!' };
  }

  /**
   * Update start button state based on name validation
   */
  updateStartButton() {
    const startButton = document.getElementById('start-button');
    if (!startButton) return;

    if (this.isValid && this.playerName.length >= this.minLength) {
      // Enable start button
      startButton.classList.remove('disabled');
      startButton.disabled = false;
      startButton.style.pointerEvents = 'auto';
      startButton.style.opacity = '1';
    } else {
      // Disable start button
      startButton.classList.add('disabled');
      startButton.disabled = true;
      startButton.style.pointerEvents = 'none';
      startButton.style.opacity = '0.5';
    }
  }

  /**
   * Update input visual feedback
   */
  updateInputVisuals(nameInput) {
    const validation = this.validateName(nameInput.value);
    
    // Remove previous classes
    nameInput.classList.remove('valid', 'invalid');
    
    // Add appropriate class
    if (nameInput.value.trim().length === 0) {
      // No input yet, neutral state
      return;
    } else if (validation.valid) {
      nameInput.classList.add('valid');
    } else {
      nameInput.classList.add('invalid');
    }

    // Update validation message if it exists
    this.updateValidationMessage(validation.message, validation.valid);
  }

  /**
   * Update validation message
   */
  updateValidationMessage(message, isValid) {
    let validationEl = document.getElementById('name-validation-message');
    
    // Create validation message element if it doesn't exist
    if (!validationEl) {
      validationEl = document.createElement('div');
      validationEl.id = 'name-validation-message';
      validationEl.className = 'validation-message';
      
      const nameInputWrapper = document.getElementById('name-input-wrapper');
      if (nameInputWrapper) {
        nameInputWrapper.appendChild(validationEl);
      }
    }

    // Update message
    validationEl.textContent = message;
    validationEl.className = `validation-message ${isValid ? 'success' : 'error'}`;
  }

  /**
   * Load saved player name from localStorage
   */
  loadSavedName() {
    try {
      const savedName = localStorage.getItem('stellarDriftPlayerName');
      if (savedName) {
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
          nameInput.value = savedName;
          this.validateName(savedName);
          this.updateStartButton();
          this.updateInputVisuals(nameInput);
        }
      }
    } catch (error) {
      console.error('Error loading saved player name:', error);
    }
  }

  /**
   * Save player name to localStorage
   */
  saveName() {
    if (this.isValid && this.playerName) {
      try {
        localStorage.setItem('stellarDriftPlayerName', this.playerName);
        console.log('Player name saved:', this.playerName);
      } catch (error) {
        console.error('Error saving player name:', error);
      }
    }
  }

  /**
   * Get current player name
   */
  getPlayerName() {
    return this.playerName;
  }

  /**
   * Check if player has a valid name
   */
  hasValidName() {
    return this.isValid && this.playerName && this.playerName.length >= this.minLength;
  }

  /**
   * Show name input (for future modal implementation)
   */
  show() {
    // For now, just focus the name input
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.focus();
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Clear player name
   */
  clearName() {
    this.playerName = '';
    this.isValid = false;
    
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.value = '';
      nameInput.classList.remove('valid', 'invalid');
    }
    
    this.updateStartButton();
    
    try {
      localStorage.removeItem('stellarDriftPlayerName');
    } catch (error) {
      console.error('Error clearing saved player name:', error);
    }
  }

  /**
   * Set player name programmatically
   */
  setPlayerName(name) {
    const validation = this.validateName(name);
    if (validation.valid) {
      const nameInput = document.getElementById('player-name-input');
      if (nameInput) {
        nameInput.value = name;
        this.updateInputVisuals(nameInput);
      }
      this.updateStartButton();
      this.saveName();
      return true;
    }
    return false;
  }

  /**
   * Get validation requirements
   */
  getRequirements() {
    return {
      minLength: this.minLength,
      maxLength: this.maxLength,
      pattern: 'Letters, numbers, spaces, and basic symbols allowed',
      restrictions: 'No inappropriate content'
    };
  }
}

// Create global instance
const playerNameUI = new PlayerNameUI();

// Export for use
window.PlayerNameUI = PlayerNameUI;
window.playerNameUI = playerNameUI;