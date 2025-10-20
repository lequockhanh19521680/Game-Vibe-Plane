// Generate enhanced synthetic sounds using Web Audio API with space characteristics
function createSound(
  frequency,
  duration,
  type = "sine",
  volume = 0.3,
  useReverb = false,
  options = {}
) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Spatial positioning
  const pannerNode = options.spatial ? audioContext.createStereoPanner() : null;
  if (pannerNode) {
    oscillator.connect(pannerNode);
    pannerNode.connect(gainNode);
    pannerNode.pan.setValueAtTime(options.pan || 0, audioContext.currentTime);
  } else {
    oscillator.connect(gainNode);
  }

  gainNode.connect(audioContext.destination);

  // Set frequency with optional modulation for cosmic effects
  if (options.modulate) {
    const modFreq = options.modFreq || 4;
    const modDepth = options.modDepth || 10;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      frequency + modDepth,
      audioContext.currentTime + duration / 2
    );
    oscillator.frequency.linearRampToValueAtTime(
      frequency,
      audioContext.currentTime + duration
    );
  } else {
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  }

  oscillator.type = type;

  // Advanced envelope for more natural sound
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    volume,
    audioContext.currentTime + (options.attack || 0.01)
  );

  // Release phase
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Enhanced cosmic explosion sound with spatial positioning
function createExplosionSound() {
  const duration = 0.7;
  const frequencies = [60, 90, 150, 220, 350, 480];
  const types = [
    "sawtooth",
    "square",
    "triangle",
    "sawtooth",
    "square",
    "sine",
  ];

  frequencies.forEach((freq, index) => {
    const pan = Math.random() * 1.2 - 0.6;
    setTimeout(() => {
      createSound(
        freq + (Math.random() * 20 - 10),
        duration * (0.8 - index * 0.08),
        types[index],
        GAME_CONFIG.audio.volumes.explosion * (1 - index * 0.1),
        true,
        { attack: 0.01, spatial: true, pan: pan }
      );
    }, index * 30);
  });
}

function createLaserSound() {
  createSound(
    800 + Math.random() * 100,
    0.15,
    "square",
    GAME_CONFIG.audio.volumes.laser,
    true,
    {
      attack: 0.01,
      modulate: true,
      modFreq: 20,
      modDepth: 50,
    }
  );
}

function createMissileSound() {
  createSound(
    180 + Math.random() * 40,
    0.4,
    "sawtooth",
    GAME_CONFIG.audio.volumes.missile,
    false,
    {
      attack: 0.05,
      decay: 0.1,
      sustain: true,
      sustainLevel: 0.8,
    }
  );
}

function createButtonHoverSound() {
  createSound(600, 0.15, "sine", GAME_CONFIG.audio.volumes.buttonHover, true, {
    attack: 0.01,
    decay: 0.05,
  });
}

function createCollisionSound() {
  createSound(
    250 + Math.random() * 50,
    0.2,
    "square",
    GAME_CONFIG.audio.volumes.collision,
    true,
    {
      attack: 0.01,
      spatial: true,
      pan: Math.random() * 0.8 - 0.4,
    }
  );
}

function createWarningSound() {
  createSound(1100, 0.12, "sine", GAME_CONFIG.audio.volumes.warning, true, {
    modulate: true,
    modFreq: 8,
    modDepth: 30,
    spatial: true,
    pan: -0.3,
  });
  setTimeout(() => {
    createSound(1100, 0.12, "sine", GAME_CONFIG.audio.volumes.warning, true, {
      modulate: true,
      modFreq: 8,
      modDepth: 30,
      spatial: true,
      pan: 0.3,
    });
  }, 120);
}

function createScoreSound() {
  createSound(
    500 + Math.random() * 50,
    0.15,
    "sine",
    GAME_CONFIG.audio.volumes.score,
    true,
    {
      attack: 0.01,
      decay: 0.1,
    }
  );
  setTimeout(() => {
    createSound(
      700 + Math.random() * 50,
      0.15,
      "sine",
      GAME_CONFIG.audio.volumes.score * 0.75,
      true,
      {
        attack: 0.02,
        spatial: true,
        pan: 0.2,
      }
    );
  }, 80);
}

function createPowerUpSound() {
  createSound(440, 0.25, "sine", GAME_CONFIG.audio.volumes.powerup, true, {
    attack: 0.02,
    decay: 0.1,
  });
  setTimeout(() => {
    createSound(
      880,
      0.2,
      "triangle",
      GAME_CONFIG.audio.volumes.powerup * 0.5,
      true,
      {
        attack: 0.02,
        modulate: true,
        modFreq: 5,
        modDepth: 20,
      }
    );
  }, 240);
}

function createBlackHoleSound() {
  createSound(100, 1.0, "sine", GAME_CONFIG.audio.volumes.blackhole, true, {
    attack: 0.1,
    decay: 0.3,
    modulate: true,
    modFreq: 0.5,
    modDepth: 10,
  });
}

function createLaserMineSound() {
  createSound(600, 0.3, "sawtooth", GAME_CONFIG.audio.volumes.laserMine);
}

function createWormholeSound() {
  createSound(150, 0.6, "sine", GAME_CONFIG.audio.volumes.wormhole);
}

function createShieldSound() {
  createSound(600, 0.3, "sine", GAME_CONFIG.audio.volumes.shield * 1.2, true, {
    attack: 0.02,
    decay: 0.1,
  });
}

function createFreezeSound() {
  createSound(250, 0.5, "sine", GAME_CONFIG.audio.volumes.freeze, false, {
    attack: 0.1,
    decay: 0.3,
    modulate: true,
    modFreq: 0.5,
    modDepth: 10,
  });
}

// NEW: Sound for the decoy power-up trap
function createTrapSound() {
  createSound(200, 0.5, "sawtooth", GAME_CONFIG.audio.volumes.trap, true, {
    attack: 0.02,
    modulate: true,
    modFreq: 40,
    modDepth: 80,
  });
}
