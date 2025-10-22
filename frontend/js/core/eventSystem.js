// Event text queue system to prevent flickering
let eventTextQueue = [];
let isShowingEventText = false;
let currentEventTimeout = null;

// Safe translation helper
const safeT = (key, fallback) => {
  if (window.gameSettings && typeof window.gameSettings.t === "function") {
    return window.gameSettings.t(key) || fallback;
  }
  return fallback;
};

/**
 * Public function to show event text, using a queue.
 */
function showEventText(text) {
  console.log("showEventText called with:", text);
  if (isShowingEventText) {
    eventTextQueue.push(text);
    console.log("Added to queue:", text);
    return;
  }
  isShowingEventText = true;
  displayEventText(text);
}

/**
 * Internal function to display text and handle animations/timers.
 */
function displayEventText(text) {
  console.log("displayEventText called with:", text);
  if (currentEventTimeout) {
    clearTimeout(currentEventTimeout);
    currentEventTimeout = null;
  }
  const eventTextElement = document.getElementById("event-text");
  if (!eventTextElement) {
    console.warn("Event text element not found!");
    isShowingEventText = false;
    return;
  }
  console.log("Event text element found, displaying:", text);
  eventTextElement.innerText = text;
  eventTextElement.style.fontSize = GAME_CONFIG.ui.eventText.fontSize;
  eventTextElement.style.opacity = "1";
  eventTextElement.style.textShadow = "0 0 15px #ffff00, 0 0 25px #ffff00";
  eventTextElement.style.zIndex = "1000";

  // Shake effect
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

  // Color flash effect
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
    isShowingEventText = false;
    currentEventTimeout = null;
    if (eventTextQueue.length > 0) {
      const nextText = eventTextQueue.shift();
      showEventText(nextText);
    }
  }, GAME_CONFIG.ui.eventText.duration);
}

