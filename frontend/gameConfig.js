// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION (REFACTORED & CLEANED)
// =============================================================================

const GAME_CONFIG = {
  canvas: {
    backgroundColor: "#050510",
  },

  core: {
    maxParticles: 300,
    maxFragments: 150,
    collisionPrecision: 1, // Threshold for collision checks
    localStorageKey: "stellarDriftHighScore",
  },

  player: {
    radius: 15,
    responsiveness: 0.15, // How quickly player follows mouse/touch
    friction: 0.95, // Damping factor for external forces (like black holes)
    trailLength: 20, // Max number of trail particles
    trailFadeSpeed: 0.05, // How fast trail particles fade
    shieldDuration: 600, // Duration of regular shield in frames (10 seconds)
    thunderShieldDuration: 600, // Duration of thunder shield in frames (10 seconds)
    thunderShieldRadiusMultiplier: 3.5, // Thunder shield radius = player radius * this
  },

  difficulty: {
    baseSpawnInterval: 80, // Initial frames between asteroid spawns
    minSpawnInterval: 20, // Minimum frames between asteroid spawns at high levels
    spawnDecreaseStep: 3.5, // How much spawn interval decreases per level
    baseSpeed: 0.5, // Initial global speed multiplier
    speedIncreaseStep: 0.07, // How much global speed increases per level
    microSpeedIncrease: 0.01, // Small speed increase at regular intervals
    microProgressInterval: 900, // Frames between micro speed increases (15 seconds)
    levelUpScores: [
      // Scores required to reach each level
      500, 1500, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000,
      65000, 80000, 100000,
    ],
    scorePerLevelAfterMax: 20000, // Score needed per level after the array is exhausted
  },

  entities: {
    asteroids: {
      minRadius: 12,
      maxRadius: 40,
      baseSpeed: 1.0,
      speedVariation: 1.0, // Randomness added to base speed
      speedIncreasePerLevel: 0.4, // Speed increase per difficulty level
      colors: ["#ff4444", "#ffbb33", "#99cc00"],
      wobbleAmount: 0.5, // Max sideways movement for wobbling asteroids
      wobbleSpeed: 0.1, // Speed of wobble oscillation
      spawnPatterns: {
        // Probability distribution for spawn locations
        topDown: 0.7,
        slightAngle: 0.2,
        diagonal: 0.1,
      },
    },
    blackHoles: {
      spawnScore: 3000, // Score needed for black holes to start spawning
      spawnInterval: 1000, // Frames between regular black hole spawns
      warningDuration: 120, // Warning time in frames (2 seconds)
      baseRadius: 8, // Initial core radius
      baseMaxRadius: 40, // Max core radius for regular black holes
      radiusIncreasePerLevel: 20, // How much max core radius increases per level
      baseGravityRadius: 120, // Initial gravity pull radius
      gravityRadiusIncreasePerLevel: 40, // How much gravity radius increases per level
      baseStrength: 0.015, // Initial pull strength
      strengthIncreasePerLevel: 0.02, // How much pull strength increases per level
      baseGrowthRate: 0.018, // How fast the core radius grows per frame
      growthRateIncreasePerLevel: 0.035, // How much growth rate increases per level
      playerForceMultiplier: 0.5, // How strongly the player is pulled (less than other objects)
      shakeThreshold: 0.7, // Percentage of gravity radius proximity to trigger screen shake
      shakeIntensity: 0.05, // Intensity of screen shake
      temporaryLifetime: 200, // Lifetime in frames for regular temporary black holes (~3.3 seconds)
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
      speedUpTime: 350, // Frames before missile speeds up
      speedUpMultiplier: 1.9, // Speed multiplier after speedUpTime
      turnSpeedUpMultiplier: 1.6, // Turn speed multiplier after speedUpTime
      lifetime: 450, // Max frames missile exists before exploding
      fragmentCount: 8, // Fragments on timeout explosion
      fragmentCountOnImpact: 5, // Fragments on hitting shield/asteroid
      velocity: {
        friction: 0.92, // Damping factor for missile movement
      },
      color: "#f48fb1",
    },
    lasers: {
      spawnScore: 1000,
      baseInterval: 450,
      intervalDecreasePerLevel: 45,
      minInterval: 60,
      maxConcurrent: 1, // Only 1 laser active at a time in current logic
      lasersPerLevel: 3, // Used to calculate laserCount in game.js
      baseTargetChance: 0.1, // Initial chance laser targets player
      targetChanceIncreasePerLevel: 0.1, // How much target chance increases per level
      maxTargetChance: 0.85, // Max chance laser targets player
      warningTime: 120, // Frames warning line shows
      beamDuration: 10, // Frames laser beam is visible and dangerous
      staggerDelay: 150, // Delay between multiple lasers if maxConcurrent > 1
      playerHitRadius: 7.5, // Collision radius against player
    },
    laserMines: {
      spawnScore: 2000,
      spawnInterval: 500,
      radius: 10,
      chargeTime: 180, // Frames before firing
      fireDuration: 15, // Frames beams are active
      patterns: ["cross", "diagonal", "star"], // Possible beam patterns
      beamWidth: 10,
      warningDuration: 120,
    },
    crystalClusters: {
      spawnScore: 2500,
      spawnInterval: 800,
      radius: 10,
      lifetime: 300, // Charge time before discharge
      crystalCount: 6, // Visual crystals
      rotationSpeed: 0.02, // Visual rotation
      warningDuration: 120,
    },
  },

  fragments: {
    minRadius: 2,
    maxRadius: 5,
    // scoreBonus: 5, // YÊU CẦU 3: Removed unused config
    missileFragments: {
      minRadius: 3,
      maxRadius: 6,
      minLife: 80,
      maxLife: 120,
      color: "#f48fb1",
      lethal: false, // Missile fragments do not end the game
    },
  },

  events: {
    interval: 1500, // Base score interval between events
    duration: 5000, // General event influence duration (used for eventActive.endTime)
    scoreThreshold: {
      min: 500, // Minimum score required for ANY event to trigger
      max: 900000, // Effective maximum score threshold (set high)
    },
    unlockThresholds: {
      // Minimum score needed for each specific event type
      giantBlackHole: 18000,
      crystalRain: 500,
      shieldGenerator: 1000,
      instantMissiles: 1500,
      asteroidShower: 2000,
      asteroidRain: 2500,
      asteroidCircle: 3000,
      decoyPowerUp: 4000,
      magneticStorm: 4500,
      freezeZone: 5000,
      missileBarrage: 6500,
      laserGrid: 7000,
      lightningStorm: 8000,
      wormholePortal: 9000,
      blackHoleChain: 10000,
      plasmaStorm: 11000,
      // chaosMode removed
      gravityWells: 16000,
      mineFieldDetonation: 21000,
    },
    // Config for specific events
    giantBlackHole: {
      warningTime: 180,
      lifetime: 800,
      baseRadius: 15,
      maxRadiusMultiplier: 2.5,
      gravityRadiusMultiplier: 2.0,
      strengthMultiplier: 2.2,
      color: "#6a0dad",
    },
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
    wormholePortal: { count: 1 },
    shieldGenerator: { count: 1 },
    mineFieldDetonation: {
      count: 8,
      delay: 200,
      chargeTime: 60,
      warningTime: 90,
    },
    plasmaStorm: {
      waveCount: 4,
      fieldsPerWave: 5,
      fieldStagger: 80,
      warningDuration: 180,
      minRadius: 60,
      maxRadius: 90,
      positionJitterX: 80,
      damageRate: 0.04,
      shakeIntensity: 0.8,
    },
    freezeZone: {
      count: 3,
      warningDuration: 120,
    },
  },

  newObjects: {
    // Configs primarily for objects spawned OUTSIDE events (though events might reuse)
    energyOrb: {
      baseRadius: 2.5,
      baseVelocity: 1.0,
      minLifetime: 500,
      rotationSpeed: 0.01,
      repulsionRadiusFactor: 20,
      repulsionForce: 0.8,
      spawnInterval: 1500,
      spawnThreshold: 1000,
    },
    shieldGenerator: {
      // Config for event-spawned shield generator
      radius: 15,
      shieldRadius: 80,
      chargeTime: 60,
      activeTime: 180,
    },
    freezeZone: {
      // Config for event-spawned freeze zones
      radius: 100,
      effectStrength: 0.3,
      particleCount: 20,
      color: "#81d4fa",
      duration: 300,
      freezeChance: 0.005,
      missileFreezeChance: 0.01,
      fullFreezeFactor: 0.1,
      particleMinSpeed: 0.01,
      particleMaxSpeed: 0.02,
    },
    magneticStorm: {
      // Config for event-spawned magnetic storm
      lifetime: 480,
      maxIntensity: 1.2,
      fieldCount: 4,
      baseStrength: 0.5,
      fieldRadius: 100,
      radiusVariation: 80,
      rampDuration: 60,
      playerAffectMultiplier: 0.3,
      objectAffectMultiplier: 0.5,
      missileAffectMultiplier: 0.3,
      chargeColor: "#88ddff",
      attractColor: "#00ff88",
      repelColor: "#ff4444",
      arcColor: "#88ddff",
      lethalTargetRange: 300,
      lethalHitTolerance: 10,
      arcFadeSpeed: 0.1,
      arcSpawnChance: 0.1,
      fieldRotationSpeed: 0.02,
      lethalJitter: 40,
      arcJitter: 40,
      pulseMinFactor: 0.8,
      pulseMaxFactor: 0.2,
      lineCount: 8,
    },
    lightningStorm: {
      // Config for event-spawned lightning storm
      lifetime: 600,
      lightningInterval: 120,
      lightningJitter: 60,
      speedBoostMultiplier: 0.8,
      gateCount: 2,
      gatePlacementRange: 200,
      gateRadius: 40,
      gateChargeTime: 120,
      chargeColor: "#88ddff",
      boltColor: "#88ddff",
      particleSpawnChance: 0.3,
      boltFadeSpeed: 0.1,
      hitRadius: 25,
    },
    plasmaField: {
      // Config for event-spawned plasma fields
      radius: 80,
      lifetime: 400,
      damageRate: 0.02,
      color: "#ff6b35",
      particleCount: 15,
      pushForce: 0.2,
      rotationSpeed: 0.02,
      particleMinDist: 20,
      particleMinSpeed: 0.02,
      particleMaxSpeed: 0.03,
      distancePulseAmount: 0.5,
      pushRadiusMultiplier: 1.5,
      fragmentPushMultiplier: 1.6,
      asteroidPushMultiplier: 1.2,
    },
    decoyPowerUp: {
      // Config for event-spawned decoy power-ups
      size: 10,
      lifetime: 500,
      triggerRadius: 45,
      asteroidSpeed: 3,
    },
  },

  audio: {
    volumes: {
      // Master volumes for different sound types
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
      crystalDischarge: 0.25,
    },
  },

  visual: {
    colors: {
      // Centralized color definitions
      danger: "#ff4444",
      primary: "#00ffff",
      highlight: "#ffbb33",
      crystal: "#40c4ff",
      missile: "#f48fb1",
      energy: "#aa66cc",
    },
    screenShake: {
      duration: 0.3, // Seconds
      laserIntensity: 0.1,
      explosionIntensity: 0.5,
      mineIntensity: 0.2,
    },
    particles: {
      explosionCount: 6, // Base particle count for explosions
      explosionSpeed: 6, // Base speed for explosion particles
      fadeSpeed: 0.02, // Alpha decrease per frame
      deathMultiplier: 8, // Multiplier for particle count on player death
      maxSize: 3, // Max radius for basic particles
      deathSpeedMultiplier: 1.7, // Speed multiplier for player death particles
    },
    nebula: { count: 5, minRadius: 100, maxRadius: 300, opacity: 0.05 },
    stars: { layers: 3, starsPerLayer: 80, maxRadius: 1.5 },
  },

  ui: {
    eventText: {
      duration: 800, // Reduced duration further to 800ms
      fontSize: "2.5rem",
    },
    warning: {
      radius: 30,
      pulseIntensity: 15,
      pulseSpeed: 0.3,
      fadeInTime: 20, // Frames
      fadeOutTime: 20, // Frames
    },
    gameOverDelay: 1000, // Milliseconds delay before showing game over screen
    topBarOpacity: "1",
    topBarHiddenOpacity: "0",
  },

  scoring: {
    movementMultiplier: 0.3, // Points per pixel moved
    baseMovementThreshold: 1.25, // Minimum distance needed to score points initially
    minMovementThreshold: 3, // Absolute minimum distance threshold, even at high levels
    thresholdDecreaseRate: 0.95, // How much the threshold decreases per level (multiplier)
  },
};

window.GAME_CONFIG = GAME_CONFIG;
