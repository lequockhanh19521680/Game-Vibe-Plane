// --- Game Logic ---
function createNebula() {
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
}

function init() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  mouse = { x: width / 2, y: height * 0.8 };
  prevMouse = { ...mouse };
  isGameRunning = true;
  score = 0;
  gameStartTime = Date.now();
  survivalTime = 0;
  lastDifficultyLevel = 0;
  spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval;
  globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed;
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
  };

  if (typeof resetEventSystem === "function") {
    resetEventSystem();
  }

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
}

function animate() {
  // Add a guard to ensure the animation loop stops when the game ends
  if (!isGameRunning) {
    cancelAnimationFrame(animationFrameId);
    return;
  }

  animationFrameId = requestAnimationFrame(animate);
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);
  nebulae.forEach((n) => {
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, width, height);
  });

  stars.sort((a, b) => a.layer - b.layer).forEach((s) => s.update());

  timers.difficulty++;

  // Update survival time
  survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
  const minutes = Math.floor(survivalTime / 60);
  const seconds = survivalTime % 60;
  uiElements.survivalDisplay.innerText = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const distMoved = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
  const scorePerLevel = GAME_CONFIG.difficulty.scorePerLevel;

  // Dynamic movement threshold
  const currentLevel = Math.floor(score / scorePerLevel) + 1; // Level tăng mỗi scorePerLevel điểm
  const dynamicThreshold = Math.max(
    GAME_CONFIG.scoring.minMovementThreshold,
    GAME_CONFIG.scoring.baseMovementThreshold *
      Math.pow(GAME_CONFIG.scoring.thresholdDecreaseRate, currentLevel)
  );

  // Chỉ tăng điểm khi di chuyển đủ xa (threshold giảm dần theo level)
  if (distMoved >= dynamicThreshold) {
    score += distMoved * GAME_CONFIG.scoring.movementMultiplier;
  }
  prevMouse = { ...mouse };
  uiElements.scoreDisplay.innerText = `${~~score}`;
  if (uiElements.levelDisplay) {
    uiElements.levelDisplay.innerText = `Level ${currentLevel}`;
  }

  // Update level progress bar with corrected logic for accuracy
  const scoreForLevelUp = scorePerLevel;
  const scoreAtStartOfCurrentLevel = (currentLevel - 1) * scoreForLevelUp;
  const scoreProgressInLevel = score - scoreAtStartOfCurrentLevel;
  const progressPercentage = (scoreProgressInLevel / scoreForLevelUp) * 100;
  const levelProgressBar = document.getElementById("level-progress-bar");
  if (levelProgressBar) {
    levelProgressBar.style.width = `${Math.min(100, progressPercentage)}%`;
  }

  // VÒNG LẶP UPDATE TỐI ƯU: Đưa tất cả các mảng vào một mảng cha và xử lý update
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
    wormholes,
    magneticStorms,
    lightningStorms,
  ].forEach((arr) =>
    arr.forEach((item) => (item.update ? item.update() : undefined))
  );
  player.update(); // Update player last to draw over everything

  // --- Filter dead entities & Apply Hard Limits (Optimization) ---

  // Lọc và giới hạn Fragments
  fragments = fragments.filter((f) => f.life > 0 && f.y < height + 50);
  if (fragments.length > GAME_CONFIG.advanced.maxFragments) {
    // Nếu vượt quá giới hạn, cắt bỏ các phần tử cũ nhất (đầu mảng)
    fragments.splice(0, fragments.length - GAME_CONFIG.advanced.maxFragments);
  }

  // Lọc và giới hạn Particles
  particles = particles.filter((p) => p.alpha > 0);
  if (particles.length > GAME_CONFIG.advanced.maxParticles) {
    // Nếu vượt quá giới hạn, cắt bỏ các phần tử cũ nhất (đầu mảng)
    particles.splice(0, particles.length - GAME_CONFIG.advanced.maxParticles);
  }

  // Lọc các vật thể khác (giữ nguyên logic cũ)
  missiles = missiles.filter((m) => !m.isDead);
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
  wormholes = wormholes.filter((w) => w.update() !== false);
  magneticStorms = magneticStorms.filter((m) => m.update() !== false);
  lightningStorms = lightningStorms.filter((l) => l.update() !== false);

  // --- Event System ---
  if (score >= nextEventScore) {
    // Call the event system function, not the local one
    if (typeof window.triggerRandomEvent === 'function') {
      window.triggerRandomEvent();
    }
    // Random event timing for unpredictability
    const eventVariation = 0.7 + Math.random() * 0.6; // 70%-130% of base interval
    nextEventScore += GAME_CONFIG.events.interval * eventVariation;
  }
  if (eventActive.type && timers.difficulty > eventActive.endTime) {
    if (eventActive.type === "speedZone")
      globalSpeedMultiplier /= GAME_CONFIG.events.speedZone.speedMultiplier;
    eventActive.type = null;
  }

  let currentSpawnInterval =
    eventActive.type === "denseField" && timers.difficulty < eventActive.endTime
      ? GAME_CONFIG.events.denseField.spawnInterval
      : spawnInterval;

  // --- Spawning Logic ---
  timers.asteroid++;
  if (timers.asteroid % currentSpawnInterval === 0) {
    const difficultyLevel = Math.floor(score / scorePerLevel); // Every scorePerLevel points
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
    // Predictable asteroid patterns - mostly from top
    let spawnX, spawnY, velocityX, velocityY;
    const spawnPattern = Math.random();

    if (spawnPattern < 0.7) {
      // Top spawn straight down (70%)
      spawnX = Math.random() * width;
      spawnY = -30;
      velocityX = 0;
      velocityY = asteroidSpeed;
    } else if (spawnPattern < 0.9) {
      // Top spawn with slight angle (20%)
      spawnX = Math.random() * width;
      spawnY = -30;
      velocityX = (Math.random() - 0.5) * asteroidSpeed * 0.3; // Very slight angle
      velocityY = asteroidSpeed;
    } else {
      // Diagonal from corners (10%)
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
  if (score > GAME_CONFIG.blackHoles.spawnScore) {
    timers.blackHole++;
    if (timers.blackHole % GAME_CONFIG.blackHoles.spawnInterval === 0) {
      const bhX = Math.random() * width * 0.8 + width * 0.1;
      const bhY = Math.random() * height * 0.8;
      // Use spawnWithWarning for Black Hole
      const warningSystem = spawnWithWarning("blackhole", bhX, bhY, {
        duration: GAME_CONFIG.blackHoles.warningDuration,
      });

      warningSystem.spawn(() => {
        blackHoles.push(new BlackHole(bhX, bhY));
        playSound("blackhole");
      });
    }
  }

  // THÊM LOGIC SPAWN ENERGY ORB: Energy Orb xuất hiện định kỳ
  if (score > 1000) {
    // Bắt đầu spawn Energy Orb sau 1000 điểm
    timers.energyOrb = (timers.energyOrb || 0) + 1;
    if (timers.energyOrb % 1500 === 0) {
      // Mỗi 1500 frames (khoảng 25 giây)
      energyOrbs.push(
        new EnergyOrb(
          Math.random() * width,
          Math.random() * height * 0.6 // Giới hạn ở 60% màn hình để không quá gần Player
        )
      );
    }
  }

  // --- CẬP NHẬT LOGIC SPAWN MISSILE VỚI DIRECTIONAL WARNING ---
  if (score > GAME_CONFIG.missiles.spawnScore) {
    timers.missile++;
    if (timers.missile % GAME_CONFIG.missiles.spawnInterval === 0) {
      // Determine spawn side and position
      const sides = ["left", "right", "top", "bottom"];
      const side = sides[Math.floor(Math.random() * sides.length)];
      let warningX, warningY, missileAngle, spawnX, spawnY;
      const warningOffset = 50; // Warning position inside canvas
      const spawnOffset = 30; // Missile spawn position outside canvas

      switch (side) {
        case "left":
          warningX = warningOffset;
          warningY =
            Math.random() * (height - 2 * warningOffset) + warningOffset;
          missileAngle = 0; // Move right
          spawnX = -spawnOffset;
          spawnY = warningY;
          break;
        case "right":
          warningX = width - warningOffset;
          warningY =
            Math.random() * (height - 2 * warningOffset) + warningOffset;
          missileAngle = Math.PI; // Move left
          spawnX = width + spawnOffset;
          spawnY = warningY;
          missileAngle = Math.PI;
          break;
        case "top":
          warningX =
            Math.random() * (width - 2 * warningOffset) + warningOffset;
          warningY = warningOffset;
          missileAngle = Math.PI / 2; // Move down
          spawnX = warningX;
          spawnY = -spawnOffset;
          missileAngle = Math.PI / 2;
          break;
        case "bottom":
          warningX =
            Math.random() * (width - 2 * warningOffset) + warningOffset;
          warningY = height - warningOffset;
          missileAngle = -Math.PI / 2; // Move up
          spawnX = warningX;
          spawnY = height + spawnOffset;
          missileAngle = -Math.PI / 2;
          break;
      }

      // Use spawnWithWarning for Directional Warning
      const warningSystem = spawnWithWarning(
        "missile", // Type
        warningX, // Warning X
        warningY, // Warning Y
        {
          angle: missileAngle, // Directional angle
          duration: GAME_CONFIG.missiles.warningDuration,
        }
      );

      // Spawn the Missile using the calculated initial position and angle
      warningSystem.spawn(() => {
        // Missile constructor now accepts x, y, angle
        missiles.push(new Missile(spawnX, spawnY, missileAngle));
      });
    }
  }
  // --- END CẬP NHẬT LOGIC SPAWN MISSILE ---

  if (score > GAME_CONFIG.lasers.spawnScore) {
    timers.laser++;
    const difficultyLevel = Math.floor(score / scorePerLevel);
    const laserInterval = Math.max(
      GAME_CONFIG.lasers.minInterval,
      GAME_CONFIG.lasers.baseInterval -
        difficultyLevel * GAME_CONFIG.lasers.intervalDecreasePerLevel
    );
    if (timers.laser % laserInterval === 0) {
      // Multiple lasers for higher intensity
      const laserCount = Math.min(
        GAME_CONFIG.lasers.maxConcurrent,
        1 + Math.floor(difficultyLevel / GAME_CONFIG.lasers.lasersPerLevel)
      );

      for (let i = 0; i < laserCount; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const targetChance = Math.min(
              GAME_CONFIG.lasers.maxTargetChance,
              GAME_CONFIG.lasers.baseTargetChance +
                difficultyLevel *
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
  }
  if (score > GAME_CONFIG.laserMines.spawnScore) {
    timers.mine++;
    if (timers.mine % GAME_CONFIG.laserMines.spawnInterval === 0)
      laserMines.push(
        new LaserMine(
          Math.random() * width * 0.8 + width * 0.1,
          Math.random() * height * 0.6
        )
      );
  }
  if (score > 9000) {
    timers.crystal++;
    if (timers.crystal % 800 === 0)
      crystalClusters.push(
        new CrystalCluster(Math.random() * width, Math.random() * height * 0.7)
      );
  }

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
        }
      }
    }
  }

  for (const cluster of crystalClusters) {
    if (cluster.state !== "discharging") continue;
    // Nếu cluster có alpha hoặc fading theo tuổi/lifetime, bỏ qua khi đã mờ
    let alpha = 1;
    if (
      typeof cluster.lifetime === "number" &&
      typeof cluster.age === "number"
    ) {
      alpha = Math.max(0, (cluster.lifetime - cluster.age) / cluster.lifetime);
    } else if (typeof cluster.alpha === "number") {
      alpha = cluster.alpha;
    }
    if (alpha <= 0.45) continue;

    const dist = Math.hypot(player.x - cluster.x, player.y - cluster.y);
    const collisionDist = cluster.dischargeRadius + player.radius;
    console.log(
      "Checking crystal cluster collision:",
      dist,
      collisionDist,
      "alpha",
      alpha
    );
    if (dist >= collisionDist) continue;

    if (!player.shieldActive) {
      endGame("crystal cluster collision");
      return;
    }

    cluster.state = "fading";
  }

  for (let i = fragments.length - 1; i >= 0; i--) {
    const fragment = fragments[i];

    const isOverlapping =
      player.x < fragment.x + fragment.radius &&
      player.x + player.radius > fragment.x - fragment.radius &&
      player.y < fragment.y + fragment.radius &&
      player.y + player.radius > fragment.y - fragment.radius;

    if (fragment.lethal && isOverlapping) {
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
      // TỐI ƯU VA CHẠM: Giữ nguyên Math.hypot cho độ chính xác khi vật thể lớn
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
        score += GAME_CONFIG.fragments.scoreBonus;
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

    // ĐIỀU CHỈNH LỖI: Kiểm tra va chạm với cả lá chắn
    const isCollected = dist < orb.radius + player.radius;
    const isBlocked =
      dist < orb.radius + player.thunderShieldRadius &&
      player.thunderShieldActive;
    const isShielded =
      dist < orb.radius + player.radius * 2.5 && player.shieldActive; // Bán kính lá chắn thường là 2.5 lần bán kính player

    if (isCollected || isBlocked || isShielded) {
      // Positive effect - boost score
      score += 50;
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
    // Bỏ qua plasma đã gần hết (alpha quá nhỏ)
    const alpha = Math.max(0, (plasma.lifetime - plasma.age) / plasma.lifetime);
    if (alpha < 0.05) {
      // Debug: plasma đã mờ, không va chạm
      // console.log('Skip plasma', plasma, 'alpha', alpha);
      continue;
    }
    const dist = Math.hypot(player.x - plasma.x, player.y - plasma.y);
    if (dist < plasma.radius + player.radius) {
      // Debug: plasma gây va chạm
      console.log("Plasma collision:", {
        x: plasma.x,
        y: plasma.y,
        age: plasma.age,
        lifetime: plasma.lifetime,
        alpha,
        dist,
        radius: plasma.radius,
      });
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
      // Collect crystal for shield and points
      score += 50;
      player.activateShield();

      // Show shield activation message
      if (typeof showEventText === "function") {
        showEventText("Crystal Shield Activated!");
      }

      // Crystal absorption effect
      for (let j = 0; j < 12; j++) {
        const angle = (j / 12) * Math.PI * 2;
        particles.push(
          new Particle(
            crystal.x + Math.cos(angle) * 8,
            crystal.y + Math.sin(angle) * 8,
            3,
            "#00ffff",
            {
              x: Math.cos(angle) * 4,
              y: Math.sin(angle) * 4,
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
        // Energy orb destroys asteroid
        score += 25;
        playSound("explosion");

        // Create fragments from destroyed asteroid
        for (let k = 0; k < 5; k++) {
          const angle = Math.random() * Math.PI * 2;
          fragments.push(
            new Fragment(
              asteroid.x + Math.cos(angle) * 10,
              asteroid.y + Math.sin(angle) * 10,
              Math.cos(angle),
              Math.sin(angle)
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
          score += 15;
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

  // Enhanced Difficulty Progression - Score-based levels
  const difficultyLevel = Math.floor(score / scorePerLevel); // Every scorePerLevel points

  if (difficultyLevel > lastDifficultyLevel && difficultyLevel > 0) {
    // Update last difficulty level to prevent infinite spawning
    lastDifficultyLevel = difficultyLevel;

    // Show difficulty increase message
    if (typeof showEventText === "function") {
      showEventText(`LEVEL ${difficultyLevel + 1}`);
    }
    playSound("powerup");

    // Progressive difficulty scaling
    globalSpeedMultiplier +=
      GAME_CONFIG.difficulty.speedIncreaseStep * (1 + difficultyLevel * 0.1);
    if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval) {
      spawnInterval -=
        GAME_CONFIG.difficulty.spawnDecreaseStep * (1 + difficultyLevel * 0.05);
    }

    // Unlock more dangerous events at higher levels
    if (difficultyLevel >= 3) {
      // Trigger additional event at level 3+
      if (Math.random() < 0.3) {
        setTimeout(() => {
          if (typeof window.triggerRandomEvent === 'function') {
            window.triggerRandomEvent();
          }
        }, 2000);
      }
    }

    if (difficultyLevel >= 5) {
      // Overlapping events at level 5+
      if (Math.random() < 0.4) {
        setTimeout(() => {
          if (typeof window.triggerRandomEvent === 'function') {
            window.triggerRandomEvent();
          }
        }, 1000);
        setTimeout(() => {
          if (typeof window.triggerRandomEvent === 'function') {
            window.triggerRandomEvent();
          }
        }, 3000);
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
      (1 + Math.floor(score / scorePerLevel) * 0.02); // Using score-based levels
  }
}

function endGame(reason = "unknown") {
  if (!isGameRunning) return;
  console.log(`Game Over! Reason: ${reason}`);
  cancelAnimationFrame(animationFrameId);
  gameStateManager.changeState("gameOver", { reason });

  // FIX: Dừng mọi logic trong frame hiện tại ngay lập tức sau khi chuyển trạng thái game over.
  return;
}

// REMOVED: The problematic showEventText function has been removed.
// The code now relies on the queue-based showEventText in eventSystem.js

// Chaos Manifest event removed as requested
function triggerChaosEvent(level) {
  // Function disabled - Chaos Manifest event removed as requested
  return;
}
