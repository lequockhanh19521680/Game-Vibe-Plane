// Real-time Dashboard and leaderboard functionality

let websocket = null;
let globalLeaderboard = [];
let countryLeaderboard = [];
let isConnected = false;
let heartbeatInterval = null;
let prevGlobalLeaderboardIds = [];
let prevCountryLeaderboardIds = [];

// Initialize dashboard functionality
function initializeDashboard() {
  setupTabSwitching();
  connectWebSocket();
  loadInitialData(); // Load initial data for main dashboard
  updatePlayerStats(); // Update player stats initially
}

// Setup tab switching functionality
function setupTabSwitching() {
  const tabs = document.querySelectorAll(".dashboard-tab");
  const contents = document.querySelectorAll(".dashboard-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // SỬA ĐỔI: Check if already active to prevent unnecessary re-renders/fetches
      if (tab.classList.contains("active")) {
        return;
      }

      const targetTab = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");

      const targetContent = document.getElementById(`${targetTab}-content`);
      if (targetContent) {
        targetContent.classList.add("active");

        // SỬA ĐỔI: Refresh specific content when tab is clicked
        if (targetTab === "global-leaderboard") {
          updateGlobalLeaderboardUI(); // Use current data
        } else if (targetTab === "country-leaderboard") {
          updateCountryLeaderboardUI(); // Use current data
        } else if (targetTab === "my-stats") {
          updatePlayerStats(); // Refresh stats from localStorage
        }
      }
    });
  });
}

// Connect to WebSocket for real-time updates
function connectWebSocket() {
  const wsUrl = window.BackendAPI ? window.BackendAPI.getWsUrl() : null;

  if (!BACKEND_CONFIG.USE_BACKEND || !wsUrl) {
    updateConnectionStatus("offline", "Offline");
    console.log(
      "WebSocket connection skipped: Backend is disabled or URL is missing."
    );
    return;
  }

  try {
    console.log(`Attempting to connect to WebSocket at: ${wsUrl}`);
    updateConnectionStatus("connecting", "Connecting...");

    websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connection established successfully.");
      isConnected = true;
      updateConnectionStatus("connected", "Live");
      websocket.send(JSON.stringify({ action: "subscribe" }));
      startHeartbeat();
      // SỬA ĐỔI: Tải dữ liệu mới nhất sau khi kết nối thành công
      loadInitialData();
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
      updateConnectionStatus("disconnected", "Disconnected");
      stopHeartbeat();
      // SỬA ĐỔI: Hủy kích hoạt các tab leaderboard khi mất kết nối
      disableLeaderboardTabs(true);
      // Attempt to reconnect
      setTimeout(connectWebSocket, 5000);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error occurred:", error);
      updateConnectionStatus("error", "Connection Error");
      // SỬA ĐỔI: Hủy kích hoạt các tab leaderboard khi có lỗi
      disableLeaderboardTabs(true);
    };
  } catch (error) {
    console.error("Failed to create WebSocket instance:", error);
    updateConnectionStatus("error", "Setup Failed");
    disableLeaderboardTabs(true);
  }
}

