// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION (REFACTORED)
// =============================================================================
// Unused properties have been removed for a cleaner and more maintainable config.
// =============================================================================

const GAME_CONFIG = {
  // =============================================================================
  // CORE GAME SETTINGS
  // =============================================================================
  core: {
    targetFPS: 60,
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
    levelUpInterval: 30, // Not directly used, but influences logic
    microProgressInterval: 900,
    scorePerLevel: 3000,
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
      fragmentSpeed: 0.99,
      colors: ["#ff4444", "#ffbb33", "#99cc00"],
      shapeComplexity: { min: 7, max: 12 },
      rotationSpeed: { min: -0.05, max: 0.05 },
      wobbleAmount: 0.5,
      wobbleSpeed: 0.1,
      changeDirectionInterval: { min: 60, max: 240 },
      spawnPatterns: {
        topDown: 0.7,
        slightAngle: 0.2,
        diagonal: 0.1,
      },
    },
    blackHoles: {
      spawnScore: 3000,
      spawnInterval: 1000,
      warningDuration: 180,
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
      warningDuration: 150,
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
      warningTime: 300,
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
      warningOpacity: 0.3,
    },
    crystalClusters: {
      spawnScore: 2000,
      spawnInterval: 800,
      radius: 10,
      lifetime: 300,
      crystalCount: 6,
      colors: ["#40c4ff", "#81d4fa"],
      rotationSpeed: 0.02,
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
    scoreBonus: 15,
    missileFragments: {
      minRadius: 3,
      maxRadius: 6,
      minLife: 80,
      maxLife: 120,
      color: "#f48fb1",
      speed: 4,
      lethal: true,
    },
  },

  // =============================================================================
  // EVENT SYSTEM
  // =============================================================================
  events: {
    interval: 4000,
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
    },
    denseField: { spawnInterval: 35 },
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
      warningTime: 180,
      asteroidRadius: 15,
      speed: 1.5,
      centerVariation: 50,
    },
    asteroidBelt: {
      count: 20,
      beltRadius: 300,
      asteroidSpeed: 1.5,
    },
    missileBarrage: { count: 5, delay: 500 },
    blackHoleChain: { count: 3, delay: 1000 },
    wormholePortal: {
      count: 3,
      lifetime: 600,
    },
    crystalRain: { count: 5, delay: 80 },
    quantumTunnels: { count: 3, lifetime: 350 },
    gravityWells: { count: 5, radius: 80 },
    meteorBombardment: { count: 25, delay: 60, speed: 5 },
    voidRifts: { count: 4, radius: 60 },
  },

  // =============================================================================
  // SPECIAL/NEW OBJECTS
  // Renamed for consistency with code
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
    },
    laserTurret: {
      radius: 20,
      barrelLength: 30,
      rotationSpeed: 0.05,
      trackingRange: 200,
      fireInterval: 90,
      color: "#ff5722",
      laserColor: "#ff5722",
      barrelColor: "#d32f2f",
      chargeColor: "#ffeb3b",
      asteroidScore: 20,
      missileScore: 15,
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
      missileAffectMultiplier: 0.3,
      chargeColor: "#88ddff",
      attractColor: "#00ff88",
      repelColor: "#ff4444",
      arcColor: "#88ddff",
      lethalBoltColor: "#ffff00",
    },
    lightningStorm: {
      lifetime: 600,
      lightningInterval: 120,
      lightningJitter: 60,
      boostDuration: 600,
    },
    plasmaField: {
      radius: 80,
      lifetime: 400,
      damageRate: 0.02,
      color: "#ff6b35",
      particleCount: 15,
      particleMinDist: 20,
      particleMaxDist: 40,
      particleMinSpeed: 0.02,
      particleMaxSpeed: 0.03,
      particleMinSize: 2,
      particleMaxSize: 3,
      rotationSpeed: 0.02,
      distancePulseSpeed: 0.05,
      distancePulseAmount: 0.5,
      pushRadiusMultiplier: 1.5,
      pushForce: 0.05,
      fragmentPushMultiplier: 1.6,
    },
  },

  // =============================================================================
  // AUDIO SETTINGS
  // =============================================================================
  audio: {
    masterVolume: 1.0,
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
      fragmentHit: 0.1,
      laserMine: 0.12,
      wormhole: 0.15,
      shield: 0.15,
      freeze: 0.15,
    },
  },

  // =============================================================================
  // VISUAL SETTINGS
  // =============================================================================
  visual: {
    colors: {
      primary: "#00ffff",
      danger: "#ff4444",
      energy: "#aa66cc",
      highlight: "#ffbb33",
      missile: "#f48fb1",
      crystal: "#40c4ff",
    },
    screenShake: {
      duration: 0.3,
      laserIntensity: 0.1,
      explosionIntensity: 0.5,
      blackHoleIntensity: 0.05,
      mineIntensity: 0.2,
      crystalIntensity: 0.3,
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
    movementMultiplier: 0.2,
    asteroidDestroy: 25,
    baseMovementThreshold: 5,
    minMovementThreshold: 2,
    thresholdDecreasePerLevel: 0.5,
    thresholdDecreaseRate: 0.95,
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}
