// Real-time Dashboard and leaderboard functionality

let websocket = null;
let globalLeaderboard = [];
let countryLeaderboard = [];
let isConnected = false;
let heartbeatInterval = null;
let prevGlobalLeaderboardIds = [];
let prevCountryLeaderboardIds = [];
let currentUserId = null; // Store current user ID after identification
let currentUserRank = null; // Store rank passed from game over

// Initialize dashboard functionality
function initializeDashboard() {
  setupTabSwitching();
  connectWebSocket();
  // loadInitialData(); // Data loading is now triggered after successful WS subscription
  updatePlayerStats(); // Load local stats initially
  // Store current user ID after identification is complete
  if (
    window.userIdentification &&
    typeof window.userIdentification.getUserId === "function"
  ) {
    currentUserId = window.userIdentification.getUserId();
  }
}

// Setup tab switching functionality
function setupTabSwitching() {
  const tabs = document.querySelectorAll(".dashboard-tab");
  const contents = document.querySelectorAll(".dashboard-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");

      const targetContent = document.getElementById(`${targetTab}-content`);
      if (targetContent) {
        targetContent.classList.add("active");
        // Scroll to top of the content area when switching tabs
        const listContainer = targetContent.querySelector(
          ".leaderboard-container, .stats-container"
        );
        if (listContainer) {
          listContainer.scrollTop = 0;
        }
      }

      // Clear the specific rank passed from game over when user switches tabs manually
      currentUserRank = null;
      // Re-render the global leaderboard without highlight when switching tabs
      if (targetTab === "global-leaderboard") {
        updateGlobalLeaderboard({});
      }
    });
  });
}

