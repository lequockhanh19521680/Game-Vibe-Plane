// --- Main Game Entry Point ---
// Make sure DOM is loaded before running code
// Define canvas, ctx, width, and height globally so they can be used across files
let canvas, ctx, width, height;

// Game state variables - global so they can be accessed from game.js and other modules
let player,
  stars,
  asteroids,
  particles,
  lasers,
  blackHoles,
  missiles,
  laserMines,
  crystalClusters,
  fragments,
  warnings,
  energyOrbs,
  plasmaFields,
  crystalShards,
  quantumPortals,
  shieldGenerators,
  freezeZones,
  superNovas,
  wormholes,
  magneticStorms,
  lightningStorms,
  gravityWaves,
  timeDistortions,
  chainLightnings,
  voidRifts,
  cosmicMines;
let mouse = { x: 0, y: 0 },
  prevMouse = { x: 0, y: 0 };
let score = 0,
  highScore = 0,
  bestTime = 0;
let gameStartTime = 0,
  survivalTime = 0;
let isGamePaused = false;
let lastDifficultyLevel = 0;
let animationFrameId;
let timers = {
  asteroid: 0,
  difficulty: 0,
  laser: 0,
  blackHole: 0,
  missile: 0,
  mine: 0,
  crystal: 0,
};
let spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval;
let isGameRunning = false;
let globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed;
let nebulae = [];
let nextEventScore = 1000;
let eventActive = { type: null, endTime: 0 };
let currentUsername = ""; // Store username for current game session
let deathReason = ""; // Store death reason for backend submission

