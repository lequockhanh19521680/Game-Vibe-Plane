const backgroundMusicElement = document.getElementById("background-music");
let musicPaused = false;

function startBackgroundMusic() {
  if (backgroundMusicElement) {
    // Set volume from config
    backgroundMusicElement.volume = GAME_CONFIG.audio.volumes.backgroundMusic;

    // SỬA LỖI: Luôn tua lại nhạc về đầu khi bắt đầu game mới.
    backgroundMusicElement.currentTime = 0;

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
