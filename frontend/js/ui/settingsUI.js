// Settings UI Manager
// Handles the settings screen interface

class SettingsUI {
  constructor() {
    this.isOpen = false;
    this.settingsScreen = null;
    this.modalOverlay = null; // Thêm thuộc tính cho lớp phủ
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
    // 1. Create Modal Overlay
    this.modalOverlay = document.createElement("div");
    this.modalOverlay.id = "modal-overlay";
    document.getElementById("ui-container").appendChild(this.modalOverlay);

    // 2. Create settings screen element (The Modal Content)
    this.settingsScreen = document.createElement("div");
    this.settingsScreen.id = "settings-screen";
    // Thêm class 'modal-popup' để áp dụng style pop-up
    this.settingsScreen.className = "ui-element modal-popup";
    this.settingsScreen.style.display = "none";
    this.settingsScreen.style.maxWidth = "600px";
    this.settingsScreen.style.maxHeight = "80vh";
    this.settingsScreen.style.overflowY = "auto";

    this.settingsScreen.innerHTML = `
      <h2 data-translate="settings.title">Cài Đặt</h2>
      
      <!-- Language Settings -->
      <div class="settings-section">
        <h3 data-translate="settings.language">Ngôn Ngữ</h3>
        <div class="settings-group">
          <select id="language-select" class="settings-select">
            <!-- Options will be populated by JavaScript -->
          </select>
        </div>
      </div>

      <!-- Volume Settings -->
      <div class="settings-section">
        <h3 data-translate="settings.volume">Âm Lượng</h3>
        <div class="settings-group">
          <label data-translate="settings.masterVolume">Âm Lượng Chính</label>
          <div class="volume-control">
            <input type="range" id="master-volume" min="0" max="1" step="0.1" class="volume-slider">
            <span id="master-volume-value" class="volume-value">70%</span>
          </div>
        </div>
        <div class="settings-group">
          <label data-translate="settings.musicVolume">Âm Lượng Nhạc</label>
          <div class="volume-control">
            <input type="range" id="music-volume" min="0" max="1" step="0.1" class="volume-slider">
            <span id="music-volume-value" class="volume-value">50%</span>
          </div>
        </div>
        <div class="settings-group">
          <label data-translate="settings.effectsVolume">Âm Lượng Hiệu Ứng</label>
          <div class="volume-control">
            <input type="range" id="effects-volume" min="0" max="1" step="0.1" class="volume-slider">
            <span id="effects-volume-value" class="volume-value">80%</span>
          </div>
        </div>
      </div>

      <!-- Graphics Settings -->
      <div class="settings-section">
        <h3 data-translate="settings.graphics">Đồ Họa</h3>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="particles-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.particles">Hiệu Ứng Hạt</span>
          </label>
        </div>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="screen-shake-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.screenShake">Rung Màn Hình</span>
          </label>
        </div>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="background-effects-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.backgroundEffects">Hiệu Ứng Nền</span>
          </label>
        </div>
      </div>

      <!-- Gameplay Settings -->
      <div class="settings-section">
        <h3 data-translate="settings.gameplay">Lối Chơi</h3>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="show-fps-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.showFPS">Hiển Thị FPS</span>
          </label>
        </div>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="pause-on-focus-loss-toggle" class="settings-checkbox">
            <span class="checkmark"></span>
            <span data-translate="settings.pauseOnFocusLoss">Tạm Dừng Khi Mất Focus</span>
          </label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="settings-buttons">
        <button id="reset-settings-button" class="settings-button secondary" data-translate="settings.reset">Khôi Phục Mặc Định</button>
        <button id="back-from-settings-button" class="settings-button primary" data-translate="settings.back">Quay Lại</button>
      </div>
    `;

    // Add settings screen to UI container
    const uiContainer = document.getElementById("ui-container");
    if (uiContainer) {
      uiContainer.appendChild(this.settingsScreen);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Language select
    const languageSelect = document.getElementById("language-select");
    if (languageSelect) {
      languageSelect.addEventListener("change", (e) => {
        if (window.gameSettings) {
          window.gameSettings.setLanguage(e.target.value);
        }
      });
    }

    // Volume sliders
    ["master", "music", "effects"].forEach((type) => {
      const slider = document.getElementById(`${type}-volume`);
      const valueSpan = document.getElementById(`${type}-volume-value`);

      if (slider && valueSpan) {
        slider.addEventListener("input", (e) => {
          const value = parseFloat(e.target.value);
          valueSpan.textContent = Math.round(value * 100) + "%";

          if (window.gameSettings) {
            window.gameSettings.setVolume(type, value);
          }
        });
      }
    });

    // Graphics toggles
    const graphicsToggles = [
      { id: "particles-toggle", setting: "particles" },
      { id: "screen-shake-toggle", setting: "screenShake" },
      { id: "background-effects-toggle", setting: "backgroundEffects" },
    ];

    graphicsToggles.forEach(({ id, setting }) => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener("change", () => {
          if (window.gameSettings) {
            window.gameSettings.toggleSetting("graphics", setting);
          }
        });
      }
    });

