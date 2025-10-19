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

    for (let i = 0; i < 5; i++) {
      oscillator.frequency.setValueAtTime(
        frequency + Math.sin(i * modFreq) * modDepth,
        audioContext.currentTime + i * 0.1
      );
    }
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

  // Sustain phase
  if (options.sustain) {
    gainNode.gain.setValueAtTime(
      volume * (options.sustainLevel || 0.7),
      audioContext.currentTime +
        (options.attack || 0.01) +
        (options.decay || 0.1)
    );
  }

  // Release phase
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);

  return oscillator;
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
        {
          attack: 0.01,
          spatial: true,
          pan: pan,
        }
      );

      if (index < 3) {
        setTimeout(() => {
          createSound(
            freq * 1.4 + Math.random() * 40,
            duration * 0.3,
            "triangle",
            GAME_CONFIG.audio.volumes.explosion * 0.4,
            true,
            {
              attack: 0.05,
              spatial: true,
              pan: -pan * 0.7,
            }
          );
        }, 80 + index * 50);
      }
    }, index * 30);
  });

  setTimeout(() => {
    createSound(
      50,
      0.8,
      "sine",
      GAME_CONFIG.audio.volumes.explosion * 0.7,
      true,
      {
        attack: 0.1,
        decay: 0.3,
        sustain: true,
        sustainLevel: 0.4,
      }
    );
  }, 200);
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
  setTimeout(() => {
    createSound(
      1200 + Math.random() * 200,
      0.25,
      "sawtooth",
      GAME_CONFIG.audio.volumes.laser * 0.8,
      true,
      {
        attack: 0.01,
        decay: 0.1,
        spatial: true,
        pan: Math.random() * 0.6 - 0.3,
      }
    );
  }, 50);
  setTimeout(() => {
    createSound(
      600 + Math.random() * 150,
      0.3,
      "triangle",
      GAME_CONFIG.audio.volumes.laser * 0.4,
      true,
      {
        attack: 0.05,
        spatial: true,
        pan: Math.random() * 0.4 - 0.2,
      }
    );
  }, 120);
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
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createSound(
        1200 + Math.random() * 300,
        0.15,
        "sine",
        GAME_CONFIG.audio.volumes.missile * 0.5,
        false,
        {
          attack: 0.01,
        }
      );
    }, 100 + i * 150);
  }
  setTimeout(() => {
    createSound(
      220,
      0.3,
      "square",
      GAME_CONFIG.audio.volumes.missile * 0.7,
      false
    );
  }, 200);
}

function createButtonHoverSound() {
  createSound(600, 0.15, "sine", GAME_CONFIG.audio.volumes.buttonHover, true, {
    attack: 0.01,
    decay: 0.05,
    sustain: false,
  });
  setTimeout(() => {
    createSound(
      900,
      0.1,
      "sine",
      GAME_CONFIG.audio.volumes.buttonHover * 0.6,
      true
    );
  }, 30);
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
  setTimeout(() => {
    createSound(
      400 + Math.random() * 100,
      0.15,
      "triangle",
      GAME_CONFIG.audio.volumes.collision * 0.67,
      true,
      {
        attack: 0.02,
        spatial: true,
        pan: Math.random() * 0.6 - 0.3,
      }
    );
  }, 50);
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createSound(
          500 + Math.random() * 300,
          0.08,
          "triangle",
          GAME_CONFIG.audio.volumes.collision * 0.3,
          true,
          {
            attack: 0.01,
            spatial: true,
            pan: Math.random() * 1.4 - 0.7,
          }
        );
      }, i * 40);
    }
  }, 120);
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
  setTimeout(() => {
    createSound(
      300,
      0.4,
      "triangle",
      GAME_CONFIG.audio.volumes.warning * 0.4,
      true,
      {
        attack: 0.05,
        decay: 0.2,
      }
    );
  }, 60);
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
  setTimeout(() => {
    createSound(
      1200,
      0.12,
      "triangle",
      GAME_CONFIG.audio.volumes.score * 0.4,
      true,
      {
        attack: 0.01,
        spatial: true,
        pan: -0.2,
      }
    );
  }, 160);
}

