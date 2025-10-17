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
    baseSpawnInterval: 80, // Tăng tần suất spawn ban đầu (số càng nhỏ, spawn càng nhanh)
    minSpawnInterval: 20, // Tần suất spawn tối thiểu (địa ngục)
    spawnDecreaseStep: 1.0,

    baseSpeed: 0.5,
    speedIncreaseStep: 0.05,
    microSpeedIncrease: 0.01,

    levelUpInterval: 30,
    microProgressInterval: 900,

    scorePerLevel: 3000, // <<<< ĐIỂM CẦN THIẾT ĐỂ LÊN MỖI CẤP
  },

  // =============================================================================
  // ASTEROID SETTINGS - Cài đặt thiên thạch
  // =============================================================================
  asteroids: {
    minRadius: 12,
    maxRadius: 40,
    baseSpeed: 1.0, // Tốc độ ban đầu chậm để dễ né
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
  // LASER SETTINGS - Cài đặt laser
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

    warningTime: 160,
    beamDuration: 25,
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
    radius: 15,
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
      asteroidShower: 6000,
      asteroidCircle: 6500,
      meteorBombardment: 7000,
      magneticStorm: 7500,
      freezeZone: 8000,
      missileBarrage: 8500,
      laserGrid: 9000,
      blackHoleChain: 10000,
      plasmaStorm: 11000,
      superNova: 12000,
      voidRifts: 15000,
    },

    denseField: { spawnInterval: 35 },
    speedZone: { speedMultiplier: 1.4 },
    laserSwarm: { laserCount: 6, targetChance: 0.6, delay: 200 },
    laserGrid: { gridSize: 9, delay: 150 },
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
    superNova: {
      maxRadius: 400,
      expansionSpeed: 10,
      lifetime: 150,
      clearBonus: 10,
    },
  },

  // =============================================================================
  // NEW OBJECTS - Các vật thể mới
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
    freezeZone: {
      radius: 100,
      effectStrength: 0.3,
      particleCount: 20,
      color: "#81d4fa",
      pulseSpeed: 0.05,
    },
    laserTurret: {
      radius: 20,
      barrelLength: 30,
      rotationSpeed: 0.05,
      trackingRange: 200,
      fireInterval: 90,
      laserDamage: 1,
      color: "#ff5722",
    },
    magneticField: {
      radius: 150,
      strength: 0.08,
      pulseFrequency: 30,
      color: "#e91e63",
      particleCount: 15,
    },
  },

  // =============================================================================
  // AUDIO SETTINGS - Cài đặt âm thanh
  // =============================================================================
  audio: {
    masterVolume: 1.0,
    volumes: {
      explosion: 0.15,
      laser: 0.1,
      missile: 0.08,
      buttonHover: 0.03,
      collision: 0.12,
      warning: 0.08,
      score: 0.04,
      powerup: 0.06,
      blackhole: 0.03,
      backgroundMusic: 0.015,
      blackholeGrowth: 0.02,
      blackholeDestroy: 0.04,
      fragmentHit: 0.08,
      laserMine: 0.06,
      wormhole: 0.05,
      shield: 0.04,
      freeze: 0.03,
      plasmaStorm: 0.07,
      temporalRift: 0.06,
      quantumFluctuation: 0.05,
      cosmicRadiation: 0.04,
      pulsarBurst: 0.06,
      supernova: 0.09,
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

// Export cho sử dụng
if (typeof module !== "undefined" && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}
