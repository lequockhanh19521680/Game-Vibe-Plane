// --- Game Logic ---

/**
 * Calculates level info based on current score.
 * Uses `levelUpScores` for progression.
 * @param {number} currentScore - The player's current score.
 * @returns {{level: number, scoreToNext: number}} - The current level and score to the next level.
 */
function getLevelInfo(currentScore) {
  const levelUpScores = GAME_CONFIG.difficulty.levelUpScores;
  const scorePerLevelAfterMax = GAME_CONFIG.difficulty.scorePerLevelAfterMax;

  // Find current level based on the predefined array
  for (let i = 0; i < levelUpScores.length; i++) {
    if (currentScore < levelUpScores[i]) {
      const level = i + 1;
      const scoreAtStartOfLevel = i > 0 ? levelUpScores[i - 1] : 0;
      const scoreForNextLevel = levelUpScores[i];
      const scoreNeededForLevel = scoreForNextLevel - scoreAtStartOfLevel;
      const scoreProgressInLevel = currentScore - scoreAtStartOfLevel;
      const progressPercentage =
        scoreNeededForLevel > 0
          ? (scoreProgressInLevel / scoreNeededForLevel) * 100
          : 0;
      return { level, progressPercentage };
    }
  }

  // Calculate for levels beyond the predefined array
  const lastDefinedScore = levelUpScores[levelUpScores.length - 1];
  const levelsDefined = levelUpScores.length;
  const scoreAfter = currentScore - lastDefinedScore;
  const levelsAfter = Math.floor(scoreAfter / scorePerLevelAfterMax);
  const level = levelsDefined + 1 + levelsAfter;
  const scoreAtStartOfLevel =
    lastDefinedScore + levelsAfter * scorePerLevelAfterMax;
  const scoreForNextLevel = scoreAtStartOfLevel + scorePerLevelAfterMax;

  const scoreNeededForLevel = scoreForNextLevel - scoreAtStartOfLevel;
  const scoreProgressInLevel = currentScore - scoreAtStartOfLevel;
  const progressPercentage =
    scoreNeededForLevel > 0
      ? (scoreProgressInLevel / scoreNeededForLevel) * 100
      : 0;

  return { level, progressPercentage };
}

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
    energyOrb: 0, // Ensure energyOrb timer is initialized
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
  shieldGenerators = [];
  freezeZones = [];
  magneticStorms = [];
  lightningStorms = [];
  // REMOVED: Unused arrays for portals
  // quantumPortals = [];
  // wormholes = [];
  decoyPowerUps = [];
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
  highScore = localStorage.getItem(GAME_CONFIG.core.localStorageKey) || 0;
  uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;
}

