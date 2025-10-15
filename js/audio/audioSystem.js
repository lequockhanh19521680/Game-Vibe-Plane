// --- Audio System ---
let audioContext;
let backgroundMusicInterval;

function initAudioSystem() {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

// Generate synthetic sounds using Web Audio API
function createSound(frequency, duration, type = "sine", volume = 0.3) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    volume,
    audioContext.currentTime + 0.01
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);

  return oscillator;
}

function createExplosionSound() {
  const duration = 0.4;
  const frequencies = [80, 120, 200, 350];

  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      createSound(
        freq,
        duration * 0.8,
        "sawtooth",
        GAME_CONFIG.audio.volumes.explosion
      );
    }, index * 20);
  });
}

function createLaserSound() {
  createSound(800, 0.1, "square", GAME_CONFIG.audio.volumes.laser);
  setTimeout(() => {
    createSound(
      1200,
      0.2,
      "sawtooth",
      GAME_CONFIG.audio.volumes.laser * 0.8
    );
  }, 100);
}

function createMissileSound() {
  createSound(200, 0.3, "sawtooth", GAME_CONFIG.audio.volumes.missile);
}

function createButtonHoverSound() {
  createSound(600, 0.1, "sine", GAME_CONFIG.audio.volumes.buttonHover);
}

function createCollisionSound() {
  createSound(250, 0.15, "square", GAME_CONFIG.audio.volumes.collision);
  setTimeout(() => {
    createSound(
      400,
      0.1,
      "triangle",
      GAME_CONFIG.audio.volumes.collision * 0.67
    );
  }, 50);
}

function createWarningSound() {
  createSound(1100, 0.08, "sine", GAME_CONFIG.audio.volumes.warning);
  setTimeout(() => {
    createSound(1100, 0.08, "sine", GAME_CONFIG.audio.volumes.warning);
  }, 120);
}

function createScoreSound() {
  createSound(500, 0.1, "sine", GAME_CONFIG.audio.volumes.score);
  setTimeout(() => {
    createSound(700, 0.1, "sine", GAME_CONFIG.audio.volumes.score * 0.75);
  }, 100);
}

function createPowerUpSound() {
  createSound(440, 0.2, "sine", GAME_CONFIG.audio.volumes.powerup);
  setTimeout(() => {
    createSound(
      550,
      0.2,
      "sine",
      GAME_CONFIG.audio.volumes.powerup * 0.83
    );
  }, 100);
  setTimeout(() => {
    createSound(
      660,
      0.2,
      "sine",
      GAME_CONFIG.audio.volumes.powerup * 0.67
    );
  }, 200);
}

function createBlackHoleSound() {
  createSound(100, 0.8, "sine", GAME_CONFIG.audio.volumes.blackhole);
  setTimeout(() => {
    createSound(
      80,
      0.6,
      "triangle",
      GAME_CONFIG.audio.volumes.blackhole * 0.67
    );
  }, 200);
}

function createBlackHoleGrowthSound() {
  createSound(90, 0.5, "sine", GAME_CONFIG.audio.volumes.blackholeGrowth);
}

function createBlackHoleDestroySound() {
  createSound(
    120,
    0.7,
    "triangle",
    GAME_CONFIG.audio.volumes.blackholeDestroy
  );
  setTimeout(() => {
    createSound(
      60,
      0.4,
      "square",
      GAME_CONFIG.audio.volumes.blackholeDestroy * 0.8
    );
  }, 100);
}

function createFragmentHitSound() {
  createSound(800, 0.15, "square", GAME_CONFIG.audio.volumes.fragmentHit);
  createSound(
    1200,
    0.1,
    "triangle",
    GAME_CONFIG.audio.volumes.fragmentHit * 0.6
  );
}

function createLaserMineSound() {
  createSound(600, 0.3, "sawtooth", GAME_CONFIG.audio.volumes.laserMine);
  setTimeout(() => {
    createSound(
      900,
      0.2,
      "sine",
      GAME_CONFIG.audio.volumes.laserMine * 0.7
    );
  }, 50);
}

function createWormholeSound() {
  createSound(150, 0.6, "sine", GAME_CONFIG.audio.volumes.wormhole);
  createSound(
    300,
    0.4,
    "triangle",
    GAME_CONFIG.audio.volumes.wormhole * 0.5
  );
}

function createShieldSound() {
  createSound(400, 0.4, "sine", GAME_CONFIG.audio.volumes.shield);
  createSound(
    600,
    0.3,
    "triangle",
    GAME_CONFIG.audio.volumes.shield * 0.7
  );
}

function createFreezeSound() {
  createSound(250, 0.5, "sine", GAME_CONFIG.audio.volumes.freeze);
  setTimeout(() => {
    createSound(
      180,
      0.3,
      "triangle",
      GAME_CONFIG.audio.volumes.freeze * 0.6
    );
  }, 100);
}

function startBackgroundMusic(isGameRunning) {
  if (backgroundMusicInterval) clearInterval(backgroundMusicInterval);
  const frequencies = GAME_CONFIG.audio.backgroundMusic.frequencies;
  let currentIndex = 0;

  backgroundMusicInterval = setInterval(() => {
    if (isGameRunning && audioContext) {
      createSound(
        frequencies[currentIndex],
        GAME_CONFIG.audio.backgroundMusic.duration,
        "sine",
        GAME_CONFIG.audio.volumes.backgroundMusic
      );
      currentIndex = (currentIndex + 1) % frequencies.length;
    }
  }, GAME_CONFIG.audio.backgroundMusic.interval);
}

function stopBackgroundMusic() {
  if (backgroundMusicInterval) {
    clearInterval(backgroundMusicInterval);
    backgroundMusicInterval = null;
  }
}

function playSound(soundType) {
  initAudioSystem();

  switch (soundType) {
    case "explosion":
      createExplosionSound();
      break;
    case "laser":
      createLaserSound();
      break;
    case "missile":
      createMissileSound();
      break;
    case "buttonHover":
      createButtonHoverSound();
      break;
    case "collision":
      createCollisionSound();
      break;
    case "warning":
      createWarningSound();
      break;
    case "backgroundMusic":
      startBackgroundMusic();
      break;
    case "score":
      createScoreSound();
      break;
    case "powerup":
      createPowerUpSound();
      break;
    case "blackhole":
      createBlackHoleSound();
      break;
    case "blackholeGrowth":
      createBlackHoleGrowthSound();
      break;
    case "blackholeDestroy":
      createBlackHoleDestroySound();
      break;
    case "fragmentHit":
      createFragmentHitSound();
      break;
    case "laserMine":
      createLaserMineSound();
      break;
    case "wormhole":
      createWormholeSound();
      break;
    case "shield":
      createShieldSound();
      break;
    case "freeze":
      createFreezeSound();
      break;
  }
}
