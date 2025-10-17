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
score = 0;
gameStartTime = Date.now();
survivalTime = 0;
lastDifficultyLevel = 0;
spawnInterval = GAME_CONFIG.difficulty.baseSpawnInterval || 60;
globalSpeedMultiplier = GAME_CONFIG.difficulty.baseSpeed || 1.0;
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
  speedScore: 0,
  event: 0,
  gameFrame: 0,
};
// Reset UI cache
lastDisplayedScore = -1;
lastDisplayedTime = "";
lastDisplayedSurvivalTime = "";
lastSurvivalSecond = 0;
// Reset event timeouts
if (window._eventTimeouts && Array.isArray(window._eventTimeouts)) {
  window._eventTimeouts.forEach((id) => clearTimeout(id));
  window._eventTimeouts = [];
} else {
  window._eventTimeouts = [];
}
// Always show score/time UI when game starts
if (uiElements && uiElements.scoreContainer) {
  uiElements.scoreContainer.style.opacity = "1";
  uiElements.scoreContainer.style.display = "block";
}
console.log(
  "🎮 Game FULLY RESET - Score:",
  score,
  "Level:",
  lastDifficultyLevel
);
console.log("🎮 UI Elements:", {
  scoreDisplay: uiElements.scoreDisplay,
  survivalDisplay: uiElements.survivalDisplay,
  highscoreDisplay: uiElements.highscoreDisplay,
});
// Declare all game arrays at the top
let stars = [];
let asteroids = [];
let particles = [];
let lasers = [];
let blackHoles = [];
let missiles = [];
let laserMines = [];
let laserTurrets = [];
let crystalClusters = [];
let fragments = [];
let warnings = [];
let energyOrbs = [];
let plasmaFields = [];
let crystalShards = [];
let quantumPortals = [];
let shieldGenerators = [];
let freezeZones = [];
let superNovas = [];
let wormholes = [];
let magneticStorms = [];
let lightningStorms = [];
let gravityWaves = [];
let timeDistortions = [];
let chainLightnings = [];
let voidRifts = [];
let cosmicMines = [];
let nebulae = [];

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
  .map(() => window.createNebula());

animationFrameId = requestAnimationFrame(animate);

// Make animate function globally available
window.animate = function () {
  animationFrameId = requestAnimationFrame(animate);
  if (window.isGamePaused && window.isGamePaused()) {
    // Just redraw the current frame without updating game state
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, width, height);

    // Draw background nebulae
    nebulae.forEach((n) => {
      ctx.fillStyle = n;
      ctx.fillRect(0, 0, width, height);
    });

    // Draw all objects in their current positions
    stars.forEach((star) => star.draw());
    asteroids.forEach((asteroid) => asteroid.draw());
    lasers.forEach((laser) => laser.draw());
    blackHoles.forEach((blackHole) => blackHole.draw());
    missiles.forEach((missile) => missile.draw());
    laserMines.forEach((mine) => mine.draw());
    crystalClusters.forEach((crystal) => crystal.draw());
    fragments.forEach((fragment) => fragment.draw());
    particles.forEach((particle) => particle.draw());
    warnings.forEach((warning) => warning.draw());
    energyOrbs.forEach((orb) => orb.draw());
    plasmaFields.forEach((field) => field.draw());
    crystalShards.forEach((shard) => shard.draw());
    quantumPortals.forEach((portal) => portal.draw());
    shieldGenerators.forEach((shield) => shield.draw());
    freezeZones.forEach((zone) => zone.draw());
    superNovas.forEach((nova) => nova.draw());
    wormholes.forEach((wormhole) => wormhole.draw());
    magneticStorms.forEach((storm) => storm.draw());
    lightningStorms.forEach((storm) => storm.draw());
    gravityWaves.forEach((wave) => wave.draw());
    timeDistortions.forEach((distortion) => distortion.draw());
    chainLightnings.forEach((chain) => chain.draw());
    voidRifts.forEach((rift) => rift.draw());
    cosmicMines.forEach((mine) => mine.draw());
    laserTurrets.forEach((turret) => turret.draw());
    player.draw();
    return; // Don't continue with game updates
  }
  // ...rest of animate logic...
};

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
// Update fragments with collision detection
fragments = fragments.filter((fragment) => {
  // Check collision with player
  if (!player.shieldActive && !player.thunderShieldActive && fragment.lethal) {
    const dist = Math.hypot(player.x - fragment.x, player.y - fragment.y);
    if (dist < player.radius + fragment.radius) {
      endGame("collision");
      return false;
    }
  }
  // Update and draw
  const expired = fragment.update();
  fragment.draw();
  return !expired;
});
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
  // Removed meaningless event text notification for shield activation
  playSound("shield");
}

