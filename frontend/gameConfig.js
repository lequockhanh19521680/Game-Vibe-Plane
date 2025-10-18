// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION
// =============================================================================
// Game Designer Config File - Điều chỉnh tất cả thông số game tại đây
// Version: Điều chỉnh để khởi đầu có nhiều thiên thạch chậm như tutorial
// =============================================================================

const GAME_CONFIG = {
  // =============================================================================
  // PLAYER SETTINGS - Cài đặt người chơi
  // =============================================================================
  player: {
    radius: 15,
    responsiveness: 0.15,
    friction: 0.95,
    trailLength: 20,
    trailFadeSpeed: 0.05,
  },

  // =============================================================================
  // DIFFICULTY PROGRESSION - Hệ thống khó dần
  // =============================================================================
  difficulty: {
    // Level 1: Dễ, thiên thạch xuất hiện thường xuyên để luyện tập
    baseSpawnInterval: 80,
    minSpawnInterval: 20,
    spawnDecreaseStep: 1.0,

    baseSpeed: 0.5,
    speedIncreaseStep: 0.05,
    microSpeedIncrease: 0.01,

    levelUpInterval: 30,
    microProgressInterval: 900,

    scorePerLevel: 3000,
  },

  // =============================================================================
  // ASTEROID SETTINGS - Cài đặt thiên thạch
  // =============================================================================
  asteroids: {
    minRadius: 12,
    maxRadius: 40,
    baseSpeed: 1.0,
    speedVariation: 1.0,
    speedIncreasePerLevel: 0.4,
    fragmentSpeed: 0.99,
    colors: ["#ff4444", "#ffbb33", "#99cc00"],
    spawnPatterns: {
      topDown: 0.7,
      slightAngle: 0.2,
      diagonal: 0.1,
    },
  },

  // =============================================================================
  // BLACK HOLE SETTINGS - Cài đặt hố đen
  // =============================================================================
  blackHoles: {
    spawnScore: 3000,
    spawnInterval: 1000,
    warningDuration: 180,
    warningDelay: 3000,

    baseRadius: 8,
    baseMaxRadius: 50,
    radiusIncreasePerLevel: 15,

    baseGravityRadius: 120,
    gravityRadiusIncreasePerLevel: 30,

    baseStrength: 0.02,
    strengthIncreasePerLevel: 0.018,

    baseGrowthRate: 0.025,
    growthRateIncreasePerLevel: 0.03,

    playerForceMultiplier: 1.8,
    shakeThreshold: 0.7,
    shakeIntensity: 0.05,

    temporaryLifetime: 200,
  },

  // =============================================================================
  // MISSILE SETTINGS - Cài đặt tên lửa
  // =============================================================================
  missiles: {
    spawnScore: 1500,
    spawnInterval: 700,
    warningDuration: 150,
    warningDelay: 2500,

    radius: 5,
    baseSpeed: 0.18,
    speedIncreasePerLevel: 0.025,

    baseTurnSpeed: 0.02,
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

  // =============================================================================
  // LASER SETTINGS (CHUNG) - Cài đặt laser
  // =============================================================================
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

    warningTime: 240, // ĐÃ ĐIỀU CHỈNH: Dễ hơn
    beamDuration: 10, // ĐÃ ĐIỀU CHỈNH: Dễ hơn
    staggerDelay: 150,

    playerHitRadius: 7.5,
  },

  // =============================================================================
  // FRAGMENT SETTINGS - Cài đặt mảnh vỡ
  // =============================================================================
  fragments: {
    minRadius: 2,
    maxRadius: 5,
    minLife: 100,
    maxLife: 150,
    gravity: 0.1,
    airResistance: 0.98,
    rotationSpeed: 0.2,
    color: "#ffbb33",
    shadowBlur: 5,
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
  // LASER MINE SETTINGS - Cài đặt mìn laser
  // =============================================================================
  laserMines: {
    spawnScore: 8000,
    spawnInterval: 500,
    warningDuration: 100,
    radius: 10,
    chargeTime: 120,
    fireDuration: 15,
    patterns: ["cross", "diagonal", "star"],
    beamWidth: 10,
    warningOpacity: 0.3,
  },

  // =============================================================================
  // CRYSTAL CLUSTER SETTINGS - Cài đặt cụm pha lê
  // =============================================================================
  crystalClusters: {
    spawnScore: 2000,
    spawnInterval: 800,
    radius: 10, // ĐÃ ĐIỀU CHỈNH: Nhỏ hơn
    lifetime: 300,
    crystalCount: 6,
    colors: ["#40c4ff", "#81d4fa"],
    pulseSpeed: 0.15,
    rotationSpeed: 0.02,
  },

  // =============================================================================
  // EVENT SYSTEM - Hệ thống sự kiện
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
      superNova: 12000,
      voidRifts: 15000,
    },

    denseField: { spawnInterval: 35 },
    speedZone: { speedMultiplier: 1.4 },
    laserSwarm: { laserCount: 3, targetChance: 0.6, delay: 400 },
    laserGrid: {
      gridSize: 3, // ĐÃ ĐIỀU CHỈNH: Dễ hơn
      delay: 350, // ĐÃ ĐIỀU CHỈNH: Dễ hơn
    },
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
    missileBarrage: { count: 5, delay: 500 },
    blackHoleChain: { count: 3, delay: 1000, warningDelay: 2000 },
    gravitationalAnomaly: { blackHoleCount: 2 },
    wormholePortal: {
      count: 3,
      lifetime: 600,
      shootInterval: 120,
      asteroidSpeed: 4,
    },
    shieldGenerator: {
      count: 3,
      lifetime: 300,
      shieldRadius: 80,
      chargeTime: 60,
    },

    // CẤU HÌNH SUPER NOVA (ĐÃ CHUYỂN CÁC CONST TỪ hazards.js)
    superNova: {
      maxRadius: 200,
      expansionSpeed: 10,
      lifetime: 150,
      clearBonus: 10,
      startRadius: 10,
      playerHitTolerance: 1,
      ringAlpha: 0.8,
      ringLineWidth: 8,
      coreAlpha: 0.6,
      coreRadiusFactor: 0.5,
      coreStartColor: "#fff",
      coreEndColor: "rgba(255, 152, 0, 0)",
      glowAlpha: 0.3,
      glowInnerRadiusFactor: 0.8,
      glowOuterRadiusFactor: 1.5,
      coreColor: "#ff9800",
      color: "#ffeb3b",

      // Particle and Shake Settings
      particleSpawnInterval: 2,
      particleMaxRadius: 3,
      particleSpawnDistMin: 20,
      particleSpawnDistMax: 40,
      shakeFrameInterval: 10,
      shakeBaseIntensity: 0.3,
      shakeIntensityScale: 0.5,
      clearingShakeIntensity: 0.4,
      clearingParticleCount: 5,
      clearingParticleMaxRadius: 3,
      clearingParticleSpeed: 3,
      asteroidExplosionParticles: 8,
      asteroidParticleOffset: 5,
      asteroidParticleSpeed: 6,
      asteroidParticleColor: "#ffbb33",
      fragmentSpawnOffset: 8,
      fragmentSpeed: 3,
      fragmentBaseSpeed: 4,
      fragmentSpeedVariation: 6,

      particleMinCount: 4, // Min count in SuperNova update logic
      particleRadiusStep: 30, // Radius step for particle count increase
    },

    freezeZone: { count: 4, radius: 100, slowFactor: 0.3, duration: 200 },
    magneticStorm: {
      lifetime: 480,
      maxIntensity: 1.2,
      fieldCount: 4,
      fieldRadius: 120,
      playerAffectMultiplier: 0.3,
      objectAffectMultiplier: 0.5,
    },
    asteroidBelt: {
      count: 20,
      beltRadius: 300,
      rotationSpeed: 0.02,
      asteroidSpeed: 1.5,
    },
    laserTurrets: {
      count: 4,
      rotationSpeed: 0.05,
      fireInterval: 90,
      laserSpeed: 8,
      lifetime: 300,
    },
    plasmaStorm: {
      count: 6,
      minRadius: 60,
      maxRadius: 90,
      duration: 400,
      intensity: 0.8,
    },
    crystalRain: { count: 5, delay: 80, clusterSize: 8, driftSpeed: 1.2 },
    quantumTunnels: { count: 3, lifetime: 350, teleportForce: 0.9 },
    gravityWells: { count: 5, radius: 80, strength: 0.08, lifetime: 300 },
    meteorBombardment: { count: 25, delay: 60, speed: 5, explosionRadius: 40 },
    voidRifts: { count: 4, radius: 60, pullStrength: 0.2, lifetime: 320 },
  },

  // =============================================================================
  // NEW OBJECTS - Cấu hình chi tiết cho các vật thể mới
  // =============================================================================
  newObjects: {
    wormhole: {
      radius: 25,
      attractRadius: 100,
      attractForce: 0.15,
      teleportRadius: 20,
      color: "#9c27b0",
      rotationSpeed: 0.1,
    },
    shieldGenerator: {
      radius: 15,
      shieldRadius: 80,
      chargeTime: 60,
      activeTime: 180,
      color: "#2196f3",
      shieldColor: "#4fc3f7",
    },

    // CẤU HÌNH FREEZE ZONE (ĐÃ CHUYỂN CÁC CONST TỪ hazards.js)
    freezeZone: {
      radius: 100,
      effectStrength: 0.3, // Slow factor (0.3 = 30% speed remaining)
      particleCount: 20,
      color: "#81d4fa",
      pulseSpeed: 0.05,
      pulseMinFactor: 0.3,
      pulseMaxFactor: 0.7,
      drawAlpha: 0.6,
      lineWidth: 4,
      lineDash: [8, 4],
      fillAlphaHex: "20",
      shadowBlur: 5,
      distancePulseSpeed: 0.02,
      distancePulseAmount: 0.5,
      freezeChance: 0.005, // 0.5% chance for full freeze
      missileFreezeChance: 0.01, // 1% chance for missile full freeze
      fullFreezeFactor: 0.1, // Velocity factor when fully frozen
      crystalSpawnDistance: 20,
      crystalSpawnFactor: 0.7,
      duration: 300, // Used as lifetime for the object
    },

    // CẤU HÌNH LASER TURRET (ĐÃ CHUYỂN CÁC CONST TỪ hazards.js)
    laserTurret: {
      radius: 20,
      barrelLength: 30,
      rotationSpeed: 0.05,
      trackingRange: 200,
      fireInterval: 90,
      laserDamage: 1,
      color: "#ff5722",
      laserColor: "#ff5722",
      baseShadowBlur: 10,
      barrelWidth: 6,
      barrelColor: "#d32f2f",
      chargeColor: "#ffeb3b",
      glowDuration: 10,
      tipRadius: 4,
      chargeShadowBlur: 15,
      trackingAlpha: 0.2,
      trackingLineWidth: 2,
      trackingLineDash: [5, 5],
      trackingSpeed: 0.15,
      laserLength: 1000,
      laserHitRadius: 8,
      asteroidScore: 20,
      missileScore: 15,
      maxPriorityDistance: 300,
      nonPlayerTargetRateMultiplier: 1.5,
      freezeSlowdownFactor: 0.05,
      unfreezeFireFactor: 0.99,
      unfreezeRotationFactor: 1.02,
      laserParticleCount: 5,
      particleVelocityBase: 5,
      asteroidFragmentCount: 4,
      fragmentSpawnOffset: 8,
      fragmentSpeed: 3,
    },

    // CẤU HÌNH MAGNETIC STORM (ĐÃ CHUYỂN CÁC CONST TỪ hazards.js)
    magneticStorm: {
      lifetime: 480,
      maxIntensity: 1.2,
      fieldCount: 4,
      baseStrength: 0.5,
      strengthVariation: 0.8,
      fieldRadius: 100,
      radiusVariation: 80,
      lightningInterval: 30,
      fieldDrawAlpha: 0.4,
      rampDuration: 60,
      pulseSpeed: 0.1,
      pulseMinFactor: 0.8,
      pulseMaxFactor: 0.2,
      fieldRotationSpeed: 0.02,
      arcSpawnChance: 0.1,
      lethalTargetRange: 300,
      arcFadeSpeed: 0.1,
      lethalCollisionMinAlpha: 0.7,
      playerAffectMultiplier: 0.3,
      objectAffectMultiplier: 0.5,
      missileAffectMultiplier: 0.3,
      lethalHitTolerance: 10,
      chargeColor: "#88ddff", // Electric blue color
      arcColor: "#88ddff",
      lethalBoltColor: "#ffff00",
      lethalBoltLineWidth: 5,
      lethalBoltShadowBlur: 15,
      arcLineWidth: 3,
      arcShadowBlur: 10,
      lineCount: 8,
      startRadiusFactor: 0.3,
      controlRadiusFactor: 0.7,
      controlAngleOffset: 0.3,
      fieldLineWidth: 2,
      coreRadius: 8,
      arcJitter: 40,
      lethalJitter: 40,
      lethalBoltSoundVolume: 0.5,
    },

    // CẤU HÌNH LIGHTNING STORM (ĐÃ CHUYỂN CÁC CONST TỪ hazards.js)
    lightningStorm: {
      lifetime: 600,
      gateCount: 2,
      gatePlacementRange: 200,
      gateRadius: 40,
      gateChargeTime: 120,
      lightningJitter: 60,
      speedBoostMultiplier: 0.8,
      boostDuration: 600,
      segmentCount: 12,

      chargeColor: "#88ddff",
      ringLineWidth: 4,
      ringShadowBlur: 15,
      chargeInnerRadiusFactor: 0.7,
      chargeLineWidth: 2,
      particleSpawnChance: 0.3,
      particleVelocity: 2,
      particleMaxSize: 3,
      boltFadeSpeed: 0.1,
      collisionMinAlpha: 0.5,
      hitRadius: 25,
      boltColor: "#ffffff",
      boltLineWidth: 4,
      boltShadowBlur: 20,
      boltSoundVolume: 0.7,
      particleFadeSpeed: 0.05,

      particleSpawnMinDistFactor: 0.5,
      particleSpawnMaxDistFactor: 0.5,
      boltWidth: 8,
    },

    // CẤU HÌNH PLASMA FIELD (ĐÃ CHUYỂN CÁC CONST TỪ hazards.js)
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
      drawAlpha: 0.6,
      lineWidth: 3,
      lineDash: [10, 5],
      shadowBlur: 8,
      rotationSpeed: 0.02,
      rotationAcceleration: 0,
      distancePulseSpeed: 0.05,
      distancePulseAmount: 0.5,
      pushRadiusMultiplier: 1.5,
      pushForce: 0.05,
      missilePushMultiplier: 1.0,
      fragmentPushMultiplier: 1.6,
    },
  },

  // =============================================================================
  // AUDIO SETTINGS - Cài đặt âm thanh (ĐÃ CẬP NHẬT)
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
      supernova: 0.25,

      blackholeGrowth: 0.02,
      blackholeDestroy: 0.04,
      plasmaStorm: 0.07,
      temporalRift: 0.06,
      quantumFluctuation: 0.05,
      cosmicRadiation: 0.04,
      pulsarBurst: 0.06,
      ambientSpace: 0.02,
    },
    backgroundMusic: {
      frequencies: [110, 146.83, 196, 220, 293.66, 329.63, 392],
      patterns: [
        [0, 2, 4, 6],
        [1, 3, 5, 3],
        [6, 4, 2, 0],
        [2, 0, 3, 5],
      ],
      waveTypes: ["sine", "triangle", "sine", "triangle"],
      interval: 2000,
      duration: 3.5,
      fadeTime: 2,
      spaceModulation: { enable: true, depth: 3, speed: 0.1 },
      spatialSettings: { reverbLevel: 0.3, stereoWidth: 0.7 },
    },
  },

  // =============================================================================
  // VISUAL SETTINGS - Cài đặt hình ảnh
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
    particles: { explosionCount: 6, explosionSpeed: 6, fadeSpeed: 0.02 },
    nebula: { count: 5, minRadius: 100, maxRadius: 300, opacity: 0.05 },
    stars: { layers: 3, starsPerLayer: 80, maxRadius: 1.5 },
  },

  // =============================================================================
  // UI SETTINGS - Cài đặt giao diện
  // =============================================================================
  ui: {
    eventText: { duration: 2000, fontSize: "2.5rem" },
    warning: {
      radius: 30,
      pulseIntensity: 15,
      pulseSpeed: 0.3,
      fadeInTime: 20,
      fadeOutTime: 20,
    },
  },

  // =============================================================================
  // SCORING SYSTEM - Hệ thống điểm số
  // =============================================================================
  scoring: {
    movementMultiplier: 0.4,
    asteroidDestroy: 25,
    survivalBonus: 0,
    baseMovementThreshold: 5,
    minMovementThreshold: 2,
    thresholdDecreasePerLevel: 0.5,
    thresholdDecreaseRate: 0.95,
  },

  // =============================================================================
  // ADVANCED SETTINGS - Cài đặt nâng cao
  // =============================================================================
  advanced: {
    maxParticles: 100,
    maxFragments: 50,
    collisionPrecision: 1,
    targetFPS: 60,
    localStorageKey: "stellarDriftHighScore",
  },
};

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}
