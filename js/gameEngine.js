// =============================================================================
// STELLAR DRIFT: SINGULARITY - MAIN GAME ENGINE
// =============================================================================

class GameEngine {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audioSystem = new AudioSystem();

    // Make context globally available for classes
    window.ctx = this.ctx;
    window.width = 0;
    window.height = 0;
    window.mouse = { x: 0, y: 0 };

    // Game state
    this.isGameRunning = false;
    this.score = 0;
    this.gameStartTime = 0;
    this.survivalTime = 0;
    this.animationFrameId = null;

    // Game objects
    this.player = null;
    this.asteroids = [];
    this.particles = [];
    this.lasers = [];
    this.blackHoles = [];
    this.missiles = [];
    this.laserMines = [];
    this.crystalClusters = [];
    this.fragments = [];
    this.warnings = [];
    this.stars = [];
    this.nebulae = [];

    // Game mechanics
    this.timers = {
      asteroid: 0,
      difficulty: 0,
      laser: 0,
      blackHole: 0,
      missile: 0,
      mine: 0,
      crystal: 0,
    };

    this.spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval;
    this.globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed;
    this.nextEventScore = GAME_CONFIG.events.interval;
    this.eventActive = { type: null, endTime: 0 };
    this.prevMouse = { x: 0, y: 0 };

    // UI elements
    this.uiElements = {
      startScreen: document.getElementById("start-screen"),
      gameOverScreen: document.getElementById("game-over-screen"),
      scoreContainer: document.getElementById("score-container"),
      scoreDisplay: document.getElementById("score-display"),
      highscoreDisplay: document.getElementById("highscore-display"),
      survivalDisplay: document.getElementById("survival-display"),
      finalScoreEl: document.getElementById("final-score"),
      finalTimeEl: document.getElementById("final-time"),
      newHighscoreMsg: document.getElementById("new-highscore-msg"),
      eventText: document.getElementById("event-text"),
    };