// Connect to WebSocket for real-time updates
function connectWebSocket() {
  const wsUrl = window.BackendAPI ? window.BackendAPI.getWsUrl() : null;

  if (!BACKEND_CONFIG.USE_BACKEND || !wsUrl) {
    updateConnectionStatus("offline", "Ngoại tuyến"); // Offline
    console.log(
      "WebSocket connection skipped: Backend is disabled or URL is missing."
    );
    // If offline, load initial data from local storage immediately
    loadInitialData();
    return;
  }

  try {
    console.log(`Attempting to connect to WebSocket at: ${wsUrl}`);
    updateConnectionStatus("connecting", "Đang kết nối..."); // Connecting...

    websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connection established successfully.");
      isConnected = true;
      updateConnectionStatus("connected", "Trực tiếp"); // Live
      websocket.send(JSON.stringify({ action: "subscribe" }));
      startHeartbeat();
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = (event) => {
      console.log(
        `WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`
      );
      isConnected = false;
      updateConnectionStatus("disconnected", "Đã ngắt kết nối"); // Disconnected
      stopHeartbeat();
      // Load local data as fallback when disconnected
      loadInitialData();
      setTimeout(connectWebSocket, 5000); // Attempt to reconnect
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error occurred:", error);
      updateConnectionStatus("error", "Lỗi kết nối"); // Connection Error
      // Load local data as fallback on error
      loadInitialData();
    };
  } catch (error) {
    console.error("Failed to create WebSocket instance:", error);
    updateConnectionStatus("error", "Thiết lập thất bại"); // Setup Failed
    // Load local data as fallback on error
    loadInitialData();
  }
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(message) {
  let changedEntries = new Map();
  // Use the ID of the currently active leaderboard container for updates,
  // unless we are in the game over state, then update both potentially.
  const activeLeaderboardId =
    document.querySelector(
      "#leaderboard-screen .dashboard-content.active .leaderboard-container"
    )?.id || "global-leaderboard-list";
  const isGameOver = gameStateManager.getCurrentStateName() === "gameOver";

  switch (message.type) {
    case "leaderboard_update":
      console.log("Received leaderboard update:", message.data);
      if (message.data.type === "global") {
        const newLeaderboard = message.data.leaderboard;
        changedEntries = getChangedEntries(
          prevGlobalLeaderboardIds,
          newLeaderboard,
          "userId"
        );
        globalLeaderboard = newLeaderboard;
        // Update the main leaderboard OR the game over snippet if active
        updateGlobalLeaderboard({
          targetElementId: activeLeaderboardId,
          changedEntries,
        });
        if (isGameOver) {
          updateGlobalLeaderboard({
            targetElementId: "game-over-leaderboard-container",
            changedEntries,
          });
        }
        prevGlobalLeaderboardIds = globalLeaderboard.map((e) => e.userId);
      }
      break;

    case "country_update":
      console.log("Received country update:", message.data);
      if (message.data.type === "countries") {
        const newLeaderboard = message.data.countries;
        changedEntries = getChangedEntries(
          prevCountryLeaderboardIds,
          newLeaderboard,
          "country"
        );
        countryLeaderboard = newLeaderboard;
        // Only update the main country leaderboard
        if (activeLeaderboardId === "country-leaderboard-list") {
          updateCountryLeaderboard(changedEntries);
        }
        prevCountryLeaderboardIds = countryLeaderboard.map((c) => c.country);
      }
      break;

    case "pong":
      console.log("Received pong from server");
      break;

    case "subscribed":
      console.log("Successfully subscribed to real-time updates");
      // Load initial data *after* subscription confirmation
      loadInitialData();
      break;

    default:
      console.log("Unknown WebSocket message type:", message.type);
  }
}

// Load initial leaderboard data
async function loadInitialData() {
  const isCurrentlyConnected = isConnected; // Check connection status at the start

  try {
    let globalData = null;
    let countryData = null;

    if (isCurrentlyConnected && window.BackendAPI) {
      // Fetch more entries initially only if connected
      [globalData, countryData] = await Promise.all([
        BackendAPI.fetchLeaderboard(50),
        BackendAPI.fetchLeaderboardByCountry(null, 10),
      ]).catch((fetchError) => {
        console.error("Error fetching initial leaderboard data:", fetchError);
        // Return nulls to trigger fallback logic below
        return [null, null];
      });
    }

    // Process Global Leaderboard Data or Fallback
    if (globalData && globalData.leaderboard) {
      globalLeaderboard = globalData.leaderboard;
      prevGlobalLeaderboardIds = globalLeaderboard.map((e) => e.userId);
      // Update UI, potentially highlighting based on currentUserId if rank is available
      updateGlobalLeaderboard({
        targetElementId: "global-leaderboard-list",
        highlightUserId: currentUserId,
        highlightRank: currentUserRank,
      });
      // Also update snippet if game over screen might be visible
      if (document.getElementById("game-over-leaderboard-container")) {
        updateGlobalLeaderboard({
          targetElementId: "game-over-leaderboard-container",
          highlightUserId: currentUserId,
          highlightRank: currentUserRank,
        });
      }
    } else {
      // Only show offline if not connected or fetch failed
      if (!isCurrentlyConnected || !globalData) {
        showOfflineLeaderboard("global-leaderboard-list");
        if (document.getElementById("game-over-leaderboard-container")) {
          showOfflineLeaderboard("game-over-leaderboard-container");
        }
      }
    }

    // Process Country Leaderboard Data or Fallback
    if (countryData && countryData.countries) {
      countryLeaderboard = countryData.countries;
      prevCountryLeaderboardIds = countryLeaderboard.map((c) => c.country);
      updateCountryLeaderboard(); // Update main country leaderboard
    } else {
      // Clear or show message in country leaderboard if offline/failed
      const countryList = document.getElementById("country-leaderboard-list");
      if (countryList) {
        countryList.innerHTML = `<div class="no-data">${
          isCurrentlyConnected
            ? "Không thể tải bảng xếp hạng quốc gia."
            : "Bảng xếp hạng quốc gia không khả dụng khi ngoại tuyến."
        }</div>`; // Failed to load / unavailable offline
      }
    }
  } catch (error) {
    // Catch any unexpected errors during processing
    console.error("Unexpected error during loadInitialData processing:", error);
    showOfflineLeaderboard("global-leaderboard-list"); // Show local scores on error
    if (document.getElementById("game-over-leaderboard-container")) {
      showOfflineLeaderboard("game-over-leaderboard-container");
    }
  } finally {
    updatePlayerStats(); // Update local stats after attempting to load data
  }
}

// Update global leaderboard display - Modified to accept targetElementId
function updateGlobalLeaderboard(options = {}) {
  const {
    targetElementId = "global-leaderboard-list", // Default to main list
    changedEntries = new Map(),
    highlightUserId,
    highlightRank,
  } = options;

  const leaderboardList = document.getElementById(targetElementId);
  if (!leaderboardList) {
    console.warn(`Leaderboard container #${targetElementId} not found.`);
    return;
  }

  // Use highlightRank if provided (from game over), otherwise check if user is in the list
  const displayUserId = highlightUserId || currentUserId;
  let userEntry = null;
  let userRankIndex = -1; // Index in the *current* globalLeaderboard array
  let effectiveUserRank = highlightRank || null; // Use passed rank first

  if (globalLeaderboard.length === 0) {
    leaderboardList.innerHTML = `<div class="no-data">${
      targetElementId === "game-over-leaderboard-container"
        ? "Không có điểm."
        : "Chưa có điểm số nào. Hãy là người đầu tiên!"
    }</div>`; // No scores / No scores yet.
    return;
  }

  // Find the user's entry and index in the current leaderboard data
  if (displayUserId) {
    userRankIndex = globalLeaderboard.findIndex(
      (entry) => entry.userId === displayUserId
    );
    if (userRankIndex !== -1) {
      userEntry = globalLeaderboard[userRankIndex];
      // If we found the user, use their actual rank from the data or index
      effectiveUserRank = userEntry.rank || userRankIndex + 1;
    }
    // If user not found, effectiveUserRank remains the passed highlightRank or null
  }

  leaderboardList.innerHTML = ""; // Clear previous entries
  const maxEntriesToShow = 10;
  let userShown = false;

  // Display top entries (up to maxEntriesToShow)
  globalLeaderboard.slice(0, maxEntriesToShow).forEach((entry, index) => {
    const isCurrentUser = entry.userId === displayUserId;
    // Pass effectiveUserRank to potentially use index + 1 if rank property missing
    const entryElement = createLeaderboardEntryElement(
      entry,
      index, // Use index for medal logic
      changedEntries.get(entry.userId),
      isCurrentUser,
      entry.rank || index + 1 // Pass actual rank or calculated rank for display
    );
    leaderboardList.appendChild(entryElement);
    if (isCurrentUser) {
      userShown = true;
      // Scroll to the user's entry if needed (only for the main leaderboard)
      if (targetElementId === "global-leaderboard-list") {
        setTimeout(
          () =>
            entryElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            }),
          200
        );
      }
    }
  });

  // If the user exists (or we have their rank), is outside the top N, and hasn't been shown yet
  if (effectiveUserRank > maxEntriesToShow && !userShown && displayUserId) {
    // Add ellipsis
    const ellipsisElement = document.createElement("div");
    ellipsisElement.className = "leaderboard-ellipsis";
    ellipsisElement.textContent = "...";
    leaderboardList.appendChild(ellipsisElement);

    let userEntryElement;
    if (userEntry) {
      // If we have the full user entry data
      userEntryElement = createLeaderboardEntryElement(
        userEntry,
        effectiveUserRank - 1, // Use rank - 1 for styling/medal index logic
        changedEntries.get(userEntry.userId),
        true, // Mark as current user
        effectiveUserRank // Display the correct rank number
      );
    } else {
      // If user entry wasn't in the loaded top 50, but we have rank from backend
      userEntryElement = document.createElement("div");
      userEntryElement.className = "leaderboard-entry current-user";
      // Attempt to get player name from UI if available
      const playerName = window.playerNameUI?.getPlayerName() || "Bạn"; // You
      userEntryElement.innerHTML = `
         <div class="rank">#${effectiveUserRank}</div>
         <div class="player-info">
           <div class="username">${escapeHtml(playerName)}</div>
           <div class="country">...</div>
         </div>
         <div class="score">...</div>
         <div class="time">...</div>
        `;
    }
    leaderboardList.appendChild(userEntryElement);
    // Scroll to the user's entry (only for the main leaderboard)
    if (targetElementId === "global-leaderboard-list") {
      setTimeout(
        () =>
          userEntryElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        200
      );
    }
  }
}

