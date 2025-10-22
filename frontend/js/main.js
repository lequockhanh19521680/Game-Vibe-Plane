// --- Constants & Variables ---
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const uiElements = {
  startScreen: document.getElementById("start-screen"),
  gameOverScreen: document.getElementById("game-over-screen"),
  topBar: document.getElementById("top-bar"),
  scoreDisplay: document.getElementById("score-display"),
  levelDisplay: document.getElementById("level-display"),
  highscoreDisplay: document.getElementById("highscore-display"),
  survivalDisplay: document.getElementById("survival-display"),
  finalScoreEl: document.getElementById("final-score"),
  finalTimeEl: document.getElementById("final-time"),
  newHighscoreMsg: document.getElementById("new-highscore-msg"),
  eventText: document.getElementById("event-text"),
  leaderboardScreen: document.getElementById("leaderboard-screen"),
  howToPlayScreen: document.getElementById("how-to-play-screen"),
  pauseMenu: document.getElementById("pause-menu"),
  pauseButton: document.getElementById("pause-button"),
};
// Button references (assuming they exist in index.html)
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const leaderboardButton = document.getElementById("leaderboard-button");
const howToPlayButton = document.getElementById("how-to-play-button");
const backToMainMenuButton = document.getElementById(
  "back-to-main-menu-button"
);
const backToMainFromHowToPlayButton = document.getElementById(
  "back-to-main-from-how-to-play-button"
);
const resumeButton = document.getElementById("resume-button");
const restartFromPauseButton = document.getElementById(
  "restart-from-pause-button"
);
const mainMenuFromPauseButton = document.getElementById(
  "main-menu-from-pause-button"
);
const mainMenuFromOverButton = document.getElementById(
  "main-menu-from-over-button"
);

// Game state variables
let width, height;
let player,
  stars,
  asteroids,
  particles,
  lasers,
  blackHoles,
  missiles,
  laserMines;
let crystalClusters,
  fragments,
  warnings,
  energyOrbs,
  plasmaFields,
  crystalShards;
let shieldGenerators,
  freezeZones,
  magneticStorms,
  lightningStorms,
  decoyPowerUps;
// REMOVED: Unused portal arrays
// let quantumPortals, wormholes;

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
  energyOrb: 0,
};
let spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval;
let isGameRunning = false;
let isPaused = false;
let globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed;
let nebulae = [];
let nextEventScore = GAME_CONFIG.events.interval;
let eventActive = { type: null, endTime: 0 };

function startGame() {
  // Use gameStateManager to handle state transitions
  gameStateManager.changeState("playing", { restart: true });
}

function togglePause() {
  if (isGameRunning) {
    // Only allow pause if game is running
    if (isPaused) {
      gameStateManager.changeState("playing"); // Resume
    } else {
      gameStateManager.changeState("paused"); // Pause
    }
  }
}

// --- Event Listeners ---
startButton.addEventListener("click", (e) => {
  // Check if button is disabled (name not valid)
  if (startButton.classList.contains("disabled") || startButton.disabled) {
    e.preventDefault();
    e.stopPropagation();
    // Prompt user to enter name
    if (window.playerNameUI) {
      window.playerNameUI.show();
    }
    if (typeof showEventText === "function") {
      showEventText("Please enter your name first!");
    }
    return false;
  }
  // Play sound and check name validity again
  playSound("buttonHover");
  if (window.playerNameUI && !window.playerNameUI.hasValidName()) {
    window.playerNameUI.show(); // Focus the input again
    if (typeof showEventText === "function") {
      showEventText("Please enter a valid name (2-20 characters)!");
    }
    return;
  }
  // Save name and start game
  if (window.playerNameUI) {
    window.playerNameUI.saveName();
  }
  startGame();
});

restartButton.addEventListener("click", () => {
  playSound("buttonHover");
  startGame(); // Let startGame handle the reset via gameStateManager
});

leaderboardButton.addEventListener("click", () => {
  initAudioSystem(); // Ensure audio is ready
  playSound("buttonHover");
  gameStateManager.changeState("leaderboard");
});

howToPlayButton.addEventListener("click", () => {
  initAudioSystem();
  playSound("buttonHover");
  gameStateManager.changeState("howToPlay");
});

