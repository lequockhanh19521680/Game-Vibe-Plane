// =============================================================================
// GAME STATE MANAGER - Centralized state management for better organization
// =============================================================================

// --- Placeholder Ad Functions ---
// These would be replaced by actual calls to your Ad SDK (e.g., AdMob)
let isRewardedAdReady = false; // Simulate ad availability
let adLoadingTimeout;

// Simulate loading a rewarded ad
function loadRewardedAd() {
  console.log("Attempting to load rewarded ad...");
  isRewardedAdReady = false; // Reset status
  const watchAdButton = document.getElementById("watch-ad-button");
  if (watchAdButton) {
    watchAdButton.disabled = true;
    watchAdButton.style.display = "flex"; // Show the button but disabled
    watchAdButton.innerHTML = "✨ Loading Ad... ✨"; // Update text
  }

  // Clear previous loading timeout if any
  if (adLoadingTimeout) clearTimeout(adLoadingTimeout);

  // Simulate ad loading delay (replace with SDK's load call)
  adLoadingTimeout = setTimeout(() => {
    // Simulate success or failure
    const success = Math.random() > 0.3; // 70% chance of success
    if (success) {
      console.log("Rewarded ad loaded successfully (simulated).");
      isRewardedAdReady = true;
      if (watchAdButton) {
        watchAdButton.disabled = false;
        watchAdButton.innerHTML = "✨ Watch Ad to Continue ✨"; // Restore text
      }
    } else {
      console.log("Failed to load rewarded ad (simulated).");
      isRewardedAdReady = false;
      if (watchAdButton) {
        watchAdButton.innerHTML = "Ad Unavailable"; // Indicate failure
        // Optional: Hide button after a delay if ad fails to load
        // setTimeout(() => { watchAdButton.style.display = 'none'; }, 2000);
      }
    }
    adLoadingTimeout = null;
  }, 2000 + Math.random() * 3000); // Simulate 2-5 second load time
}

// Simulate showing a rewarded ad
function showRewardedAd(onRewarded, onAdClosed) {
  console.log("Attempting to show rewarded ad...");
  if (!isRewardedAdReady) {
    console.log("Rewarded ad is not ready to show.");
    if (onAdClosed) onAdClosed(); // Call close callback immediately if not ready
    return;
  }

  console.log("Showing rewarded ad (simulated)...");
  // --- IMPORTANT: Pause Game Logic Here ---
  // If your game loop is running, you need to pause it.
  // Example: isPaused = true; cancelAnimationFrame(animationFrameId); stopBackgroundMusic();
  pauseGameForAd(); // Call helper function

  isRewardedAdReady = false; // Ad needs to be reloaded after showing
  const watchAdButton = document.getElementById("watch-ad-button");
  if (watchAdButton) watchAdButton.style.display = "none"; // Hide button while ad shows

  // Simulate ad display time and reward outcome
  setTimeout(() => {
    const gotReward = Math.random() > 0.1; // 90% chance user finishes ad
    console.log(`Ad finished (simulated). Rewarded: ${gotReward}`);
    if (gotReward && onRewarded) {
      onRewarded(); // Call the reward callback
    }
    // --- IMPORTANT: Resume Game Logic Here (or handle state change) ---
    // Example: isPaused = false; animate(); resumeBackgroundMusic();
    resumeGameAfterAd(); // Call helper function
    if (onAdClosed) onAdClosed(); // Call the close callback after resuming
  }, 3000); // Simulate 3 second ad duration
}

// Helper function to pause game elements for ads
function pauseGameForAd() {
  console.log("Pausing game for ad...");
  isPaused = true; // Use the existing pause flag
  if (typeof animationFrameId !== "undefined" && animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (typeof pauseBackgroundMusic === "function") pauseBackgroundMusic();
  // Disable player input listeners if necessary
}

// Helper function to resume game elements after ads
function resumeGameAfterAd() {
  console.log("Resuming game after ad...");
  // Only resume if the current state *should* be playing
  if (gameStateManager.getCurrentStateName() === "playing") {
    isPaused = false;
    if (typeof animate === "function") animate();
    if (typeof resumeBackgroundMusic === "function") resumeBackgroundMusic();
    // Re-enable player input listeners if they were disabled
  } else {
    console.log(
      "Not resuming animation/music as game state is not 'playing'. State:",
      gameStateManager.getCurrentStateName()
    );
    // If state changed (e.g., user went back to menu), ensure isPaused is handled correctly by that state
    if (gameStateManager.getCurrentStateName() !== "paused") {
      isPaused = false; // Ensure pause is off if not explicitly paused state
    }
  }
}

// --- End Placeholder Ad Functions ---

class GameStateManager {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.stateData = {}; // Stores data passed between states
    this.registerDefaultStates();
    this.gameOverTimeoutId = null; // To store the timeout ID
    this.watchAdButtonListener = null; // Store listener reference
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

    // Clear ad loading timeout if changing state
    if (adLoadingTimeout) {
      clearTimeout(adLoadingTimeout);
      adLoadingTimeout = null;
      console.log("Cleared pending ad load due to state change.");
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

  // Helper to remove the ad button listener
  removeWatchAdListener() {
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton && this.watchAdButtonListener) {
      watchAdButton.removeEventListener("click", this.watchAdButtonListener);
      this.watchAdButtonListener = null;
      console.log("Removed Watch Ad button listener.");
    }
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
    // Hide ad button if it was visible
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";
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
    // Hide ad button if it was visible
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";

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
      // Resuming from pause or ad
      isPaused = false;
      // isGameRunning should already be true
      if (typeof animate === "function") animate(); // Restart animation loop
      if (typeof resumeBackgroundMusic === "function") resumeBackgroundMusic();
    }
  }

  exit() {
    // Stop animation when leaving playing state (e.g., going to pause or game over)
    if (typeof animationFrameId !== "undefined" && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null; // Reset ID
    }
    // Don't set isPaused here, let the target state handle it
  }
}

