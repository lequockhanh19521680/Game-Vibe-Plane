// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION (REFACTORED)
// =============================================================================
// Unused properties have been removed for a cleaner, more maintainable config.
// Some values that were hardcoded in the logic have been moved here.
// =============================================================================

const GAME_CONFIG = {
  // =============================================================================
  // CORE GAME SETTINGS
  // =============================================================================
  core: {
    maxParticles: 300,
    maxFragments: 150,
    collisionPrecision: 1,
    localStorageKey: "stellarDriftHighScore",
  },

  // =============================================================================
  // CANVAS AND RENDERING
  // =============================================================================
  canvas: {
    backgroundColor: "#050510",
  },

  // =============================================================================
  // PLAYER SETTINGS
  // =============================================================================
  player: {
    radius: 15,
    responsiveness: 0.15,
    friction: 0.95,
    trailLength: 20,
    trailFadeSpeed: 0.05,
    shieldDuration: 600, // 10 seconds at 60fps
    thunderShieldDuration: 600,
    thunderShieldRadiusMultiplier: 3.5,
  },

  // =============================================================================
  // DIFFICULTY PROGRESSION
  // =============================================================================
  difficulty: {
    baseSpawnInterval: 80,
    minSpawnInterval: 20,
    spawnDecreaseStep: 1.0,
    baseSpeed: 0.5,
    speedIncreaseStep: 0.05,
    microSpeedIncrease: 0.01,
    microProgressInterval: 900,
    // NEW: Non-linear level progression. Score needed to reach level X.
    levelUpScores: [
      500, 1500, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 40000,
    ],
    // Score needed for each level after the ones defined above.
    scorePerLevelAfterMax: 10000,
  },

  // =============================================================================
  // ENTITY CONFIGURATIONS
  // =============================================================================
  entities: {
    asteroids: {
      minRadius: 12,
      maxRadius: 40,
      baseSpeed: 1.0,
      speedVariation: 1.0,
      speedIncreasePerLevel: 0.4,
      colors: ["#ff4444", "#ffbb33", "#99cc00"],
      wobbleAmount: 0.5,
      wobbleSpeed: 0.1,
      spawnPatterns: {
        topDown: 0.7,
        slightAngle: 0.2,
        diagonal: 0.1,
      },
    },
    blackHoles: {
      spawnScore: 3000,
      spawnInterval: 1000,
      warningDuration: 120, // 2 seconds at 60fps
      baseRadius: 8,
      baseMaxRadius: 40,
      radiusIncreasePerLevel: 15,
      baseGravityRadius: 120,
      gravityRadiusIncreasePerLevel: 30,
      baseStrength: 0.015,
      strengthIncreasePerLevel: 0.018,
      baseGrowthRate: 0.018,
      growthRateIncreasePerLevel: 0.03,
      playerForceMultiplier: 1.8,
      shakeThreshold: 0.7,
      shakeIntensity: 0.05,
      temporaryLifetime: 200,
    },
    missiles: {
      spawnScore: 1500,
      spawnInterval: 700,
      warningDuration: 120, // 2 seconds at 60fps
      radius: 5,
      baseSpeed: 0.15,
      speedIncreasePerLevel: 0.025,
      baseTurnSpeed: 0.015,
      turnSpeedIncreasePerLevel: 0.02,
      speedUpTime: 350,
      speedUpMultiplier: 1.9,
      turnSpeedUpMultiplier: 1.6,
      lifetime: 450,
      fragmentCount: 8,
      fragmentCountOnImpact: 5,
      velocity: {
        friction: 0.92,
      },
    },
    lasers: {
      spawnScore: 4500,
      baseInterval: 450,
      intervalDecreasePerLevel: 25,
      minInterval: 60,
      maxConcurrent: 1,
      lasersPerLevel: 3,
      baseTargetChance: 0.1,
      targetChanceIncreasePerLevel: 0.08,
      maxTargetChance: 0.85,
      warningTime: 120, // 2 seconds at 60fps
      beamDuration: 10,
      staggerDelay: 150,
      playerHitRadius: 7.5,
    },
    laserMines: {
      spawnScore: 8000,
      spawnInterval: 500,
      radius: 10,
      chargeTime: 180,
      fireDuration: 15,
      patterns: ["cross", "diagonal", "star"],
      beamWidth: 10,
    },
    crystalClusters: {
      spawnScore: 2000,
      spawnInterval: 800,
      radius: 10,
      lifetime: 300,
      crystalCount: 6,
      colors: ["#40c4ff", "#81d4fa"],
      rotationSpeed: 0.02,
      warningDuration: 120,
    },
  },

  // =============================================================================
  // FRAGMENT SYSTEM
  // =============================================================================
  fragments: {
    minRadius: 2,
    maxRadius: 5,
    minLife: 100,
    maxLife: 150,
    color: "#ffbb33",
    explosionParticles: 6,
    scoreBonus: 5, // Reduced score bonus
    missileFragments: {
      minRadius: 3,
      maxRadius: 6,
      minLife: 80,
      maxLife: 120,
      color: "#f48fb1",
      lethal: true,
    },
  },

  // =============================================================================
  // EVENT SYSTEM
  // =============================================================================
  events: {
    interval: 3000, // Events are more frequent
    duration: 5000,
    unlockThresholds: {
      crystalRain: 500,
      shieldGenerator: 1000,
      asteroidShower: 2000,
      asteroidCircle: 3000,
      meteorBombardment: 4000,
      magneticStorm: 4500,
      freezeZone: 5000,
      missileBarrage: 6500,
      laserGrid: 7000,
      blackHoleChain: 10000,
      plasmaStorm: 11000,
      voidRifts: 15000,
      instantMissiles: 1500,
      gravitationalAnomaly: 12000,
      asteroidRain: 2500,
      lightningStorm: 8000,
      temporalChaos: 18000,
      lightningNetwork: 19000,
      voidStorm: 20000,
      mineFieldDetonation: 21000,
      speedZone: 1000,
      gravityWells: 16000,
      wormholePortal: 9000,
      decoyPowerUp: 4000, // New event
      chaosMode: 12000, // New event
    },
    speedZone: { speedMultiplier: 1.4 },
    laserGrid: { gridSize: 3, delay: 350 },
    asteroidRain: {
      count: 18,
      delay: 180,
      minRadius: 6,
      maxRadius: 30,
      speedMultiplier: 2.2,
      speedVariation: 3.5,
    },
    asteroidCircle: {
      count: 12,
      radius: 180,
      warningTime: 120, // 2 seconds at 60fps
      asteroidRadius: 15,
      speed: 1.5,
      centerVariation: 50,
    },
    missileBarrage: { count: 5, delay: 500 },
    blackHoleChain: { count: 3, delay: 1000 },
    crystalRain: { count: 5, delay: 80 },
    gravityWells: { count: 5, radius: 100 },
    meteorBombardment: { count: 25, delay: 60, speed: 5 },
    voidRifts: { count: 4 },
    wormholePortal: { count: 1 },
    shieldGenerator: { count: 1 },
    mineFieldDetonation: {
      count: 8,
      delay: 200,
      chargeTime: 60,
      warningTime: 90,
    },
  },

  // =============================================================================
  // NEW OBJECTS (formerly specialObjects)
  // =============================================================================
  newObjects: {
    energyOrb: {
      baseRadius: 2.5,
      baseVelocity: 1.0,
      minLifetime: 500,
      maxLifetime: 800,
      rotationSpeed: 0.01,
      fragmentAttractRadiusFactor: 3,
      fragmentAttractForce: 0.1,
      spawnInterval: 1500,
      spawnThreshold: 1000,
    },
    shieldGenerator: {
      radius: 15,
      shieldRadius: 80,
      chargeTime: 60,
      activeTime: 180,
    },
    freezeZone: {
      radius: 100,
      effectStrength: 0.3,
      particleCount: 20,
      color: "#81d4fa",
      pulseSpeed: 0.05,
      duration: 300,
      freezeChance: 0.005,
      missileFreezeChance: 0.01,
      fullFreezeFactor: 0.1,
    },
    magneticStorm: {
      lifetime: 480,
      maxIntensity: 1.2,
      fieldCount: 4,
      baseStrength: 0.5,
      strengthVariation: 0.8,
      fieldRadius: 100,
      radiusVariation: 80,
      lightningInterval: 30,
      rampDuration: 60,
      playerAffectMultiplier: 0.3,
      objectAffectMultiplier: 0.5,
      chargeColor: "#88ddff",
      attractColor: "#00ff88",
      repelColor: "#ff4444",
      arcColor: "#88ddff",
      lethalBoltColor: "#ffff00",
      lethalTargetRange: 300,
      lethalHitTolerance: 10,
      segmentCount: 8,
      arcFadeSpeed: 0.1,
      arcSpawnChance: 0.1,
      fieldRotationSpeed: 0.02,
      lethalJitter: 40,
      arcJitter: 40,
      pulseMinFactor: 0.8,
      pulseMaxFactor: 0.2,
    },
    lightningStorm: {
      lifetime: 600,
      lightningInterval: 120,
      lightningJitter: 60,
      boostDuration: 600,
      speedBoostMultiplier: 0.8,
      gateCount: 2,
      gatePlacementRange: 200,
      gateRadius: 40,
      gateChargeTime: 120,
      chargeColor: "#88ddff",
      boltColor: "#88ddff",
      particleSpawnChance: 0.3,
      segmentCount: 12,
      boltFadeSpeed: 0.1,
      hitRadius: 25,
    },
    plasmaField: {
      radius: 80,
      lifetime: 400,
      damageRate: 0.02,
      color: "#ff6b35",
      particleCount: 15,
      pushForce: 0.05,
      rotationSpeed: 0.02,
      particleMinDist: 20,
      particleMaxDist: 40,
      particleMinSpeed: 0.02,
      particleMaxSpeed: 0.03,
      particleMinSize: 2,
      particleMaxSize: 3,
      distancePulseSpeed: 0.05,
      distancePulseAmount: 0.5,
      pushRadiusMultiplier: 1.5,
      fragmentPushMultiplier: 1.6,
    },
    decoyPowerUp: {
      size: 10,
      lifetime: 500,
      triggerRadius: 45,
      explosionParticles: 20,
      asteroidCount: 4,
      asteroidSpeed: 3,
    },
  },

  // =============================================================================
  // AUDIO SETTINGS
  // =============================================================================
  audio: {
    volumes: {
      backgroundMusic: 0.5,
      explosion: 0.2,
      laser: 0.15,
      missile: 0.1,
      collision: 0.15,
      buttonHover: 0.1,
      warning: 0.12,
      score: 0.08,
      powerup: 0.15,
      blackhole: 0.2,
      laserMine: 0.12,
      wormhole: 0.15,
      shield: 0.15,
      freeze: 0.15,
      trap: 0.3,
    },
  },

  // =============================================================================
  // VISUAL SETTINGS
  // =============================================================================
  visual: {
    colors: {
      danger: "#ff4444", // Only color used directly from config
    },
    screenShake: {
      duration: 0.3,
      laserIntensity: 0.1,
      explosionIntensity: 0.5,
      mineIntensity: 0.2,
    },
    particles: {
      explosionCount: 6,
      explosionSpeed: 6,
      fadeSpeed: 0.02,
      deathMultiplier: 8,
      maxSize: 3,
      deathSpeedMultiplier: 1.7,
    },
    nebula: { count: 5, minRadius: 100, maxRadius: 300, opacity: 0.05 },
    stars: { layers: 3, starsPerLayer: 80, maxRadius: 1.5 },
  },

  // =============================================================================
  // UI SETTINGS
  // =============================================================================
  ui: {
    eventText: { duration: 3000, fontSize: "2.5rem" },
    warning: {
      radius: 30,
      pulseIntensity: 15,
      pulseSpeed: 0.3,
      fadeInTime: 20,
      fadeOutTime: 20,
    },
    gameOverDelay: 1000,
    topBarOpacity: "1",
    topBarHiddenOpacity: "0",
  },

  // =============================================================================
  // SCORING SYSTEM
  // =============================================================================
  scoring: {
    movementMultiplier: 0.08, // Significantly harder to earn points
    baseMovementThreshold: 0.5,
    minMovementThreshold: 10,
    thresholdDecreaseRate: 0.95,
  },
};

// Make config globally available
window.GAME_CONFIG = GAME_CONFIG;