// Helper function to create a single leaderboard entry element - Added displayRank parameter
function createLeaderboardEntryElement(
  entry,
  index, // 0-based index or rank-1 for styling/medal logic
  changeType,
  isCurrentUser,
  displayRank // The actual rank number to show (1-based)
) {
  const entryElement = document.createElement("div");
  entryElement.className = "leaderboard-entry";
  entryElement.dataset.userId = entry.userId;

  const rankForStyle = index + 1; // Use index for medal class

  if (rankForStyle <= 3) {
    entryElement.classList.add(`rank-${rankForStyle}`);
  }
  if (isCurrentUser) {
    entryElement.classList.add("current-user");
  }

  if (changeType) {
    entryElement.classList.add(
      changeType === "up" ? "rank-change-up" : "rank-change-down"
    );
    setTimeout(() => {
      entryElement.classList.remove("rank-change-up", "rank-change-down");
    }, 1500);
  }

  const timeFormatted = formatTime(entry.survivalTime || 0);
  const countryFlag = getCountryFlag(entry.countryCode);
  const username = entry.username || "Anonymous";

  entryElement.innerHTML = `
      <div class="rank">
        ${rankForStyle <= 3 ? getRankMedal(rankForStyle) : `#${displayRank}`}
      </div>
      <div class="player-info">
        <div class="username">${escapeHtml(username)}</div>
        <div class="country">
          ${countryFlag} ${entry.country || "Unknown"}
        </div>
      </div>
      <div class="score">${(entry.score || 0).toLocaleString()}</div>
      <div class="time">${timeFormatted}</div>
    `;
  return entryElement;
}

// Update country leaderboard display
function updateCountryLeaderboard(changedEntries = new Map()) {
  const leaderboardList = document.getElementById("country-leaderboard-list");
  if (!leaderboardList) return;

  if (countryLeaderboard.length === 0) {
    leaderboardList.innerHTML =
      '<div class="no-data">Chưa có dữ liệu quốc gia.</div>'; // No country data yet.
    return;
  }

  const infoBox = document.createElement("div");
  infoBox.className = "country-info";
  infoBox.innerHTML = `<p>Quốc gia được xếp hạng dựa trên tổng điểm của 10% người chơi hàng đầu.</p>`; // Countries ranked by combined score of top 10% players.
  leaderboardList.innerHTML = "";
  leaderboardList.appendChild(infoBox);

  countryLeaderboard.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "country-entry";
    entryElement.dataset.country = entry.country;

    const displayRank = index + 1;

    if (displayRank <= 3) {
      entryElement.classList.add(`rank-${displayRank}`);
    }

    const changeType = changedEntries.get(entry.country);
    if (changeType) {
      entryElement.classList.add(
        changeType === "up" ? "rank-change-up" : "rank-change-down"
      );
      setTimeout(() => {
        entryElement.classList.remove("rank-change-up", "rank-change-down");
      }, 1500);
    }

    const countryFlag = getCountryFlag(entry.countryCode || entry.country);
    const top10Score = entry.top10PercentScore || entry.totalScore || 0;
    const avgScoreValue = entry.averageScore || 0;

    entryElement.innerHTML = `
      <div class="rank">
        ${displayRank <= 3 ? getRankMedal(displayRank) : `#${displayRank}`}
      </div>
      <div class="country-info">
        <div class="country-name">
          <span class="country-flag">${countryFlag}</span>
          <span>${escapeHtml(entry.country)}</span>
        </div>
        <div class="country-player-count">${
          entry.playerCount || 0
        } người chơi</div>
      </div>
      <div class="country-scores">
        <div class="top-score">${top10Score.toLocaleString()}</div>
        <div class="avg-score">TB: ${Math.round(
          avgScoreValue
        ).toLocaleString()}</div>
      </div>
    `; // players, Avg:

    leaderboardList.appendChild(entryElement);
  });
}

// Show offline leaderboard (from localStorage) - Modified to accept targetElementId
function showOfflineLeaderboard(targetElementId = "global-leaderboard-list") {
  const leaderboardList = document.getElementById(targetElementId);
  if (!leaderboardList) {
    console.warn(
      `Offline leaderboard container #${targetElementId} not found.`
    );
    return;
  }

  let gameHistory = [];
  try {
    gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    if (!Array.isArray(gameHistory)) gameHistory = [];
  } catch (e) {
    console.error("Error parsing game history from localStorage", e);
    gameHistory = [];
  }

  const sortedHistory = gameHistory
    .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort safely
    .slice(0, 10); // Show top 10 local scores

  if (sortedHistory.length === 0) {
    leaderboardList.innerHTML =
      '<div class="no-data">Chưa có điểm cục bộ. Chơi một ván nhé!</div>'; // No local scores yet. Play a game!
    return;
  }

  leaderboardList.innerHTML = ""; // Clear previous entries

  sortedHistory.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "leaderboard-entry offline";

    const timeFormatted = formatTime(entry.time || 0);
    const scoreValue = entry.score || 0;

    // Try to get current player name for display
    const playerName = window.playerNameUI?.getPlayerName() || "Bạn"; // You

    entryElement.innerHTML = `
      <div class="rank">#${index + 1}</div>
      <div class="player-info">
        <div class="username">${escapeHtml(playerName)} (Offline)</div>
        <div class="country">Game cục bộ</div>
      </div>
      <div class="score">${scoreValue.toLocaleString()}</div>
      <div class="time">${timeFormatted}</div>
    `; // Local Game

    leaderboardList.appendChild(entryElement);
  });

  // Only clear country list if updating the main leaderboard
  if (targetElementId === "global-leaderboard-list") {
    const countryList = document.getElementById("country-leaderboard-list");
    if (countryList) {
      countryList.innerHTML =
        '<div class="no-data">Bảng xếp hạng quốc gia không khả dụng khi ngoại tuyến.</div>'; // Country leaderboard unavailable offline.
    }
  }
}