backToMainMenuButton.addEventListener("click", () => {
  playSound("buttonHover");
  gameStateManager.changeState("menu");
});

backToMainFromHowToPlayButton.addEventListener("click", () => {
  playSound("buttonHover");
  gameStateManager.changeState("menu");
});

uiElements.pauseButton.addEventListener("click", () => {
  playSound("buttonHover");
  togglePause();
});

resumeButton.addEventListener("click", () => {
  playSound("buttonHover");
  togglePause(); // Will transition back to 'playing' state
});

restartFromPauseButton.addEventListener("click", () => {
  playSound("buttonHover");
  // Let gameStateManager handle the full reset
  gameStateManager.changeState("playing", { restart: true });
});

mainMenuFromPauseButton.addEventListener("click", () => {
  playSound("buttonHover");
  // Cleanly exit to main menu via gameStateManager
  gameStateManager.changeState("menu");
});

mainMenuFromOverButton.addEventListener("click", () => {
  playSound("buttonHover");
  // Cleanly exit to main menu via gameStateManager
  gameStateManager.changeState("menu");
});

// Mouse movement listener
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Touch movement listener (passive: false to allow preventDefault)
window.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 0) {
      // Prevent scrolling page only when game is active and not paused
      if (isGameRunning && !isPaused) {
        e.preventDefault();
      }
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  },
  { passive: false }
);

// Resize listener
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  // Redraw background elements if not currently playing
  if (!isGameRunning) {
    if (ctx) {
      // Check if ctx exists before drawing
      ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      nebulae = Array(GAME_CONFIG.visual.nebula.count)
        .fill(null)
        .map(() => createNebula());
      nebulae.forEach((n) => {
        ctx.fillStyle = n;
        ctx.fillRect(0, 0, width, height);
      });
      if (stars && stars.length > 0) {
        stars.forEach((s) => s.draw());
      }
    }
  }
});

// Keyboard listener for pause
window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "Escape") {
    // Only toggle pause if game is running
    if (isGameRunning) {
      togglePause();
    }
  }
});

// --- Initial Setup ---
function setupInitialBackground() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  nebulae = Array(GAME_CONFIG.visual.nebula.count)
    .fill(null)
    .map(() => createNebula());
  stars = []; // Initialize stars array
  for (let i = 0; i < GAME_CONFIG.visual.stars.layers; i++) {
    const layer = (i + 1) / GAME_CONFIG.visual.stars.layers;
    for (let j = 0; j < GAME_CONFIG.visual.stars.starsPerLayer; j++)
      stars.push(
        new Star(
          Math.random() * width,
          Math.random() * height,
          Math.random() * GAME_CONFIG.visual.stars.maxRadius * layer,
          layer
        )
      );
  }
  // Load high score
  highScore = localStorage.getItem(GAME_CONFIG.core.localStorageKey) || 0;
  if (uiElements.highscoreDisplay) {
    uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;
  }
}

async function initializeUserIdentification() {
  try {
    if (window.userIdentification) {
      await window.userIdentification.initialize();
      console.log("User identification initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing user identification:", error);
  }
}

// App Initialization Function
async function initializeApp() {
  const loadingScreen = document.getElementById("loading-screen");

  setupInitialBackground(); // Setup background visuals first

  // Initialize systems concurrently where possible
  await Promise.all([
    initializeUserIdentification(),
    window.BackendAPI?.initialize(),
    window.gameSettings?.initialize(),
  ]);

  // Initialize UI components that depend on settings/user ID
  window.settingsUI?.initialize();
  window.playerNameUI?.initialize();
  window.initializeDashboard?.(); // Assumes this function exists in dashboard.js

  // Set up hover sounds for all buttons after UI is potentially modified
  document.querySelectorAll("button").forEach((button) => {
    if (typeof playSound === "function") {
      button.addEventListener("mouseenter", () => playSound("buttonHover"));
    }
  });

  // Start in the menu state
  gameStateManager.changeState("menu");

  // Hide loading screen
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    // Remove element after transition for cleaner DOM
    setTimeout(() => {
      loadingScreen.style.display = "none";
      // Optional: loadingScreen.remove();
    }, 500); // Match CSS transition duration
  }
}

// Start the application initialization
initializeApp();
