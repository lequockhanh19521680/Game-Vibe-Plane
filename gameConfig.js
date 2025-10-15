// =============================================================================
// STELLAR DRIFT: SINGULARITY - GAME CONFIGURATION
// =============================================================================
// Game Designer Config File - Điều chỉnh tất cả thông số game tại đây
// =============================================================================

const GAME_CONFIG = {
  // =============================================================================
  // PLAYER SETTINGS - Cài đặt người chơi
  // =============================================================================
  player: {
    radius: 15, // Kích thước player
    responsiveness: 0.15, // Độ nhạy điều khiển (0.1 = chậm, 0.2 = nhanh)
    friction: 0.95, // Ma sát tự nhiên (0.9 = nhiều, 0.99 = ít)
    trailLength: 20, // Độ dài vệt khói
    trailFadeSpeed: 0.05, // Tốc độ mờ dần vệt khói
  },

  // =============================================================================
  // DIFFICULTY PROGRESSION - Hệ thống khó dần
  // =============================================================================
  difficulty: {
    baseSpawnInterval: 150, // Thời gian spawn ban đầu - tăng từ 120 để dễ thở hơn
    minSpawnInterval: 25, // Thời gian spawn tối thiểu - giảm từ 45 để level cao ngạt thở
    spawnDecreaseStep: 1.5, // Giảm spawn interval mỗi lần - giảm từ 2 để chậm hơn

    baseSpeed: 0.6, // Tốc độ cơ bản - giảm từ 0.8 để đầu dễ hơn
    speedIncreaseStep: 0.06, // Tăng tốc độ mỗi level - tăng từ 0.04 để level cao khó hơn
    microSpeedIncrease: 0.01, // Tăng tốc độ nhỏ liên tục - giảm từ 0.015

    levelUpInterval: 1800, // Điểm để lên level - tăng từ 1200 để dãn ra nhiều hơn
    microProgressInterval: 900, // Frame để tăng khó nhỏ - tăng từ 800
  },

  // =============================================================================
  // ASTEROID SETTINGS - Cài đặt thiên thạch
  // =============================================================================
  asteroids: {
    minRadius: 10, // Kích thước tối thiểu - giảm từ 12 để đầu dễ hơn
    maxRadius: 45, // Kích thước tối đa - tăng từ 35 để level cao khó hơn
    baseSpeed: 0.5, // Tốc độ cơ bản - giảm từ 0.7 để đầu dễ hơn
    speedVariation: 1.2, // Biến thiên tốc độ - giảm từ 1.5
    speedIncreasePerLevel: 0.35, // Tăng tốc độ mỗi level - tăng từ 0.2 để level cao ngạt thở
    fragmentSpeed: 0.99, // Tốc độ giảm của mảnh vỡ
    colors: ["#ff4444", "#ffbb33", "#99cc00"], // Màu sắc

    // Spawn patterns - Thiên thạch rơi từ trên xuống
    spawnPatterns: {
      topDown: 0.7, // 70% - Straight down from top
      slightAngle: 0.2, // 20% - Slight angle from top
      diagonal: 0.1, // 10% - Diagonal from corners
    },
  },

  // =============================================================================
  // BLACK HOLE SETTINGS - Cài đặt hố đen
  // =============================================================================
  blackHoles: {
    spawnScore: 500, // Điểm bắt đầu xuất hiện - giảm mạnh để xuất hiện sớm
    spawnInterval: 900, // Khoảng cách spawn - tăng từ 800 để ít hơn ở đầu
    warningDuration: 180, // Thời gian cảnh báo - tăng từ 150 để chuẩn bị tốt hơn
    warningDelay: 3000, // Delay sau cảnh báo - tăng từ 2500

    baseRadius: 6, // Bán kính ban đầu - giảm từ 8 để đầu dễ hơn
    baseMaxRadius: 60, // Bán kính tối đa ban đầu - tăng từ 45 để level cao khó hơn
    radiusIncreasePerLevel: 12, // Tăng radius mỗi level - tăng từ 8 để level cao ngạt thở

    baseGravityRadius: 110, // Vùng hấp dẫn ban đầu - giảm từ 130 để đầu dễ
    gravityRadiusIncreasePerLevel: 25, // Tăng vùng hấp dẫn mỗi level - tăng từ 15

    baseStrength: 0.025, // Sức hấp dẫn cơ bản - giảm từ 0.035 để đầu dễ
    strengthIncreasePerLevel: 0.015, // Tăng sức hấp dẫn mỗi level - tăng từ 0.008

    baseGrowthRate: 0.03, // Tốc độ lớn cơ bản - giảm từ 0.04
    growthRateIncreasePerLevel: 0.025, // Tăng tốc độ lớn mỗi level - tăng từ 0.015

    playerForceMultiplier: 1.8, // Hệ số lực tác dụng lên player - giảm từ 2.0
    shakeThreshold: 0.7, // Ngưỡng gây rung màn hình
    shakeIntensity: 0.05, // Cường độ rung

    temporaryLifetime: 200, // Tuổi thọ hố đen tạm thời - giảm từ 250
  },

  // =============================================================================
  // MISSILE SETTINGS - Cài đặt tên lửa
  // =============================================================================
  missiles: {
    spawnScore: 800, // Điểm bắt đầu xuất hiện - giảm mạnh để đa dạng
    spawnInterval: 600, // Khoảng cách spawn
    warningDuration: 150, // Thời gian cảnh báo
    warningDelay: 2500, // Delay sau cảnh báo

    radius: 5, // Kích thước
    baseSpeed: 0.045, // Tốc độ cơ bản - nhanh hơn xíu
    speedIncreasePerLevel: 0.03, // Tăng tốc độ mỗi level

    baseTurnSpeed: 0.025, // Tốc độ rẽ cơ bản - nhanh hơn
    turnSpeedIncreasePerLevel: 0.01, // Tăng tốc độ rẽ mỗi level

    speedUpTime: 250, // Thời gian để tăng tốc
    speedUpMultiplier: 1.8, // Hệ số tăng tốc - nhanh hơn
    turnSpeedUpMultiplier: 1.5, // Hệ số tăng tốc độ rẽ

    lifetime: 900, // Tuổi thọ - tồn tại nhỏ hơn 1 giây (900 frames = 15 giây @ 60fps)
    fragmentCount: 8, // Số mảnh vỡ khi nổ - giảm từ 10
    fragmentCountOnImpact: 5, // Số mảnh vỡ khi va chạm - giảm từ 6

    velocity: {
      friction: 0.92, // Ma sát - tăng từ 0.88 để dễ điều khiển hơn
    },
  },

  // =============================================================================
  // LASER SETTINGS - Cài đặt laser
  // =============================================================================
  lasers: {
    spawnScore: 1200, // Điểm bắt đầu xuất hiện - giảm mạnh để đa dạng
    baseInterval: 400, // Khoảng cách spawn cơ bản - tăng từ 300 để đầu ít hơn
    intervalDecreasePerLevel: 18, // Giảm interval mỗi level - tăng từ 12 để level cao ngạt thở
    minInterval: 80, // Interval tối thiểu - giảm từ 150 để level cao cực khó

    maxConcurrent: 1, // Số laser tối đa cùng lúc - giảm từ 2 để đầu dễ hơn
    lasersPerLevel: 3, // Chia level để tính số laser - giảm từ 4

    baseTargetChance: 0.15, // Xác suất nhắm mục tiêu cơ bản - giảm từ 0.25 để đầu dễ
    targetChanceIncreasePerLevel: 0.05, // Tăng xác suất mỗi level - tăng từ 0.03
    maxTargetChance: 0.75, // Xác suất tối đa - tăng từ 0.5 để level cao ngạt thở

    warningTime: 150, // Thời gian cảnh báo - tăng từ 120 để đầu dễ hơn
    beamDuration: 20, // Thời gian tồn tại beam - tăng từ 15 để level cao khó hơn
    staggerDelay: 150, // Delay giữa các laser - giảm từ 200 để level cao nhanh hơn

    playerHitRadius: 7.5, // Bán kính va chạm với player
  },

  // =============================================================================
  // FRAGMENT SETTINGS - Cài đặt mảnh vỡ
  // =============================================================================
  fragments: {
    minRadius: 2, // Kích thước tối thiểu
    maxRadius: 5, // Kích thước tối đa
    minLife: 100, // Tuổi thọ tối thiểu (frame)
    maxLife: 150, // Tuổi thọ tối đa (frame)

    gravity: 0.1, // Trọng lực
    airResistance: 0.98, // Sức cản không khí
    rotationSpeed: 0.2, // Tốc độ xoay

    color: "#ffbb33", // Màu sắc
    shadowBlur: 5, // Độ mờ bóng

    explosionParticles: 6, // Số particle khi nổ
    scoreBonus: 15, // Điểm thưởng khi phá hủy asteroid

    // Missile fragment settings
    missileFragments: {
      minRadius: 3, // Kích thước tối thiểu mảnh tên lửa
      maxRadius: 6, // Kích thước tối đa mảnh tên lửa
      minLife: 80, // Tuổi thọ tối thiểu
      maxLife: 120, // Tuổi thọ tối đa
      color: "#f48fb1", // Màu sắc mảnh tên lửa
      speed: 4, // Tốc độ ban đầu
      lethal: true, // Có thể giết player
    },
  },

  // =============================================================================
  // LASER MINE SETTINGS - Cài đặt mìn laser
  // =============================================================================
  laserMines: {
    spawnScore: 1500, // Điểm bắt đầu xuất hiện - giảm mạnh để đa dạng
    spawnInterval: 500, // Khoảng cách spawn
    warningDuration: 100, // Thời gian cảnh báo

    radius: 10, // Kích thước
    chargeTime: 120, // Thời gian charge
    fireDuration: 15, // Thời gian bắn

    patterns: [
      "cross", // Hình thập
      "diagonal", // Chéo
      "star", // Ngôi sao 8 hướng
    ],

    beamWidth: 10, // Độ rộng beam
    warningOpacity: 0.3, // Độ mờ cảnh báo
  },

  // =============================================================================
  // CRYSTAL CLUSTER SETTINGS - Cài đặt cụm pha lê
  // =============================================================================
  crystalClusters: {
    spawnScore: 2000, // Điểm bắt đầu xuất hiện
    spawnInterval: 800, // Khoảng cách spawn

    radius: 20, // Bán kính cluster
    lifetime: 300, // Tuổi thọ (frames)
    crystalCount: 6, // Số pha lê trong cluster

    colors: ["#40c4ff", "#81d4fa"], // Màu sắc pha lê
    pulseSpeed: 0.15, // Tốc độ pulse
    rotationSpeed: 0.02, // Tốc độ xoay
  },

  // =============================================================================
  // EVENT SYSTEM - Hệ thống sự kiện
  // =============================================================================
  events: {
    interval: 3000, // Khoảng cách sự kiện - tăng mạnh để giãn ra nhiều
    duration: 5000, // Thời gian hiển thị message (ms)

    // Event types - MASSIVELY EXPANDED
    types: [
      "asteroid_shower",
      "asteroid_circle",
      "blackhole_storm",
      "laser_barrage",
      "missile_crisis",
      "mine_field",
      "meteor_shower",
      "wormhole_portal",
      "space_storm",
      "solar_flare",
      "gravity_wave",
      "time_dilation",
      "quantum_shift",
      "plasma_rain",
      "ion_storm",
      "nebula_cloud",
      "comet_tail",
      "pulsar_burst",
      "dark_matter_wave",
      "supernova_shockwave",
      "electromagnetic_pulse",
      "asteroid_belt_collision",
      "galactic_winds",
      "temporal_anomaly",
      "dimensional_rift",
      "starquake",
      "cosmic_radiation",
      "void_breach",
      "energy_cascade",
      "super_nova",
      "plasma_storm",
      "crystal_rain",
      "quantum_tunnels",
      "gravity_wells",
      "energy_barriers",
      "meteor_bombardment",
      "void_rifts",
    ],

    // Event messages - MASSIVELY EXPANDED
    messages: {
      asteroid_shower: "🌠 ASTEROID SHOWER INCOMING!",
      asteroid_circle: "⭕ ASTEROID CIRCLE FORMATION!",
      blackhole_storm: "🕳️ BLACK HOLE STORM!",
      laser_barrage: "⚡ LASER BARRAGE!",
      missile_crisis: "🚀 MISSILE CRISIS!",
      mine_field: "💥 MINE FIELD ACTIVATED!",
      meteor_shower: "☄️ METEOR SHOWER ALERT!",
      wormhole_portal: "🌀 WORMHOLE PORTAL OPENED!",
      space_storm: "⛈️ SPACE STORM BREWING!",
      solar_flare: "☀️ SOLAR FLARE DETECTED!",
      gravity_wave: "🌊 GRAVITY WAVE INCOMING!",
      time_dilation: "⏰ TIME DILATION FIELD!",
      quantum_shift: "🔮 QUANTUM SHIFT ANOMALY!",
      plasma_rain: "🔥 PLASMA RAIN INCOMING!",
      ion_storm: "⚡ ION STORM DETECTED!",
      nebula_cloud: "☁️ NEBULA CLOUD APPROACHING!",
      comet_tail: "☄️ COMET TAIL DEBRIS!",
      pulsar_burst: "📡 PULSAR BURST RADIATION!",
      dark_matter_wave: "🌑 DARK MATTER WAVE!",
      supernova_shockwave: "💥 SUPERNOVA SHOCKWAVE!",
      electromagnetic_pulse: "⚡ EMP SURGE DETECTED!",
      asteroid_belt_collision: "🪨 ASTEROID BELT CHAOS!",
      galactic_winds: "🌪️ GALACTIC WINDS RISING!",
      temporal_anomaly: "⏳ TEMPORAL ANOMALY!",
      dimensional_rift: "🌌 DIMENSIONAL RIFT!",
      starquake: "⭐ STARQUAKE TREMORS!",
      cosmic_radiation: "☢️ COSMIC RADIATION SPIKE!",
      void_breach: "🕳️ VOID BREACH DETECTED!",
      energy_cascade: "⚡ ENERGY CASCADE EVENT!",
      super_nova: "💥 SUPERNOVA SHOCKWAVE!",
      plasma_storm: "🌊 PLASMA STORM SURGE!",
      crystal_rain: "💎 CRYSTAL RAIN SHOWER!",
      quantum_tunnels: "🌀 QUANTUM TUNNEL NETWORK!",
      gravity_wells: "🕳️ GRAVITY WELL FIELD!",
      energy_barriers: "⚡ ENERGY BARRIER GRID!",
      meteor_bombardment: "☄️ METEOR BOMBARDMENT!",
      void_rifts: "🌌 VOID RIFTS OPENING!",
    },

    // Điều kiện mở khóa sự kiện - giảm mạnh để đa dạng ngay từ đầu
    unlockThresholds: {
      laserSwarm: 2000, // level sớm
      gravitationalAnomaly: 2500,
      laserGrid: 3000, // level sớm
      blackHoleChain: 3500,
      missileBarrage: 4000, // level trung bình
      timeWarp: 4500,
      // Events mới - xuất hiện rất sớm
      wormholePortal: 1000, // level rất sớm
      shieldGenerator: 2800, // level sớm
      freezeZone: 1800, // level rất sớm
      magneticStorm: 3800, // level trung bình
      asteroidBelt: 2200, // level sớm
      laserTurrets: 4200, // level trung bình
    },

    // Cài đặt từng sự kiện
    denseField: {
      spawnInterval: 35, // Override spawn interval - tăng từ 30 để ít hơn ở đầu
    },

    speedZone: {
      speedMultiplier: 1.4, // Hệ số tăng tốc - tăng từ 1.3 để khó hơn
    },

    timeWarp: {
      speedMultiplier: 2.2, // Hệ số tăng tốc extreme - tăng từ 1.7 để ngạt thở
    },

    laserSwarm: {
      laserCount: 6, // Số laser - tăng từ 4 để level trung bình khó hơn
      targetChance: 0.6, // Xác suất nhắm mục tiêu - tăng từ 0.4
      delay: 200, // Delay giữa các laser - giảm từ 300 để nhanh hơn
    },

    laserGrid: {
      gridSize: 9, // Kích thước lưới - tăng từ 6 để level cao ngạt thở
      delay: 150, // Delay giữa các laser - giảm từ 250 để nhanh hơn
    },

    asteroidRain: {
      count: 18, // Số thiên thạch - tăng từ 12 để khó hơn
      delay: 180, // Delay giữa các thiên thạch - giảm từ 250 để nhanh hơn
      minRadius: 6, // Kích thước tối thiểu - giảm từ 8 để nhiều hơn
      maxRadius: 30, // Kích thước tối đa - tăng từ 22 để khó tránh hơn
      speedMultiplier: 2.2, // Hệ số tốc độ - tăng từ 1.6
      speedVariation: 3.5, // Biến thiên tốc độ - tăng từ 2.5
    },

    asteroidCircle: {
      count: 12, // Số thiên thạch trong vòng tròn
      radius: 180, // Bán kính vòng tròn
      warningTime: 180, // Thời gian warning (3 giây)
      asteroidRadius: 15, // Kích thước thiên thạch
      speed: 1.5, // Tốc độ di chuyển vào trong
      centerVariation: 50, // Độ lệch trung tâm
    },

    missileBarrage: {
      count: 5, // Số tên lửa - tăng từ 3 để level rất cao ngạt thở
      delay: 500, // Delay giữa các tên lửa - giảm từ 700 để nhanh hơn
    },

    blackHoleChain: {
      count: 3, // Số hố đen
      delay: 1000, // Delay giữa các hố đen (ms)
      warningDelay: 2000, // Delay sau cảnh báo (ms)
    },

    gravitationalAnomaly: {
      blackHoleCount: 2, // Số hố đen tạm thời
    },

    // Events mới
    wormholePortal: {
      count: 3, // Số wormhole
      lifetime: 600, // Tuổi thọ wormhole (10 giây)
      shootInterval: 120, // Khoảng cách bắn (2 giây)
      asteroidSpeed: 4, // Tốc độ thiên thạch từ wormhole
    },

    shieldGenerator: {
      count: 3, // Số shield generator
      lifetime: 300, // Tuổi thọ
      shieldRadius: 80, // Bán kính shield
      chargeTime: 60, // Thời gian charge
    },

    freezeZone: {
      count: 4, // Số vùng đóng băng
      radius: 100, // Bán kính vùng ảnh hưởng
      slowFactor: 0.3, // Hệ số chậm lại (30% tốc độ)
      duration: 200, // Thời gian tồn tại
    },

    magneticStorm: {
      lifetime: 480, // 8 giây
      maxIntensity: 1.2, // Cường độ tối đa
      fieldCount: 4, // Số từ trường
      fieldRadius: 120, // Bán kính từ trường
      playerAffectMultiplier: 0.3, // Ảnh hưởng lên player
      objectAffectMultiplier: 0.5, // Ảnh hưởng lên objects
    },

    asteroidBelt: {
      count: 20, // Số thiên thạch trong belt
      beltRadius: 300, // Bán kính quỹ đạo
      rotationSpeed: 0.02, // Tốc độ quay quỹ đạo
      asteroidSpeed: 1.5, // Tốc độ thiên thạch
    },

    laserTurrets: {
      count: 4, // Số turret
      rotationSpeed: 0.05, // Tốc độ xoay turret
      fireInterval: 90, // Khoảng cách bắn (frames)
      laserSpeed: 8, // Tốc độ laser
      lifetime: 300, // Tuổi thọ turret
    },

    // Events mới
    plasmaStorm: {
      count: 8, // Số plasma field
      duration: 400, // Thời gian tồn tại
      intensity: 0.8, // Cường độ plasma
    },

    crystalRain: {
      count: 32, // Số crystal shard (tăng để có nhiều cluster)
      delay: 80, // Delay giữa các crystal (chậm hơn để tạo formation)
      clusterSize: 8, // Số crystal mỗi cluster
      driftSpeed: 1.2, // Tốc độ trôi dạt
    },

    quantumTunnels: {
      count: 3, // Số cặp tunnel
      lifetime: 350, // Tuổi thọ tunnel
      teleportForce: 0.9, // Lực hút vào tunnel
    },

    gravityWells: {
      count: 5, // Số gravity well
      radius: 80, // Bán kính hấp dẫn
      strength: 0.08, // Sức hấp dẫn
      lifetime: 300, // Tuổi thọ
    },

    meteorBombardment: {
      count: 15, // Số meteor
      delay: 80, // Delay giữa các meteor
      speed: 4, // Tốc độ meteor
      explosionRadius: 40, // Bán kính nổ
    },

    voidRifts: {
      count: 4, // Số void rift
      radius: 60, // Bán kính rift
      pullStrength: 0.12, // Sức hút
      lifetime: 280, // Tuổi thọ
    },

    superNova: {
      maxRadius: 300, // Bán kính tối đa shockwave
      expansionSpeed: 8, // Tốc độ mở rộng
      lifetime: 120, // Thời gian tồn tại (2 giây)
      clearBonus: 10, // Điểm thưởng khi clear object
    },
  },

  // =============================================================================
  // NEW OBJECTS - Các vật thể mới
  // =============================================================================
  newObjects: {
    wormhole: {
      radius: 25, // Bán kính
      attractRadius: 100, // Bán kính hút
      attractForce: 0.15, // Lực hút
      teleportRadius: 20, // Bán kính teleport
      color: "#9c27b0", // Màu tím
      rotationSpeed: 0.1, // Tốc độ xoay
    },

    shieldGenerator: {
      radius: 15, // Bán kính generator
      shieldRadius: 80, // Bán kính shield
      chargeTime: 60, // Thời gian charge
      activeTime: 180, // Thời gian hoạt động
      color: "#2196f3", // Màu xanh
      shieldColor: "#4fc3f7", // Màu shield
    },

    freezeZone: {
      radius: 100, // Bán kính vùng đông lạnh
      effectStrength: 0.3, // Độ mạnh hiệu ứng
      particleCount: 20, // Số particle tuyết
      color: "#81d4fa", // Màu xanh nhạt
      pulseSpeed: 0.05, // Tốc độ pulse
    },

    laserTurret: {
      radius: 20, // Bán kính turret
      barrelLength: 30, // Độ dài nòng
      rotationSpeed: 0.05, // Tốc độ xoay
      trackingRange: 200, // Tầm theo dõi
      fireInterval: 90, // Khoảng cách bắn
      laserDamage: 1, // Sát thương laser
      color: "#ff5722", // Màu đỏ cam
    },

    magneticField: {
      radius: 150, // Bán kính từ trường
      strength: 0.08, // Cường độ từ trường
      pulseFrequency: 30, // Tần suất pulse
      color: "#e91e63", // Màu hồng
      particleCount: 15, // Số particle từ trường
    },
  },

  // =============================================================================
  // AUDIO SETTINGS - Cài đặt âm thanh
  // =============================================================================
  audio: {
    masterVolume: 1.0, // Âm lượng chung

    // Volume cho từng loại âm thanh
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
      // Âm thanh mới
      blackholeGrowth: 0.02,
      blackholeDestroy: 0.04,
      fragmentHit: 0.08,
      laserMine: 0.06,
      wormhole: 0.05,
      shield: 0.04,
      freeze: 0.03,
    },

    // Cài đặt nhạc nền
    backgroundMusic: {
      frequencies: [220, 330, 440, 550], // Tần số nốt nhạc
      interval: 1500, // Khoảng cách giữa các nốt (ms)
      duration: 2, // Thời gian mỗi nốt (s)
    },
  },

  // =============================================================================
  // VISUAL SETTINGS - Cài đặt hình ảnh
  // =============================================================================
  visual: {
    // Màu sắc chính
    colors: {
      primary: "#00ffff",
      danger: "#ff4444",
      energy: "#aa66cc",
      highlight: "#ffbb33",
      missile: "#f48fb1",
      crystal: "#40c4ff",
    },

    // Hiệu ứng
    screenShake: {
      duration: 0.3, // Thời gian rung (s)
      laserIntensity: 0.1, // Cường độ rung laser
      explosionIntensity: 0.5, // Cường độ rung nổ
      blackHoleIntensity: 0.05, // Cường độ rung hố đen
      mineIntensity: 0.2, // Cường độ rung mine
      crystalIntensity: 0.3, // Cường độ rung crystal
    },

    // Particles
    particles: {
      explosionCount: 6, // Số particle khi nổ
      explosionSpeed: 6, // Tốc độ particle
      fadeSpeed: 0.02, // Tốc độ mờ dần
    },

    // Nebula
    nebula: {
      count: 5, // Số nebula
      minRadius: 100, // Bán kính tối thiểu
      maxRadius: 300, // Bán kính tối đa
      opacity: 0.05, // Độ mờ
    },

    // Stars
    stars: {
      layers: 3, // Số lớp sao
      starsPerLayer: 80, // Số sao mỗi lớp
      maxRadius: 1.5, // Bán kính tối đa
    },
  },

  // =============================================================================
  // UI SETTINGS - Cài đặt giao diện
  // =============================================================================
  ui: {
    eventText: {
      duration: 2000, // Thời gian hiển thị (ms)
      fontSize: "2.5rem", // Kích thước font
    },

    warning: {
      radius: 30, // Bán kính cảnh báo
      pulseIntensity: 15, // Cường độ pulse
      pulseSpeed: 0.3, // Tốc độ pulse
      fadeInTime: 20, // Thời gian fade in (frame)
      fadeOutTime: 20, // Thời gian fade out (frame)
    },
  },

  // =============================================================================
  // SCORING SYSTEM - Hệ thống điểm số (chỉ tăng điểm khi di chuyển)
  // =============================================================================
  scoring: {
    movementMultiplier: 0.2, // Điểm từ di chuyển - tăng từ 0.12 để bù trừ việc bỏ survival bonus
    asteroidDestroy: 25, // Điểm phá hủy thiên thạch - khuyến khích phá hủy
    survivalBonus: 0, // Điểm sống sót - bỏ hoàn toàn, chỉ tăng điểm khi di chuyển

    // Dynamic movement threshold - giảm dần theo level
    baseMovementThreshold: 15, // Ngưỡng tối thiểu pixel ban đầu (level 1)
    minMovementThreshold: 2, // Ngưỡng tối thiểu tuyệt đối (level cao)
    thresholdDecreasePerLevel: 0.5, // Giảm threshold mỗi level
    thresholdDecreaseRate: 0.95, // Hệ số giảm dần (exponential decay)
  },

  // =============================================================================
  // ADVANCED SETTINGS - Cài đặt nâng cao
  // =============================================================================
  advanced: {
    // Hiệu suất
    maxParticles: 100, // Số particle tối đa
    maxFragments: 50, // Số fragment tối đa

    // Collision detection
    collisionPrecision: 1, // Độ chính xác va chạm

    // Animation
    targetFPS: 60, // FPS mục tiêu

    // Storage
    localStorageKey: "stellarDriftHighScore", // Key lưu high score
  },
};

// Export cho sử dụng
if (typeof module !== "undefined" && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}