// Update player statistics tab from localStorage
function updatePlayerStats() {
  const playerStatsContainer = document.getElementById("player-stats");
  if (!playerStatsContainer) return;

  const highScore = localStorage.getItem(GAME_CONFIG.core.localStorageKey) || 0;
  let gameHistory = [];
  try {
    gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    if (!Array.isArray(gameHistory)) gameHistory = []; // Ensure it's an array
  } catch (e) {
    console.error("Error parsing game history from localStorage", e);
    gameHistory = [];
  }

  const gamesPlayed = gameHistory.length;
  const totalScore = gameHistory.reduce(
    (sum, game) => sum + (game.score || 0),
    0
  );
  const totalTime = gameHistory.reduce(
    (sum, game) => sum + (game.time || 0),
    0
  );
  const averageScore =
    gamesPlayed > 0 ? Math.floor(totalScore / gamesPlayed) : 0;
  const bestTime = Math.max(...gameHistory.map((g) => g.time || 0), 0);

  // Calculate death stats
  const deathStats = {};
  gameHistory.forEach((game) => {
    const cause = game.deathBy || "unknown";
    deathStats[cause] = (deathStats[cause] || 0) + 1;
  });

  // Find the most common cause of death
  let mostCommonDeath = "chưa có"; // none
  let maxCount = 0;
  for (const cause in deathStats) {
    if (deathStats[cause] > maxCount) {
      mostCommonDeath = cause;
      maxCount = deathStats[cause];
    }
  }

  // Use safeT for translation if available
  const t = typeof safeT === "function" ? safeT : (key, fallback) => fallback;

  playerStatsContainer.innerHTML = `
    <div class="stats-grid">
      <div class="stat-item highlight">
        <div class="stat-label">${t(
          "stats.highScore",
          "🏆 Điểm cao nhất"
        )}</div>
        <div class="stat-value">${parseInt(highScore).toLocaleString()}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">${t(
          "stats.gamesPlayed",
          "🎮 Số trận đã chơi"
        )}</div>
        <div class="stat-value">${gamesPlayed}</div>
      </div>
       <div class="stat-item">
        <div class="stat-label">${t(
          "stats.bestSurvival",
          "⚡ Sống sót lâu nhất"
        )}</div>
        <div class="stat-value">${formatTime(bestTime)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">${t(
          "stats.averageScore",
          "📊 Điểm trung bình"
        )}</div>
        <div class="stat-value">${averageScore.toLocaleString()}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">${t(
          "stats.totalTime",
          "⏱️ Tổng thời gian chơi"
        )}</div>
        <div class="stat-value">${formatTime(totalTime)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">${t(
          "stats.mostCommonDeath",
          "💀 Nguyên nhân tử vong nhiều nhất"
        )}</div>
        <div class="stat-value">${formatDeathCause(mostCommonDeath)} (${
    maxCount > 0 ? maxCount : 0
  })</div>
      </div>
    </div>
  `;
}

