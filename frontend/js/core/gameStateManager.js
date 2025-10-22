// =============================================================================
// GAME STATE MANAGER - Centralized state management for better organization
// =============================================================================

class GameStateManager {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.stateData = {}; // Stores data passed between states
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
    // Store data BEFORE initializing state, so state can access it
    this.stateData = data;
    this.currentState = new StateClass(this, data);
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
    // Find the state name by iterating through the map
    for (let [name, StateClass] of this.states.entries()) {
      if (this.currentState instanceof StateClass) {
        return name;
      }
    }
    return null; // Should not happen if state is registered
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
    this.data = data; // Data passed during state change
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
    // Only draw background if canvas context exists
    if (typeof ctx !== "undefined" && ctx) {
      ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      if (typeof nebulae !== "undefined" && nebulae && nebulae.length > 0) {
        nebulae.forEach((n) => {
          ctx.fillStyle = n;
          ctx.fillRect(0, 0, width, height);
        });
      }
      if (typeof stars !== "undefined" && stars && stars.length > 0) {
        stars.forEach((s) => s.draw());
      }
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

    // If restarting or starting for the first time
    if (this.data.restart || !isGameRunning) {
      isPaused = false;
      isGameRunning = true; // Set before init
      // Check if functions exist before calling
      if (typeof init === "function") init();
      if (typeof animate === "function") animate();
      if (typeof startBackgroundMusic === "function") startBackgroundMusic();
      if (typeof initAudioSystem === "function") initAudioSystem();
    } else {
      // Resuming from pause
      isPaused = false;
      // isGameRunning should already be true
      if (typeof animate === "function") animate();
      if (typeof resumeBackgroundMusic === "function") resumeBackgroundMusic();
    }
  }

  exit() {
    // Stop animation when leaving playing state (e.g., going to pause or game over)
    if (typeof animationFrameId !== "undefined" && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null; // Reset ID
    }
  }
}

class PausedState extends GameState {
  enter() {
    document.body.className = "paused-active";
    uiElements.pauseMenu.style.display = "flex";
    isPaused = true;
    // Cancel animation frame already handled by PlayingState.exit()
    if (typeof pauseBackgroundMusic === "function") pauseBackgroundMusic();
  }

  exit() {
    document.body.className = "game-active"; // Or depends on next state
    uiElements.pauseMenu.style.display = "none";
    isPaused = false;
    // The next state's `enter` method will handle resuming animations/music.
  }
}

