// --- Enhanced Space Audio System ---
let audioContext;
let hasInteracted = false;

// Enhanced audio initialization
function initAudioSystem() {
  if (audioContext) {
    if (audioContext.state === "suspended" && hasInteracted) {
      audioContext
        .resume()
        .catch((e) => console.error("Error resuming AudioContext:", e));
    }
    return; // Already initialized or waiting for interaction
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

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
  }
}

// Play a specific sound type
function playSound(soundType, volume) {
  initAudioSystem();

  if (!audioContext || audioContext.state !== "running") {
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
    laserMine: createLaserMineSound,
    wormhole: createWormholeSound,
    shield: createShieldSound,
    freeze: createFreezeSound,
    trap: createTrapSound,
    crystalDischarge: createCrystalDischargeSound,
  };

  const createSoundFunction = soundCreators[soundType];

  if (createSoundFunction) {
    createSoundFunction(volume);
  }
}
