// --- Enhanced Space Audio System ---
let audioContext;
let backgroundMusicInterval;
let spaceAmbientInterval;
let reverbNode = null;
let analyserNode = null;

// Enhanced audio initialization with space ambience
function initAudioSystem() {
  // Only create AudioContext when needed (after user interaction)
  if (!audioContext) {
    try {
      // Create AudioContext with options to allow autoplay
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext({
        latencyHint: "interactive",
        sampleRate: 44100,
      });

      // Create audio processing nodes for cosmic effects
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.connect(audioContext.destination);

      // Create reverb node for spacious sound
      createSpaceReverb();

      console.log("Audio system initialized successfully");
    } catch (e) {
      console.warn("Audio system initialization failed:", e);
    }
  }

  // Resume audio context on user interaction
  if (audioContext && audioContext.state === "suspended") {
    try {
      // Use a user gesture to resume audio context
      audioContext
        .resume()
        .then(() => {
          console.log("AudioContext resumed successfully");
        })
        .catch((err) => {
          console.warn("Could not resume AudioContext:", err);
        });
    } catch (e) {
      console.error("Error resuming AudioContext:", e);
    }
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

// Sound effects and music system loaded from separate files

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
    case "shield-hit":
      createShieldHitSound();
      break;
    case "freeze":
      createFreezeSound();
      break;
    case "thunder":
      createThunderSound();
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
