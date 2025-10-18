// Enhanced Game UI Manager
// Handles HUD, Pause Menu, and Game Over screen enhancements

class GameUIManager {
  constructor() {
    this.gameStats = {
      enemiesAvoided: 0,
      powerupsCollected: 0,
      distanceTraveled: 0,
      levelReached: 1,
      deathCause: 'Unknown'
    };
    
    this.tips = [
      'Collect crystal shards for temporary shields!',
      'Move constantly to avoid predictable patterns!',
      'Higher levels spawn more dangerous enemies!',
      'Use the edges of the screen for quick escapes!',
      'Watch for warning indicators before events!',
      'Power-ups appear more frequently at higher scores!',
      'Different enemies have different movement patterns!',
      'Your score increases faster when moving!',
      'Survival time contributes to your final score!',
      'Stay calm during intense moments!'
    ];
    
    this.achievements = [
      { id: 'survivor', name: '🛡️ Survivor', condition: (stats) => stats.survivalTime >= 60 },
      { id: 'collector', name: '💎 Collector', condition: (stats) => stats.powerupsCollected >= 5 },
      { id: 'dodger', name: '🎯 Master Dodger', condition: (stats) => stats.enemiesAvoided >= 50 },
      { id: 'explorer', name: '🚀 Space Explorer', condition: (stats) => stats.distanceTraveled >= 1000 },
      { id: 'levelup', name: '📈 Level Master', condition: (stats) => stats.levelReached >= 5 },
      { id: 'highscore', name: '👑 High Scorer', condition: (stats) => stats.score >= 5000 },
      { id: 'marathon', name: '⏰ Marathon Runner', condition: (stats) => stats.survivalTime >= 300 },
      { id: 'powerhouse', name: '⚡ Power House', condition: (stats) => stats.powerupsCollected >= 10 }
    ];
  }

  /**
   * Initialize the enhanced UI system
   */
  initialize() {
    this.setupEventListeners();
    console.log('Enhanced Game UI initialized');
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    // Add any additional event listeners here
    // The main game event listeners are handled in main.js
  }

  /**
   * Update game statistics during gameplay
   */
  updateGameStats(type, value = 1) {
    switch (type) {
      case 'enemyAvoided':
        this.gameStats.enemiesAvoided += value;
        break;
      case 'powerupCollected':
        this.gameStats.powerupsCollected += value;
        break;
      case 'distanceTraveled':
        this.gameStats.distanceTraveled += value;
        break;
      case 'levelReached':
        this.gameStats.levelReached = Math.max(this.gameStats.levelReached, value);
        break;
      case 'deathCause':
        this.gameStats.deathCause = value;
        break;
    }
  }

  /**
   * Reset game statistics for new game
   */
  resetGameStats() {
    this.gameStats = {
      enemiesAvoided: 0,
      powerupsCollected: 0,
      distanceTraveled: 0,
      levelReached: 1,
      deathCause: 'Unknown'
    };
  }

  /**
   * Show enhanced pause menu with current stats
   */
  showPauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (!pauseMenu) return;

    // Update current session stats
    this.updatePauseStats();
    
    // Show a random tip
    this.updatePauseTip();
    
