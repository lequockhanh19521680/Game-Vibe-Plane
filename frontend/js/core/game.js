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
  uiElements.survivalDisplay.innerText = `Time: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const distMoved = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
  const scorePerLevel = GAME_CONFIG.difficulty.scorePerLevel;

  // Dynamic movement threshold - giảm dần theo level (dựa trên điểm số)
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
  uiElements.scoreDisplay.innerText = `Score: ${~~score}`;
  uiElements.levelDisplay.innerText = `Level: ${currentLevel}`;

  // Update level progress bar with corrected logic for accuracy
  const scoreForLevelUp = scorePerLevel;
  const scoreAtStartOfCurrentLevel = (currentLevel - 1) * scoreForLevelUp;
  const scoreProgressInLevel = score - scoreAtStartOfCurrentLevel;
  const progressPercentage = (scoreProgressInLevel / scoreForLevelUp) * 100;
  const levelProgressBar = document.getElementById("level-progress-bar");
  if (levelProgressBar) {
    levelProgressBar.style.width = `${Math.min(100, progressPercentage)}%`;
  }

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
  if (score >= nextEventScore) {
    triggerRandomEvent();
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
      // Show warning first
      warnings.push(
        new Warning(
          bhX,
          bhY,
          "blackhole",
          GAME_CONFIG.blackHoles.warningDuration
        )
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
  }
  if (score > GAME_CONFIG.missiles.spawnScore) {
    timers.missile++;
    if (timers.missile % GAME_CONFIG.missiles.spawnInterval === 0) {
      // Show warning at edges where missile will spawn
      const fromLeft = Math.random() > 0.5;
      const warningX = fromLeft ? 50 : width - 50;
      const warningY = Math.random() * height;
      warnings.push(
        new Warning(
          warningX,
          warningY,
          "missile",
          GAME_CONFIG.missiles.warningDuration
        )
      );
      playSound("warning");
      // Create missile after warning period
      setTimeout(() => {
        if (isGameRunning) {
          missiles.push(new Missile());
        }
      }, GAME_CONFIG.missiles.warningDelay);
    }
  }
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
  for (const cc of crystalClusters) {
    if (cc.state === "discharging") {
      const dist = Math.hypot(player.x - cc.x, player.y - cc.y);
      if (Math.abs(dist - cc.dischargeRadius) < player.radius + 5) {
        if (!player.shieldActive) {
          endGame("crystal cluster collision");
          return;
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
    if (dist < orb.radius + player.radius) {
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
      // Collect crystal for shield and points
      score += 50;
      player.activateShield();

      // Show shield activation message
      showEventText("Crystal Shield Activated! (10s)");

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
    showEventText(`🌀 LEVEL ${difficultyLevel + 1} 🌀`);
    playSound("powerup");

    // Chaos Manifest event removed as requested
    // setTimeout(() => {
    //   if (typeof triggerChaosEvent === "function") {
    //     triggerChaosEvent(difficultyLevel);
    //   }
    // }, 2000);

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
      (1 + Math.floor(score / scorePerLevel) * 0.02); // Using score-based levels
  }

  // Survival milestone rewards removed as requested
}

function showEventText(text) {
  uiElements.eventText.innerText = text;
  uiElements.eventText.style.fontSize = GAME_CONFIG.ui.eventText.fontSize;
  uiElements.eventText.style.opacity = "1";
  setTimeout(() => {
    uiElements.eventText.style.opacity = "0";
  }, GAME_CONFIG.ui.eventText.duration);
}

// Chaos Manifest event removed as requested
function triggerChaosEvent(level) {
  // Function disabled - Chaos Manifest event removed as requested
  return;
}

function triggerRandomEvent() {
  let eventTypes = [
    "denseField",
    "speedZone",
    "instantMissiles",
    "laserSwarm",
    "gravitationalAnomaly",
    "asteroidRain",
    "asteroidCircle",
    "missileBarrage",
    "laserGrid",
    "blackHoleChain",
    // New events
    "wormholePortal",
    "freezeZone",
    "magneticStorm",
    "asteroidBelt",
    "plasmaStorm",
    "crystalRain",
    "quantumTunnels",
    "gravityWells",
    "meteorBombardment",
    "voidRifts",
    "superNova",
    "lightningStorm",
  ];
  // All events available from start
  const randomEventType =
    eventTypes[Math.floor(Math.random() * eventTypes.length)];

  eventActive.endTime = timers.difficulty + GAME_CONFIG.events.duration;

  switch (randomEventType) {
    case "denseField":
      eventActive.type = "denseField";
      showEventText("Asteroid Storm!");

      // Spawn immediate wave of asteroids
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          const radius = 15 + Math.random() * 20;
          const spawnX = Math.random() * canvas.width;
          const spawnY = -30 - Math.random() * 100;
          const speed = 2 + Math.random() * 3;

          asteroids.push(
            new Asteroid(
              spawnX,
              spawnY,
              radius,
              GAME_CONFIG.asteroids.colors[
                Math.floor(Math.random() * GAME_CONFIG.asteroids.colors.length)
              ],
              { x: (Math.random() - 0.5) * 2, y: speed }
            )
          );
        }, i * 100);
      }

      playSound("warning");
      break;
    case "speedZone":
      eventActive.type = "speedZone";
      globalSpeedMultiplier *= GAME_CONFIG.events.speedZone.speedMultiplier;
      showEventText("Difficulty Spike!");
      break;
    case "instantMissiles":
      if (score > 3000) {
        eventActive.type = "instantMissiles";
        showEventText("⚠️ MISSILES INCOMING ⚠️");

        // Create missile warning indicators
        class MissileWarning {
          constructor(duration = 120) {
            this.missileData = [];
            this.timer = 0;
            this.duration = duration;

            // Pre-calculate 2 missile paths
            for (let i = 0; i < 2; i++) {
              // Create missile data similar to Missile class
              const spawnPattern = Math.random();
              let x,
                y,
                angle,
                fromLeft = false;

              if (spawnPattern < 0.4) {
                // Side spawn (40%)
                fromLeft = Math.random() > 0.5;
                x = fromLeft ? -20 : width + 20;
                y = Math.random() * height;
                angle = fromLeft ? 0 : Math.PI;
              } else if (spawnPattern < 0.7) {
                // Top/Bottom spawn (30%)
                const fromTop = Math.random() > 0.5;
                x = Math.random() * width;
                y = fromTop ? -20 : height + 20;
                angle = fromTop ? Math.PI / 2 : -Math.PI / 2;
              } else if (spawnPattern < 0.85) {
                // Corner spawn (15%)
                x = Math.random() < 0.5 ? -20 : width + 20;
                y = Math.random() < 0.5 ? -20 : height + 20;
                angle = Math.atan2(height / 2 - y, width / 2 - x);
                fromLeft = x < 0;
              } else {
                // Random edge spawn (15%)
                const edge = Math.floor(Math.random() * 4);
                switch (edge) {
                  case 0: // Top
                    x = Math.random() * width;
                    y = -20;
                    angle = Math.PI / 2;
                    break;
                  case 1: // Right
                    x = width + 20;
                    y = Math.random() * height;
                    angle = Math.PI;
                    break;
                  case 2: // Bottom
                    x = Math.random() * width;
                    y = height + 20;
                    angle = -Math.PI / 2;
                    break;
                  case 3: // Left
                    x = -20;
                    y = Math.random() * height;
                    angle = 0;
                    break;
                }
                fromLeft = x < width / 2;
              }

              this.missileData.push({
                x,
                y,
                angle,
                startX: x,
                startY: y,
              });
            }
          }

          draw() {
            ctx.save();

            // Calculate alpha based on time
            let alpha = 1;
            if (this.timer < 30) {
              alpha = this.timer / 30; // Fade in
            } else if (this.timer > this.duration - 30) {
              alpha = (this.duration - this.timer) / 30; // Fade out
            }

            ctx.globalAlpha = alpha;

            // Pulse effect for warning
            const pulse = Math.sin(this.timer * 0.2) * 0.5 + 0.5;

            for (const missile of this.missileData) {
              // Calculate projected path
              const pathLength = 200;
              const endX = missile.x + Math.cos(missile.angle) * pathLength;
              const endY = missile.y + Math.sin(missile.angle) * pathLength;

              // Draw trajectory line
              ctx.beginPath();
              ctx.moveTo(missile.startX, missile.startY);
              ctx.lineTo(endX, endY);
              ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + pulse * 0.5})`;
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 8]);
              ctx.stroke();
              ctx.setLineDash([]);

              // Draw warning icon at missile position
              ctx.fillStyle = "#ff0000";
              ctx.font = "bold 16px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🚀", missile.startX, missile.startY);

              // Draw danger zone
              ctx.beginPath();
              ctx.arc(endX, endY, 30 + pulse * 10, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 0, 0, ${0.2 * alpha})`;
              ctx.fill();
              ctx.strokeStyle = `rgba(255, 0, 0, ${0.7 * alpha})`;
              ctx.lineWidth = 2;
              ctx.stroke();

              // Draw warning symbol in danger zone
              ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
              ctx.font = "bold 18px Arial";
              ctx.fillText("⚠️", endX, endY);
            }

            ctx.restore();
          }

          update() {
            this.timer++;
            this.draw();
            return this.timer < this.duration;
          }
        }

        // Add missile warning
        warnings.push(new MissileWarning(120)); // 2 second warning

        playSound("warning");

        // Launch missiles after warning
        setTimeout(() => {
          if (isGameRunning) {
            missiles.push(new Missile());
            missiles.push(new Missile());
            showEventText("🚀 MISSILES LAUNCHED! 🚀");
          }
        }, 120 * (1000 / 60)); // 2 seconds
      } else {
        eventActive.type = "denseField";
        showEventText("Asteroid Storm!");
      }
      break;
    case "laserSwarm":
      for (let i = 0; i < GAME_CONFIG.events.laserSwarm.laserCount; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const shouldTarget =
              Math.random() < GAME_CONFIG.events.laserSwarm.targetChance;
            lasers.push(new Laser(shouldTarget));
            if (shouldTarget) playSound("warning");
          }
        }, i * GAME_CONFIG.events.laserSwarm.delay);
      }
      showEventText("Laser Swarm!");
      break;
    case "gravitationalAnomaly":
      eventActive.type = "gravitationalAnomaly";
      showEventText("⚠️ GRAVITATIONAL ANOMALY DETECTED ⚠️");

      // Create warning indicators first
      for (
        let i = 0;
        i < GAME_CONFIG.events.gravitationalAnomaly.blackHoleCount;
        i++
      ) {
        const x = 100 + Math.random() * (width - 200);
        const y = 100 + Math.random() * (height - 200);

        // Add warning signs
        warnings.push(
          new Warning(x, y, "blackhole", 180) // 3 second warning
        );

        // Create black holes after warning
        setTimeout(() => {
          if (isGameRunning) {
            blackHoles.push(new BlackHole(x, y, true));
            // Create visual effect for black hole appearance
            for (let j = 0; j < 12; j++) {
              const angle = Math.random() * Math.PI * 2;
              particles.push(
                new Particle(
                  x + Math.cos(angle) * 5,
                  y + Math.sin(angle) * 5,
                  Math.random() * 3 + 1,
                  "#aa66cc",
                  {
                    x: Math.cos(angle) * 3,
                    y: Math.sin(angle) * 3,
                  }
                )
              );
            }
            playSound("blackhole");
          }
        }, 180 * (1000 / 60)); // 3 seconds
      }

      playSound("warning");
      break;
    case "asteroidCircle":
      eventActive.type = "asteroidCircle";
      showEventText("Asteroid Circle Formation!");
      triggerAsteroidCircle();
      break;
    case "asteroidRain":
      eventActive.type = "asteroidRain";
      showEventText("Asteroid Rain!");
      for (let i = 0; i < GAME_CONFIG.events.asteroidRain.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            asteroids.push(
              new Asteroid(
                Math.random() * width,
                -30,
                GAME_CONFIG.events.asteroidRain.minRadius +
                  Math.random() *
                    (GAME_CONFIG.events.asteroidRain.maxRadius -
                      GAME_CONFIG.events.asteroidRain.minRadius),
                "#ff4444",
                {
                  x: 0,
                  y:
                    (GAME_CONFIG.events.asteroidRain.speedMultiplier +
                      Math.random() *
                        GAME_CONFIG.events.asteroidRain.speedVariation) *
                    globalSpeedMultiplier,
                }
              )
            );
          }
        }, i * GAME_CONFIG.events.asteroidRain.delay);
      }
      break;
    case "missileBarrage":
      eventActive.type = "missileBarrage";
      showEventText("🚀 MISSILE BARRAGE INCOMING! 🚀");
      for (let i = 0; i < GAME_CONFIG.events.missileBarrage.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            missiles.push(new Missile());
          }
        }, i * GAME_CONFIG.events.missileBarrage.delay);
      }
      playSound("warning");
      break;
    case "laserGrid":
      for (let i = 0; i < GAME_CONFIG.events.laserGrid.gridSize; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            // Create a grid pattern of lasers
            lasers.push(new Laser(false));
            lasers.push(new Laser(true));
            if (i % 2 === 0) {
              lasers.push(new Laser(Math.random() < 0.5));
            }
          }
        }, i * GAME_CONFIG.events.laserGrid.delay);
      }
      showEventText("Laser Grid!");
      break;
    case "blackHoleChain":
      for (let i = 0; i < GAME_CONFIG.events.blackHoleChain.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.7;
            warnings.push(
              new Warning(
                x,
                y,
                "blackhole",
                GAME_CONFIG.blackHoles.warningDuration
              )
            );
            setTimeout(() => {
              if (isGameRunning) {
                blackHoles.push(new BlackHole(x, y, true));
                playSound("blackhole");
              }
            }, GAME_CONFIG.events.blackHoleChain.warningDelay);
          }
        }, i * GAME_CONFIG.events.blackHoleChain.delay);
      }
      showEventText("Black Hole Chain!");
      break;

    case "wormholePortal":
      eventActive.type = "wormholePortal";
      showEventText("Wormhole Assault!");
      for (let i = 0; i < GAME_CONFIG.events.wormholePortal.count; i++) {
        setTimeout(() => {
          // Create wormhole that shoots asteroids
          const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
          const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
          wormholes.push(new Wormhole(x, y));
        }, i * 1000); // Spawn wormholes with 1 second delay
      }
      playSound("wormhole");
      break;

    case "freezeZone":
      eventActive.type = "freezeZone";
      showEventText("Freeze Zones Activated!");
      for (let i = 0; i < GAME_CONFIG.events.freezeZone.count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        freezeZones.push(new FreezeZone(x, y));
      }
      playSound("freeze");
      break;

    case "magneticStorm":
      eventActive.type = "magneticStorm";
      showEventText("Magnetic Storm Detected!");

      // Create magnetic storm
      magneticStorms.push(new MagneticStorm());

      playSound("warning");
      triggerScreenShake(0.3);
      break;

    case "asteroidBelt":
      eventActive.type = "asteroidBelt";
      showEventText("Asteroid Belt!");
      triggerAsteroidBelt();
      break;

    // Laser Turrets event removed as requested

    case "plasmaStorm":
      eventActive.type = "plasmaStorm";
      showEventText("⚠️ PLASMA INFERNO IMMINENT ⚠️");

      // Pre-calculate all plasma field positions
      class PlasmaWarning {
        constructor(duration) {
          this.positions = [];
          this.timer = 0;
          this.duration = duration;
          this.warningDelay = duration * 0.7; // 70% time for warning, 30% for impact

          // Pre-calculate plasma positions for 4 waves, 5 fields per wave
          const waveCount = 4;
          const fieldsPerWave = 5;

          for (let wave = 0; wave < waveCount; wave++) {
            const baseY = (canvas.height / 5) * (wave + 1);

            for (let field = 0; field < fieldsPerWave; field++) {
              // Calculate position within the wave
              const x =
                (canvas.width / (fieldsPerWave + 1)) * (field + 1) +
                (Math.random() - 0.5) * 80;
              const y = baseY + (Math.random() - 0.5) * 60;
              const timing =
                ((wave * fieldsPerWave + field) * 80) / (1000 / 60); // Convert ms to frames

              this.positions.push({
                x,
                y,
                wave,
                timing,
                radius: 60 + Math.random() * 20, // Randomize radius slightly
              });
            }
          }
        }

        draw() {
          ctx.save();

          for (const pos of this.positions) {
            // Only show warnings that will appear soon
            if (
              this.timer + 60 > pos.timing &&
              this.timer < this.warningDelay
            ) {
              // Calculate warning progress (0-1)
              let alpha = 1;
              if (this.timer > this.warningDelay - 30) {
                // Fade out as plasma approaches
                alpha = (this.warningDelay - this.timer) / 30;
              } else if (this.timer < 30) {
                // Fade in
                alpha = this.timer / 30;
              }

              // Calculate warning intensity
              const pulseIntensity =
                Math.sin(this.timer * 0.2 + pos.wave) * 0.5 + 0.5;

              // Draw warning zone
              ctx.globalAlpha = alpha * 0.5;
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, pos.radius * 0.8, 0, Math.PI * 2);
              const gradient = ctx.createRadialGradient(
                pos.x,
                pos.y,
                0,
                pos.x,
                pos.y,
                pos.radius * 0.8
              );
              gradient.addColorStop(
                0,
                `rgba(255, 80, 0, ${0.3 + pulseIntensity * 0.2})`
              );
              gradient.addColorStop(0.7, `rgba(255, 50, 0, ${0.2 * alpha})`);
              gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
              ctx.fillStyle = gradient;
              ctx.fill();

              // Draw warning outline
              ctx.beginPath();
              ctx.arc(
                pos.x,
                pos.y,
                pos.radius * (0.7 + pulseIntensity * 0.1),
                0,
                Math.PI * 2
              );
              ctx.strokeStyle = `rgba(255, 120, 0, ${0.7 * alpha})`;
              ctx.lineWidth = 2;
              ctx.setLineDash([10, 5]);
              ctx.stroke();
              ctx.setLineDash([]);

              // Draw warning symbol
              ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
              ctx.font = "bold 18px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🔥", pos.x, pos.y);
            }
          }

          ctx.restore();
        }

        update() {
          this.timer++;
          this.draw();
          return this.timer < this.duration;
        }
      }

      // Create plasma warning with 180 frames duration (3 seconds)
      const plasmaWarning = new PlasmaWarning(180);
      warnings.push(plasmaWarning);

      playSound("warning");

      // Create plasma storm after warning delay
      setTimeout(() => {
        if (isGameRunning) {
          showEventText("🔥 PLASMA INFERNO UNLEASHED 🔥");

          // Use the same positions as in the warnings
          for (let i = 0; i < plasmaWarning.positions.length; i++) {
            const pos = plasmaWarning.positions[i];

            setTimeout(() => {
              if (isGameRunning) {
                // Create plasma field at the exact warning position
                const plasma = new PlasmaField(pos.x, pos.y);
                plasma.radius = pos.radius * 1.2; // Slightly bigger than warning
                plasma.damageRate = 0.04; // More dangerous
                plasmaFields.push(plasma);

                // Create plasma lightning between fields
                if (i % 3 === 0 && plasmaFields.length > 1) {
                  for (let j = 0; j < 5; j++) {
                    particles.push(
                      new Particle(
                        pos.x + Math.random() * 100 - 50,
                        pos.y + Math.random() * 50 - 25,
                        Math.random() * 4 + 2,
                        "#ff6600",
                        {
                          x: (Math.random() - 0.5) * 6,
                          y: (Math.random() - 0.5) * 6,
                        }
                      )
                    );
                  }
                }
              }
            }, i * 80);
          }

          // Screen shake for intensity
          triggerScreenShake(0.8);
          playSound("explosion");
        }
      }, 180 * (1000 / 60)); // 3 seconds warning
      break;

    case "crystalRain":
      eventActive.type = "crystalRain";
      showEventText("Cosmic Crystal Storm!");

      // Create clusters of drifting crystals
      for (let cluster = 0; cluster < 4; cluster++) {
        const clusterX = (canvas.width / 5) * (cluster + 1);
        const clusterY = Math.random() * canvas.height * 0.3;

        for (let i = 0; i < GAME_CONFIG.events.crystalRain.count / 4; i++) {
          setTimeout(() => {
            // Create crystals in cluster formation
            const x = clusterX + (Math.random() - 0.5) * 150;
            const y = clusterY + (Math.random() - 0.5) * 80;

            const crystal = new CrystalShard(x, y);

            // Set initial drifting velocity
            crystal.velocity.x = (Math.random() - 0.5) * 2;
            crystal.velocity.y = Math.random() * 1.5 + 0.5;

            // Add some orbital motion around cluster center
            const angle = Math.atan2(y - clusterY, x - clusterX);
            crystal.velocity.x += Math.cos(angle + Math.PI / 2) * 0.3;
            crystal.velocity.y += Math.sin(angle + Math.PI / 2) * 0.3;

            crystalShards.push(crystal);
          }, i * GAME_CONFIG.events.crystalRain.delay + cluster * 200);
        }
      }

      // Add some scattered individual crystals
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const edge = Math.floor(Math.random() * 4);
          let x, y;

          // Spawn from different edges
          switch (edge) {
            case 0: // Top
              x = Math.random() * canvas.width;
              y = -30;
              break;
            case 1: // Right
              x = canvas.width + 30;
              y = Math.random() * canvas.height;
              break;
            case 2: // Bottom
              x = Math.random() * canvas.width;
              y = canvas.height + 30;
              break;
            case 3: // Left
              x = -30;
              y = Math.random() * canvas.height;
              break;
          }

          const crystal = new CrystalShard(x, y);

          // Set velocity toward center with some randomness
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const angle = Math.atan2(centerY - y, centerX - x);

          crystal.velocity.x = Math.cos(angle) * (0.8 + Math.random() * 0.6);
          crystal.velocity.y = Math.sin(angle) * (0.8 + Math.random() * 0.6);

          crystalShards.push(crystal);
        }, Math.random() * 3000);
      }

      playSound("crystal");
      break;

    case "quantumTunnels":
      eventActive.type = "quantumTunnels";
      showEventText("Quantum Portal Pair!");

      // Create only 2 portals (1 pair)
      const x1 = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const y1 = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
      const x2 = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const y2 = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;

      quantumPortals.push(new QuantumPortal(x1, y1));
      quantumPortals.push(new QuantumPortal(x2, y2));

      playSound("wormhole");
      break;

    case "gravityWells":
      eventActive.type = "gravityWells";
      showEventText("Gravity Well Field!");
      for (let i = 0; i < GAME_CONFIG.events.gravityWells.count; i++) {
        const x = 100 + Math.random() * (canvas.width - 200);
        const y = 100 + Math.random() * (canvas.height - 200);
        // Create mini black holes as gravity wells
        blackHoles.push(
          new BlackHole(x, y, GAME_CONFIG.events.gravityWells.radius / 2)
        );
      }
      break;

    case "meteorBombardment":
      eventActive.type = "meteorBombardment";
      showEventText("⚠️ METEOR BOMBARDMENT IMMINENT ⚠️");

      // Create meteor warning indicators
      class MeteorWarning {
        constructor(duration) {
          this.positions = [];
          this.timer = 0;
          this.duration = duration;
          this.warningDelay = duration * 0.7; // 70% time for warning, 30% for impact

          // Pre-calculate meteor positions
          for (let i = 0; i < GAME_CONFIG.events.meteorBombardment.count; i++) {
            this.positions.push({
              x: Math.random() * canvas.width,
              y: -30,
              impactY: Math.random() * (canvas.height - 100) + 50,
              timing:
                (i * GAME_CONFIG.events.meteorBombardment.delay) / (1000 / 60), // Convert ms to frames
            });
          }
        }

        draw() {
          ctx.save();
          for (const pos of this.positions) {
            // Only show warnings for meteors that will arrive soon
            if (
              this.timer + 60 > pos.timing &&
              this.timer < this.warningDelay
            ) {
              // Calculate warning progress (0-1)
              let alpha = 1;
              if (this.timer > this.warningDelay - 30) {
                // Fade out as meteor approaches
                alpha = (this.warningDelay - this.timer) / 30;
              } else if (this.timer < 30) {
                // Fade in
                alpha = this.timer / 30;
              }

              // Calculate warning line intensity
              const pulseIntensity = Math.sin(this.timer * 0.2) * 0.5 + 0.5;

              // Draw meteor trajectory
              ctx.globalAlpha = alpha * 0.6;
              ctx.beginPath();
              ctx.moveTo(pos.x, 0);
              ctx.lineTo(pos.x, pos.impactY);
              ctx.strokeStyle = `rgba(255, 80, 0, ${
                0.6 + pulseIntensity * 0.4
              })`;
              ctx.lineWidth = 2;
              ctx.setLineDash([8, 4]);
              ctx.stroke();
              ctx.setLineDash([]);

              // Draw warning indicator at impact point
              ctx.beginPath();
              ctx.arc(
                pos.x,
                pos.impactY,
                20 + pulseIntensity * 5,
                0,
                Math.PI * 2
              );
              ctx.fillStyle = `rgba(255, 80, 0, ${0.2 * alpha})`;
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = `rgba(255, 180, 0, ${0.8 * alpha})`;
              ctx.stroke();

              // Draw warning symbol
              ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
              ctx.font = "bold 16px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("⚠️", pos.x, pos.impactY);
            }
          }
          ctx.restore();
        }

        update() {
          this.timer++;
          this.draw();
          return this.timer < this.duration;
        }
      }

      // Create meteor warning with 180 frames duration (3 seconds)
      const meteorWarning = new MeteorWarning(180);
      warnings.push(meteorWarning);

      playSound("warning");

      // Launch meteors after warning delay
      setTimeout(() => {
        if (isGameRunning) {
          showEventText("☄️ METEOR BOMBARDMENT STARTED ☄️");

          for (let i = 0; i < GAME_CONFIG.events.meteorBombardment.count; i++) {
            setTimeout(() => {
              // Use the same positions as in the warning
              const position = meteorWarning.positions[i];
              const meteor = new Asteroid(
                position.x,
                -30,
                20 + Math.random() * 15,
                "#ff6b35",
                {
                  x: (Math.random() - 0.5) * 2,
                  y: GAME_CONFIG.events.meteorBombardment.speed,
                }
              );
              asteroids.push(meteor);
            }, i * GAME_CONFIG.events.meteorBombardment.delay);
          }
        }
      }, 180 * 0.7 * (1000 / 60)); // 70% of warning duration
      break;

    case "voidRifts":
      eventActive.type = "voidRifts";
      showEventText("⚠️ Void Rifts Detected ⚠️");

      for (let i = 0; i < GAME_CONFIG.events.voidRifts.count; i++) {
        const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;

        // Show warning first
        warnings.push(
          new Warning(x, y, "voidrift", 180) // 3 second warning
        );

        // Create void rift after warning
        setTimeout(() => {
          if (isGameRunning) {
            const voidRift = new BlackHole(x, y, true); // temporary void rift
            voidRift.isVoidRift = true;
            voidRift.lifetime = 300; // 5 seconds
            blackHoles.push(voidRift);
            playSound("blackhole");
          }
        }, 180 * (1000 / 60)); // 3 seconds
      }

      playSound("warning");
      playSound("blackhole");
      break;

    case "superNova":
      eventActive.type = "superNova";
      showEventText("⚠️ SUPERNOVA IMMINENT ⚠️");

      // Supernova location
      const superX = 100 + Math.random() * (canvas.width - 200);
      const superY = 100 + Math.random() * (canvas.height - 200);

      // Enhanced warning with expanding circle and multiple visual indicators
      warnings.push(
        new Warning(superX, superY, "supernova", 180) // 3 second warning
      );

      // Add an expanding circular warning zone
      class SuperNovaWarning {
        constructor(x, y, radius, duration) {
          this.x = x;
          this.y = y;
          this.maxRadius = radius;
          this.radius = 30;
          this.growthRate = (radius - 30) / (duration * 0.7); // Grow to max size in 70% of the duration
          this.timer = 0;
          this.duration = duration;
          this.alpha = 0;
        }

        draw() {
          ctx.save();

          // Calculate alpha based on time
          if (this.timer < this.duration * 0.2) {
            this.alpha = this.timer / (this.duration * 0.2); // Fade in
          } else if (this.timer > this.duration * 0.7) {
            this.alpha = (this.duration - this.timer) / (this.duration * 0.3); // Fade out
          } else {
            this.alpha = 1;
          }

          ctx.globalAlpha = this.alpha * 0.6;

          // Draw pulsing outer ring
          const pulse = Math.sin(this.timer * 0.1) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(
            this.x,
            this.y,
            this.radius * (1 + pulse * 0.05),
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = "#ff3333";
          ctx.lineWidth = 3;
          ctx.setLineDash([15, 10]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw danger zone
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.radius
          );
          gradient.addColorStop(0, "rgba(255, 0, 0, 0.1)");
          gradient.addColorStop(0.7, "rgba(255, 80, 0, 0.05)");
          gradient.addColorStop(1, "rgba(255, 150, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();

          // Draw warning symbols around the perimeter
          const symbolCount = 8;
          for (let i = 0; i < symbolCount; i++) {
            const angle = (i / symbolCount) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * this.radius;
            const y = this.y + Math.sin(angle) * this.radius;

            ctx.fillStyle = `rgba(255, 255, 0, ${
              this.alpha * (Math.sin(this.timer * 0.2 + i) * 0.5 + 0.5)
            })`;
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⚠️", x, y);
          }

          // Draw central warning symbol
          ctx.fillStyle = `rgba(255, 50, 50, ${this.alpha})`;
          ctx.font = "bold 32px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("💥", this.x, this.y);

          ctx.restore();
        }

        update() {
          this.timer++;

          // Grow the warning zone
          if (
            this.radius < this.maxRadius &&
            this.timer < this.duration * 0.7
          ) {
            this.radius += this.growthRate;
          }

          this.draw();
          return this.timer < this.duration;
        }
      }

      // Add the enhanced SuperNova warning
      const superNovaWarning = new SuperNovaWarning(superX, superY, 300, 180);
      warnings.push(superNovaWarning);

      playSound("warning");

      // Create supernova after warning
      setTimeout(() => {
        if (isGameRunning) {
          showEventText("💥 SUPERNOVA DETONATION 💥");

          // Enhanced supernova with fragment creation
          const supernova = new SuperNova(superX, superY);
          supernova.createFragmentsOnClear = true;
          superNovas.push(supernova);

          // Massive screen shake
          triggerScreenShake(1.5);

          // Thêm hiệu ứng âm thanh mạnh hơn
          playSound("explosion");
          setTimeout(() => playSound("explosion"), 200);
          setTimeout(() => playSound("blackholeDestroy"), 400);

          // Thêm hiệu ứng hạt ngay tại vị trí tạo supernova
          for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            particles.push(
              new Particle(superX, superY, Math.random() * 4 + 2, "#ffffff", {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
              })
            );
          }

          // Hiệu ứng sáng lóa
          ctx.save();
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }, 180 * (1000 / 60)); // 3 seconds
      break;

    case "lightningStorm":
      eventActive.type = "lightningStorm";
      showEventText("⚡ THUNDER SHIELD OPPORTUNITY! ⚡");

      // Create lightning storm
      lightningStorms.push(new LightningStorm());

      playSound("warning");
      triggerScreenShake(0.4);
      break;
  }
}