/**
 * Resets the event system.
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
 * Triggers a random event based on score thresholds and weights.
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
    //{ type: "gravitationalAnomaly", weight: 10 }, // Config commented out
    { type: "asteroidRain", weight: 20 },
    { type: "wormholePortal", weight: 10 },
    { type: "voidRifts", weight: 10 },
    { type: "lightningStorm", weight: 15 },
    { type: "plasmaStorm", weight: 10 },
    //{ type: "temporalChaos", weight: 7 }, // Config commented out, case removed below
    //{ type: "lightningNetwork", weight: 7 }, // Config commented out, case removed below
    //{ type: "voidStorm", weight: 6 }, // Config commented out, case removed below
    { type: "mineFieldDetonation", weight: 8 },
    { type: "shieldGenerator", weight: 20 },
    { type: "gravityWells", weight: 10 },
    { type: "decoyPowerUp", weight: 18 },
    { type: "chaosMode", weight: 8 },
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
      return; // No events available at all
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

  // Set a general end time for the event's *active* state influence, if applicable
  eventActive.endTime =
    timers.difficulty + Math.floor(GAME_CONFIG.events.duration * 0.75); // Slightly shorter active duration

  // Trigger the selected event logic
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
              }, i * 80); // Spawn delay within wave
            }
          }
        }, wave * 1000); // Delay between waves
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
        // ... (switch case for side setup remains the same) ...
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
        }, i * GAME_CONFIG.entities.missiles.warningDuration * (1000 / 60)); // Delay between missiles
      }
      break;

    case "asteroidCircle":
      eventActive.type = "asteroidCircle";
      showEventText(
        safeT("event.asteroidCircle", "Asteroid Circle Formation!")
      );
      triggerAsteroidCircle(); // Assumes this helper function exists and works
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
        // ... (switch case for side setup remains the same) ...
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
                duration: 90, // Shorter warning for barrage
              }
            );
            warningSystem.spawn(() => {
              missiles.push(new Missile(spawnX, spawnY, missileAngle));
            });
          }
        }, i * (GAME_CONFIG.events.missileBarrage.delay / 2)); // Faster spawn delay
      }
      break;

    case "laserGrid":
      eventActive.type = "laserGrid";
      showEventText(safeT("event.laserGrid", "Laser Grid!"));
      for (let i = 0; i < GAME_CONFIG.events.laserGrid.gridSize; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            lasers.push(new Laser(false)); // Random laser
            lasers.push(new Laser(true)); // Targeted laser
            if (i % 2 === 0) {
              // Add extra randomness
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
            const y = Math.random() * height * 0.7; // Spawn higher up
            const warningSystem = spawnWithWarning("blackhole", x, y, {
              duration: GAME_CONFIG.entities.blackHoles.warningDuration,
            });
            warningSystem.spawn(() => {
              blackHoles.push(new BlackHole(x, y, true)); // Ensure temporary
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
              mine.maxTime = mineConfig.chargeTime; // Use specific charge time for event
              laserMines.push(mine);
            });
          }
        }, i * mineConfig.delay);
      }
      break;

    case "wormholePortal": // Logic requires Wormhole class
      eventActive.type = "wormholePortal";
      showEventText(safeT("event.wormholePortal", "Wormhole Opened!"));
      const wormholeX = Math.random() * (width - 200) + 100;
      const wormholeY = Math.random() * (height / 2) + 100;
      if (typeof Wormhole !== "undefined" && typeof wormholes !== "undefined") {
        // Check if class and array exist
        wormholes.push(new Wormhole(wormholeX, wormholeY));
        playSound("wormhole");
      } else {
        console.warn("Wormhole class or array not found for event.");
      }
      break;

    case "freezeZone":
      eventActive.type = "freezeZone";
      showEventText(safeT("event.freezeZone", "❄️ FREEZE ZONES IMMINENT ❄️"));
      const freezeConfig = GAME_CONFIG.events.freezeZone || {};
      for (let i = 0; i < (freezeConfig.count || 3); i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const warningSystem = spawnWithWarning("freeze", x, y, {
              radius: GAME_CONFIG.newObjects.freezeZone.radius,
              duration: freezeConfig.warningDuration || 120,
            });
            warningSystem.spawn(() => {
              freezeZones.push(new FreezeZone(x, y));
              playSound("freeze");
            });
          }
        }, i * 500); // Stagger spawn
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
        { duration: 180 }
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

    // REMOVED: Unused event case
    // case "asteroidBelt":
    //   eventActive.type = "asteroidBelt";
    //   showEventText(safeT("event.asteroidBelt", "Asteroid Belt!"));
    //   triggerAsteroidBelt(); // This helper function might be unused
    //   break;

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
          const timing = wave * fieldsPerWave + field; // Calculate timing offset

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
      // Schedule the "UNLEASHED" message and effect after the last warning + spawn delay
      setTimeout(() => {
        if (isGameRunning) {
          showEventText(
            safeT("event.plasmaUnleashed", "🔥 PLASMA INFERNO UNLEASHED 🔥")
          );
          triggerScreenShake(plasmaConfig.shakeIntensity || 0.8);
          playSound("explosion"); // Play sound when unleashed
        }
      }, waveCount * fieldsPerWave * fieldStagger + warningDuration * (1000 / 60));
      break;

    case "crystalRain":
      eventActive.type = "crystalRain";
      showEventText(safeT("event.crystalStorm", "Cosmic Crystal Storm!"));
      const crystalRainConfig = GAME_CONFIG.events.crystalRain || {};
      const clusterCount = crystalRainConfig.clusterCount || 4; // Use config or default
      const shardsPerCluster = Math.floor(
        (crystalRainConfig.count || 20) / clusterCount
      ); // Use config or default
      const clusterDelay = crystalRainConfig.clusterDelay || 200; // Use config or default
      const shardDelay = crystalRainConfig.delay || 80; // Use config or default

      // Spawn in clusters
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        const clusterX = (canvas.width / (clusterCount + 1)) * (cluster + 1);
        const clusterY = Math.random() * canvas.height * 0.3; // Spawn higher up
        for (let i = 0; i < shardsPerCluster; i++) {
          setTimeout(() => {
            if (isGameRunning) {
              const x = clusterX + (Math.random() - 0.5) * 150;
              const y = clusterY + (Math.random() - 0.5) * 80;
              const crystal = new CrystalShard(x, y);
              // Add slight outward velocity from cluster center
              const angle = Math.atan2(y - clusterY, x - clusterX);
              crystal.velocity.x += Math.cos(angle) * 0.3;
              crystal.velocity.y += Math.sin(angle) * 0.3;
              crystalShards.push(crystal);
            }
          }, i * shardDelay + cluster * clusterDelay);
        }
      }
      // Spawn some from edges too
      for (let i = 0; i < 8; i++) {
        // Spawn a fixed number from edges
        setTimeout(() => {
          if (isGameRunning) {
            // ... (edge spawning logic remains the same) ...
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
        }, Math.random() * 3000); // Random delay for edge spawns
      }
      playSound("powerup");
      break;

    // REMOVED: Unused event case
    // case "quantumTunnels": // Logic requires QuantumPortal class
    //     eventActive.type = "quantumTunnels";
    //     showEventText(safeT("event.quantumPortal", "Quantum Portal Pair!"));
    //     const tunnelX1 = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    //     const tunnelY1 = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
    //     const tunnelX2 = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    //     const tunnelY2 = Math.random() * canvas.height * 0.8 + canvas.height * 0.1;
    //     if (typeof QuantumPortal !== 'undefined' && typeof quantumPortals !== "undefined") { // Check if class and array exist
    //         quantumPortals.push(new QuantumPortal(tunnelX1, tunnelY1));
    //         quantumPortals.push(new QuantumPortal(tunnelX2, tunnelY2));
    //         playSound("wormhole");
    //     } else {
    //         console.warn("QuantumPortal class or array not found for event.");
    //     }
    //     break;

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
          const bh = new BlackHole(x, y, true); // Temporary
          bh.radius = GAME_CONFIG.events.gravityWells.radius; // Use event specific radius
          bh.maxRadius = GAME_CONFIG.events.gravityWells.radius; // Cap radius
          bh.strength *= 0.5; // Weaker gravity
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
      const warningDurationM = 180; // Warning duration for meteors
      for (let i = 0; i < meteorCfg.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            const x = Math.random() * canvas.width;
            const y = -30; // Start off-screen top
            const impactY = Math.random() * (canvas.height - 100) + 50; // Target impact Y
            const warningSystem = spawnWithWarning("meteor", x, impactY, {
              duration: warningDurationM,
            });
            warningSystem.spawn(() => {
              if (isGameRunning) {
                const meteor = new Asteroid(
                  x,
                  y,
                  20 + Math.random() * 15, // Size
                  "#ff6b35", // Color
                  { x: (Math.random() - 0.5) * 2, y: meteorCfg.speed } // Velocity
                );
                asteroids.push(meteor);
              }
            });
          }
        }, i * meteorCfg.delay); // Stagger spawn
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
            const voidRift = new BlackHole(x, y, true); // Temporary
            voidRift.isVoidRift = true; // Flag for different behavior? (Currently unused)
            voidRift.lifetime = 300; // Shorter lifetime than normal temporary BHs
            blackHoles.push(voidRift);
            playSound("blackhole");
          }
        });
      }
      break;

    case "lightningStorm":
      eventActive.type = "lightningStorm";
      showEventText(safeT("event.lightningStorm", "⚡ THUNDER SHIELD! ⚡"));
      if (
        typeof LightningStorm !== "undefined" &&
        typeof lightningStorms !== "undefined"
      ) {
        // Check class/array
        lightningStorms.push(new LightningStorm());
        playSound("warning");
        triggerScreenShake(0.4);
      } else {
        console.warn("LightningStorm class or array not found for event.");
      }
      break;

    // REMOVED: Unused/unimplemented event cases
    // case "temporalChaos":
    // case "lightningNetwork":
    // case "voidStorm":

    case "speedZone": // Referenced in animate(), kept for now
      eventActive.type = "speedZone";
      // The speed multiplier is applied directly in animate() based on eventActive.type
      showEventText(safeT("event.difficultySpike", "Difficulty Spike!"));
      break;

    case "asteroidRain":
      eventActive.type = "asteroidRain";
      showEventText(safeT("event.asteroidRain", "Asteroid Rain!"));
      const rainConfig = GAME_CONFIG.events.asteroidRain;
      for (let i = 0; i < rainConfig.count; i++) {
        setTimeout(() => {
          if (isGameRunning) {
            asteroids.push(
              new Asteroid(
                Math.random() * width,
                -30,
                rainConfig.minRadius +
                  Math.random() * (rainConfig.maxRadius - rainConfig.minRadius),
                "#ff4444", // Specific color for this event
                {
                  x: 0,
                  y:
                    (rainConfig.speedMultiplier +
                      Math.random() * rainConfig.speedVariation) *
                    globalSpeedMultiplier,
                }
              )
            );
          }
        }, i * rainConfig.delay);
      }
      break;

    default:
      console.warn("Unknown event type selected:", randomEventType);
      break;
  }
}

// Expose functions globally
window.triggerRandomEvent = triggerRandomEvent;
window.showEventText = showEventText;
window.resetEventSystem = resetEventSystem;
window.safeT = safeT; // Expose safe translate helper
