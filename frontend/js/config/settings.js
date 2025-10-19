// Game Settings Manager
// Handles language, volume, and other user preferences

class GameSettings {
  constructor() {
    this.settings = {
      language: "en", // Default language
      volume: {
        master: 0.7,
        music: 0.5,
        effects: 0.8,
      },
      graphics: {
        particles: true,
        screenShake: true,
        backgroundEffects: true,
      },
    };

    this.languages = {
      en: {
        code: "en",
        name: "English",
        flag: "🇺🇸",
      },
      vi: {
        code: "vi",
        name: "Tiếng Việt",
        flag: "🇻🇳",
      },
      zh: {
        code: "zh",
        name: "中文",
        flag: "🇨🇳",
      },
      ja: {
        code: "ja",
        name: "日本語",
        flag: "🇯🇵",
      },
      ko: {
        code: "ko",
        name: "한국어",
        flag: "🇰🇷",
      },
      es: {
        code: "es",
        name: "Español",
        flag: "🇪🇸",
      },
      fr: {
        code: "fr",
        name: "Français",
        flag: "🇫🇷",
      },
      de: {
        code: "de",
        name: "Deutsch",
        flag: "🇩🇪",
      },
      ru: {
        code: "ru",
        name: "Русский",
        flag: "🇷🇺",
      },
      ar: {
        code: "ar",
        name: "العربية",
        flag: "🇸🇦",
      },
      hi: {
        code: "hi",
        name: "हिन्दी",
        flag: "🇮🇳",
      },
      pt: {
        code: "pt",
        name: "Português",
        flag: "🇵🇹",
      },
      it: {
        code: "it",
        name: "Italiano",
        flag: "🇮🇹",
      },
      nl: {
        code: "nl",
        name: "Nederlands",
        flag: "🇳🇱",
      },
      sv: {
        code: "sv",
        name: "Svenska",
        flag: "🇸🇪",
      },
      tr: {
        code: "tr",
        name: "Türkçe",
        flag: "🇹🇷",
      },
      pl: {
        code: "pl",
        name: "Polski",
        flag: "🇵🇱",
      },
      th: {
        code: "th",
        name: "ไทย",
        flag: "🇹🇭",
      },
      id: {
        code: "id",
        name: "Bahasa Indonesia",
        flag: "🇮🇩",
      },
      ms: {
        code: "ms",
        name: "Bahasa Melayu",
        flag: "🇲🇾",
      },
    };

    this.translations = {};
    this.initialized = false;
  }

