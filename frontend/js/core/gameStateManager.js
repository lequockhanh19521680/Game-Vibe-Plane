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

  registerState(name, stateClass) {
    this.states.set(name, stateClass);
  }

  changeState(stateName, data = {}) {
    if (!this.states.has(stateName)) {
      console.error(`Unknown state: ${stateName}`);
      return false;
    }

    if (this.currentState) {
      this.currentState.exit();
      this.previousState = this.currentState;
    }

    const StateClass = this.states.get(stateName);
    this.currentState = new StateClass(this, data);
    this.stateData = data;
    this.currentState.enter();

    return true;
  }

  update() {
    if (this.currentState) {
      this.currentState.update();
    }
  }

  getCurrentStateName() {
    if (!this.currentState) return null;
    return this.currentState.constructor.name;
  }

  registerDefaultStates() {
    this.registerState("menu", MenuState);
    this.registerState("playing", PlayingState);
    this.registerState("paused", PausedState);
    this.registerState("gameOver", GameOverState);
    this.registerState("leaderboard", LeaderboardState);
    this.registerState("howToPlay", HowToPlayState);
  }
}

class GameState {
  constructor(manager, data = {}) {
    this.manager = manager;
    this.data = data;
  }
  enter() {}
  exit() {}
  update() {}
}

class MenuState extends GameState {
  enter() {
    document.body.className = "menu-active";
    uiElements.startScreen.style.display = "flex";
    uiElements.gameOverScreen.style.display = "none";
    uiElements.leaderboardScreen.style.display = "none";
    uiElements.howToPlayScreen.style.display = "none";
    uiElements.pauseMenu.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;
    uiElements.pauseButton.style.display = "none";
    this.drawBackground();
  }

  exit() {
    uiElements.startScreen.style.display = "none";
  }

