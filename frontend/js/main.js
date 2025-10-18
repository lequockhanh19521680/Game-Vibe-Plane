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
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const leaderboardButton = document.getElementById("leaderboard-button");
const howToPlayButton = document.getElementById("how-to-play-button");
const settingsButton = document.getElementById("settings-button");
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

let width, height;
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
  wormholes,
  magneticStorms,
  lightningStorms;
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
let isPaused = false;
let globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed;
let nebulae = [];
let nextEventScore = GAME_CONFIG.events.interval;
let eventActive = { type: null, endTime: 0 };

function startGame() {
  gameStateManager.changeState("playing");
}
function endGame(reason = "unknown") {
  if (!isGameRunning) return;
  console.log(`Game Over! Reason: ${reason}`);
  cancelAnimationFrame(animationFrameId);
  gameStateManager.changeState("gameOver", { reason });
}

function togglePause() {
  if (isPaused) {
    gameStateManager.changeState("playing");
  } else {
    gameStateManager.changeState("paused");
  }
}

// --- Event Listeners ---
startButton.addEventListener("click", (e) => {
  // Prevent default if button is disabled
  if (startButton.classList.contains("disabled") || startButton.disabled) {
    e.preventDefault();
    e.stopPropagation();

    // Focus on name input to guide user
    if (window.playerNameUI) {
      window.playerNameUI.show();
    }

    // Show a brief message
    if (typeof showEventText === "function") {
      showEventText("Please enter your name first!");
    }

    return false;
  }

  playSound("buttonHover");

  // Double-check if player has a valid name
  if (window.playerNameUI && !window.playerNameUI.hasValidName()) {
    window.playerNameUI.show();

    if (typeof showEventText === "function") {
      showEventText("Please enter a valid name!");
    }

    return;
  }

  // Save the name before starting
  if (window.playerNameUI) {
    window.playerNameUI.saveName();
  }

  startGame();
});
restartButton.addEventListener("click", () => {
  playSound("buttonHover");
  startGame();
});

leaderboardButton.addEventListener("click", () => {
  initAudioSystem();
  playSound("buttonHover");
  gameStateManager.changeState("leaderboard");
});

howToPlayButton.addEventListener("click", () => {
  initAudioSystem();
  playSound("buttonHover");
  gameStateManager.changeState("howToPlay");
});

// settingsButton.addEventListener("click", () => {
//   initAudioSystem();
//   playSound("buttonHover");
//   if (window.settingsUI) {
//     window.settingsUI.show();
//   }
// });

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
  togglePause();
});

restartFromPauseButton.addEventListener("click", () => {
  playSound("buttonHover");
  togglePause();
  startGame();
});

mainMenuFromPauseButton.addEventListener("click", () => {
  playSound("buttonHover");
  togglePause();
  isGameRunning = false;
  uiElements.pauseButton.style.display = "none";
  uiElements.topBar.style.opacity = GAME_CONFIG.ui.topBarHiddenOpacity;

  // Clear the canvas and redraw the starfield background
  ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  if (stars && stars.length > 0) {
    stars.forEach((s) => s.draw());
  }

  gameStateManager.changeState("menu");
});

mainMenuFromOverButton.addEventListener("click", () => {
  playSound("buttonHover");
  uiElements.gameOverScreen.style.display = "none";

  // Clear the canvas and redraw the starfield background
  ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  if (stars && stars.length > 0) {
    stars.forEach((s) => s.draw());
  }

  gameStateManager.changeState("menu");
});

// Button hover sound effects
startButton.addEventListener("mouseenter", () => playSound("buttonHover"));
restartButton.addEventListener("mouseenter", () => playSound("buttonHover"));

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
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
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  if (!isGameRunning) {
    // Redraw background if not in game
    ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    nebulae = Array(5)
      .fill(null)
      .map(() => createNebula());
    nebulae.forEach((n) => {
      ctx.fillStyle = n;
      ctx.fillRect(0, 0, width, height);
    });
    stars.forEach((s) => s.draw());
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "Escape") {
    if (isGameRunning) {
      togglePause();
    }
  }
});

// --- Initial Setup ---
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;

// Initialize background elements
nebulae = Array(GAME_CONFIG.visual.nebula.count)
  .fill(null)
  .map(() => createNebula());

stars = [];
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

// Initialize user identification
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

// Initialize everything
async function initializeApp() {
  // Initialize user identification first
  await initializeUserIdentification();

  // Initialize secure API endpoints
  if (window.BackendAPI && window.BackendAPI.initialize) {
    await window.BackendAPI.initialize();
  }

  // Initialize game settings
  if (window.gameSettings) {
    await window.gameSettings.initialize();
  }

  // Initialize settings UI
  if (window.settingsUI) {
    window.settingsUI.initialize();
  }

  // Initialize player name UI
  if (window.playerNameUI) {
    window.playerNameUI.initialize();
  }

  // Start in menu state
  gameStateManager.changeState("menu");
}

// Start the app
initializeApp();
