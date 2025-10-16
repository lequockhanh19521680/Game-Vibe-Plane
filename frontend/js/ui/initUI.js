// UI Initialization Functions
// This file handles initializing the UI components and state management

// Function that runs when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  // Set up initial UI state
  initializeUI();

  // Add menu button hover sounds
  setupButtonSounds();
});

// Initialize UI state
function initializeUI() {
  // Hide leaderboard and help panels initially
  if (uiElements.leaderboardScreen) {
    uiElements.leaderboardScreen.style.display = "none";
    uiElements.leaderboardScreen.classList.remove("active");
  }

  if (uiElements.helpScreen) {
    uiElements.helpScreen.style.display = "none";
    uiElements.helpScreen.classList.remove("active");
  }

  // Show main menu panel
  if (uiElements.mainMenuScreen) {
    uiElements.mainMenuScreen.style.display = "flex";
    uiElements.mainMenuScreen.classList.add("active");
  }

  // Hide in-game UI
  if (uiElements.scoreContainer) {
    uiElements.scoreContainer.style.opacity = "0";
  }

  // Hide game over screen
  if (uiElements.gameOverScreen) {
    uiElements.gameOverScreen.style.display = "none";
  }
}

// Set up hover sounds for all buttons
function setupButtonSounds() {
  // Get all buttons
  const allButtons = document.querySelectorAll("button");

  // Add hover sound effect
  allButtons.forEach((button) => {
    if (typeof playSound === "function") {
      button.addEventListener("mouseenter", () => playSound("buttonHover"));
    }
  });
}

// Export these functions for use in other files if using modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeUI,
    setupButtonSounds,
  };
}