    // Gameplay toggles
    const gameplayToggles = [
      { id: "show-fps-toggle", setting: "showFPS" },
      { id: "pause-on-focus-loss-toggle", setting: "pauseOnFocusLoss" },
    ];

    gameplayToggles.forEach(({ id, setting }) => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener("change", () => {
          if (window.gameSettings) {
            window.gameSettings.toggleSetting("gameplay", setting);
          }
        });
      }
    });

    // Reset button
    const resetButton = document.getElementById("reset-settings-button");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        // Thay thế alert/confirm bằng logic xử lý UI nội bộ hoặc đơn giản là reset
        if (window.gameSettings) {
          window.gameSettings.resetToDefaults();
          this.updateSettingsUI();
          if (typeof showEventText === "function") {
            showEventText("Settings Reset to Defaults");
          }
        }
      });
    }

    // Back button
    const backButton = document.getElementById("back-from-settings-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        this.hide();
        // Quay về Menu Chính (vì Settings thường chỉ được gọi từ Menu)
        if (
          window.gameStateManager &&
          window.gameStateManager.getCurrentStateName() !== "PlayingState"
        ) {
          window.gameStateManager.changeState("menu");
        }
      });
    }
  }

  /**
   * Show settings screen (as a modal pop-up)
   */
  show() {
    if (this.settingsScreen) {
      this.modalOverlay.style.display = "block"; // Hiển thị lớp phủ
      this.settingsScreen.style.display = "flex";
      this.isOpen = true;
      this.updateSettingsUI();

      // Ẩn tất cả các UI-element khác trong #ui-container trừ overlay và settings-screen
      const uiElements = document.getElementById("ui-container").children;
      for (const el of uiElements) {
        if (el.classList.contains("ui-element") && el !== this.settingsScreen) {
          el.style.display = "none";
        }
      }

      // Update translations
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
      this.modalOverlay.style.display = "none"; // Ẩn lớp phủ
      this.settingsScreen.style.display = "none";
      this.isOpen = false;

      // Hiển thị lại các UI-element khác cần thiết (Menu, Leaderboard, HowToPlay)
      if (window.gameStateManager) {
        const currentStateName = window.gameStateManager.getCurrentStateName();
        // Chỉ hiện lại screen tương ứng với state hiện tại (Menu/Leaderboard/HowToPlay)
        switch (currentStateName) {
          case "MenuState":
            document.getElementById("start-screen").style.display = "flex";
            break;
          case "LeaderboardState":
            document.getElementById("leaderboard-screen").style.display =
              "flex";
            break;
          case "HowToPlayState":
            document.getElementById("how-to-play-screen").style.display =
              "flex";
            break;
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

    // Update language select
    const languageSelect = document.getElementById("language-select");
    if (languageSelect) {
      languageSelect.innerHTML = "";
      Object.values(languages).forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code;
        option.textContent = `${lang.flag} ${lang.name}`;
        if (lang.code === settings.language) {
          option.selected = true;
        }
        languageSelect.appendChild(option);
      });
    }

    // Update volume sliders
    ["master", "music", "effects"].forEach((type) => {
      const slider = document.getElementById(`${type}-volume`);
      const valueSpan = document.getElementById(`${type}-volume-value`);

      if (slider && valueSpan && settings.volume[type] !== undefined) {
        slider.value = settings.volume[type];
        valueSpan.textContent = Math.round(settings.volume[type] * 100) + "%";
      }
    });

    // Update graphics toggles
    const graphicsToggles = [
      { id: "particles-toggle", setting: "particles" },
      { id: "screen-shake-toggle", setting: "screenShake" },
      { id: "background-effects-toggle", setting: "backgroundEffects" },
    ];

    graphicsToggles.forEach(({ id, setting }) => {
      const toggle = document.getElementById(id);
      if (toggle && settings.graphics[setting] !== undefined) {
        toggle.checked = settings.graphics[setting];
      }
    });

    // Update gameplay toggles
    const gameplayToggles = [
      { id: "show-fps-toggle", setting: "showFPS" },
      { id: "pause-on-focus-loss-toggle", setting: "pauseOnFocusLoss" },
    ];

    gameplayToggles.forEach(({ id, setting }) => {
      const toggle = document.getElementById(id);
      if (toggle && settings.gameplay[setting] !== undefined) {
        toggle.checked = settings.gameplay[setting];
      }
    });
  }

  /**
   * Check if settings screen is open
   */
  isSettingsOpen() {
    return this.isOpen;
  }
}

// Create global instance
const settingsUI = new SettingsUI();

// Export for use
window.SettingsUI = SettingsUI;
window.settingsUI = settingsUI;
window.updateSettingsUI = () => settingsUI.updateSettingsUI();
