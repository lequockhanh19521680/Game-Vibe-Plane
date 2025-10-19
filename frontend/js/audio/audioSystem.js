// --- Enhanced Space Audio System ---
let audioContext;
let backgroundMusicInterval;
let spaceAmbientInterval;
let reverbNode = null;
let analyserNode = null;
let hasInteracted = false;

// Enhanced audio initialization with space ambience
function initAudioSystem() {
  if (audioContext) {
    if (audioContext.state === "suspended" && hasInteracted) {
      audioContext
        .resume()
        .catch((e) => console.error("Error resuming AudioContext:", e));
    }
    return; // Already initialized or waiting for interaction
  }

  // First time initialization
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create audio processing nodes for cosmic effects
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.connect(audioContext.destination);

    // Create reverb node for spacious sound
    createSpaceReverb();

    // Add a one-time listener for the first user gesture to resume the context
    const resumeAudio = () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext
          .resume()
          .then(() => {
            console.log("AudioContext resumed successfully by user gesture.");
            hasInteracted = true;
            // Remove the listeners after the first successful resume
            document.body.removeEventListener("click", resumeAudio);
            document.body.removeEventListener("touchstart", resumeAudio);
            document.body.removeEventListener("keydown", resumeAudio);
          })
          .catch((e) =>
            console.error("Error resuming AudioContext on gesture:", e)
          );
      }
    };

    document.body.addEventListener("click", resumeAudio, { once: true });
    document.body.addEventListener("touchstart", resumeAudio, { once: true });
    document.body.addEventListener("keydown", resumeAudio, { once: true });
  } catch (e) {
    console.error("Web Audio API is not supported in this browser");
    // Disable audio features if not supported
    window.playSound = () => {};
    window.startBackgroundMusic = () => {};
    window.stopBackgroundMusic = () => {};
  }
}

// Create space reverb effect
function createSpaceReverb() {
  if (!audioContext) return;
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

// Play a specific sound type
function playSound(soundType, volume) {
  // Always try to initialize/resume audio context when a sound is requested
  initAudioSystem();

  if (!audioContext || audioContext.state !== "running") {
    // If context is not running even after init (e.g., no user gesture yet), don't play sound.
    return;
  }

  const soundCreators = {
    explosion: createExplosionSound,
    laser: createLaserSound,
    missile: createMissileSound,
    buttonHover: createButtonHoverSound,
    collision: createCollisionSound,
    warning: createWarningSound,
    score: createScoreSound,
    powerup: createPowerUpSound,
    blackhole: createBlackHoleSound,
    blackholeGrowth: createBlackHoleGrowthSound,
    blackholeDestroy: createBlackHoleDestroySound,
    fragmentHit: createFragmentHitSound,
    laserMine: createLaserMineSound,
    wormhole: createWormholeSound,
    shield: createShieldSound,
    freeze: createFreezeSound,
    plasmaStorm: createPlasmaStormSound,
    temporalRift: createTemporalRiftSound,
    quantumFluctuation: createQuantumFluctuationSound,
    cosmicRadiation: createCosmicRadiationSound,
    pulsarBurst: createPulsarBurstSound,
  };

  const createSoundFunction = soundCreators[soundType];

  if (createSoundFunction) {
    createSoundFunction(volume);
  }
}
