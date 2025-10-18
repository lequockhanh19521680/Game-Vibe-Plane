// Event text queue system to prevent flickering
let eventTextQueue = [];
let isShowingEventText = false;
let currentEventTimeout = null;

function showEventText(text) {
  // FIX: Đảm bảo không hiển thị hoặc xếp hàng sự kiện nếu game đã kết thúc.
  if (!window.isGameRunning) {
    eventTextQueue.length = 0; // Xóa các sự kiện đang chờ
    return;
  }

  // Add to queue if currently showing text
  if (isShowingEventText) {
    eventTextQueue.push(text);
    return;
  }

  // Mark as showing and display immediately
  isShowingEventText = true;
  displayEventText(text);
}

function resetEventSystem() {
  eventTextQueue.length = 0;

  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }
  isShowingEventText = false;

  if (typeof uiElements !== "undefined" && uiElements.eventText) {
    uiElements.eventText.style.opacity = "0";
    uiElements.eventText.style.textShadow = "none";
    uiElements.eventText.style.animation = "none";
  }
}

function displayEventText(text) {
  // Clear any existing timeout
  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }

  uiElements.eventText.innerText = text;
  uiElements.eventText.style.fontSize = GAME_CONFIG.ui.eventText.fontSize;
  uiElements.eventText.style.opacity = "1";
  uiElements.eventText.style.textShadow = "0 0 15px #ffff00, 0 0 25px #ffff00";

  // Thêm hiệu ứng rung nhẹ để thu hút sự chú ý
  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    shakeCount++;
    if (shakeCount > 5) {
      clearInterval(shakeInterval);
      uiElements.eventText.style.transform = "translateX(-50%)";
      return;
    }

    const direction = shakeCount % 2 === 0 ? 1 : -1;
    uiElements.eventText.style.transform = `translateX(calc(-50% + ${
      direction * 3
    }px))`;
  }, 50);

  // Thêm hiệu ứng flash màu sắc
  uiElements.eventText.style.animation = "textFlash 0.5s linear 3";
  if (!document.querySelector("#event-text-style")) {
    const style = document.createElement("style");
    style.id = "event-text-style";
    style.textContent = `
      @keyframes textFlash {
        0% { color: white; }
        50% { color: #ffff00; }
        100% { color: white; }
      }
    `;
    document.head.appendChild(style);
  }

  currentEventTimeout = setTimeout(() => {
    uiElements.eventText.style.opacity = "0";
    uiElements.eventText.style.textShadow = "none";
    uiElements.eventText.style.animation = "none";

    // Process next text in queue
    isShowingEventText = false;
    currentEventTimeout = null;

    if (eventTextQueue.length > 0) {
      const nextText = eventTextQueue.shift();
      showEventText(nextText);
    }
  }, GAME_CONFIG.ui.eventText.duration);
}

// Chaos Manifest event removed as requested
function triggerChaosEvent(level) {
  // Function disabled - Chaos Manifest event removed as requested
  return;
}