// SỬA ĐỔI: Hàm để kích hoạt/hủy kích hoạt các tab leaderboard
function disableLeaderboardTabs(disabled) {
  const globalTab = document.querySelector('[data-tab="global-leaderboard"]');
  const countryTab = document.querySelector('[data-tab="country-leaderboard"]');
  if (globalTab) globalTab.disabled = disabled;
  if (countryTab) countryTab.disabled = disabled;

  // Hiển thị thông báo offline nếu bị hủy kích hoạt
  if (disabled) {
    showOfflineLeaderboard("global-leaderboard-list");
    const countryList = document.getElementById("country-leaderboard-list");
    if (countryList)
      countryList.innerHTML =
        '<div class="no-data">Offline. Cannot load country data.</div>'; // Offline. Cannot load country data.
  }
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(message) {
  switch (message.type) {
    case "leaderboard_update":
      console.log("Received leaderboard update:", message.data);
      if (message.data.type === "global") {
        const newLeaderboard = message.data.leaderboard || [];
        // Calculate changes before updating the global variable
        const changedEntries = getChangedEntries(
          prevGlobalLeaderboardIds,
          newLeaderboard,
          "userId"
        );
        globalLeaderboard = newLeaderboard; // Update global data
        updateGlobalLeaderboardUI(changedEntries); // Update the main dashboard UI
        prevGlobalLeaderboardIds = globalLeaderboard.map((e) => e.userId);
      }
      break;

    case "country_update":
      console.log("Received country update:", message.data);
      if (message.data.type === "countries") {
        const newLeaderboard = message.data.countries || [];
        // Calculate changes before updating the global variable
        const changedEntries = getChangedEntries(
          prevCountryLeaderboardIds,
          newLeaderboard,
          "country"
        );
        countryLeaderboard = newLeaderboard; // Update global data
        updateCountryLeaderboardUI(changedEntries); // Update the main dashboard UI
        prevCountryLeaderboardIds = countryLeaderboard.map((c) => c.country);
      }
      break;

    case "pong":
      // console.log("Received pong from server"); // Reduce noise
      break;

    case "subscribed":
      console.log("Successfully subscribed to real-time updates");
      // SỬA ĐỔI: Kích hoạt lại các tab khi đăng ký thành công
      disableLeaderboardTabs(false);
      break;

    default:
      console.log("Unknown WebSocket message type:", message.type);
  }
}

// SỬA ĐỔI: Tách riêng hàm tải dữ liệu ban đầu
async function loadInitialData() {
  // Set loading states
  const globalList = document.getElementById("global-leaderboard-list");
  const countryList = document.getElementById("country-leaderboard-list");
  if (globalList)
    globalList.innerHTML = '<div class="loading">Loading...</div>'; // Loading leaderboard...
  if (countryList)
    countryList.innerHTML =
      '<div class="loading">Loading country rankings...</div>'; // Loading country rankings...

  // Disable tabs while loading
  disableLeaderboardTabs(true);

  try {
    const [globalData, countryData] = await Promise.all([
      BackendAPI.fetchLeaderboard(10),
      BackendAPI.fetchLeaderboardByCountry(null, 10),
    ]);

    if (globalData && globalData.leaderboard) {
      globalLeaderboard = globalData.leaderboard;
      prevGlobalLeaderboardIds = globalLeaderboard.map((e) => e.userId);
    } else {
      globalLeaderboard = []; // Ensure it's an array on failure
    }

    if (countryData && countryData.countries) {
      countryLeaderboard = countryData.countries;
      prevCountryLeaderboardIds = countryLeaderboard.map((c) => c.country);
    } else {
      countryLeaderboard = []; // Ensure it's an array on failure
    }

    // Update UI with fetched data
    updateGlobalLeaderboardUI();
    updateCountryLeaderboardUI();
    // Enable tabs after loading if connected
    if (isConnected) {
      disableLeaderboardTabs(false);
    }
  } catch (error) {
    console.error("Error loading initial leaderboard data:", error);
    showOfflineLeaderboard("global-leaderboard-list"); // Show local scores on error
    if (countryList)
      countryList.innerHTML =
        '<div class="no-data">Error loading country data.</div>'; // Error loading country data.
    // Keep tabs disabled on error
  }
}

// SỬA ĐỔI: Tách riêng hàm tải dữ liệu quốc gia (có thể gọi lại khi cần)
async function loadCountryData() {
  const countryList = document.getElementById("country-leaderboard-list");
  if (!countryList) return;
  countryList.innerHTML =
    '<div class="loading">Loading country rankings...</div>'; // Loading country rankings...
  try {
    const countryData = await BackendAPI.fetchLeaderboardByCountry(null, 10);
    if (countryData && countryData.countries) {
      countryLeaderboard = countryData.countries;
      prevCountryLeaderboardIds = countryLeaderboard.map((c) => c.country);
      updateCountryLeaderboardUI();
    } else {
      countryLeaderboard = [];
      countryList.innerHTML = '<div class="no-data">No country data.</div>'; // No country data.
    }
  } catch (error) {
    console.error("Error loading country data:", error);
    countryList.innerHTML =
      '<div class="no-data">Error loading country data.</div>'; // Error loading country data.
  }
}

// SỬA ĐỔI: Đổi tên thành updateGlobalLeaderboardUI để phân biệt với hàm cập nhật dữ liệu
function updateGlobalLeaderboardUI(changedEntries = new Map()) {
  renderLeaderboardInternal(
    "global-leaderboard-list",
    globalLeaderboard,
    changedEntries,
    "userId",
    formatGlobalEntry // Pass formatter function
  );
}

// SỬA ĐỔI: Đổi tên thành updateCountryLeaderboardUI
function updateCountryLeaderboardUI(changedEntries = new Map()) {
  renderLeaderboardInternal(
    "country-leaderboard-list",
    countryLeaderboard,
    changedEntries,
    "country",
    formatCountryEntry // Pass formatter function
  );
}

// SỬA ĐỔI: Hàm render nội bộ chung
function renderLeaderboardInternal(
  elementId,
  data,
  changedEntries,
  idKey,
  formatter
) {
  const leaderboardList = document.getElementById(elementId);
  if (!leaderboardList) return;

  if (!isConnected && elementId === "global-leaderboard-list") {
    leaderboardList.innerHTML =
      '<div class="no-data">Offline. Showing local scores.</div>';
    showOfflineLeaderboard(elementId);
    return;
  }

  if (!data || data.length === 0) {
    leaderboardList.innerHTML = `<div class="no-data">${
      isConnected ? "No data yet." : "Offline. Showing local scores."
    }</div>`; // No data yet. / Offline. Showing local scores.
    return;
  }

  // Optimize: Only re-render if necessary
  const currentFirstId = leaderboardList
    .querySelector(".leaderboard-entry, .country-entry")
    ?.getAttribute("data-id");
  const newFirstId = data.length > 0 ? data[0][idKey] : null;

  // Basic check for changes: if first ID changes or lengths differ or changes exist
  if (
    currentFirstId !== newFirstId ||
    leaderboardList.children.length !== data.length + 1 ||
    changedEntries.size > 0 ||
    leaderboardList.querySelector(".loading") ||
    leaderboardList.querySelector(".no-data")
  ) {
    leaderboardList.innerHTML = data
      .map((entry, index) =>
        formatter(entry, index, changedEntries.get(entry[idKey]))
      )
      .join("");

    // Apply animations after updating innerHTML
    changedEntries.forEach((changeType, id) => {
      const entryElement = leaderboardList.querySelector(`[data-id="${id}"]`);
      if (entryElement) {
        entryElement.classList.add(
          changeType === "up" ? "rank-change-up" : "rank-change-down"
        );
        // Remove animation class after duration
        setTimeout(() => {
          entryElement.classList.remove("rank-change-up", "rank-change-down");
        }, 1500); // Match CSS animation duration
      }
    });
  }
}

// SỬA ĐỔI: Hàm định dạng cho global entry
function formatGlobalEntry(entry, index, changeType) {
  const rankClass = index < 3 ? `rank-${index + 1}` : "";
  // SỬA ĐỔI: Thêm data-id để tìm kiếm animation
  // Remove initial animation class, apply after render
  const timeFormatted = formatTime(entry.survivalTime || 0);
  const countryFlag = getCountryFlag(entry.countryCode);
  const usernameSafe = escapeHtml(entry.username);
  const countrySafe = escapeHtml(entry.country || "Unknown");
  const userIdSafe = escapeHtml(entry.userId); // Add data-id attribute

  // Highlight current user in snippet differently if needed
  const currentUserClass = entry.isCurrentUser ? "current-user" : "";

  return `
    <div class="leaderboard-entry ${rankClass} ${currentUserClass}" data-id="${userIdSafe}">
      <div class="rank">
        ${index < 3 ? getRankMedal(index + 1) : `#${entry.rank || index + 1}`}
      </div>
      <div class="player-info">
        <div class="username">${usernameSafe}</div>
        <div class="country">
          ${countryFlag} ${countrySafe}
        </div>
      </div>
      <div class="score">${entry.score.toLocaleString()}</div>
      <div class="time">${timeFormatted}</div>
    </div>
  `;
}

// SỬA ĐỔI: Hàm định dạng cho country entry
function formatCountryEntry(entry, index, changeType) {
  const rankClass = index < 3 ? `rank-${index + 1}` : "";
  // SỬA ĐỔI: Thêm data-id để tìm kiếm animation
  // Remove initial animation class, apply after render
  const countryFlag = getCountryFlag(entry.countryCode || entry.country);
  const topScore = entry.top10PercentScore || entry.totalScore || 0;
  const countryNameSafe = escapeHtml(entry.country); // Add data-id attribute

  return `
    <div class="country-entry ${rankClass}" data-id="${countryNameSafe}">
      <div class="rank">
        ${index < 3 ? getRankMedal(index + 1) : `#${entry.rank || index + 1}`}
      </div>
      <div class="country-info">
        <div class="country-name">
          <span class="country-flag">${countryFlag}</span>
          <span>${countryNameSafe}</span>
        </div>
        <div class="country-player-count">${
          entry.playerCount || 0
        } players</div>
      </div>
      <div class="country-scores">
        <div class="top-score">${topScore.toLocaleString()}</div>
        <div class="avg-score">Avg: ${Math.round(
          entry.averageScore || 0
        ).toLocaleString()}</div>
      </div>
    </div>
  `;
}

// SỬA ĐỔI: Cho phép hiển thị offline leaderboard vào container cụ thể
function showOfflineLeaderboard(targetElementId = "global-leaderboard-list") {
  const leaderboardList = document.getElementById(targetElementId);
  if (!leaderboardList) return;

  const gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
  const sortedHistory = gameHistory
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (sortedHistory.length === 0) {
    leaderboardList.innerHTML =
      '<div class="no-data">No local scores yet. Play a game!</div>'; // No local scores yet. Play a game!
    return;
  }

  leaderboardList.innerHTML = sortedHistory
    .map((entry, index) => {
      const timeFormatted = formatTime(entry.time || 0);
      return `
      <div class="leaderboard-entry offline">
        <div class="rank">#${index + 1}</div>
        <div class="player-info">
          <div class="username">You (Offline)</div>
          <div class="country">Local Game</div>
        </div>
        <div class="score">${entry.score.toLocaleString()}</div>
        <div class="time">${timeFormatted}</div>
      </div>
    `;
    })
    .join("");
}

// Update player statistics
function updatePlayerStats() {
  const playerStatsContainer = document.getElementById("player-stats");
  if (!playerStatsContainer) return;

  try {
    const highScore =
      localStorage.getItem(GAME_CONFIG.core.localStorageKey) || 0;
    const gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
    const gamesPlayed = gameHistory.length;
    const totalTime = gameHistory.reduce(
      (sum, game) => sum + (game.time || 0),
      0
    );
    const averageScore =
      gamesPlayed > 0
        ? Math.floor(
            gameHistory.reduce((sum, game) => sum + game.score, 0) / gamesPlayed
          )
        : 0;
    const bestTime = Math.max(...gameHistory.map((g) => g.time || 0), 0);

    const deathStats = {};
    gameHistory.forEach((game) => {
      const cause = game.deathBy || "unknown";
      deathStats[cause] = (deathStats[cause] || 0) + 1;
    });

    // Find the cause with the highest count
    let mostCommonDeath = "none";
    let maxCount = 0;
    for (const cause in deathStats) {
      if (deathStats[cause] > maxCount) {
        maxCount = deathStats[cause];
        mostCommonDeath = cause;
      }
    }

    playerStatsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item highlight">
          <div class="stat-label">🏆 High Score</div>
          <div class="stat-value">${parseInt(highScore).toLocaleString()}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">🎮 Games Played</div>
          <div class="stat-value">${gamesPlayed}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">⏱️ Total Time</div>
          <div class="stat-value">${formatTime(totalTime)}</div>
        </div>
         <div class="stat-item">
          <div class="stat-label">⚡ Best Survival</div>
          <div class="stat-value">${formatTime(bestTime)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">📊 Average Score</div>
          <div class="stat-value">${averageScore.toLocaleString()}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">💀 Most Common Death</div>
          <div class="stat-value">${formatDeathCause(mostCommonDeath)}</div>
        </div>
      </div>
    `;
  } catch (e) {
    console.error("Error loading or processing player stats:", e);
    playerStatsContainer.innerHTML =
      '<div class="no-data">Error loading player stats.</div>'; // Error loading player stats.
  }
}

