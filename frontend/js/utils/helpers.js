/**
 * Triggers a screen shake effect on the canvas.
 * @param {number} intensity - The intensity of the shake (not currently used).
 */
function triggerScreenShake(intensity) {
  if (!canvas) return; // Add null check for canvas
  canvas.classList.add("shake");
  setTimeout(
    () => canvas.classList.remove("shake"),
    GAME_CONFIG.visual.screenShake.duration * 1000
  );
}

/**
 * Triggers the Asteroid Circle event.
 */
function triggerAsteroidCircle() {
  if (!canvas) return; // Add null check for canvas
  const config = GAME_CONFIG.events.asteroidCircle;
  const centerX =
    config.centerVariation +
    Math.random() * (canvas.width - 2 * config.centerVariation);
  const centerY =
    config.centerVariation +
    Math.random() * (canvas.height - 2 * config.centerVariation);

  const circleWarning = new CircleWarning(centerX, centerY, config.radius);
  warnings.push(circleWarning);

  setTimeout(() => {
    // Check if the game is still running before spawning
    if (!isGameRunning) return;

    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * config.radius;
      const y = centerY + Math.sin(angle) * config.radius;
      const dx = Math.cos(angle) * config.speed;
      const dy = Math.sin(angle) * config.speed;
      asteroids.push(
        new Asteroid(x, y, config.asteroidRadius, "#ffbb33", { x: dx, y: dy })
      );
    }
  }, config.warningTime * (1000 / 60)); // Convert frames to ms
}

// REMOVED: Unused triggerAsteroidBelt function
// function triggerAsteroidBelt() { ... }

/**
 * Creates a smaller asteroid for the "Asteroid Shower" event.
 * @param {string} direction - The direction ('top', 'left', 'right', 'bottom').
 * @returns {Asteroid} A new Asteroid instance.
 */
function createMiniShowerAsteroid(direction) {
  if (!canvas) return null; // Add null check for canvas
  const config = GAME_CONFIG.entities.asteroids;
  const radius =
    config.minRadius +
    Math.random() * (config.maxRadius - config.minRadius) * 0.5; // Smaller radius
  const speed =
    (config.baseSpeed + Math.random() * config.speedVariation) * 1.5; // Faster speed

  let x, y, velocity;

  switch (direction) {
    case "top":
      x = Math.random() * width;
      y = -radius;
      velocity = { x: (Math.random() - 0.5) * 2, y: speed };
      break;
    case "left":
      x = -radius;
      y = Math.random() * height;
      velocity = { x: speed, y: (Math.random() - 0.5) * 2 };
      break;
    case "right":
      x = width + radius;
      y = Math.random() * height;
      velocity = { x: -speed, y: (Math.random() - 0.5) * 2 };
      break;
    case "bottom":
      x = Math.random() * width;
      y = height + radius;
      velocity = { x: (Math.random() - 0.5) * 2, y: -speed };
      break;
    default: // Default to top if direction is invalid
      x = Math.random() * width;
      y = -radius;
      velocity = { x: (Math.random() - 0.5) * 2, y: speed };
      break;
  }

  return new Asteroid(
    x,
    y,
    radius,
    config.colors[~~(Math.random() * config.colors.length)],
    velocity
  );
}

/**
 * A system to show a warning before spawning an entity.
 */
class WarningSystem {
  constructor(type, x, y, options = {}) {
    this.type = type;
    this.x = x;
    this.y = y;
    // Default duration uses specific entity config or a fallback
    this.warningDuration =
      options.duration ||
      (GAME_CONFIG.entities[type] &&
        GAME_CONFIG.entities[type].warningDuration) ||
      120; // Default 120 frames

    // Choose appropriate warning class based on type
    if (type === "missile") {
      this.warning = new DirectionalWarning(
        x,
        y,
        type,
        options.angle !== undefined ? options.angle : 0,
        this.warningDuration
      );
    } else if (type === "asteroidCircle") {
      this.warning = new CircleWarning(x, y, options.radius); // CircleWarning handles its own duration
    } else if (type === "asteroidBelt") {
      this.warning = new BeltWarning(x, y, options.radius); // BeltWarning handles its own duration
    } else {
      // Generic warning for other types
      this.warning = new Warning(x, y, type, this.warningDuration);
    }
  }

  spawn(spawnCallback) {
    if (!this.warning) return; // Ensure warning object exists

    warnings.push(this.warning);
    if (typeof playSound === "function") {
      playSound("warning");
    }

    setTimeout(() => {
      // Only spawn if the game is still running
      if (isGameRunning) {
        spawnCallback();
        // Warning removal is handled by the main game loop filter
      }
    }, this.warning.duration * (1000 / 60)); // Use the actual duration of the warning object
  }
}

/**
 * Helper function to create a WarningSystem instance.
 * @param {string} type - The type of entity.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {object} options - Additional options.
 * @returns {WarningSystem} A new WarningSystem instance.
 */
function spawnWithWarning(type, x, y, options = {}) {
  // Pass duration through options if defined, otherwise WarningSystem uses defaults
  // Specific duration overrides can be handled within WarningSystem constructor logic
  return new WarningSystem(type, x, y, options);
}

/**
 * Formats time in seconds to a MM:SS string.
 * @param {number} seconds - The total seconds.
 * @returns {string} The formatted time string.
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
