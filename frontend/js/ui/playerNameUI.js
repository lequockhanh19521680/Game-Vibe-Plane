// Player Name UI Manager
// Handles player name input with validation

class PlayerNameUI {
  constructor() {
    this.isOpen = false;
    this.playerNameScreen = null;
    this.playerName = '';
    this.isNameValid = false;
  }

  /**
   * Initialize player name UI
   */
  initialize() {
    this.createPlayerNameScreen();
    this.setupEventListeners();
    this.loadSavedName();
    console.log('Player Name UI initialized');
  }

  /**
   * Create player name screen HTML
   */
  createPlayerNameScreen() {
    // Create player name screen element
    this.playerNameScreen = document.createElement('div');
    this.playerNameScreen.id = 'player-name-screen';
    this.playerNameScreen.className = 'ui-element';
    this.playerNameScreen.style.display = 'none';
    this.playerNameScreen.style.maxWidth = '400px';

    this.playerNameScreen.innerHTML = `
      <h2 data-translate="playerName.title">Enter Your Name</h2>
      
      <div class="name-input-section">
        <div class="input-group">
          <input 
            type="text" 
            id="player-name-input" 
            class="name-input" 
            placeholder="Your name..."
            data-translate-placeholder="playerName.placeholder"
            maxlength="20"
            autocomplete="off"
          >
          <div id="name-validation-message" class="validation-message"></div>
        </div>
        
        <div class="name-info">
          <p>Your name will appear on the leaderboard</p>
          <p class="name-requirements">
            • 2-20 characters<br>
            • Letters, numbers, spaces allowed<br>
            • No special characters
          </p>
        </div>
      </div>

      <div class="name-buttons">
        <button id="save-name-button" class="name-button primary disabled" data-translate="playerName.save" disabled>Save Name</button>
        <button id="cancel-name-button" class="name-button secondary">Cancel</button>
      </div>
    `;

    // Add to UI container
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.appendChild(this.playerNameScreen);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const nameInput = document.getElementById('player-name-input');
    const saveButton = document.getElementById('save-name-button');
    const cancelButton = document.getElementById('cancel-name-button');
    const validationMessage = document.getElementById('name-validation-message');

    // Name input validation
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.validateName(e.target.value);
      });

      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && this.isNameValid) {
          this.saveName();
        }
      });

      // Prevent invalid characters
      nameInput.addEventListener('keydown', (e) => {
        const allowedKeys = [
          'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Home', 'End', 'Tab', 'Enter', 'Escape'
        ];
        
        if (allowedKeys.includes(e.key)) {
          return; // Allow these keys
        }

        // Allow letters, numbers, and space
        const char = e.key;
        const isValidChar = /^[a-zA-Z0-9\s]$/.test(char);
        
        if (!isValidChar) {
          e.preventDefault();
        }
      });
    }

    // Save button
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        if (this.isNameValid) {
          this.saveName();
        }
      });
    }

    // Cancel button
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.hide();
      });
    }
  }

  /**
   * Validate player name
   */
  validateName(name) {
    const nameInput = document.getElementById('player-name-input');
    const saveButton = document.getElementById('save-name-button');
    const validationMessage = document.getElementById('name-validation-message');

    if (!nameInput || !saveButton || !validationMessage) return;

    // Clear previous validation
    nameInput.classList.remove('valid', 'invalid');
    saveButton.classList.remove('disabled');
    saveButton.disabled = false;
    validationMessage.textContent = '';
    validationMessage.className = 'validation-message';

    // Trim whitespace
    name = name.trim();

    // Validation rules
    if (name.length === 0) {
      this.isNameValid = false;
      saveButton.classList.add('disabled');
      saveButton.disabled = true;
      return;
    }

    if (name.length < 2) {
      this.isNameValid = false;
      nameInput.classList.add('invalid');
      saveButton.classList.add('disabled');
      saveButton.disabled = true;
      validationMessage.textContent = 'Name must be at least 2 characters';
      validationMessage.classList.add('error');
      return;
    }

    if (name.length > 20) {
      this.isNameValid = false;
      nameInput.classList.add('invalid');
      saveButton.classList.add('disabled');
      saveButton.disabled = true;
      validationMessage.textContent = 'Name must be 20 characters or less';
      validationMessage.classList.add('error');
      return;
    }

    // Check for valid characters only
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      this.isNameValid = false;
      nameInput.classList.add('invalid');
      saveButton.classList.add('disabled');
      saveButton.disabled = true;
      validationMessage.textContent = 'Only letters, numbers, and spaces allowed';
      validationMessage.classList.add('error');
      return;
    }

    // Check for profanity (basic filter)
    const profanityWords = ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell'];
    const lowerName = name.toLowerCase();
    const hasProfanity = profanityWords.some(word => lowerName.includes(word));
    
    if (hasProfanity) {
      this.isNameValid = false;
      nameInput.classList.add('invalid');
      saveButton.classList.add('disabled');
      saveButton.disabled = true;
      validationMessage.textContent = 'Please choose a family-friendly name';
      validationMessage.classList.add('error');
      return;
    }

    // Name is valid
    this.isNameValid = true;
    nameInput.classList.add('valid');
    validationMessage.textContent = '✓ Name looks good!';
    validationMessage.classList.add('success');
    this.playerName = name;
  }

  /**
   * Save player name
   */
  saveName() {
    if (!this.isNameValid) return;

    try {
      // Save to localStorage
      localStorage.setItem('stellarDriftPlayerName', this.playerName);
      
      // Update start button state
      this.updateStartButtonState();
      
      console.log('Player name saved:', this.playerName);
      
      // Hide the screen
      this.hide();
      
      // Show success message briefly
      if (window.showEventText) {
        window.showEventText(`Welcome, ${this.playerName}!`);
      }
      
    } catch (error) {
      console.error('Error saving player name:', error);
    }
  }

  /**
   * Load saved name from localStorage
   */
  loadSavedName() {
    try {
      const savedName = localStorage.getItem('stellarDriftPlayerName');
      if (savedName) {
        this.playerName = savedName;
        this.isNameValid = true;
        
        // Update input if screen is open
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
          nameInput.value = savedName;
          this.validateName(savedName);
        }
        
        // Update start button
        this.updateStartButtonState();
      }
    } catch (error) {
      console.error('Error loading saved name:', error);
    }
  }

  /**
   * Show player name screen
   */
  show() {
    if (this.playerNameScreen) {
      this.playerNameScreen.style.display = 'flex';
      this.isOpen = true;
      
      // Focus on input
      const nameInput = document.getElementById('player-name-input');
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 100);
      }
      
      // Update translations
      if (window.gameSettings) {
        window.gameSettings.updateUI();
      }
    }
  }

  /**
   * Hide player name screen
   */
  hide() {
    if (this.playerNameScreen) {
      this.playerNameScreen.style.display = 'none';
      this.isOpen = false;
    }
  }

  /**
   * Get current player name
   */
  getPlayerName() {
    return this.playerName;
  }

  /**
   * Check if name is valid
   */
  hasValidName() {
    return this.isNameValid && this.playerName.length >= 2;
  }

  /**
   * Update start button state based on name validation
   */
  updateStartButtonState() {
    const startButton = document.getElementById('start-button');
    if (!startButton) return;

    if (this.hasValidName()) {
      startButton.disabled = false;
      startButton.classList.remove('disabled');
      startButton.textContent = window.gameSettings ? 
        window.gameSettings.t('menu.startBattle') : 'Start Battle';
    } else {
      startButton.disabled = true;
      startButton.classList.add('disabled');
      startButton.textContent = window.gameSettings ? 
        window.gameSettings.t('playerName.required') : 'Name Required';
    }
  }

  /**
   * Check if player name screen is open
   */
  isPlayerNameOpen() {
    return this.isOpen;
  }

  /**
   * Clear saved name (for testing/reset)
   */
  clearSavedName() {
    this.playerName = '';
    this.isNameValid = false;
    localStorage.removeItem('stellarDriftPlayerName');
    this.updateStartButtonState();
    
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.value = '';
      nameInput.classList.remove('valid', 'invalid');
    }
  }
}

// Create global instance
const playerNameUI = new PlayerNameUI();

// Export for use
window.PlayerNameUI = PlayerNameUI;
window.playerNameUI = playerNameUI;