function createPowerUpSound() {
  createSound(440, 0.25, "sine", GAME_CONFIG.audio.volumes.powerup, true, {
    attack: 0.02,
    decay: 0.1,
    sustain: true,
    sustainLevel: 0.7,
  });
  setTimeout(() => {
    createSound(
      550,
      0.25,
      "sine",
      GAME_CONFIG.audio.volumes.powerup * 0.83,
      true,
      {
        attack: 0.03,
        spatial: true,
        pan: 0.3,
      }
    );
  }, 80);
  setTimeout(() => {
    createSound(
      660,
      0.25,
      "sine",
      GAME_CONFIG.audio.volumes.powerup * 0.67,
      true,
      {
        attack: 0.04,
        spatial: true,
        pan: -0.3,
      }
    );
  }, 160);
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
  setTimeout(() => {
    createSound(
      330,
      0.4,
      "sine",
      GAME_CONFIG.audio.volumes.powerup * 0.4,
      true,
      {
        attack: 0.1,
        decay: 0.2,
      }
    );
  }, 300);
}

function createBlackHoleSound() {
  createSound(100, 1.0, "sine", GAME_CONFIG.audio.volumes.blackhole, true, {
    attack: 0.1,
    decay: 0.3,
    sustain: true,
    sustainLevel: 0.8,
    modulate: true,
    modFreq: 0.5,
    modDepth: 10,
  });
  setTimeout(() => {
    createSound(
      80,
      0.8,
      "triangle",
      GAME_CONFIG.audio.volumes.blackhole * 0.67,
      true,
      {
        attack: 0.2,
        spatial: true,
        pan: 0.3,
      }
    );
  }, 200);
  setTimeout(() => {
    createSound(
      60,
      1.2,
      "sawtooth",
      GAME_CONFIG.audio.volumes.blackhole * 0.3,
      true,
      {
        attack: 0.3,
        spatial: true,
        pan: -0.4,
      }
    );
  }, 400);
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createSound(
        120 - i * 10,
        0.4,
        "sine",
        GAME_CONFIG.audio.volumes.blackhole * (0.5 - i * 0.1),
        true,
        {
          attack: 0.1,
          spatial: true,
          pan: (i - 1) * 0.5,
        }
      );
    }, 300 + i * 200);
  }
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
    createSound(900, 0.2, "sine", GAME_CONFIG.audio.volumes.laserMine * 0.7);
  }, 50);
}

function createWormholeSound() {
  createSound(150, 0.6, "sine", GAME_CONFIG.audio.volumes.wormhole);
  createSound(300, 0.4, "triangle", GAME_CONFIG.audio.volumes.wormhole * 0.5);
}

function createShieldSound() {
  createSound(600, 0.3, "sine", GAME_CONFIG.audio.volumes.shield * 1.2, true, {
    attack: 0.02,
    decay: 0.1,
    sustain: true,
    sustainLevel: 0.7,
    release: 0.4,
  });

  createSound(
    1200,
    0.35,
    "triangle",
    GAME_CONFIG.audio.volumes.shield * 0.8,
    true,
    {
      attack: 0.1,
      decay: 0.2,
      sustain: true,
      sustainLevel: 0.3,
      release: 0.5,
      modulate: true,
      modFreq: 5,
      modDepth: 10,
    }
  );
}

function createFreezeSound() {
  createSound(250, 0.5, "sine", GAME_CONFIG.audio.volumes.freeze, false, {
    attack: 0.1,
    decay: 0.3,
    frequencySlide: -30,
    modulate: true,
    modFreq: 0.5,
    modDepth: 10,
  });

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const pan = i % 2 === 0 ? -0.8 + i * 0.4 : 0.8 - i * 0.4;
      createSound(
        1500 + Math.random() * 500,
        0.2,
        "sine",
        GAME_CONFIG.audio.volumes.freeze * 0.3,
        true,
        {
          attack: 0.01,
          decay: 0.2,
          spatial: true,
          pan: pan,
        }
      );
    }, 50 + i * 80);
  }

  setTimeout(() => {
    createSound(
      180,
      0.3,
      "triangle",
      GAME_CONFIG.audio.volumes.freeze * 0.6,
      true,
      {
        attack: 0.05,
        decay: 0.2,
        frequencySlide: -20,
      }
    );
  }, 100);
}
