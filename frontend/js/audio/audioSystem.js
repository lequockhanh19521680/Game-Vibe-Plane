// --- Enhanced Space Audio System ---
let audioContext;
let backgroundMusicInterval;
let spaceAmbientInterval;
let reverbNode = null;
let analyserNode = null;

// Enhanced audio initialization with space ambience
function initAudioSystem() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create audio processing nodes for cosmic effects
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.connect(audioContext.destination);

    // Create reverb node for spacious sound
    createSpaceReverb();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Start cosmic ambient background if not already playing
  if (!spaceAmbientInterval) {
    startSpaceAmbience();
  }
}

// Create space reverb effect
function createSpaceReverb() {
  const convolver = audioContext.createConvolver();

  // Create impulse response for space-like reverb
  const rate = audioContext.sampleRate;
  const length = rate * 4; // 4 seconds reverb tail
  const impulse = audioContext.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);

    // Space reverb characteristic - sparse early reflections with long tail
    for (let i = 0; i < length; i++) {
      // Exponential decay
      const decay = Math.exp(-i / (rate * 2));

      // Sparse reflections
      if (i % 7000 === 0 || Math.random() < 0.001) {
        impulseData[i] = (Math.random() * 2 - 1) * decay * 0.5;
      } else {
        impulseData[i] = (Math.random() * 2 - 1) * decay * 0.05;
      }
    }
  }

  convolver.buffer = impulse;
  reverbNode = convolver;
  reverbNode.connect(audioContext.destination);
}

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

  // Space reverb processing
  if (useReverb && reverbNode) {
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();

    gainNode.connect(dryGain);
    gainNode.connect(wetGain);

    dryGain.connect(analyserNode);
    wetGain.connect(reverbNode);

    dryGain.gain.value = 0.7;
    wetGain.gain.value = 0.3;
  } else {
    gainNode.connect(analyserNode);
  }

  // Set frequency with optional modulation for cosmic effects
  if (options.modulate) {
    const modFreq = options.modFreq || 4;
    const modDepth = options.modDepth || 10;

    // Subtle frequency modulation for cosmic feel
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
  // Wider frequency range for more impactful explosions
  const frequencies = [60, 90, 150, 220, 350, 480];
  const types = [
    "sawtooth",
    "square",
    "triangle",
    "sawtooth",
    "square",
    "sine",
  ];

  // Create spatial explosion with shock wave effect
  frequencies.forEach((freq, index) => {
    const pan = Math.random() * 1.2 - 0.6;
    setTimeout(() => {
      // Initial blast
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

      // Secondary debris sounds
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

  // Low frequency rumble aftermath
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

// Enhanced futuristic laser weapon sound
function createLaserSound() {
  // High frequency beam
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

  // Power discharge
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

  // Energy dissipation
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

// Enhanced missile propulsion and guidance sound
function createMissileSound() {
  // Engine ignition
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

  // Guidance system beeps
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

  // Thrust variation
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

// Enhanced UI interaction sound with space theme
function createButtonHoverSound() {
  // Primary tone
  createSound(600, 0.15, "sine", GAME_CONFIG.audio.volumes.buttonHover, true, {
    attack: 0.01,
    decay: 0.05,
    sustain: false,
  });

  // Harmonic overtone
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

// Enhanced collision sound with space debris characteristics
function createCollisionSound() {
  // Initial impact
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

  // Secondary impacts and debris
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

  // Small debris particles
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

// Enhanced space alert warning sound
function createWarningSound() {
  // Primary alert tone with frequency modulation
  createSound(1100, 0.12, "sine", GAME_CONFIG.audio.volumes.warning, true, {
    modulate: true,
    modFreq: 8,
    modDepth: 30,
    spatial: true,
    pan: -0.3,
  });

  // Repeating alert pattern
  setTimeout(() => {
    createSound(1100, 0.12, "sine", GAME_CONFIG.audio.volumes.warning, true, {
      modulate: true,
      modFreq: 8,
      modDepth: 30,
      spatial: true,
      pan: 0.3,
    });
  }, 120);

  // Low-frequency undertone
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

// Enhanced reward sound for scoring points
function createScoreSound() {
  // Primary celestial tone
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

  // Rising secondary tone
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

  // Subtle crystalline harmonic
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

// Enhanced powerup acquisition sound with cosmic energy themes
function createPowerUpSound() {
  // Initial energy surge
  createSound(440, 0.25, "sine", GAME_CONFIG.audio.volumes.powerup, true, {
    attack: 0.02,
    decay: 0.1,
    sustain: true,
    sustainLevel: 0.7,
  });

  // Energy resonance harmonics
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

  // Power stabilization effect
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

  // Energy field establishment
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

// Enhanced black hole gravitational distortion sound
function createBlackHoleSound() {
  // Deep gravitational well
  createSound(100, 1.0, "sine", GAME_CONFIG.audio.volumes.blackhole, true, {
    attack: 0.1,
    decay: 0.3,
    sustain: true,
    sustainLevel: 0.8,
    modulate: true,
    modFreq: 0.5,
    modDepth: 10,
  });

  // Space-time distortion effects
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

  // Accretion disk harmonics
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

  // Event horizon stress tones
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

// Enhanced black hole growth with intensifying gravity
function createBlackHoleGrowthSound() {
  // Core mass increase
  createSound(
    90,
    0.7,
    "sine",
    GAME_CONFIG.audio.volumes.blackholeGrowth,
    true,
    {
      attack: 0.2,
      decay: 0.3,
      sustain: true,
      sustainLevel: 0.6,
      modulate: true,
      modFreq: 0.3,
      modDepth: 5,
    }
  );

  // Gravitational pull intensification
  setTimeout(() => {
    createSound(
      70,
      0.6,
      "triangle",
      GAME_CONFIG.audio.volumes.blackholeGrowth * 0.7,
      true,
      {
        attack: 0.1,
        spatial: true,
        pan: -0.2,
      }
    );
  }, 100);

  // Matter absorption effects
  setTimeout(() => {
    // Rapid frequency sweep to simulate matter falling in
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const freq = 300 - i * 40;
        createSound(
          freq,
          0.2,
          "sawtooth",
          GAME_CONFIG.audio.volumes.blackholeGrowth * (0.4 - i * 0.05),
          true,
          {
            attack: 0.01,
            spatial: true,
            pan: Math.random() * 1.6 - 0.8,
          }
        );
      }, i * 50);
    }
  }, 200);
}

// Enhanced black hole collapse and dissipation
function createBlackHoleDestroySound() {
  // Initial gravitational collapse
  createSound(
    120,
    0.9,
    "triangle",
    GAME_CONFIG.audio.volumes.blackholeDestroy,
    true,
    {
      attack: 0.05,
      decay: 0.2,
      sustain: true,
      sustainLevel: 0.7,
      modulate: true,
      modFreq: 2,
      modDepth: 20,
    }
  );

  // Energy release shockwave
  setTimeout(() => {
    createSound(
      60,
      0.6,
      "square",
      GAME_CONFIG.audio.volumes.blackholeDestroy * 0.8,
      true,
      {
        attack: 0.02,
        decay: 0.3,
        spatial: true,
        pan: -0.3,
      }
    );
  }, 100);

  // Space-time normalization wave
  setTimeout(() => {
    createSound(
      40,
      1.0,
      "sine",
      GAME_CONFIG.audio.volumes.blackholeDestroy * 0.6,
      true,
      {
        attack: 0.3,
        spatial: true,
        pan: 0.3,
      }
    );
  }, 250);

  // Final energy dispersion
  setTimeout(() => {
    // Dispersing energy particles
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const angle = (i / 8) * Math.PI * 2;
        const pan = Math.sin(angle);

        createSound(
          200 + i * 50,
          0.3,
          "triangle",
          GAME_CONFIG.audio.volumes.blackholeDestroy * 0.4,
          true,
          {
            attack: 0.01,
            decay: 0.1,
            spatial: true,
            pan: pan,
          }
        );
      }, i * 30);
    }
  }, 300);
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
  createSound(400, 0.4, "sine", GAME_CONFIG.audio.volumes.shield);
  createSound(600, 0.3, "triangle", GAME_CONFIG.audio.volumes.shield * 0.7);
}

function createFreezeSound() {
  // Initial crystallization tone
  createSound(250, 0.5, "sine", GAME_CONFIG.audio.volumes.freeze, false, {
    attack: 0.1,
    decay: 0.3,
    frequencySlide: -30,
    modulate: true,
    modFreq: 0.5,
    modDepth: 10,
  });

  // Ice crystallization shimmer effect across stereo field
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

  // Crystallization follow-up
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

// Create pulsating plasma storm sound
function createPlasmaStormSound() {
  // Base plasma hum
  createSound(
    120,
    2.0,
    "sawtooth",
    GAME_CONFIG.audio.volumes.explosion * 0.6,
    true,
    {
      attack: 0.2,
      decay: 1.8,
      sustain: true,
      sustainLevel: 0.6,
      modulate: true,
      modFreq: 0.8,
      modDepth: 30,
    }
  );

  // Plasma arcs across the field
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      createSound(
        800 + Math.random() * 400,
        0.2,
        "sawtooth",
        GAME_CONFIG.audio.volumes.explosion * 0.3,
        true,
        {
          attack: 0.01,
          decay: 0.2,
          frequencySlide: Math.random() < 0.5 ? 100 : -100,
          spatial: true,
          pan: Math.random() * 2 - 1,
        }
      );
    }, i * 150 + Math.random() * 100);
  }

  // Deep rumbling undercurrent
  setTimeout(() => {
    createSound(
      60,
      1.5,
      "sine",
      GAME_CONFIG.audio.volumes.explosion * 0.4,
      true,
      {
        attack: 0.3,
        decay: 1.2,
        modulate: true,
        modFreq: 0.2,
        modDepth: 10,
      }
    );
  }, 300);
}

// Create temporal rift sound
function createTemporalRiftSound() {
  // Time distortion wave
  createSound(
    300,
    1.5,
    "sine",
    GAME_CONFIG.audio.volumes.wormhole * 0.7,
    true,
    {
      attack: 0.3,
      decay: 1.2,
      frequencySlide: 150,
      modulate: true,
      modFreq: 0.5,
      modDepth: 50,
    }
  );

  // Time echoes
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createSound(
        500 - i * 70,
        0.3,
        "sine",
        GAME_CONFIG.audio.volumes.wormhole * (0.6 - i * 0.1),
        true,
        {
          attack: 0.05,
          decay: 0.25,
          spatial: true,
          pan: i % 2 === 0 ? -0.7 : 0.7,
        }
      );
    }, 200 + i * 200);
  }

  // Reality fracture
  setTimeout(() => {
    createSound(
      1200,
      0.5,
      "square",
      GAME_CONFIG.audio.volumes.wormhole * 0.4,
      true,
      {
        attack: 0.01,
        decay: 0.4,
        frequencySlide: -400,
      }
    );
  }, 500);
}

// Create quantum fluctuation sound
function createQuantumFluctuationSound() {
  // Quantum uncertainty waves
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      // Random frequency to represent quantum uncertainty
      const freq = 200 + Math.random() * 1000;
      createSound(
        freq,
        0.15,
        "sine",
        GAME_CONFIG.audio.volumes.blackhole * 0.5,
        true,
        {
          attack: 0.01,
          decay: 0.14,
          spatial: true,
          pan: Math.random() * 2 - 1,
        }
      );
    }, i * 80 + Math.random() * 50);
  }

  // Quantum wave collapse
  setTimeout(() => {
    createSound(
      350,
      0.6,
      "sawtooth",
      GAME_CONFIG.audio.volumes.blackhole * 0.6,
      true,
      {
        attack: 0.2,
        decay: 0.4,
        frequencySlide: -100,
      }
    );
  }, 400);
}