    this.setupEventListeners();
    this.init();
  }

  setupEventListeners() {
    // Mouse/Touch controls
    const updateMousePosition = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      window.mouse.x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      window.mouse.y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
    };

    this.canvas.addEventListener("mousemove", updateMousePosition);
    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        updateMousePosition(e);
      },
      { passive: false }
    );

    // Click to start/restart
    this.canvas.addEventListener("click", () => {
      if (!this.isGameRunning) {
        this.audioSystem.init();
      }
    });

    // Button events
    document.getElementById("start-button").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("restart-button").addEventListener("click", () => {
      this.startGame();
    });

    // Resize handler
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });

    // Audio button hover effects
    document.querySelectorAll(".button").forEach((button) => {
      button.addEventListener("mouseenter", () => {
        this.audioSystem.playSound("buttonHover");
      });
    });
  }

  resizeCanvas() {
    window.width = this.canvas.width = window.innerWidth;
    window.height = this.canvas.height = window.innerHeight;
    window.mouse = { x: window.width / 2, y: window.height * 0.8 };
  }

  init() {
    this.resizeCanvas();

    // Initialize game state
    this.isGameRunning = false;
    this.score = 0;
    this.gameStartTime = Date.now();
    this.survivalTime = 0;
    this.spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval;
    this.globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed;
    this.nextEventScore = GAME_CONFIG.events.interval;
    this.eventActive = { type: null, endTime: 0 };
    this.prevMouse = { ...window.mouse };

    // Reset timers
    this.timers = {
      asteroid: 0,
      difficulty: 0,
      laser: 0,
      blackHole: 0,
      missile: 0,
      mine: 0,
      crystal: 0,
    };

    // Clear arrays
    this.asteroids = [];
    this.particles = [];
    this.lasers = [];
    this.blackHoles = [];
    this.missiles = [];
    this.laserMines = [];
    this.crystalClusters = [];
    this.fragments = [];
    this.warnings = [];

    // Create player
    this.player = new Player(
      window.width / 2,
      window.height * 0.8,
      GAME_CONFIG.player.radius,
      "#00ffff"
    );

    // Create stars background
    this.createStars();

    // Create nebula background
    this.nebulae = Array(GAME_CONFIG.visual.nebula.count)
      .fill(null)
      .map(() => GameUtils.createNebula());

    // Load high score
    const highScore = GameUtils.getHighScore();
    this.uiElements.highscoreDisplay.innerText = `High Score: ${GameUtils.formatScore(
      highScore
    )}`;
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < GAME_CONFIG.visual.stars.layers; i++) {
      const layer = (i + 1) / GAME_CONFIG.visual.stars.layers;
      for (let j = 0; j < GAME_CONFIG.visual.stars.starsPerLayer; j++) {
        this.stars.push(
          new Star(
            Math.random() * window.width,
            Math.random() * window.height,
            Math.random() * GAME_CONFIG.visual.stars.maxRadius * layer,
            layer
          )
        );
      }
    }
  }

  startGame() {
    this.init();
    this.isGameRunning = true;
    window.isGameRunning = true;
    this.gameStartTime = Date.now();

    // Hide UI screens
    this.uiElements.startScreen.style.display = "none";
    this.uiElements.gameOverScreen.style.display = "none";
    this.uiElements.scoreContainer.style.display = "block";

    // Start background music
    this.audioSystem.playSound("backgroundMusic");

    // Start game loop
    this.gameLoop();
  }

  endGame(reason = "unknown") {
    console.log(`Game ended: ${reason}`);
    this.isGameRunning = false;
    window.isGameRunning = false;

    // Stop animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Stop background music
    this.audioSystem.stopBackgroundMusic();

    // Calculate final stats
    const finalScore = Math.floor(this.score);
    const finalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);

    // Check for new high score
    const isNewHighScore = GameUtils.saveHighScore(finalScore);

    // Update UI
    this.uiElements.finalScoreEl.innerText = GameUtils.formatScore(finalScore);
    this.uiElements.finalTimeEl.innerText = GameUtils.formatTime(finalTime);
    this.uiElements.newHighscoreMsg.style.display = isNewHighScore
      ? "block"
      : "none";
    this.uiElements.highscoreDisplay.innerText = `High Score: ${GameUtils.formatScore(
      GameUtils.getHighScore()
    )}`;

    // Show game over screen
    this.uiElements.scoreContainer.style.display = "none";
    this.uiElements.gameOverScreen.style.display = "flex";

    // Play explosion sound
    this.audioSystem.playSound("explosion");
    GameUtils.triggerScreenShake(
      GAME_CONFIG.visual.screenShake.explosionIntensity
    );
  }

  gameLoop() {
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());

    // Clear and draw background
    this.ctx.fillStyle = "#050510";
    this.ctx.fillRect(0, 0, window.width, window.height);

    // Draw nebulae
    this.nebulae.forEach((n) => {
      this.ctx.fillStyle = n;
      this.ctx.fillRect(0, 0, window.width, window.height);
    });

    // Draw stars
    this.stars.sort((a, b) => a.layer - b.layer).forEach((s) => s.update());

    if (!this.isGameRunning) {
      // Continue particle animations even when game is over
      this.particles.forEach((p, i) =>
        p.alpha <= 0 ? this.particles.splice(i, 1) : p.update()
      );
      return;
    }

    // Update game logic
    this.updateGameState();
    this.updateGameObjects();
    this.handleCollisions();
    this.updateDifficulty();
    this.handleEvents();
    this.spawnObjects();

    // Update player last to draw on top
    this.player.update();
  }

  updateGameState() {
    this.timers.difficulty++;

    // Update survival time
    this.survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    this.uiElements.survivalDisplay.innerText = `Time: ${GameUtils.formatTime(
      this.survivalTime
    )}`;

    // Update score based on movement
    const distMoved = Math.hypot(
      window.mouse.x - (this.prevMouse?.x || window.mouse.x),
      window.mouse.y - (this.prevMouse?.y || window.mouse.y)
    );

    // Dynamic movement threshold - giảm dần theo level
    const currentLevel =
      Math.floor(this.score / GAME_CONFIG.difficulty.levelUpInterval) + 1;
    const dynamicThreshold = Math.max(
      GAME_CONFIG.scoring.minMovementThreshold,
      GAME_CONFIG.scoring.baseMovementThreshold *
        Math.pow(GAME_CONFIG.scoring.thresholdDecreaseRate, currentLevel)
    );

    // Chỉ tăng điểm khi di chuyển đủ xa (threshold giảm dần theo level)
    if (distMoved >= dynamicThreshold) {
      this.score += distMoved * GAME_CONFIG.scoring.movementMultiplier;
    }

    this.prevMouse = { ...window.mouse };
    this.uiElements.scoreDisplay.innerText = `Score: ${GameUtils.formatScore(
      this.score
    )}`;
  }

  updateGameObjects() {
    // Update all game objects
    [
      this.particles,
      this.lasers,
      this.blackHoles,
      this.missiles,
      this.laserMines,
      this.asteroids,
      this.crystalClusters,
      this.fragments,
      this.warnings,
    ].forEach((arr) =>
      arr.forEach((item) => (item && item.update ? item.update() : undefined))
    );

    // Filter dead entities
    this.missiles = this.missiles.filter((m) => !m.isDead);
    this.fragments = this.fragments.filter(
      (f) => f.life > 0 && f.y < window.height + 50
    );
    this.asteroids = this.asteroids.filter(
      (a) =>
        a.x > -50 &&
        a.x < window.width + 50 &&
        a.y > -50 &&
        a.y < window.height + 50
    );
    this.blackHoles = this.blackHoles.filter((bh) => bh.alpha > 0);
    this.crystalClusters = this.crystalClusters.filter((cc) => cc.alpha > 0);
    this.warnings = this.warnings.filter((w) => w.timer < w.duration);
    this.lasers = this.lasers.filter(
      (l) => l.timer < l.maxTime + GAME_CONFIG.lasers.beamDuration
    );
  }

  handleCollisions() {
    if (!this.player) return;

    // Player vs Asteroids
    this.asteroids.forEach((asteroid, i) => {
      if (asteroid && GameUtils.checkCollision(this.player, asteroid)) {
        this.endGame("asteroid");
      }
    });

    // Player vs Missiles
    this.missiles.forEach((missile, i) => {
      if (missile && GameUtils.checkCollision(this.player, missile)) {
        this.endGame("missile");
      }
    });

    // Player vs BlackHoles
    if (this.player) {
      this.blackHoles.forEach((bh, i) => {
        if (bh && bh.x !== undefined) {
          const dist = Math.hypot(this.player.x - bh.x, this.player.y - bh.y);
          if (dist < bh.eventHorizon) {
            this.endGame("blackhole");
          }
        }
      });
    }

    // Player vs Lethal Fragments
    this.fragments.forEach((fragment, i) => {
      if (
        fragment &&
        fragment.lethal &&
        GameUtils.checkCollision(this.player, fragment)
      ) {
        this.endGame("fragment");
      }
    });

    // Player vs Lasers
    this.lasers.forEach((laser, i) => {
      if (laser && GameUtils.checkLaserCollision(this.player, laser)) {
        this.endGame("laser");
      }
    });

    // Player vs LaserMines
    this.laserMines.forEach((mine, i) => {
      if (
        mine &&
        (GameUtils.checkCollision(this.player, mine) ||
          mine.checkBeamCollision(this.player))
      ) {
        this.endGame("lasermine");
      }
    });
  }

  updateDifficulty() {
    // Increase speed gradually
    this.globalSpeedMultiplier = Math.min(
      GAME_CONFIG.difficulty.maxSpeed,
      GAME_CONFIG.difficulty.baseSpeed +
        (this.timers.difficulty / 3600) * GAME_CONFIG.difficulty.speedIncrement
    );
    window.globalSpeedMultiplier = this.globalSpeedMultiplier;

    // Decrease spawn interval
    this.spawnInterval = Math.max(
      GAME_CONFIG.difficulty.minSpawnInterval,
      GAME_CONFIG.difficulty.baseSpawnInterval - this.timers.difficulty * 0.1
    );
  }

  handleEvents() {
    // Check if event should end
    if (this.eventActive.type && Date.now() > this.eventActive.endTime) {
      this.eventActive.type = null;
      this.uiElements.eventText.innerText = "";
    }

    // Check for new events
    if (this.score >= this.nextEventScore && !this.eventActive.type) {
      this.triggerEvent();
      this.nextEventScore += GAME_CONFIG.events.interval;
    }
  }

  triggerEvent() {
    const events = GAME_CONFIG.events.types;
    const eventType = events[Math.floor(Math.random() * events.length)];

    this.eventActive = {
      type: eventType,
      endTime: Date.now() + GAME_CONFIG.events.duration,
    };

    this.uiElements.eventText.innerText =
      GAME_CONFIG.events.messages[eventType];
    this.audioSystem.playSound("eventTrigger");

    // Apply event effects
    switch (eventType) {
      case "asteroid_shower":
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this.spawnAsteroid(), i * 200);
        }
        break;
      case "blackhole_storm":
        for (let i = 0; i < 2; i++) {
          setTimeout(() => this.spawnBlackHole(), i * 1000);
        }
        break;
      case "laser_barrage":
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this.spawnLaser(), i * 800);
        }
        break;
      case "missile_crisis":
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this.spawnMissile(), i * 600);
        }
        break;
      case "mine_field":
        for (let i = 0; i < 4; i++) {
          setTimeout(() => this.spawnLaserMine(), i * 400);
        }
        break;
    }
  }

  spawnObjects() {
    // Basic asteroid spawning
    this.timers.asteroid++;
    if (this.timers.asteroid >= this.spawnInterval) {
      this.spawnAsteroid();
      this.timers.asteroid = 0;
    }

    // Laser spawning
    this.timers.laser++;
    if (this.timers.laser >= GAME_CONFIG.lasers.spawnInterval) {
      this.spawnLaser();
      this.timers.laser = 0;
    }

    // BlackHole spawning
    this.timers.blackHole++;
    if (this.timers.blackHole >= GAME_CONFIG.blackHoles.spawnInterval) {
      this.spawnBlackHole();
      this.timers.blackHole = 0;
    }

    // Missile spawning
    this.timers.missile++;
    if (this.timers.missile >= GAME_CONFIG.missiles.spawnInterval) {
      this.spawnMissile();
      this.timers.missile = 0;
    }

    // LaserMine spawning
    this.timers.mine++;
    if (this.timers.mine >= GAME_CONFIG.laserMines.spawnInterval) {
      this.spawnLaserMine();
      this.timers.mine = 0;
    }

    // CrystalCluster spawning
    this.timers.crystal++;
    if (this.timers.crystal >= GAME_CONFIG.crystalClusters.spawnInterval) {
      this.spawnCrystalCluster();
      this.timers.crystal = 0;
    }
  }

  spawnAsteroid() {
    const config = GAME_CONFIG.asteroids.spawnPatterns;
    const rand = Math.random();
    let x, y, vx, vy;

    if (rand < config.topDown) {
      // 70% - Straight down from top
      x = Math.random() * window.width;
      y = -50;
      vx = 0;
      vy = 2 + Math.random() * 3;
    } else if (rand < config.topDown + config.slightAngle) {
      // 20% - Slight angle from top
      x = Math.random() * window.width;
      y = -50;
      vx = (Math.random() - 0.5) * 2;
      vy = 2 + Math.random() * 3;
    } else {
      // 10% - Diagonal from corners
      if (Math.random() < 0.5) {
        x = -50;
        y = -50;
        vx = 1 + Math.random() * 2;
        vy = 1 + Math.random() * 2;
      } else {
        x = window.width + 50;
        y = -50;
        vx = -(1 + Math.random() * 2);
        vy = 1 + Math.random() * 2;
      }
    }

    // Generate asteroid properties
    const radius =
      GAME_CONFIG.asteroids.minRadius +
      Math.random() *
        (GAME_CONFIG.asteroids.maxRadius - GAME_CONFIG.asteroids.minRadius);
    const color = GameUtils.randomChoice(GAME_CONFIG.asteroids.colors);
    const velocity = { x: vx, y: vy };

    this.asteroids.push(new Asteroid(x, y, radius, color, velocity));
  }

  spawnLaser() {
    const side = Math.random() < 0.5 ? "left" : "right";
    const x = side === "left" ? 0 : window.width;
    const y = Math.random() * window.height;
    this.lasers.push(new Laser(x, y, side));

    // Add warning
    this.warnings.push(new Warning(x, y, "laser"));
    this.audioSystem.playSound("laserCharge");
  }

  spawnBlackHole() {
    const x = Math.random() * window.width;
    const y = Math.random() * window.height;
    this.blackHoles.push(new BlackHole(x, y));

    // Add warning
    this.warnings.push(new Warning(x, y, "blackhole"));
    this.audioSystem.playSound("blackHoleSpawn");
  }

  spawnMissile() {
    const side = Math.floor(Math.random() * 4);
    let x, y, targetX, targetY;

    switch (side) {
      case 0: // Top
        x = Math.random() * window.width;
        y = -50;
        break;
      case 1: // Right
        x = window.width + 50;
        y = Math.random() * window.height;
        break;
      case 2: // Bottom
        x = Math.random() * window.width;
        y = window.height + 50;
        break;
      case 3: // Left
        x = -50;
        y = Math.random() * window.height;
        break;
    }

    targetX = this.player ? this.player.x : window.width / 2;
    targetY = this.player ? this.player.y : window.height / 2;

    this.missiles.push(new Missile(x, y, targetX, targetY));

    // Add warning
    this.warnings.push(new Warning(x, y, "missile"));
    this.audioSystem.playSound("missileAlert");
  }

  spawnLaserMine() {
    const x = Math.random() * window.width;
    const y = Math.random() * window.height;
    this.laserMines.push(new LaserMine(x, y));
    this.audioSystem.playSound("mineArmed");
  }

  spawnCrystalCluster() {
    const x = Math.random() * window.width;
    const y = Math.random() * window.height;
    this.crystalClusters.push(new CrystalCluster(x, y));
    this.audioSystem.playSound("crystalForm");
  }

  createFragments(x, y, count = 5, type = "normal") {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };

      if (type === "missile") {
        this.fragments.push(new MissileFragment(x, y, velocity));
      } else {
        this.fragments.push(new Fragment(x, y, velocity));
      }
    }
  }
}

// Initialize game when page loads
window.addEventListener("DOMContentLoaded", () => {
  window.game = new GameEngine();
});

window.GameEngine = GameEngine;
