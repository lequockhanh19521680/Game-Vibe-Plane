// Event text queue system to prevent flickering
let eventTextQueue = [];
let isShowingEventText = false;
let currentEventTimeout = null;

/**
 * Public function to show event text, using a queue system to handle overlaps.
 * This function should be the ONLY way to show event text.
 */
function showEventText(text) {
  console.log('showEventText called with:', text, 'isGameRunning:', window.isGameRunning);
  
  // FIX: Đảm bảo không hiển thị hoặc xếp hàng sự kiện nếu game đã kết thúc.
  if (!window.isGameRunning) {
    eventTextQueue.length = 0; // Xóa các sự kiện đang chờ
    console.log('Game not running, skipping event text');
    return;
  }

  // Add to queue if currently showing text
  if (isShowingEventText) {
    eventTextQueue.push(text);
    console.log('Added to queue:', text);
    return;
  }

  // Mark as showing and display immediately
  isShowingEventText = true;
  displayEventText(text);
}

/**
 * Internal function to visually display the text and set fade timers/animations.
 */
function displayEventText(text) {
  console.log('displayEventText called with:', text);
  
  // Clear any existing timeout
  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }

  // Get event text element safely
  const eventTextElement = document.getElementById("event-text");
  if (!eventTextElement) {
    console.warn("Event text element not found!");
    return;
  }

  console.log('Event text element found, displaying:', text);
  
  eventTextElement.innerText = text;
  eventTextElement.style.fontSize = GAME_CONFIG.ui.eventText.fontSize;
  eventTextElement.style.opacity = "1";
  eventTextElement.style.textShadow = "0 0 15px #ffff00, 0 0 25px #ffff00";
  eventTextElement.style.zIndex = "1000"; // Ensure it's on top

  // Thêm hiệu ứng rung nhẹ để thu hút sự chú ý
  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    shakeCount++;
    if (shakeCount > 5) {
      clearInterval(shakeInterval);
      eventTextElement.style.transform = "translateX(-50%)";
      return;
    }

    const direction = shakeCount % 2 === 0 ? 1 : -1;
    eventTextElement.style.transform = `translateX(calc(-50% + ${
      direction * 3
    }px))`;
  }, 50);

  // Thêm hiệu ứng flash màu sắc
  eventTextElement.style.animation = "textFlash 0.5s linear 3";
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
    eventTextElement.style.opacity = "0";
    eventTextElement.style.textShadow = "none";
    eventTextElement.style.animation = "none";

    // Process next text in queue
    isShowingEventText = false;
    currentEventTimeout = null;

    if (eventTextQueue.length > 0) {
      const nextText = eventTextQueue.shift();
      showEventText(nextText);
    }
  }, GAME_CONFIG.ui.eventText.duration); // duration already in milliseconds
}

/**
 * Resets the event system queue and clears display.
 * Should be called when starting a new game.
 */
function resetEventSystem() {
  eventTextQueue.length = 0;

  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }
  isShowingEventText = false;

  const eventTextElement = document.getElementById("event-text");
  if (eventTextElement) {
    eventTextElement.style.opacity = "0";
    eventTextElement.style.textShadow = "none";
    eventTextElement.style.animation = "none";
    // Ensure the transform is reset after the shake interval is done
    eventTextElement.style.transform = "translateX(-50%)";
  }
}

// Chaos Manifest event removed as requested
function triggerChaosEvent(level) {
  // Function disabled - Chaos Manifest event removed as requested
  return;
}