  /**
   * Initialize settings system
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load saved settings
      this.loadSettings();

      // Load translations
      await this.loadTranslations();

      // Apply initial settings
      this.applySettings();

      this.initialized = true;
      console.log("Settings initialized:", this.settings);
    } catch (error) {
      console.error("Error initializing settings:", error);
      this.initialized = true; // Continue with defaults
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem("stellarDriftSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Use lodash.merge or a similar deep merge if available
        // For now, a simple merge will suffice for the current structure
        if (parsed.volume)
          this.settings.volume = { ...this.settings.volume, ...parsed.volume };
        if (parsed.graphics)
          this.settings.graphics = {
            ...this.settings.graphics,
            ...parsed.graphics,
          };
        if (parsed.language) this.settings.language = parsed.language;
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(
        "stellarDriftSettings",
        JSON.stringify(this.settings)
      );
      console.log("Settings saved");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  /**
   * Load translations for all languages
   */
  async loadTranslations() {
    // Define translations inline (in production, these could be loaded from files)
    this.translations = {
      en: {
        // Menu
        "menu.title": "Stellar Drift",
        "menu.subtitle": "SINGULARITY",
        "menu.description":
          "Move to score points. Avoid asteroids, black holes & missiles. Survive as long as possible!",
        "menu.startBattle": "Start Battle",
        "menu.leaderboard": "Leaderboard",
        "menu.howToPlay": "How to Play",
        "menu.settings": "Settings",

        // Game Over
        "gameOver.title": "Game Over",
        "gameOver.yourScore": "Your score: {score}",
        "gameOver.survivalTime": "Survival time: {time}",
        "gameOver.newHighScore": "New High Score!",
        "gameOver.tryAgain": "Try Again",
        "gameOver.mainMenu": "Main Menu",

        // Settings
        "settings.title": "Settings",
        "settings.language": "Language",
        "settings.volume": "Volume",
        "settings.masterVolume": "Master Volume",
        "settings.musicVolume": "Music Volume",
        "settings.effectsVolume": "Effects Volume",
        "settings.graphics": "Graphics",
        "settings.particles": "Particle Effects",
        "settings.screenShake": "Screen Shake",
        "settings.backgroundEffects": "Background Effects",
        "settings.back": "Back",
        "settings.reset": "Reset to Defaults",

        // Player Name
        "playerName.title": "Enter Your Name",
        "playerName.placeholder": "Your name...",
        "playerName.required": "Name is required to start battle",
        "playerName.save": "Save Name",

        // Pause Menu
        "pause.title": "Game Paused",
        "pause.resume": "Resume Game",
        "pause.restart": "Restart",
        "pause.mainMenu": "Main Menu",

        // Leaderboard
        "leaderboard.title": "Live Dashboard",
        "leaderboard.topPlayers": "🏆 Top Players",
        "leaderboard.topCountries": "🌍 Top Countries",
        "leaderboard.myStats": "📊 My Stats",
        "leaderboard.back": "Back to Menu",

        // Events
        "event.asteroidShower": "⚠️ ASTEROID SHOWER! ⚠️",
        "event.missileIncoming": "⚠️ MISSILES INCOMING ⚠️",
        "event.laserGrid": "Laser Grid!",
        "event.blackHoleChain": "Black Hole Chain!",
        "event.crystalStorm": "Cosmic Crystal Storm!",
        "event.plasmaInferno": "⚠️ PLASMA INFERNO IMMINENT ⚠️",
      },

      vi: {
        "menu.title": "Stellar Drift",
        "menu.subtitle": "SINGULARITY",
        "menu.description":
          "Di chuyển để ghi điểm. Tránh thiên thạch, hố đen và tên lửa. Sống sót càng lâu càng tốt!",
        "menu.startBattle": "Bắt Đầu Chiến Đấu",
        "menu.leaderboard": "Bảng Xếp Hạng",
        "menu.howToPlay": "Cách Chơi",
        "menu.settings": "Cài Đặt",
        "gameOver.title": "Trò Chơi Kết Thúc",
        "gameOver.yourScore": "Điểm của bạn: {score}",
        "gameOver.survivalTime": "Thời gian sống sót: {time}",
        "gameOver.newHighScore": "Kỷ Lục Mới!",
        "gameOver.tryAgain": "Thử Lại",
        "gameOver.mainMenu": "Menu Chính",
        "settings.title": "Cài Đặt",
        "settings.language": "Ngôn Ngữ",
        "settings.volume": "Âm Lượng",
        "settings.masterVolume": "Âm Lượng Chính",
        "settings.musicVolume": "Âm Lượng Nhạc",
        "settings.effectsVolume": "Âm Lượng Hiệu Ứng",
        "settings.graphics": "Đồ Họa",
        "settings.particles": "Hiệu Ứng Hạt",
        "settings.screenShake": "Rung Màn Hình",
        "settings.backgroundEffects": "Hiệu Ứng Nền",
        "settings.back": "Quay Lại",
        "settings.reset": "Khôi Phục Mặc Định",
        "playerName.title": "Nhập Tên Của Bạn",
        "playerName.placeholder": "Tên của bạn...",
        "playerName.required": "Cần nhập tên để bắt đầu chiến đấu",
        "playerName.save": "Lưu Tên",
        "pause.title": "Trò Chơi Tạm Dừng",
        "pause.resume": "Tiếp Tục",
        "pause.restart": "Khởi Động Lại",
        "pause.mainMenu": "Menu Chính",
        "leaderboard.title": "Bảng Điều Khiển Trực Tiếp",
        "leaderboard.topPlayers": "🏆 Top Người Chơi",
        "leaderboard.topCountries": "🌍 Top Quốc Gia",
        "leaderboard.myStats": "📊 Thống Kê Của Tôi",
        "leaderboard.back": "Về Menu",
        "event.asteroidShower": "⚠️ MƯA THIÊN THẠCH! ⚠️",
        "event.missileIncoming": "⚠️ TÊN LỬA TẤN CÔNG! ⚠️",
        "event.laserGrid": "Lưới Laser!",
        "event.blackHoleChain": "Chuỗi Hố Đen!",
        "event.crystalStorm": "Bão Pha Lê Vũ Trụ!",
        "event.plasmaInferno": "⚠️ ĐỊA NGỤC PLASMA! ⚠️",
      },
    };
    // Add other languages similarly, removing gameplay translations
  }

