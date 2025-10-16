// Menu System Functions
// Handles all menu navigation and UI state transitions

// Function to show the main menu screen (hides other screens)
function showMainMenu() {
  // Hide other screens
  uiElements.leaderboardScreen.style.display = "none";
  uiElements.helpScreen.style.display = "none";

  // Show main menu screen
  uiElements.mainMenuScreen.style.display = "flex";
  uiElements.mainMenuScreen.classList.add("active");

  // Ensure menu-active class is on body for cursor styling
  document.body.classList.add("menu-active");
}

// Function to show the leaderboard screen
function showLeaderboard() {
  // Hide main menu screen
  uiElements.mainMenuScreen.style.display = "none";
  uiElements.mainMenuScreen.classList.remove("active");
  uiElements.helpScreen.style.display = "none";

  // Show leaderboard screen
  uiElements.leaderboardScreen.style.display = "flex";
  uiElements.leaderboardScreen.classList.add("active");

  // Ensure menu-active class is on body for cursor styling
  document.body.classList.add("menu-active");

  // Populate leaderboard data
  updateLeaderboard();
}

// Function to show the help screen
function showHelp() {
  // Hide main menu screen
  uiElements.mainMenuScreen.style.display = "none";
  uiElements.mainMenuScreen.classList.remove("active");
  uiElements.leaderboardScreen.style.display = "none";

  // Show help screen
  uiElements.helpScreen.style.display = "flex";
  uiElements.helpScreen.classList.add("active");

  // Ensure menu-active class is on body for cursor styling
  document.body.classList.add("menu-active");
}

// Function to handle cloud saving/uploading issues
function handleCloudSaveIssue(error) {
  console.error('Cloud save error:', error);
  
  // Create and show a notification
  const notification = document.createElement('div');
  notification.className = 'cloud-save-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h3>Cloud Save Error</h3>
      <p>There was a problem accessing cloud storage:</p>
      <p class="error-message">${error.message || 'File permission error'}</p>
      <p>Possible solutions:</p>
      <ul>
        <li>Check browser permissions for file access</li>
        <li>Try a different browser</li>
        <li>Make sure you're using HTTPS</li>
        <li>Check S3 bucket CORS configuration</li>
      </ul>
      <button id="close-notification">Close</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Add event listener to close button
  document.getElementById('close-notification').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-close after 15 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 15000);
}

// Function to update the leaderboard with current data
function updateLeaderboard() {
  // Get leaderboard data from localStorage
  const leaderboardData = loadLeaderboardData();

  // Clear current list
  uiElements.leaderboardList.innerHTML = "";

  // Check if we have any entries
  if (leaderboardData.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.classList.add("leaderboard-empty");
    emptyMessage.textContent = "No high scores yet. Be the first!";
    uiElements.leaderboardList.appendChild(emptyMessage);
    return;
  }

  // Add entries to the leaderboard
  leaderboardData.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.classList.add("leaderboard-entry");

    entryElement.innerHTML = `
      <span class="leaderboard-rank">${index + 1}</span>
      <span class="leaderboard-name">${entry.name}</span>
      <span class="leaderboard-score">${entry.score}</span>
    `;

    uiElements.leaderboardList.appendChild(entryElement);
  });
}

// Function to load leaderboard data from storage
function loadLeaderboardData() {
  // Try to get data from localStorage
  const savedData = localStorage.getItem(GAME_CONFIG.advanced.leaderboardKey);

  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error("Error parsing leaderboard data:", e);
      return getDefaultLeaderboardData();
    }
  }

  // Return default data if none exists
  return getDefaultLeaderboardData();
}

// Function to save a new high score to the leaderboard
function saveHighScore(name, score, time) {
  const leaderboard = loadLeaderboardData();

  // Add new entry
  leaderboard.push({
    name: name || "Player",
    score: score,
    time: time,
  });

  // Sort by score (descending)
  leaderboard.sort((a, b) => b.score - a.score);

  // Keep only top 10 scores
  const topScores = leaderboard.slice(0, 10);

  // Save back to localStorage
  localStorage.setItem(
    GAME_CONFIG.advanced.leaderboardKey,
    JSON.stringify(topScores)
  );

  // Return position on leaderboard (1-based index)
  return (
    topScores.findIndex(
      (entry) => entry.score === score && entry.name === name
    ) + 1
  );
}

// Function to get default leaderboard data for first time users
function getDefaultLeaderboardData() {
  return [
    { name: "Cosmic", score: 9500, time: 125 },
    { name: "Stellar", score: 8200, time: 110 },
    { name: "Nebula", score: 7300, time: 95 },
    { name: "Nova", score: 6100, time: 85 },
    { name: "Comet", score: 5000, time: 75 },
  ];
}
