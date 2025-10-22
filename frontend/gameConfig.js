// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION (REFACTORED)
// =============================================================================
// Unused properties have been removed or commented out.
// =============================================================================

const GAME_CONFIG = {
  canvas: {
    backgroundColor: "#050510",
  },

  core: {
    maxParticles: 300,
    maxFragments: 150,
    collisionPrecision: 1,
    localStorageKey: "stellarDriftHighScore",
  },

  player: {
    radius: 15,
    responsiveness: 0.15,
    friction: 0.95,
    trailLength: 20,
    trailFadeSpeed: 0.05,
    shieldDuration: 600,
    thunderShieldDuration: 600,
    thunderShieldRadiusMultiplier: 3.5,
  },

  difficulty: {
    baseSpawnInterval: 80,
    minSpawnInterval: 20,
    spawnDecreaseStep: 3.5,
    baseSpeed: 0.5,
    speedIncreaseStep: 0.07,
    microSpeedIncrease: 0.01,
    microProgressInterval: 900,
    levelUpScores: [
      500, 1500, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000,
      65000, 80000, 100000,
    ],
    scorePerLevelAfterMax: 20000,
  },

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
      warningDuration: 120,
      baseRadius: 8,
      baseMaxRadius: 40,
      radiusIncreasePerLevel: 20,
      baseGravityRadius: 120,
      gravityRadiusIncreasePerLevel: 40,
      baseStrength: 0.015,
      strengthIncreasePerLevel: 0.02,
      baseGrowthRate: 0.018,
      growthRateIncreasePerLevel: 0.035,
      playerForceMultiplier: 0.5, // FIX: Reduced from 1.8
      shakeThreshold: 0.7,
      shakeIntensity: 0.05,
      temporaryLifetime: 200,
    },
    missiles: {
      spawnScore: 500,
      spawnInterval: 700,
      minSpawnInterval: 120,
      intervalDecreasePerLevel: 60,
      warningDuration: 120,
      radius: 5,
      baseSpeed: 0.15,
      speedIncreasePerLevel: 0.03,
      baseTurnSpeed: 0.015,
      turnSpeedIncreasePerLevel: 0.025,
      speedUpTime: 350,
      speedUpMultiplier: 1.9,
      turnSpeedUpMultiplier: 1.6,
      lifetime: 450,
      fragmentCount: 8,
      fragmentCountOnImpact: 5,
      velocity: {
        friction: 0.92,
      },
      color: "#f48fb1", // Added color config
    },
    lasers: {
      spawnScore: 1000,
      baseInterval: 450,
      intervalDecreasePerLevel: 45,
      minInterval: 60,
      maxConcurrent: 1, // Only 1 concurrent laser implemented in logic
      lasersPerLevel: 3,
      baseTargetChance: 0.1,
      targetChanceIncreasePerLevel: 0.1,
      maxTargetChance: 0.85,
      warningTime: 120,
      beamDuration: 10,
      staggerDelay: 150,
      playerHitRadius: 7.5,
    },
    laserMines: {
      spawnScore: 2000,
      spawnInterval: 500,
      radius: 10,
      chargeTime: 180,
      fireDuration: 15,
      patterns: ["cross", "diagonal", "star"],
      beamWidth: 10,
      warningDuration: 120, // Added warning duration
    },
    crystalClusters: {
      spawnScore: 2500,
      spawnInterval: 800,
      radius: 10,
      lifetime: 300,
      crystalCount: 6,
      // colors: ["#40c4ff", "#81d4fa"], // Color handled by variable now
      rotationSpeed: 0.02,
      warningDuration: 120,
    },
  },

  fragments: {
    minRadius: 2,
    maxRadius: 5,
    minLife: 100,
    maxLife: 150,
    color: "#ffbb33",
    explosionParticles: 6,
    scoreBonus: 5,
    missileFragments: {
      minRadius: 3,
      maxRadius: 6,
      minLife: 80,
      maxLife: 120,
      color: "#f48fb1",
      lethal: false, // Missile fragments are not lethal
    },
  },

  events: {
    interval: 1500,
    duration: 5000,
    scoreThreshold: {
      min: 500, // Reduced min threshold
      max: 900000, // Increased max threshold significantly (effectively no max)
    },
    unlockThresholds: {
      // Thresholds for events that are actually implemented in eventSystem.js
      crystalRain: 500,
      shieldGenerator: 1000,
      instantMissiles: 1500,
      asteroidShower: 2000,
      asteroidRain: 2500, // Used by eventSystem
      asteroidCircle: 3000,
      decoyPowerUp: 4000,
      meteorBombardment: 4000, // Used by eventSystem
      magneticStorm: 4500,
      freezeZone: 5000,
      missileBarrage: 6500,
      laserGrid: 7000,
      lightningStorm: 8000,
      wormholePortal: 9000, // Used by eventSystem
      blackHoleChain: 10000,
      plasmaStorm: 11000, // Used by eventSystem
      chaosMode: 12000,
      gravityWells: 16000, // Used by eventSystem
      voidRifts: 15000, // Used by eventSystem
      mineFieldDetonation: 21000, // Used by eventSystem

      // Commented out unused event thresholds
      // gravitationalAnomaly: 12000,
      // temporalChaos: 18000,
      // lightningNetwork: 19000,
      // voidStorm: 20000,
    },
    // Configs for implemented events
    speedZone: { speedMultiplier: 1.4 }, // Referenced in animate(), kept for now
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
      warningTime: 120,
      asteroidRadius: 15,
      speed: 1.5,
      centerVariation: 50,
    },
    missileBarrage: { count: 5, delay: 500 },
    blackHoleChain: { count: 3, delay: 1000 },
    crystalRain: { count: 5, delay: 80 },
    gravityWells: { count: 5, radius: 100 },
    meteorBombardment: { count: 25, delay: 60, speed: 5 },
    voidRifts: { count: 4 }, // Associated logic uses BlackHole class
    wormholePortal: { count: 1 }, // Spawns Wormhole class
    shieldGenerator: { count: 1 }, // Spawns ShieldGenerator class
    mineFieldDetonation: {
      count: 8,
      delay: 200,
      chargeTime: 60,
      warningTime: 90,
    },
    plasmaStorm: {
      // Added missing config block used by eventSystem
      waveCount: 4,
      fieldsPerWave: 5,
      fieldStagger: 80,
      warningDuration: 180,
      minRadius: 60,
      maxRadius: 90,
      positionJitterX: 80,
      positionJitterY: 60,
      damageRate: 0.04,
      shakeIntensity: 0.8,
    },
    freezeZone: {
      // Added missing config block used by eventSystem
      count: 3,
      warningDuration: 120, // Added default warning duration if needed elsewhere
    },

    // Commented out config for asteroidBelt as triggerAsteroidBelt seems unused
    // asteroidBelt: {
    //   count: 18,
    //   radius: 250,
    //   warningTime: 180,
    //   asteroidRadius: 15,
    //   orbitSpeed: 0.02,
    // },
  },

  newObjects: {
    energyOrb: {
      baseRadius: 2.5,
      baseVelocity: 1.0,
      minLifetime: 500,
      maxLifetime: 800,
      rotationSpeed: 0.01,
      repulsionRadiusFactor: 20,
      repulsionForce: 0.8,
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
      effectStrength: 0.3, // Slowdown factor
      particleCount: 20,
      color: "#81d4fa",
      pulseSpeed: 0.05,
      duration: 300,
      freezeChance: 0.005, // Chance per frame to fully freeze asteroid
      missileFreezeChance: 0.01, // Chance per frame to fully freeze missile
      fullFreezeFactor: 0.1, // Velocity multiplier when fully frozen
      particleMinSpeed: 0.01, // Added particle speed config
      particleMaxSpeed: 0.02, // Added particle speed config
    },
    magneticStorm: {
      lifetime: 480, // Duration of the storm
      maxIntensity: 1.2, // Max strength multiplier
      fieldCount: 4, // Number of magnetic centers
      baseStrength: 0.5, // Base pull/push strength
      strengthVariation: 0.8, // Random variation in strength
      fieldRadius: 100, // Base radius of effect
      radiusVariation: 80, // Random variation in radius
      lightningInterval: 30, // Frames between lethal lightning attempts
      rampDuration: 60, // Frames to reach full intensity
      playerAffectMultiplier: 0.3, // How much player is affected
      objectAffectMultiplier: 0.5, // How much asteroids/fragments affected
      missileAffectMultiplier: 0.3, // Additional multiplier for missiles
      chargeColor: "#88ddff", // Color for charged asteroids/arcs
      attractColor: "#00ff88", // Color for attracting fields
      repelColor: "#ff4444", // Color for repelling fields
      arcColor: "#88ddff", // Color for random arcs
      lethalBoltColor: "#ffff00", // Color for player-targeting bolts
      lethalTargetRange: 300, // Max distance to target player
      lethalHitTolerance: 10, // Hit radius around lightning bolt
      segmentCount: 8, // Segments in lightning bolts
      arcFadeSpeed: 0.1, // How fast arcs disappear
      arcSpawnChance: 0.1, // Chance per frame to spawn random arc
      fieldRotationSpeed: 0.02, // Visual rotation speed
      lethalJitter: 40, // Randomness in lethal bolt path
      arcJitter: 40, // Randomness in arc path
      pulseMinFactor: 0.8, // Minimum intensity during pulse
      pulseMaxFactor: 0.2, // Amplitude of intensity pulse
      lineCount: 8, // Visual field lines
    },
    lightningStorm: {
      lifetime: 600,
      lightningInterval: 120, // Check interval for striking objects
      lightningJitter: 60, // Visual jitter for bolts
      boostDuration: 600, // How long thunder shield lasts
      speedBoostMultiplier: 0.8, // Factor to slow down global speed
      gateCount: 2, // Number of gates
      gatePlacementRange: 200, // Y-axis randomness for gates
      gateRadius: 40,
      gateChargeTime: 120, // Frames to charge before firing
      chargeColor: "#88ddff", // Visual color
      boltColor: "#88ddff", // Visual color
      particleSpawnChance: 0.3, // Chance per frame for gate particles
      segmentCount: 12, // Visual segments in bolts
      boltFadeSpeed: 0.1, // How fast bolts disappear
      hitRadius: 25, // Radius around bolt for hitting player
    },
    plasmaField: {
      radius: 80, // Base radius
      lifetime: 400, // Duration
      damageRate: 0.02, // Chance per frame to damage player inside
      color: "#ff6b35",
      particleCount: 15,
      pushForce: 0.2, // How strongly it pushes objects
      rotationSpeed: 0.02, // Visual rotation
      particleMinDist: 20, // Inner particle distance
      particleMaxDist: 40, // Outer particle distance
      particleMinSpeed: 0.02, // Particle orbit speed
      particleMaxSpeed: 0.03,
      distancePulseSpeed: 0.05, // Speed particles move in/out
      distancePulseAmount: 0.5, // How far particles move in/out
      pushRadiusMultiplier: 1.5, // How far the push effect extends
      fragmentPushMultiplier: 1.6, // Extra push for fragments
      asteroidPushMultiplier: 1.2, // Extra push for asteroids (Added)
    },
    decoyPowerUp: {
      size: 10,
      lifetime: 500, // How long it stays before disappearing
      triggerRadius: 45, // How close player needs to be to trigger
      explosionParticles: 20, // Visual effect on trigger
      asteroidCount: 4, // Number of small asteroids spawned
      asteroidSpeed: 3, // Speed of spawned asteroids
    },
    // Commented out unused portal configs
    // quantumPortal: {
    //   radius: 25,
    //   innerRadius: 10,
    //   lifetime: 350,
    //   rotationSpeed: 0.05,
    //   pulseSpeed: 0.15,
    //   teleportRange: 40, // Random offset when teleporting
    //   disruptRange: 1.2, // Multiplier of radius for missile disruption
    //   disruptForce: 0.5, // Force applied to disrupt missiles
    // },
    // wormhole: {
    //   radius: 25,
    //   maxRadius: 40, // Likely visual, not functional radius
    //   lifetime: 600,
    //   shootInterval: 120, // Frames between shooting asteroids
    //   rotationSpeed: 0.05, // Visual rotation
    //   asteroidColor: "#ff6b9d", // Color of shot asteroids
    //   asteroidBaseSpeed: 3,
    //   asteroidSpeedVariation: 2,
    //   asteroidBaseRadius: 15,
    //   asteroidRadiusVariation: 10,
    //   aimSpread: 0.3, // Randomness added to aim angle (radians)
    //   particleSpawnChance: 0.3, // Chance per frame to spawn visual particle
    //   particleFadeSpeed: 0.02, // How fast visual particles fade
    // },
  },

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
      wormhole: 0.15, // Sound exists, keep config
      shield: 0.15,
      freeze: 0.15,
      trap: 0.3,
      crystalDischarge: 0.25,
    },
  },

  visual: {
    colors: {
      danger: "#ff4444",
      // Added other common colors here for consistency
      primary: "#00ffff",
      highlight: "#ffbb33",
      crystal: "#40c4ff",
      missile: "#f48fb1",
      energy: "#aa66cc",
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

  ui: {
    eventText: { duration: 1500, fontSize: "2.5rem" },
    warning: {
      radius: 30,
      pulseIntensity: 15,
      pulseSpeed: 0.3,
      fadeInTime: 20,
      fadeOutTime: 20,
    },
    gameOverDelay: 1000,
    topBarOpacity: "1", // Use strings as they are CSS values
    topBarHiddenOpacity: "0",
  },

  scoring: {
    movementMultiplier: 0.3,
    baseMovementThreshold: 1.25,
    minMovementThreshold: 3,
    thresholdDecreaseRate: 0.95,
  },
};

window.GAME_CONFIG = GAME_CONFIG;