  /**
   * Get translation for a key
   */
  t(key, params = {}) {
    const lang = this.settings.language;
    const translation =
      this.translations[lang] && this.translations[lang][key]
        ? this.translations[lang][key]
        : this.translations["en"][key] || key;

    // Replace parameters in translation
    return translation.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] || match;
    });
  }

  /**
   * Set language
   */
  setLanguage(langCode) {
    if (this.languages[langCode]) {
      this.settings.language = langCode;
      this.saveSettings();
      this.updateUI();
      console.log("Language changed to:", langCode);
    }
  }

  /**
   * Set volume
   */
  setVolume(type, value) {
    if (this.settings.volume[type] !== undefined) {
      this.settings.volume[type] = Math.max(0, Math.min(1, value));
      this.saveSettings();
      this.applyVolumeSettings();
      console.log(`${type} volume set to:`, this.settings.volume[type]);
    }
  }

  /**
   * Toggle setting
   */
  toggleSetting(category, setting) {
    if (
      this.settings[category] &&
      this.settings[category][setting] !== undefined
    ) {
      this.settings[category][setting] = !this.settings[category][setting];
      this.saveSettings();
      this.applySettings();
      console.log(
        `${category}.${setting} toggled to:`,
        this.settings[category][setting]
      );
    }
  }

  /**
   * Apply all settings
   */
  applySettings() {
    this.applyVolumeSettings();
    this.applyGraphicsSettings();
    this.updateUI();
  }

  /**
   * Apply volume settings to audio system
   */
  applyVolumeSettings() {
    if (window.audioContext && typeof setMasterVolume === "function") {
      setMasterVolume(this.settings.volume.master);
    }

    if (typeof setMusicVolume === "function") {
      setMusicVolume(this.settings.volume.music);
    }

    if (typeof setEffectsVolume === "function") {
      setEffectsVolume(this.settings.volume.effects);
    }
  }

  /**
   * Apply graphics settings
   */
  applyGraphicsSettings() {
    // These would be used by the game engine
    if (window.GAME_CONFIG) {
      window.GAME_CONFIG.graphics = {
        ...window.GAME_CONFIG.graphics,
        ...this.settings.graphics,
      };
    }
  }

  /**
   * Update UI with current language
   */
  updateUI() {
    // Update all translatable elements
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      element.textContent = this.t(key);
    });

    // Update placeholders
    document
      .querySelectorAll("[data-translate-placeholder]")
      .forEach((element) => {
        const key = element.getAttribute("data-translate-placeholder");
        element.placeholder = this.t(key);
      });
  }

  /**
   * Reset to default settings
   */
  resetToDefaults() {
    this.settings = {
      language: "en",
      volume: {
        master: 0.7,
        music: 0.5,
        effects: 0.8,
      },
      graphics: {
        particles: true,
        screenShake: true,
        backgroundEffects: true,
      },
    };

    this.saveSettings();
    this.applySettings();

    // Update settings UI if open
    if (window.settingsUI && window.settingsUI.isOpen) {
      window.settingsUI.updateSettingsUI();
    }

    console.log("Settings reset to defaults");
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Get available languages
   */
  getLanguages() {
    return { ...this.languages };
  }
}

// Create global instance
const gameSettings = new GameSettings();

// Export for use
window.GameSettings = GameSettings;
window.gameSettings = gameSettings;
