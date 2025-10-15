// =============================================================================
// STELLAR DRIFT: SINGULARITY - AUDIO SYSTEM
// =============================================================================

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.backgroundMusicInterval = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  createSound(frequency, duration, type = "sine", volume = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume * GAME_CONFIG.audio.masterVolume,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);

    return oscillator;
  }

  // Sound effect methods
  createExplosionSound() {
    const duration = 0.4;
    const frequencies = [80, 120, 200, 350];

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createSound(
          freq,
          duration - index * 0.1,
          "square",
          GAME_CONFIG.audio.volumes.explosion * (1 - index * 0.2)
        );
      }, index * 20);
    });
  }

  createLaserSound() {
    this.createSound(800, 0.1, "square", GAME_CONFIG.audio.volumes.laser);
    setTimeout(() => {
      this.createSound(
        1200,
        0.08,
        "sine",
        GAME_CONFIG.audio.volumes.laser * 0.7
      );
    }, 100);
  }

  createMissileSound() {
    this.createSound(200, 0.3, "sawtooth", GAME_CONFIG.audio.volumes.missile);
  }

  createButtonHoverSound() {
    this.createSound(600, 0.1, "sine", GAME_CONFIG.audio.volumes.buttonHover);
  }

  createCollisionSound() {
    this.createSound(250, 0.15, "square", GAME_CONFIG.audio.volumes.collision);
    setTimeout(() => {
      this.createSound(
        150,
        0.1,
        "triangle",
        GAME_CONFIG.audio.volumes.collision * 0.8
      );
    }, 50);
  }

  createWarningSound() {
    this.createSound(1100, 0.08, "sine", GAME_CONFIG.audio.volumes.warning);
    setTimeout(() => {
      this.createSound(1100, 0.08, "sine", GAME_CONFIG.audio.volumes.warning);
    }, 120);
  }

  createScoreSound() {
    this.createSound(500, 0.1, "sine", GAME_CONFIG.audio.volumes.score);
    setTimeout(() => {
      this.createSound(
        700,
        0.1,
        "sine",
        GAME_CONFIG.audio.volumes.score * 0.75
      );
    }, 100);
  }

  createPowerUpSound() {
    this.createSound(440, 0.2, "sine", GAME_CONFIG.audio.volumes.powerup);
    setTimeout(() => {
      this.createSound(
        554,
        0.2,
        "sine",
        GAME_CONFIG.audio.volumes.powerup * 0.8
      );
    }, 100);
    setTimeout(() => {
      this.createSound(
        659,
        0.2,
        "sine",
        GAME_CONFIG.audio.volumes.powerup * 0.6
      );
    }, 200);
  }

  createBlackHoleSound() {
    this.createSound(100, 0.8, "sine", GAME_CONFIG.audio.volumes.blackhole);
    setTimeout(() => {
      this.createSound(
        80,
        0.6,
        "triangle",
        GAME_CONFIG.audio.volumes.blackhole * 0.67
      );
    }, 200);
  }

  createBlackHoleGrowthSound() {
    this.createSound(
      90,
      0.5,
      "sine",
      GAME_CONFIG.audio.volumes.blackholeGrowth
    );
  }

  createBlackHoleDestroySound() {
    this.createSound(
      120,
      0.7,
      "triangle",
      GAME_CONFIG.audio.volumes.blackholeDestroy
    );
    setTimeout(() => {
      this.createSound(
        60,
        0.4,
        "square",
        GAME_CONFIG.audio.volumes.blackholeDestroy * 0.8
      );
    }, 100);
  }

  createFragmentHitSound() {
    this.createSound(
      800,
      0.15,
      "square",
      GAME_CONFIG.audio.volumes.fragmentHit
    );
    this.createSound(
      1200,
      0.1,
      "triangle",
      GAME_CONFIG.audio.volumes.fragmentHit * 0.6
    );
  }

  createLaserMineSound() {
    this.createSound(600, 0.3, "sawtooth", GAME_CONFIG.audio.volumes.laserMine);
    setTimeout(() => {
      this.createSound(
        900,
        0.2,
        "sine",
        GAME_CONFIG.audio.volumes.laserMine * 0.7
      );
    }, 50);
  }

  createWormholeSound() {
    this.createSound(150, 0.6, "sine", GAME_CONFIG.audio.volumes.wormhole);
    this.createSound(
      300,
      0.4,
      "triangle",
      GAME_CONFIG.audio.volumes.wormhole * 0.5
    );
  }

  createShieldSound() {
    this.createSound(400, 0.4, "sine", GAME_CONFIG.audio.volumes.shield);
    this.createSound(
      600,
      0.3,
      "triangle",
      GAME_CONFIG.audio.volumes.shield * 0.7
    );
  }

  createFreezeSound() {
    this.createSound(250, 0.5, "sine", GAME_CONFIG.audio.volumes.freeze);
    setTimeout(() => {
      this.createSound(
        180,
        0.3,
        "triangle",
        GAME_CONFIG.audio.volumes.freeze * 0.6
      );
    }, 100);
  }

  startBackgroundMusic() {
    if (this.backgroundMusicInterval)
      clearInterval(this.backgroundMusicInterval);
    const frequencies = GAME_CONFIG.audio.backgroundMusic.frequencies;
    let currentIndex = 0;

    this.backgroundMusicInterval = setInterval(() => {
      if (window.isGameRunning && this.audioContext) {
        this.createSound(
          frequencies[currentIndex],
          GAME_CONFIG.audio.backgroundMusic.duration,
          "sine",
          GAME_CONFIG.audio.volumes.backgroundMusic
        );
        currentIndex = (currentIndex + 1) % frequencies.length;
      }
    }, GAME_CONFIG.audio.backgroundMusic.interval);
  }

  stopBackgroundMusic() {
    if (this.backgroundMusicInterval) {
      clearInterval(this.backgroundMusicInterval);
      this.backgroundMusicInterval = null;
    }
  }

  playSound(soundType) {
    this.init();

    const soundMethods = {
      explosion: () => this.createExplosionSound(),
      laser: () => this.createLaserSound(),
      missile: () => this.createMissileSound(),
      buttonHover: () => this.createButtonHoverSound(),
      collision: () => this.createCollisionSound(),
      warning: () => this.createWarningSound(),
      backgroundMusic: () => this.startBackgroundMusic(),
      score: () => this.createScoreSound(),
      powerup: () => this.createPowerUpSound(),
      blackhole: () => this.createBlackHoleSound(),
      blackholeGrowth: () => this.createBlackHoleGrowthSound(),
      blackholeDestroy: () => this.createBlackHoleDestroySound(),
      fragmentHit: () => this.createFragmentHitSound(),
      laserMine: () => this.createLaserMineSound(),
      wormhole: () => this.createWormholeSound(),
      shield: () => this.createShieldSound(),
      freeze: () => this.createFreezeSound(),
      laserCharge: () => this.createLaserChargeSound(),
      blackHoleSpawn: () => this.createBlackHoleSpawnSound(),
      missileAlert: () => this.createMissileAlertSound(),
      mineArmed: () => this.createMineArmedSound(),
      crystalForm: () => this.createCrystalFormSound(),
      eventTrigger: () => this.createEventTriggerSound(),
      blackhole: () => this.createBlackHoleSound(),
      blackholeGrowth: () => this.createBlackHoleGrowthSound(),
      blackholeDestroy: () => this.createBlackHoleDestroySound(),
      fragmentHit: () => this.createFragmentHitSound(),
      laserMine: () => this.createLaserMineSound(),
      wormhole: () => this.createWormholeSound(),
      shield: () => this.createShieldSound(),
      freeze: () => this.createFreezeSound(),
    };

    const method = soundMethods[soundType];
    if (method) {
      method();
    }
  }

  // Missing sound methods
  createLaserChargeSound() {
    this.createSound(400, 0.8, "sine", GAME_CONFIG.audio.volumes.laser * 0.5);
    setTimeout(() => {
      this.createSound(
        600,
        0.5,
        "triangle",
        GAME_CONFIG.audio.volumes.laser * 0.3
      );
    }, 200);
  }

  createBlackHoleSpawnSound() {
    this.createSound(100, 1.0, "sine", GAME_CONFIG.audio.volumes.blackhole);
    setTimeout(() => {
      this.createSound(
        80,
        0.8,
        "triangle",
        GAME_CONFIG.audio.volumes.blackhole * 0.7
      );
    }, 300);
  }

  createMissileAlertSound() {
    this.createSound(1000, 0.1, "square", GAME_CONFIG.audio.volumes.warning);
    setTimeout(() => {
      this.createSound(800, 0.1, "square", GAME_CONFIG.audio.volumes.warning);
    }, 150);
  }

  createMineArmedSound() {
    this.createSound(
      600,
      0.2,
      "sawtooth",
      GAME_CONFIG.audio.volumes.laserMine * 0.8
    );
  }

  createCrystalFormSound() {
    this.createSound(800, 0.4, "sine", GAME_CONFIG.audio.volumes.powerup);
    setTimeout(() => {
      this.createSound(
        1200,
        0.3,
        "triangle",
        GAME_CONFIG.audio.volumes.powerup * 0.6
      );
    }, 100);
  }

  createEventTriggerSound() {
    this.createSound(500, 0.3, "square", GAME_CONFIG.audio.volumes.warning);
    setTimeout(() => {
      this.createSound(
        700,
        0.2,
        "sine",
        GAME_CONFIG.audio.volumes.warning * 0.8
      );
    }, 150);
  }
}

// Export for use in main game
window.AudioSystem = AudioSystem;