// Update connection status indicator
function updateConnectionStatus(status, text) {
  const indicators = [
    document.getElementById("connection-indicator"), // Assuming one exists in header maybe?
    document.getElementById("connection-indicator-footer"),
  ];
  const statusTexts = [
    document.getElementById("connection-text"), // Assuming one exists in header maybe?
    document.getElementById("connection-text-footer"),
  ];

  const statusConfig = {
    connecting: { icon: "🟡", text: text || "Connecting..." }, // Connecting...
    connected: { icon: "🟢", text: text || "Live" }, // Live
    disconnected: { icon: "🔴", text: text || "Disconnected" }, // Disconnected
    error: { icon: "🔴", text: text || "Connection Error" }, // Connection Error
    offline: { icon: "⚫", text: text || "Offline" }, // Offline
  };
  const config = statusConfig[status] || statusConfig["offline"];

  indicators.forEach((el) => {
    if (el) el.textContent = config.icon;
  });
  statusTexts.forEach((el) => {
    if (el) el.textContent = config.text;
  });
}

// --- Utility functions ---

function getChangedEntries(prevIds, newList, idKey) {
  const changes = new Map();
  if (!Array.isArray(prevIds) || !Array.isArray(newList)) return changes; // Add safety check

  const newPositions = new Map(
    newList.map((item, index) => [item[idKey], index])
  );
  const oldPositions = new Map(prevIds.map((id, index) => [id, index]));

  newList.forEach((item, newIndex) => {
    const id = item[idKey];
    const oldIndex = oldPositions.get(id);
    if (oldIndex !== undefined && newIndex !== oldIndex) {
      changes.set(id, newIndex < oldIndex ? "up" : "down");
    } else if (oldIndex === undefined) {
      // Potentially a new entry, could mark as 'new' or 'up'
      // changes.set(id, 'new');
    }
  });
  return changes;
}

