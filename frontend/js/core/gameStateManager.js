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
    this.gameOverTimeoutId = null; // To store the timeout ID
  }

  registerState(name, stateClass) {
    this.states.set(name, stateClass);
  }

  changeState(stateName, data = {}) {
    if (!this.states.has(stateName)) {
      console.error(`Unknown state: ${stateName}`);
      return false;
    }

    // Clear game over timeout if changing state
    if (this.gameOverTimeoutId) {
      clearTimeout(this.gameOverTimeoutId);
      this.gameOverTimeoutId = null;
    }

    if (this.currentState) {
      this.currentState.exit();
      this.previousState = this.currentState;
    }

    const StateClass = this.states.get(stateName);
    // Store data BEFORE initializing state, so state can access it
    this.stateData = { ...this.stateData, ...data }; // Merge data
    this.currentState = new StateClass(this, this.stateData); // Pass merged data

    // Special handling for GameOverState with delay
    if (stateName === "gameOver") {
      // Execute immediate effects (sound, visuals)
      this.currentState.enterImmediateEffects();
      // Set a timeout to show the UI after the configured delay
      this.gameOverTimeoutId = setTimeout(() => {
        // Double check if the state is still gameOver before showing UI
        if (this.getCurrentStateName() === "gameOver") {
          this.currentState.enterDelayedUI();
        } else {
          console.log(
            "State changed before game over UI delay completed. Aborting UI display."
          );
        }
        this.gameOverTimeoutId = null; // Clear ID after execution or abort
      }, GAME_CONFIG.ui.gameOverDelay || 0); // Use config value, default 0
    } else {
      // For other states, call enter normally
      this.currentState.enter();
    }

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
  // YÊU CẦU 2: Tách enter thành 2 phần: hiệu ứng tức thời và UI có độ trễ
  enterImmediateEffects() {
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
  }

  enterDelayedUI() {
    // This function will be called after the delay
    this.showGameOverScreen(); // Show score, time, death cause first
    this.checkHighScore(); // Update high score message visibility

    // Send data to backend and then render leaderboard snippet
    this.sendGameOverData().then((submitResult) => {
      // YÊU CẦU 2: Store the rank from the submit result in the manager's stateData
      if (submitResult && submitResult.rank !== null) {
        this.manager.stateData.lastRank = submitResult.rank; // Store for later use by snippet
        // Also update the global lastKnownRank in dashboard.js directly
        if (typeof window.lastKnownRank !== "undefined") {
          window.lastKnownRank = submitResult.rank;
        }
        console.log(`[GameOver] Stored lastRank: ${submitResult.rank}`);
      } else {
        // If submission failed or didn't return rank, clear lastRank
        this.manager.stateData.lastRank = null;
        if (typeof window.lastKnownRank !== "undefined") {
          window.lastKnownRank = null;
        }
        console.log(
          "[GameOver] No rank received from submission, cleared lastRank."
        );
      }

      // Get current user ID for highlighting
      const userId =
        window.userIdentification &&
        typeof window.userIdentification.getUserId === "function"
          ? window.userIdentification.getUserId()
          : null;

      if (typeof renderLeaderboardSnippet === "function") {
        console.log(
          `[GameOver] Rendering snippet. UserID: ${userId}, Rank: ${this.manager.stateData.lastRank}`
        );
        renderLeaderboardSnippet({
          targetElementId: "game-over-leaderboard-container",
          highlightUserId: userId,
          highlightRank: this.manager.stateData.lastRank, // Use the stored rank
          forceRefresh: true, // Force fetching fresh data for game over
        });
      } else {
        console.error(
          "Leaderboard rendering function not found for game over screen."
        );
        const lbContainer = document.getElementById(
          "game-over-leaderboard-container"
        );
        if (lbContainer) {
          lbContainer.innerHTML =
            '<div class="no-data">Cannot load leaderboard.</div>';
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
      const lbContainer = document.getElementById(
        "game-over-leaderboard-container"
      );
      if (lbContainer) {
        lbContainer.innerHTML = '<div class="loading">Sending score...</div>'; // Update loading text
      }

      // --- START: Player Name Retrieval and Validation ---
      let finalPlayerName = "Anonymous"; // Default to Anonymous
      let retrievedName = null;
      let isNameValid = false;

      console.log("[sendGameOverData] Starting name retrieval...");

      // Check if playerNameUI and getPlayerName exist
      if (
        window.playerNameUI &&
        typeof window.playerNameUI.getPlayerName === "function"
      ) {
        try {
          retrievedName = window.playerNameUI.getPlayerName();
          console.log(
            `[sendGameOverData] Raw name from getPlayerName(): "${retrievedName}" (Type: ${typeof retrievedName})`
          );

          // Basic validation: must be a non-empty string
          if (
            typeof retrievedName === "string" &&
            retrievedName.trim().length > 0
          ) {
            const trimmedName = retrievedName.trim();
            console.log(`[sendGameOverData] Trimmed name: "${trimmedName}"`);

            // Check if validateName method exists
            if (typeof window.playerNameUI.validateName === "function") {
              try {
                isNameValid = window.playerNameUI.validateName(trimmedName);
                console.log(
                  `[sendGameOverData] Validation result for "${trimmedName}": ${isNameValid}`
                );
              } catch (validationError) {
                console.error(
                  `[sendGameOverData] Error during validation for "${trimmedName}":`,
                  validationError
                );
                isNameValid = false; // Assume invalid on error
              }
            } else {
              // Fallback validation if validateName is missing (simple length check)
              console.warn(
                "[sendGameOverData] playerNameUI.validateName not found. Using basic length check."
              );
              isNameValid = trimmedName.length >= 2 && trimmedName.length <= 20;
              console.log(
                `[sendGameOverData] Fallback validation result for "${trimmedName}": ${isNameValid}`
              );
            }

            // Assign the name if it's valid
            if (isNameValid) {
              finalPlayerName = trimmedName;
              console.log(
                `[sendGameOverData] Using valid name: "${finalPlayerName}"`
              );
            } else {
              console.warn(
                `[sendGameOverData] Name "${trimmedName}" failed validation. Using default: "${finalPlayerName}".`
              );
            }
          } else {
            console.warn(
              `[sendGameOverData] Retrieved name is empty or not a string. Using default: "${finalPlayerName}".`
            );
          }
        } catch (getNameError) {
          console.error(
            "[sendGameOverData] Error calling playerNameUI.getPlayerName():",
            getNameError
          );
          // Keep the default "Anonymous" name on error
        }
      } else {
        console.warn(
          "[sendGameOverData] window.playerNameUI or getPlayerName() not found. Using default: 'Anonymous'."
        );
      }

      console.log(
        `[sendGameOverData] Final name to be submitted: "${finalPlayerName}"`
      );
      // --- END: Player Name Retrieval and Validation ---

      if (
        window.BackendAPI &&
        typeof BACKEND_CONFIG !== "undefined" &&
        BACKEND_CONFIG.USE_BACKEND &&
        typeof window.isConnected !== "undefined" &&
        window.isConnected // Check if connected
      ) {
        try {
          submitResult = await BackendAPI.submitScore(
            finalPlayerName, // Use the final validated or default name
            gameOverData.score,
            gameOverData.time,
            gameOverData.deathBy
          );
          console.log("Score submission result:", submitResult);
          if (lbContainer) {
            // Clear sending message after successful submission attempt
            lbContainer.innerHTML =
              '<div class="loading">Loading leaderboard...</div>';
          }
        } catch (error) {
          console.error("Failed to send data to backend:", error);
          if (lbContainer) {
            lbContainer.innerHTML =
              '<div class="no-data">Connection error. Showing local scores.</div>';
            if (typeof showOfflineLeaderboard === "function") {
              showOfflineLeaderboard("game-over-leaderboard-container");
            }
          }
        }
      } else {
        console.log(
          "Backend not available or disconnected, game over data logged locally"
        );
        if (lbContainer) {
          // YÊU CẦU 1: Show appropriate message if offline vs disabled
          const offlineMsg = !BACKEND_CONFIG.USE_BACKEND
            ? "Backend disabled. Showing local scores."
            : "Offline mode. Showing local scores.";
          showOfflineLeaderboard("game-over-leaderboard-container", offlineMsg);
        }
      }

      // Save to local history regardless of backend submission success/failure
      try {
        const localGameHistory = JSON.parse(
          localStorage.getItem("gameHistory") || "[]"
        );
        localGameHistory.push(gameOverData);
        // Keep only the last 100 entries
        if (localGameHistory.length > 100) {
          localGameHistory.splice(0, localGameHistory.length - 100);
        }
        localStorage.setItem("gameHistory", JSON.stringify(localGameHistory));
        console.log("Game result saved to local history.");
      } catch (e) {
        console.error("Error saving game history to localStorage:", e);
      }

      return submitResult; // Return the result from backend submission (or null)
    } catch (error) {
      console.error("Error in sendGameOverData:", error);
      const lbContainer = document.getElementById(
        "game-over-leaderboard-container"
      );
      if (lbContainer) {
        // YÊU CẦU 1: Show appropriate message on error
        const errorMsg = isConnected
          ? "An error occurred. Showing local scores."
          : "Disconnected. Showing local scores.";
        showOfflineLeaderboard("game-over-leaderboard-container", errorMsg);
      }
      return null;
    }
  }

  exit() {
    uiElements.gameOverScreen.style.display = "none";
    const lbContainer = document.getElementById(
      "game-over-leaderboard-container"
    );
    // Reset leaderboard content when exiting
    if (lbContainer) {
      lbContainer.innerHTML = '<div class="loading">Loading...</div>';
    }
    // YÊU CẦU 2: Clear last known rank when exiting game over
    this.manager.stateData.lastRank = null;
    if (typeof window.lastKnownRank !== "undefined") {
      window.lastKnownRank = null;
    }
  }
}

class LeaderboardState extends GameState {
  enter() {
    document.body.className = "menu-active";
    uiElements.startScreen.style.display = "none";
    uiElements.howToPlayScreen.style.display = "none";
    uiElements.gameOverScreen.style.display = "none";
    uiElements.pauseMenu.style.display = "none";
    uiElements.leaderboardScreen.style.display = "flex";

    // Use rank from state data if available (passed from game over)
    const userId = window.userIdentification?.getUserId();
    const userRank = this.data.lastRank || null; // Use stored rank

    if (typeof renderCurrentLeaderboardData === "function") {
      console.log(
        `[LeaderboardState] Entering. UserID: ${userId}, Rank: ${userRank}`
      );
      renderCurrentLeaderboardData({
        targetElementId: "global-leaderboard-list",
        highlightUserId: userId,
        highlightRank: userRank,
        forceRefresh: true, // Always refresh when entering leaderboard state
      });
    } else {
      console.warn("renderCurrentLeaderboardData function not found.");
    }

    // Ensure the correct tab is active (usually Global by default)
    const globalTab = document.querySelector('[data-tab="global-leaderboard"]');
    const globalContent = document.getElementById("global-leaderboard-content");
    const tabs = document.querySelectorAll(".dashboard-tab");
    const contents = document.querySelectorAll(".dashboard-content");

    if (globalTab && globalContent) {
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));
      globalTab.classList.add("active");
      globalContent.classList.add("active");
      const listContainer = globalContent.querySelector(
        ".leaderboard-container"
      );
      if (listContainer) listContainer.scrollTop = 0; // Scroll to top
    }

    // Refresh other tabs as well (loadCountryData already checks connection)
    if (typeof loadCountryData === "function") {
      loadCountryData();
    }
    if (typeof updatePlayerStats === "function") {
      updatePlayerStats();
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
