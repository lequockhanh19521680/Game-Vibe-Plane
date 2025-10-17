// --- Constants & Variables ---
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const uiElements = {
  startScreen: document.getElementById("start-screen"),
  gameOverScreen: document.getElementById("game-over-screen"),
  scoreContainer: document.getElementById("score-container"),
  scoreDisplay: document.getElementById("score-display"),
  levelDisplay: document.getElementById("level-display"),
  timeDisplay: document.getElementById("time-display"),
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
  superNovas,
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
let nextEventScore = 1000;
let eventActive = { type: null, endTime: 0 };

function startGame() {
  init();
  animate();
  playSound("backgroundMusic");
  uiElements.startScreen.style.display = "none";
  uiElements.gameOverScreen.style.display = "none";
  uiElements.scoreContainer.style.opacity = "1";
  uiElements.pauseButton.style.display = "block";
}
function endGame(reason = "unknown") {
  if (!isGameRunning) return;
  console.log(`Game Over! Reason: ${reason}`);
  isGameRunning = false;
  uiElements.pauseButton.style.display = "none";
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
  score = ~~score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(GAME_CONFIG.advanced.localStorageKey, highScore);
    uiElements.newHighscoreMsg.style.display = "block";
  } else {
    uiElements.newHighscoreMsg.style.display = "none";
  }
  setTimeout(() => {
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    uiElements.finalScoreEl.innerText = `Your Score: ${score}`;
    uiElements.finalTimeEl.innerText = `Survival Time: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
    uiElements.gameOverScreen.style.display = "flex";
    uiElements.scoreContainer.style.opacity = "0";
  }, 1000);
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    uiElements.pauseMenu.style.display = "flex";
    cancelAnimationFrame(animationFrameId);
  } else {
    uiElements.pauseMenu.style.display = "none";
    animate();
  }
}

// --- Event Listeners ---
startButton.addEventListener("click", () => {
  playSound("buttonHover");
  startGame();
});
restartButton.addEventListener("click", () => {
  playSound("buttonHover");
  startGame();
});

leaderboardButton.addEventListener("click", () => {
  playSound("buttonHover");
  showLeaderboard();
});

howToPlayButton.addEventListener("click", () => {
  playSound("buttonHover");
  showHowToPlay();
});

backToMainMenuButton.addEventListener("click", () => {
  playSound("buttonHover");
  showMainMenu();
});

backToMainFromHowToPlayButton.addEventListener("click", () => {
  playSound("buttonHover");
  showMainMenu();
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
  uiElements.scoreContainer.style.opacity = "0";

  // Clear the canvas and redraw the starfield background
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);
  if (stars && stars.length > 0) {
    stars.forEach((s) => s.draw());
  }

  showMainMenu();
});

mainMenuFromOverButton.addEventListener("click", () => {
  playSound("buttonHover");
  uiElements.gameOverScreen.style.display = "none";

  // Clear the canvas and redraw the starfield background
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);
  if (stars && stars.length > 0) {
    stars.forEach((s) => s.draw());
  }

  showMainMenu();
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
  if (!isGameRunning) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  nebulae = Array(5)
    .fill(null)
    .map(() => createNebula());
});

window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "Escape") {
    if (isGameRunning) {
      togglePause();
    }
  }
});

// --- Initial Draw ---
uiElements.startScreen.style.display = "flex";
uiElements.gameOverScreen.style.display = "none";
uiElements.scoreContainer.style.opacity = "0";
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;
ctx.fillStyle = "#050510";
ctx.fillRect(0, 0, width, height);
nebulae = Array(5)
  .fill(null)
  .map(() => createNebula());
nebulae.forEach((n) => {
  ctx.fillStyle = n;
  ctx.fillRect(0, 0, width, height);
});
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
uiElements.highscoreDisplay.innerText = `High Score: ${
  localStorage.getItem(GAME_CONFIG.advanced.localStorageKey) || 0
}`;
