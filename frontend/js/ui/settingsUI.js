// Settings UI Manager
// Handles the settings screen interface

class SettingsUI {
  constructor() {
    this.isOpen = false;
    this.settingsScreen = null;
    this.modalOverlay = null;
  }

  /**
   * Initialize settings UI
   */
  initialize() {
    this.createSettingsScreen();
    this.setupEventListeners();
    console.log("Settings UI initialized");
  }

  /**
   * Create settings screen HTML
   */
  createSettingsScreen() {
    this.modalOverlay = document.createElement("div");
    this.modalOverlay.id = "modal-overlay";
    document.getElementById("ui-container").appendChild(this.modalOverlay);

    this.settingsScreen = document.createElement("div");
    this.settingsScreen.id = "settings-screen";
    this.settingsScreen.className = "ui-element modal-popup";
    this.settingsScreen.style.display = "none";

    this.settingsScreen.innerHTML = `
      <h2 data-translate="settings.title">Settings</h2>
      
      <div class="settings-section">
        <h3 data-translate="settings.language">Language</h3>
        <div class="settings-group">
          <select id="language-select" class="settings-select"></select>
        </div>
      </div>

      <div class="settings-section">
        <h3 data-translate="settings.volume">Volume</h3>
        <div class="settings-group">
          <label data-translate="settings.masterVolume">Master Volume</label>
          <div class="volume-control">
            <input type="range" id="master-volume" min="0" max="1" step="0.1" class="volume-slider">
            <span id="master-volume-value" class="volume-value"></span>
          </div>
        </div>
        <div class="settings-group">
          <label data-translate="settings.musicVolume">Music Volume</label>
          <div class="volume-control">
            <input type="range" id="music-volume" min="0" max="1" step="0.1" class="volume-slider">
            <span id="music-volume-value" class="volume-value"></span>
          </div>
        </div>
        <div class="settings-group">
          <label data-translate="settings.effectsVolume">Effects Volume</label>
          <div class="volume-control">
            <input type="range" id="effects-volume" min="0" max="1" step="0.1" class="volume-slider">
            <span id="effects-volume-value" class="volume-value"></span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 data-translate="settings.graphics">Graphics</h3>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="particles-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.particles">Particle Effects</span>
          </label>
        </div>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="screen-shake-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.screenShake">Screen Shake</span>
          </label>
        </div>
      </div>

      <div class="settings-buttons">
        <button id="reset-settings-button" class="settings-button secondary" data-translate="settings.reset">Reset to Defaults</button>
        <button id="back-from-settings-button" class="settings-button primary" data-translate="settings.back">Back</button>
      </div>
    `;
    document.getElementById("ui-container").appendChild(this.settingsScreen);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document
      .getElementById("language-select")
      .addEventListener("change", (e) => {
        window.gameSettings.setLanguage(e.target.value);
      });

    ["master", "music", "effects"].forEach((type) => {
      const slider = document.getElementById(`${type}-volume`);
      slider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById(
          `${type}-volume-value`
        ).textContent = `${Math.round(value * 100)}%`;
        window.gameSettings.setVolume(type, value);
      });
    });

    document
      .getElementById("particles-toggle")
      .addEventListener("change", () => {
        window.gameSettings.toggleSetting("graphics", "particles");
      });

    document
      .getElementById("screen-shake-toggle")
      .addEventListener("change", () => {
        window.gameSettings.toggleSetting("graphics", "screenShake");
      });

    document
      .getElementById("reset-settings-button")
      .addEventListener("click", () => {
        window.gameSettings.resetToDefaults();
        this.updateSettingsUI();
        if (typeof showEventText === "function") {
          showEventText("Settings Reset to Defaults");
        }
      });

    document
      .getElementById("back-from-settings-button")
      .addEventListener("click", () => {
        this.hide();
        if (
          window.gameStateManager &&
          window.gameStateManager.getCurrentStateName() !== "PlayingState"
        ) {
          window.gameStateManager.changeState("menu");
        }
      });
  }

  /**
   * Show settings screen
   */
  show() {
    if (this.settingsScreen) {
      this.modalOverlay.style.display = "block";
      this.settingsScreen.style.display = "flex";
      this.isOpen = true;
      this.updateSettingsUI();

      const uiElements = document.getElementById("ui-container").children;
      for (const el of uiElements) {
        if (el.classList.contains("ui-element") && el !== this.settingsScreen) {
          el.style.display = "none";
        }
      }
      if (window.gameSettings) {
        window.gameSettings.updateUI();
      }
    }
  }

  /**
   * Hide settings screen
   */
  hide() {
    if (this.settingsScreen) {
      this.modalOverlay.style.display = "none";
      this.settingsScreen.style.display = "none";
      this.isOpen = false;
      if (window.gameStateManager) {
        const currentStateName = window.gameStateManager.getCurrentStateName();
        if (currentStateName === "MenuState") {
          document.getElementById("start-screen").style.display = "flex";
        }
      }
    }
  }

  /**
   * Update settings UI with current values
   */
  updateSettingsUI() {
    if (!window.gameSettings) return;

    const settings = window.gameSettings.getSettings();
    const languages = window.gameSettings.getLanguages();

    const languageSelect = document.getElementById("language-select");
    languageSelect.innerHTML = "";
    Object.values(languages).forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.code;
      option.textContent = `${lang.flag} ${lang.name}`;
      option.selected = lang.code === settings.language;
      languageSelect.appendChild(option);
    });

    ["master", "music", "effects"].forEach((type) => {
      document.getElementById(`${type}-volume`).value = settings.volume[type];
      document.getElementById(
        `${type}-volume-value`
      ).textContent = `${Math.round(settings.volume[type] * 100)}%`;
    });

    document.getElementById("particles-toggle").checked =
      settings.graphics.particles;
    document.getElementById("screen-shake-toggle").checked =
      settings.graphics.screenShake;
  }
}

const settingsUI = new SettingsUI();
window.SettingsUI = SettingsUI;
window.settingsUI = settingsUI;
