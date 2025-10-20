// Event text queue system to prevent flickering
let eventTextQueue = [];
let isShowingEventText = false;
let currentEventTimeout = null;

// FIX: Safe translation helper to prevent crashes if gameSettings.t is missing
const safeT = (key, fallback) => {
  if (window.gameSettings && typeof window.gameSettings.t === "function") {
    return window.gameSettings.t(key) || fallback;
  }
  return fallback;
};
// END FIX

/**
 * Public function to show event text, using a queue system to handle overlaps.
 * This function should be the ONLY way to show event text.
 */
function showEventText(text) {
  // The functions calling this (animate, triggerRandomEvent) already check if the game is running.
  // Removing the check here allows for messages to be queued and displayed even if the game ends on the same frame,
  // such as a level-up message on death. The queue is cleared on game restart by resetEventSystem().
  console.log("showEventText called with:", text);

  // Add to queue if currently showing text
  if (isShowingEventText) {
    eventTextQueue.push(text);
    console.log("Added to queue:", text);
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
  console.log("displayEventText called with:", text);

  // Clear any existing timeout
  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }

  // Get event text element safely
  const eventTextElement = document.getElementById("event-text");
  if (!eventTextElement) {
    console.warn("Event text element not found!");
    isShowingEventText = false; // Reset state if element is missing
    return;
  }

  console.log("Event text element found, displaying:", text);

  eventTextElement.innerText = text;
  eventTextElement.style.fontSize = GAME_CONFIG.ui.eventText.fontSize;
  eventTextElement.style.opacity = "1";
  eventTextElement.style.textShadow = "0 0 15px #ffff00, 0 0 25px #ffff00";
  eventTextElement.style.zIndex = "1000"; // Ensure it's on top

  // Add a light shake effect for attention
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

  // Add a color flash effect
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
  }, GAME_CONFIG.ui.eventText.duration);
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
    eventTextElement.style.transform = "translateX(-50%)";
  }
}

/**
 * Triggers a random event based on current score thresholds and weights.
 * The core spawning logic remains here, while text display is handled by showEventText.
 */
