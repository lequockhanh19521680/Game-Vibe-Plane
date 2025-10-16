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
    radius: 15, // Kích thước player - giữ nguyên
    responsiveness: 0.12, // Độ nhạy điều khiển - giảm để khó điều khiển hơn
    friction: 0.92, // Ma sát tự nhiên - giảm để khó điều khiển hơn
    trailLength: 20, // Độ dài vệt khói
    trailFadeSpeed: 0.05, // Tốc độ mờ dần vệt khói
    initialShieldDuration: 0, // Thời gian khiên ban đầu (đã tắt)
  },

  // =============================================================================
  // DIFFICULTY PROGRESSION - Hệ thống khó dần
  // =============================================================================
  difficulty: {
    baseSpawnInterval: 60, // Thời gian spawn ban đầu - giảm từ 85 xuống 60 để thiên thạch xuất hiện nhiều hơn
    minSpawnInterval: 30, // Thời gian spawn tối thiểu - giảm từ 40 xuống 30 để thiên thạch liên tục xuất hiện
    spawnDecreaseStep: 0.8, // Giảm spawn interval mỗi lần - tăng từ 0.7 lên 0.8 để nhanh chóng tăng mật độ thiên thạch

    baseSpeed: 1.2, // Tốc độ cơ bản - tăng mạnh từ 0.9 lên 1.2 để đầu game khó hơn
    speedIncreaseStep: 0.018, // Tăng tốc độ mỗi level - giảm từ 0.03 xuống 0.018 để độ khó tăng chậm hơn
    microSpeedIncrease: 0.003, // Tăng tốc độ nhỏ liên tục - giảm từ 0.005 xuống 0.003 để độ khó tăng chậm hơn

    levelUpInterval: 30, // Giây để lên level - giữ nguyên
    microProgressInterval: 1500, // Frame để tăng khó nhỏ - tăng từ 1200 lên 1500 để độ khó tăng chậm hơn
  },

  // =============================================================================
  // ASTEROID SETTINGS - Cài đặt thiên thạch
  // =============================================================================
  asteroids: {
    minRadius: 15, // Kích thước tối thiểu - tăng để khó né hơn
    maxRadius: 40, // Kích thước tối đa - giảm để không quá khó về sau
    baseSpeed: 3.8, // Tốc độ cơ bản - tăng rất mạnh để đầu game khó hơn nhiều (từ 2.2 lên 3.8)
    speedVariation: 1.8, // Biến thiên tốc độ - tăng lên để đa dạng hơn (từ 1.5 lên 1.8)
    speedIncreasePerLevel: 0.08, // Tăng tốc độ mỗi level - giảm nhiều để độ khó tăng chậm hơn (từ 0.15 xuống 0.08)
    fragmentSpeed: 0.99, // Tốc độ giảm của mảnh vỡ - giữ nguyên
    colors: ["#ff4444", "#ffbb33", "#99cc00"], // Màu sắc - giữ nguyên

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
    spawnScore: 250, // Điểm bắt đầu xuất hiện - giảm mạnh để xuất hiện sớm hơn nữa
    spawnInterval: 700, // Khoảng cách spawn - giảm để hố đen xuất hiện thường xuyên hơn
    warningDuration: 120, // Thời gian cảnh báo - giảm để khó tránh hơn
    warningDelay: 2000, // Delay sau cảnh báo - giảm để khó chuẩn bị hơn

    baseRadius: 10, // Bán kính ban đầu - tăng lên để đầu game khó hơn
    baseMaxRadius: 50, // Bán kính tối đa ban đầu - giảm để không quá khó về sau
    radiusIncreasePerLevel: 5, // Tăng radius mỗi level - giảm để độ khó tăng chậm hơn

    baseGravityRadius: 150, // Vùng hấp dẫn ban đầu - tăng để đầu game khó hơn
    gravityRadiusIncreasePerLevel: 10, // Tăng vùng hấp dẫn mỗi level - giảm để độ khó tăng chậm hơn

    baseStrength: 0.04, // Sức hấp dẫn cơ bản - tăng để đầu game khó hơn
    strengthIncreasePerLevel: 0.008, // Tăng sức hấp dẫn mỗi level - giảm để độ khó tăng chậm hơn

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
    spawnScore: 400, // Điểm bắt đầu xuất hiện - giảm mạnh để xuất hiện sớm hơn
    spawnInterval: 450, // Khoảng cách spawn - giảm để tên lửa xuất hiện thường xuyên hơn
    warningDuration: 100, // Thời gian cảnh báo - giảm để khó chuẩn bị hơn
    warningDelay: 1800, // Delay sau cảnh báo - giảm để khó chuẩn bị hơn

    radius: 6, // Kích thước - tăng để khó né hơn
    baseSpeed: 0.3, // Tốc độ cơ bản - tăng mạnh để đầu game khó hơn
    speedIncreasePerLevel: 0.015, // Tăng tốc độ mỗi level - giảm để độ khó tăng chậm hơn

    baseTurnSpeed: 0.04, // Tốc độ rẽ cơ bản - tăng để đầu game khó hơn
    turnSpeedIncreasePerLevel: 0.007, // Tăng tốc độ rẽ mỗi level - giảm để độ khó tăng chậm hơn

    speedUpTime: 350, // Thời gian để tăng tốc
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
    spawnScore: 600, // Điểm bắt đầu xuất hiện - giảm mạnh để xuất hiện sớm hơn
    baseInterval: 300, // Khoảng cách spawn cơ bản - giảm để đầu game khó hơn
    intervalDecreasePerLevel: 10, // Giảm interval mỗi level - giảm để độ khó tăng chậm hơn
    minInterval: 120, // Interval tối thiểu - tăng để level cao không quá khó

    maxConcurrent: 2, // Số laser tối đa cùng lúc - tăng để đầu game khó hơn
    lasersPerLevel: 4, // Chia level để tính số laser - tăng để đa dạng hơn

    baseTargetChance: 0.3, // Xác suất nhắm mục tiêu cơ bản - tăng để đầu game khó hơn
    targetChanceIncreasePerLevel: 0.03, // Tăng xác suất mỗi level - giảm để độ khó tăng chậm hơn
    maxTargetChance: 0.6, // Xác suất tối đa - giảm để level cao không quá khó

    warningTime: 100, // Thời gian cảnh báo - giảm để đầu game khó hơn
    beamDuration: 25, // Thời gian tồn tại beam - tăng để khó tránh hơn
    staggerDelay: 120, // Delay giữa các laser - giảm để nhanh hơn

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
    interval: 1800, // Khoảng cách sự kiện - giảm để sự kiện xuất hiện thường xuyên hơn (từ 3000 xuống 1800)
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
      laserSwarm: 500, // level sớm
      gravitationalAnomaly: 1000,
      laserGrid: 1500, // level sớm
      blackHoleChain: 2000,
      missileBarrage: 2500, // level trung bình
      timeWarp: 3000,
      // Events mới - xuất hiện rất sớm
      wormholePortal: 500, // level rất sớm
      shieldGenerator: 1000, // level sớm
      freezeZone: 1500, // level rất sớm
      magneticStorm: 2000, // level trung bình
      asteroidBelt: 2500, // level sớm
      laserTurrets: 3000, // level trung bình
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
      count: 30, // Số thiên thạch - tăng từ 18 lên 30 để tạo mưa thiên thạch dày đặc hơn
      delay: 120, // Delay giữa các thiên thạch - giảm từ 180 xuống 120 để thiên thạch xuất hiện nhanh hơn
      minRadius: 6, // Kích thước tối thiểu - giữ nguyên
      maxRadius: 25, // Kích thước tối đa - giảm từ 30 xuống 25 để cân bằng với số lượng thiên thạch tăng lên
      speedMultiplier: 4.0, // Hệ số tốc độ - tăng từ 3.5 lên 4.0 để có hiệu ứng mưa thiên thạch nhanh hơn
      speedVariation: 2.8, // Biến thiên tốc độ - tăng từ 2.5 lên 2.8 để tạo thêm biến động tự nhiên
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
      radius: 120, // Bán kính vùng ảnh hưởng (tăng từ 100)
      slowFactor: 0.2, // Hệ số chậm lại (20% tốc độ - hiệu ứng mạnh hơn)
      duration: 450, // Thời gian tồn tại (tăng từ 200 lên 450)
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
      count: 20, // Số crystal shard (giảm từ 32 xuống 20 để dễ thu thập)
      delay: 80, // Delay giữa các crystal (chậm hơn để tạo formation)
      clusterSize: 5, // Số crystal mỗi cluster (giảm từ 8 xuống 5)
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
      thunder: 0.12, // Volume for thunder strike sound
      backgroundMusic: 0.015,
      // Âm thanh không gian
      blackholeGrowth: 0.02,
      blackholeDestroy: 0.04,
      fragmentHit: 0.08,
      laserMine: 0.06,
      wormhole: 0.05,
      shield: 0.04,
      freeze: 0.03,
      // Âm thanh không gian mới
      plasmaStorm: 0.07,
      temporalRift: 0.06,
      quantumFluctuation: 0.05,
      cosmicRadiation: 0.04,
      pulsarBurst: 0.06,
      supernova: 0.09,
      ambientSpace: 0.02,
    },

    // Cài đặt nhạc nền vũ trụ
    backgroundMusic: {
      // Tần số nốt nhạc được điều chỉnh để tạo không gian vũ trụ sâu lắng
      // Sử dụng các tần số hài hòa tự nhiên và quãng mở tạo cảm giác không gian vô tận
      frequencies: [110, 146.83, 196, 220, 293.66, 329.63, 392],

      // Các mẫu âm thanh khác nhau cho cảm giác thay đổi liên tục
      patterns: [
        [0, 2, 4, 6], // Quãng năm và tám tạo cảm giác rộng mở
        [1, 3, 5, 3], // Series dựa trên các quãng bốn tạo cảm giác bí ẩn
        [6, 4, 2, 0], // Dải giảm dần gợi cảm giác về quy mô vũ trụ
        [2, 0, 3, 5], // Mẫu ngẫu nhiên tạo cảm giác không thể dự đoán
      ],

      // Các loại sóng âm khác nhau cho mỗi lớp nhạc nền
      waveTypes: ["sine", "triangle", "sine", "triangle"],

      // Thời gian cài đặt
      interval: 2000, // Khoảng cách giữa các nốt (ms) - kéo dài để tạo cảm giác thời gian vũ trụ
      duration: 3.5, // Thời gian mỗi nốt (s) - kéo dài để âm thanh trôi chảy hơn
      fadeTime: 2, // Thời gian fade để âm thanh mượt mà hơn

      // Cài đặt biến điệu không gian
      spaceModulation: {
        enable: true, // Bật biến điệu không gian
        depth: 3, // Độ sâu biến điệu (Hz)
        speed: 0.1, // Tốc độ biến điệu (Hz)
      },

      // Reverb và không gian
      spatialSettings: {
        reverbLevel: 0.3, // Mức độ âm vang không gian
        stereoWidth: 0.7, // Độ rộng âm thanh stereo (0-1)
      },
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
    movementMultiplier: 0.12, // Giảm xuống từ 0.2 để tăng điểm chậm hơn nhiều
    speedMultiplier: 0.5, // Giảm xuống từ 0.8 để tăng điểm chậm hơn nhiều
    speedMinThreshold: 3, // Thêm ngưỡng tốc độ tối thiểu 3 để yêu cầu di chuyển nhanh hơn
    speedScoreInterval: 30, // Tăng từ 20 lên 30 frames để điểm tăng chậm hơn
    asteroidDestroy: 15, // Giảm điểm phá hủy thiên thạch từ 25 xuống 15
    survivalBonus: 0, // Điểm sống sót - giữ nguyên 0, chỉ tăng điểm khi di chuyển

    // Bỏ ngưỡng cho movement (tăng điểm ngay từ đầu, không cần di chuyển nhiều)
    baseMovementThreshold: 0, // Không còn ngưỡng pixel tối thiểu
    minMovementThreshold: 0, // Không còn ngưỡng tuyệt đối
    thresholdDecreasePerLevel: 0, // Không còn giảm threshold theo level
    thresholdDecreaseRate: 1, // Không còn áp dụng
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
    leaderboardKey: "stellarDriftLeaderboard", // Key lưu leaderboard
  },
};

// Export cho sử dụng
if (typeof module !== "undefined" && module.exports) {
  module.exports = GAME_CONFIG;
} else if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}
