// =============================================================================
// GAME STATE MANAGER - Centralized state management for better organization
// =============================================================================

class GameStateManager {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.stateData = {};
    this.registerDefaultStates();
  }

  /**
   * Register a game state
   */
  registerState(name, stateClass) {
    this.states.set(name, stateClass);
  }

  /**
   * Change to a new state
   */
  changeState(stateName, data = {}) {
    if (!this.states.has(stateName)) {
      console.error(`Unknown state: ${stateName}`);
      return false;
    }

    // Exit current state
    if (this.currentState) {
      this.currentState.exit();
      this.previousState = this.currentState;
    }

    // Create and enter new state
    const StateClass = this.states.get(stateName);
    this.currentState = new StateClass(this, data);
    this.stateData = data;
    this.currentState.enter();

    return true;
  }

  /**
   * Update current state
   */
  update() {
    if (this.currentState) {
      this.currentState.update();
    }
  }

  /**
   * Render current state
   */
  render() {
    if (this.currentState) {
      this.currentState.render();
    }
  }

  /**
   * Get current state name
   */
  getCurrentStateName() {
    if (!this.currentState) return null;
    return this.currentState.constructor.name;
  }

  /**
   * Register default game states
   */
  registerDefaultStates() {
    this.registerState('menu', MenuState);
    this.registerState('playing', PlayingState);
    this.registerState('paused', PausedState);
    this.registerState('gameOver', GameOverState);
    this.registerState('leaderboard', LeaderboardState);
    this.registerState('howToPlay', HowToPlayState);
  }
}

/**
 * Base Game State class
 */
class GameState {
  constructor(manager, data = {}) {
    this.manager = manager;
    this.data = data;
  }

  enter() {
    // Override in subclasses
  }

  exit() {
    // Override in subclasses
  }

  update() {
    // Override in subclasses
  }

  render() {
    // Override in subclasses
  }
}

/**
 * Menu State
 */
class MenuState extends GameState {
  enter() {
    uiElements.startScreen.style.display = "flex";
    uiElements.gameOverScreen.style.display = "none";
    uiElements.leaderboardScreen.style.display = "none";
    uiElements.howToPlayScreen.style.display = "none";
    uiElements.pauseMenu.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;
    
    // Draw background
    this.drawBackground();
  }

  exit() {
    uiElements.startScreen.style.display = "none";
  }

  drawBackground() {
    ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw nebulae and stars
    if (nebulae && nebulae.length > 0) {
      nebulae.forEach((n) => {
        ctx.fillStyle = n;
        ctx.fillRect(0, 0, width, height);
      });
    }
    
    if (stars && stars.length > 0) {
      stars.forEach((s) => s.draw());
    }
  }
}

/**
 * Playing State
 */
class PlayingState extends GameState {
  enter() {
    uiElements.startScreen.style.display = "none";
    uiElements.gameOverScreen.style.display = "none";
    uiElements.pauseMenu.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarOpacity;
    uiElements.pauseButton.style.display = "flex";
    
    if (!isGameRunning) {
      init();
      animate();
      startBackgroundMusic();
      initAudioSystem();
    }
  }

  exit() {
    uiElements.pauseButton.style.display = "none";
  }

  update() {
    if (isGameRunning && !isPaused) {
      // Game update logic is handled in the main animate function
    }
  }
}

/**
 * Paused State
 */
class PausedState extends GameState {
  enter() {
    uiElements.pauseMenu.style.display = "flex";
    isPaused = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    pauseBackgroundMusic();
  }

  exit() {
    uiElements.pauseMenu.style.display = "none";
    isPaused = false;
    if (isGameRunning) {
      animate();
      resumeBackgroundMusic();
    }
  }
}

/**
 * Game Over State
 */