// Create cosmic radiation sound
function createCosmicRadiationSound() {
  // Background radiation hiss
  const noiseBuffer = audioContext.createBuffer(
    2, // stereo
    audioContext.sampleRate * 1.5, // 1.5 seconds
    audioContext.sampleRate
  );

  // Fill buffer with filtered noise
  for (let channel = 0; channel < noiseBuffer.numberOfChannels; channel++) {
    const data = noiseBuffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      // Create filtered cosmic radiation pattern
      data[i] =
        (Math.random() * 2 - 1) *
        Math.exp(-i / (audioContext.sampleRate * 0.5)) *
        0.5;

      // Add occasional radiation spikes
      if (Math.random() < 0.001) {
        data[i] = (Math.random() * 2 - 1) * 0.7;
      }
    }
  }

  // Play the buffer
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.value = GAME_CONFIG.audio.volumes.blackhole * 0.4;

  noiseSource.connect(noiseGain);
  noiseGain.connect(analyserNode);

  noiseSource.start();

  // Radiation pulses
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      createSound(
        2000 + Math.random() * 1000,
        0.2,
        "square",
        GAME_CONFIG.audio.volumes.blackhole * 0.2,
        false,
        {
          attack: 0.01,
          decay: 0.19,
          spatial: true,
          pan: Math.random() * 2 - 1,
        }
      );
    }, i * 200 + Math.random() * 100);
  }
}

