// Dashboard functionality for leaderboard screen

// Tab switching functionality
function initializeDashboard() {
  const tabButtons = document.querySelectorAll(".dashboard-tab");
  const tabContents = document.querySelectorAll(".dashboard-tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      button.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");

      // Load data for the active tab
      loadTabData(tabName);
    });
  });

  // Filter buttons for global leaderboard
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Remove active class from all filter buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Load filtered leaderboard
      loadLeaderboard(filter);
    });
  });

  // Initialize with personal tab data
  loadPersonalStats();
}

// Load data based on active tab
function loadTabData(tabName) {
  switch (tabName) {
    case "personal":
      loadPersonalStats();
      break;
    case "global":
      loadLeaderboard("all");
      break;
    case "analytics":
      loadDeathAnalytics();
      break;
  }
}

// Load personal statistics
function loadPersonalStats() {
  // Get stats from localStorage
  const highScore = parseInt(
    localStorage.getItem("stellarDriftHighScore") || 0
  );
  const bestTime = parseInt(localStorage.getItem("stellarDriftBestTime") || 0);
  const gamesPlayed = parseInt(
    localStorage.getItem("stellarDriftGamesPlayed") || 0
  );
  const totalDeaths = parseInt(
    localStorage.getItem("stellarDriftTotalDeaths") || 0
  );

  // Update dashboard
  document.getElementById("dash-high-score").textContent =
    highScore.toLocaleString();

  const minutes = Math.floor(bestTime / 60);
  const seconds = bestTime % 60;
  document.getElementById("dash-best-time").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  document.getElementById("dash-games-played").textContent = gamesPlayed;
  document.getElementById("dash-total-deaths").textContent = totalDeaths;
}

// Load leaderboard with filter
async function loadLeaderboard(filter = "all") {
  const leaderboardList = document.getElementById("leaderboard-list");

  try {
    if (!navigator.onLine) {
      throw new Error("No internet connection");
    }

    leaderboardList.innerHTML =
      '<div class="leaderboard-loading">Loading...</div>';

    if (window.BackendAPI) {
      let data;
      if (filter === "country") {
        // Get user's country and filter by it
        data = await window.BackendAPI.fetchLeaderboardByCountry();
      } else {
        data = await window.BackendAPI.fetchLeaderboard(10);
      }

      if (data && data.leaderboard && data.leaderboard.length > 0) {
        displayLeaderboard(data.leaderboard);
      } else {
        leaderboardList.innerHTML =
          '<p class="leaderboard-empty">No scores yet. Be the first!</p>';
      }
    } else {
      throw new Error("Backend not available");
    }
  } catch (error) {
    leaderboardList.innerHTML =
      '<p class="leaderboard-empty">Failed to load leaderboard</p>';
    console.error("Leaderboard error:", error);
  }
}

// Display leaderboard entries
function displayLeaderboard(entries) {
  const leaderboardList = document.getElementById("leaderboard-list");

  const entriesHTML = entries
    .map(
      (entry, index) => `
    <div class="leaderboard-entry">
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-name">${entry.username}${
        entry.country ? " " + getFlagEmoji(entry.country) : ""
      }</span>
      <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
    </div>
  `
    )
    .join("");

  leaderboardList.innerHTML = entriesHTML;
}

// Load death analytics from backend
async function loadDeathAnalytics() {
  try {
    if (!navigator.onLine || !window.BackendAPI) {
      throw new Error("Backend not available");
    }

    const data = await window.BackendAPI.fetchDeathStatistics();

    if (data && data.deathStats) {
      // Update death counts
      document.getElementById("death-asteroid").textContent =
        data.deathStats.asteroid || 0;
      document.getElementById("death-blackhole").textContent =
        data.deathStats.blackhole || 0;
      document.getElementById("death-missile").textContent =
        data.deathStats.missile || 0;
      document.getElementById("death-lightning").textContent =
        data.deathStats.lightning || 0;
      document.getElementById("death-other").textContent =
        data.deathStats.other || 0;
    }
  } catch (error) {
    console.error("Failed to load death analytics:", error);
    // Show default values (0)
  }
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
}

// Update stats after game ends
function updateLocalStats(reason) {
  // Increment games played
  const gamesPlayed = parseInt(
    localStorage.getItem("stellarDriftGamesPlayed") || 0
  );
  localStorage.setItem("stellarDriftGamesPlayed", gamesPlayed + 1);

  // Increment total deaths
  const totalDeaths = parseInt(
    localStorage.getItem("stellarDriftTotalDeaths") || 0
  );
  localStorage.setItem("stellarDriftTotalDeaths", totalDeaths + 1);

  // Track death causes
  const deathCauses = JSON.parse(
    localStorage.getItem("stellarDriftDeathCauses") || "{}"
  );
  deathCauses[reason] = (deathCauses[reason] || 0) + 1;
  localStorage.setItem("stellarDriftDeathCauses", JSON.stringify(deathCauses));
}

// Make functions globally available
window.initializeDashboard = initializeDashboard;
window.loadPersonalStats = loadPersonalStats;
window.updateLocalStats = updateLocalStats;
