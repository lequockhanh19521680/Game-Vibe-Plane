const backgroundMusicElement = document.getElementById("background-music");
let musicPaused = false;

function startBackgroundMusic() {
  if (backgroundMusicElement) {
    // Set volume from config, maybe a bit quieter for background
    backgroundMusicElement.volume =
      GAME_CONFIG.audio.volumes.backgroundMusic * 0.7;

    // play() returns a promise which can reject if the user hasn't interacted
    const playPromise = backgroundMusicElement.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Could not play background music:", error);
        // The browser prevented autoplay, it will start on the next interaction.
      });
    }
    musicPaused = false;
  }
}

function stopBackgroundMusic() {
  if (backgroundMusicElement) {
    backgroundMusicElement.pause();
    backgroundMusicElement.currentTime = 0; // Rewind to the start
  }
  musicPaused = false;
}

function pauseBackgroundMusic() {
  if (backgroundMusicElement && !backgroundMusicElement.paused) {
    backgroundMusicElement.pause();
    musicPaused = true;
  }
}

function resumeBackgroundMusic() {
  if (backgroundMusicElement && backgroundMusicElement.paused && musicPaused) {
    backgroundMusicElement.play().catch((error) => {
      console.error("Could not resume background music:", error);
    });
    musicPaused = false;
  }
}

// These functions are no longer needed for procedural audio but are kept to avoid breaking calls.
function startSpaceAmbience() {
  // Now handled by the MP3 file
}

function stopSpaceAmbience() {
  // Now handled by the MP3 file
}