class PausedState extends GameState {
  enter() {
    document.body.className = "paused-active";
    uiElements.pauseMenu.style.display = "flex";
    isPaused = true;
    // Cancel animation frame already handled by PlayingState.exit()
    if (typeof pauseBackgroundMusic === "function") pauseBackgroundMusic();
    // Hide ad button if it was visible
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";
  }

  exit() {
    document.body.className = "game-active"; // Or depends on next state
    uiElements.pauseMenu.style.display = "none";
    isPaused = false;
    // The next state's `enter` method will handle resuming animations/music.
  }
}

class GameOverState extends GameState {
  enterImmediateEffects() {
    document.body.className = "game-over";
    isGameRunning = false; // Ensure game is stopped
    isPaused = false; // Ensure not paused
    uiElements.pauseButton.style.display = "none";
    uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;
    // Hide ad button initially
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";

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

    // --- Rewarded Ad Logic ---
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) {
      // Remove previous listener if it exists
      this.manager.removeWatchAdListener();

      // Define the new listener function
      this.manager.watchAdButtonListener = () => {
        console.log("Watch Ad button clicked.");
        playSound("buttonHover"); // Play click sound

        // Disable button immediately to prevent multiple clicks
        watchAdButton.disabled = true;
        watchAdButton.innerHTML = "Showing Ad...";

        showRewardedAd(
          () => {
            // onRewarded callback
            console.log("Ad reward received! Continuing game...");
            // Reward: For example, reset player state slightly and restart 'playing'
            // You might give them a shield, remove nearby hazards, etc.
            // For simplicity, we'll just restart the 'playing' state without a full 'init'
            player.activateShield(); // Give a shield as reward
            this.manager.changeState("playing", { restart: false }); // Resume playing state
          },
          () => {
            // onAdClosed callback (called whether rewarded or not)
            console.log("Ad closed.");
            // Re-enable or hide the button, depending on whether the ad was rewarded/ready
            // If not rewarded, the button might stay hidden or show 'Ad Unavailable'
            // If rewarded, the state changes, so button isn't needed
            if (this.manager.getCurrentStateName() === "gameOver") {
              // Check if we are still on game over screen
              // Ad was closed without reward or failed to show
              watchAdButton.style.display = "none"; // Hide the button
            }
          }
        );
      };

      // Add the new listener
      watchAdButton.addEventListener(
        "click",
        this.manager.watchAdButtonListener
      );

      // Load the ad (this will show the button in a loading/ready state)
      loadRewardedAd();
    }
    // --- End Rewarded Ad Logic ---

    // Send data to backend and then render leaderboard snippet
    this.sendGameOverData().then((submitResult) => {
      // Store rank if received
      this.manager.stateData.lastRank =
        submitResult && submitResult.rank !== null ? submitResult.rank : null;
      if (typeof window.lastKnownRank !== "undefined") {
        window.lastKnownRank = this.manager.stateData.lastRank;
      }
      console.log(
        `[GameOver] Stored lastRank: ${this.manager.stateData.lastRank}`
      );

      const userId = window.userIdentification?.getUserId();

      if (typeof renderLeaderboardSnippet === "function") {
        console.log(
          `[GameOver] Rendering snippet. UserID: ${userId}, Rank: ${this.manager.stateData.lastRank}`
        );
        renderLeaderboardSnippet({
          targetElementId: "game-over-leaderboard-container",
          highlightUserId: userId,
          highlightRank: this.manager.stateData.lastRank,
          forceRefresh: true,
        });
      } else {
        console.error("Leaderboard rendering function not found.");
        const lbContainer = document.getElementById(
          "game-over-leaderboard-container"
        );
        if (lbContainer)
          lbContainer.innerHTML =
            '<div class="no-data">Cannot load leaderboard.</div>';
      }
    });
  }

  createDeathExplosion() {
    // ... (explosion logic remains the same)
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
    // ... (high score logic remains the same)
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
    // ... (showing score, time, death cause remains the same)
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
    // ... (sending data logic remains the same)
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
    if (lbContainer)
      lbContainer.innerHTML = '<div class="loading">Loading...</div>';
    this.manager.stateData.lastRank = null;
    if (typeof window.lastKnownRank !== "undefined") {
      window.lastKnownRank = null;
    }
    // Remove the ad button listener when leaving the game over state
    this.manager.removeWatchAdListener();
    // Hide ad button
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";
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
    // Hide ad button if it was visible
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";

    // Use rank from state data if available
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
        forceRefresh: true,
      });
    } else {
      console.warn("renderCurrentLeaderboardData function not found.");
    }

    // Ensure the correct tab is active
    // ... (tab logic remains the same)
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

    // Refresh other tabs
    if (typeof loadCountryData === "function") loadCountryData();
    if (typeof updatePlayerStats === "function") updatePlayerStats();
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
    // Hide ad button if it was visible
    const watchAdButton = document.getElementById("watch-ad-button");
    if (watchAdButton) watchAdButton.style.display = "none";
  }

  exit() {
    uiElements.howToPlayScreen.style.display = "none";
  }
}

// Ensure gameStateManager is globally accessible
const gameStateManager = new GameStateManager();
window.GameStateManager = GameStateManager;
window.gameStateManager = gameStateManager;
