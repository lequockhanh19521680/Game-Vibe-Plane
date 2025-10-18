// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION (MOBILE EASY MODE)
// =============================================================================
// Game Designer Config File - Điều chỉnh tất cả thông số game tại đây
// Phiên bản này được tối ưu cho di động với độ khó giảm đáng kể.
// =============================================================================

const GAME_CONFIG_MOBILE = {
  // =============================================================================
  // PLAYER SETTINGS - Cài đặt người chơi
  // Tàu nhỏ hơn để dễ né hơn
  // =============================================================================
  player: {
    radius: 12, // (GIẢM) Từ 15 -> 12: Kích thước vật thể người chơi nhỏ hơn.
    responsiveness: 0.18, // (TĂNG) Từ 0.15 -> 0.18: Tăng độ phản hồi cho di động.
    friction: 0.95,
    trailLength: 15, // (GIẢM) Hiệu ứng mượt mà hơn.
    trailFadeSpeed: 0.08,
  },

  // =============================================================================
  // DIFFICULTY PROGRESSION - Hệ thống khó dần (DỄ HƠN RẤT NHIỀU)
  // =============================================================================
  difficulty: {
    baseSpawnInterval: 100, // (TĂNG) Từ 80 -> 100: Thiên thạch ban đầu xuất hiện chậm hơn.
    minSpawnInterval: 30, // (TĂNG) Từ 20 -> 30: Giữ khoảng cách tối thiểu lớn hơn (dễ hơn).
    spawnDecreaseStep: 0.8, // (GIẢM) Từ 1.0 -> 0.8: Độ khó tăng chậm hơn.

    baseSpeed: 0.4, // (GIẢM) Từ 0.5 -> 0.4: Tốc độ ban đầu của vật thể chậm hơn.
    speedIncreaseStep: 0.03, // (GIẢM) Từ 0.05 -> 0.03: Tốc độ tăng theo level chậm hơn.
    microSpeedIncrease: 0.005, // (GIẢM) Từ 0.01 -> 0.005: Tăng tốc độ theo thời gian rất chậm.

    levelUpInterval: 30,
    microProgressInterval: 1200, // (TĂNG) Micro-progress xảy ra chậm hơn.

    scorePerLevel: 2000, // (GIẢM) Từ 3000 -> 2000: Lên cấp nhanh hơn để tăng điểm thưởng.
  },

  // =============================================================================
  // ASTEROID SETTINGS - Cài đặt thiên thạch (NHỎ HƠN & DỄ HƠN)
  // =============================================================================
  asteroids: {
    minRadius: 8, // (GIẢM) Từ 12 -> 8: Kích thước nhỏ nhất giảm.
    maxRadius: 25, // (GIẢM) Từ 40 -> 25: Kích thước tối đa giảm.
    baseSpeed: 0.8, // (GIẢM) Từ 1.0 -> 0.8: Tốc độ cơ bản chậm hơn.
    speedIncreasePerLevel: 0.2, // (GIẢM) Từ 0.4 -> 0.2: Tăng tốc độ theo level chậm hơn.
    fragmentSpeed: 0.98, // (GIẢM) Fragment biến mất nhanh hơn.
    colors: ["#ff4444", "#ffbb33", "#99cc00"],
    spawnPatterns: {
      topDown: 0.7,
      slightAngle: 0.2,
      diagonal: 0.1,
    },
  },

  // =============================================================================
  // BLACK HOLE SETTINGS - Cài đặt hố đen (NHỎ HƠN & YẾU HƠN)
  // =============================================================================
  blackHoles: {
    spawnScore: 4000, // (TĂNG) Từ 3000 -> 4000: Xuất hiện muộn hơn.
    spawnInterval: 1200, // (TĂNG) Từ 1000 -> 1200: Xuất hiện ít thường xuyên hơn.
    warningDuration: 240, // (TĂNG) Từ 180 -> 240: Thời gian cảnh báo lâu hơn (4 giây).

    baseRadius: 5, // (GIẢM) Từ 8 -> 5: Bán kính tối thiểu nhỏ hơn.
    baseMaxRadius: 30, // (GIẢM) Từ 50 -> 30: Bán kính tối đa nhỏ hơn.
    radiusIncreasePerLevel: 10, // (GIẢM) Từ 15 -> 10: Tăng kích thước theo level chậm hơn.

    baseGravityRadius: 80, // (GIẢM) Từ 120 -> 80: Phạm vi lực hút nhỏ hơn.
    gravityRadiusIncreasePerLevel: 20, // (GIẢM) Từ 30 -> 20: Tăng phạm vi chậm hơn.

    baseStrength: 0.015, // (GIẢM) Từ 0.02 -> 0.015: Lực hút yếu hơn.

    baseGrowthRate: 0.025,
    growthRateIncreasePerLevel: 0.03,

    playerForceMultiplier: 1.8,
    shakeThreshold: 0.7,
    shakeIntensity: 0.05,

    temporaryLifetime: 300, // (TĂNG) Từ 200 -> 300: Tồn tại lâu hơn một chút (đối với sự kiện).
  },

  // =============================================================================
  // MISSILE SETTINGS - Cài đặt tên lửa (NHỎ HƠN & CHẬM HƠN)
  // =============================================================================
  missiles: {
    spawnScore: 2500, // (TĂNG) Từ 1500 -> 2500: Xuất hiện muộn hơn.
    spawnInterval: 900, // (TĂNG) Từ 700 -> 900: Xuất hiện ít thường xuyên hơn.
    warningDuration: 200, // (TĂNG) Từ 150 -> 200: Thời gian cảnh báo lâu hơn.

    radius: 4, // (GIẢM) Từ 5 -> 4: Kích thước tên lửa nhỏ hơn.
    baseSpeed: 0.15, // (GIẢM) Từ 0.18 -> 0.15: Tốc độ cơ bản chậm hơn.
    speedIncreasePerLevel: 0.025,

    baseTurnSpeed: 0.015, // (GIẢM) Từ 0.02 -> 0.015: Tốc độ xoay chậm hơn.
    turnSpeedIncreasePerLevel: 0.01, // (GIẢM) Tốc độ xoay tăng chậm hơn.

    speedUpTime: 450, // (TĂNG) Từ 350 -> 450: Tăng tốc muộn hơn.
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
  // LASER SETTINGS (CHUNG) - Cài đặt laser (DỄ NÉ HƠN)
  // =============================================================================
  lasers: {
    spawnScore: 6000, // (TĂNG) Từ 4500 -> 6000: Xuất hiện muộn hơn.
    baseInterval: 450,
    intervalDecreasePerLevel: 25,
    minInterval: 80, // (TĂNG) Từ 60 -> 80: Tần suất tối thiểu thấp hơn.

    maxConcurrent: 1,
    lasersPerLevel: 4, // (GIẢM) Tăng số lượng laser theo level chậm hơn.

    baseTargetChance: 0.1,
    targetChanceIncreasePerLevel: 0.08,
    maxTargetChance: 0.85,

    warningTime: 300, // (TĂNG) Từ 240 -> 300: Cảnh báo lâu hơn (5 giây).
    beamDuration: 15, // (TĂNG) Từ 10 -> 15: Thời gian laser tồn tại lâu hơn một chút.
    staggerDelay: 200, // (TĂNG) Từ 150 -> 200: Khoảng cách giữa các tia laser dài hơn.

    playerHitRadius: 5, // (GIẢM) Từ 7.5 -> 5: Phạm vi va chạm nhỏ hơn.
  },

  // =============================================================================
  // FRAGMENT SETTINGS - Cài đặt mảnh vỡ (NHỎ HƠN & ÍT NGUY HIỂM HƠN)
  // =============================================================================
  fragments: {
    minRadius: 1, // (GIẢM) Từ 2 -> 1.
    maxRadius: 3, // (GIẢM) Từ 5 -> 3.
    minLife: 100,
    maxLife: 150,
    gravity: 0.1,
    airResistance: 0.98,
    rotationSpeed: 0.2,
    color: "#ffbb33",
    shadowBlur: 5,
    explosionParticles: 6,
    scoreBonus: 20, // (TĂNG) Từ 15 -> 20: Dễ kiếm điểm hơn.

    missileFragments: {
      minRadius: 2, // (GIẢM)
      maxRadius: 4, // (GIẢM)
      minLife: 80,
      maxLife: 120,
      color: "#f48fb1",
      speed: 4,
      lethal: false, // (THAY ĐỔI) Từ true -> false: Mảnh vỡ tên lửa không còn gây chết ngay lập tức.
    },
  },

  // =============================================================================
  // LASER MINE SETTINGS - Cài đặt mìn laser (ÍT XUẤT HIỆN HƠN)
  // =============================================================================
  laserMines: {
    spawnScore: 10000, // (TĂNG) Từ 8000 -> 10000: Xuất hiện muộn hơn.
    spawnInterval: 600, // (TĂNG) Từ 500 -> 600: Xuất hiện chậm hơn.
    warningDuration: 100,
    radius: 10,
    chargeTime: 120,
    fireDuration: 15,
    patterns: ["cross", "diagonal", "star"],
    beamWidth: 10,
    warningOpacity: 0.3,
  },

  // =============================================================================
  // CRYSTAL CLUSTER SETTINGS - Cài đặt cụm pha lê (DỄ KIẾM HƠN)
  // =============================================================================
  crystalClusters: {
    spawnScore: 1500, // (GIẢM) Từ 2000 -> 1500: Xuất hiện sớm hơn.
    spawnInterval: 600, // (GIẢM) Từ 800 -> 600: Xuất hiện thường xuyên hơn.
    radius: 8, // (GIẢM) Từ 10 -> 8: Kích thước nhỏ hơn.
    lifetime: 400, // (TĂNG) Tồn tại lâu hơn.
    crystalCount: 8, // (TĂNG) Từ 6 -> 8: Cung cấp nhiều tinh thể hơn (tăng điểm/shield).
    colors: ["#40c4ff", "#81d4fa"],
    pulseSpeed: 0.15,
    rotationSpeed: 0.02,
  },

  // =============================================================================
  // EVENT SYSTEM - Hệ thống sự kiện (ÍT XẢY RA HƠN)
  // =============================================================================
  events: {
    interval: 5000, // (TĂNG) Từ 4000 -> 5000: Sự kiện xảy ra ít thường xuyên hơn.
    duration: 4000, // (GIẢM) Từ 5000 -> 4000: Sự kiện kết thúc nhanh hơn.

    unlockThresholds: {
      crystalRain: 300, // (GIẢM) Từ 500 -> 300: Sự kiện lợi ích xảy ra sớm hơn.
      shieldGenerator: 1000,
      asteroidShower: 3000, // (TĂNG) Từ 2000 -> 3000: Sự kiện nguy hiểm xảy ra muộn hơn.
      asteroidCircle: 3000,
      meteorBombardment: 4000,
      magneticStorm: 6000, // (TĂNG) Từ 4500 -> 6000:
      freezeZone: 7000, // (TĂNG) Từ 5000 -> 7000:
      missileBarrage: 8000, // (TĂNG) Từ 6500 -> 8000:
      laserGrid: 9000, // (TĂNG) Từ 7000 -> 9000:
      blackHoleChain: 10000,
      plasmaStorm: 11000,
      superNova: 15000, // (TĂNG) Từ 12000 -> 15000:
      voidRifts: 15000,
    },

    denseField: { spawnInterval: 35 },
    speedZone: { speedMultiplier: 1.4 },
    laserSwarm: { laserCount: 6, targetChance: 0.6, delay: 200 },
    laserGrid: {
      gridSize: 3, // (GIẢM) Từ 4 -> 3: Lưới laser nhỏ hơn.
      delay: 350, // (TĂNG) Từ 250 -> 350: Lưới laser triển khai chậm hơn.
    },
    asteroidRain: {
      count: 15, // (GIẢM) Từ 18 -> 15: Số lượng ít hơn.
      delay: 180,
      minRadius: 6,
      maxRadius: 30,
      speedMultiplier: 1.5, // (GIẢM) Từ 2.2 -> 1.5: Tốc độ chậm hơn.
      speedVariation: 3.5,
    },
    asteroidCircle: {
      count: 10, // (GIẢM) Từ 12 -> 10: Số lượng ít hơn.
      radius: 150, // (GIẢM) Từ 180 -> 150: Vòng tròn nhỏ hơn.
      warningTime: 240, // (TĂNG) Từ 180 -> 240: Thời gian cảnh báo lâu hơn.
      asteroidRadius: 15,
      speed: 1.5,
      centerVariation: 50,
    },
    missileBarrage: { count: 3, delay: 700 }, // (GIẢM COUNT, TĂNG DELAY)
    blackHoleChain: { count: 2, delay: 1500, warningDelay: 3000 }, // (GIẢM COUNT, TĂNG DELAY)
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

    superNova: {
      maxRadius: 400,
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

      particleMinCount: 4,
      particleRadiusStep: 30,
    },

    freezeZone: {
      count: 4,
      radius: 80, // (GIẢM) Từ 100 -> 80: Vùng đóng băng nhỏ hơn.
      slowFactor: 0.4, // (TĂNG) Từ 0.3 -> 0.4: Hiệu ứng chậm yếu hơn.
      duration: 200,
    },
    magneticStorm: {
      lifetime: 480,
      maxIntensity: 1.0, // (GIẢM) Từ 1.2 -> 1.0: Cường độ từ trường yếu hơn.
      fieldCount: 4,
      fieldRadius: 80, // (GIẢM) Từ 120 -> 80: Phạm vi từ trường nhỏ hơn.
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
      fireInterval: 120, // (TĂNG) Từ 90 -> 120: Bắn chậm hơn.
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
  // NEW OBJECTS - Cấu hình chi tiết cho các vật thể mới (NHỎ HƠN)
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
      radius: 80, // (GIẢM) Từ 100 -> 80: Vùng đóng băng nhỏ hơn.
      effectStrength: 0.4, // (TĂNG) Từ 0.3 -> 0.4: Hiệu ứng chậm yếu hơn.
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
      freezeChance: 0.005,
      missileFreezeChance: 0.01,
      fullFreezeFactor: 0.1,
      crystalSpawnDistance: 20,
      crystalSpawnFactor: 0.7,
      duration: 300,
    },

    laserTurret: {
      radius: 15, // (GIẢM) Từ 20 -> 15: Turret nhỏ hơn.
      barrelLength: 30,
      rotationSpeed: 0.05,
      trackingRange: 150, // (GIẢM) Từ 200 -> 150: Tầm bắn ngắn hơn.
      fireInterval: 120, // (TĂNG) Từ 90 -> 120: Bắn chậm hơn.
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

    magneticStorm: {
      lifetime: 480,
      maxIntensity: 1.0, // (GIẢM) Từ 1.2 -> 1.0: Cường độ từ trường yếu hơn.
      fieldCount: 4,
      baseStrength: 0.5,
      strengthVariation: 0.8,
      fieldRadius: 80, // (GIẢM) Từ 100 -> 80: Phạm vi từ trường nhỏ hơn.
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
      chargeColor: "#88ddff",
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

    plasmaField: {
      radius: 70, // (GIẢM) Từ 80 -> 70: Vùng plasma nhỏ hơn.
      lifetime: 400,
      damageRate: 0.015, // (GIẢM) Từ 0.02 -> 0.015: Sát thương ít hơn.
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
  // AUDIO SETTINGS - Cài đặt âm thanh
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
  // SCORING SYSTEM - Hệ thống điểm số (DỄ LẤY ĐIỂM HƠN)
  // =============================================================================
  scoring: {
    movementMultiplier: 0.6, // (TĂNG) Từ 0.4 -> 0.6: Tăng điểm nhận được từ di chuyển.
    asteroidDestroy: 35, // (TĂNG) Từ 25 -> 35: Tăng điểm khi phá hủy thiên thạch.
    survivalBonus: 0,
    baseMovementThreshold: 3, // (GIẢM) Từ 5 -> 3: Dễ đạt ngưỡng tăng điểm khi di chuyển hơn.
    minMovementThreshold: 2,
    thresholdDecreasePerLevel: 0.5,
    thresholdDecreaseRate: 0.9, // (GIẢM) Từ 0.95 -> 0.9: Ngưỡng điểm giảm nhanh hơn theo level.
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

// Ghi đè biến toàn cục GAME_CONFIG (giả định đây là file config di động)
if (typeof window !== "undefined") {
  console.log("Loading MOBILE EASY MODE game configuration...");
  window.GAME_CONFIG = GAME_CONFIG_MOBILE;
}
