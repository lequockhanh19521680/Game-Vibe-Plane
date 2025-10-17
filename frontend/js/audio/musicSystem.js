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
    if (audioContext && audioContext.state === "running" && !musicPaused) {
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

// Add pause/resume functionality
let musicPaused = false;

function pauseBackgroundMusic() {
  musicPaused = true;
}

function resumeBackgroundMusic() {
  musicPaused = false;
}

function stopBackgroundMusic() {
  if (backgroundMusicInterval) {
    clearInterval(backgroundMusicInterval);
    backgroundMusicInterval = null;
  }
  musicPaused = false;
}