function formatDeathCause(causeKey) {
  const deathCauses = {
    "asteroid collision": "☄️ Asteroid",
    "missile collision": "🚀 Missile",
    "black hole collision": "🕳️ Black Hole",
    "laser collision": "⚡ Laser",
    "laser mine collision": "💣 Mine",
    "plasma field burn": "🔥 Plasma",
    "crystal cluster collision": "💎 Crystal",
    "lightning strike": "⚡ Lightning",
    unknown: "❓ Unknown",
    none: "N/A", // If no deaths recorded
  };
  const fallbackText = deathCauses[causeKey] || deathCauses["unknown"];
  // Use safeT for potential future translations
  return safeT(`death.${causeKey.replace(/ /g, "")}`, fallbackText);
}

function getRankMedal(rank) {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[rank - 1] || `#${rank}`;
}

// SỬA ĐỔI: Cập nhật danh sách mã quốc gia
function getCountryFlag(countryIdentifier) {
  // Map common full names to codes
  const countryCodeMap = {
    Vietnam: "VN",
    "United Arab Emirates": "AE",
    "United States": "US",
    Russia: "RU",
    Germany: "DE",
    China: "CN",
    Japan: "JP",
    "South Korea": "KR", // Corrected
    France: "FR",
    "United Kingdom": "GB",
    Canada: "CA",
    Australia: "AU",
    Brazil: "BR",
    India: "IN",
    Thailand: "TH",
    Singapore: "SG", // Added
    Malaysia: "MY", // Added
    Indonesia: "ID", // Added
    Philippines: "PH", // Added
    Unknown: null, // Handle 'Unknown' explicitly
    // Add more mappings as needed
  };

  if (!countryIdentifier || countryIdentifier === "Unknown") return "🏳️"; // White flag for unknown

  let countryCode = countryIdentifier.toUpperCase();

  // If identifier is a full name, try to map it
  if (countryIdentifier.length > 2 && countryCodeMap[countryIdentifier]) {
    countryCode = countryCodeMap[countryIdentifier];
  }

  // If still not 2 letters, return generic globe
  if (countryCode.length !== 2) return "🌍";

  // Check if it's a valid ISO 3166-1 alpha-2 code (basic check)
  if (!/^[A-Z]{2}$/.test(countryCode)) return "🌍";

  try {
    // Convert two-letter code to regional indicator symbols
    const codePoints = countryCode
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    console.warn(`Could not generate flag for code: ${countryCode}`, e);
    return "🌍"; // Fallback globe
  }
}

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function startHeartbeat() {
  stopHeartbeat(); // Clear any existing interval
  heartbeatInterval = setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      // console.log("Sending ping"); // Reduce noise
      websocket.send(JSON.stringify({ action: "ping" }));
    } else {
      // console.log("WebSocket not open, skipping ping."); // Reduce noise
    }
  }, 30000); // Send ping every 30 seconds
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    // console.log("Heartbeat stopped."); // Reduce noise
  }
}