function triggerRandomEvent() {
  if (!window.isGameRunning) return;

  const baseEventWeights = [
    { type: "asteroidShower", weight: 35 },
    { type: "instantMissiles", weight: 25 },
    { type: "laserGrid", weight: 20 },
    { type: "crystalRain", weight: 25 },
    { type: "freezeZone", weight: 15 },
    { type: "magneticStorm", weight: 15 },
    { type: "blackHoleChain", weight: 12 },
    { type: "asteroidCircle", weight: 15 },
    { type: "missileBarrage", weight: 18 },
    { type: "gravitationalAnomaly", weight: 10 },
    { type: "asteroidRain", weight: 20 },
    { type: "wormholePortal", weight: 10 },
    { type: "voidRifts", weight: 10 },
    { type: "lightningStorm", weight: 15 },
    { type: "plasmaStorm", weight: 10 },
    { type: "temporalChaos", weight: 7 },
    { type: "lightningNetwork", weight: 7 },
    { type: "voidStorm", weight: 6 },
    { type: "mineFieldDetonation", weight: 8 },
    { type: "shieldGenerator", weight: 20 },
    { type: "gravityWells", weight: 10 },
    { type: "decoyPowerUp", weight: 18 }, // New Event
    { type: "chaosMode", weight: 8 }, // New Event
  ];

  const unlockThresholds = GAME_CONFIG.events.unlockThresholds || {};

  const availableEvents = baseEventWeights.filter((event) => {
    const threshold = unlockThresholds[event.type] || 0;
    return score >= threshold;
  });

  if (availableEvents.length === 0) {
    const defaultEvent =
      baseEventWeights.find((e) => e.type === "asteroidShower") ||
      baseEventWeights[0];
    if (defaultEvent) {
      availableEvents.push(defaultEvent);
    } else {
      return;
    }
  }

  const totalWeight = availableEvents.reduce(
    (sum, event) => sum + event.weight,
    0
  );

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

  eventActive.endTime =
    timers.difficulty + Math.floor(GAME_CONFIG.events.duration * 0.75);

  switch (randomEventType) {
    case "decoyPowerUp":
      eventActive.type = "decoyPowerUp";
      showEventText(safeT("event.decoyPowerUp", "Decoy Power-up Deployed!"));
      if (typeof decoyPowerUps !== "undefined") {
        decoyPowerUps.push(
          new DecoyPowerUp(
            Math.random() * (width - 100) + 50,
            Math.random() * (height / 2) + 50
          )
        );
      }
      break;

    case "chaosMode":
      eventActive.type = "chaosMode";
      showEventText(safeT("event.chaosMode", "CHAOS MODE ACTIVATED!"));
      // Rapidly spawn a few different hazards
      setTimeout(() => {
        if (isGameRunning) lasers.push(new Laser(true));
      }, 200);
      setTimeout(() => {
        if (isGameRunning)
          missiles.push(new Missile(0, Math.random() * height, 0));
      }, 800);
      setTimeout(() => {
        if (isGameRunning)
          for (let i = 0; i < 5; i++)
            asteroids.push(createMiniShowerAsteroid("top"));
      }, 1200);
      break;

    case "asteroidShower":
      eventActive.type = "asteroidShower";
      showEventText(safeT("event.asteroidShower", "Asteroid Shower!"));
      const totalAsteroids = 25;
      const waves = 3;
      const asteroidsPerWave = Math.floor(totalAsteroids / waves);
      for (let wave = 0; wave < waves; wave++) {
        setTimeout(() => {
          if (isGameRunning) {
            const directions = ["top", "left", "right", "bottom"];
            const direction =
              directions[Math.floor(Math.random() * directions.length)];
            for (let i = 0; i < asteroidsPerWave; i++) {
              setTimeout(() => {
                if (isGameRunning) {
                  asteroids.push(createMiniShowerAsteroid(direction));
                }
              }, i * 80);
            }
          }
        }, wave * 1000);
      }
      break;

    case "instantMissiles":
      eventActive.type = "instantMissiles";
      showEventText(safeT("event.missileIncoming", "Missile Incoming!"));
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
                duration: GAME_CONFIG.entities.missiles.warningDuration,
              }
            );
            warningSystem.spawn(() => {
              missiles.push(new Missile(spawnX, spawnY, missileAngle));
            });
          }
        }, i * GAME_CONFIG.entities.missiles.warningDuration * (1000 / 60));
      }
      break;

    case "asteroidCircle":
      eventActive.type = "asteroidCircle";
      showEventText(
        safeT("event.asteroidCircle", "Asteroid Circle Formation!")
      );
      triggerAsteroidCircle();
      break;

    case "missileBarrage":
      eventActive.type = "missileBarrage";
      showEventText(safeT("event.missileBarrage", "Missile Barrage Incoming!"));
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
                duration: 90,
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
      showEventText(safeT("event.laserGrid", "Laser Grid!"));
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
      showEventText(safeT("event.blackHoleChain", "Black Hole Chain!"));
      for (let i = 0; i < GAME_CONFIG.events.blackHoleChain.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.7;
            const warningSystem = spawnWithWarning("blackhole", x, y, {
              duration: GAME_CONFIG.entities.blackHoles.warningDuration,
            });
            warningSystem.spawn(() => {
              blackHoles.push(new BlackHole(x, y, true));
              playSound("blackhole");
            });
          }
        }, i * GAME_CONFIG.events.blackHoleChain.delay);
      }
      break;

    case "shieldGenerator":
      eventActive.type = "shieldGenerator";
      showEventText(
        safeT("event.shieldGenerator", "Shield Generator Deployed!")
      );
      const genX = Math.random() * (width - 200) + 100;
      const genY = Math.random() * (height / 2) + 50;
      if (typeof shieldGenerators !== "undefined") {
        shieldGenerators.push(new ShieldGenerator(genX, genY));
      }
      break;

    case "mineFieldDetonation":
      eventActive.type = "mineFieldDetonation";
      showEventText(
        safeT("event.mineFieldDetonation", "⚠️ Mine Field Detonation! ⚠️")
      );
      const mineConfig = GAME_CONFIG.events.mineFieldDetonation;
      for (let i = 0; i < mineConfig.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * width * 0.8 + width * 0.1;
            const y = Math.random() * height * 0.6;
            const warningSystem = spawnWithWarning("lasermine", x, y, {
              duration: mineConfig.warningTime,
            });
            warningSystem.spawn(() => {
              const mine = new LaserMine(x, y);
              mine.maxTime = mineConfig.chargeTime;
              laserMines.push(mine);
            });
          }
        }, i * mineConfig.delay);
      }
      break;

    case "wormholePortal":
      eventActive.type = "wormholePortal";
      showEventText(safeT("event.wormholePortal", "Wormhole Opened!"));
      const wormholeX = Math.random() * (width - 200) + 100;
      const wormholeY = Math.random() * (height / 2) + 100;
      if (typeof wormholes !== "undefined") {
        wormholes.push(new Wormhole(wormholeX, wormholeY));
        playSound("wormhole");
      }
      break;

    case "freezeZone":
      eventActive.type = "freezeZone";
      showEventText(safeT("event.freezeZone", "❄️ FREEZE ZONES IMMINENT ❄️"));
      for (let i = 0; i < (GAME_CONFIG.events.freezeZone.count || 3); i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const warningSystem = spawnWithWarning("freeze", x, y, {
              radius: GAME_CONFIG.newObjects.freezeZone.radius,
              duration: 120,
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
      showEventText(
        safeT(
          "event.magneticStormIncoming",
          "⚠️ MAGNETIC STORM INCOMING! ⚠️ (3s)"
        )
      );
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
          showEventText(
            safeT("event.magneticStormActive", "⚡ MAGNETIC STORM ACTIVE ⚡")
          );
          playSound("warning");
          triggerScreenShake(0.3);
        }
      });
      break;

    case "asteroidBelt":
      eventActive.type = "asteroidBelt";
      showEventText(safeT("event.asteroidBelt", "Asteroid Belt!"));
      triggerAsteroidBelt();
      break;

    case "plasmaStorm":
      eventActive.type = "plasmaStorm";
      showEventText(safeT("event.plasmaInferno", "Plasma Inferno Incoming!"));
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
          showEventText(
            safeT("event.plasmaUnleashed", "🔥 PLASMA INFERNO UNLEASHED 🔥")
          );
          triggerScreenShake(plasmaConfig.shakeIntensity || 0.8);
          playSound("explosion");
        }
      }, waveCount * fieldsPerWave * fieldStagger + warningDuration * (1000 / 60));
      break;

    case "crystalRain":
      eventActive.type = "crystalRain";
      showEventText(safeT("event.crystalStorm", "Cosmic Crystal Storm!"));
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
              case 0:
                x = Math.random() * canvas.width;
                y = -30;
                break;
              case 1:
                x = canvas.width + 30;
                y = Math.random() * canvas.height;
                break;
              case 2:
                x = Math.random() * canvas.width;
                y = canvas.height + 30;
                break;
              case 3:
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
      playSound("powerup"); // Changed from crystal to powerup for better sound
      break;

    case "quantumTunnels":
      eventActive.type = "quantumTunnels";
      showEventText(safeT("event.quantumPortal", "Quantum Portal Pair!"));
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
      showEventText(safeT("event.gravityWells", "Gravity Well Field!"));
      for (let i = 0; i < GAME_CONFIG.events.gravityWells.count; i++) {
        const x = 100 + Math.random() * (canvas.width - 200);
        const y = 100 + Math.random() * (canvas.height - 200);
        const warningSystem = spawnWithWarning("blackhole", x, y, {
          duration: 120,
        });
        warningSystem.spawn(() => {
          const bh = new BlackHole(x, y, true);
          bh.radius = GAME_CONFIG.events.gravityWells.radius;
          bh.maxRadius = GAME_CONFIG.events.gravityWells.radius;
          bh.strength *= 0.5;
          blackHoles.push(bh);
        });
      }
      break;

    case "meteorBombardment":
      eventActive.type = "meteorBombardment";
      showEventText(
        safeT("event.meteorBombardment", "⚠️ METEOR BOMBARDMENT IMMINENT ⚠️")
      );
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
      showEventText(safeT("event.voidRifts", "⚠️ Void Rifts Detected ⚠️"));
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
      showEventText(safeT("event.lightningStorm", "⚡ THUNDER SHIELD! ⚡"));
      lightningStorms.push(new LightningStorm());
      playSound("warning");
      triggerScreenShake(0.4);
      break;

    case "speedZone":
      eventActive.type = "speedZone";
      globalSpeedMultiplier *= GAME_CONFIG.events.speedZone.speedMultiplier;
      showEventText(safeT("event.difficultySpike", "Difficulty Spike!"));
      break;

    case "asteroidRain":
      eventActive.type = "asteroidRain";
      showEventText(safeT("event.asteroidRain", "Asteroid Rain!"));
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

// Expose to global scope for access from game.js
window.triggerRandomEvent = triggerRandomEvent;
window.showEventText = showEventText;
window.resetEventSystem = resetEventSystem;