function animate() {
  if (!isGameRunning || isPaused) {
    // Check for pause
    // cancelAnimationFrame(animationFrameId); // Handled by gameStateManager
    return;
  }

  animationFrameId = requestAnimationFrame(animate);
  ctx.fillStyle = GAME_CONFIG.canvas.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  nebulae.forEach((n) => {
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, width, height);
  });

  stars.sort((a, b) => a.layer - b.layer).forEach((s) => s.update());

  timers.difficulty++;

  survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
  uiElements.survivalDisplay.innerText = formatTime(survivalTime);

  const distMoved = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
  const { level: currentLevel, progressPercentage } = getLevelInfo(score);

  const dynamicThreshold = Math.max(
    GAME_CONFIG.scoring.minMovementThreshold,
    GAME_CONFIG.scoring.baseMovementThreshold *
      Math.pow(GAME_CONFIG.scoring.thresholdDecreaseRate, currentLevel)
  );

  if (distMoved >= dynamicThreshold) {
    score += distMoved * GAME_CONFIG.scoring.movementMultiplier;
  }
  prevMouse = { ...mouse };
  uiElements.scoreDisplay.innerText = `${~~score}`;

  if (uiElements.levelDisplay) {
    uiElements.levelDisplay.innerText = `Level ${currentLevel}`;
  }

  const levelProgressBar = document.getElementById("level-progress-bar");
  if (levelProgressBar) {
    levelProgressBar.style.width = `${Math.min(100, progressPercentage)}%`;
  }

  // Update all active entities
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
    shieldGenerators,
    freezeZones,
    magneticStorms,
    lightningStorms,
    // REMOVED: Unused portal updates
    // quantumPortals,
    // wormholes,
    decoyPowerUps,
  ].forEach((arr) =>
    arr.forEach((item) => (item.update ? item.update() : undefined))
  );
  player.update(); // Update player last

  // Filter inactive entities
  fragments = fragments.filter((f) => f.life > 0 && f.y < height + 50);
  if (fragments.length > GAME_CONFIG.core.maxFragments) {
    fragments.splice(0, fragments.length - GAME_CONFIG.core.maxFragments);
  }

  particles = particles.filter((p) => p.alpha > 0);
  if (particles.length > GAME_CONFIG.core.maxParticles) {
    particles.splice(0, particles.length - GAME_CONFIG.core.maxParticles);
  }

  missiles = missiles.filter((m) => !m.isDead);
  asteroids = asteroids.filter(
    (a) => a.x > -50 && a.x < width + 50 && a.y > -50 && a.y < height + 50
  );
  blackHoles = blackHoles.filter((bh) => bh.alpha > 0);
  crystalClusters = crystalClusters.filter((cc) =>
    cc.update ? cc.update() : false
  );
  warnings = warnings.filter((w) => w.timer < w.duration);
  energyOrbs = energyOrbs.filter((e) => e.update() !== false);
  plasmaFields = plasmaFields.filter((p) => p.update() !== false);
  crystalShards = crystalShards.filter((c) => c.update() !== false);
  shieldGenerators = shieldGenerators.filter((s) => s.update() !== false);
  freezeZones = freezeZones.filter((f) => f.update() !== false);
  magneticStorms = magneticStorms.filter((m) => m.update() !== false);
  lightningStorms = lightningStorms.filter((l) => l.update() !== false);
  // REMOVED: Unused portal filters
  // quantumPortals = quantumPortals.filter((p) => p.update() !== false);
  // wormholes = wormholes.filter((w) => w.update() !== false);
  decoyPowerUps = decoyPowerUps.filter((d) => d.update() !== false);

  // --- Trigger Events ---
  const eventConfig = GAME_CONFIG.events;
  // FIX: Removed the 'score < eventConfig.scoreThreshold.max' condition
  // ADD MORE LOGGING: Check conditions explicitly
  const shouldTriggerEvent =
    score >= nextEventScore && score >= eventConfig.scoreThreshold.min;

  if (shouldTriggerEvent) {
    console.log(
      `--- EVENT TRIGGER CHECK ---
      Score: ${score}
      Next Event Score: ${nextEventScore}
      Min Threshold: ${eventConfig.scoreThreshold.min}
      Condition Met: ${shouldTriggerEvent}`
    );

    if (typeof window.triggerRandomEvent === "function") {
      console.log("-> Calling triggerRandomEvent()...");
      window.triggerRandomEvent();
    } else {
      console.warn("-> triggerRandomEvent function not found!");
    }
    const eventVariation = 0.7 + Math.random() * 0.6; // Add variability to event timing
    nextEventScore += eventConfig.interval * eventVariation;
    console.log(`-> Updated Next Event Score: ${nextEventScore}`);
  }

  // Deactivate expired events
  if (eventActive.type && timers.difficulty > eventActive.endTime) {
    // Example: If speedZone ends, reset speed multiplier
    // Add logic here for other timed events if necessary
    eventActive.type = null;
  }

  // --- Difficulty Progression ---
  if (currentLevel > lastDifficultyLevel) {
    if (currentLevel > 1) {
      // Don't show for level 1
      const levelUpText = window.safeT
        ? window.safeT(
            "level.levelUp",
            `LEVEL ${currentLevel} REACHED!\n🔥 Difficulty Up!`
          )
        : `LEVEL ${currentLevel} REACHED!\n🔥 Difficulty Up!`;
      showEventText(levelUpText);
      playSound("powerup");
    }
    lastDifficultyLevel = currentLevel;

    // Increase difficulty parameters
    globalSpeedMultiplier += GAME_CONFIG.difficulty.speedIncreaseStep;
    if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval) {
      spawnInterval -= GAME_CONFIG.difficulty.spawnDecreaseStep;
    }
  }

  // --- Spawning Logic ---
  let currentSpawnInterval = spawnInterval; // Use the adjusted interval

  // Asteroid Spawning
  timers.asteroid++;
  if (timers.asteroid % Math.floor(currentSpawnInterval) === 0) {
    // Ensure integer interval
    // ... (rest of asteroid spawning logic) ...
    const difficultyLevel = currentLevel - 1;
    const radius =
      GAME_CONFIG.entities.asteroids.minRadius +
      Math.random() *
        (GAME_CONFIG.entities.asteroids.maxRadius -
          GAME_CONFIG.entities.asteroids.minRadius);

    const asteroidSpeed =
      (GAME_CONFIG.entities.asteroids.baseSpeed +
        Math.random() * GAME_CONFIG.entities.asteroids.speedVariation +
        difficultyLevel *
          GAME_CONFIG.entities.asteroids.speedIncreasePerLevel) *
      globalSpeedMultiplier;

    let spawnX, spawnY, velocityX, velocityY;
    const spawnPattern = Math.random();

    if (spawnPattern < GAME_CONFIG.entities.asteroids.spawnPatterns.topDown) {
      spawnX = Math.random() * width;
      spawnY = -30;
      velocityX = 0;
      velocityY = asteroidSpeed;
    } else if (
      spawnPattern <
      GAME_CONFIG.entities.asteroids.spawnPatterns.topDown +
        GAME_CONFIG.entities.asteroids.spawnPatterns.slightAngle
    ) {
      spawnX = Math.random() * width;
      spawnY = -30;
      velocityX = (Math.random() - 0.5) * asteroidSpeed * 0.3;
      velocityY = asteroidSpeed;
    } else {
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
        GAME_CONFIG.entities.asteroids.colors[
          ~~(Math.random() * GAME_CONFIG.entities.asteroids.colors.length)
        ],
        { x: velocityX, y: velocityY }
      )
    );
  }

  // Black Hole Spawning
  if (score > GAME_CONFIG.entities.blackHoles.spawnScore) {
    timers.blackHole++;
    if (
      timers.blackHole % GAME_CONFIG.entities.blackHoles.spawnInterval ===
      0
    ) {
      const bhX = Math.random() * width * 0.8 + width * 0.1;
      const bhY = Math.random() * height * 0.8;
      const warningSystem = spawnWithWarning("blackhole", bhX, bhY, {
        duration: GAME_CONFIG.entities.blackHoles.warningDuration,
      });

      warningSystem.spawn(() => {
        blackHoles.push(new BlackHole(bhX, bhY, true)); // Ensure temporary
        playSound("blackhole");
      });
    }
  }

  // Energy Orb Spawning
  if (score > GAME_CONFIG.newObjects.energyOrb.spawnThreshold) {
    timers.energyOrb = (timers.energyOrb || 0) + 1;
    if (
      timers.energyOrb % GAME_CONFIG.newObjects.energyOrb.spawnInterval ===
      0
    ) {
      energyOrbs.push(
        new EnergyOrb(Math.random() * width, Math.random() * height * 0.6)
      );
    }
  }

  // Missile Spawning
  if (score > GAME_CONFIG.entities.missiles.spawnScore) {
    timers.missile++;
    const missileConfig = GAME_CONFIG.entities.missiles;
    const difficultyLevel = currentLevel - 1;
    const missileInterval = Math.max(
      missileConfig.minSpawnInterval,
      missileConfig.spawnInterval -
        difficultyLevel * missileConfig.intervalDecreasePerLevel
    );

    if (timers.missile % Math.floor(missileInterval) === 0) {
      // Ensure integer interval
      // ... (rest of missile spawning logic) ...
      const sides = ["left", "right", "top", "bottom"];
      const side = sides[Math.floor(Math.random() * sides.length)];
      let warningX, warningY, missileAngle, spawnX, spawnY;
      const warningOffset = 50;
      const spawnOffset = 30;

      switch (side) {
        case "left":
          warningX = warningOffset;
          warningY =
            Math.random() * (height - 2 * warningOffset) + warningOffset;
          missileAngle = 0;
          spawnX = -spawnOffset;
          spawnY = warningY;
          break;
        case "right":
          warningX = width - warningOffset;
          warningY =
            Math.random() * (height - 2 * warningOffset) + warningOffset;
          missileAngle = Math.PI;
          spawnX = width + spawnOffset;
          spawnY = warningY;
          break;
        case "top":
          warningX =
            Math.random() * (width - 2 * warningOffset) + warningOffset;
          warningY = warningOffset;
          missileAngle = Math.PI / 2;
          spawnX = warningX;
          spawnY = -spawnOffset;
          missileAngle = Math.PI / 2;
          break;
        case "bottom":
          warningX =
            Math.random() * (width - 2 * warningOffset) + warningOffset;
          warningY = height - warningOffset;
          missileAngle = -Math.PI / 2;
          spawnX = warningX;
          spawnY = height + spawnOffset;
          missileAngle = -Math.PI / 2;
          break;
      }

      const warningSystem = spawnWithWarning("missile", warningX, warningY, {
        angle: missileAngle,
        duration: GAME_CONFIG.entities.missiles.warningDuration,
      });

      warningSystem.spawn(() => {
        missiles.push(new Missile(spawnX, spawnY, missileAngle));
      });
    }
  }

  // Laser Spawning
  if (score > GAME_CONFIG.entities.lasers.spawnScore) {
    timers.laser++;
    const difficultyLevel = currentLevel - 1;
    const laserInterval = Math.max(
      GAME_CONFIG.entities.lasers.minInterval,
      GAME_CONFIG.entities.lasers.baseInterval -
        difficultyLevel * GAME_CONFIG.entities.lasers.intervalDecreasePerLevel
    );
    if (timers.laser % Math.floor(laserInterval) === 0) {
      // Ensure integer interval
      // ... (rest of laser spawning logic) ...
      const laserCount = Math.min(
        GAME_CONFIG.entities.lasers.maxConcurrent,
        1 +
          Math.floor(
            difficultyLevel / GAME_CONFIG.entities.lasers.lasersPerLevel
          )
      );

      for (let i = 0; i < laserCount; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const targetChance = Math.min(
              GAME_CONFIG.entities.lasers.maxTargetChance,
              GAME_CONFIG.entities.lasers.baseTargetChance +
                difficultyLevel *
                  GAME_CONFIG.entities.lasers.targetChanceIncreasePerLevel
            );
            const shouldTarget = Math.random() < targetChance;
            lasers.push(new Laser(shouldTarget));
            if (shouldTarget) {
              playSound("warning");
            }
          }
        }, i * GAME_CONFIG.entities.lasers.staggerDelay);
      }
    }
  }

  // Laser Mine Spawning
  if (score > GAME_CONFIG.entities.laserMines.spawnScore) {
    timers.mine++;
    if (timers.mine % GAME_CONFIG.entities.laserMines.spawnInterval === 0) {
      const x = Math.random() * width * 0.8 + width * 0.1;
      const y = Math.random() * height * 0.6;
      const warningSystem = spawnWithWarning("lasermine", x, y, {
        duration: GAME_CONFIG.entities.laserMines.warningDuration,
      });
      warningSystem.spawn(() => {
        laserMines.push(new LaserMine(x, y));
      });
    }
  }

  // Crystal Cluster Spawning
  if (score > GAME_CONFIG.entities.crystalClusters.spawnScore) {
    timers.crystal++;
    if (
      timers.crystal % GAME_CONFIG.entities.crystalClusters.spawnInterval ===
      0
    ) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const warningSystem = spawnWithWarning("crystalcluster", x, y, {
        duration: GAME_CONFIG.entities.crystalClusters.warningDuration,
      });
      warningSystem.spawn(() => {
        crystalClusters.push(new CrystalCluster(x, y));
      });
    }
  }

  // --- Collision Detection ---
  // ... (rest of collision logic remains the same) ...

  // Check Asteroid-Player Collision
  for (const ast of asteroids) {
    if (
      Math.hypot(player.x - ast.x, player.y - ast.y) -
        ast.radius -
        player.radius <
      GAME_CONFIG.core.collisionPrecision
    ) {
      if (!player.shieldActive && !player.thunderShieldActive) {
        endGame("asteroid collision");
        return;
      } else {
        // Shield push effect (if needed)
        const dx = ast.x - player.x;
        const dy = ast.y - player.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        ast.velocity.x += (dx / distance) * 3;
        ast.velocity.y += (dy / distance) * 3;
      }
    }
  }
  // Check Missile-Player Collision
  for (const m of missiles) {
    if (
      Math.hypot(player.x - m.x, player.y - m.y) - m.radius - player.radius <
      GAME_CONFIG.core.collisionPrecision
    ) {
      if (!player.shieldActive && !player.thunderShieldActive) {
        endGame("missile collision");
        return;
      } else {
        // Shield push effect (if needed)
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        m.velocity.x += (dx / distance) * 4;
        m.velocity.y += (dy / distance) * 4;
      }
    }
  }

  // Check Laser-Player Collision
  for (const laser of lasers) {
    if (laser.timer > laser.maxTime + GAME_CONFIG.entities.lasers.beamDuration)
      continue;
    if (laser.fired) {
      const dx = Math.cos(laser.angle);
      const dy = Math.sin(laser.angle);
      const dist = Math.abs(
        dy * (player.x - laser.x) - dx * (player.y - laser.y)
      );
      if (dist < player.radius + GAME_CONFIG.entities.lasers.playerHitRadius) {
        if (!player.shieldActive && !player.thunderShieldActive) {
          endGame("laser collision");
          return;
        }
      }
    }
  }
  lasers = lasers.filter(
    (l) => l.timer < l.maxTime + GAME_CONFIG.entities.lasers.beamDuration
  );

  // Check Laser Mine-Player Collision
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
        if (
          dist <
          player.radius + GAME_CONFIG.entities.laserMines.beamWidth / 2
        ) {
          const dotProduct =
            (player.x - mine.x) * dx + (player.y - mine.y) * dy;
          if (dotProduct > 0) {
            // Check if player is in front of the mine's beam direction
            hitDetected = true;
            break;
          }
        }
      }

      if (hitDetected) {
        if (!player.shieldActive && !player.thunderShieldActive) {
          endGame("laser mine collision");
          return;
        }
      }
    }
  }

  // Check Crystal Cluster-Player Collision
  for (const cluster of crystalClusters) {
    if (cluster.state !== "discharging") continue;

    const dist = Math.hypot(player.x - cluster.x, player.y - cluster.y);
    const waveRadius = cluster.dischargeRadius;
    const waveWidth = 20; // Width of the wave effect
    if (Math.abs(dist - waveRadius) < player.radius + waveWidth / 2) {
      if (!player.shieldActive && !player.thunderShieldActive) {
        endGame("crystal cluster collision");
        return;
      }
    }
  }

  // Check Fragment-Player Collision (Only for specific lethal fragments if needed)
  for (let i = fragments.length - 1; i >= 0; i--) {
    const fragment = fragments[i];
    if (
      fragment.lethal && // Only check lethal fragments
      !player.shieldActive &&
      !player.thunderShieldActive &&
      Math.hypot(player.x - fragment.x, player.y - fragment.y) <
        player.radius + fragment.radius
    ) {
      endGame("fragment collision"); // Generic reason, could be specified
      return;
    }
  }

  // Check Black Hole-Player Collision
  for (let i = blackHoles.length - 1; i >= 0; i--) {
    const bh = blackHoles[i];
    if (Math.hypot(player.x - bh.x, player.y - bh.y) < bh.radius) {
      endGame("black hole collision");
      return;
    }
    // Interactions with other objects (asteroids, missiles)
    for (let j = asteroids.length - 1; j >= 0; j--) {
      if (Math.hypot(asteroids[j].x - bh.x, asteroids[j].y - bh.y) < bh.radius)
        asteroids.splice(j, 1);
    }
    for (let j = missiles.length - 1; j >= 0; j--) {
      if (Math.hypot(missiles[j].x - bh.x, missiles[j].y - bh.y) < bh.radius)
        missiles[j].isDead = true; // Mark missile for removal
    }
  }

  // Check Energy Orb-Player Collision
  for (let i = energyOrbs.length - 1; i >= 0; i--) {
    const orb = energyOrbs[i];
    if (
      Math.hypot(player.x - orb.x, player.y - orb.y) <
      orb.radius + player.radius
    ) {
      score += 50; // Orb score bonus
      playSound("powerup");
      // Particle effect on collection
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        particles.push(
          new Particle(orb.x, orb.y, 3, "#00ffff", {
            x: Math.cos(angle) * 4,
            y: Math.sin(angle) * 4,
          })
        );
      }
      energyOrbs.splice(i, 1);
    }
  }

  // Check Plasma Field-Player Collision
  for (const plasma of plasmaFields) {
    if (
      Math.hypot(player.x - plasma.x, player.y - plasma.y) <
      plasma.radius + player.radius
    ) {
      // Apply damage only if player is not shielded
      if (
        !player.shieldActive &&
        !player.thunderShieldActive &&
        Math.random() < plasma.damageRate
      ) {
        endGame("plasma field burn");
        return;
      }
    }
  }

  // Check Crystal Shard-Player Collision
  for (let i = crystalShards.length - 1; i >= 0; i--) {
    const crystal = crystalShards[i];
    if (
      Math.hypot(player.x - crystal.x, player.y - crystal.y) <
      crystal.size + player.radius
    ) {
      score += 50; // Crystal score bonus
      player.activateShield(); // Activate normal shield
      crystalShards.splice(i, 1);
    }
  }

  // Check Decoy Powerup-Player Collision
  for (let i = decoyPowerUps.length - 1; i >= 0; i--) {
    const decoy = decoyPowerUps[i];
    if (
      Math.hypot(player.x - decoy.x, player.y - decoy.y) <
      decoy.size + player.radius
    ) {
      decoy.explode(); // Trigger the trap
      decoyPowerUps.splice(i, 1); // Remove it
    }
  }

  if (timers.difficulty % GAME_CONFIG.difficulty.microProgressInterval === 0) {
    if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval + 3)
      spawnInterval -= 1;
    globalSpeedMultiplier += GAME_CONFIG.difficulty.microSpeedIncrease;
  }
}

function endGame(reason = "unknown") {
  if (!isGameRunning) return;

  console.log(`Game Over! Reason: ${reason}`);
  isGameRunning = false; // Set game state flag
  gameStateManager.changeState("gameOver", { reason });
}
