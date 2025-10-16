// --- Game Logic ---
// Make createNebula function globally available
window.createNebula = function () {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const r =
    GAME_CONFIG.visual.nebula.minRadius +
    Math.random() *
      (GAME_CONFIG.visual.nebula.maxRadius -
        GAME_CONFIG.visual.nebula.minRadius);
  const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
  const color = [
    `rgba(0, 255, 255, ${GAME_CONFIG.visual.nebula.opacity})`,
    `rgba(170, 102, 204, ${GAME_CONFIG.visual.nebula.opacity})`,
    `rgba(51, 181, 229, ${GAME_CONFIG.visual.nebula.opacity})`,
  ][~~(Math.random() * 3)];
  grad.addColorStop(
    0,
    color.replace(
      `${GAME_CONFIG.visual.nebula.opacity})`,
      `${GAME_CONFIG.visual.nebula.opacity * 2})`
    )
  );
  grad.addColorStop(1, color);
  return grad;
};

// Helper function for FPS calculation
let lastFrameTime = 0;
let frameCount = 0;
let fps = 0;

function getFPS() {
  return fps;
}

function updateMousePosition() {
  // Smooth mouse movement with lerp
  if (player) {
    const lerpFactor = GAME_CONFIG.player.mouseLerpFactor || 0.1; // Default if not defined
    player.x += (mouse.x - player.x) * lerpFactor;
    player.y += (mouse.y - player.y) * lerpFactor;

    // Keep player within bounds
    player.x = Math.max(
      player.radius,
      Math.min(width - player.radius, player.x)
    );
    player.y = Math.max(
      player.radius,
      Math.min(height - player.radius, player.y)
    );
  }
}

// Make init function globally available
window.init = function () {
  console.log("Initializing game...");
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  mouse = { x: width / 2, y: height * 0.8 };
  prevMouse = { ...mouse };
  isGameRunning = true;
  score = 0;
  gameStartTime = Date.now();
  survivalTime = 0;
  lastDifficultyLevel = 0;
  spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval || 60;
  globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed || 1.0;

  // Initialize game entities
  player = new Player(
    width / 2,
    height * 0.8,
    GAME_CONFIG.player.radius,
    "var(--primary-color)"
  );
  stars = [];
  asteroids = [];
  particles = [];
  lasers = [];
  blackHoles = [];
  missiles = [];
  laserMines = [];
  crystalClusters = [];
  fragments = [];
  warnings = [];
  energyOrbs = [];
  plasmaFields = [];
  crystalShards = [];
  quantumPortals = [];
  shieldGenerators = [];
  freezeZones = [];
  superNovas = [];
  wormholes = [];
  magneticStorms = [];
  lightningStorms = [];
  gravityWaves = [];
  timeDistortions = [];
  chainLightnings = [];
  voidRifts = [];
  cosmicMines = [];

  // Kích hoạt sự kiện sớm ngay từ đầu game để tăng sự thú vị
  setTimeout(() => {
    if (isGameRunning) {
      triggerRandomEvent();
    }
  }, 3000); // Kích hoạt sự kiện đầu tiên sau 3 giây

  // Thiết lập lịch trình sự kiện sớm ban đầu
  setTimeout(() => {
    if (isGameRunning) {
      triggerRandomEvent();
    }
  }, 8000); // Kích hoạt sự kiện thứ hai sau 8 giây

  // Create stars
  for (let i = 0; i < 3; i++) {
    const layer = (i + 1) / 3;
    for (let j = 0; j < 80; j++) {
      stars.push(
        new Star(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 1.5 * layer,
          layer
        )
      );
    }
  }

  // Create nebulae background
  nebulae = Array(5)
    .fill(null)
    .map(() => createNebula());
};

