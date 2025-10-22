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
  console.log("--- triggerRandomEvent FUNCTION CALLED ---"); // ADDED LOG
  // REMOVED: Redundant check - the call from game.js should already ensure the game is running.
  // if (!window.isGameRunning) {
  //   console.log("-> Exiting triggerRandomEvent: Game not running.");
  //   return;
  // }

  const baseEventWeights = [
    { type: "asteroidShower", weight: 35 },
    { type: "instantMissiles", weight: 25 },
  ];

  const unlockThresholds = GAME_CONFIG.events.unlockThresholds || {};

  // Log current score for threshold checking
  console.log(`-> Current score for event check: ${score}`);

  const availableEvents = baseEventWeights.filter((event) => {
    const threshold = unlockThresholds[event.type] || 0;
    const isAvailable = score >= threshold;
    // console.log(`   - Event: ${event.type}, Threshold: ${threshold}, Score: ${score}, Available: ${isAvailable}`); // Detailed log per event
    return isAvailable;
  });

  if (availableEvents.length === 0) {
    console.log(
      "-> No events available for current score. Checking default..."
    );
    const defaultEvent =
      baseEventWeights.find((e) => e.type === "asteroidShower") ||
      baseEventWeights[0];
    if (defaultEvent && score >= (unlockThresholds[defaultEvent.type] || 0)) {
      console.log(`-> Using default event: ${defaultEvent.type}`);
      availableEvents.push(defaultEvent);
    } else {
      console.log("-> No events available, including default. Exiting.");
      return; // No events available at all
    }
  }

  console.log(
    `-> Available events (${availableEvents.length}):`,
    availableEvents.map((e) => e.type)
  );

  const totalWeight = availableEvents.reduce(
    (sum, event) => sum + event.weight,
    0
  );
  console.log(`-> Total weight: ${totalWeight}`);

  let random = Math.random() * totalWeight;
  let selectedEvent = availableEvents[0].type; // Default to first available

  console.log(`-> Random value (0 - ${totalWeight}): ${random}`);

  for (const event of availableEvents) {
    console.log(
      `   - Checking ${event.type} (weight ${event.weight})... Current random: ${random}`
    );
    random -= event.weight;
    if (random <= 0) {
      selectedEvent = event.type;
      console.log(`   --> Selected: ${selectedEvent}`);
      break;
    }
  }

  const randomEventType = selectedEvent;
  console.log(`-> FINAL SELECTED EVENT: ${randomEventType}`);

  // Set a general end time for the event's *active* state influence, if applicable
  eventActive.endTime =
    timers.difficulty + Math.floor(GAME_CONFIG.events.duration * 0.75); // Slightly shorter active duration

  // Trigger the selected event logic
  switch (randomEventType) {
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
