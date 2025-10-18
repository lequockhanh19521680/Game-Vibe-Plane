// Real-time Dashboard and leaderboard functionality

let websocket = null;
let globalLeaderboard = [];
let countryLeaderboard = [];
let isConnected = false;

// Initialize dashboard functionality
function initializeDashboard() {
  setupTabSwitching();
  connectWebSocket();
  loadInitialData();
  updatePlayerStats();
}

// Setup tab switching functionality
function setupTabSwitching() {
  const tabs = document.querySelectorAll(".dashboard-tab");
  const contents = document.querySelectorAll(".dashboard-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const targetContent = document.getElementById(`${targetTab}-content`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
}

// Connect to WebSocket for real-time updates
function connectWebSocket() {
  if (!BACKEND_CONFIG.USE_BACKEND || !BACKEND_CONFIG.API_BASE_URL) {
    updateConnectionStatus('offline', 'Backend disabled');
    return;
  }

  try {
    // Convert HTTP URL to WebSocket URL
    const wsUrl = BACKEND_CONFIG.API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    
    updateConnectionStatus('connecting', 'Connecting...');
    
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      isConnected = true;
      updateConnectionStatus('connected', 'Live');
      
      // Subscribe to real-time updates
      websocket.send(JSON.stringify({ action: 'subscribe' }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      isConnected = false;
      updateConnectionStatus('disconnected', 'Disconnected');
      
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      updateConnectionStatus('error', 'Connection error');
    };
    
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    updateConnectionStatus('error', 'Connection failed');
  }
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(message) {
  switch (message.type) {
    case 'leaderboard_update':
      if (message.data.type === 'global') {
        globalLeaderboard = message.data.leaderboard;
        updateGlobalLeaderboard();
      }
      break;
      
    case 'country_update':
      if (message.data.type === 'countries') {
        countryLeaderboard = message.data.countries;
        updateCountryLeaderboard();
      }
      break;
      
    case 'pong':
      // Keep-alive response
      break;
      
    default:
      console.log('Unknown WebSocket message type:', message.type);
  }
}

// Load initial leaderboard data
async function loadInitialData() {
  try {
    // Load global leaderboard
    const globalData = await BackendAPI.fetchLeaderboard(10);
    if (globalData && globalData.leaderboard) {
      globalLeaderboard = globalData.leaderboard;
      updateGlobalLeaderboard();
    }
    
    // Load country leaderboard
    const countryData = await BackendAPI.fetchLeaderboardByCountry(null, 10);
    if (countryData && countryData.countries) {
      countryLeaderboard = countryData.countries;
      updateCountryLeaderboard();
    }
  } catch (error) {
    console.error('Error loading initial leaderboard data:', error);
    showOfflineLeaderboard();
  }
}

// Update global leaderboard display
function updateGlobalLeaderboard() {
  const leaderboardList = document.getElementById("global-leaderboard-list");
  if (!leaderboardList) return;

  if (globalLeaderboard.length === 0) {
    leaderboardList.innerHTML = '<div class="no-data">No scores yet. Be the first!</div>';
    return;
  }

  leaderboardList.innerHTML = "";

  globalLeaderboard.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "leaderboard-entry";
    
    // Add special styling for top 3
    if (index < 3) {
      entryElement.classList.add(`rank-${index + 1}`);
    }
    
    const timeFormatted = formatTime(entry.survivalTime || 0);
    const countryFlag = getCountryFlag(entry.countryCode);
    
    entryElement.innerHTML = `
      <div class="rank">
        ${index < 3 ? getRankMedal(index + 1) : `#${index + 1}`}
      </div>
      <div class="player-info">
        <div class="username">${escapeHtml(entry.username)}</div>
        <div class="country">
          ${countryFlag} ${entry.country || 'Unknown'}
        </div>
      </div>
      <div class="score">${entry.score.toLocaleString()}</div>
      <div class="time">${timeFormatted}</div>
    `;
    
    leaderboardList.appendChild(entryElement);
  });
}

// Update country leaderboard display
function updateCountryLeaderboard() {
  const leaderboardList = document.getElementById("country-leaderboard-list");
  if (!leaderboardList) return;

  if (countryLeaderboard.length === 0) {
    leaderboardList.innerHTML = '<div class="no-data">No country data yet.</div>';
    return;
  }

  leaderboardList.innerHTML = "";

  countryLeaderboard.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "country-entry";
    
    // Add special styling for top 3
    if (index < 3) {
      entryElement.classList.add(`rank-${index + 1}`);
    }
    
    const countryFlag = getCountryFlag(entry.country);
    const top10Score = entry.top10PercentScore || entry.totalScore;
    
    entryElement.innerHTML = `
      <div class="rank">
        ${index < 3 ? getRankMedal(index + 1) : `#${index + 1}`}
      </div>
      <div class="country-info">
        <div class="country-name">
          ${countryFlag} ${entry.country}
        </div>
        <div class="country-stats">
          ${entry.playerCount} players
        </div>
      </div>
      <div class="country-scores">
        <div class="top-score">${top10Score.toLocaleString()}</div>
        <div class="avg-score">Avg: ${entry.averageScore.toLocaleString()}</div>
      </div>
    `;
    
    leaderboardList.appendChild(entryElement);
  });
}

// Show offline leaderboard (from localStorage)
function showOfflineLeaderboard() {
  const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
  const sortedHistory = gameHistory.sort((a, b) => b.score - a.score).slice(0, 10);
  
  const leaderboardList = document.getElementById("global-leaderboard-list");
  if (!leaderboardList) return;
  
  if (sortedHistory.length === 0) {
    leaderboardList.innerHTML = '<div class="no-data">No local scores yet. Play a game!</div>';
    return;
  }
  
  leaderboardList.innerHTML = "";
  
  sortedHistory.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "leaderboard-entry offline";
    
    const timeFormatted = formatTime(entry.time || 0);
    
    entryElement.innerHTML = `
      <div class="rank">#${index + 1}</div>
      <div class="player-info">
        <div class="username">You (Offline)</div>
        <div class="country">Local Game</div>
      </div>
      <div class="score">${entry.score.toLocaleString()}</div>
      <div class="time">${timeFormatted}</div>
    `;
    
    leaderboardList.appendChild(entryElement);
  });
}

// Update player statistics
function updatePlayerStats() {
  const playerStats = document.getElementById("player-stats");
  if (!playerStats) return;

  // Get stats from localStorage
  const highScore = localStorage.getItem(GAME_CONFIG.core.localStorageKey) || 0;
  const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
  const gamesPlayed = gameHistory.length;
  const totalTime = gameHistory.reduce((sum, game) => sum + (game.time || 0), 0);
  const averageScore = gamesPlayed > 0 ? Math.floor(gameHistory.reduce((sum, game) => sum + game.score, 0) / gamesPlayed) : 0;

  // Calculate death statistics
  const deathStats = {};
  gameHistory.forEach(game => {
    const cause = game.deathBy || 'unknown';
    deathStats[cause] = (deathStats[cause] || 0) + 1;
  });

  const mostCommonDeath = Object.keys(deathStats).reduce((a, b) => 
    deathStats[a] > deathStats[b] ? a : b, 'none');

  playerStats.innerHTML = `
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
        <div class="stat-label">📊 Average Score</div>
        <div class="stat-value">${averageScore.toLocaleString()}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">💀 Most Common Death</div>
        <div class="stat-value">${formatDeathCause(mostCommonDeath)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">⚡ Best Survival</div>
        <div class="stat-value">${formatTime(Math.max(...gameHistory.map(g => g.time || 0), 0))}</div>
      </div>
    </div>
  `;
}

// Update connection status indicator
function updateConnectionStatus(status, text) {
  const indicator = document.getElementById('connection-indicator');
  const statusText = document.getElementById('connection-text');
  
  if (indicator && statusText) {
    const statusConfig = {
      'connecting': { icon: '🟡', text: text },
      'connected': { icon: '🟢', text: text },
      'disconnected': { icon: '🔴', text: text },
      'error': { icon: '🔴', text: text },
      'offline': { icon: '⚫', text: text }
    };
    
    const config = statusConfig[status] || statusConfig['offline'];
    indicator.textContent = config.icon;
    statusText.textContent = config.text;
  }
}

// Utility functions
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDeathCause(cause) {
  const deathCauses = {
    'asteroid collision': '☄️ Asteroid',
    'missile collision': '🚀 Missile',
    'laser collision': '⚡ Laser',
    'black hole collision': '🕳️ Black Hole',
    'plasma field burn': '🔥 Plasma',
    'crystal cluster collision': '💎 Crystal',
    'laser mine collision': '💣 Mine',
    'unknown': '❓ Unknown'
  };
  return deathCauses[cause] || `❓ ${cause}`;
}

function getRankMedal(rank) {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[rank - 1] || `#${rank}`;
}

function getCountryFlag(countryCode) {
  if (!countryCode || countryCode === 'XX') return '🌍';
  
  // Convert country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Cleanup WebSocket on page unload
window.addEventListener('beforeunload', () => {
  if (websocket) {
    websocket.close();
  }
});

// Legacy function for backward compatibility
function updateLeaderboard() {
  loadInitialData();
}

// Make functions globally available
window.initializeDashboard = initializeDashboard;
window.updateLeaderboard = updateLeaderboard;
window.updatePlayerStats = updatePlayerStats;

// Call initialization when the script loads
document.addEventListener("DOMContentLoaded", initializeDashboard);