function triggerRandomEvent() {
  // FIX: Thoát khỏi hàm nếu game không chạy để ngăn việc spawn tiếp
  if (!window.isGameRunning) return;

  // Lấy danh sách trọng số sự kiện cơ bản
  const baseEventWeights = [
    // CORE EVENTS - Basic gameplay (HIGHER weights = easier game)
    { type: "asteroidShower", weight: 35 },
    { type: "instantMissiles", weight: 25 },
    { type: "laserGrid", weight: 20 },

    // COLLECTIBLES - Good for player (INCREASED weights)
    { type: "crystalRain", weight: 25 },

    // MODERATE THREATS
    { type: "freezeZone", weight: 15 },
    { type: "magneticStorm", weight: 15 },
    { type: "blackHoleChain", weight: 12 },

    // Thêm các sự kiện có trong switch/unlockThresholds nhưng thiếu trong danh sách cũ
    { type: "asteroidCircle", weight: 15 },
    { type: "missileBarrage", weight: 18 },
    { type: "gravitationalAnomaly", weight: 10 },
    { type: "asteroidRain", weight: 20 },
    { type: "wormholePortal", weight: 10 },
    { type: "voidRifts", weight: 10 },
    { type: "lightningStorm", weight: 15 },

    // ADVANCED THREATS (Lower weights = rarer)
    { type: "plasmaStorm", weight: 10 },
    { type: "temporalChaos", weight: 7 },
    { type: "lightningNetwork", weight: 7 },
    { type: "voidStorm", weight: 6 },
    { type: "mineFieldDetonation", weight: 6 },
  ];

  // Lấy ngưỡng mở khóa từ GAME_CONFIG. Nếu không có, dùng object rỗng.
  const unlockThresholds = GAME_CONFIG.events.unlockThresholds || {};

  // LỌC DANH SÁCH SỰ KIỆN DỰA TRÊN ĐIỂM SỐ
  const availableEvents = baseEventWeights.filter((event) => {
    // Lấy ngưỡng điểm, mặc định là 0 nếu không có trong config
    const threshold = unlockThresholds[event.type] || 0;

    // Chỉ bao gồm sự kiện nếu điểm số hiện tại (global score) lớn hơn hoặc bằng ngưỡng
    return score >= threshold;
  });

  // Kiểm tra nếu không có sự kiện nào được mở khóa (chỉ nên xảy ra khi điểm quá thấp)
  if (availableEvents.length === 0) {
    // Nếu không có gì, mặc định chỉ có 'asteroidShower' (nếu nó không có ngưỡng) hoặc sự kiện đầu tiên
    const defaultEvent =
      baseEventWeights.find((e) => e.type === "asteroidShower") ||
      baseEventWeights[0];
    if (defaultEvent) {
      availableEvents.push(defaultEvent);
    } else {
      return; // Không có sự kiện nào để kích hoạt
    }
  }

  // Calculate total weight for available events
  const totalWeight = availableEvents.reduce(
    (sum, event) => sum + event.weight,
    0
  );

  // Pick a random event based on weights
  let random = Math.random() * totalWeight;
  let selectedEvent = availableEvents[0].type;

  for (const event of availableEvents) {
    random -= event.weight;
    if (random <= 0) {
      selectedEvent = event.type;
      break;
    }
  }

  const randomEventType = selectedEvent;

  // Giảm thời gian diễn ra sự kiện xuống còn 75% so với cài đặt để có thêm sự kiện
  eventActive.endTime =
    timers.difficulty + Math.floor(GAME_CONFIG.events.duration * 0.75);

  switch (randomEventType) {
    case "asteroidShower": // New enhanced asteroid shower event
      eventActive.type = "asteroidShower";
      showEventText("⚠️ ASTEROID SHOWER! ⚠️");

      // Tạo thiên thạch từ các hướng khác nhau
      const totalAsteroids = 25;
      const waves = 3;
      const asteroidsPerWave = Math.floor(totalAsteroids / waves);

      for (let wave = 0; wave < waves; wave++) {
        setTimeout(() => {
          if (isGameRunning) {
            // Tạo thiên thạch từ các hướng khác nhau
            const directions = ["top", "left", "right", "bottom"];
            const direction =
              directions[Math.floor(Math.random() * directions.length)];

            for (let i = 0; i < asteroidsPerWave; i++) {
              setTimeout(() => {
                if (isGameRunning) {
                  const asteroid = createMiniShowerAsteroid(direction);
                  asteroids.push(asteroid);
                }
              }, i * 80); // Tight spacing within a wave
            }
          }
        }, wave * 1000); // 1 second between waves
      }
      break;

    case "instantMissiles":
      // Loại bỏ điều kiện kiểm tra điểm số - event xuất hiện bất kể điểm số
      eventActive.type = "instantMissiles";
      showEventText("⚠️ MISSILES INCOMING ⚠️");

      // Add missile warning
      warnings.push(
        new WarningSystem(
          width / 2,
          height / 2,
          "missile",
          120, // Duration
          [
            {
              type: "missile",
              spawnDelay: 120, // 2 seconds
              spawnFn: () => missiles.push(new Missile()),
              spawnArgs: [],
            },
            {
              type: "missile",
              spawnDelay: 120,
              spawnFn: () => missiles.push(new Missile()),
              spawnArgs: [],
            },
          ]
        )
      );

      playSound("warning");

      // The actual missile spawning logic is now handled inside MissileWarning class/WarningSystem in helpers.js.
      // Keeping the old structure for now until full refactoring of warning logic is done.

      // Fallback old logic (for safety if WarningSystem is simplified)
      setTimeout(() => {
        if (isGameRunning) {
          showEventText("🚀 MISSILES LAUNCHED! 🚀");
          // Revert to old missile spawn logic if WarningSystem is not fully implemented
          // missiles.push(new Missile());
          // missiles.push(new Missile());
        }
      }, 120 * (1000 / 60)); // 2 seconds

      break;

    case "asteroidCircle":
      eventActive.type = "asteroidCircle";
      showEventText("Asteroid Circle Formation!");
      triggerAsteroidCircle();
      break;
    case "missileBarrage":
      eventActive.type = "missileBarrage";
      showEventText("🚀 MISSILE BARRAGE INCOMING! 🚀");

      // Create directional warnings from multiple sides for missile barrage
      const sides = ["left", "right", "top", "bottom"];

      for (let i = 0; i < GAME_CONFIG.events.missileBarrage.count; i++) {
        // Choose a random side for this missile
        const side = sides[Math.floor(Math.random() * sides.length)];
        let warningX, warningY, warningAngle;

        // Position warning based on the chosen side
        switch (side) {
          case "left":
            warningX = 50;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = 0; // Arrow pointing right
            break;
          case "right":
            warningX = width - 50;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = Math.PI; // Arrow pointing left
            break;
          case "top":
            warningX = 100 + Math.random() * (width - 200);
            warningY = 50;
            warningAngle = Math.PI / 2; // Arrow pointing down
            break;
          case "bottom":
            warningX = 100 + Math.random() * (width - 200);
            warningY = height - 50;
            warningAngle = -Math.PI / 2; // Arrow pointing up
            break;
        }

        // Create warning with slight delay between them
        setTimeout(() => {
          if (isGameRunning) {
            warnings.push(
              new Warning(
                warningX,
                warningY,
                "missile",
                90, // 1.5 seconds warning
                warningAngle
              )
            );
            playSound("warning");

            // Create missile after warning with matched position
            const finalWarningX = warningX;
            const finalWarningY = warningY;
            const finalSide = side;

            setTimeout(() => {
              if (isGameRunning) {
                let newMissile = new Missile();

                // Set missile position based on warning position
                switch (finalSide) {
                  case "left":
                    newMissile.x = -20;
                    newMissile.y = finalWarningY;
                    newMissile.angle = 0; // Moving right
                    break;
                  case "right":
                    newMissile.x = width + 20;
                    newMissile.y = finalWarningY;
                    newMissile.angle = Math.PI; // Moving left
                    break;
                  case "top":
                    newMissile.x = finalWarningX;
                    newMissile.y = -20;
                    newMissile.angle = Math.PI / 2; // Moving down
                    break;
                  case "bottom":
                    newMissile.x = finalWarningX;
                    newMissile.y = height + 20;
                    newMissile.angle = -Math.PI / 2; // Moving up
                    break;
                }

                // Update velocity based on angle
                newMissile.velocity = {
                  x: Math.cos(newMissile.angle) * newMissile.speed,
                  y: Math.sin(newMissile.angle) * newMissile.speed,
                };

                missiles.push(newMissile);
              }
            }, 90 * (1000 / 60)); // 1.5 seconds after warning
          }
        }, i * (GAME_CONFIG.events.missileBarrage.delay / 2)); // Stagger the warnings
      }
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
            // Sử dụng WarningSystem mới để spawn BlackHole
            warnings.push(
              new WarningSystem(
                x,
                y,
                "blackhole",
                GAME_CONFIG.blackHoles.warningDuration,
                [
                  {
                    type: "blackhole",
                    spawnDelay: GAME_CONFIG.blackHoles.warningDelay,
                    spawnFn: () => blackHoles.push(new BlackHole(x, y, true)),
                    spawnArgs: [],
                  },
                ]
              )
            );
            playSound("warning");
          }
        }, i * GAME_CONFIG.events.blackHoleChain.delay);
      }
      showEventText("Black Hole Chain!");
      break;

    case "freezeZone":
      eventActive.type = "freezeZone";
      showEventText("❄️ FREEZE ZONES IMMINENT ❄️");

      for (let i = 0; i < GAME_CONFIG.events.freezeZone.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            const warningSystem = spawnWithWarning("freeze", x, y, {
              radius: GAME_CONFIG.events.freezeZone.radius,
            });

            warningSystem.spawn(() => {
              freezeZones.push(new FreezeZone(x, y));
              playSound("freeze");
            });
          }
        }, i * 500); // Stagger freeze zone creation
      }
      break;

    case "magneticStorm":
      eventActive.type = "magneticStorm";
      showEventText("Magnetic Storm Detected!");

      // Create magnetic storm
      magneticStorms.push(new MagneticStorm());

      playSound("warning");
      triggerScreenShake(0.3);
      break;

    case "plasmaStorm":
      handlePlasmaStormEvent();
      break;

    case "crystalRain":
      handleCrystalRainEvent();
      break;

    case "voidRifts":
      handleVoidRiftsEvent();
      break;

    case "lightningStorm":
      handleLightningStormEvent();
      break;

    case "wormholePortal":
      handleWormholePortalEvent();
      break;

    case "gravitationalAnomaly":
      handleGravitationalAnomalyEvent();
      break;

    case "asteroidRain":
      handleAsteroidRainEvent();
      break;
  }

  // Create a new wrapper function for the plasmaStorm event
  function handlePlasmaStormEvent() {
    eventActive.type = "plasmaStorm";
    showEventText("⚠️ PLASMA INFERNO IMMINENT ⚠️");

    const config = GAME_CONFIG.events.plasmaStorm || {};
    const waveCount = config.waveCount || 4;
    const fieldsPerWave = config.fieldsPerWave || 5;
    const waveDelay = config.waveDelay || 1000;
    const fieldStagger = config.fieldStagger || 80;
    const warningDuration = config.warningDuration || 180; // 3 seconds

    // Use universal warning system for each plasma field
    const allPlasmaData = [];

    // Pre-calculate all plasma positions
    for (let wave = 0; wave < waveCount; wave++) {
      const baseY = (canvas.height / (waveCount + 1)) * (wave + 1);

      for (let field = 0; field < fieldsPerWave; field++) {
        const x =
          (canvas.width / (fieldsPerWave + 1)) * (field + 1) +
          (Math.random() - 0.5) * (config.positionJitterX || 80);
        const y =
          baseY + (Math.random() - 0.5) * (config.positionJitterY || 60);
        const radius =
          (config.minRadius || 60) +
          Math.random() * ((config.maxRadius || 90) - (config.minRadius || 60));
        const timing = wave * fieldsPerWave + field;

        allPlasmaData.push({ x, y, radius, timing });

        // Create individual warning for each plasma field
        setTimeout(() => {
          if (isGameRunning) {
            const warningSystem = spawnWithWarning("plasma", x, y, {
              radius: radius,
              duration: warningDuration,
            });

            warningSystem.spawn(() => {
              const plasma = new PlasmaField(x, y);
              plasma.radius = radius; // <-- Gán trực tiếp radius đã tính toán
              plasma.damageRate = config.damageRate || 0.04;
              plasmaFields.push(plasma);

              // Create plasma lightning effects
              if (timing % 3 === 0) {
                for (let j = 0; j < 5; j++) {
                  particles.push(
                    new Particle(
                      x + Math.random() * 100 - 50,
                      y + Math.random() * 50 - 25,
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
            });
          }
        }, timing * fieldStagger);
      }
    }

    // Global effects
    setTimeout(() => {
      if (isGameRunning) {
        showEventText("🔥 PLASMA INFERNO UNLEASHED 🔥");
        triggerScreenShake(config.shakeIntensity || 0.8);
        playSound("explosion");
      }
    }, waveCount * fieldsPerWave * fieldStagger + warningDuration);
  } // Close handlePlasmaStormEvent function

  function handleCrystalRainEvent() {
    eventActive.type = "crystalRain";
    showEventText("Cosmic Crystal Storm!");
    const config = GAME_CONFIG.events.crystalRain || {};

    // Create clusters of drifting crystals
    for (let cluster = 0; cluster < (config.clusterCount || 4); cluster++) {
      const clusterX =
        (canvas.width / (config.clusterCount || 5)) * (cluster + 1);
      const clusterY =
        Math.random() * canvas.height * (config.clusterYFactor || 0.3);

      for (let i = 0; i < config.count / (config.clusterCount || 4); i++) {
        setTimeout(() => {
          // Create crystals in cluster formation
          const x =
            clusterX + (Math.random() - 0.5) * (config.clusterSpreadX || 150);
          const y =
            clusterY + (Math.random() - 0.5) * (config.clusterSpreadY || 80);

          const crystal = new CrystalShard(x, y);

          // Set initial drifting velocity
          crystal.velocity.x =
            (Math.random() - 0.5) * (config.driftVelocityX || 2);
          crystal.velocity.y =
            Math.random() * (config.driftVelocityYMax || 1.5) +
            (config.driftVelocityYMin || 0.5);

          // Add some orbital motion around cluster center
          const angle = Math.atan2(y - clusterY, x - clusterX);
          crystal.velocity.x +=
            Math.cos(angle + Math.PI / 2) * (config.orbitalSpeed || 0.3);
          crystal.velocity.y +=
            Math.sin(angle + Math.PI / 2) * (config.orbitalSpeed || 0.3);

          crystalShards.push(crystal);
        }, i * (config.delay || 80) + cluster * (config.clusterStagger || 200));
      }
    }

    // Add some scattered individual crystals
    for (let i = 0; i < (config.scatteredCount || 8); i++) {
      setTimeout(() => {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        const edgeOffset = config.edgeOffset || 30;
        const centerSpeed = config.centerSpeed || 0.8;
        const centerSpeedVariation = config.centerSpeedVariation || 0.6;

        // Spawn from different edges
        switch (edge) {
          case 0: // Top
            x = Math.random() * canvas.width;
            y = -edgeOffset;
            break;
          case 1: // Right
            x = canvas.width + edgeOffset;
            y = Math.random() * canvas.height;
            break;
          case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + edgeOffset;
            break;
          case 3: // Left
            x = -edgeOffset;
            y = Math.random() * canvas.height;
            break;
        }

        const crystal = new CrystalShard(x, y);

        // Set velocity toward center with some randomness
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - y, centerX - x);

        crystal.velocity.x =
          Math.cos(angle) *
          (centerSpeed + Math.random() * centerSpeedVariation);
        crystal.velocity.y =
          Math.sin(angle) *
          (centerSpeed + Math.random() * centerSpeedVariation);

        crystalShards.push(crystal);
      }, Math.random() * (config.scatteredDelayMax || 3000));
    }

    playSound("crystal");
  } // Close handleCrystalRainEvent function

  function handleVoidRiftsEvent() {
    eventActive.type = "voidRifts";
    showEventText("⚠️ Void Rifts Detected ⚠️");
    const config = GAME_CONFIG.events.voidRifts || {};

    for (let i = 0; i < config.count; i++) {
      const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;

      // Show warning first
      warnings.push(
        new Warning(x, y, "voidrift", config.warningDuration || 180) // 3 second warning
      );

      // Create void rift after warning
      setTimeout(() => {
        if (isGameRunning) {
          const voidRift = new BlackHole(x, y, true); // temporary void rift
          voidRift.isVoidRift = true;
          voidRift.lifetime = config.lifetime || 300; // 5 seconds
          blackHoles.push(voidRift);
          playSound("blackhole");
        }
      }, (config.warningDuration || 180) * (1000 / 60));
    }

    playSound("warning");
    playSound("blackhole");
  }

  function handleLightningStormEvent() {
    eventActive.type = "lightningStorm";
    showEventText("⚡ THUNDER SHIELD OPPORTUNITY! ⚡");

    // Create lightning storm
    lightningStorms.push(new LightningStorm());

    playSound("warning");
    triggerScreenShake(0.4);
  }

  function handleWormholePortalEvent() {
    eventActive.type = "wormholePortal";
    showEventText("Wormhole Assault!");
    const config = GAME_CONFIG.events.wormholePortal;

    for (let i = 0; i < config.count; i++) {
      setTimeout(() => {
        // Create wormhole that shoots asteroids
        const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
        wormholes.push(new Wormhole(x, y));
      }, i * (config.staggerDelay || 1000)); // Spawn wormholes with stagger delay
    }
    playSound("wormhole");
  }

  function handleGravitationalAnomalyEvent() {
    eventActive.type = "gravitationalAnomaly";
    showEventText("⚠️ GRAVITATIONAL ANOMALY DETECTED ⚠️");
    const config = GAME_CONFIG.events.gravitationalAnomaly;

    // Create warning indicators first
    for (let i = 0; i < config.blackHoleCount; i++) {
      const x = 100 + Math.random() * (width - 200);
      const y = 100 + Math.random() * (height - 200);

      // Add warning signs
      warnings.push(
        new Warning(x, y, "blackhole", config.warningDuration || 180) // 3 second warning
      );

      // Create black holes after warning
      setTimeout(() => {
        if (isGameRunning) {
          blackHoles.push(new BlackHole(x, y, true));
          // Create visual effect for black hole appearance
          for (let j = 0; j < (config.spawnParticleCount || 12); j++) {
            const angle = Math.random() * Math.PI * 2;
            particles.push(
              new Particle(
                x + Math.cos(angle) * (config.spawnParticleOffset || 5),
                y + Math.sin(angle) * (config.spawnParticleOffset || 5),
                Math.random() * 3 + 1,
                config.spawnParticleColor || "#aa66cc",
                {
                  x: Math.cos(angle) * 3,
                  y: Math.sin(angle) * 3,
                }
              )
            );
          }
          playSound("blackhole");
        }
      }, (config.warningDuration || 180) * (1000 / 60));
    }

    playSound("warning");
  }

  function handleAsteroidRainEvent() {
    eventActive.type = "asteroidRain";
    showEventText("Asteroid Rain!");
    const config = GAME_CONFIG.events.asteroidRain;

    for (let i = 0; i < config.count; i++) {
      setTimeout(() => {
        if (isGameRunning) {
          asteroids.push(
            new Asteroid(
              Math.random() * width,
              -30,
              config.minRadius +
                Math.random() * (config.maxRadius - config.minRadius),
              "#ff4444",
              {
                x: 0,
                y:
                  (config.speedMultiplier +
                    Math.random() * config.speedVariation) *
                  globalSpeedMultiplier,
              }
            )
          );
        }
      }, i * config.delay);
    }
  }
} // Close triggerRandomEvent function