class GameOverState extends GameState {
  enter() {
    document.body.className = "game-over";
    isGameRunning = false; // Ensure game is stopped
    uiElements.pauseButton.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;

    // Stop animation
    if (typeof animationFrameId !== "undefined" && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (typeof stopBackgroundMusic === "function") stopBackgroundMusic();
    if (typeof playSound === "function") playSound("explosion");

    this.createDeathExplosion();

    // Show game over screen elements immediately after explosion/sound
    this.showGameOverScreen(); // Show score, time, death cause first
    this.checkHighScore(); // Update high score message visibility

    // Send data to backend and then render leaderboard snippet
    this.sendGameOverData().then((submitResult) => {
      // Get current user ID for highlighting
      const userId =
        window.userIdentification &&
        typeof window.userIdentification.getUserId === "function"
          ? window.userIdentification.getUserId()
          : null;

      // Render the leaderboard snippet into the game over screen container
      if (typeof renderCurrentLeaderboardData === "function") {
        renderCurrentLeaderboardData({
          targetElementId: "game-over-leaderboard-container", // Target the specific container
          highlightUserId: userId,
          highlightRank: submitResult ? submitResult.rank : null,
        });
      } else {
        // Fallback if rendering function not found
        const lbContainer = document.getElementById(
          "game-over-leaderboard-container"
        );
        if (lbContainer) {
          lbContainer.innerHTML =
            '<div class="no-data">Không thể tải bảng xếp hạng.</div>'; // Could not load leaderboard.
        }
      }
    });
  }

  createDeathExplosion() {
    if (typeof player !== "undefined" && player) {
      if (typeof triggerScreenShake === "function") {
        triggerScreenShake(GAME_CONFIG.visual.screenShake.explosionIntensity);
      }
      if (typeof Particle !== "undefined" && typeof particles !== "undefined") {
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
    } else {
      console.warn("Player object not found during death explosion creation.");
    }
  }

  checkHighScore() {
    const currentScore = typeof score !== "undefined" ? ~~score : 0;
    const currentHighScore = typeof highScore !== "undefined" ? highScore : 0;

    if (currentScore > currentHighScore) {
      highScore = currentScore; // Update global highScore
      localStorage.setItem(GAME_CONFIG.core.localStorageKey, highScore);
      uiElements.newHighscoreMsg.style.display = "flex";
    } else {
      uiElements.newHighscoreMsg.style.display = "none";
    }
  }

  showGameOverScreen() {
    const finalScoreValue = typeof score !== "undefined" ? ~~score : 0;
    const finalTimeValue =
      typeof survivalTime !== "undefined" ? survivalTime : 0;

    uiElements.finalScoreEl.innerText = `${finalScoreValue.toLocaleString()}`; // Format score
    uiElements.finalTimeEl.innerText =
      typeof formatTime === "function" ? formatTime(finalTimeValue) : "0:00";

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
      const reasonKey = this.data.reason || "unknown";
      const fallbackText = deathCauses[reasonKey] || deathCauses["unknown"];
      const translatedReason =
        typeof safeT === "function"
          ? safeT(`death.${reasonKey.replace(/ /g, "")}`, fallbackText)
          : fallbackText;
      deathCauseEl.textContent = translatedReason;
    }

    // Ensure the game over screen element exists and is displayed
    if (uiElements.gameOverScreen) {
      uiElements.gameOverScreen.style.display = "flex";
    } else {
      console.error("Game Over screen element not found!");
    }
  }

  async sendGameOverData() {
    try {
      const finalScoreValue = typeof score !== "undefined" ? ~~score : 0;
      const finalTimeValue =
        typeof survivalTime !== "undefined" ? survivalTime : 0;

      const gameOverData = {
        score: finalScoreValue,
        time: finalTimeValue,
        deathBy: this.data.reason || "unknown",
        deathTime: new Date().toISOString(),
      };

      let submitResult = null;

      if (
        window.BackendAPI &&
        typeof BACKEND_CONFIG !== "undefined" &&
        BACKEND_CONFIG.USE_BACKEND
      ) {
        try {
          const playerName =
            window.playerNameUI &&
            typeof window.playerNameUI.getPlayerName === "function" &&
            window.playerNameUI.getPlayerName()
              ? window.playerNameUI.getPlayerName()
              : "Anonymous";

          submitResult = await BackendAPI.submitScore(
            playerName,
            gameOverData.score,
            gameOverData.time,
            gameOverData.deathBy
          );
          console.log("Score submission result:", submitResult);
        } catch (error) {
          console.error("Failed to send data to backend:", error);
          // Attempt to render local leaderboard snippet on backend failure
          const lbContainer = document.getElementById(
            "game-over-leaderboard-container"
          );
          if (lbContainer) {
            lbContainer.innerHTML =
              '<div class="no-data">Lỗi kết nối. Hiển thị điểm cục bộ.</div>'; // Connection error. Showing local scores.
            // Optionally call a function here to render local scores if needed
          }
        }
      } else {
        console.log("Backend not available, game over data logged locally");
        // Render local leaderboard snippet if backend is disabled
        const lbContainer = document.getElementById(
          "game-over-leaderboard-container"
        );
        if (lbContainer) {
          lbContainer.innerHTML =
            '<div class="no-data">Chế độ ngoại tuyến. Hiển thị điểm cục bộ.</div>'; // Offline mode. Showing local scores.
          // Optionally call a function here to render local scores if needed
        }
      }

      // Update local history regardless
      try {
        const localGameHistory = JSON.parse(
          localStorage.getItem("gameHistory") || "[]"
        );
        localGameHistory.push(gameOverData);
        if (localGameHistory.length > 100) {
          localGameHistory.splice(0, localGameHistory.length - 100);
        }
        localStorage.setItem("gameHistory", JSON.stringify(localGameHistory));
      } catch (e) {
        console.error("Error saving game history to localStorage:", e);
      }

      return submitResult; // Return backend result (contains rank if successful)
    } catch (error) {
      console.error("Error in sendGameOverData:", error);
      // Attempt to render local leaderboard snippet on general error
      const lbContainer = document.getElementById(
        "game-over-leaderboard-container"
      );
      if (lbContainer) {
        lbContainer.innerHTML =
          '<div class="no-data">Đã xảy ra lỗi. Hiển thị điểm cục bộ.</div>'; // An error occurred. Showing local scores.
        // Optionally call a function here to render local scores if needed
      }
      return null;
    }
  }

  exit() {
    uiElements.gameOverScreen.style.display = "none";
    // Clear the leaderboard snippet when leaving game over screen
    const lbContainer = document.getElementById(
      "game-over-leaderboard-container"
    );
    if (lbContainer) {
      lbContainer.innerHTML =
        '<div class="loading">Đang tải bảng xếp hạng...</div>'; // Reset to loading state
    }
  }
}

class LeaderboardState extends GameState {
  enter() {
    document.body.className = "menu-active"; // Keep menu background style
    uiElements.startScreen.style.display = "none";
    uiElements.howToPlayScreen.style.display = "none";
    uiElements.gameOverScreen.style.display = "none"; // Ensure game over is hidden
    uiElements.pauseMenu.style.display = "none"; // Ensure pause is hidden
    uiElements.leaderboardScreen.style.display = "flex"; // Show leaderboard

    // Pass data received IF navigating from GameOverState
    // If navigating directly (e.g., from main menu), these will be undefined
    const userId = this.data.currentUserId;
    const userRank = this.data.currentUserRank;

    // Trigger leaderboard rendering, passing the current user info for highlighting
    if (typeof renderCurrentLeaderboardData === "function") {
      // Target the main leaderboard container
      renderCurrentLeaderboardData({
        targetElementId: "global-leaderboard-list",
        highlightUserId: userId,
        highlightRank: userRank,
      });
    } else {
      console.warn("renderCurrentLeaderboardData function not found.");
    }

    // Select the 'Top Players' tab by default when entering this state
    const globalTab = document.querySelector('[data-tab="global-leaderboard"]');
    const globalContent = document.getElementById("global-leaderboard-content");
    const tabs = document.querySelectorAll(".dashboard-tab");
    const contents = document.querySelectorAll(".dashboard-content");

    if (globalTab && globalContent) {
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));
      globalTab.classList.add("active");
      globalContent.classList.add("active");
      // Scroll container to top
      const listContainer = globalContent.querySelector(
        ".leaderboard-container"
      );
      if (listContainer) listContainer.scrollTop = 0;
    }
  }

  exit() {
    uiElements.leaderboardScreen.style.display = "none";
  }
}

class HowToPlayState extends GameState {
  enter() {
    document.body.className = "menu-active"; // Keep menu background style
    uiElements.howToPlayScreen.style.display = "flex";
    uiElements.startScreen.style.display = "none";
    uiElements.leaderboardScreen.style.display = "none";
    uiElements.gameOverScreen.style.display = "none";
    uiElements.pauseMenu.style.display = "none";
  }

  exit() {
    uiElements.howToPlayScreen.style.display = "none";
  }
}

// Ensure gameStateManager is globally accessible
const gameStateManager = new GameStateManager();
window.GameStateManager = GameStateManager;
window.gameStateManager = gameStateManager;