// Create pulsar burst sound
function createPulsarBurstSound() {
  // Pulsar base rotation sound
  createSound(
    80,
    1.5,
    "sine",
    GAME_CONFIG.audio.volumes.blackhole * 0.6,
    true,
    {
      attack: 0.3,
      decay: 1.2,
      modulate: true,
      modFreq: 4, // Rapid pulsar rotation
      modDepth: 10,
    }
  );

  // Emission bursts
  const burstCount = 6;
  const burstInterval = 180; // milliseconds

  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => {
      createSound(
        600,
        0.15,
        "sawtooth",
        GAME_CONFIG.audio.volumes.blackhole * 0.5,
        true,
        {
          attack: 0.01,
          decay: 0.14,
          frequencySlide: 100,
          spatial: true,
          pan: i % 2 === 0 ? -0.6 : 0.6,
        }
      );
    }, i * burstInterval);
  }

  // Electromagnetic wave
  setTimeout(() => {
    createSound(
      300,
      0.8,
      "triangle",
      GAME_CONFIG.audio.volumes.blackhole * 0.4,
      true,
      {
        attack: 0.1,
        decay: 0.7,
        modulate: true,
        modFreq: 2,
        modDepth: 30,
      }
    );
  }, 400);
}

// Create supernova sound
function createSuperNovaSound() {
  // Massive energy buildup
  createSound(
    150,
    1.5,
    "sawtooth",
    GAME_CONFIG.audio.volumes.explosion * 0.8,
    true,
    {
      attack: 0.5,
      decay: 1.0,
      sustain: true,
      sustainLevel: 0.8,
      frequencySlide: 100,
      modulate: true,
      modFreq: 0.2,
      modDepth: 40,
    }
  );

  // Delayed explosion wave
  setTimeout(() => {
    createSound(
      100,
      0.8,
      "sawtooth",
      GAME_CONFIG.audio.volumes.explosion * 0.9,
      true,
      {
        attack: 0.01,
        decay: 0.8,
        frequencySlide: -50,
      }
    );

    // Multiple shockwave harmonics across stereo field
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createSound(
          300 + i * 100,
          0.4,
          "sine",
          GAME_CONFIG.audio.volumes.explosion * 0.6,
          true,
          {
            attack: 0.01,
            decay: 0.3,
            frequencySlide: -80,
            spatial: true,
            pan: [-0.8, -0.4, 0, 0.4, 0.8][i],
          }
        );
      }, i * 80);
    }
  }, 800);

  // Stellar remnant radiation (white noise component)
  setTimeout(() => {
    const noiseBuffer = audioContext.createBuffer(
      2, // stereo
      audioContext.sampleRate * 0.6, // 0.6 seconds
      audioContext.sampleRate
    );

    // Fill buffer with filtered noise
    for (let channel = 0; channel < noiseBuffer.numberOfChannels; channel++) {
      const data = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        data[i] =
          (Math.random() * 2 - 1) *
          Math.exp(-i / (audioContext.sampleRate * 0.2)) *
          0.6;
      }
    }

    // Play the buffer
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = GAME_CONFIG.audio.volumes.explosion * 0.5;

    noiseSource.connect(noiseGain);
    noiseGain.connect(analyserNode);

    noiseSource.start();
  }, 1000);
}

