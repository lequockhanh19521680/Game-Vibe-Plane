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
    responsiveness: 0.15, // Độ nhạy điều khiển - tăng lên để dễ điều khiển hơn
    friction: 0.94, // Ma sát tự nhiên - tăng lên để giữ tốc độ di chuyển ổn định hơn
    trailLength: 20, // Độ dài vệt khói
    trailFadeSpeed: 0.05, // Tốc độ mờ dần vệt khói
    initialShieldDuration: 600, // Thời gian khiên ban đầu - tăng từ 5 giây lên 10 giây
    startWithThunderShield: true, // Bắt đầu game với thunder shield
  },

  // =============================================================================
  // DIFFICULTY PROGRESSION - Hệ thống khó dần (PC MODE - EXTREMELY HARD START)
  // =============================================================================
  difficulty: {
    baseSpawnInterval: 40, // GIẢM XUỐNG 40 - Spawn CỰC NHANH ngay từ đầu
    minSpawnInterval: 25, // GIẢM XUỐNG 25 - Cho phép spawn siêu nhanh
    spawnDecreaseStep: 1.0, // TĂNG LÊN 1.0 - Độ khó tăng CỰC NHANH

    baseSpeed: 1.3, // TĂNG LÊN 1.3 - Objects bay CỰC NHANH ngay từ đầu
    speedIncreaseStep: 0.025, // TĂNG LÊN 0.025 - Tốc độ tăng rất nhanh
    microSpeedIncrease: 0.004, // TĂNG LÊN 0.004 - Tăng tốc liên tục nhanh hơn

    levelUpInterval: 30, // Giây để lên level - giữ nguyên
    microProgressInterval: 1200, // GIẢM XUỐNG 1200 - Độ khó tăng CỰC NHANH
  },

  // =============================================================================
  // ASTEROID SETTINGS - Cài đặt thiên thạch (PC MODE - EXTREME)
  // =============================================================================
  asteroids: {
    minRadius: 18, // TĂNG LÊN 18 - Thiên thạch CỰC TO, rất khó né
    maxRadius: 48, // TĂNG LÊN 48 - Kích thước max CỰC LỚN
    baseSpeed: 3.8, // TĂNG LÊN 3.8 - Tốc độ CỰC NHANH ngay từ đầu
    speedVariation: 2.5, // TĂNG LÊN 2.5 - Biến thiên CỰC LỚN, cực khó đoán
    speedIncreasePerLevel: 0.1, // TĂNG LÊN 0.1 - Tăng tốc rất nhanh
    fragmentSpeed: 0.99, // Tốc độ giảm của mảnh vỡ - giữ nguyên
    colors: ["#ff4444", "#ffbb33", "#99cc00"], // Màu sắc - giữ nguyên

    // Spawn patterns - CỰC KHÓ - Rất nhiều góc độ ngẫu nhiên
    spawnPatterns: {
      topDown: 0.35, // 35% - GIẢM thêm để có nhiều góc độ khó đoán
      slightAngle: 0.35, // 35% - TĂNG góc nghiêng
      diagonal: 0.3, // 30% - TĂNG MẠNH rơi từ góc, CỰC KHÓ NÉ
    },
  },

  // =============================================================================
  // BLACK HOLE SETTINGS - Cài đặt hố đen (PC MODE - BRUTAL)
  // =============================================================================
  blackHoles: {
    spawnScore: 150, // GIẢM XUỐNG 150 - Xuất hiện CỰC SỚM
    spawnInterval: 550, // GIẢM XUỐNG 550 - Xuất hiện CỰC THƯỜNG XUYÊN
    warningDuration: 100, // GIẢM XUỐNG 100 - Ít thời gian chuẩn bị
    warningDelay: 1500, // GIẢM XUỐNG 1.5 giây - Ít thời gian phản ứng

    baseRadius: 8, // Bán kính ban đầu - giảm xuống để dễ tránh hơn
    baseMaxRadius: 45, // Bán kính tối đa ban đầu - giảm xuống để dễ tránh hơn
    radiusIncreasePerLevel: 3, // Tăng radius mỗi level - giảm để độ khó tăng chậm hơn

    baseGravityRadius: 120, // Vùng hấp dẫn ban đầu - giảm xuống để dễ thoát hơn
    gravityRadiusIncreasePerLevel: 8, // Tăng vùng hấp dẫn mỗi level - giảm để độ khó tăng chậm hơn

    baseStrength: 0.03, // Sức hấp dẫn cơ bản - giảm để dễ thoát hơn
    strengthIncreasePerLevel: 0.005, // Tăng sức hấp dẫn mỗi level - giảm để độ khó tăng chậm hơn

    baseGrowthRate: 0.02, // Tốc độ lớn cơ bản - giảm để hố đen phát triển chậm hơn
    growthRateIncreasePerLevel: 0.015, // Tăng tốc độ lớn mỗi level - giảm để tăng chậm hơn

    playerForceMultiplier: 1.5, // Hệ số lực tác dụng lên player - giảm để player bị ảnh hưởng ít hơn
    shakeThreshold: 0.7, // Ngưỡng gây rung màn hình
    shakeIntensity: 0.05, // Cường độ rung

    temporaryLifetime: 250, // Tuổi thọ hố đen tạm thời - tăng lại
  },

  // =============================================================================
  // MISSILE SETTINGS - Cài đặt tên lửa (PC MODE - DEADLY)
  // =============================================================================
  missiles: {
    spawnScore: 250, // GIẢM XUỐNG 250 - Xuất hiện CỰC SỚM
    spawnInterval: 400, // GIẢM XUỐNG 400 - Xuất hiện CỰC THƯỜNG XUYÊN
    warningDuration: 80, // GIẢM XUỐNG 80 - Rất ít thời gian cảnh báo
    warningDelay: 1200, // GIẢM XUỐNG 1.2 giây - Rất ít thời gian chuẩn bị

    radius: 7, // TĂNG LÊN 7 - CỰC KHÓ NÉ
    baseSpeed: 0.35, // TĂNG LÊN 0.35 - CỰC NHANH
    speedIncreasePerLevel: 0.018, // TĂNG LÊN 0.018 - Tăng tốc rất nhanh

    baseTurnSpeed: 0.04, // TĂNG LÊN 0.04 - Rẽ CỰC NHANH, gần như không thoát được
    turnSpeedIncreasePerLevel: 0.01, // TĂNG LÊN 0.01 - Tăng độ rẽ rất nhanh

    speedUpTime: 450, // Thời gian để tăng tốc - tăng lên để tên lửa cần nhiều thời gian hơn để tăng tốc
    speedUpMultiplier: 1.5, // Hệ số tăng tốc - giảm xuống để tên lửa không quá nhanh
    turnSpeedUpMultiplier: 1.3, // Hệ số tăng tốc độ rẽ - giảm xuống để tên lửa rẽ chậm hơn

    lifetime: 800, // Tuổi thọ - giảm xuống để tên lửa biến mất nhanh hơn
    fragmentCount: 6, // Số mảnh vỡ khi nổ - giảm thêm để ít mảnh vỡ hơn
    fragmentCountOnImpact: 4, // Số mảnh vỡ khi va chạm - giảm thêm để ít mảnh vỡ hơn

    velocity: {
      friction: 0.94, // Ma sát - tăng thêm để tên lửa chậm dần nhanh hơn
    },
  },

  // =============================================================================
  // LASER SETTINGS - Cài đặt laser
  // =============================================================================
  lasers: {
    spawnScore: 800, // Điểm bắt đầu xuất hiện - tăng lên để xuất hiện muộn hơn
    baseInterval: 400, // Khoảng cách spawn cơ bản - tăng lên để laser xuất hiện ít hơn
    intervalDecreasePerLevel: 8, // Giảm interval mỗi level - giảm để độ khó tăng chậm hơn
    minInterval: 180, // Interval tối thiểu - tăng để level cao không quá khó

    maxConcurrent: 1, // Số laser tối đa cùng lúc - giảm xuống còn 1 để dễ né
    lasersPerLevel: 6, // Chia level để tính số laser - tăng lên để các level cao mới có nhiều laser

    baseTargetChance: 0.2, // Xác suất nhắm mục tiêu cơ bản - giảm để đầu game dễ hơn
    targetChanceIncreasePerLevel: 0.02, // Tăng xác suất mỗi level - giảm để độ khó tăng chậm hơn
    maxTargetChance: 0.5, // Xác suất tối đa - giảm để level cao không quá khó

    warningTime: 150, // Thời gian cảnh báo - tăng để dễ chuẩn bị hơn
    beamDuration: 20, // Thời gian tồn tại beam - giảm xuống để dễ tránh hơn
    staggerDelay: 180, // Delay giữa các laser - tăng lên để có nhiều thời gian chuẩn bị

    playerHitRadius: 6, // Bán kính va chạm với player - giảm để né dễ hơn
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
    spawnScore: 1200, // Điểm bắt đầu xuất hiện - giảm để xuất hiện sớm hơn
    spawnInterval: 600, // Khoảng cách spawn - giảm để xuất hiện thường xuyên hơn

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
    interval: 1200, // Khoảng cách sự kiện - giảm xuống 1200 từ 2500 để sự kiện xảy ra thường xuyên hơn
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
      "gravity_wave_cascade",
      "temporal_chaos",
      "lightning_network",
      "void_storm",
      "mine_field_detonation",
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
      gravity_wave_cascade: "🌊 GRAVITY WAVE CASCADE!",
      temporal_chaos: "⏰ TEMPORAL CHAOS EVENT!",
      lightning_network: "⚡ LIGHTNING NETWORK ACTIVE!",
      void_storm: "🌀 VOID STORM DETECTED!",
      mine_field_detonation: "💥 COSMIC MINE FIELD!",
    },

    // Điều kiện mở khóa sự kiện - giảm mạnh để tất cả sự kiện xuất hiện ngay từ đầu game
    unlockThresholds: {
      laserSwarm: 100, // Giảm từ 500 xuống 100
      gravitationalAnomaly: 200, // Giảm từ 1000 xuống 200
      laserGrid: 300, // Giảm từ 1500 xuống 300
      blackHoleChain: 400, // Giảm từ 2000 xuống 400
      missileBarrage: 500, // Giảm từ 2500 xuống 500
      timeWarp: 600, // Giảm từ 3000 xuống 600
      // Events mới - có thể xuất hiện ngay từ đầu game
      wormholePortal: 100, // Giảm từ 500 xuống 100
      shieldGenerator: 200, // Giảm từ 1000 xuống 200
      freezeZone: 300, // Giảm từ 1500 xuống 300
      magneticStorm: 400, // Giảm từ 2000 xuống 400
      asteroidBelt: 500, // Giảm từ 2500 xuống 500
      laserTurrets: 600, // Giảm từ 3000 xuống 600
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
      laserCount: 4, // Số laser - giảm xuống 4 để dễ né tránh
      targetChance: 0.4, // Xác suất nhắm mục tiêu - giảm xuống 0.4 để ít laser nhắm vào người chơi
      delay: 300, // Delay giữa các laser - tăng lên 300 để có thời gian né tránh
    },

    laserGrid: {
      gridSize: 6, // Kích thước lưới - giảm xuống 6 để ít laser hơn
      delay: 250, // Delay giữa các laser - tăng lên 250 để có thời gian né tránh
    },

    asteroidRain: {
      count: 18, // Số thiên thạch - giảm xuống còn 18 để ít thiên thạch hơn
      delay: 180, // Delay giữa các thiên thạch - tăng lên 180 để có nhiều thời gian né tránh
      minRadius: 6, // Kích thước tối thiểu - giữ nguyên
      maxRadius: 22, // Kích thước tối đa - giảm thêm để dễ né tránh hơn
      speedMultiplier: 3.0, // Hệ số tốc độ - giảm xuống 3.0 để thiên thạch chậm hơn
      speedVariation: 2.0, // Biến thiên tốc độ - giảm để ổn định và dễ dự đoán hơn
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
      lifetime: 300, // Giảm xuống còn 5 giây
      maxIntensity: 0.9, // Giảm cường độ tối đa
      fieldCount: 3, // Giảm số từ trường
      fieldRadius: 100, // Giảm bán kính từ trường
      playerAffectMultiplier: 0.2, // Giảm ảnh hưởng lên player
      objectAffectMultiplier: 0.4, // Giảm ảnh hưởng lên objects
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

    // === NEW CREATIVE EVENTS ===

    gravityWaveCascade: {
      count: 4, // Số sóng trọng lực
      delay: 800, // Delay giữa các sóng (ms)
      duration: 6000, // Thời gian event (ms)
    },

    temporalChaos: {
      slowZoneCount: 3, // Số vùng chậm
      fastZoneCount: 2, // Số vùng nhanh
      duration: 8000, // Thời gian event (ms)
    },

    lightningNetwork: {
      count: 5, // Số quả cầu lightning
      spacing: 150, // Khoảng cách giữa các quả cầu
      duration: 10000, // Thời gian event (ms)
    },

    voidStorm: {
      riftCount: 6, // Số void rift
      spawnDelay: 500, // Delay giữa các rift (ms)
      duration: 12000, // Thời gian event (ms)
    },

    mineFieldDetonation: {
      mineCount: 8, // Số cosmic mine
      gridSize: 3, // Kích thước lưới (3x3)
      chainReaction: true, // Nổ dây chuyền
      duration: 15000, // Thời gian event (ms)
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

    // === NEW CREATIVE OBJECTS ===

    gravityWave: {
      radius: 30, // Bán kính ban đầu của sóng
      maxRadius: 400, // Bán kính tối đa
      expansionSpeed: 5, // Tốc độ mở rộng
      pushForce: 0.8, // Lực đẩy vật thể
      lifetime: 120, // Tuổi thọ (frames)
      color: "#7c4dff", // Màu tím xanh
      waveCount: 3, // Số vòng sóng đồng tâm
    },

    timeDistortion: {
      radius: 120, // Bán kính vùng ảnh hưởng
      slowFactor: 0.3, // Hệ số chậm (30% tốc độ)
      fastFactor: 2.0, // Hệ số nhanh (200% tốc độ)
      lifetime: 300, // Tuổi thọ (frames)
      color: "#00e5ff", // Màu xanh cyan
      pulseSpeed: 0.08, // Tốc độ pulse
      particleCount: 25, // Số particle thời gian
    },

    chainLightning: {
      radius: 25, // Bán kính quả cầu (TĂNG để dễ nhìn)
      chainRange: 200, // Khoảng cách chain tối đa (TĂNG để player thấy sớm)
      maxChains: 5, // Số chain tối đa
      damage: 0.5, // Sát thương mỗi chain
      chainInterval: 30, // Khoảng cách giữa các lần chain (frames)
      lifetime: 400, // Tuổi thọ (frames)
      color: "#ffeb3b", // Màu vàng
      glowIntensity: 30, // Độ sáng (TĂNG để chains sáng hơn)
    },

    voidRift: {
      radius: 50, // Bán kính rift (TĂNG để dễ nhìn)
      pullRadius: 150, // Bán kính hút (TĂNG để warning sớm hơn)
      pullStrength: 0.15, // Lực hút
      teleportChance: 0.7, // Xác suất teleport (70%)
      lifetime: 350, // Tuổi thọ (frames)
      color: "#4a148c", // Màu tím ĐẬM HƠN (thay vì đen)
      edgeColor: "#e91e63", // Màu viền hồng SÁNG (thay vì tím nhạt)
      rotationSpeed: 0.05, // Tốc độ xoay
    },

    cosmicMine: {
      radius: 15, // Bán kính mine
      triggerRadius: 80, // Bán kính kích hoạt
      armTime: 60, // Thời gian trang bị (frames)
      explosionRadius: 100, // Bán kính nổ
      shrapnelCount: 12, // Số mảnh vỡ
      shrapnelSpeed: 6, // Tốc độ mảnh vỡ
      shrapnelLifetime: 150, // Tuổi thọ mảnh vỡ (frames)
      color: "#ff1744", // Màu đỏ
      pulseSpeed: 0.15, // Tốc độ pulse khi armed
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
      duration: 2500, // Giảm thời gian hiển thị để không che khuất gameplay quá lâu
      fontSize: "clamp(1.2rem, 3vw, 2.5rem)", // Responsive font size, nhỏ hơn trên mobile
    },
    warning: {
      radius: 30, // Bán kính cảnh báo
      pulseIntensity: 15, // Cường độ pulse
      pulseSpeed: 0.3, // Tốc độ pulse
      fadeInTime: 20, // Thời gian fade in (frame)
      fadeOutTime: 20, // Thời gian fade out (frame)

      // Universal warning system for all objects
      universal: {
        enabled: true, // Bật hệ thống cảnh báo toàn diện
        duration: 120, // 2 giây cảnh báo (60fps * 2)
        delay: 2000, // 2 giây delay sau cảnh báo (ms)
        showRadius: true, // Hiển thị vùng ảnh hưởng trong warning

        // Mobile-specific warning adjustments
        mobile: {
          radiusMultiplier: 1.5, // Tăng kích thước warning 1.5 lần trên mobile
          pulseSpeedMultiplier: 1.2, // Tăng tốc độ pulse trên mobile
          durationMultiplier: 1.3, // Tăng thời gian warning trên mobile
        },
      },
    },

    // Mobile responsiveness settings
    mobile: {
      detected: false, // Will be set by detection script
      scaleFactor: 0.7, // Scale down UI elements for mobile
      minTouchSize: 44, // Minimum touch target size (pixels)
      safeAreaPadding: 20, // Padding from screen edges

      // Object size adjustments for mobile
      objects: {
        asteroidSizeMultiplier: 0.8, // Giảm kích thước asteroid 20%
        playerSizeMultiplier: 0.9, // Giảm kích thước player 10%
        missileSizeMultiplier: 0.7, // Giảm kích thước missile 30%
        blackHoleSizeMultiplier: 0.8, // Giảm kích thước black hole 20%
        laserWidthMultiplier: 0.6, // Giảm độ rộng laser 40%
        effectRadiusMultiplier: 0.75, // Giảm vùng ảnh hưởng các hiệu ứng 25%
      },

      // Text and font adjustments
      text: {
        baseFontSizeMultiplier: 0.8, // Giảm font size 20%
        eventTextSizeMultiplier: 0.7, // Giảm event text size 30%
        scoreFontSizeMultiplier: 0.75, // Giảm score font size 25%
      },
    },
  },

  // =============================================================================
  // SCORING SYSTEM - Hệ thống điểm số (tăng điểm nhiều hơn để dễ đạt mốc mở khóa)
  // =============================================================================
  scoring: {
    movementMultiplier: 0.2, // Tăng lên 0.2 để tăng điểm nhanh hơn
    speedMultiplier: 0.8, // Tăng lên 0.8 để tăng điểm nhanh hơn
    speedMinThreshold: 2, // Giảm ngưỡng tốc độ tối thiểu xuống 2 để dễ đạt điểm
    speedScoreInterval: 20, // Giảm xuống 20 frames để điểm tăng nhanh hơn
    asteroidDestroy: 25, // Tăng điểm phá hủy thiên thạch lên 25
    survivalBonus: 1, // Thêm 1 điểm mỗi giây sống sót để đảm bảo điểm tăng đều

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