  drawBackground() {
    ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
    ctx.fillRect(0, 0, width, height);
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

class PlayingState extends GameState {
  enter() {
    document.body.className = "game-active";
    uiElements.startScreen.style.display = "none";
    uiElements.gameOverScreen.style.display = "none";
    uiElements.pauseMenu.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarOpacity;
    uiElements.pauseButton.style.display = "block";

    if (!isGameRunning || isPaused) {
      isPaused = false;
      isGameRunning = true;
      init();
      animate();
      startBackgroundMusic();
      initAudioSystem();
    }
  }
}

class PausedState extends GameState {
  enter() {
    document.body.className = "paused-active";
    uiElements.pauseMenu.style.display = "flex";
    isPaused = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    pauseBackgroundMusic();

    // Update pause stats - logic moved from gameUI.js
    this.updatePauseStats();
    this.updatePauseTip();
  }

  updatePauseStats() {
    const scoreEl = document.getElementById("pause-current-score");
    if (scoreEl) scoreEl.textContent = score.toLocaleString();

    const timeEl = document.getElementById("pause-current-time");
    if (timeEl) timeEl.textContent = formatTime(survivalTime);

    const levelEl = document.getElementById("pause-current-level");
    if (levelEl) {
      const currentLevel =
        Math.floor(score / GAME_CONFIG.difficulty.scorePerLevel) + 1;
      levelEl.textContent = currentLevel;
    }

    const highScoreEl = document.getElementById("pause-high-score");
    if (highScoreEl) highScoreEl.textContent = highScore.toLocaleString();
  }

  updatePauseTip() {
    const tipEl = document.getElementById("pause-tip");
    if (tipEl) {
      const tips = [
        "Collect crystal shards for temporary shields!",
        "Move constantly to avoid predictable patterns!",
        "Higher levels spawn more dangerous enemies!",
        "Use the edges of the screen for quick escapes!",
        "Watch for warning indicators before events!",
        "Power-ups appear more frequently at higher scores!",
        "Different enemies have different movement patterns!",
        "Your score increases faster when moving!",
        "Survival time contributes to your final score!",
        "Stay calm during intense moments!",
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      tipEl.textContent = randomTip;
    }
  }

  exit() {
    document.body.className = "game-active";
    uiElements.pauseMenu.style.display = "none";
    isPaused = false;
    if (isGameRunning) {
      animate();
      resumeBackgroundMusic();
    }
  }
}

class GameOverState extends GameState {
  enter() {
    document.body.className = "game-over";
    isGameRunning = false;
    uiElements.pauseButton.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;

    stopBackgroundMusic();
    playSound("explosion");

    this.createDeathExplosion();
    this.sendGameOverData();
    this.checkHighScore();

    setTimeout(() => {
      this.showGameOverScreen();
    }, GAME_CONFIG.ui.gameOverDelay);
  }

  createDeathExplosion() {
    triggerScreenShake(GAME_CONFIG.visual.screenShake.explosionIntensity);
    for (
      let i = 0;
      i <
      GAME_CONFIG.visual.particles.explosionCount *
        GAME_CONFIG.visual.particles.deathMultiplier;
      i++
    ) {
      particles.push(
        new Particle(
          player.x,
          player.y,
          Math.random() * GAME_CONFIG.visual.particles.maxSize,
          GAME_CONFIG.visual.colors.danger,
          {
            x:
              (Math.random() - 0.5) *
              GAME_CONFIG.visual.particles.explosionSpeed *
              GAME_CONFIG.visual.particles.deathSpeedMultiplier,
            y:
              (Math.random() - 0.5) *
              GAME_CONFIG.visual.particles.explosionSpeed *
              GAME_CONFIG.visual.particles.deathSpeedMultiplier,
          }
        )
      );
    }
  }

  checkHighScore() {
    score = ~~score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(GAME_CONFIG.core.localStorageKey, highScore);
      uiElements.newHighscoreMsg.style.display = "flex";
    } else {
      uiElements.newHighscoreMsg.style.display = "none";
    }
  }

  showGameOverScreen() {
    uiElements.finalScoreEl.innerText = `${score}`;
    uiElements.finalTimeEl.innerText = formatTime(survivalTime);

    // Update death cause - logic moved from gameUI.js
    const deathCauseEl = document.getElementById("death-cause");
    if (deathCauseEl) {
      const deathCauses = {
        "asteroid collision": "Destroyed by ☄️ Asteroid",
        "missile collision": "Hit by 🚀 Missile",
        "black hole collision": "Consumed by 🕳️ Black Hole",
        "laser collision": "Vaporized by ⚡ Laser",
        "laser mine collision": "Triggered 💣 Mine",
        "plasma field burn": "Burned by 🔥 Plasma Field",
        "crystal cluster collision": "Shattered by 💎 Crystal Cluster",
        "lightning strike": "Struck by ⚡ Lightning",
        unknown: "Destroyed by Unknown Forces",
      };
      deathCauseEl.textContent =
        deathCauses[this.data.reason] || deathCauses["unknown"];
    }

    uiElements.gameOverScreen.style.display = "flex";
  }

  async sendGameOverData() {
    try {
      const gameOverData = {
        score: Math.floor(score),
        time: survivalTime,
        deathBy: this.data.reason || "unknown",
        deathTime: new Date().toISOString(),
      };

      if (window.BackendAPI && BACKEND_CONFIG.USE_BACKEND) {
        try {
          const playerName =
            window.playerNameUI && window.playerNameUI.getPlayerName()
              ? window.playerNameUI.getPlayerName()
              : "Anonymous";

          await BackendAPI.submitScore(
            playerName,
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

      const localGameHistory = JSON.parse(
        localStorage.getItem("gameHistory") || "[]"
      );
      localGameHistory.push(gameOverData);

      if (localGameHistory.length > 100) {
        localGameHistory.splice(0, localGameHistory.length - 100);
      }
      localStorage.setItem("gameHistory", JSON.stringify(localGameHistory));
    } catch (error) {
      console.error("Error sending game over data:", error);
    }
  }

  exit() {
    uiElements.gameOverScreen.style.display = "none";
  }
}

class LeaderboardState extends GameState {
  enter() {
    document.body.className = "menu-active";
    uiElements.startScreen.style.display = "none";
    uiElements.howToPlayScreen.style.display = "none";
    uiElements.leaderboardScreen.style.display = "flex";

    if (typeof renderCurrentLeaderboardData === "function") {
      renderCurrentLeaderboardData();
    }
  }

  exit() {
    uiElements.leaderboardScreen.style.display = "none";
  }
}

class HowToPlayState extends GameState {
  enter() {
    document.body.className = "menu-active";
    uiElements.howToPlayScreen.style.display = "flex";
  }

  exit() {
    uiElements.howToPlayScreen.style.display = "none";
  }
}

const gameStateManager = new GameStateManager();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { GameStateManager, gameStateManager };
} else if (typeof window !== "undefined") {
  window.GameStateManager = GameStateManager;
  window.gameStateManager = gameStateManager;
}