// Update connection status indicator
function updateConnectionStatus(status, text) {
  const indicators = document.querySelectorAll('[id^="connection-indicator"]');
  const statusTexts = document.querySelectorAll('[id^="connection-text"]');

  const statusConfig = {
    connecting: { icon: "🟡", text: text },
    connected: { icon: "🟢", text: text },
    disconnected: { icon: "🔴", text: text },
    error: { icon: "🔴", text: text },
    offline: { icon: "⚫", text: text },
  };
  const config = statusConfig[status] || statusConfig["offline"];

  indicators.forEach((el) => {
    if (el) el.textContent = config.icon;
  });
  statusTexts.forEach((el) => {
    if (el) el.textContent = config.text;
  });

  // Disable "My Stats" tab if offline, enable if connected/connecting
  const myStatsTab = document.querySelector('[data-tab="my-stats"]');
  if (myStatsTab) {
    myStatsTab.disabled =
      status === "offline" || status === "disconnected" || status === "error";
    myStatsTab.style.opacity = myStatsTab.disabled ? 0.5 : 1;
    myStatsTab.style.cursor = myStatsTab.disabled ? "not-allowed" : "pointer";
  }
}

// --- Utility functions ---

// Determines if an entry's rank changed and in which direction
function getChangedEntries(prevIds, newList, idKey) {
  const changes = new Map();
  if (!prevIds || prevIds.length === 0) return changes; // No previous state to compare

  const newPositions = new Map(
    newList.map((item, index) => [item[idKey], index])
  );

  prevIds.forEach((id, oldIndex) => {
    const newIndex = newPositions.get(id);
    // Check if item still exists and its position changed
    if (newIndex !== undefined && newIndex !== oldIndex) {
      changes.set(id, newIndex < oldIndex ? "up" : "down");
    }
    // Could also track 'new' entries if needed
  });
  return changes;
}

