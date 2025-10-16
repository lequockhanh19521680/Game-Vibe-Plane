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
  highScore = 0;
let gameStartTime = 0,
  survivalTime = 0;
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

document.addEventListener("DOMContentLoaded", function () {
  // --- Constants & Variables ---
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

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

  function startGame() {
    // Initialize audio system first (will only work after user interaction)
    if (typeof initAudioSystem === "function") {
      initAudioSystem();
    }

    // Hide cursor during gameplay
    document.body.classList.remove("menu-active");
    document.body.classList.remove("game-over");
    document.body.classList.add("game-running");

    // Initialize game
    if (typeof window.init === "function") {
      window.init();
    } else {
      console.error("Init function not defined. Game initialization failed.");
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

    // Hide menu and game over screen
    uiElements.mainMenuContainer.style.display = "none";
    uiElements.gameOverScreen.style.display = "none";

    // Show score container
    uiElements.scoreContainer.style.opacity = "1";
  }

  // Function to return to main menu
  function returnToMainMenu() {
    // Hide game over screen
    uiElements.gameOverScreen.style.display = "none";

    // Show main menu container
    uiElements.mainMenuContainer.style.display = "flex";

    // Make sure cursor is visible and remove game-over class
    document.body.classList.remove("game-running");
    document.body.classList.remove("game-over");

    // Make sure we're showing the main menu panel, not leaderboard or help
    showMainMenu();

    // Hide in-game UI
    uiElements.scoreContainer.style.opacity = "0";

    // Reset game state
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    stopBackgroundMusic();
  }
  // Make endGame function globally available
  window.endGame = function (reason = "unknown") {
    if (!isGameRunning) return;
    console.log(`Game Over! Reason: ${reason}`);
    isGameRunning = false;
    // Show cursor when game ends
    document.body.classList.remove("game-running");
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

    // Check for high score
    const isHighScore = score > highScore;
    if (isHighScore) {
      highScore = score;
      localStorage.setItem(GAME_CONFIG.advanced.localStorageKey, highScore);
      uiElements.newHighscoreMsg.style.display = "block";

      // Show high score dialog after a short delay
      setTimeout(() => {
        // Display the score in the dialog
        document.getElementById("dialog-score").textContent = score;

        // Show dialog
        document.getElementById("high-score-dialog-overlay").style.display =
          "block";
        document.getElementById("high-score-dialog").style.display = "flex";

        // Focus on input field
        document.getElementById("player-name-input").focus();
      }, 1500);
    } else {
      uiElements.newHighscoreMsg.style.display = "none";
    }
    setTimeout(() => {
      uiElements.finalScoreEl.innerText = `Your Score: ${score}`;
      uiElements.finalTimeEl.innerText = `Survival Time: ${timeFormatted}`;
      uiElements.gameOverScreen.style.display = "flex";
      uiElements.scoreContainer.style.opacity = "0";
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

  // High score dialog
  const saveScoreButton = document.getElementById("save-score-button");
  const playerNameInput = document.getElementById("player-name-input");
  const highScoreDialog = document.getElementById("high-score-dialog");
  const highScoreDialogOverlay = document.getElementById(
    "high-score-dialog-overlay"
  );

  saveScoreButton.addEventListener("click", () => {
    playSound("buttonHover");
    savePlayerHighScore();
  });

  // Allow saving high score with Enter key
  playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      savePlayerHighScore();
    }
  });

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
  // Add keyboard event listener for thunder strike ability
  window.addEventListener("keydown", (e) => {
    if (isGameRunning && (e.code === "Space" || e.key === " ")) {
      // Prevent default space bar action (like scrolling)
      e.preventDefault();

      // Try to trigger thunder strike when space is pressed
      if (player && player.thunderShieldActive) {
        const strikeSuccess = player.triggerThunderStrike();

        // Show visual feedback
        if (!strikeSuccess && player.thunderStrikeCooldown > 0) {
          // Show cooldown message
          showEventText("⚡ Thunder Strike cooling down! ⚡");
        }
      }
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
  uiElements.scoreContainer.style.opacity = "0";

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

  // Load high score from local storage
  highScore = parseInt(
    localStorage.getItem(GAME_CONFIG.advanced.localStorageKey) || 0
  );
  uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;

  // Initialize leaderboard
  updateLeaderboard();

  // Close DOMContentLoaded event handler
});
