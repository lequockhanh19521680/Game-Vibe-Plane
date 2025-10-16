// Backend API Configuration
// After deploying the backend, update the API_BASE_URL with your actual API Gateway endpoint
// Example: 'https://abc123.execute-api.us-east-1.amazonaws.com/prod'

const BACKEND_CONFIG = {
  // Set this to your deployed API Gateway URL, or leave empty to use local storage only
  API_BASE_URL: '', // Update this after deploying the backend
  
  // Enable/disable backend integration
  USE_BACKEND: false, // Set to true after deploying backend and updating API_BASE_URL
  
  // Fallback to local storage if backend is unavailable
  FALLBACK_TO_LOCAL: true,
};

// API Service for communicating with backend
const BackendAPI = {
  /**
   * Submit game score to backend
   */
  async submitScore(username, score, survivalTime, deathCause) {
    if (!BACKEND_CONFIG.USE_BACKEND || !BACKEND_CONFIG.API_BASE_URL) {
      console.log('Backend integration disabled, using local storage only');
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_CONFIG.API_BASE_URL}/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username || 'Me',
          score: Math.floor(score),
          survivalTime: Math.floor(survivalTime),
          deathCause: deathCause || 'unknown',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Score submitted to backend:', data);
      return data;
    } catch (error) {
      console.error('Error submitting score to backend:', error);
      
      if (BACKEND_CONFIG.FALLBACK_TO_LOCAL) {
        console.log('Falling back to local storage');
      }
      
      return null;
    }
  },

  /**
   * Fetch leaderboard from backend
   */
  async fetchLeaderboard(limit = 100, country = null) {
    if (!BACKEND_CONFIG.USE_BACKEND || !BACKEND_CONFIG.API_BASE_URL) {
      console.log('Backend integration disabled, using local storage only');
      return null;
    }

    try {
      let url = `${BACKEND_CONFIG.API_BASE_URL}/leaderboard?limit=${limit}`;
      if (country) {
        url += `&country=${country}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Leaderboard fetched from backend:', data);
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard from backend:', error);
      
      if (BACKEND_CONFIG.FALLBACK_TO_LOCAL) {
        console.log('Falling back to local storage');
      }
      
      return null;
    }
  },
};

// Make BackendAPI globally available
window.BackendAPI = BackendAPI;
window.BACKEND_CONFIG = BACKEND_CONFIG;