// Format death cause with emoji
function formatDeathCause(cause) {
  const t = typeof safeT === "function" ? safeT : (key, fallback) => fallback;
  const deathCauses = {
    "asteroid collision": t("death.asteroidcollision", "☄️ Thiên thạch"), // Asteroid
    "missile collision": t("death.missilecollision", "🚀 Tên lửa"), // Missile
    "laser collision": t("death.lasercollision", "⚡ Laser"), // Laser
    "black hole collision": t("death.blackholecollision", "🕳️ Hố đen"), // Black Hole
    "plasma field burn": t("death.plasmafieldburn", "🔥 Plasma"), // Plasma
    "crystal cluster collision": t(
      "death.crystalclustercollision",
      "💎 Pha lê"
    ), // Crystal
    "laser mine collision": t("death.laserminecollision", "💣 Mìn"), // Mine
    "lightning strike": t("death.lightningstrike", "⚡ Sét"), // Lightning
    unknown: t("death.unknown", "❓ Không rõ"), // Unknown
    none: t("stats.none", "chưa có"), // None or N/A
  };
  return deathCauses[cause] || `❓ ${cause}`;
}

// Get medal emoji for top ranks
function getRankMedal(rank) {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[rank - 1] || `#${rank}`;
}

// Convert country code/name to flag emoji
function getCountryFlag(countryIdentifier) {
  const countryCodeMap = {
    Vietnam: "VN",
    "United Arab Emirates": "AE",
    "United States": "US",
    USA: "US",
    Russia: "RU",
    Germany: "DE",
    China: "CN",
    Japan: "JP",
    "South Korea": "KR",
    Korea: "KR",
    France: "FR",
    "United Kingdom": "GB",
    UK: "GB",
    Canada: "CA",
    Australia: "AU",
    Brazil: "BR",
    India: "IN",
    Thailand: "TH",
    Singapore: "SG",
    Malaysia: "MY",
    Indonesia: "ID",
    Philippines: "PH",
    Unknown: null,
  };
  if (!countryIdentifier || countryIdentifier === "Unknown") return "🌍";
  let countryCode = countryIdentifier.toUpperCase();
  if (countryIdentifier.length > 2) {
    countryCode = countryCodeMap[countryIdentifier] || null;
  }
  if (!countryCode || countryCode.length !== 2) return "🌍";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    console.warn(`Could not generate flag for code: ${countryCode}`, e);
    return "🌍";
  }
}