/**
 * Triggers a random event based on current score thresholds and weights.
 * The core spawning logic remains here, while text display is handled by showEventText.
 */
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

      // The actual missile spawning logic is handled in the WarningSystem now.
      // We need to use spawnWithWarning from helpers.js.

      // Spawn 2 missiles with directional warnings
      const instantSides = ["left", "right", "top", "bottom"];
      const missileCount = 2;

      for (let i = 0; i < missileCount; i++) {
        const side =
          instantSides[Math.floor(Math.random() * instantSides.length)];
        let warningX, warningY, warningAngle, spawnX, spawnY, missileAngle;
        const warningOffset = 50;
        const spawnOffset = 30;

        switch (side) {
          case "left":
            warningX = warningOffset;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = 0;
            spawnX = -spawnOffset;
            spawnY = warningY;
            missileAngle = 0;
            break;
          case "right":
            warningX = width - warningOffset;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = Math.PI;
            spawnX = width + spawnOffset;
            spawnY = warningY;
            missileAngle = Math.PI;
            break;
          case "top":
            warningX = 100 + Math.random() * (width - 200);
            warningY = warningOffset;
            warningAngle = Math.PI / 2;
            spawnX = warningX;
            spawnY = -spawnOffset;
            missileAngle = Math.PI / 2;
            break;
          case "bottom":
            warningX = 100 + Math.random() * (width - 200);
            warningY = height - warningOffset;
            warningAngle = -Math.PI / 2;
            spawnX = warningX;
            spawnY = height + spawnOffset;
            missileAngle = -Math.PI / 2;
            break;
        }

        setTimeout(() => {
          if (isGameRunning) {
            const warningSystem = spawnWithWarning(
              "missile",
              warningX,
              warningY,
              {
                angle: warningAngle,
                duration: GAME_CONFIG.missiles.warningDuration,
              }
            );

            warningSystem.spawn(() => {
              missiles.push(new Missile(spawnX, spawnY, missileAngle));
              showEventText("🚀 MISSILE LAUNCHED! 🚀");
            });
          }
        }, i * GAME_CONFIG.missiles.warningDuration * (1000 / 60)); // Stagger the warnings
      }
      break;

    case "asteroidCircle":
      eventActive.type = "asteroidCircle";
      showEventText("Asteroid Circle Formation!");
      triggerAsteroidCircle();
      break;

    case "missileBarrage":
      eventActive.type = "missileBarrage";
      showEventText("🚀 MISSILE BARRAGE INCOMING! 🚀");

      const barrageSides = ["left", "right", "top", "bottom"];

      for (let i = 0; i < GAME_CONFIG.events.missileBarrage.count; i++) {
        const side =
          barrageSides[Math.floor(Math.random() * barrageSides.length)];
        let warningX, warningY, warningAngle, spawnX, spawnY, missileAngle;
        const warningOffset = 50;
        const spawnOffset = 30;

        switch (side) {
          case "left":
            warningX = warningOffset;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = 0;
            spawnX = -spawnOffset;
            spawnY = warningY;
            missileAngle = 0;
            break;
          case "right":
            warningX = width - warningOffset;
            warningY = 100 + Math.random() * (height - 200);
            warningAngle = Math.PI;
            spawnX = width + spawnOffset;
            spawnY = warningY;
            missileAngle = Math.PI;
            break;
          case "top":
            warningX = 100 + Math.random() * (width - 200);
            warningY = warningOffset;
            warningAngle = Math.PI / 2;
            spawnX = warningX;
            spawnY = -spawnOffset;
            missileAngle = Math.PI / 2;
            break;
          case "bottom":
            warningX = 100 + Math.random() * (width - 200);
            warningY = height - warningOffset;
            warningAngle = -Math.PI / 2;
            spawnX = warningX;
            spawnY = height + spawnOffset;
            missileAngle = -Math.PI / 2;
            break;
        }

        setTimeout(() => {
          if (isGameRunning) {
            const warningSystem = spawnWithWarning(
              "missile",
              warningX,
              warningY,
              {
                angle: warningAngle,
                duration: 90, // 1.5 seconds warning
              }
            );

            warningSystem.spawn(() => {
              missiles.push(new Missile(spawnX, spawnY, missileAngle));
            });
          }
        }, i * (GAME_CONFIG.events.missileBarrage.delay / 2));
      }
      break;

    case "laserGrid":
      eventActive.type = "laserGrid";
      showEventText("Laser Grid!");
      for (let i = 0; i < GAME_CONFIG.events.laserGrid.gridSize; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            lasers.push(new Laser(false));
            lasers.push(new Laser(true));
            if (i % 2 === 0) {
              lasers.push(new Laser(Math.random() < 0.5));
            }
          }
        }, i * GAME_CONFIG.events.laserGrid.delay);
      }
      break;

    case "blackHoleChain":
      eventActive.type = "blackHoleChain";
      showEventText("Black Hole Chain!");
      for (let i = 0; i < GAME_CONFIG.events.blackHoleChain.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.7;
            const warningSystem = spawnWithWarning("blackhole", x, y, {
              duration: GAME_CONFIG.blackHoles.warningDuration,
            });

            warningSystem.spawn(() => {
              blackHoles.push(new BlackHole(x, y, true));
              playSound("blackhole");
            });
          }
        }, i * GAME_CONFIG.events.blackHoleChain.delay);
      }
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
              duration: 120, // 2 seconds warning
            });

            warningSystem.spawn(() => {
              freezeZones.push(new FreezeZone(x, y));
              playSound("freeze");
            });
          }
        }, i * 500);
      }
      break;

    case "magneticStorm":
      eventActive.type = "magneticStorm";
      showEventText("⚠️ MAGNETIC STORM INCOMING! ⚠️ (3s)");

      const magneticWarningSystem = spawnWithWarning(
        "magnetic",
        width / 2,
        height / 2,
        {
          duration: 180,
        }
      );

      magneticWarningSystem.spawn(() => {
        if (isGameRunning) {
          magneticStorms.push(new MagneticStorm());
          showEventText("⚡ MAGNETIC STORM ACTIVE ⚡");
          playSound("warning");
          triggerScreenShake(0.3);
        }
      });
      break;

    case "asteroidBelt":
      eventActive.type = "asteroidBelt";
      showEventText("Asteroid Belt!");
      triggerAsteroidBelt();
      break;

    case "plasmaStorm":
      eventActive.type = "plasmaStorm";
      showEventText("⚠️ PLASMA INFERNO IMMINENT ⚠️");

      const plasmaConfig = GAME_CONFIG.events.plasmaStorm || {};
      const waveCount = plasmaConfig.waveCount || 4;
      const fieldsPerWave = plasmaConfig.fieldsPerWave || 5;
      const fieldStagger = plasmaConfig.fieldStagger || 80;
      const warningDuration = plasmaConfig.warningDuration || 180;

      for (let wave = 0; wave < waveCount; wave++) {
        const baseY = (canvas.height / (waveCount + 1)) * (wave + 1);

        for (let field = 0; field < fieldsPerWave; field++) {
          const x =
            (canvas.width / (fieldsPerWave + 1)) * (field + 1) +
            (Math.random() - 0.5) * (plasmaConfig.positionJitterX || 80);
          const y =
            baseY +
            (Math.random() - 0.5) * (plasmaConfig.positionJitterY || 60);
          const radius =
            (plasmaConfig.minRadius || 60) +
            Math.random() *
              ((plasmaConfig.maxRadius || 90) - (plasmaConfig.minRadius || 60));
          const timing = wave * fieldsPerWave + field;

          setTimeout(() => {
            if (isGameRunning) {
              const warningSystem = spawnWithWarning("plasma", x, y, {
                radius: radius,
                duration: warningDuration,
              });

              warningSystem.spawn(() => {
                if (isGameRunning) {
                  const plasma = new PlasmaField(x, y);
                  plasma.radius = radius;
                  plasma.damageRate = plasmaConfig.damageRate || 0.04;
                  plasmaFields.push(plasma);
                }
              });
            }
          }, timing * fieldStagger);
        }
      }

      setTimeout(() => {
        if (isGameRunning) {
          showEventText("🔥 PLASMA INFERNO UNLEASHED 🔥");
          triggerScreenShake(plasmaConfig.shakeIntensity || 0.8);
          playSound("explosion");
        }
      }, waveCount * fieldsPerWave * fieldStagger + warningDuration * (1000 / 60));
      break;

    case "crystalRain":
      eventActive.type = "crystalRain";
      showEventText("Cosmic Crystal Storm!");

      for (let cluster = 0; cluster < 4; cluster++) {
        const clusterX = (canvas.width / 5) * (cluster + 1);
        const clusterY = Math.random() * canvas.height * 0.3;

        for (let i = 0; i < GAME_CONFIG.events.crystalRain.count / 4; i++) {
          setTimeout(() => {
            if (isGameRunning) {
              const x = clusterX + (Math.random() - 0.5) * 150;
              const y = clusterY + (Math.random() - 0.5) * 80;

              const crystal = new CrystalShard(x, y);

              const angle = Math.atan2(y - clusterY, x - clusterX);
              crystal.velocity.x += Math.cos(angle + Math.PI / 2) * 0.3;
              crystal.velocity.y += Math.sin(angle + Math.PI / 2) * 0.3;

              crystalShards.push(crystal);
            }
          }, i * GAME_CONFIG.events.crystalRain.delay + cluster * 200);
        }
      }

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const edge = Math.floor(Math.random() * 4);
            let x, y;

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

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const angle = Math.atan2(centerY - y, centerX - x);

            crystal.velocity.x = Math.cos(angle) * (0.8 + Math.random() * 0.6);
            crystal.velocity.y = Math.sin(angle) * (0.8 + Math.random() * 0.6);

            crystalShards.push(crystal);
          }
        }, Math.random() * 3000);
      }

      playSound("crystal");
      break;

    case "quantumTunnels":
      eventActive.type = "quantumTunnels";
      showEventText("Quantum Portal Pair!");

      const tunnelX1 = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const tunnelY1 =
        Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
      const tunnelX2 = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const tunnelY2 =
        Math.random() * canvas.height * 0.8 + canvas.height * 0.1;

      quantumPortals.push(new QuantumPortal(tunnelX1, tunnelY1));
      quantumPortals.push(new QuantumPortal(tunnelX2, tunnelY2));

      playSound("wormhole");
      break;

    case "gravityWells":
      eventActive.type = "gravityWells";
      showEventText("Gravity Well Field!");
      for (let i = 0; i < GAME_CONFIG.events.gravityWells.count; i++) {
        const x = 100 + Math.random() * (canvas.width - 200);
        const y = 100 + Math.random() * (canvas.height - 200);

        const warningSystem = spawnWithWarning("blackhole", x, y, {
          duration: 120,
        });

        warningSystem.spawn(() => {
          blackHoles.push(
            new BlackHole(x, y, GAME_CONFIG.events.gravityWells.radius / 2)
          );
        });
      }
      break;

    case "meteorBombardment":
      eventActive.type = "meteorBombardment";
      showEventText("⚠️ METEOR BOMBARDMENT IMMINENT ⚠️");

      const meteorCfg = GAME_CONFIG.events.meteorBombardment;
      const warningDurationM = 180;

      for (let i = 0; i < meteorCfg.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * canvas.width;
            const y = -30;
            const impactY = Math.random() * (canvas.height - 100) + 50;

            const warningSystem = spawnWithWarning("meteor", x, impactY, {
              duration: warningDurationM,
              spawnX: x,
              spawnY: y,
              speed: meteorCfg.speed,
            });

            warningSystem.spawn(() => {
              if (isGameRunning) {
                const meteor = new Asteroid(
                  x,
                  y,
                  20 + Math.random() * 15,
                  "#ff6b35",
                  {
                    x: (Math.random() - 0.5) * 2,
                    y: meteorCfg.speed,
                  }
                );
                asteroids.push(meteor);
              }
            });
          }
        }, i * meteorCfg.delay);
      }

      playSound("warning");
      break;

    case "voidRifts":
      eventActive.type = "voidRifts";
      showEventText("⚠️ Void Rifts Detected ⚠️");

      for (let i = 0; i < GAME_CONFIG.events.voidRifts.count; i++) {
        const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const y = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;

        const warningSystem = spawnWithWarning("voidrift", x, y, {
          duration: 180,
        });

        warningSystem.spawn(() => {
          if (isGameRunning) {
            const voidRift = new BlackHole(x, y, true);
            voidRift.isVoidRift = true;
            voidRift.lifetime = 300;
            blackHoles.push(voidRift);
            playSound("blackhole");
          }
        });
      }
      break;

    case "lightningStorm":
      eventActive.type = "lightningStorm";
      showEventText("⚡ THUNDER SHIELD! ⚡");

      lightningStorms.push(new LightningStorm());

      playSound("warning");
      triggerScreenShake(0.4);
      break;

    case "speedZone":
      eventActive.type = "speedZone";
      globalSpeedMultiplier *= GAME_CONFIG.events.speedZone.speedMultiplier;
      showEventText("Difficulty Spike!");
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
  }
}

/**
 * Test function for event text display
 */
function testEventText() {
  console.log('Testing event text display...');
  const eventTextElement = document.getElementById("event-text");
  if (!eventTextElement) {
    console.error("Event text element not found!");
    return;
  }
  
  // Force display test text
  eventTextElement.innerText = "⚠️ TEST EVENT TEXT ⚠️";
  eventTextElement.style.opacity = "1";
  eventTextElement.style.fontSize = "2.5rem";
  eventTextElement.style.color = "#ffbb33";
  eventTextElement.style.textShadow = "0 0 15px #ffff00, 0 0 25px #ffff00";
  eventTextElement.style.zIndex = "1000";
  eventTextElement.style.pointerEvents = "none";
  
  console.log('Test event text displayed');
  
  // Hide after 3 seconds
  setTimeout(() => {
    eventTextElement.style.opacity = "0";
    console.log('Test event text hidden');
  }, 3000);
}

// Expose to global scope for access from game.js
window.triggerRandomEvent = triggerRandomEvent;
window.showEventText = showEventText;
window.testEventText = testEventText;