stars = [];
asteroids = [];
particles = [];
lasers = [];
blackHoles = [];
missiles = [];
laserMines = [];
laserTurrets = [];
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
  .map(() => window.createNebula());
highScore = localStorage.getItem(GAME_CONFIG.advanced.localStorageKey) || 0;
if (uiElements.highscoreDisplay) {
  uiElements.highscoreDisplay.innerText = `High Score: ${highScore}`;
}

// Make animate function globally available
window.animate = function () {
  animationFrameId = requestAnimationFrame(animate);

  // ENHANCED Performance optimization: FPS tracking with multiple thresholds
  const now = performance.now();
  if (!window.lastFrameTime) window.lastFrameTime = now;
  const deltaTime = now - window.lastFrameTime;
  const fps = 1000 / deltaTime;
  window.lastFrameTime = now;

  // Multi-tier performance mode
  window.performanceMode = fps < 45;
  window.heavyPerformanceMode = fps < 30; // NEW: Even more aggressive optimization

  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, width, height);

  // Always render nebulae background
  nebulae.forEach((n) => {
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, width, height);
  });

  // Optimize star updates - skip more in heavy mode
  const starUpdateFrequency = window.heavyPerformanceMode ? 10 : 5;
  if (timers.gameFrame % starUpdateFrequency === 0) {
    stars.sort((a, b) => a.layer - b.layer);
  }
  // Skip star updates entirely in heavy performance mode
  if (!window.heavyPerformanceMode) {
    stars.forEach((s) => s.update());
  }

  // AGGRESSIVE particle limiting based on performance
  const maxParticles = window.heavyPerformanceMode ? 200 : 400;
  const keepParticles = window.heavyPerformanceMode ? 150 : 250;
  if (particles.length > maxParticles) {
    particles = particles.slice(-keepParticles);
  }

  if (!isGameRunning) {
    particles.forEach((p, i) =>
      p.alpha <= 0 ? particles.splice(i, 1) : p.update()
    );
    return;
  }

  // Skip game logic if paused, but still render current state
  if (window.isGamePaused && window.isGamePaused()) {
    // Still update and draw all entities, just don't progress timers or spawn new objects
    player && player.draw && player.draw();
    asteroids.forEach((a) => a.draw && a.draw());
    blackHoles.forEach((b) => b.draw && b.draw());
    missiles.forEach((m) => m.draw && m.draw());
    lasers.forEach((l) => l.draw && l.draw());
    particles.forEach((p, i) =>
      p.alpha <= 0 ? particles.splice(i, 1) : p.update()
    );
    warnings.forEach((w) => w.draw && w.draw());
    fragments.forEach((f) => f.draw && f.draw());
    crystalShards.forEach((c) => c.draw && c.draw());
    laserMines.forEach((m) => m.draw && m.draw());
    plasmaFields.forEach((p) => p.draw && p.draw());
    freezeZones.forEach((f) => f.draw && f.draw());
    superNovas.forEach((s) => s.draw && s.draw());
    chainLightnings.forEach((c) => c.draw && c.draw());
    voidRifts.forEach((v) => v.draw && v.draw());
    cosmicMines.forEach((m) => m.draw && m.draw());

    // Show pause indicator
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "bold 48px Exo 2";
    ctx.textAlign = "center";
    ctx.fillText("⏸️ PAUSED", width / 2, height / 2);

    return; // Exit early, don't update timers or game logic
  }

  timers.difficulty++;
  timers.gameFrame++;

  // Update survival time only if changed (prevent flickering)
  survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
  const minutes = Math.floor(survivalTime / 60);
  const seconds = survivalTime % 60;
  const survivalDisplay = `Time: ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
  if (
    uiElements.survivalDisplay &&
    survivalDisplay !== lastDisplayedSurvivalTime
  ) {
    uiElements.survivalDisplay.innerText = survivalDisplay;
    lastDisplayedSurvivalTime = survivalDisplay;
  }

  // Add survival bonus (score increases every second)
  if (survivalTime > lastSurvivalSecond) {
    const bonusPoints =
      GAME_CONFIG.scoring.survivalBonus * (survivalTime - lastSurvivalSecond);
    score += bonusPoints;
    lastSurvivalSecond = survivalTime;
    console.log(
      `✅ Survival Bonus: +${bonusPoints} points, Total Score: ${Math.floor(
        score
      )}`
    );
  }

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

  // Update UI elements AFTER all scoring calculations (prevent flickering + ensure latest values)
  const currentScore = Math.floor(score);
  if (uiElements && uiElements.scoreDisplay) {
    if (currentScore !== lastDisplayedScore) {
      uiElements.scoreDisplay.innerText = `Score: ${currentScore}`;
      lastDisplayedScore = currentScore;
      // Only log if changed
      console.log(`📊 Score UI Updated: ${currentScore}`);
    }
  }

  const currentTimeDisplay = `Time: ${Math.floor(survivalTime / 60)}:${(
    survivalTime % 60
  )
    .toString()
    .padStart(2, "0")}`;
  if (uiElements && uiElements.timeDisplay) {
    if (currentTimeDisplay !== lastDisplayedTime) {
      uiElements.timeDisplay.innerText = currentTimeDisplay;
      lastDisplayedTime = currentTimeDisplay;
    }
  }

  // CRITICAL: Update player position based on mouse movement
  updateMousePosition();

  prevMouse = { ...mouse };
  // Score already updated in animate() function with caching
  // Removed duplicate update to prevent flickering
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

  // --- Filter dead entities and OFF-SCREEN entities to improve performance ---
  const offScreenBuffer = 150; // Buffer zone before removing entities
  const farOffScreenBuffer = 300; // Remove entities that are very far off-screen

  missiles = missiles.filter(
    (m) =>
      !m.isDead &&
      m.x > -offScreenBuffer &&
      m.x < width + offScreenBuffer &&
      m.y > -offScreenBuffer &&
      m.y < height + offScreenBuffer
  );

  // AGGRESSIVE fragment limiting based on performance
  fragments = fragments.filter((f) => f.life > 0 && f.y < height + 50);
  const maxFragments = window.heavyPerformanceMode ? 50 : 80;
  const fragmentLimit = window.heavyPerformanceMode ? 80 : 120;
  if (fragments.length > fragmentLimit) {
    fragments = fragments.slice(-maxFragments);
  }

  // AGGRESSIVE asteroid limiting with dynamic cap
  const maxAsteroids = window.heavyPerformanceMode ? 15 : 25;
  asteroids = asteroids.filter(
    (a) =>
      a.x > -farOffScreenBuffer &&
      a.x < width + farOffScreenBuffer &&
      a.y > -farOffScreenBuffer &&
      a.y < height + farOffScreenBuffer
  );
  if (asteroids.length > maxAsteroids + 5) {
    asteroids = asteroids.slice(0, maxAsteroids);
  }

  // LIMIT missiles and lasers in heavy performance mode
  if (window.heavyPerformanceMode) {
    if (missiles.length > 8) missiles = missiles.slice(0, 8);
    if (lasers.length > 6) lasers = lasers.slice(0, 6);
  }

  blackHoles = blackHoles.filter(
    (bh) =>
      bh.alpha > 0 &&
      bh.x > -farOffScreenBuffer &&
      bh.x < width + farOffScreenBuffer &&
      bh.y > -farOffScreenBuffer &&
      bh.y < height + farOffScreenBuffer
  );

  crystalClusters = crystalClusters.filter((cc) => cc.alpha > 0);
  warnings = warnings.filter((w) => w.timer < w.duration);
  energyOrbs = energyOrbs.filter((e) => e.update() !== false);

  plasmaFields = plasmaFields.filter((p) => {
    if (p.update() === false) return false;
    // Also remove plasma fields that are far off-screen
    return (
      p.x > -farOffScreenBuffer &&
      p.x < width + farOffScreenBuffer &&
      p.y > -farOffScreenBuffer &&
      p.y < height + farOffScreenBuffer
    );
  });

  crystalShards = crystalShards.filter((c) => c.update() !== false);
  quantumPortals = quantumPortals.filter((q) => q.update() !== false);
  shieldGenerators = shieldGenerators.filter((s) => s.update() !== false);

  freezeZones = freezeZones.filter((f) => {
    if (f.update() === false) return false;
    return (
      f.x > -farOffScreenBuffer &&
      f.x < width + farOffScreenBuffer &&
      f.y > -farOffScreenBuffer &&
      f.y < height + farOffScreenBuffer
    );
  });

  superNovas = superNovas.filter((s) => {
    if (s.update() === false) return false;
    return (
      s.x > -farOffScreenBuffer &&
      s.x < width + farOffScreenBuffer &&
      s.y > -farOffScreenBuffer &&
      s.y < height + farOffScreenBuffer
    );
  });

  wormholes = wormholes.filter((w) => w.update() !== false);
  magneticStorms = magneticStorms.filter((m) => m.update() !== false);

  lightningStorms = lightningStorms.filter((l) => {
    if (l.update() === false) return false;
    // Remove lightning storms that are far off-screen
    return (
      l.x > -farOffScreenBuffer &&
      l.x < width + farOffScreenBuffer &&
      l.y > -farOffScreenBuffer &&
      l.y < height + farOffScreenBuffer
    );
  });

  // Remove laser turrets that are off-screen
  laserTurrets = laserTurrets.filter(
    (t) =>
      t.x > -farOffScreenBuffer &&
      t.x < width + farOffScreenBuffer &&
      t.y > -farOffScreenBuffer &&
      t.y < height + farOffScreenBuffer
  );

  // Remove lasers that are far off-screen
  lasers = lasers.filter(
    (l) =>
      l.x > -farOffScreenBuffer &&
      l.x < width + farOffScreenBuffer &&
      l.y > -farOffScreenBuffer &&
      l.y < height + farOffScreenBuffer
  );

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

  // Function to create asteroids for mini showers (GLOBAL)
  window.createMiniShowerAsteroid = function (direction) {
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
  };

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
    // Thiết lập các mô hình rơi thiên thạch - ưu tiên spawn trong màn hình
    let spawnX, spawnY, velocityX, velocityY;
    const spawnPattern = Math.random();

    if (spawnPattern < 0.5) {
      // Rơi thẳng từ trên xuống - SPAWN INSIDE SCREEN (50%)
      spawnX = Math.random() * width;
      spawnY = Math.random() < 0.7 ? -30 : Math.random() * height * 0.3; // 70% outside, 30% inside top area
      velocityX = 0; // Không có vận tốc ngang
      velocityY = asteroidSpeed;
    } else if (spawnPattern < 0.8) {
      // Rơi từ trên xuống với góc nghiêng nhẹ - SPAWN INSIDE (30%)
      spawnX = Math.random() * width;
      spawnY = Math.random() < 0.6 ? -30 : Math.random() * height * 0.4; // 60% outside, 40% inside
      velocityX = (Math.random() - 0.5) * asteroidSpeed * 0.3; // Góc nghiêng nhẹ
      velocityY = asteroidSpeed;
    } else {
      // Rơi chéo từ góc trên - spawn at edge (20%)
      const fromLeft = Math.random() < 0.5;
      spawnX = fromLeft ? -30 : width + 30;
      spawnY = Math.random() * height * 0.5; // Spawn in top half
      velocityX = fromLeft ? asteroidSpeed * 0.4 : -asteroidSpeed * 0.4;
      velocityY = asteroidSpeed * 0.8;
    }

    // Use warning system for larger or dangerous asteroids
    if (radius > 25 || Math.random() < 0.3) {
      // 30% chance or large asteroids get warnings
      const warningSystem = spawnWithWarning("asteroid", spawnX, spawnY, {
        radius: radius,
      });

      warningSystem.spawn(() => {
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
      });
    } else {
      // Spawn immediately for smaller asteroids
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
  }
  // Black hole spawning với warning system
  timers.blackHole++;
  if (timers.blackHole % GAME_CONFIG.blackHoles.spawnInterval === 0) {
    const bhX = Math.random() * width * 0.8 + width * 0.1;
    const bhY = Math.random() * height * 0.8;

    const warningSystem = spawnWithWarning("blackhole", bhX, bhY, {
      gravityRadius: GAME_CONFIG.blackHoles.baseGravityRadius,
    });

    warningSystem.spawn(() => {
      blackHoles.push(new BlackHole(bhX, bhY));
      playSound("blackhole");
    });
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

  // Laser spawning với warning system
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

          // Create laser with warning system for targeted lasers
          if (shouldTarget) {
            // Estimate where the laser will be
            const laserX = Math.random() * width;
            const laserY = Math.random() * height;

            const warningSystem = spawnWithWarning("laser", laserX, laserY);

            warningSystem.spawn(() => {
              lasers.push(new Laser(shouldTarget));
            });
          } else {
            // Non-targeted lasers spawn immediately
            lasers.push(new Laser(shouldTarget));
          }
        }
      }, i * GAME_CONFIG.lasers.staggerDelay);
    }
  }

  // Laser mines với warning system
  timers.mine++;
  if (timers.mine % GAME_CONFIG.laserMines.spawnInterval === 0) {
    const mineX = Math.random() * width * 0.8 + width * 0.1;
    const mineY = Math.random() * height * 0.6;

    const warningSystem = spawnWithWarning("mine", mineX, mineY, {
      explosionRadius: 100,
    });

    warningSystem.spawn(() => {
      laserMines.push(new LaserMine(mineX, mineY));
    });
  }

  // Loại bỏ điều kiện điểm số cho crystal clusters
  timers.crystal++;
  if (timers.crystal % 800 === 0)
    crystalClusters.push(
      new CrystalCluster(Math.random() * width, Math.random() * height * 0.7)
    );

  // --- Collision Detection ---

  // Player vs Obstacles
  for (const ast of asteroids) {
    const distance = Math.hypot(player.x - ast.x, player.y - ast.y);
    const collisionDistance = ast.radius + player.radius + 1;

    if (distance < collisionDistance) {
      if (!player.shieldActive) {
        if (window.collisionDebugMode) {
          console.log(
            `[DEBUG] ASTEROID COLLISION: Asteroid at (${Math.floor(
              ast.x
            )}, ${Math.floor(ast.y)}) radius=${Math.floor(
              ast.radius
            )} | Player at (${Math.floor(player.x)}, ${Math.floor(
              player.y
            )}) radius=${Math.floor(player.radius)} | Distance=${Math.floor(
              distance
            )} | Required=${Math.floor(collisionDistance)} | Visible=${
              typeof ast.draw === "function"
            } | Alpha=1`
          );
        }
        endGame("asteroid collision");
        return;
      } else {
        // Shield deflects asteroid
        const dx = ast.x - player.x;
        const dy = ast.y - player.y;
        const safeDistance = Math.max(Math.hypot(dx, dy), 1);
        ast.velocity.x += (dx / safeDistance) * 3;
        ast.velocity.y += (dy / safeDistance) * 3;

        // Trigger shield hit animation
        player.shieldHit();
        triggerScreenShake(0.3); // Add small screen shake
        if (window.collisionDebugMode) {
          console.log(
            `[DEBUG] SHIELD DEFLECTED: Asteroid at (${Math.floor(
              ast.x
            )}, ${Math.floor(ast.y)}) radius=${Math.floor(ast.radius)}`
          );
        }
      }
    }
  }
  for (const m of missiles) {
    const distance = Math.hypot(player.x - m.x, player.y - m.y);
    const collisionDistance = m.radius + player.radius + 1;
    // Prevent lethal collision for small or invisible missiles
    const missileIsVisible = m.radius >= 8 && (!m.alpha || m.alpha > 0.2);

    if (distance < collisionDistance && missileIsVisible) {
      if (!player.shieldActive) {
        if (window.collisionDebugMode) {
          console.log(
            `[DEBUG] MISSILE COLLISION: Missile at (${Math.floor(
              m.x
            )}, ${Math.floor(m.y)}) radius=${Math.floor(
              m.radius
            )} | Player at (${Math.floor(player.x)}, ${Math.floor(
              player.y
            )}) radius=${Math.floor(player.radius)} | Distance=${Math.floor(
              distance
            )} | Required=${Math.floor(
              collisionDistance
            )} | Visible=${missileIsVisible} | Alpha=${
              m.alpha !== undefined ? m.alpha : 1
            } | ID=${m.id} | LifeTimer=${m.lifeTimer}`
          );
        }
        // DEBUG: Log suspicious small missiles
        if (m.radius < 15) {
          console.warn(
            `⚠️ SMALL MISSILE DETECTED: radius=${m.radius}, expected=13`
          );
          console.log("Missile details:", {
            id: m.id,
            radius: m.radius,
            x: m.x,
            y: m.y,
            lifeTimer: m.lifeTimer,
            speed: m.speed,
          });
        }
        endGame("missile collision");
        return;
      } else {
        // Shield deflects missile
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const safeDistance = Math.max(Math.hypot(dx, dy), 1);
        m.velocity.x += (dx / safeDistance) * 4;
        m.velocity.y += (dy / safeDistance) * 4;

        // Trigger shield hit animation
        player.shieldHit();
        triggerScreenShake(0.5); // Add moderate screen shake
        if (window.collisionDebugMode) {
          console.log(
            `[DEBUG] SHIELD DEFLECTED: Missile at (${Math.floor(
              m.x
            )}, ${Math.floor(m.y)}) radius=${Math.floor(m.radius)} | ID=${m.id}`
          );
        }
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
      const pushRadius = cc.dischargeRadius;
      const pushForce = 15; // Strong push force

      // Push player away
      const playerDist = Math.hypot(player.x - cc.x, player.y - cc.y);
      if (Math.abs(playerDist - pushRadius) < player.radius + 10) {
        const pushAngle = Math.atan2(player.y - cc.y, player.x - cc.x);
        player.velocity.x += Math.cos(pushAngle) * pushForce;
        player.velocity.y += Math.sin(pushAngle) * pushForce;

        if (player.shieldActive) {
          player.shieldHit();
        }
        triggerScreenShake(0.5);
      }

      // Push asteroids away
      asteroids.forEach((asteroid) => {
        const asteroidDist = Math.hypot(asteroid.x - cc.x, asteroid.y - cc.y);
        if (Math.abs(asteroidDist - pushRadius) < asteroid.radius + 10) {
          const pushAngle = Math.atan2(asteroid.y - cc.y, asteroid.x - cc.x);
          asteroid.velocity.x += Math.cos(pushAngle) * pushForce * 0.5;
          asteroid.velocity.y += Math.sin(pushAngle) * pushForce * 0.5;

          // Create push particles
          for (let i = 0; i < 5; i++) {
            particles.push(
              new Particle(asteroid.x, asteroid.y, 2, "#40c4ff", {
                x: Math.cos(pushAngle) * 3,
                y: Math.sin(pushAngle) * 3,
              })
            );
          }
        }
      });

      // Push missiles away
      missiles.forEach((missile) => {
        const missileDist = Math.hypot(missile.x - cc.x, missile.y - cc.y);
        if (Math.abs(missileDist - pushRadius) < missile.radius + 10) {
          const pushAngle = Math.atan2(missile.y - cc.y, missile.x - cc.x);
          missile.velocity.x += Math.cos(pushAngle) * pushForce * 0.7;
          missile.velocity.y += Math.sin(pushAngle) * pushForce * 0.7;
        }
      });

      // Push fragments away
      fragments.forEach((fragment) => {
        const fragmentDist = Math.hypot(fragment.x - cc.x, fragment.y - cc.y);
        if (Math.abs(fragmentDist - pushRadius) < fragment.radius + 10) {
          const pushAngle = Math.atan2(fragment.y - cc.y, fragment.x - cc.x);
          fragment.velocity.x += Math.cos(pushAngle) * pushForce * 0.3;
          fragment.velocity.y += Math.sin(pushAngle) * pushForce * 0.3;
        }
      });
    }
  }

  // Fragment vs Player collisions (LETHAL FRAGMENTS CAN KILL!)
  for (let i = fragments.length - 1; i >= 0; i--) {
    const fragment = fragments[i];
    const distance = Math.hypot(player.x - fragment.x, player.y - fragment.y);
    const collisionDistance = player.radius + fragment.radius;
    // Prevent lethal collision for small or invisible fragments
    const fragmentIsVisible = fragment.radius >= 8 && fragment.alpha > 0.2;

    if (distance < collisionDistance && fragmentIsVisible) {
      if (fragment.lethal) {
        // Lethal fragments (missile fragments) kill the player
        if (!player.shieldActive) {
          if (window.collisionDebugMode) {
            console.log(
              `[DEBUG] FRAGMENT COLLISION: Fragment at (${Math.floor(
                fragment.x
              )}, ${Math.floor(fragment.y)}) radius=${Math.floor(
                fragment.radius
              )} | Player at (${Math.floor(player.x)}, ${Math.floor(
                player.y
              )}) radius=${Math.floor(player.radius)} | Distance=${Math.floor(
                distance
              )} | Required=${Math.floor(collisionDistance)} | Lethal=${
                fragment.lethal
              } | Visible=${fragmentIsVisible} | Alpha=${fragment.alpha}`
            );
          }
          endGame("collision");
          return;
        } else {
          // Shield blocks lethal fragment
          player.shieldHit();
          triggerScreenShake(0.4);
          fragments.splice(i, 1); // Remove the fragment
          if (window.collisionDebugMode) {
            console.log(
              `[DEBUG] SHIELD DEFLECTED: Lethal fragment at (${Math.floor(
                fragment.x
              )}, ${Math.floor(fragment.y)}) radius=${Math.floor(
                fragment.radius
              )} | Alpha=${fragment.alpha}`
            );
          }
          continue;
        }
      } else {
        // Non-lethal fragments (asteroid fragments) - just visual effects
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

  // PlasmaFields vs Player - Special plasma storm lightning interaction
  for (const plasma of plasmaFields) {
    const dist = Math.hypot(player.x - plasma.x, player.y - plasma.y);
    if (dist < plasma.radius + player.radius) {
      if (!player.shieldActive) {
        // No shield - plasma lightning kills player
        if (Math.random() < 0.02) {
          // 2% chance per frame
          endGame("plasma field burn");
          return;
        }
      } else {
        // Shield active - plasma lightning activates thunder shield!
        if (!player.thunderShieldActive && Math.random() < 0.05) {
          // 5% chance per frame to activate thunder shield
          player.activateThunderShield();
          showEventText("⚡ PLASMA LIGHTNING → THUNDER SHIELD! ⚡");
          playSound("shield");
          triggerScreenShake(0.3);

          console.log(
            "🔥⚡ Plasma lightning activated thunder shield for player!"
          );
        }
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

      // Removed shield activation event text as requested

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

  // ChainLightnings vs Player - Can be lethal (ONLY if visible on screen)
  for (const lightning of chainLightnings) {
    // Check if lightning is visible on screen before checking collision
    const isOnScreen =
      lightning.x > -100 &&
      lightning.x < width + 100 &&
      lightning.y > -100 &&
      lightning.y < height + 100;

    if (!isOnScreen) continue; // Skip collision if lightning is off-screen

    const dist = Math.hypot(player.x - lightning.x, player.y - lightning.y);
    if (dist < lightning.radius + player.radius) {
      // Chain lightning removed as death event - only shield interaction remains
      if (player.shieldActive) {
        // Shield blocks lightning
        player.shieldHit();
        triggerScreenShake(0.5);
        console.log(
          `🛡️ SHIELD DEFLECTED: Chain lightning at (${Math.floor(
            lightning.x
          )}, ${Math.floor(lightning.y)})`
        );
      }
      // No death event - player can pass through chain lightning safely
    }
  }

  // VoidRifts vs Player - Can teleport or damage
  for (const rift of voidRifts) {
    // CRITICAL: Only check collision if void rift is visible on screen
    const buffer = 100;
    const isRiftOnScreen =
      rift.x > -buffer &&
      rift.x < canvas.width + buffer &&
      rift.y > -buffer &&
      rift.y < canvas.height + buffer;

    if (!isRiftOnScreen) {
      continue; // Skip off-screen void rifts
    }

    const dist = Math.hypot(player.x - rift.x, player.y - rift.y);
    if (dist < rift.radius + player.radius) {
      if (!player.shieldActive) {
        if (window.collisionDebugMode) {
          console.log(
            `🌀 VOID RIFT COLLISION: Rift at (${Math.floor(
              rift.x
            )}, ${Math.floor(rift.y)}) with radius ${Math.floor(
              rift.radius
            )} hit player. Distance: ${Math.floor(
              dist
            )}, Required: ${Math.floor(rift.radius + player.radius)}`
          );
        }
        endGame("void rift collision");
        return;
      } else {
        // Shield blocks void rift
        player.shieldHit();
        triggerScreenShake(0.6);
        console.log(
          `🛡️ SHIELD DEFLECTED: Void rift at (${Math.floor(
            rift.x
          )}, ${Math.floor(rift.y)})`
        );
      }
    }
  }

  // CosmicMines vs Player - Explosive damage
  for (const mine of cosmicMines) {
    const dist = Math.hypot(player.x - mine.x, player.y - mine.y);
    if (dist < mine.triggerRadius + player.radius && mine.armed) {
      if (!player.shieldActive) {
        if (window.collisionDebugMode) {
          console.log(
            `💣 COSMIC MINE COLLISION: Mine at (${Math.floor(
              mine.x
            )}, ${Math.floor(mine.y)}) with trigger radius ${Math.floor(
              mine.triggerRadius
            )} hit player. Distance: ${Math.floor(
              dist
            )}, Required: ${Math.floor(mine.triggerRadius + player.radius)}`
          );
        }
        endGame("cosmic mine collision");
        return;
      } else {
        // Shield blocks mine explosion
        player.shieldHit();
        triggerScreenShake(0.8);
        console.log(
          `🛡️ SHIELD DEFLECTED: Cosmic mine explosion at (${Math.floor(
            mine.x
          )}, ${Math.floor(mine.y)})`
        );
      }
    }
  }

  // PlasmaFields vs Player - Enhanced plasma storm interaction
  for (const plasma of plasmaFields) {
    const dist = Math.hypot(player.x - plasma.x, player.y - plasma.y);
    if (dist < plasma.radius + player.radius) {
      if (!player.shieldActive) {
        if (window.collisionDebugMode) {
          console.log(
            `🔥 PLASMA FIELD COLLISION: Plasma at (${Math.floor(
              plasma.x
            )}, ${Math.floor(plasma.y)}) with radius ${Math.floor(
              plasma.radius
            )} hit player. Distance: ${Math.floor(
              dist
            )}, Required: ${Math.floor(plasma.radius + player.radius)}`
          );
        }
        endGame("plasma field collision");
        return;
      } else {
        // Shield blocks plasma AND activates thunder shield
        player.shieldHit();

        // Plasma lightning activates thunder shield
        if (!player.thunderShieldActive) {
          player.activateThunderShield();
          showEventText("⚡ PLASMA IMMUNITY → THUNDER SHIELD! ⚡");
          playSound("thunder");
        }
        triggerScreenShake(0.4);
        console.log(
          `🛡️⚡ PLASMA ABSORBED: Thunder shield activated at (${Math.floor(
            plasma.x
          )}, ${Math.floor(plasma.y)})`
        );
      }
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
    lastDifficultyLevel = difficultyLevel;
    showEventText(`🌀 LEVEL ${difficultyLevel} 🌀`);
    playSound("powerup");

    if (difficultyLevel === 1) {
      // Level 1: Make everything much slower for onboarding
      globalSpeedMultiplier = (GAME_CONFIG.difficulty.baseSpeed || 1.0) * 0.45; // 45% speed
      spawnInterval = (GAME_CONFIG.difficulty.baseSpawnInterval || 60) * 2.2; // 2.2x slower spawn
    } else {
      // Level 2+: Sharply increase difficulty
      globalSpeedMultiplier =
        (GAME_CONFIG.difficulty.baseSpeed || 1.0) +
        GAME_CONFIG.difficulty.speedIncreaseStep * (1 + difficultyLevel * 0.25);
      if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval) {
        spawnInterval -=
          GAME_CONFIG.difficulty.spawnDecreaseStep *
          (1 + difficultyLevel * 0.12);
      }
    }

    // Unlock more dangerous events at higher levels
    if (difficultyLevel === 1) {
      // Level 1: Make everything slower for onboarding
      globalSpeedMultiplier = (GAME_CONFIG.difficulty.baseSpeed || 1.0) * 0.55; // 55% speed (faster than before)
      spawnInterval = (GAME_CONFIG.difficulty.baseSpawnInterval || 60) * 1.7; // 1.7x slower spawn (faster than before)
    } else {
      // Level 2+: Sharply increase difficulty and speed
      globalSpeedMultiplier =
        (GAME_CONFIG.difficulty.baseSpeed || 1.0) +
        GAME_CONFIG.difficulty.speedIncreaseStep * (1 + difficultyLevel * 0.32);
      if (spawnInterval > GAME_CONFIG.difficulty.minSpawnInterval) {
        spawnInterval -=
          GAME_CONFIG.difficulty.spawnDecreaseStep *
          (1 + difficultyLevel * 0.16);
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