// Make animate function globally available
window.animate = function () {
  if (!isGameRunning) return;

  animationFrameId = requestAnimationFrame(animate);

  // Clear canvas
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);

  // Draw background nebulae
  nebulae.forEach((n) => {
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, width, height);
  });

  // Update game state
  // Calculate elapsed time since game start
  const currentTime = Date.now();
  survivalTime = Math.floor((currentTime - gameStartTime) / 1000);

  // Update difficulty based on time
  updateDifficulty();

  // Spawn new game objects
  spawnGameObjects();

  // Check for special events
  checkForEvents();

  // Update mouse-based movement with lerping
  updateMousePosition();

  // Update all game objects
  stars.forEach((star) => star.update());
  asteroids.forEach((asteroid, index) => updateAsteroid(asteroid, index));
  lasers.forEach((laser, index) => updateLaser(laser, index));
  blackHoles.forEach((blackHole, index) => updateBlackHole(blackHole, index));
  missiles.forEach((missile, index) => updateMissile(missile, index));
  laserMines.forEach((mine, index) => updateLaserMine(mine, index));
  crystalClusters.forEach((crystal, index) =>
    updateCrystalCluster(crystal, index)
  );
  fragments = fragments.filter((fragment) => !updateFragment(fragment));
  particles = particles.filter((particle) => particle.alpha > 0);
  particles.forEach((particle) => particle.update());
  warnings = warnings.filter((warning) => warning.update());
  energyOrbs = energyOrbs.filter((orb, index) => updateEnergyOrb(orb, index));
  plasmaFields = plasmaFields.filter((field, index) =>
    updatePlasmaField(field, index)
  );
  crystalShards = crystalShards.filter((shard, index) =>
    updateCrystalShard(shard, index)
  );
  quantumPortals = quantumPortals.filter((portal, index) =>
    updateQuantumPortal(portal, index)
  );
  shieldGenerators = shieldGenerators.filter((shield, index) =>
    updateShieldGenerator(shield, index)
  );
  freezeZones = freezeZones.filter((zone, index) =>
    updateFreezeZone(zone, index)
  );
  superNovas = superNovas.filter((nova, index) => updateSuperNova(nova, index));
  wormholes = wormholes.filter((wormhole, index) =>
    updateWormhole(wormhole, index)
  );
  magneticStorms = magneticStorms.filter((storm, index) =>
    updateMagneticStorm(storm, index)
  );
  lightningStorms = lightningStorms.filter((storm, index) =>
    updateLightningStorm(storm, index)
  );

  // Update new creative objects
  gravityWaves = gravityWaves.filter((wave) => {
    wave.draw();
    return !wave.update();
  });
  timeDistortions = timeDistortions.filter((distortion) => {
    distortion.draw();
    return !distortion.update();
  });
  chainLightnings = chainLightnings.filter((lightning) => {
    lightning.draw();
    return !lightning.update();
  });
  voidRifts = voidRifts.filter((rift) => {
    rift.draw();
    return !rift.update();
  });
  cosmicMines = cosmicMines.filter((mine) => {
    mine.draw();
    return !mine.update();
  });

  // Update player last to ensure it's on top
  if (player) player.update();

  // Update UI elements
  uiElements.scoreDisplay.innerText = `Score: ${Math.floor(score)}`;
  uiElements.timeDisplay.innerText = `Time: ${Math.floor(survivalTime / 60)}:${(
    survivalTime % 60
  )
    .toString()
    .padStart(2, "0")}`;
  uiElements.fpsDisplay.innerText = `FPS: ${Math.round(getFPS())}`;

  nextEventScore = GAME_CONFIG.events.interval;
  eventActive = { type: null, endTime: 0 };
  timers = {
    asteroid: 0,
    difficulty: 0,
    laser: 0,
    blackHole: 0,
    missile: 0,
    mine: 0,
    crystal: 0,
    speedScore: 0, // Timer for speed-based scoring
    event: 0, // Timer for events
    gameFrame: 0, // General frame counter
  };
  player = new Player(
    width / 2,
    height * 0.8,
    GAME_CONFIG.player.radius,
    "var(--primary-color)"
  );

  // Kích hoạt khiên bảo vệ ngay từ đầu game
  if (GAME_CONFIG.player.initialShieldDuration) {
    player.shieldActive = true;
    player.shieldTimer = GAME_CONFIG.player.initialShieldDuration;
    // Hiển thị thông báo khiên được kích hoạt
    const shieldSeconds = Math.floor(
      GAME_CONFIG.player.initialShieldDuration / 60
    );
    showEventText(`Starting Shield Activated! (${shieldSeconds}s)`);
    playSound("shield");
  }

  stars = [];
  asteroids = [];
  particles = [];
  lasers = [];
  blackHoles = [];
  missiles = [];
  laserMines = [];
  crystalClusters = [];
  fragments = [];
  warnings = [];
  energyOrbs = [];
  plasmaFields = [];
  crystalShards = [];
  quantumPortals = [];
  shieldGenerators = [];
  freezeZones = [];
  // laserTurrets removed
  superNovas = [];
  wormholes = [];
  magneticStorms = [];
  lightningStorms = [];
  for (let i = 0; i < GAME_CONFIG.visual.stars.layers; i++) {
    const layer = (i + 1) / GAME_CONFIG.visual.stars.layers;
    for (let j = 0; j < GAME_CONFIG.visual.stars.starsPerLayer; j++)
      stars.push(
        new Star(
          Math.random() * width,
          Math.random() * height,
          Math.random() * GAME_CONFIG.visual.stars.maxRadius * layer,
          layer
        )
      );
  }
  nebulae = Array(GAME_CONFIG.visual.nebula.count)
    .fill(null)
    .map(() => createNebula());
  highScore = localStorage.getItem(GAME_CONFIG.advanced.localStorageKey) || 0;
  uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;
};