    pauseMenu.style.display = 'flex';
  }

  /**
   * Hide pause menu
   */
  hidePauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
      pauseMenu.style.display = 'none';
    }
  }

  /**
   * Update pause menu statistics
   */
  updatePauseStats() {
    // Current score
    const currentScoreEl = document.getElementById('pause-current-score');
    if (currentScoreEl && typeof score !== 'undefined') {
      currentScoreEl.textContent = score.toLocaleString();
    }

    // Current time
    const currentTimeEl = document.getElementById('pause-current-time');
    if (currentTimeEl && typeof survivalTime !== 'undefined') {
      currentTimeEl.textContent = this.formatTime(survivalTime);
    }

    // Current level
    const currentLevelEl = document.getElementById('pause-current-level');
    if (currentLevelEl) {
      currentLevelEl.textContent = this.gameStats.levelReached;
    }

    // High score
    const highScoreEl = document.getElementById('pause-high-score');
    if (highScoreEl && typeof highScore !== 'undefined') {
      highScoreEl.textContent = highScore.toLocaleString();
    }
  }

  /**
   * Update pause menu tip
   */
  updatePauseTip() {
    const tipEl = document.getElementById('pause-tip');
    if (tipEl) {
      const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
      tipEl.textContent = randomTip;
    }
  }

  /**
   * Show enhanced game over screen
   */
  showGameOverScreen(finalScore, finalTime, isNewHighScore = false) {
    const gameOverScreen = document.getElementById('game-over-screen');
    if (!gameOverScreen) return;

    // Update primary stats
    this.updateGameOverStats(finalScore, finalTime);
    
    // Show/hide new high score banner
    this.updateHighScoreBanner(isNewHighScore);
    
    // Check and display achievements
    this.updateAchievements(finalScore, finalTime);
    
    gameOverScreen.style.display = 'flex';
  }

  /**
   * Update game over statistics
   */
  updateGameOverStats(finalScore, finalTime) {
    // Death cause
    const deathCauseEl = document.getElementById('death-cause');
    if (deathCauseEl) {
      deathCauseEl.textContent = this.getDeathCauseMessage(this.gameStats.deathCause);
    }

    // Final score
    const finalScoreEl = document.getElementById('final-score');
    if (finalScoreEl) {
      finalScoreEl.textContent = finalScore.toLocaleString();
    }

    // Final time
    const finalTimeEl = document.getElementById('final-time');
    if (finalTimeEl) {
      finalTimeEl.textContent = this.formatTime(finalTime);
    }

    // Level reached
    const finalLevelEl = document.getElementById('final-level');
    if (finalLevelEl) {
      finalLevelEl.textContent = this.gameStats.levelReached;
    }

    // Enemies avoided
    const enemiesAvoidedEl = document.getElementById('enemies-avoided');
    if (enemiesAvoidedEl) {
      enemiesAvoidedEl.textContent = this.gameStats.enemiesAvoided.toLocaleString();
    }

    // Power-ups collected
    const powerupsCollectedEl = document.getElementById('powerups-collected');
    if (powerupsCollectedEl) {
      powerupsCollectedEl.textContent = this.gameStats.powerupsCollected;
    }

    // Distance traveled
    const distanceTraveledEl = document.getElementById('distance-traveled');
    if (distanceTraveledEl) {
      distanceTraveledEl.textContent = Math.round(this.gameStats.distanceTraveled) + 'm';
    }
  }

  /**
   * Update high score banner visibility
   */
  updateHighScoreBanner(isNewHighScore) {
    const banner = document.getElementById('new-highscore-msg');
    if (banner) {
      banner.style.display = isNewHighScore ? 'flex' : 'none';
    }
  }

  /**
   * Check and display achievements
   */
  updateAchievements(finalScore, finalTime) {
    const stats = {
      score: finalScore,
      survivalTime: finalTime,
      ...this.gameStats
    };

    const unlockedAchievements = this.achievements.filter(achievement => 
      achievement.condition(stats)
    );

    const achievementsSection = document.getElementById('achievements-section');
    const achievementsList = document.getElementById('achievements-list');

    if (unlockedAchievements.length > 0 && achievementsSection && achievementsList) {
      achievementsSection.style.display = 'block';
      
      achievementsList.innerHTML = unlockedAchievements
        .map(achievement => `
          <div class="achievement-badge">
            <span>${achievement.name}</span>
          </div>
        `).join('');
    } else if (achievementsSection) {
      achievementsSection.style.display = 'none';
    }
  }

  /**
   * Get death cause message
   */
  getDeathCauseMessage(cause) {
    const messages = {
      'asteroid': 'Destroyed by asteroid collision',
      'missile': 'Hit by guided missile',
      'blackhole': 'Consumed by black hole',
      'laser': 'Vaporized by laser beam',
      'mine': 'Triggered explosive mine',
      'plasma': 'Burned by plasma field',
      'boundary': 'Crashed into boundary',
      'unknown': 'Unknown cause of destruction'
    };

    return messages[cause] || messages['unknown'];
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Update HUD with enhanced information
   */
  updateHUD() {
    // This method can be called during gameplay to update HUD elements
    // Currently, the main HUD updates are handled in the main game loop
    
    // Update distance traveled (example calculation)
    if (typeof player !== 'undefined' && player.x !== undefined && player.y !== undefined) {
      // Simple distance calculation based on movement
      const currentDistance = Math.sqrt(player.x * player.x + player.y * player.y) / 10;
      this.updateGameStats('distanceTraveled', currentDistance - this.gameStats.distanceTraveled);
    }
  }

  /**
   * Handle enemy collision (for statistics)
   */
  handleEnemyCollision(enemyType) {
    this.updateGameStats('deathCause', enemyType);
  }

  /**
   * Handle enemy avoided (for statistics)
   */
  handleEnemyAvoided() {
    this.updateGameStats('enemyAvoided');
  }

  /**
   * Handle power-up collection (for statistics)
   */
  handlePowerUpCollection() {
    this.updateGameStats('powerupCollected');
  }

  /**
   * Handle level progression (for statistics)
   */
  handleLevelProgression(newLevel) {
    this.updateGameStats('levelReached', newLevel);
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return { ...this.gameStats };
  }
}

// Create global instance
const gameUIManager = new GameUIManager();

// Export for use
window.GameUIManager = GameUIManager;
window.gameUIManager = gameUIManager;