// Common UI definitions and variables
// This file defines common UI elements that are used across different UI modules

// UI Elements object that stores references to DOM elements
const uiElements = {
  // Main UI containers
  mainMenuContainer: document.getElementById("main-menu-container"),
  gameOverScreen: document.getElementById("game-over-screen"),
  scoreContainer: document.getElementById("score-container"),

  // Main menu panels
  mainMenuScreen: document.getElementById("main-menu-screen"),
  leaderboardScreen: document.getElementById("leaderboard-screen"),
  helpScreen: document.getElementById("help-screen"),

  // In-game display elements
  scoreDisplay: document.getElementById("score-display"),
  timeDisplay: document.getElementById("survival-display"), // Points to the same element as survivalDisplay
  highscoreDisplay: document.getElementById("highscore-display"),
  survivalDisplay: document.getElementById("survival-display"),

  // Game over elements
  finalScoreEl: document.getElementById("final-score"),
  finalTimeEl: document.getElementById("final-time"),
  newHighscoreMsg: document.getElementById("new-highscore-msg"),
  eventText: document.getElementById("event-text"),

  // Leaderboard elements
  leaderboardList: document.getElementById("leaderboard-list"),

  // Pause menu elements
  pauseButton: document.getElementById("pause-button"),
  pauseMenu: document.getElementById("pause-menu"),

  // New UI panels
  leftGamePanel: document.getElementById("left-game-panel"),
  rightGamePanel: document.getElementById("right-game-panel"),
  liveLeaderboard: document.getElementById("live-leaderboard"),
  leaderboardConnectionStatus: document.getElementById(
    "leaderboard-connection-status"
  ),
  leaderboardContent: document.getElementById("leaderboard-content"),
};