// Subtle cosmic background ambience
function startSpaceAmbience() {
  if (spaceAmbientInterval) clearInterval(spaceAmbientInterval);

  // Create distant cosmic background
  spaceAmbientInterval = setInterval(() => {
    if (audioContext && audioContext.state === "running") {
      // Deep space drone
      const baseFreq = 40 + Math.random() * 30;
      createSound(baseFreq, 8, "sine", 0.01, true, {
        attack: 2,
        decay: 1,
        sustain: true,
        sustainLevel: 0.7,
        modulate: true,
        modFreq: 0.2,
        modDepth: 2,
        spatial: true,
        pan: Math.random() * 2 - 1,
      });

      // Occasional distant signals
      if (Math.random() < 0.2) {
        setTimeout(() => {
          const signalFreq = 800 + Math.random() * 1200;
          createSound(signalFreq, 2, "sine", 0.006, true, {
            attack: 0.3,
            spatial: true,
            pan: Math.random() * 1.6 - 0.8,
          });
        }, Math.random() * 1000);
      }
    }
  }, 5000);
}

function stopSpaceAmbience() {
  if (spaceAmbientInterval) {
    clearInterval(spaceAmbientInterval);
    spaceAmbientInterval = null;
  }
}

// Enhanced musical background for cosmic atmosphere
function startBackgroundMusic(isGameRunning) {
  if (backgroundMusicInterval) clearInterval(backgroundMusicInterval);

  // Enhanced cosmic background music system
  const config = GAME_CONFIG.audio.backgroundMusic;
  const baseFrequencies = config.frequencies;
  const patterns = config.patterns || [
    [0, 2, 4, 6],
    [1, 3, 5, 3],
    [6, 4, 2, 0],
    [2, 0, 3, 5],
  ];

  // Wave types for different layers
  const waveTypes = config.waveTypes || [
    "sine",
    "triangle",
    "sine",
    "triangle",
  ];

  let currentPattern = 0;
  let patternStep = 0;
  let intensityLevel = isGameRunning ? 1.0 : 0.7; // Dynamic intensity based on game state

  backgroundMusicInterval = setInterval(() => {
    if (audioContext && audioContext.state === "running") {
      // Get current note from pattern
      const noteIndex = patterns[currentPattern][patternStep];
      const frequency = baseFrequencies[noteIndex % baseFrequencies.length];

      // Primary cosmic tone
      createSound(
        frequency,
        config.duration,
        waveTypes[0],
        GAME_CONFIG.audio.volumes.backgroundMusic * intensityLevel,
        true,
        {
          attack: 0.8,
          decay: 0.5,
          sustain: true,
          sustainLevel: 0.7,
          spatial: true,
          pan: Math.random() * 0.4 - 0.2, // Subtle stereo movement
          modulate: config.spaceModulation?.enable,
          modFreq: config.spaceModulation?.speed || 0.1,
          modDepth: config.spaceModulation?.depth || 3,
        }
      );

      // Harmonic layer (perfect fifth)
      createSound(
        frequency * 1.5,
        config.duration * 0.8,
        waveTypes[1],
        GAME_CONFIG.audio.volumes.backgroundMusic * 0.5 * intensityLevel,
        true,
        {
          attack: 1.0,
          decay: 0.7,
          sustain: true,
          sustainLevel: 0.5,
          spatial: true,
          pan: -0.4,
        }
      );

      // Occasional deep space drone
      if (Math.random() < 0.3) {
        createSound(
          frequency / 2,
          config.duration * 1.5,
          waveTypes[2],
          GAME_CONFIG.audio.volumes.backgroundMusic * 0.6 * intensityLevel,
          true,
          {
            attack: 1.5,
            decay: 1.0,
            sustain: true,
            sustainLevel: 0.4,
            spatial: true,
            pan: 0.4,
            modulate: true,
            modFreq: 0.05,
            modDepth: 2,
          }
        );
      }

      // Occasional high harmonic for cosmic sparkle
      if (Math.random() < 0.2) {
        setTimeout(() => {
          createSound(
            frequency * 2,
            config.duration * 0.6,
            waveTypes[3],
            GAME_CONFIG.audio.volumes.backgroundMusic * 0.3 * intensityLevel,
            true,
            {
              attack: 0.5,
              decay: 0.8,
              spatial: true,
              pan: Math.random() * 1.6 - 0.8, // Wide stereo placement
            }
          );
        }, config.interval / 3); // Offset timing
      }

      // Progress through pattern
      patternStep = (patternStep + 1) % patterns[currentPattern].length;

      // Occasionally change patterns for more variety
      if (patternStep === 0 && Math.random() < 0.3) {
        currentPattern = (currentPattern + 1) % patterns.length;

        // Dynamic intensity adjustment based on pattern
        intensityLevel = isGameRunning
          ? 0.8 + Math.random() * 0.4 // Game running: 0.8-1.2
          : 0.5 + Math.random() * 0.3; // Game idle: 0.5-0.8
      }
    }
  }, config.interval);
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
    case "supernova":
      createSuperNovaSound();
      break;
    case "plasmaStorm":
      createPlasmaStormSound();
      break;
    case "temporalRift":
      createTemporalRiftSound();
      break;
    case "quantumFluctuation":
      createQuantumFluctuationSound();
      break;
    case "cosmicRadiation":
      createCosmicRadiationSound();
      break;
    case "pulsarBurst":
      createPulsarBurstSound();
      break;
  }
}