document.addEventListener("DOMContentLoaded", function () {
  // --- Constants & Variables ---
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

  // Initialize mobile detection early
  detectMobile();

  // Add mobile optimization class to body if mobile detected
  if (GAME_CONFIG.ui.mobile.detected) {
    document.body.classList.add("mobile-optimized");
    console.log("Mobile device detected, UI optimized for mobile gameplay");
  }

  // Menu buttons
  const startButton = document.getElementById("start-button");
  const leaderboardButton = document.getElementById("leaderboard-button");
  const helpButton = document.getElementById("help-button");
  const backFromLeaderboardButton = document.getElementById(
    "back-from-leaderboard"
  );
  const backFromHelpButton = document.getElementById("back-from-help");

  // Game over buttons
  const restartButton = document.getElementById("restart-button");
  const mainMenuButton = document.getElementById("main-menu-button");

  // Pause menu buttons
  const pauseButton = document.getElementById("pause-button");
  const resumeButton = document.getElementById("resume-button");
  const pauseMainMenuButton = document.getElementById("pause-main-menu-button");
  const pauseMenu = document.getElementById("pause-menu");

  function startGame() {
    // Get username from input field
    const usernameInput = document.getElementById("username-input");
    currentUsername = usernameInput ? usernameInput.value.trim() : "";
    if (!currentUsername) {
      currentUsername = "Me"; // Default username
    }

    // Set game running state FIRST
    isGameRunning = true;
    isGamePaused = false;

    // Initialize audio system first (will only work after user interaction)
    if (typeof initAudioSystem === "function") {
      initAudioSystem();
    }

    // Hide cursor during gameplay
    document.body.classList.remove("menu-active");
    document.body.classList.remove("game-over");
    document.body.classList.add("game-running");

    // Hide menu and game over screen BEFORE initializing game
    if (uiElements.mainMenuContainer) {
      uiElements.mainMenuContainer.style.display = "none";
    }
    if (uiElements.gameOverScreen) {
      uiElements.gameOverScreen.style.display = "none";
    }

    // Initialize game
    if (typeof window.init === "function") {
      window.init();
    } else {
      console.error("Init function not defined. Game initialization failed.");
    }

    // Force update UI displays immediately after init
    // DEBUG: Check if elements exist
    console.log("🔍 Checking UI elements:", {
      scoreDisplay: uiElements.scoreDisplay,
      highscoreDisplay: uiElements.highscoreDisplay,
      survivalDisplay: uiElements.survivalDisplay,
      leftPanel: uiElements.leftGamePanel,
    });

    if (uiElements.scoreDisplay) {
      uiElements.scoreDisplay.innerText = `Score: 0`;
      uiElements.scoreDisplay.style.display = "block";
      console.log("✅ Score display updated");
    } else {
      console.error("❌ scoreDisplay element not found!");
    }

    if (uiElements.highscoreDisplay) {
      uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;
      uiElements.highscoreDisplay.style.display = "block";
      console.log("✅ Highscore display updated");
    } else {
      console.error("❌ highscoreDisplay element not found!");
    }

    if (uiElements.survivalDisplay) {
      uiElements.survivalDisplay.innerText = `Time: 0:00`;
      uiElements.survivalDisplay.style.display = "block";
      console.log("✅ Survival display updated");
    } else {
      console.error("❌ survivalDisplay element not found!");
    }

    if (typeof window.animate === "function") {
      window.animate();
    } else {
      console.error("Animate function not defined. Game animation failed.");
    }

    // Try to play background music after a slight delay to ensure AudioContext is ready
    setTimeout(() => {
      playSound("backgroundMusic");
    }, 100);

    // Show game UI panels
    if (uiElements.leftGamePanel) {
      uiElements.leftGamePanel.classList.add("visible");
      uiElements.leftGamePanel.style.opacity = "1";
    } else {
      console.error("leftGamePanel not found!");
    }

    // Show score container
    if (uiElements.scoreContainer) {
      uiElements.scoreContainer.style.opacity = "1";
      uiElements.scoreContainer.style.display = "flex";
      console.log("✅ Score container shown");
    } else {
      console.error("❌ scoreContainer not found!");
    }

    if (uiElements.rightGamePanel) {
      uiElements.rightGamePanel.style.opacity = "1";
    } else {
      console.error("rightGamePanel not found!");
    }

    // Initialize live leaderboard
    initializeLiveLeaderboard();
  }

  // Function to return to main menu
  function returnToMainMenu() {
    // Hide game over screen and pause menu
    uiElements.gameOverScreen.style.display = "none";
    pauseMenu.style.display = "none";

    // Show main menu container
    uiElements.mainMenuContainer.style.display = "flex";

    // Make sure cursor is visible and remove game classes
    document.body.classList.remove("game-running");
    document.body.classList.remove("game-over");
    document.body.classList.remove("game-paused");
    document.body.classList.add("menu-active");

    // Make sure we're showing the main menu panel, not leaderboard or help
    showMainMenu();

    // Hide in-game UI
    uiElements.leftGamePanel.classList.remove("visible");
    uiElements.leftGamePanel.style.opacity = "0";
    uiElements.scoreContainer.style.opacity = "0";
    uiElements.rightGamePanel.style.opacity = "0";

    // Reset game state
    isGameRunning = false;
    isGamePaused = false;
    cancelAnimationFrame(animationFrameId);
    stopBackgroundMusic();

    // Update personal best display
    updatePersonalBestDisplay();
  }

  // Function to update personal best display
  function updatePersonalBestDisplay() {
    const personalBestScore = document.getElementById("personal-best-score");
    const personalBestTime = document.getElementById("personal-best-time");

    if (personalBestScore) {
      personalBestScore.textContent = highScore.toLocaleString();
    }

    if (personalBestTime) {
      const minutes = Math.floor(bestTime / 60);
      const seconds = bestTime % 60;
      personalBestTime.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }

  // Live Leaderboard Functions
  function initializeLiveLeaderboard() {
    updateLeaderboardConnectionStatus();
    loadLiveLeaderboard();

    // Update every 30 seconds during gameplay
    if (liveLeaderboardInterval) {
      clearInterval(liveLeaderboardInterval);
    }

    liveLeaderboardInterval = setInterval(() => {
      if (isGameRunning && !isGamePaused) {
        loadLiveLeaderboard();
      }
    }, 30000);
  }

  function updateLeaderboardConnectionStatus() {
    const statusEl = uiElements.leaderboardConnectionStatus;

    // Check if backend is available and network connection
    if (window.BackendAPI && navigator.onLine) {
      // Test connection to backend
      window.BackendAPI.testConnection()
        .then(() => {
          statusEl.textContent = "🌐 Connected";
          statusEl.className = "connection-status connected";
        })
        .catch(() => {
          statusEl.innerHTML = "📡 Server Offline";
          statusEl.className = "connection-status disconnected";
        });
    } else if (!navigator.onLine) {
      statusEl.innerHTML = "📶❌ No Internet Connection";
      statusEl.className = "connection-status disconnected";
    } else {
      statusEl.innerHTML = "⚙️ Backend Unavailable";
      statusEl.className = "connection-status disconnected";
    }
  }

  async function loadLiveLeaderboard() {
    const contentEl = uiElements.leaderboardContent;

    try {
      // Check network connection first
      if (!navigator.onLine) {
        throw new Error("No internet connection");
      }

      // Show loading state only if we have connection
      contentEl.innerHTML =
        '<div class="leaderboard-loading">Updating scores...</div>';

      if (window.BackendAPI) {
        const data = await window.BackendAPI.fetchLeaderboard(5); // Top 5 for live display

        if (data && data.leaderboard && data.leaderboard.length > 0) {
          displayLiveLeaderboard(data.leaderboard);
          updateLeaderboardConnectionStatus(); // Update status to show connected
        } else {
          throw new Error("No data received");
        }
      } else {
        throw new Error("Backend not available");
      }
    } catch (error) {
      // Show offline state with WiFi icon
      contentEl.innerHTML = `
        <div class="leaderboard-error">
          <div style="position: relative; width: 60px; height: 60px; margin: 0 auto;">
            <div class="wifi-cross">✖</div>
          </div>
          <div style="font-size: 0.75rem; font-weight: 600; margin-top: 0.5rem;">Not Connected</div>
          <div style="font-size: 0.65rem; opacity: 0.6; margin-top: 0.3rem;">Check connection</div>
        </div>
      `;
      updateLeaderboardConnectionStatus(); // Update status to show disconnected
    }
  }

  function displayLiveLeaderboard(leaderboard) {
    const contentEl = uiElements.leaderboardContent;

    if (leaderboard.length === 0) {
      contentEl.innerHTML =
        '<div class="leaderboard-loading">No scores yet</div>';
      return;
    }

    const entriesHTML = leaderboard
      .map((entry, index) => {
        const isCurrentPlayer = entry.username === currentUsername;
        const entryClass = isCurrentPlayer
          ? "leaderboard-entry current-player"
          : "leaderboard-entry";

        return `
        <div class="${entryClass}">
          <span class="entry-rank">#${index + 1}</span>
          <span class="entry-name">${entry.username}</span>
          <span class="entry-score">${entry.score.toLocaleString()}</span>
        </div>
      `;
      })
      .join("");

    contentEl.innerHTML = entriesHTML;
  }

  let liveLeaderboardInterval = null;

  // Test warning system (for debugging)
  window.testWarningSystem = function () {
    if (isGameRunning) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const types = [
        "asteroid",
        "blackhole",
        "missile",
        "laser",
        "plasma",
        "freeze",
        "supernova",
      ];
      const type = types[Math.floor(Math.random() * types.length)];

      console.log(
        `Testing warning system: ${type} at (${Math.floor(x)}, ${Math.floor(
          y
        )})`
      );

      const warningSystem = spawnWithWarning(type, x, y, { radius: 100 });
      warningSystem.spawn(() => {
        console.log("Warning system test complete - object would spawn now");
      });
    }
  };

  // Test Lightning Network event (for debugging)
  window.testLightningNetwork = function () {
    if (isGameRunning) {
      console.log("Testing Lightning Network event...");

      // Manually trigger the event
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      showEventText("⚡ LIGHTNING NETWORK TEST!");

      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const angle = (i / 3) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * 120;
          const y = centerY + Math.sin(angle) * 120;

          const lightning = new ChainLightning(x, y);
          chainLightnings.push(lightning);

          console.log(
            `Created lightning orb ${i + 1} at (${Math.floor(x)}, ${Math.floor(
              y
            )})`
          );

          if (typeof playSound === "function") {
            playSound("thunder", 0.3);
          }
        }, i * 500);
      }

      console.log("Lightning Network test initiated");
    } else {
      console.log("Game not running - start the game first");
    }
  };

  // Debug function to track all objects near player
  window.debugCollisions = function () {
    if (!isGameRunning || !player) {
      console.log("Game not running or player not available");
      return;
    }

    console.log("🔍 COLLISION DEBUG - Objects near player:");
    console.log(
      `Player position: (${Math.floor(player.x)}, ${Math.floor(
        player.y
      )}) radius: ${player.radius}`
    );
    console.log(`Shield active: ${player.shieldActive}`);

    let nearObjects = [];

    // Check asteroids
    asteroids.forEach((ast, i) => {
      const distance = Math.hypot(player.x - ast.x, player.y - ast.y);
      if (distance < 200) {
        // Check objects within 200 pixels
        nearObjects.push({
          type: "asteroid",
          index: i,
          position: `(${Math.floor(ast.x)}, ${Math.floor(ast.y)})`,
          radius: Math.floor(ast.radius),
          distance: Math.floor(distance),
          collisionDistance: Math.floor(ast.radius + player.radius + 1),
          wouldCollide: distance < ast.radius + player.radius + 1,
        });
      }
    });

    // Check missiles
    missiles.forEach((m, i) => {
      const distance = Math.hypot(player.x - m.x, player.y - m.y);
      if (distance < 200) {
        nearObjects.push({
          type: "missile",
          index: i,
          position: `(${Math.floor(m.x)}, ${Math.floor(m.y)})`,
          radius: Math.floor(m.radius),
          distance: Math.floor(distance),
          collisionDistance: Math.floor(m.radius + player.radius + 1),
          wouldCollide: distance < m.radius + player.radius + 1,
        });
      }
    });

    // Check other dangerous objects
    fragments.forEach((f, i) => {
      if (f.lethal) {
        const distance = Math.hypot(player.x - f.x, player.y - f.y);
        if (distance < 200) {
          nearObjects.push({
            type: "lethal_fragment",
            index: i,
            position: `(${Math.floor(f.x)}, ${Math.floor(f.y)})`,
            radius: Math.floor(f.radius),
            distance: Math.floor(distance),
            collisionDistance: Math.floor(f.radius + player.radius + 1),
            wouldCollide: distance < f.radius + player.radius + 1,
          });
        }
      }
    });

    if (nearObjects.length === 0) {
      console.log("✅ No dangerous objects detected near player");
    } else {
      console.table(nearObjects);
      const colliding = nearObjects.filter((obj) => obj.wouldCollide);
      if (colliding.length > 0) {
        console.warn("⚠️ COLLISION IMMINENT with:", colliding);
      }
    }
  };

  // Enable collision debug mode - logs every collision
  window.enableCollisionDebug = function () {
    window.collisionDebugMode = true;
    console.log(
      "🔍 Collision debug mode ENABLED - all collisions will be logged"
    );
  };

  window.disableCollisionDebug = function () {
    window.collisionDebugMode = false;
    console.log("🔍 Collision debug mode DISABLED");
  };

  // Pause/Resume functions
  function pauseGame() {
    if (!isGameRunning || isGamePaused) return;
    isGamePaused = true;
    pauseMenu.style.display = "flex";
    document.body.classList.add("game-paused");
    pauseButton.innerHTML = "<span>▶️</span>";

    // Pause background music
    if (typeof pauseBackgroundMusic === "function") {
      pauseBackgroundMusic();
    }

    console.log("Game paused");
  }

  function resumeGame() {
    if (!isGameRunning || !isGamePaused) return;
    isGamePaused = false;
    pauseMenu.style.display = "none";
    document.body.classList.remove("game-paused");
    pauseButton.innerHTML = "<span>⏸️</span>";

    // Resume background music
    if (typeof resumeBackgroundMusic === "function") {
      resumeBackgroundMusic();
    }

    console.log("Game resumed");
  }

  // Make pause functions globally available
  window.pauseGame = pauseGame;
  window.resumeGame = resumeGame;
  window.isGamePaused = () => isGamePaused;

  // Make endGame function globally available
  window.endGame = function (reason = "unknown") {
    if (!isGameRunning) return;
    console.log(`Game Over! Reason: ${reason}`);
    isGameRunning = false;
    isGamePaused = false;
    deathReason = reason; // Store death reason

    // Show cursor when game ends
    document.body.classList.remove("game-running");
    document.body.classList.remove("game-paused");
    document.body.classList.add("game-over");
    stopBackgroundMusic();
    playSound("explosion");
    cancelAnimationFrame(animationFrameId);
    triggerScreenShake(GAME_CONFIG.visual.screenShake.explosionIntensity);
    for (let i = 0; i < GAME_CONFIG.visual.particles.explosionCount * 8; i++)
      particles.push(
        new Particle(player.x, player.y, Math.random() * 3, "#ff4444", {
          x:
            (Math.random() - 0.5) *
            GAME_CONFIG.visual.particles.explosionSpeed *
            1.7,
          y:
            (Math.random() - 0.5) *
            GAME_CONFIG.visual.particles.explosionSpeed *
            1.7,
        })
      );

    // Round score and format time
    score = ~~score;
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // CREATE DETAILED DEATH ANALYTICS JSON
    const deathAnalytics = {
      // Player Info
      playerName: currentUsername || "Unknown Player",

      // Game Stats
      score: score,
      survivalTime: survivalTime,
      survivalTimeFormatted: timeFormatted,
      highScore: highScore,
      bestTime: bestTime,

      // Death Details
      deathCause: reason,
      deathTimestamp: new Date().toISOString(),
      deathTimestampLocal: new Date().toLocaleString(),

      // Position Info
      playerPosition: player
        ? { x: Math.floor(player.x), y: Math.floor(player.y) }
        : null,

      // Game State at Death
      currentLevel: typeof currentLevel !== "undefined" ? currentLevel : 1,
      difficulty: typeof difficulty !== "undefined" ? difficulty : 1,

      // Active Entities Count
      entitiesAtDeath: {
        asteroids: typeof asteroids !== "undefined" ? asteroids.length : 0,
        blackHoles: typeof blackHoles !== "undefined" ? blackHoles.length : 0,
        missiles: typeof missiles !== "undefined" ? missiles.length : 0,
        lasers: typeof lasers !== "undefined" ? lasers.length : 0,
        stars: typeof stars !== "undefined" ? stars.length : 0,
        particles: typeof particles !== "undefined" ? particles.length : 0,
        lightningStorms:
          typeof lightningStorms !== "undefined" ? lightningStorms.length : 0,
        plasmaFields:
          typeof plasmaFields !== "undefined" ? plasmaFields.length : 0,
        freezeZones:
          typeof freezeZones !== "undefined" ? freezeZones.length : 0,
        laserTurrets:
          typeof laserTurrets !== "undefined" ? laserTurrets.length : 0,
      },

      // Session Info
      sessionStartTime:
        typeof gameStartTime !== "undefined"
          ? new Date(gameStartTime).toISOString()
          : null,
      sessionDuration: survivalTime,

      // Browser/Device Info
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      gameResolution:
        typeof canvas !== "undefined"
          ? `${canvas.width}x${canvas.height}`
          : null,
      devicePixelRatio: window.devicePixelRatio,

      // Performance Metrics
      performanceMetrics: {
        framesPlayed:
          typeof timers !== "undefined" && timers.gameFrame
            ? timers.gameFrame
            : 0,
        averageFPS: typeof getFPS === "function" ? Math.round(getFPS()) : null,
      },

      // Achievement Flags
      isNewHighScore: score > highScore,
      isNewBestTime: survivalTime > bestTime,
    };

    // LOG DETAILED DEATH ANALYTICS TO CONSOLE
    console.log("=== 🎮 DEATH ANALYTICS JSON ===");
    console.log(JSON.stringify(deathAnalytics, null, 2));
    console.log("=== END DEATH ANALYTICS ===");

    // Update local statistics
    if (typeof updateLocalStats === "function") {
      updateLocalStats(reason);
    }

    // Check for new personal bests
    const isHighScore = score > highScore;
    const isBestTime = survivalTime > bestTime;

    if (isHighScore) {
      highScore = score;
      localStorage.setItem(GAME_CONFIG.advanced.localStorageKey, highScore);
      uiElements.newHighscoreMsg.style.display = "block";
    }

    if (isBestTime) {
      bestTime = survivalTime;
      localStorage.setItem("stellarDriftBestTime", bestTime);
      console.log("New best time achieved!");
    }

    // Submit score to backend
    if (window.BackendAPI) {
      window.BackendAPI.submitScore(
        currentUsername,
        score,
        survivalTime,
        reason
      )
        .then((response) => {
          if (response) {
            console.log("Score submitted to backend successfully", response);
            // Optionally show country info to user
            if (response.country) {
              console.log("Your country:", response.country);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to submit score to backend:", err);
        });
    }

    // Show high score dialog for new records
    if (isHighScore) {
      // Show high score dialog after a short delay
      setTimeout(() => {
        // Display the score in the dialog
        const dialogScore = document.getElementById("dialog-score");
        if (dialogScore) {
          dialogScore.textContent = score;
        }

        // Show dialog
        const dialogOverlay = document.getElementById(
          "high-score-dialog-overlay"
        );
        const dialog = document.getElementById("high-score-dialog");
        if (dialogOverlay) dialogOverlay.style.display = "block";
        if (dialog) dialog.style.display = "flex";

        // Focus on input field and pre-fill with current username
        const playerNameInput = document.getElementById("player-name-input");
        if (playerNameInput) {
          playerNameInput.value =
            currentUsername === "Me" ? "" : currentUsername;
          playerNameInput.focus();
        }
      }, 1500);
    } else {
      uiElements.newHighscoreMsg.style.display = "none";
    }

    // Update score and time IMMEDIATELY (no delay)
    uiElements.finalScoreEl.innerText = `Your Score: ${score}`;
    uiElements.finalTimeEl.innerText = `Survival Time: ${timeFormatted}`;

    // Then show game over screen after a short delay for explosion animation
    setTimeout(() => {
      uiElements.gameOverScreen.style.display = "flex";

      // Hide game UI panels
      uiElements.leftGamePanel.style.opacity = "0";
      uiElements.rightGamePanel.style.opacity = "0";

      // Cleanup live leaderboard
      if (liveLeaderboardInterval) {
        clearInterval(liveLeaderboardInterval);
        liveLeaderboardInterval = null;
      }

      // Update personal best displays
      updatePersonalBestDisplay();
    }, 1000);
  };

  // --- Event Listeners ---

  // Function to ensure audio can play
  const unlockAudio = function () {
    // Create and use a short silent audio to unlock audio playback
    if (
      typeof AudioContext !== "undefined" ||
      typeof webkitAudioContext !== "undefined"
    ) {
      // Silent audio to unlock audio context
      const silentAudio = document.createElement("audio");
      silentAudio.src =
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABDgCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw//////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAQAAAAAAAAAARAAgjJGMVAAAAAAAAAAAAAAAAAAAP/74EkAAMomQeU0JMKAAANIAAAAQAAAf/7kmRAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

      // Use both play and load methods for better compatibility
      silentAudio.load();
      silentAudio.play().catch(() => {
        console.log(
          "Silent audio play failed - this is expected on first load"
        );
      });

      // Remove the audio element after a short delay
      setTimeout(() => {
        silentAudio.remove();
      }, 1000);
    }

    // Initialize audio system
    if (typeof initAudioSystem === "function") {
      initAudioSystem();

      // Try to resume AudioContext if it exists
      if (window.audioContext && window.audioContext.state === "suspended") {
        window.audioContext.resume().catch((err) => {
          console.log("Failed to resume AudioContext:", err);
        });
      }
    }

    // Remove event listeners once audio is unlocked
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
  };

  // Add listeners to unlock audio
  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });

  // Main menu buttons
  startButton.addEventListener("click", () => {
    // Initialize audio system on first user interaction
    unlockAudio(); // Try to unlock audio
    playSound("buttonHover");
    startGame();
  });
  leaderboardButton.addEventListener("click", () => {
    playSound("buttonHover");
    showLeaderboard();
  });
  helpButton.addEventListener("click", () => {
    playSound("buttonHover");
    showHelp();
  });
  backFromLeaderboardButton.addEventListener("click", () => {
    playSound("buttonHover");
    showMainMenu();
  });
  backFromHelpButton.addEventListener("click", () => {
    playSound("buttonHover");
    showMainMenu();
  });

  // Game over buttons
  restartButton.addEventListener("click", () => {
    playSound("buttonHover");
    startGame();
  });
  mainMenuButton.addEventListener("click", () => {
    playSound("buttonHover");
    returnToMainMenu();
  });

  // Pause menu buttons
  pauseButton.addEventListener("click", () => {
    playSound("buttonHover");
    if (isGamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  });

  resumeButton.addEventListener("click", () => {
    playSound("buttonHover");
    resumeGame();
  });

  pauseMainMenuButton.addEventListener("click", () => {
    playSound("buttonHover");
    returnToMainMenu();
  });

  // High score dialog
  const saveScoreButton = document.getElementById("save-score-button");
  const playerNameInput = document.getElementById("player-name-input");
  const highScoreDialog = document.getElementById("high-score-dialog");
  const highScoreDialogOverlay = document.getElementById(
    "high-score-dialog-overlay"
  );

  // Only add event listeners if elements exist
  if (saveScoreButton) {
    saveScoreButton.addEventListener("click", () => {
      playSound("buttonHover");
      savePlayerHighScore();
    });
  }

  // Allow saving high score with Enter key
  if (playerNameInput) {
    playerNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        savePlayerHighScore();
      }
    });
  }

  // Function to save high score and close dialog
  function savePlayerHighScore() {
    const playerName = playerNameInput.value.trim() || "Anonymous";

    // Save to leaderboard
    const leaderboardPosition = saveHighScore(playerName, score, survivalTime);

    // Close dialog
    highScoreDialog.style.display = "none";
    highScoreDialogOverlay.style.display = "none";

    // Reset input field
    playerNameInput.value = "";

    // Show message about position on leaderboard
    console.log(`Score saved! Position on leaderboard: ${leaderboardPosition}`);
  }

  // Button hover sound effects
  const allButtons = document.querySelectorAll("button");
  allButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => playSound("buttonHover"));
  });

  window.addEventListener("mousemove", (e) => {
    // Only track mouse position if the game is running
    if (isGameRunning) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
  });
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    },
    { passive: false }
  );
  // Add keyboard event listener for thunder strike ability and pause
  window.addEventListener("keydown", (e) => {
    if (isGameRunning && (e.code === "Space" || e.key === " ")) {
      // Prevent default space bar action (like scrolling)
      e.preventDefault();

      // Try to trigger thunder strike when space is pressed
      if (player && player.thunderShieldActive && !isGamePaused) {
        const strikeSuccess = player.triggerThunderStrike();

        // Show visual feedback
        if (!strikeSuccess && player.thunderStrikeCooldown > 0) {
          // Show cooldown message
          showEventText("⚡ Thunder Strike cooling down! ⚡");
        }
      }
    }

    // Pause/Resume with ESC or P key
    if (
      isGameRunning &&
      (e.code === "Escape" ||
        e.key === "Escape" ||
        e.code === "KeyP" ||
        e.key === "p" ||
        e.key === "P")
    ) {
      e.preventDefault();
      if (isGamePaused) {
        resumeGame();
      } else {
        pauseGame();
      }
    }
  });

  // CRITICAL: Mouse movement event listeners for player control
  window.addEventListener("mousemove", (e) => {
    if (isGameRunning && !isGamePaused) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
  });

  // Touch support for mobile
  canvas.addEventListener("touchmove", (e) => {
    if (isGameRunning && !isGamePaused) {
      e.preventDefault();
      const touch = e.touches[0];
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    }
  });

  canvas.addEventListener("touchstart", (e) => {
    if (isGameRunning && !isGamePaused) {
      e.preventDefault();
      const touch = e.touches[0];
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    }
  });

  window.addEventListener("resize", () => {
    if (!isGameRunning) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    nebulae = Array(5)
      .fill(null)
      .map(() => createNebula());
  });

  // --- Initial Draw ---
  // Initialize UI state
  document.body.classList.add("menu-active");
  uiElements.mainMenuContainer.style.display = "flex";
  showMainMenu(); // Make sure the main menu panel is visible, not leaderboard/help
  uiElements.gameOverScreen.style.display = "none";
  // Don't hide score container - it will be shown when game starts
  // uiElements.scoreContainer.style.opacity = "0";

  // Set up canvas and background elements
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);

  // Create nebulae background
  // Define createNebula locally if it's not available globally
  const createNebulaLocal = function () {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 150 + Math.random() * 100; // Simple fallback values
    const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
    const colors = [
      "rgba(0, 255, 255, 0.03)",
      "rgba(170, 102, 204, 0.03)",
      "rgba(51, 181, 229, 0.03)",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    grad.addColorStop(0, color.replace("0.03)", "0.06)"));
    grad.addColorStop(1, color);
    return grad;
  };

  // Use global function if available, otherwise use local function
  const nebulaCreator = window.createNebula || createNebulaLocal;

  nebulae = Array(5)
    .fill(null)
    .map(() => nebulaCreator());
  nebulae.forEach((n) => {
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, width, height);
  });

  // Create stars
  stars = [];
  for (let i = 0; i < 3; i++) {
    const layer = (i + 1) / 3;
    for (let j = 0; j < 80; j++)
      stars.push(
        new Star(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 1.5 * layer,
          layer
        )
      );
  }
  stars.forEach((s) => s.draw());

  // Load high score and best time from local storage
  highScore = parseInt(
    localStorage.getItem(GAME_CONFIG.advanced.localStorageKey) || 0
  );
  bestTime = parseInt(localStorage.getItem("stellarDriftBestTime") || 0);
  uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;

  // Initialize personal best display
  updatePersonalBestDisplay();

  // Initialize leaderboard
  updateLeaderboard();

  // Initialize dashboard functionality
  if (typeof initializeDashboard === "function") {
    initializeDashboard();
  }

  // Close DOMContentLoaded event handler
});
