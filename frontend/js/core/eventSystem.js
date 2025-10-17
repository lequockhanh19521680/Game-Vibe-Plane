// Event text queue system to prevent flickering
let eventTextQueue = [];
let isShowingEventText = false;
let currentEventTimeout = null;

function showEventText(text) {
  // Add to queue if currently showing text
  if (isShowingEventText) {
    eventTextQueue.push(text);
    return;
  }

  // Mark as showing and display immediately
  isShowingEventText = true;
  displayEventText(text);
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
  // SIMPLIFIED EVENTS - Removed duplicates, reduced difficulty
  const eventWeights = [
    // CORE EVENTS - Basic gameplay (HIGHER weights = easier game)
    { type: "asteroidShower", weight: 35 }, // Simple shower from top
    { type: "instantMissiles", weight: 25 }, // 2 missiles with warning
    { type: "laserGrid", weight: 20 }, // Laser pattern

    // COLLECTIBLES - Good for player (INCREASED weights)
    { type: "crystalRain", weight: 25 }, // Power-ups
    { type: "lightningStorm", weight: 20 }, // Thunder shield opportunity

    // MODERATE THREATS
    { type: "freezeZone", weight: 15 }, // Slow zones
    { type: "magneticStorm", weight: 15 }, // Magnetic pull
    { type: "blackHoleChain", weight: 12 }, // Black holes

    // ADVANCED THREATS (Lower weights = rarer)
    { type: "plasmaStorm", weight: 10 }, // Plasma fields
    { type: "superNova", weight: 8 }, // Big explosion
    { type: "lightningNetwork", weight: 10 }, // Chain lightning
    { type: "gravityWaveCascade", weight: 8 }, // Gravity waves
  ];

  // Loại bỏ tính toán trọng số dựa trên điểm số - tất cả sự kiện đều có thể xuất hiện ngẫu nhiên
  // Không còn phụ thuộc vào điểm số để điều chỉnh trọng số các sự kiện

  // Calculate total weight
  const totalWeight = eventWeights.reduce(
    (sum, event) => sum + event.weight,
    0
  );

  // Pick a random event based on weights
  let random = Math.random() * totalWeight;
  let selectedEvent = eventWeights[0].type;

  for (const event of eventWeights) {
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

    // speedZone event REMOVED - Only showed text without real gameplay impact

    case "instantMissiles":
      // Loại bỏ điều kiện kiểm tra điểm số - event xuất hiện bất kể điểm số
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

      // Create multiple missile warnings from different sides that will match actual spawn locations
      // First missile will actually spawn from here
      const spawnSide1 = Math.random() < 0.5 ? "left" : "right";
      const spawnY1 = 100 + Math.random() * (height - 200);

      const warningX1 = spawnSide1 === "left" ? 50 : width - 50;
      const warningY1 = spawnY1;

      // Store these coordinates for actual missile spawn later
      this.missileSpawn1 = {
        side: spawnSide1,
        y: spawnY1,
      };

      warnings.push(
        new Warning(
          warningX1,
          warningY1,
          "missile",
          120, // 2 seconds warning
          spawnSide1 === "left" ? 0 : Math.PI // Arrow pointing in the right direction
        )
      );

      // Second missile will actually spawn from here
      const spawnSide2 = spawnSide1 === "left" ? "right" : "left"; // Opposite side
      const spawnY2 = 100 + Math.random() * (height - 200);

      const warningX2 = spawnSide2 === "left" ? 50 : width - 50;
      const warningY2 = spawnY2;

      // Store these coordinates for actual missile spawn later
      this.missileSpawn2 = {
        side: spawnSide2,
        y: spawnY2,
      };

      warnings.push(
        new Warning(
          warningX2,
          warningY2,
          "missile",
          120, // 2 seconds warning
          spawnSide2 === "left" ? 0 : Math.PI // Arrow pointing in the right direction
        )
      );

      // Launch missiles after warning, using stored spawn locations
      setTimeout(() => {
        if (isGameRunning) {
          // First missile
          let missile1 = new Missile();
          // Override position based on stored spawn info
          if (this.missileSpawn1) {
            missile1.x = this.missileSpawn1.side === "left" ? -20 : width + 20;
            missile1.y = this.missileSpawn1.y;
            missile1.angle = this.missileSpawn1.side === "left" ? 0 : Math.PI;
            missile1.velocity = {
              x: Math.cos(missile1.angle) * missile1.speed,
              y: Math.sin(missile1.angle) * missile1.speed,
            };
          }

          // Second missile
          let missile2 = new Missile();
          // Override position based on stored spawn info
          if (this.missileSpawn2) {
            missile2.x = this.missileSpawn2.side === "left" ? -20 : width + 20;
            missile2.y = this.missileSpawn2.y;
            missile2.angle = this.missileSpawn2.side === "left" ? 0 : Math.PI;
            missile2.velocity = {
              x: Math.cos(missile2.angle) * missile2.speed,
              y: Math.sin(missile2.angle) * missile2.speed,
            };
          }

          missiles.push(missile1);
          missiles.push(missile2);
          showEventText("🚀 MISSILES LAUNCHED! 🚀");
        }
      }, 120 * (1000 / 60)); // 2 seconds
      break;
    // laserSwarm event REMOVED - Duplicate of laserGrid with worse gameplay
    // gravitationalAnomaly event REMOVED - Duplicate of blackHoleChain
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
            const finalWarningAngle = warningAngle;
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

    // wormholePortal event REMOVED - Duplicate of portals system
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

    // quantumTunnels event REMOVED - Duplicate of portal system
    case "voidRifts":
      handleVoidRiftsEvent();
      break;

    case "superNova":
      handleSuperNovaEvent();
      break;

    case "lightningStorm":
      handleLightningStormEvent();
      break;

    // NEW CREATIVE EVENTS
    case "gravityWaveCascade":
      handleGravityWaveCascadeEvent();
      break;

    case "temporalChaos":
      handleTemporalChaosEvent();
      break;

    case "lightningNetwork":
      handleLightningNetworkEvent();
      break;

    case "voidStorm":
      handleVoidStormEvent();
      break;

    case "mineFieldDetonation":
      handleMineFieldDetonationEvent();
      break;
  }

  // Create a new wrapper function for the plasmaStorm event
  function handlePlasmaStormEvent() {
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
            const timing = ((wave * fieldsPerWave + field) * 80) / (1000 / 60); // Convert ms to frames

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
          if (this.timer + 60 > pos.timing && this.timer < this.warningDelay) {
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

    // Use universal warning system for each plasma field
    const waveCount = 4;
    const fieldsPerWave = 5;
    const allPlasmaData = [];

    // Pre-calculate all plasma positions
    for (let wave = 0; wave < waveCount; wave++) {
      const baseY = (canvas.height / 5) * (wave + 1);

      for (let field = 0; field < fieldsPerWave; field++) {
        const x =
          (canvas.width / (fieldsPerWave + 1)) * (field + 1) +
          (Math.random() - 0.5) * 80;
        const y = baseY + (Math.random() - 0.5) * 60;
        const radius = 60 + Math.random() * 20;
        const timing = wave * fieldsPerWave + field;

        allPlasmaData.push({ x, y, radius, timing });

        // Create individual warning for each plasma field
        setTimeout(() => {
          if (isGameRunning) {
            const warningSystem = spawnWithWarning("plasma", x, y, {
              radius: radius,
            });

            warningSystem.spawn(() => {
              const plasma = new PlasmaField(x, y);
              plasma.radius = radius * 1.2;
              plasma.damageRate = 0.04;
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
        }, timing * 80);
      }
    }

    // Global effects
    setTimeout(() => {
      if (isGameRunning) {
        showEventText("🔥 PLASMA INFERNO UNLEASHED 🔥");
        triggerScreenShake(0.8);
        playSound("explosion");
      }
    }, 2000);
  } // Close handlePlasmaStormEvent function

  function handleCrystalRainEvent() {
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
  } // Close handleCrystalRainEvent function

  // handleQuantumTunnelsEvent function REMOVED - Duplicate event deleted

  function handleVoidRiftsEvent() {
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
  }

  function handleSecondVoidRiftsEvent() {
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
  }

  function handleSuperNovaEvent() {
    eventActive.type = "superNova";
    showEventText("⚠️ SUPERNOVA IMMINENT ⚠️");

    // Supernova location
    const superX = 100 + Math.random() * (canvas.width - 200);
    const superY = 100 + Math.random() * (canvas.height - 200);

    // Use new universal warning system with enhanced mobile support
    const warningSystem = spawnWithWarning("supernova", superX, superY, {
      maxRadius: GAME_CONFIG.events.superNova.maxRadius,
      duration: 180, // 3 second warning
    });

    warningSystem.spawn(() => {
      superNovas.push(new SuperNova(superX, superY));
    });

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
        if (this.radius < this.maxRadius && this.timer < this.duration * 0.7) {
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
  }

  function handleLightningStormEvent() {
    eventActive.type = "lightningStorm";
    showEventText("⚡ THUNDER SHIELD OPPORTUNITY! ⚡");

    // Create lightning storm
    lightningStorms.push(new LightningStorm());

    playSound("warning");
    triggerScreenShake(0.4);
  }

  // NEW CREATIVE EVENT HANDLERS

  function handleGravityWaveCascadeEvent() {
    const config = GAME_CONFIG.events.gravityWaveCascade;
    eventActive.type = "gravityWaveCascade";
    showEventText("🌊 GRAVITY WAVE CASCADE!");

    // Create multiple gravity waves in sequence
    for (let i = 0; i < config.count; i++) {
      setTimeout(() => {
        if (isGameRunning) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          gravityWaves.push(new GravityWave(x, y));
          playSound("warning", 0.5);
          triggerScreenShake(0.2);
        }
      }, i * config.delay);
    }
  }

  function handleTemporalChaosEvent() {
    const config = GAME_CONFIG.events.temporalChaos;
    eventActive.type = "temporalChaos";
    showEventText("⏰ TEMPORAL CHAOS EVENT!");

    // Create slow zones
    for (let i = 0; i < config.slowZoneCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      timeDistortions.push(new TimeDistortion(x, y, false)); // Slow
    }

    // Create fast zones
    for (let i = 0; i < config.fastZoneCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      timeDistortions.push(new TimeDistortion(x, y, true)); // Fast
    }

    playSound("warning");
    triggerScreenShake(0.3);
  }

  function handleLightningNetworkEvent() {
    const config = GAME_CONFIG.events.lightningNetwork;
    eventActive.type = "lightningNetwork";
    showEventText("⚡ LIGHTNING NETWORK ACTIVE!");

    console.log("Lightning Network event triggered!", config);

    // Create lightning orbs in a network pattern with warnings first
    const centerX = width / 2;
    const centerY = height / 2;
    const count = config.count || 5;
    const spacing = config.spacing || 150;

    // DIRECT SPAWN (NO WARNING) - Testing fix for invisible lightning
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (isGameRunning) {
          const angle = (i / count) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * spacing;
          const y = centerY + Math.sin(angle) * spacing;

          // SPAWN IMMEDIATELY WITHOUT WARNING
          const lightning = new ChainLightning(x, y);
          chainLightnings.push(lightning);
          console.log(
            `⚡ CHAIN LIGHTNING SPAWNED DIRECTLY at (${x.toFixed(
              0
            )}, ${y.toFixed(0)}), total: ${chainLightnings.length}, age: ${
              lightning.age
            }, lifetime: ${lightning.lifetime}`
          );

          // Play sound
          if (typeof playSound === "function") {
            playSound("thunder", 0.5);
          }
        }
      }, i * 500); // Stagger spawn every 0.5 seconds
    }

    triggerScreenShake(0.4);
  }

  function handleVoidStormEvent() {
    const config = GAME_CONFIG.events.voidStorm;
    eventActive.type = "voidStorm";
    showEventText("🌀 VOID STORM DETECTED!");

    // Create void rifts in pairs for teleportation chaos
    for (let i = 0; i < config.riftCount / 2; i++) {
      setTimeout(() => {
        if (isGameRunning) {
          const x1 = Math.random() * width;
          const y1 = Math.random() * height;
          const x2 = Math.random() * width;
          const y2 = Math.random() * height;

          const rift1 = new VoidRift(x1, y1);
          const rift2 = new VoidRift(x2, y2, rift1);

          voidRifts.push(rift1, rift2);
          console.log(
            `🌀 VOID RIFTS SPAWNED: Rift1 (${x1.toFixed(0)}, ${y1.toFixed(
              0
            )}), Rift2 (${x2.toFixed(0)}, ${y2.toFixed(0)}), total: ${
              voidRifts.length
            }`
          );
          playSound("wormhole", 0.4);
        }
      }, i * config.spawnDelay);
    }

    triggerScreenShake(0.3);
  }

  function handleMineFieldDetonationEvent() {
    const config = GAME_CONFIG.events.mineFieldDetonation;
    eventActive.type = "mineFieldDetonation";
    showEventText("💥 COSMIC MINE FIELD!");

    // Create mines in a grid pattern
    const gridSize = config.gridSize;
    const spacingX = width / (gridSize + 1);
    const spacingY = height / (gridSize + 1);

    let mineIndex = 0;
    for (let i = 1; i <= gridSize; i++) {
      for (let j = 1; j <= gridSize; j++) {
        if (mineIndex >= config.mineCount) break;

        const x = spacingX * i + (Math.random() - 0.5) * spacingX * 0.3;
        const y = spacingY * j + (Math.random() - 0.5) * spacingY * 0.3;

        cosmicMines.push(new CosmicMine(x, y));
        mineIndex++;
      }
    }

    playSound("warning");
    triggerScreenShake(0.2);
  }
} // Close triggerRandomEvent function