class GameOverState extends GameState {
  enter() {
    isGameRunning = false;
    uiElements.pauseButton.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;
    
    stopBackgroundMusic();
    playSound("explosion");
    
    // Create death explosion
    this.createDeathExplosion();
    
    // Send game over data to backend
    this.sendGameOverData();
    
    // Check for high score
    this.checkHighScore();
    
    // Show game over screen after delay
    setTimeout(() => {
      this.showGameOverScreen();
    }, GAME_CONFIG.ui.gameOverDelay);
  }

  createDeathExplosion() {
    triggerScreenShake(GAME_CONFIG.visual.screenShake.explosionIntensity);
    for (let i = 0; i < GAME_CONFIG.visual.particles.explosionCount * GAME_CONFIG.visual.particles.deathMultiplier; i++) {
      particles.push(
        new Particle(player.x, player.y, Math.random() * GAME_CONFIG.visual.particles.maxSize, GAME_CONFIG.visual.colors.danger, {
          x: (Math.random() - 0.5) * GAME_CONFIG.visual.particles.explosionSpeed * GAME_CONFIG.visual.particles.deathSpeedMultiplier,
          y: (Math.random() - 0.5) * GAME_CONFIG.visual.particles.explosionSpeed * GAME_CONFIG.visual.particles.deathSpeedMultiplier,
        })
      );
    }
  }

  checkHighScore() {
    score = ~~score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(GAME_CONFIG.core.localStorageKey || GAME_CONFIG.advanced.localStorageKey, highScore);
      uiElements.newHighscoreMsg.style.display = "block";
    } else {
      uiElements.newHighscoreMsg.style.display = "none";
    }
  }

  showGameOverScreen() {
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    uiElements.finalScoreEl.innerText = `${score}`;
    uiElements.finalTimeEl.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    uiElements.gameOverScreen.style.display = "flex";
  }

  async sendGameOverData() {
    try {
      // Get client IP
      let clientIP = null;
      try {
        clientIP = await BackendAPI.getClientIP();
      } catch (error) {
        console.log("Could not get client IP:", error);
      }

      // Prepare game over data
      const gameOverData = {
        score: Math.floor(score),
        time: survivalTime,
        deathBy: this.data.reason || "unknown",
        deathTime: new Date().toISOString(),
        clientIP: clientIP
      };

      console.log("Game Over Data:", gameOverData);

      // Send to backend if available
      if (window.BackendAPI && BACKEND_CONFIG.USE_BACKEND) {
        try {
          await BackendAPI.submitScore(
            "Player", // username - can be made configurable later
            gameOverData.score,
            gameOverData.time,
            gameOverData.deathBy
          );
        } catch (error) {
          console.error("Failed to send data to backend:", error);
        }
      } else {
        console.log("Backend not available, game over data logged locally");
      }

      // Store locally as backup
      const localGameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
      localGameHistory.push(gameOverData);
      
      // Keep only last 100 games
      if (localGameHistory.length > 100) {
        localGameHistory.splice(0, localGameHistory.length - 100);
      }
      
      localStorage.setItem('gameHistory', JSON.stringify(localGameHistory));

    } catch (error) {
      console.error("Error sending game over data:", error);
    }
  }

  exit() {
    uiElements.gameOverScreen.style.display = "none";
  }
}

/**
 * Leaderboard State
 */
class LeaderboardState extends GameState {
  enter() {
    uiElements.startScreen.style.display = "none";
    uiElements.howToPlayScreen.style.display = "none";
    uiElements.leaderboardScreen.style.display = "flex";
    // Call function to populate leaderboard data
    if (typeof updateLeaderboard === 'function') {
      updateLeaderboard();
    }
  }

  exit() {
    uiElements.leaderboardScreen.style.display = "none";
  }
}

/**
 * How To Play State
 */
class HowToPlayState extends GameState {
  enter() {
    uiElements.howToPlayScreen.style.display = "flex";
  }

  exit() {
    uiElements.howToPlayScreen.style.display = "none";
  }
}

// Create global state manager
const gameStateManager = new GameStateManager();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GameStateManager, gameStateManager };
} else if (typeof window !== "undefined") {
  window.GameStateManager = GameStateManager;
  window.gameStateManager = gameStateManager;
}