// Game Settings Manager
// Handles language, volume, and other user preferences

class GameSettings {
  constructor() {
    this.settings = {
      language: 'en', // Default language
      volume: {
        master: 0.7,
        music: 0.5,
        effects: 0.8
      },
      graphics: {
        particles: true,
        screenShake: true,
        backgroundEffects: true
      },
      gameplay: {
        showFPS: false,
        pauseOnFocusLoss: true
      }
    };
    
    this.languages = {
      en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸'
      },
      vi: {
        code: 'vi', 
        name: 'Tiếng Việt',
        flag: '🇻🇳'
      },
      zh: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳'
      },
      ja: {
        code: 'ja',
        name: '日本語',
        flag: '🇯🇵'
      },
      ko: {
        code: 'ko',
        name: '한국어',
        flag: '🇰🇷'
      },
      es: {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸'
      },
      fr: {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷'
      },
      de: {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪'
      },
      ru: {
        code: 'ru',
        name: 'Русский',
        flag: '🇷🇺'
      },
      ar: {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦'
      },
      hi: {
        code: 'hi',
        name: 'हिन्दी',
        flag: '🇮🇳'
      },
      pt: {
        code: 'pt',
        name: 'Português',
        flag: '🇵🇹'
      },
      it: {
        code: 'it',
        name: 'Italiano',
        flag: '🇮🇹'
      },
      nl: {
        code: 'nl',
        name: 'Nederlands',
        flag: '🇳🇱'
      },
      sv: {
        code: 'sv',
        name: 'Svenska',
        flag: '🇸🇪'
      },
      tr: {
        code: 'tr',
        name: 'Türkçe',
        flag: '🇹🇷'
      },
      pl: {
        code: 'pl',
        name: 'Polski',
        flag: '🇵🇱'
      },
      th: {
        code: 'th',
        name: 'ไทย',
        flag: '🇹🇭'
      },
      id: {
        code: 'id',
        name: 'Bahasa Indonesia',
        flag: '🇮🇩'
      },
      ms: {
        code: 'ms',
        name: 'Bahasa Melayu',
        flag: '🇲🇾'
      }
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
      console.log('Settings initialized:', this.settings);
      
    } catch (error) {
      console.error('Error initializing settings:', error);
      this.initialized = true; // Continue with defaults
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('stellarDriftSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('stellarDriftSettings', JSON.stringify(this.settings));
      console.log('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
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
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Move to score points. Avoid asteroids, black holes & missiles. Survive as long as possible!',
        'menu.startBattle': 'Start Battle',
        'menu.leaderboard': 'Leaderboard',
        'menu.howToPlay': 'How to Play',
        'menu.settings': 'Settings',
        
        // Game Over
        'gameOver.title': 'Game Over',
        'gameOver.yourScore': 'Your score: {score}',
        'gameOver.survivalTime': 'Survival time: {time}',
        'gameOver.newHighScore': 'New High Score!',
        'gameOver.tryAgain': 'Try Again',
        'gameOver.mainMenu': 'Main Menu',
        
        // Settings
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.volume': 'Volume',
        'settings.masterVolume': 'Master Volume',
        'settings.musicVolume': 'Music Volume',
        'settings.effectsVolume': 'Effects Volume',
        'settings.graphics': 'Graphics',
        'settings.particles': 'Particle Effects',
        'settings.screenShake': 'Screen Shake',
        'settings.backgroundEffects': 'Background Effects',
        'settings.gameplay': 'Gameplay',
        'settings.showFPS': 'Show FPS',
        'settings.pauseOnFocusLoss': 'Pause on Focus Loss',
        'settings.back': 'Back',
        'settings.reset': 'Reset to Defaults',
        
        // Player Name
        'playerName.title': 'Enter Your Name',
        'playerName.placeholder': 'Your name...',
        'playerName.required': 'Name is required to start battle',
        'playerName.save': 'Save Name',
        
        // Pause Menu
        'pause.title': 'Game Paused',
        'pause.resume': 'Resume Game',
        'pause.restart': 'Restart',
        'pause.mainMenu': 'Main Menu',
        
        // Leaderboard
        'leaderboard.title': 'Live Dashboard',
        'leaderboard.topPlayers': '🏆 Top Players',
        'leaderboard.topCountries': '🌍 Top Countries',
        'leaderboard.myStats': '📊 My Stats',
        'leaderboard.back': 'Back to Menu',
        
        // Events
        'event.asteroidShower': '⚠️ ASTEROID SHOWER! ⚠️',
        'event.missileIncoming': '⚠️ MISSILES INCOMING ⚠️',
        'event.laserGrid': 'Laser Grid!',
        'event.blackHoleChain': 'Black Hole Chain!',
        'event.crystalStorm': 'Cosmic Crystal Storm!',
        'event.plasmaInferno': '⚠️ PLASMA INFERNO IMMINENT ⚠️'
      },
      
      vi: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Di chuyển để ghi điểm. Tránh thiên thạch, hố đen và tên lửa. Sống sót càng lâu càng tốt!',
        'menu.startBattle': 'Bắt Đầu Chiến Đấu',
        'menu.leaderboard': 'Bảng Xếp Hạng',
        'menu.howToPlay': 'Cách Chơi',
        'menu.settings': 'Cài Đặt',
        
        // Game Over
        'gameOver.title': 'Trò Chơi Kết Thúc',
        'gameOver.yourScore': 'Điểm của bạn: {score}',
        'gameOver.survivalTime': 'Thời gian sống sót: {time}',
        'gameOver.newHighScore': 'Kỷ Lục Mới!',
        'gameOver.tryAgain': 'Thử Lại',
        'gameOver.mainMenu': 'Menu Chính',
        
        // Settings
        'settings.title': 'Cài Đặt',
        'settings.language': 'Ngôn Ngữ',
        'settings.volume': 'Âm Lượng',
        'settings.masterVolume': 'Âm Lượng Chính',
        'settings.musicVolume': 'Âm Lượng Nhạc',
        'settings.effectsVolume': 'Âm Lượng Hiệu Ứng',
        'settings.graphics': 'Đồ Họa',
        'settings.particles': 'Hiệu Ứng Hạt',
        'settings.screenShake': 'Rung Màn Hình',
        'settings.backgroundEffects': 'Hiệu Ứng Nền',
        'settings.gameplay': 'Lối Chơi',
        'settings.showFPS': 'Hiển Thị FPS',
        'settings.pauseOnFocusLoss': 'Tạm Dừng Khi Mất Focus',
        'settings.back': 'Quay Lại',
        'settings.reset': 'Khôi Phục Mặc Định',
        
        // Player Name
        'playerName.title': 'Nhập Tên Của Bạn',
        'playerName.placeholder': 'Tên của bạn...',
        'playerName.required': 'Cần nhập tên để bắt đầu chiến đấu',
        'playerName.save': 'Lưu Tên',
        
        // Pause Menu
        'pause.title': 'Trò Chơi Tạm Dừng',
        'pause.resume': 'Tiếp Tục',
        'pause.restart': 'Khởi Động Lại',
        'pause.mainMenu': 'Menu Chính',
        
        // Leaderboard
        'leaderboard.title': 'Bảng Điều Khiển Trực Tiếp',
        'leaderboard.topPlayers': '🏆 Top Người Chơi',
        'leaderboard.topCountries': '🌍 Top Quốc Gia',
        'leaderboard.myStats': '📊 Thống Kê Của Tôi',
        'leaderboard.back': 'Về Menu',
        
        // Events
        'event.asteroidShower': '⚠️ MƯA THIÊN THẠCH! ⚠️',
        'event.missileIncoming': '⚠️ TÊN LỬA TẤN CÔNG! ⚠️',
        'event.laserGrid': 'Lưới Laser!',
        'event.blackHoleChain': 'Chuỗi Hố Đen!',
        'event.crystalStorm': 'Bão Pha Lê Vũ Trụ!',
        'event.plasmaInferno': '⚠️ ĐỊA NGỤC PLASMA! ⚠️'
      },
      
      es: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Muévete para ganar puntos. Evita asteroides, agujeros negros y misiles. ¡Sobrevive el mayor tiempo posible!',
        'menu.startBattle': 'Iniciar Batalla',
        'menu.leaderboard': 'Clasificación',
        'menu.howToPlay': 'Cómo Jugar',
        'menu.settings': 'Configuración',
        
        // Game Over
        'gameOver.title': 'Juego Terminado',
        'gameOver.yourScore': 'Tu puntuación: {score}',
        'gameOver.survivalTime': 'Tiempo de supervivencia: {time}',
        'gameOver.newHighScore': '¡Nueva Puntuación Máxima!',
        'gameOver.tryAgain': 'Intentar de Nuevo',
        'gameOver.mainMenu': 'Menú Principal',
        
        // Settings
        'settings.title': 'Configuración',
        'settings.language': 'Idioma',
        'settings.volume': 'Volumen',
        'settings.masterVolume': 'Volumen Principal',
        'settings.musicVolume': 'Volumen de Música',
        'settings.effectsVolume': 'Volumen de Efectos',
        'settings.graphics': 'Gráficos',
        'settings.particles': 'Efectos de Partículas',
        'settings.screenShake': 'Vibración de Pantalla',
        'settings.backgroundEffects': 'Efectos de Fondo',
        'settings.gameplay': 'Jugabilidad',
        'settings.showFPS': 'Mostrar FPS',
        'settings.pauseOnFocusLoss': 'Pausar al Perder Foco',
        'settings.back': 'Volver',
        'settings.reset': 'Restablecer por Defecto',
        
        // Player Name
        'playerName.title': 'Ingresa Tu Nombre',
        'playerName.placeholder': 'Tu nombre...',
        'playerName.required': 'Se requiere nombre para iniciar batalla',
        'playerName.save': 'Guardar Nombre',
        
        // Leaderboard
        'leaderboard.title': 'Panel en Vivo',
        'leaderboard.topPlayers': '🏆 Mejores Jugadores',
        'leaderboard.topCountries': '🌍 Mejores Países',
        'leaderboard.myStats': '📊 Mis Estadísticas',
        'leaderboard.back': 'Volver al Menú',
        
        // Events
        'event.asteroidShower': '⚠️ ¡LLUVIA DE ASTEROIDES! ⚠️',
        'event.missileIncoming': '⚠️ ¡MISILES ENTRANTES! ⚠️',
        'event.laserGrid': '¡Rejilla Láser!',
        'event.blackHoleChain': '¡Cadena de Agujeros Negros!',
        'event.crystalStorm': '¡Tormenta de Cristales Cósmicos!',
        'event.plasmaInferno': '⚠️ ¡INFIERNO DE PLASMA! ⚠️'
      },

      fr: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Bougez pour marquer des points. Évitez les astéroïdes, trous noirs et missiles. Survivez le plus longtemps possible!',
        'menu.startBattle': 'Commencer la Bataille',
        'menu.leaderboard': 'Classement',
        'menu.howToPlay': 'Comment Jouer',
        'menu.settings': 'Paramètres',
        
        // Game Over
        'gameOver.title': 'Jeu Terminé',
        'gameOver.yourScore': 'Votre score: {score}',
        'gameOver.survivalTime': 'Temps de survie: {time}',
        'gameOver.newHighScore': 'Nouveau Record!',
        'gameOver.tryAgain': 'Réessayer',
        'gameOver.mainMenu': 'Menu Principal',
        
        // Settings
        'settings.title': 'Paramètres',
        'settings.language': 'Langue',
        'settings.volume': 'Volume',
        'settings.masterVolume': 'Volume Principal',
        'settings.musicVolume': 'Volume Musique',
        'settings.effectsVolume': 'Volume Effets',
        'settings.graphics': 'Graphiques',
        'settings.particles': 'Effets de Particules',
        'settings.screenShake': 'Tremblement Écran',
        'settings.backgroundEffects': 'Effets d\'Arrière-plan',
        'settings.gameplay': 'Gameplay',
        'settings.showFPS': 'Afficher FPS',
        'settings.pauseOnFocusLoss': 'Pause si Perte Focus',
        'settings.back': 'Retour',
        'settings.reset': 'Réinitialiser',
        
        // Player Name
        'playerName.title': 'Entrez Votre Nom',
        'playerName.placeholder': 'Votre nom...',
        'playerName.required': 'Nom requis pour commencer',
        'playerName.save': 'Sauvegarder Nom',
        
        // Leaderboard
        'leaderboard.title': 'Tableau de Bord Live',
        'leaderboard.topPlayers': '🏆 Meilleurs Joueurs',
        'leaderboard.topCountries': '🌍 Meilleurs Pays',
        'leaderboard.myStats': '📊 Mes Statistiques',
        'leaderboard.back': 'Retour au Menu',
        
        // Events
        'event.asteroidShower': '⚠️ PLUIE D\'ASTÉROÏDES! ⚠️',
        'event.missileIncoming': '⚠️ MISSILES ENTRANTS! ⚠️',
        'event.laserGrid': 'Grille Laser!',
        'event.blackHoleChain': 'Chaîne de Trous Noirs!',
        'event.crystalStorm': 'Tempête de Cristaux Cosmiques!',
        'event.plasmaInferno': '⚠️ ENFER DE PLASMA! ⚠️'
      },

      de: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Bewege dich, um Punkte zu sammeln. Vermeide Asteroiden, schwarze Löcher und Raketen. Überlebe so lange wie möglich!',
        'menu.startBattle': 'Schlacht Beginnen',
        'menu.leaderboard': 'Bestenliste',
        'menu.howToPlay': 'Spielanleitung',
        'menu.settings': 'Einstellungen',
        
        // Game Over
        'gameOver.title': 'Spiel Beendet',
        'gameOver.yourScore': 'Deine Punktzahl: {score}',
        'gameOver.survivalTime': 'Überlebenszeit: {time}',
        'gameOver.newHighScore': 'Neuer Rekord!',
        'gameOver.tryAgain': 'Nochmal Versuchen',
        'gameOver.mainMenu': 'Hauptmenü',
        
        // Settings
        'settings.title': 'Einstellungen',
        'settings.language': 'Sprache',
        'settings.volume': 'Lautstärke',
        'settings.masterVolume': 'Hauptlautstärke',
        'settings.musicVolume': 'Musiklautstärke',
        'settings.effectsVolume': 'Effektlautstärke',
        'settings.graphics': 'Grafiken',
        'settings.particles': 'Partikeleffekte',
        'settings.screenShake': 'Bildschirmwackeln',
        'settings.backgroundEffects': 'Hintergrundeffekte',
        'settings.gameplay': 'Gameplay',
        'settings.showFPS': 'FPS Anzeigen',
        'settings.pauseOnFocusLoss': 'Bei Fokusverlust Pausieren',
        'settings.back': 'Zurück',
        'settings.reset': 'Zurücksetzen',
        
        // Player Name
        'playerName.title': 'Namen Eingeben',
        'playerName.placeholder': 'Dein Name...',
        'playerName.required': 'Name erforderlich zum Starten',
        'playerName.save': 'Name Speichern',
        
        // Leaderboard
        'leaderboard.title': 'Live Dashboard',
        'leaderboard.topPlayers': '🏆 Top Spieler',
        'leaderboard.topCountries': '🌍 Top Länder',
        'leaderboard.myStats': '📊 Meine Statistiken',
        'leaderboard.back': 'Zurück zum Menü',
        
        // Events
        'event.asteroidShower': '⚠️ ASTEROIDENSCHAUER! ⚠️',
        'event.missileIncoming': '⚠️ RAKETEN ANFLUG! ⚠️',
        'event.laserGrid': 'Laser-Gitter!',
        'event.blackHoleChain': 'Schwarze-Loch-Kette!',
        'event.crystalStorm': 'Kosmischer Kristallsturm!',
        'event.plasmaInferno': '⚠️ PLASMA-INFERNO! ⚠️'
      },

      ru: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Двигайтесь, чтобы набрать очки. Избегайте астероидов, чёрных дыр и ракет. Выживайте как можно дольше!',
        'menu.startBattle': 'Начать Битву',
        'menu.leaderboard': 'Рейтинг',
        'menu.howToPlay': 'Как Играть',
        'menu.settings': 'Настройки',
        
        // Game Over
        'gameOver.title': 'Игра Окончена',
        'gameOver.yourScore': 'Ваш счёт: {score}',
        'gameOver.survivalTime': 'Время выживания: {time}',
        'gameOver.newHighScore': 'Новый Рекорд!',
        'gameOver.tryAgain': 'Попробовать Снова',
        'gameOver.mainMenu': 'Главное Меню',
        
        // Settings
        'settings.title': 'Настройки',
        'settings.language': 'Язык',
        'settings.volume': 'Громкость',
        'settings.masterVolume': 'Общая Громкость',
        'settings.musicVolume': 'Громкость Музыки',
        'settings.effectsVolume': 'Громкость Эффектов',
        'settings.graphics': 'Графика',
        'settings.particles': 'Эффекты Частиц',
        'settings.screenShake': 'Тряска Экрана',
        'settings.backgroundEffects': 'Фоновые Эффекты',
        'settings.gameplay': 'Геймплей',
        'settings.showFPS': 'Показать FPS',
        'settings.pauseOnFocusLoss': 'Пауза при Потере Фокуса',
        'settings.back': 'Назад',
        'settings.reset': 'Сбросить',
        
        // Player Name
        'playerName.title': 'Введите Ваше Имя',
        'playerName.placeholder': 'Ваше имя...',
        'playerName.required': 'Имя требуется для начала',
        'playerName.save': 'Сохранить Имя',
        
        // Leaderboard
        'leaderboard.title': 'Живая Панель',
        'leaderboard.topPlayers': '🏆 Лучшие Игроки',
        'leaderboard.topCountries': '🌍 Лучшие Страны',
        'leaderboard.myStats': '📊 Моя Статистика',
        'leaderboard.back': 'Вернуться в Меню',
        
        // Events
        'event.asteroidShower': '⚠️ ДОЖДЬ АСТЕРОИДОВ! ⚠️',
        'event.missileIncoming': '⚠️ РАКЕТЫ ПРИБЛИЖАЮТСЯ! ⚠️',
        'event.laserGrid': 'Лазерная Сетка!',
        'event.blackHoleChain': 'Цепь Чёрных Дыр!',
        'event.crystalStorm': 'Космическая Кристальная Буря!',
        'event.plasmaInferno': '⚠️ ПЛАЗМЕННЫЙ АД! ⚠️'
      },

      ar: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'تحرك لتسجيل النقاط. تجنب الكويكبات والثقوب السوداء والصواريخ. اصمد أطول فترة ممكنة!',
        'menu.startBattle': 'ابدأ المعركة',
        'menu.leaderboard': 'لوحة المتصدرين',
        'menu.howToPlay': 'كيفية اللعب',
        'menu.settings': 'الإعدادات',
        
        // Game Over
        'gameOver.title': 'انتهت اللعبة',
        'gameOver.yourScore': 'نقاطك: {score}',
        'gameOver.survivalTime': 'وقت البقاء: {time}',
        'gameOver.newHighScore': 'رقم قياسي جديد!',
        'gameOver.tryAgain': 'حاول مرة أخرى',
        'gameOver.mainMenu': 'القائمة الرئيسية',
        
        // Settings
        'settings.title': 'الإعدادات',
        'settings.language': 'اللغة',
        'settings.volume': 'مستوى الصوت',
        'settings.masterVolume': 'الصوت الرئيسي',
        'settings.musicVolume': 'صوت الموسيقى',
        'settings.effectsVolume': 'صوت التأثيرات',
        'settings.graphics': 'الرسوميات',
        'settings.particles': 'تأثيرات الجسيمات',
        'settings.screenShake': 'اهتزاز الشاشة',
        'settings.backgroundEffects': 'تأثيرات الخلفية',
        'settings.gameplay': 'طريقة اللعب',
        'settings.showFPS': 'إظهار FPS',
        'settings.pauseOnFocusLoss': 'إيقاف عند فقدان التركيز',
        'settings.back': 'رجوع',
        'settings.reset': 'إعادة تعيين',
        
        // Player Name
        'playerName.title': 'أدخل اسمك',
        'playerName.placeholder': 'اسمك...',
        'playerName.required': 'الاسم مطلوب لبدء المعركة',
        'playerName.save': 'حفظ الاسم',
        
        // Leaderboard
        'leaderboard.title': 'لوحة التحكم المباشرة',
        'leaderboard.topPlayers': '🏆 أفضل اللاعبين',
        'leaderboard.topCountries': '🌍 أفضل البلدان',
        'leaderboard.myStats': '📊 إحصائياتي',
        'leaderboard.back': 'العودة للقائمة',
        
        // Events
        'event.asteroidShower': '⚠️ مطر الكويكبات! ⚠️',
        'event.missileIncoming': '⚠️ صواريخ قادمة! ⚠️',
        'event.laserGrid': 'شبكة الليزر!',
        'event.blackHoleChain': 'سلسلة الثقوب السوداء!',
        'event.crystalStorm': 'عاصفة البلورات الكونية!',
        'event.plasmaInferno': '⚠️ جحيم البلازما! ⚠️'
      },

      hi: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'अंक पाने के लिए हिलें। क्षुद्रग्रहों, ब्लैक होल और मिसाइलों से बचें। जितनी देर हो सके जीवित रहें!',
        'menu.startBattle': 'युद्ध शुरू करें',
        'menu.leaderboard': 'लीडरबोर्ड',
        'menu.howToPlay': 'कैसे खेलें',
        'menu.settings': 'सेटिंग्स',
        
        // Game Over
        'gameOver.title': 'गेम समाप्त',
        'gameOver.yourScore': 'आपका स्कोर: {score}',
        'gameOver.survivalTime': 'जीवित रहने का समय: {time}',
        'gameOver.newHighScore': 'नया हाई स्कोर!',
        'gameOver.tryAgain': 'फिर कोशिश करें',
        'gameOver.mainMenu': 'मुख्य मेनू',
        
        // Settings
        'settings.title': 'सेटिंग्स',
        'settings.language': 'भाषा',
        'settings.volume': 'आवाज़',
        'settings.masterVolume': 'मुख्य आवाज़',
        'settings.musicVolume': 'संगीत आवाज़',
        'settings.effectsVolume': 'प्रभाव आवाज़',
        'settings.graphics': 'ग्राफिक्स',
        'settings.particles': 'कण प्रभाव',
        'settings.screenShake': 'स्क्रीन हिलना',
        'settings.backgroundEffects': 'पृष्ठभूमि प्रभाव',
        'settings.gameplay': 'गेमप्ले',
        'settings.showFPS': 'FPS दिखाएं',
        'settings.pauseOnFocusLoss': 'फोकस खोने पर रोकें',
        'settings.back': 'वापस',
        'settings.reset': 'रीसेट करें',
        
        // Events
        'event.asteroidShower': '⚠️ क्षुद्रग्रह वर्षा! ⚠️',
        'event.missileIncoming': '⚠️ मिसाइलें आ रही हैं! ⚠️',
        'event.laserGrid': 'लेजर ग्रिड!',
        'event.blackHoleChain': 'ब्लैक होल चेन!',
        'event.crystalStorm': 'कॉस्मिक क्रिस्टल स्टॉर्म!',
        'event.plasmaInferno': '⚠️ प्लाज्मा नरक! ⚠️'
      },

      pt: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Mova-se para ganhar pontos. Evite asteroides, buracos negros e mísseis. Sobreviva o máximo possível!',
        'menu.startBattle': 'Iniciar Batalha',
        'menu.leaderboard': 'Classificação',
        'menu.howToPlay': 'Como Jogar',
        'menu.settings': 'Configurações',
        
        // Game Over
        'gameOver.title': 'Jogo Terminado',
        'gameOver.yourScore': 'Sua pontuação: {score}',
        'gameOver.survivalTime': 'Tempo de sobrevivência: {time}',
        'gameOver.newHighScore': 'Nova Pontuação Máxima!',
        'gameOver.tryAgain': 'Tentar Novamente',
        'gameOver.mainMenu': 'Menu Principal',
        
        // Settings
        'settings.title': 'Configurações',
        'settings.language': 'Idioma',
        'settings.volume': 'Volume',
        'settings.masterVolume': 'Volume Principal',
        'settings.musicVolume': 'Volume da Música',
        'settings.effectsVolume': 'Volume dos Efeitos',
        'settings.graphics': 'Gráficos',
        'settings.particles': 'Efeitos de Partículas',
        'settings.screenShake': 'Tremor da Tela',
        'settings.backgroundEffects': 'Efeitos de Fundo',
        'settings.gameplay': 'Jogabilidade',
        'settings.showFPS': 'Mostrar FPS',
        'settings.pauseOnFocusLoss': 'Pausar ao Perder Foco',
        'settings.back': 'Voltar',
        'settings.reset': 'Restaurar Padrão',
        
        // Events
        'event.asteroidShower': '⚠️ CHUVA DE ASTEROIDES! ⚠️',
        'event.missileIncoming': '⚠️ MÍSSEIS SE APROXIMANDO! ⚠️',
        'event.laserGrid': 'Grade de Laser!',
        'event.blackHoleChain': 'Corrente de Buracos Negros!',
        'event.crystalStorm': 'Tempestade de Cristais Cósmicos!',
        'event.plasmaInferno': '⚠️ INFERNO DE PLASMA! ⚠️'
      },

      it: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Muoviti per segnare punti. Evita asteroidi, buchi neri e missili. Sopravvivi il più a lungo possibile!',
        'menu.startBattle': 'Inizia Battaglia',
        'menu.leaderboard': 'Classifica',
        'menu.howToPlay': 'Come Giocare',
        'menu.settings': 'Impostazioni',
        
        // Game Over
        'gameOver.title': 'Gioco Finito',
        'gameOver.yourScore': 'Il tuo punteggio: {score}',
        'gameOver.survivalTime': 'Tempo di sopravvivenza: {time}',
        'gameOver.newHighScore': 'Nuovo Record!',
        'gameOver.tryAgain': 'Riprova',
        'gameOver.mainMenu': 'Menu Principale',
        
        // Settings
        'settings.title': 'Impostazioni',
        'settings.language': 'Lingua',
        'settings.volume': 'Volume',
        'settings.masterVolume': 'Volume Principale',
        'settings.musicVolume': 'Volume Musica',
        'settings.effectsVolume': 'Volume Effetti',
        'settings.graphics': 'Grafica',
        'settings.particles': 'Effetti Particelle',
        'settings.screenShake': 'Tremolio Schermo',
        'settings.backgroundEffects': 'Effetti Sfondo',
        'settings.gameplay': 'Gameplay',
        'settings.showFPS': 'Mostra FPS',
        'settings.pauseOnFocusLoss': 'Pausa se Perdi Focus',
        'settings.back': 'Indietro',
        'settings.reset': 'Ripristina',
        
        // Events
        'event.asteroidShower': '⚠️ PIOGGIA DI ASTEROIDI! ⚠️',
        'event.missileIncoming': '⚠️ MISSILI IN ARRIVO! ⚠️',
        'event.laserGrid': 'Griglia Laser!',
        'event.blackHoleChain': 'Catena di Buchi Neri!',
        'event.crystalStorm': 'Tempesta di Cristalli Cosmici!',
        'event.plasmaInferno': '⚠️ INFERNO DI PLASMA! ⚠️'
      },

      nl: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Beweeg om punten te scoren. Vermijd asteroïden, zwarte gaten en raketten. Overleef zo lang mogelijk!',
        'menu.startBattle': 'Start Gevecht',
        'menu.leaderboard': 'Ranglijst',
        'menu.howToPlay': 'Hoe Te Spelen',
        'menu.settings': 'Instellingen',
        
        // Game Over
        'gameOver.title': 'Spel Voorbij',
        'gameOver.yourScore': 'Jouw score: {score}',
        'gameOver.survivalTime': 'Overlevingstijd: {time}',
        'gameOver.newHighScore': 'Nieuwe Topscore!',
        'gameOver.tryAgain': 'Opnieuw Proberen',
        'gameOver.mainMenu': 'Hoofdmenu',
        
        // Settings
        'settings.title': 'Instellingen',
        'settings.language': 'Taal',
        'settings.volume': 'Volume',
        'settings.masterVolume': 'Hoofdvolume',
        'settings.musicVolume': 'Muziekvolume',
        'settings.effectsVolume': 'Effectenvolume',
        'settings.graphics': 'Grafisch',
        'settings.particles': 'Deeltjeseffecten',
        'settings.screenShake': 'Schermschudden',
        'settings.backgroundEffects': 'Achtergrondeffecten',
        'settings.gameplay': 'Gameplay',
        'settings.showFPS': 'Toon FPS',
        'settings.pauseOnFocusLoss': 'Pauzeer bij Focusverlies',
        'settings.back': 'Terug',
        'settings.reset': 'Herstellen',
        
        // Events
        'event.asteroidShower': '⚠️ ASTEROÏDENREGEN! ⚠️',
        'event.missileIncoming': '⚠️ RAKETTEN NADEREN! ⚠️',
        'event.laserGrid': 'Laserrooster!',
        'event.blackHoleChain': 'Zwarte Gaten Ketting!',
        'event.crystalStorm': 'Kosmische Kristalstorm!',
        'event.plasmaInferno': '⚠️ PLASMA INFERNO! ⚠️'
      },

      sv: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Rör dig för att få poäng. Undvik asteroider, svarta hål och missiler. Överlev så länge som möjligt!',
        'menu.startBattle': 'Starta Strid',
        'menu.leaderboard': 'Topplista',
        'menu.howToPlay': 'Hur Man Spelar',
        'menu.settings': 'Inställningar',
        
        // Game Over
        'gameOver.title': 'Spel Slut',
        'gameOver.yourScore': 'Din poäng: {score}',
        'gameOver.survivalTime': 'Överlevnadstid: {time}',
        'gameOver.newHighScore': 'Nytt Rekord!',
        'gameOver.tryAgain': 'Försök Igen',
        'gameOver.mainMenu': 'Huvudmeny',
        
        // Settings
        'settings.title': 'Inställningar',
        'settings.language': 'Språk',
        'settings.volume': 'Volym',
        'settings.masterVolume': 'Huvudvolym',
        'settings.musicVolume': 'Musikvolym',
        'settings.effectsVolume': 'Effektvolym',
        'settings.graphics': 'Grafik',
        'settings.particles': 'Partikeleffekter',
        'settings.screenShake': 'Skärmskakning',
        'settings.backgroundEffects': 'Bakgrundseffekter',
        'settings.gameplay': 'Spelupplevelse',
        'settings.showFPS': 'Visa FPS',
        'settings.pauseOnFocusLoss': 'Pausa vid Fokusförlust',
        'settings.back': 'Tillbaka',
        'settings.reset': 'Återställ',
        
        // Events
        'event.asteroidShower': '⚠️ ASTEROIDREGN! ⚠️',
        'event.missileIncoming': '⚠️ MISSILER NÄRMAR SIG! ⚠️',
        'event.laserGrid': 'Laserrutnät!',
        'event.blackHoleChain': 'Svarta Håls Kedja!',
        'event.crystalStorm': 'Kosmisk Kristallstorm!',
        'event.plasmaInferno': '⚠️ PLASMA INFERNO! ⚠️'
      },

      tr: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Puan kazanmak için hareket et. Asteroidlerden, kara deliklerden ve füzelerden kaçın. Mümkün olduğunca uzun süre hayatta kalın!',
        'menu.startBattle': 'Savaşı Başlat',
        'menu.leaderboard': 'Lider Tablosu',
        'menu.howToPlay': 'Nasıl Oynanır',
        'menu.settings': 'Ayarlar',
        
        // Game Over
        'gameOver.title': 'Oyun Bitti',
        'gameOver.yourScore': 'Puanınız: {score}',
        'gameOver.survivalTime': 'Hayatta kalma süresi: {time}',
        'gameOver.newHighScore': 'Yeni Rekor!',
        'gameOver.tryAgain': 'Tekrar Dene',
        'gameOver.mainMenu': 'Ana Menü',
        
        // Settings
        'settings.title': 'Ayarlar',
        'settings.language': 'Dil',
        'settings.volume': 'Ses',
        'settings.masterVolume': 'Ana Ses',
        'settings.musicVolume': 'Müzik Sesi',
        'settings.effectsVolume': 'Efekt Sesi',
        'settings.graphics': 'Grafik',
        'settings.particles': 'Parçacık Efektleri',
        'settings.screenShake': 'Ekran Sarsıntısı',
        'settings.backgroundEffects': 'Arka Plan Efektleri',
        'settings.gameplay': 'Oynanış',
        'settings.showFPS': 'FPS Göster',
        'settings.pauseOnFocusLoss': 'Odak Kaybında Duraklat',
        'settings.back': 'Geri',
        'settings.reset': 'Sıfırla',
        
        // Events
        'event.asteroidShower': '⚠️ ASTEROİD YAĞMURU! ⚠️',
        'event.missileIncoming': '⚠️ FÜZELER GELİYOR! ⚠️',
        'event.laserGrid': 'Lazer Ağı!',
        'event.blackHoleChain': 'Kara Delik Zinciri!',
        'event.crystalStorm': 'Kozmik Kristal Fırtınası!',
        'event.plasmaInferno': '⚠️ PLAZMA CEHENNEMİ! ⚠️'
      },

      pl: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Poruszaj się, aby zdobywać punkty. Unikaj asteroid, czarnych dziur i pocisków. Przetrwaj jak najdłużej!',
        'menu.startBattle': 'Rozpocznij Bitwę',
        'menu.leaderboard': 'Ranking',
        'menu.howToPlay': 'Jak Grać',
        'menu.settings': 'Ustawienia',
        
        // Game Over
        'gameOver.title': 'Koniec Gry',
        'gameOver.yourScore': 'Twój wynik: {score}',
        'gameOver.survivalTime': 'Czas przetrwania: {time}',
        'gameOver.newHighScore': 'Nowy Rekord!',
        'gameOver.tryAgain': 'Spróbuj Ponownie',
        'gameOver.mainMenu': 'Menu Główne',
        
        // Settings
        'settings.title': 'Ustawienia',
        'settings.language': 'Język',
        'settings.volume': 'Głośność',
        'settings.masterVolume': 'Głośność Główna',
        'settings.musicVolume': 'Głośność Muzyki',
        'settings.effectsVolume': 'Głośność Efektów',
        'settings.graphics': 'Grafika',
        'settings.particles': 'Efekty Cząsteczek',
        'settings.screenShake': 'Trzęsienie Ekranu',
        'settings.backgroundEffects': 'Efekty Tła',
        'settings.gameplay': 'Rozgrywka',
        'settings.showFPS': 'Pokaż FPS',
        'settings.pauseOnFocusLoss': 'Pauzuj przy Utracie Fokusa',
        'settings.back': 'Wstecz',
        'settings.reset': 'Resetuj',
        
        // Events
        'event.asteroidShower': '⚠️ DESZCZ ASTEROID! ⚠️',
        'event.missileIncoming': '⚠️ NADLATUJĄ POCISKI! ⚠️',
        'event.laserGrid': 'Siatka Laserowa!',
        'event.blackHoleChain': 'Łańcuch Czarnych Dziur!',
        'event.crystalStorm': 'Kosmiczna Burza Kryształów!',
        'event.plasmaInferno': '⚠️ PIEKŁO PLAZMY! ⚠️'
      },

      th: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'เคลื่อนที่เพื่อทำคะแนน หลีกเลี่ยงดาวเคราะห์น้อย หลุมดำ และขีปนาวุธ อยู่รอดให้นานที่สุด!',
        'menu.startBattle': 'เริ่มการต่อสู้',
        'menu.leaderboard': 'กระดานผู้นำ',
        'menu.howToPlay': 'วิธีเล่น',
        'menu.settings': 'การตั้งค่า',
        
        // Game Over
        'gameOver.title': 'เกมจบ',
        'gameOver.yourScore': 'คะแนนของคุณ: {score}',
        'gameOver.survivalTime': 'เวลาที่อยู่รอด: {time}',
        'gameOver.newHighScore': 'คะแนนสูงสุดใหม่!',
        'gameOver.tryAgain': 'ลองอีกครั้ง',
        'gameOver.mainMenu': 'เมนูหลัก',
        
        // Settings
        'settings.title': 'การตั้งค่า',
        'settings.language': 'ภาษา',
        'settings.volume': 'เสียง',
        'settings.masterVolume': 'เสียงหลัก',
        'settings.musicVolume': 'เสียงเพลง',
        'settings.effectsVolume': 'เสียงเอฟเฟกต์',
        'settings.graphics': 'กราฟิก',
        'settings.particles': 'เอฟเฟกต์อนุภาค',
        'settings.screenShake': 'การสั่นหน้าจอ',
        'settings.backgroundEffects': 'เอฟเฟกต์พื้นหลัง',
        'settings.gameplay': 'การเล่นเกม',
        'settings.showFPS': 'แสดง FPS',
        'settings.pauseOnFocusLoss': 'หยุดชั่วคราวเมื่อเสียโฟกัส',
        'settings.back': 'กลับ',
        'settings.reset': 'รีเซ็ต',
        
        // Events
        'event.asteroidShower': '⚠️ ฝนดาวเคราะห์น้อย! ⚠️',
        'event.missileIncoming': '⚠️ ขีปนาวุธกำลังมา! ⚠️',
        'event.laserGrid': 'ตาข่ายเลเซอร์!',
        'event.blackHoleChain': 'โซ่หลุมดำ!',
        'event.crystalStorm': 'พายุคริสตัลจักรวาล!',
        'event.plasmaInferno': '⚠️ นรกพลาสมา! ⚠️'
      },

      id: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Bergerak untuk mencetak poin. Hindari asteroid, lubang hitam, dan rudal. Bertahan selama mungkin!',
        'menu.startBattle': 'Mulai Pertempuran',
        'menu.leaderboard': 'Papan Peringkat',
        'menu.howToPlay': 'Cara Bermain',
        'menu.settings': 'Pengaturan',
        
        // Game Over
        'gameOver.title': 'Permainan Berakhir',
        'gameOver.yourScore': 'Skor Anda: {score}',
        'gameOver.survivalTime': 'Waktu bertahan: {time}',
        'gameOver.newHighScore': 'Skor Tertinggi Baru!',
        'gameOver.tryAgain': 'Coba Lagi',
        'gameOver.mainMenu': 'Menu Utama',
        
        // Settings
        'settings.title': 'Pengaturan',
        'settings.language': 'Bahasa',
        'settings.volume': 'Volume',
        'settings.masterVolume': 'Volume Utama',
        'settings.musicVolume': 'Volume Musik',
        'settings.effectsVolume': 'Volume Efek',
        'settings.graphics': 'Grafik',
        'settings.particles': 'Efek Partikel',
        'settings.screenShake': 'Guncangan Layar',
        'settings.backgroundEffects': 'Efek Latar Belakang',
        'settings.gameplay': 'Gameplay',
        'settings.showFPS': 'Tampilkan FPS',
        'settings.pauseOnFocusLoss': 'Jeda saat Kehilangan Fokus',
        'settings.back': 'Kembali',
        'settings.reset': 'Reset',
        
        // Events
        'event.asteroidShower': '⚠️ HUJAN ASTEROID! ⚠️',
        'event.missileIncoming': '⚠️ RUDAL MENDEKAT! ⚠️',
        'event.laserGrid': 'Kisi Laser!',
        'event.blackHoleChain': 'Rantai Lubang Hitam!',
        'event.crystalStorm': 'Badai Kristal Kosmik!',
        'event.plasmaInferno': '⚠️ NERAKA PLASMA! ⚠️'
      },

      ms: {
        // Menu
        'menu.title': 'Stellar Drift',
        'menu.subtitle': 'SINGULARITY',
        'menu.description': 'Bergerak untuk mendapat mata. Elakkan asteroid, lubang hitam dan peluru berpandu. Bertahan selama mungkin!',
        'menu.startBattle': 'Mula Pertempuran',
        'menu.leaderboard': 'Papan Pendahulu',
        'menu.howToPlay': 'Cara Bermain',
        'menu.settings': 'Tetapan',
        
        // Game Over
        'gameOver.title': 'Permainan Tamat',
        'gameOver.yourScore': 'Mata anda: {score}',
        'gameOver.survivalTime': 'Masa bertahan: {time}',
        'gameOver.newHighScore': 'Mata Tertinggi Baharu!',
        'gameOver.tryAgain': 'Cuba Lagi',
        'gameOver.mainMenu': 'Menu Utama',
        
        // Settings
        'settings.title': 'Tetapan',
        'settings.language': 'Bahasa',
        'settings.volume': 'Kelantangan',
        'settings.masterVolume': 'Kelantangan Utama',
        'settings.musicVolume': 'Kelantangan Muzik',
        'settings.effectsVolume': 'Kelantangan Kesan',
        'settings.graphics': 'Grafik',
        'settings.particles': 'Kesan Zarah',
        'settings.screenShake': 'Goncangan Skrin',
        'settings.backgroundEffects': 'Kesan Latar Belakang',
        'settings.gameplay': 'Permainan',
        'settings.showFPS': 'Tunjuk FPS',
        'settings.pauseOnFocusLoss': 'Jeda bila Hilang Fokus',
        'settings.back': 'Kembali',
        'settings.reset': 'Set Semula',
        
        // Events
        'event.asteroidShower': '⚠️ HUJAN ASTEROID! ⚠️',
        'event.missileIncoming': '⚠️ PELURU BERPANDU MENGHAMPIRI! ⚠️',
        'event.laserGrid': 'Grid Laser!',
        'event.blackHoleChain': 'Rantai Lubang Hitam!',
        'event.crystalStorm': 'Ribut Kristal Kosmik!',
        'event.plasmaInferno': '⚠️ NERAKA PLASMA! ⚠️'
      }
    };
  }

  /**
   * Get translation for a key
   */
  t(key, params = {}) {
    const lang = this.settings.language;
    const translation = this.translations[lang] && this.translations[lang][key] 
      ? this.translations[lang][key] 
      : this.translations['en'][key] || key;
    
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
      console.log('Language changed to:', langCode);
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
    if (this.settings[category] && this.settings[category][setting] !== undefined) {
      this.settings[category][setting] = !this.settings[category][setting];
      this.saveSettings();
      this.applySettings();
      console.log(`${category}.${setting} toggled to:`, this.settings[category][setting]);
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
    if (window.AudioSystem) {
      window.AudioSystem.setMasterVolume(this.settings.volume.master);
    }
    
    if (window.MusicSystem) {
      window.MusicSystem.setVolume(this.settings.volume.music);
    }
    
    // Apply effects volume to sound effects
    if (window.SoundEffects) {
      window.SoundEffects.setVolume(this.settings.volume.effects);
    }
  }

  /**
   * Apply graphics settings
   */
  applyGraphicsSettings() {
    // These would be used by the game engine
    if (window.GAME_CONFIG) {
      window.GAME_CONFIG.graphics = { ...window.GAME_CONFIG.graphics, ...this.settings.graphics };
    }
  }

  /**
   * Update UI with current language
   */
  updateUI() {
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      element.textContent = this.t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
      const key = element.getAttribute('data-translate-placeholder');
      element.placeholder = this.t(key);
    });
  }

  /**
   * Reset to default settings
   */
  resetToDefaults() {
    this.settings = {
      language: 'en',
      volume: {
        master: 0.7,
        music: 0.5,
        effects: 0.8
      },
      graphics: {
        particles: true,
        screenShake: true,
        backgroundEffects: true
      },
      gameplay: {
        showFPS: false,
        pauseOnFocusLoss: true
      }
    };
    
    this.saveSettings();
    this.applySettings();
    
    // Update settings UI if open
    if (window.updateSettingsUI) {
      window.updateSettingsUI();
    }
    
    console.log('Settings reset to defaults');
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