// Make animate function globally available
window.animate = function () {
  animationFrameId = requestAnimationFrame(animate);
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);
  nebulae.forEach((n) => {
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, width, height);
  });

  stars.sort((a, b) => a.layer - b.layer).forEach((s) => s.update());
  if (!isGameRunning) {
    particles.forEach((p, i) =>
      p.alpha <= 0 ? particles.splice(i, 1) : p.update()
    );
    return;
  }

  timers.difficulty++;
  timers.gameFrame++;

  // Update survival time
  survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
  const minutes = Math.floor(survivalTime / 60);
  const seconds = survivalTime % 60;
  uiElements.survivalDisplay.innerText = `Time: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const distMoved = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
  const currentLevel = Math.floor(score / 2500) + 1; // Level tăng mỗi 2500 điểm (tăng từ 1500)

  // 1. Điểm từ khoảng cách di chuyển - thêm ngưỡng tối thiểu
  // Chỉ tăng điểm khi di chuyển đủ xa
  if (distMoved > 1.5) {
    // Thêm ngưỡng tối thiểu để tránh nhận điểm khi di chuyển nhẹ
    score += (distMoved - 1.5) * GAME_CONFIG.scoring.movementMultiplier;
  }

  // 2. Điểm từ tốc độ di chuyển
  timers.speedScore++;
  if (timers.speedScore >= GAME_CONFIG.scoring.speedScoreInterval) {
    // Tính tốc độ hiện tại của player
    const playerSpeed = Math.hypot(player.velocity.x, player.velocity.y);

    // Tăng điểm dựa trên tốc độ (thêm lại ngưỡng tối thiểu)
    if (playerSpeed > 3) {
      // Chỉ tính điểm khi tốc độ đủ cao
      const speedScore =
        Math.pow(playerSpeed - 2, 1.2) * GAME_CONFIG.scoring.speedMultiplier; // Giảm hệ số mũ và trừ ngưỡng cơ bản để tăng điểm chậm hơn
      score += speedScore;
    }

    // Hiệu ứng thị giác khi nhận điểm từ tốc độ
    if (playerSpeed > 2) {
      // Giảm ngưỡng hiệu ứng xuống còn 2 (trước là 3)
      // Chỉ khi tốc độ đủ nhanh
      const boostParticles = Math.min(5, Math.floor(playerSpeed));
      for (let i = 0; i < boostParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push(
          new Particle(
            player.x + Math.cos(angle) * player.radius,
            player.y + Math.sin(angle) * player.radius,
            Math.random() * 2 + 1,
            "#FFFF00", // Màu vàng sáng cho hiệu ứng tốc độ
            {
              x: Math.cos(angle) * 2,
              y: Math.sin(angle) * 2,
            }
          )
        );
      }
    }

    timers.speedScore = 0; // Reset timer
  }

  prevMouse = { ...mouse };
  uiElements.scoreDisplay.innerText = `Score: ${~~score}`;
  [
    particles,
    lasers,
    blackHoles,
    missiles,
    laserMines,
    asteroids,
    crystalClusters,
    fragments,
    warnings,
    energyOrbs,
    plasmaFields,
    crystalShards,
    quantumPortals,
    shieldGenerators,
    freezeZones,
    // laserTurrets removed
    superNovas,
    wormholes,
    magneticStorms,
    lightningStorms,
  ].forEach((arr) =>
    arr.forEach((item) => (item.update ? item.update() : undefined))
  );
  player.update(); // Update player last to draw over everything

  // --- Filter dead entities ---
  missiles = missiles.filter((m) => !m.isDead);
  fragments = fragments.filter((f) => f.life > 0 && f.y < height + 50);
  asteroids = asteroids.filter(
    (a) => a.x > -50 && a.x < width + 50 && a.y > -50 && a.y < height + 50
  );
  blackHoles = blackHoles.filter((bh) => bh.alpha > 0);
  crystalClusters = crystalClusters.filter((cc) => cc.alpha > 0);
  warnings = warnings.filter((w) => w.timer < w.duration);
  energyOrbs = energyOrbs.filter((e) => e.update() !== false);
  plasmaFields = plasmaFields.filter((p) => p.update() !== false);
  crystalShards = crystalShards.filter((c) => c.update() !== false);
  quantumPortals = quantumPortals.filter((q) => q.update() !== false);
  shieldGenerators = shieldGenerators.filter((s) => s.update() !== false);
  freezeZones = freezeZones.filter((f) => f.update() !== false);
  superNovas = superNovas.filter((s) => s.update() !== false);
  wormholes = wormholes.filter((w) => w.update() !== false);
  magneticStorms = magneticStorms.filter((m) => m.update() !== false);
  lightningStorms = lightningStorms.filter((l) => l.update() !== false);

  // --- Event System ---
  // Sự kiện xuất hiện theo frame thay vì điểm số
  timers.event++;
  if (timers.event % GAME_CONFIG.events.interval === 0 && !eventActive.type) {
    triggerRandomEvent();
  }

  // Thêm cơ hội ngẫu nhiên cho sự kiện xuất hiện
  if (Math.random() < 0.0015 && !eventActive.type) {
    // 0.15% cơ hội mỗi frame (tăng từ 0.03% lên 0.15% - gấp 5 lần)
    triggerRandomEvent();
  }
  if (eventActive.type && timers.difficulty > eventActive.endTime) {
    if (eventActive.type === "speedZone")
      globalSpeedMultiplier /= GAME_CONFIG.events.speedZone.speedMultiplier;
    eventActive.type = null;
    // Thêm cơ hội kích hoạt sự kiện tiếp theo ngay sau khi sự kiện hiện tại kết thúc (25% cơ hội)
    if (Math.random() < 0.25) {
      setTimeout(() => {
        if (isGameRunning && !eventActive.type) {
          triggerRandomEvent();
        }
      }, 500); // Chờ 0.5 giây trước khi kích hoạt sự kiện tiếp theo
    }
  }

  let currentSpawnInterval =
    eventActive.type === "denseField" && timers.difficulty < eventActive.endTime
      ? GAME_CONFIG.events.denseField.spawnInterval
      : spawnInterval;

  // --- Spawning Logic ---
  timers.asteroid++;
  if (timers.asteroid % currentSpawnInterval === 0) {
    // Spawn multiple asteroids per interval
    const asteroidsToSpawn = 1 + Math.floor(score / 5000); // Base + 1 additional per 5000 points, up to a max
    const maxAsteroids = Math.min(asteroidsToSpawn, 4); // Cap at 4 asteroids at once to prevent overwhelming

    for (let i = 0; i < maxAsteroids; i++) {
      spawnAsteroid();
    }
  }

  // Additional random asteroid spawn chance - creates surprising asteroids
  if (Math.random() < 0.01) {
    // 1% chance every frame for random asteroid
    spawnAsteroid(true); // true for random position
  }

  // Mini asteroid shower - happens occasionally during normal gameplay
  if (Math.random() < 0.0005) {
    // 0.05% chance each frame
    // Spawn a small group of 5-10 asteroids
    const miniShowerCount = 5 + Math.floor(Math.random() * 6);
    const direction = "top"; // Luôn tạo thiên thạch từ trên xuống

    for (let i = 0; i < miniShowerCount; i++) {
      setTimeout(() => {
        if (isGameRunning) {
          const ast = createMiniShowerAsteroid(direction);
          asteroids.push(ast);
        }
      }, i * 120); // Space them out slightly
    }
  }

  // Function to create asteroids for mini showers
  function createMiniShowerAsteroid(direction) {
    const radius = 10 + Math.random() * 20;
    const speed = 3 + Math.random() * 2;
    let x, y, velX, velY;

    // Chỉ cho phép thiên thạch rơi từ trên xuống với góc nghiêng nhẹ
    x = Math.random() * width;
    y = -30;

    // Thiên thạch rơi thẳng hoặc có góc nghiêng nhẹ
    if (Math.random() < 0.7) {
      // 70% rơi thẳng
      velX = 0;
      velY = speed;
    } else {
      // 30% rơi với góc nghiêng nhẹ
      velX = (Math.random() - 0.5) * speed * 0.3; // Góc nghiêng nhẹ
      velY = speed;
    }

    return new Asteroid(
      x,
      y,
      radius,
      GAME_CONFIG.asteroids.colors[
        Math.floor(Math.random() * GAME_CONFIG.asteroids.colors.length)
      ],
      { x: velX, y: velY }
    );
  }

  // Function to spawn a single asteroid with configurable parameters
  function spawnAsteroid(randomPosition = false) {
    const difficultyLevel = Math.floor(score / 2500); // Every 2500 points (increased from 1500)
    const radius =
      eventActive.type === "denseField"
        ? GAME_CONFIG.asteroids.minRadius +
          Math.random() *
            (GAME_CONFIG.asteroids.maxRadius -
              GAME_CONFIG.asteroids.minRadius) *
            0.6
        : GAME_CONFIG.asteroids.minRadius +
          Math.random() *
            (GAME_CONFIG.asteroids.maxRadius - GAME_CONFIG.asteroids.minRadius);
    const asteroidSpeed =
      (GAME_CONFIG.asteroids.baseSpeed +
        Math.random() * GAME_CONFIG.asteroids.speedVariation +
        difficultyLevel * GAME_CONFIG.asteroids.speedIncreasePerLevel) *
      globalSpeedMultiplier;
    // Thiết lập các mô hình rơi thiên thạch - chỉ từ trên xuống hoặc chéo một chút
    let spawnX, spawnY, velocityX, velocityY;
    const spawnPattern = Math.random();

    if (spawnPattern < 0.7) {
      // Rơi thẳng từ trên xuống (70%)
      spawnX = Math.random() * width;
      spawnY = -30;
      velocityX = 0; // Không có vận tốc ngang
      velocityY = asteroidSpeed;
    } else if (spawnPattern < 0.9) {
      // Rơi từ trên xuống với góc nghiêng nhẹ (20%)
      spawnX = Math.random() * width;
      spawnY = -30;
      velocityX = (Math.random() - 0.5) * asteroidSpeed * 0.3; // Góc nghiêng nhẹ
      velocityY = asteroidSpeed;
    } else {
      // Rơi chéo từ góc trên (10%)
      const fromLeft = Math.random() < 0.5;
      spawnX = fromLeft ? -30 : width + 30;
      spawnY = -30;
      velocityX = fromLeft ? asteroidSpeed * 0.4 : -asteroidSpeed * 0.4;
      velocityY = asteroidSpeed * 0.8;
    }

    asteroids.push(
      new Asteroid(
        spawnX,
        spawnY,
        radius,
        GAME_CONFIG.asteroids.colors[
          ~~(Math.random() * GAME_CONFIG.asteroids.colors.length)
        ],
        { x: velocityX, y: velocityY }
      )
    );
  }
  // Black hole spawning không phụ thuộc điểm số
  timers.blackHole++;
  if (timers.blackHole % GAME_CONFIG.blackHoles.spawnInterval === 0) {
    const bhX = Math.random() * width * 0.8 + width * 0.1;
    const bhY = Math.random() * height * 0.8;
    // Show warning first
    warnings.push(
      new Warning(bhX, bhY, "blackhole", GAME_CONFIG.blackHoles.warningDuration)
    );
    playSound("warning");
    // Create black hole after warning period
    setTimeout(() => {
      if (isGameRunning) {
        blackHoles.push(new BlackHole(bhX, bhY));
        playSound("blackhole");
      }
    }, GAME_CONFIG.blackHoles.warningDelay);
  }

  // Missile spawning không phụ thuộc điểm số
  timers.missile++;
  if (timers.missile % GAME_CONFIG.missiles.spawnInterval === 0) {
    // Determine missile spawn pattern and position
    const spawnPattern = Math.random();
    let warningX, warningY, warningAngle, missileDirection;

    if (spawnPattern < 0.4) {
      // Side spawn (40%)
      const fromLeft = Math.random() > 0.5;
      warningX = fromLeft ? 50 : width - 50;
      warningY = Math.random() * height;
      warningAngle = fromLeft ? 0 : Math.PI; // Arrow pointing right or left
      missileDirection = { fromLeft };
    } else if (spawnPattern < 0.7) {
      // Top/Bottom spawn (30%)
      const fromTop = Math.random() > 0.5;
      warningX = Math.random() * width;
      warningY = fromTop ? 50 : height - 50;
      warningAngle = fromTop ? Math.PI / 2 : -Math.PI / 2; // Arrow pointing down or up
      missileDirection = { fromTop, fromSide: false };
    } else if (spawnPattern < 0.85) {
      // Corner spawn (15%)
      const fromTopCorner = Math.random() < 0.5;
      const fromLeftCorner = Math.random() < 0.5;
      warningX = fromLeftCorner ? 50 : width - 50;
      warningY = fromTopCorner ? 50 : height - 50;
      warningAngle = Math.atan2(height / 2 - warningY, width / 2 - warningX);
      missileDirection = {
        fromCorner: true,
        fromLeft: fromLeftCorner,
        fromTop: fromTopCorner,
      };
    } else {
      // Random edge spawn (15%)
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: // Top
          warningX = Math.random() * width;
          warningY = 50;
          warningAngle = Math.PI / 2;
          missileDirection = { edge: 0 };
          break;
        case 1: // Right
          warningX = width - 50;
          warningY = Math.random() * height;
          warningAngle = Math.PI;
          missileDirection = { edge: 1 };
          break;
        case 2: // Bottom
          warningX = Math.random() * width;
          warningY = height - 50;
          warningAngle = -Math.PI / 2;
          missileDirection = { edge: 2 };
          break;
        case 3: // Left
          warningX = 50;
          warningY = Math.random() * height;
          warningAngle = 0;
          missileDirection = { edge: 3 };
          break;
      }
    }

    // Push warning with direction angle
    warnings.push(
      new Warning(
        warningX,
        warningY,
        "missile",
        GAME_CONFIG.missiles.warningDuration,
        warningAngle
      )
    );
    playSound("warning");

    // Create missile after warning period with matched position and direction
    setTimeout(() => {
      if (isGameRunning) {
        // Create missile with the same pattern as the warning
        let newMissile = new Missile();

        // Override missile position and angle to match warning
        if (spawnPattern < 0.4) {
          // Side spawn (40%)
          newMissile.x = missileDirection.fromLeft ? -20 : width + 20;
          newMissile.y = warningY;
          newMissile.angle = missileDirection.fromLeft ? 0 : Math.PI;
        } else if (spawnPattern < 0.7) {
          // Top/Bottom spawn (30%)
          newMissile.x = warningX;
          newMissile.y = missileDirection.fromTop ? -20 : height + 20;
          newMissile.angle = missileDirection.fromTop
            ? Math.PI / 2
            : -Math.PI / 2;
        } else if (spawnPattern < 0.85) {
          // Corner spawn (15%)
          newMissile.x = missileDirection.fromLeft ? -20 : width + 20;
          newMissile.y = missileDirection.fromTop ? -20 : height + 20;
          newMissile.angle = Math.atan2(
            height / 2 - newMissile.y,
            width / 2 - newMissile.x
          );
        } else {
          // Random edge spawn (15%)
          switch (missileDirection.edge) {
            case 0: // Top
              newMissile.x = warningX;
              newMissile.y = -20;
              newMissile.angle = Math.PI / 2;
              break;
            case 1: // Right
              newMissile.x = width + 20;
              newMissile.y = warningY;
              newMissile.angle = Math.PI;
              break;
            case 2: // Bottom
              newMissile.x = warningX;
              newMissile.y = height + 20;
              newMissile.angle = -Math.PI / 2;
              break;
            case 3: // Left
              newMissile.x = -20;
              newMissile.y = warningY;
              newMissile.angle = 0;
              break;
          }
        }

        // Update missile velocity based on new angle
        newMissile.velocity = {
          x: Math.cos(newMissile.angle) * newMissile.speed,
          y: Math.sin(newMissile.angle) * newMissile.speed,
        };

        missiles.push(newMissile);
      }
    }, GAME_CONFIG.missiles.warningDelay);
  }

  // Laser spawning không phụ thuộc điểm số
  timers.laser++;
  const laserDifficultyLevel = Math.floor(score / 2500); // Every 2500 points (increased from 1500)
  const laserInterval = Math.max(
    GAME_CONFIG.lasers.minInterval,
    GAME_CONFIG.lasers.baseInterval -
      laserDifficultyLevel * GAME_CONFIG.lasers.intervalDecreasePerLevel
  );
  if (timers.laser % laserInterval === 0) {
    // Multiple lasers for higher intensity
    const laserCount = Math.min(
      GAME_CONFIG.lasers.maxConcurrent,
      1 + Math.floor(laserDifficultyLevel / GAME_CONFIG.lasers.lasersPerLevel)
    );

    for (let i = 0; i < laserCount; i++) {
      setTimeout(() => {
        if (isGameRunning) {
          const targetChance = Math.min(
            GAME_CONFIG.lasers.maxTargetChance,
            GAME_CONFIG.lasers.baseTargetChance +
              laserDifficultyLevel *
                GAME_CONFIG.lasers.targetChanceIncreasePerLevel
          );
          const shouldTarget = Math.random() < targetChance;
          lasers.push(new Laser(shouldTarget));
          if (shouldTarget) {
            playSound("warning");
          }
        }
      }, i * GAME_CONFIG.lasers.staggerDelay);
    }
  }

  // Loại bỏ điều kiện điểm số cho laser mines
  timers.mine++;
  if (timers.mine % GAME_CONFIG.laserMines.spawnInterval === 0)
    laserMines.push(
      new LaserMine(
        Math.random() * width * 0.8 + width * 0.1,
        Math.random() * height * 0.6
      )
    );

  // Loại bỏ điều kiện điểm số cho crystal clusters
  timers.crystal++;
  if (timers.crystal % 800 === 0)
    crystalClusters.push(
      new CrystalCluster(Math.random() * width, Math.random() * height * 0.7)
    );

  // --- Collision Detection ---

  // Player vs Obstacles
  for (const ast of asteroids) {
    if (
      Math.hypot(player.x - ast.x, player.y - ast.y) -
        ast.radius -
        player.radius <
      1
    ) {
      if (!player.shieldActive) {
        endGame("asteroid collision");
        return;
      } else {
        // Shield deflects asteroid
        const dx = ast.x - player.x;
        const dy = ast.y - player.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        ast.velocity.x += (dx / distance) * 3;
        ast.velocity.y += (dy / distance) * 3;

        // Trigger shield hit animation
        player.shieldHit();
        triggerScreenShake(0.3); // Add small screen shake
      }
    }
  }
  for (const m of missiles) {
    if (
      Math.hypot(player.x - m.x, player.y - m.y) - m.radius - player.radius <
      1
    ) {
      if (!player.shieldActive) {
        endGame("missile collision");
        return;
      } else {
        // Shield deflects missile
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        m.velocity.x += (dx / distance) * 4;
        m.velocity.y += (dy / distance) * 4;

        // Trigger shield hit animation
        player.shieldHit();
        triggerScreenShake(0.5); // Add moderate screen shake
      }
    }
  }

  // Lasers vs Player
  for (const laser of lasers) {
    if (laser.timer > laser.maxTime + GAME_CONFIG.lasers.beamDuration) continue;
    if (laser.fired) {
      const dx = Math.cos(laser.angle);
      const dy = Math.sin(laser.angle);
      const dist = Math.abs(
        dy * (player.x - laser.x) - dx * (player.y - laser.y)
      );
      if (dist < player.radius + GAME_CONFIG.lasers.playerHitRadius) {
        if (!player.shieldActive) {
          endGame("laser collision");
          return;
        } else {
          // Shield deflects laser
          player.shieldHit();
          triggerScreenShake(0.4);
        }
      }
    }
  }
  lasers = lasers.filter(
    (l) => l.timer < l.maxTime + GAME_CONFIG.lasers.beamDuration
  );

  // Mines & Crystals vs Player
  for (let i = laserMines.length - 1; i >= 0; i--) {
    const mine = laserMines[i];
    if (mine.state === "fading") {
      laserMines.splice(i, 1);
    } else if (mine.state === "firing") {
      const angles = mine.getFireAngles();
      let hitDetected = false;

      for (const angle of angles) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const dist = Math.abs(
          dy * (player.x - mine.x) - dx * (player.y - mine.y)
        );
        if (dist < player.radius + GAME_CONFIG.laserMines.beamWidth / 2) {
          // Check if player is in beam range
          const dotProduct =
            (player.x - mine.x) * dx + (player.y - mine.y) * dy;
          if (dotProduct > 0) {
            // Player is in front of beam
            hitDetected = true;
            break;
          }
        }
      }

      if (hitDetected) {
        if (!player.shieldActive) {
          endGame("laser mine collision");
          return;
        } else {
          // Shield blocks laser mine
          player.shieldHit();
          triggerScreenShake(0.4);
        }
      }
    }
  }
  for (const cc of crystalClusters) {
    if (cc.state === "discharging") {
      const dist = Math.hypot(player.x - cc.x, player.y - cc.y);
      if (Math.abs(dist - cc.dischargeRadius) < player.radius + 5) {
        if (!player.shieldActive) {
          endGame("crystal cluster collision");
          return;
        } else {
          // Shield blocks crystal cluster energy
          player.shieldHit();
          triggerScreenShake(0.3);
        }
      }
    }
  }

  // Fragment vs Player collisions (now just visual effects, not lethal)
  for (let i = fragments.length - 1; i >= 0; i--) {
    const fragment = fragments[i];
    if (
      fragment.lethal &&
      Math.hypot(player.x - fragment.x, player.y - fragment.y) <
        player.radius + fragment.radius
    ) {
      // Create spark visual effect instead of ending game
      for (let j = 0; j < 8; j++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        particles.push(
          new Particle(
            player.x + Math.cos(angle) * player.radius,
            player.y + Math.sin(angle) * player.radius,
            Math.random() * 2 + 1,
            "#ff6b9d",
            {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed,
            }
          )
        );
      }

      // Add small visual screen shake
      triggerScreenShake(0.3);

      // Play impact sound
      playSound("collision", 0.5);

      // Remove the fragment
      fragments.splice(i, 1);
    }
  }

  // Inter-object collisions
  // Fragment vs Asteroid collisions
  for (let i = fragments.length - 1; i >= 0; i--) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const f = fragments[i];
      const a = asteroids[j];
      if (f && a && Math.hypot(f.x - a.x, f.y - a.y) < f.radius + a.radius) {
        // Create explosion particles
        for (let k = 0; k < GAME_CONFIG.fragments.explosionParticles; k++) {
          particles.push(
            new Particle(a.x, a.y, Math.random() * 2 + 1, a.color, {
              x:
                (Math.random() - 0.5) *
                GAME_CONFIG.visual.particles.explosionSpeed,
              y:
                (Math.random() - 0.5) *
                GAME_CONFIG.visual.particles.explosionSpeed,
            })
          );
        }
        playSound("collision");
        playSound("score");
        score += Math.floor(GAME_CONFIG.fragments.scoreBonus * 0.7); // 70% of original bonus
        fragments.splice(i, 1);
        asteroids.splice(j, 1);
        break;
      }
    }
  }

  // Missile vs Asteroid collisions - tạo missile fragments
  for (let i = missiles.length - 1; i >= 0; i--) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const m = missiles[i];
      const a = asteroids[j];
      if (m && a && Math.hypot(m.x - a.x, m.y - a.y) < m.radius + a.radius) {
        // Tạo missile fragments khi tên lửa va chạm thiên thạch
        const fragmentCount = GAME_CONFIG.missiles.fragmentCountOnImpact;
        for (let k = 0; k < fragmentCount; k++) {
          const angle = (Math.PI * 2 * k) / fragmentCount + Math.random() * 0.5;
          const speed =
            GAME_CONFIG.fragments.missileFragments.speed *
            (0.5 + Math.random() * 0.5);
          const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          };
          fragments.push(new MissileFragment(m.x, m.y, velocity));
        }

        playSound("fragmentHit", 0.5);
        m.explode(true);
        asteroids.splice(j, 1);
        break;
      }
    }
  }
  for (let i = blackHoles.length - 1; i >= 0; i--) {
    const bh = blackHoles[i];
    if (Math.hypot(player.x - bh.x, player.y - bh.y) < bh.radius) {
      endGame("black hole collision");
      return;
    }
    for (let j = asteroids.length - 1; j >= 0; j--) {
      if (Math.hypot(asteroids[j].x - bh.x, asteroids[j].y - bh.y) < bh.radius)
        asteroids.splice(j, 1);
    }
    for (let j = missiles.length - 1; j >= 0; j--) {
      if (Math.hypot(missiles[j].x - bh.x, missiles[j].y - bh.y) < bh.radius)
        missiles[j].isDead = true;
    }
  }

  // --- NEW OBJECTS COLLISION DETECTION ---

  // EnergyOrbs vs Player - Boost score and add energy effect
  for (let i = energyOrbs.length - 1; i >= 0; i--) {
    const orb = energyOrbs[i];
    const dist = Math.hypot(player.x - orb.x, player.y - orb.y);
    if (dist < orb.radius + player.radius) {
      // Positive effect - boost score (reduced)
      score += 30; // Reduced from 50
      playSound("powerup");

      // Visual effect
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        particles.push(
          new Particle(
            orb.x + Math.cos(angle) * 10,
            orb.y + Math.sin(angle) * 10,
            3,
            "#00ffff",
            {
              x: Math.cos(angle) * 4,
              y: Math.sin(angle) * 4,
            }
          )
        );
      }

      energyOrbs.splice(i, 1);
    }
  }

  // PlasmaFields vs Player - Damage over time
  for (const plasma of plasmaFields) {
    const dist = Math.hypot(player.x - plasma.x, player.y - plasma.y);
    if (dist < plasma.radius + player.radius) {
      // Damage player gradually
      if (Math.random() < 0.02) {
        // 2% chance per frame
        endGame("plasma field burn");
        return;
      }
    }
  }

  // CrystalShards vs Player - Collect for shield
  for (let i = crystalShards.length - 1; i >= 0; i--) {
    const crystal = crystalShards[i];
    const dist = Math.hypot(player.x - crystal.x, player.y - crystal.y);
    if (dist < crystal.size + player.radius) {
      // Collect crystal for shield and points (reduced)
      score += 25; // Reduced from 50
      player.activateShield();

      // Show shield activation message
      showEventText("Crystal Shield Activated! (10s)");

      // Crystal absorption effect - reduced to even fewer particles
      for (let j = 0; j < 3; j++) {
        // Reduced from 5 to 3
        const angle = (j / 3) * Math.PI * 2;
        particles.push(
          new Particle(
            crystal.x + Math.cos(angle) * 8,
            crystal.y + Math.sin(angle) * 8,
            2.5, // Slightly smaller particles
            "#00ffff",
            {
              x: Math.cos(angle) * 3, // Reduced velocity
              y: Math.sin(angle) * 3,
            }
          )
        );
      }

      crystalShards.splice(i, 1);
    }
  }

  // QuantumPortals vs Player - Teleport effect
  for (const portal of quantumPortals) {
    const dist = Math.hypot(player.x - portal.x, player.y - portal.y);
    if (dist < portal.radius + player.radius) {
      // Teleport player to random safe location
      let newX,
        newY,
        attempts = 0;
      do {
        newX = 50 + Math.random() * (canvas.width - 100);
        newY = 50 + Math.random() * (canvas.height - 100);
        attempts++;
      } while (
        attempts < 10 &&
        (asteroids.some(
          (a) => Math.hypot(newX - a.x, newY - a.y) < a.radius + 30
        ) ||
          missiles.some(
            (m) => Math.hypot(newX - m.x, newY - m.y) < m.radius + 30
          ))
      );

      player.x = newX;
      player.y = newY;
      playSound("wormhole");

      // Teleport visual effect
      for (let j = 0; j < 12; j++) {
        const angle = (j / 12) * Math.PI * 2;
        particles.push(
          new Particle(
            portal.x + Math.cos(angle) * 15,
            portal.y + Math.sin(angle) * 15,
            Math.cos(angle) * 5,
            Math.sin(angle) * 5,
            "#9c27b0"
          )
        );
      }
    }
  }

  // ShieldGenerators vs Player - Protection benefit already handled in class

  // FreezeZones vs Player - Slow down player
  for (const freeze of freezeZones) {
    const dist = Math.hypot(player.x - freeze.x, player.y - freeze.y);
    if (dist < freeze.radius + player.radius) {
      // Slow down player movement
      player.velocity.x *= freeze.effectStrength;
      player.velocity.y *= freeze.effectStrength;
    }
  }

  // --- INTER-OBJECT COLLISIONS ---

  // EnergyOrbs vs Asteroids - Destroy asteroids
  for (let i = energyOrbs.length - 1; i >= 0; i--) {
    const orb = energyOrbs[i];
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      const dist = Math.hypot(orb.x - asteroid.x, orb.y - asteroid.y);
      if (dist < orb.radius + asteroid.radius) {
        // Energy orb destroys asteroid (reduced points)
        score += 15; // Reduced from 25
        playSound("explosion");

        // Create fragments from destroyed asteroid
        for (let k = 0; k < 5; k++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 3;
          fragments.push(
            new Fragment(
              asteroid.x + Math.cos(angle) * 10,
              asteroid.y + Math.sin(angle) * 10,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed
            )
          );
        }

        asteroids.splice(j, 1);
        energyOrbs.splice(i, 1);
        break;
      }
    }
  }

  // PlasmaFields vs Asteroids - Melt asteroids
  for (const plasma of plasmaFields) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      const dist = Math.hypot(plasma.x - asteroid.x, plasma.y - asteroid.y);
      if (dist < plasma.radius + asteroid.radius) {
        // Plasma melts asteroid gradually
        asteroid.radius -= 0.5;
        if (asteroid.radius <= 5) {
          asteroids.splice(j, 1);
          score += 10; // Reduced from 15
        }
      }
    }
  }

  // CrystalShards vs Asteroids - Crystal protection
  for (const crystal of crystalShards) {
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];
      const dist = Math.hypot(crystal.x - asteroid.x, crystal.y - asteroid.y);
      if (dist < crystal.size + asteroid.radius) {
        // Crystal deflects asteroid
        asteroid.velocity.x *= -0.8;
        asteroid.velocity.y *= -0.8;
      }
    }
  }

  // QuantumPortals vs Missiles - Redirect missiles
  for (const portal of quantumPortals) {
    for (const missile of missiles) {
      const dist = Math.hypot(portal.x - missile.x, portal.y - missile.y);
      if (dist < portal.radius + missile.radius) {
        // Redirect missile away from player
        const awayFromPlayer = Math.atan2(
          missile.y - player.y,
          missile.x - player.x
        );
        missile.angle = awayFromPlayer;
        playSound("wormhole");
      }
    }
  }

  // Enhanced Difficulty Progression - Score-based levels with increased threshold
  const difficultyLevel = Math.floor(score / 2500) + 1; // Every 2500 points (increased from 1500)

  if (difficultyLevel > lastDifficultyLevel && difficultyLevel > 0) {
    // Update last difficulty level to prevent infinite spawning
    lastDifficultyLevel = difficultyLevel;

    // Show difficulty increase message
    showEventText(`🌀 LEVEL ${difficultyLevel} 🌀`);
    playSound("powerup");

    // Chaos Manifest event removed as requested
    // setTimeout(() => {
    //   if (typeof triggerChaosEvent === "function") {
    //     triggerChaosEvent(difficultyLevel);
    //   }
    // }, 2000);

    // Progressive difficulty scaling - tăng độ khó nhiều hơn khi lên level
    globalSpeedMultiplier +=
      GAME_CONFIG.difficulty.speedIncreaseStep * (1 + difficultyLevel * 0.2); // Tăng hệ số từ 0.1 lên 0.2
    if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval) {
      spawnInterval -=
        GAME_CONFIG.difficulty.spawnDecreaseStep * (1 + difficultyLevel * 0.08); // Tăng hệ số từ 0.05 lên 0.08
    }

    // Unlock more dangerous events at higher levels
    if (difficultyLevel >= 3) {
      // Trigger additional event at level 3+
      if (Math.random() < 0.3) {
        setTimeout(() => triggerRandomEvent(), 2000);
      }
    }

    if (difficultyLevel >= 5) {
      // Overlapping events at level 5+
      if (Math.random() < 0.4) {
        setTimeout(() => triggerRandomEvent(), 1000);
        setTimeout(() => triggerRandomEvent(), 3000);
      }
    }
  }

  // Time-based difficulty increase
  if (timers.difficulty % (60 * 15) === 0 && timers.difficulty > 0) {
    // Every 15 seconds - silent progression
    globalSpeedMultiplier += 0.02;

    // Decrease event intervals over time - slower reduction
    if (GAME_CONFIG.events.interval > 800) {
      GAME_CONFIG.events.interval -= 20;
    }
  }

  // Micro-progression for continuous challenge
  if (timers.difficulty % GAME_CONFIG.difficulty.microProgressInterval === 0) {
    if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval + 3)
      spawnInterval -= 1;
    globalSpeedMultiplier +=
      GAME_CONFIG.difficulty.microSpeedIncrease *
      (1 + Math.floor(score / 2500) * 0.02); // Using score-based levels (threshold increased from 1500 to 2500)
  }

  // Survival milestone rewards removed as requested
}; // Close window.animate function

// Event system moved to js/core/eventSystem.js

console.log("Game.js loaded successfully");