// --- Leaderboard Snippet Rendering --- SỬA ĐỔI: Hàm mới

/**
 * Renders the leaderboard snippet, typically used on the Game Over screen.
 * Fetches data if needed or forced.
 * @param {object} options - Configuration options.
 * @param {string} options.targetElementId - The ID of the container element.
 * @param {string|null} [options.highlightUserId=null] - User ID to highlight.
 * @param {number|null} [options.highlightRank=null] - User rank to highlight.
 * @param {boolean} [options.forceRefresh=false] - Force fetching new data.
 */
async function renderLeaderboardSnippet(options) {
  const {
    targetElementId,
    highlightUserId = null,
    highlightRank = null,
    forceRefresh = false, // Added forceRefresh option
  } = options;
  const container = document.getElementById(targetElementId);
  if (!container) {
    console.error(`Target element "${targetElementId}" not found for snippet.`);
    return;
  }

  container.innerHTML = '<div class="loading">Loading leaderboard...</div>'; // Loading leaderboard...

  try {
    let leaderboardData = globalLeaderboard; // Try using existing data first

    // Fetch fresh data if forced, or if existing data is empty/unavailable
    if (
      forceRefresh ||
      !leaderboardData ||
      leaderboardData.length === 0 ||
      !isConnected
    ) {
      if (isConnected && BACKEND_CONFIG.USE_BACKEND) {
        console.log(
          "Snippet: Force refresh or no global data, fetching fresh..."
        );
        const fetchedData = await BackendAPI.fetchLeaderboard(10); // Fetch top 10 for snippet
        if (fetchedData && fetchedData.leaderboard) {
          leaderboardData = fetchedData.leaderboard;
        } else {
          // Keep existing leaderboardData if fetch fails but we had some old data
          if (!leaderboardData || leaderboardData.length === 0) {
            throw new Error(
              "Failed to fetch leaderboard for snippet and no cached data."
            );
          }
          console.warn(
            "Failed to fetch fresh snippet data, using cached global data."
          );
        }
      } else {
        // If not connected or backend disabled, use local scores
        console.log(
          "Snippet: Not connected or backend disabled. Showing local scores."
        );
        showOfflineLeaderboard(targetElementId);
        return; // Stop further processing for online data
      }
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      container.innerHTML =
        '<div class="no-data">No scores on leaderboard yet.</div>'; // No scores on leaderboard yet.
      return;
    }

    // --- Highlighting Logic ---
    let userEntry = null;
    let userIndex = -1;

    if (highlightUserId) {
      userIndex = leaderboardData.findIndex(
        (entry) => entry.userId === highlightUserId
      );
      if (userIndex !== -1) {
        // Create a copy and add the rank explicitly for formatting
        userEntry = {
          ...leaderboardData[userIndex],
          rank: userIndex + 1,
          isCurrentUser: true,
        };
      }
    }

    // If user is not in top 10 but we have their rank (from submitScore response)
    if (userIndex === -1 && highlightRank !== null && highlightUserId) {
      // Fetch the latest username from the UI component
      const currentUsername = window.playerNameUI?.getPlayerName() || "You"; // "Bạn" = You

      userEntry = {
        userId: highlightUserId,
        username: currentUsername, // Use the latest name
        score: typeof score !== "undefined" ? score : 0, // Current game score if available
        survivalTime: typeof survivalTime !== "undefined" ? survivalTime : 0, // Add survivalTime
        country: "Your Location", // Placeholder or fetch if possible
        countryCode: "XX", // Placeholder
        rank: highlightRank,
        isCurrentUser: true, // Flag for styling
      };
    }
    // --- End Highlighting Logic ---

    // Slice to top 10 for display
    const displayData = leaderboardData.slice(0, 10);

    // Render entries
    container.innerHTML = displayData
      .map((entry, index) => {
        // Check if this entry is the current user (could be in top 10)
        const isCurrentUserEntry = entry.userId === highlightUserId;
        // Use the explicitly created userEntry if it matches this entry's ID, otherwise use the entry from the list
        const entryToFormat =
          isCurrentUserEntry && userEntry
            ? userEntry
            : { ...entry, rank: index + 1 }; // Add rank for formatter

        const entryHtml = formatGlobalEntry(entryToFormat, index); // Use formatter, pass index for rank display if needed

        // Add current-user class if needed
        return isCurrentUserEntry
          ? entryHtml.replace(
              'class="leaderboard-entry',
              'class="leaderboard-entry current-user'
            )
          : entryHtml;
      })
      .join("");

    // Add user's entry if they are outside top 10 but rank is known
    if (userEntry && userIndex === -1 && userEntry.rank > 10) {
      container.innerHTML += '<div class="leaderboard-ellipsis">...</div>';
      // Ensure the correct rank is passed to the formatter
      const userEntryHtml = formatGlobalEntry(userEntry, userEntry.rank - 1);
      // Add current-user class correctly
      container.innerHTML += userEntryHtml.replace(
        'class="leaderboard-entry',
        'class="leaderboard-entry current-user'
      );
    }

    // Scroll to the user's entry if highlighted
    const userElement = container.querySelector(".current-user");
    if (userElement) {
      // Slight delay to ensure element is fully rendered before scrolling
      setTimeout(() => {
        userElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  } catch (error) {
    console.error("Error rendering leaderboard snippet:", error);
    container.innerHTML =
      '<div class="no-data">Error loading LB. Showing local scores.</div>'; // Error loading LB. Showing local scores.
    // Optionally show local scores as fallback
    showOfflineLeaderboard(targetElementId);
  }
}

// --- Event Listeners & Initialization ---

window.addEventListener("beforeunload", () => {
  stopHeartbeat();
  if (websocket) {
    websocket.close();
  }
});

// SỬA ĐỔI: Thay đổi cách gọi renderCurrentLeaderboardData
// Nó sẽ dùng dữ liệu đã lưu trữ trừ khi có cờ forceRefresh
function renderCurrentLeaderboardData(options = {}) {
  const { forceRefresh = false, ...renderOptions } = options;
  const targetId = renderOptions.targetElementId || "global-leaderboard-list"; // Default target

  if (targetId === "global-leaderboard-list") {
    if (forceRefresh || globalLeaderboard.length === 0) {
      loadInitialData(); // Reload all data for main dashboard view
    } else {
      updateGlobalLeaderboardUI(new Map(), renderOptions); // Render existing data
    }
  } else if (targetId === "game-over-leaderboard-container") {
    // Game over now uses its own dedicated function
    renderLeaderboardSnippet({ ...renderOptions, forceRefresh: forceRefresh });
  } else {
    // Handle other potential targets or just update global if unknown
    updateGlobalLeaderboardUI(new Map(), renderOptions);
  }

  // Update other parts if necessary (country, stats) - could be conditional
  updateCountryLeaderboardUI();
  updatePlayerStats();
}

// Make functions globally available
window.initializeDashboard = initializeDashboard;
window.updatePlayerStats = updatePlayerStats;
window.renderCurrentLeaderboardData = renderCurrentLeaderboardData;
window.renderLeaderboardSnippet = renderLeaderboardSnippet; // Export new function
window.loadCountryData = loadCountryData; // Export country data loader
