// Menu System Functions
// Handles all menu navigation and UI state transitions

// Function to show the main menu screen (hides other screens)
function showMainMenu() {
  uiElements.leaderboardScreen.style.display = "none";
  uiElements.howToPlayScreen.style.display = "none";
  uiElements.startScreen.style.display = "flex";
}

// Function to show the leaderboard screen
function showLeaderboard() {
  uiElements.startScreen.style.display = "none";
  uiElements.howToPlayScreen.style.display = "none";
  uiElements.leaderboardScreen.style.display = "flex";
  // Call function to populate leaderboard data
  updateLeaderboard();
}

// Function to show the how-to-play screen
function showHowToPlay() {
  uiElements.startScreen.style.display = "none";
  uiElements.leaderboardScreen.style.display = "none";
  uiElements.howToPlayScreen.style.display = "flex";
}

// Function to update the leaderboard with current data
async function updateLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "<li>Loading...</li>"; // Placeholder

  // Fetch and display leaderboard data
  // This is a placeholder. You'll need to implement the actual data fetching
  // from local storage or a backend.
  setTimeout(() => {
    const fakeData = [
      { name: "Player1", score: 10000 },
      { name: "Player2", score: 8500 },
      { name: "Player3", score: 7200 },
    ];
    leaderboardList.innerHTML = fakeData
      .map((item) => `<li>${item.name}: ${item.score}</li>`)
      .join("");
  }, 1000);

  const playerStats = document.getElementById("player-stats");
  playerStats.innerHTML = "<li>Loading...</li>";
  setTimeout(() => {
    const fakeStats = `
            <li>High Score: ${highScore}</li>
            <li>Games Played: 10</li>
            <li>Time Played: 2h 15m</li>
        `;
    playerStats.innerHTML = fakeStats;
  }, 1000);
}

// Tab switching for dashboard
const tabs = document.querySelectorAll(".dashboard-tab");
const contents = document.querySelectorAll(".dashboard-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    contents.forEach((item) => item.classList.remove("active"));

    tab.classList.add("active");
    const contentId = tab.getAttribute("data-tab");
    document.getElementById(`${contentId}-content`).classList.add("active");
  });
});