// Basic HTML escaping
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Start WebSocket heartbeat
function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      try {
        websocket.send(JSON.stringify({ action: "ping" }));
      } catch (error) {
        console.error("Error sending ping:", error);
      }
    } else {
      stopHeartbeat();
    }
  }, 30000);
}

// Stop WebSocket heartbeat
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// --- Event Listeners & Initialization ---

window.addEventListener("beforeunload", () => {
  stopHeartbeat();
  if (websocket) {
    websocket.close(1000, "Page closed");
  }
});

// Function called by Game Over or Leaderboard state to render data
function renderCurrentLeaderboardData(options = {}) {
  const {
    targetElementId = "global-leaderboard-list",
    highlightUserId,
    highlightRank,
  } = options;
  currentUserRank = highlightRank; // Store rank potentially passed from game over
  // Fetch user ID for consistent highlighting
  currentUserId = window.userIdentification?.getUserId();
  updateGlobalLeaderboard({
    targetElementId,
    highlightUserId: highlightUserId || currentUserId,
    highlightRank,
  });
  // Only update country/stats if rendering the main dashboard
  if (targetElementId === "global-leaderboard-list") {
    updateCountryLeaderboard();
    updatePlayerStats();
  }
}

// Make functions globally available if needed
window.initializeDashboard = initializeDashboard;
window.updatePlayerStats = updatePlayerStats;
window.renderCurrentLeaderboardData = renderCurrentLeaderboardData;
