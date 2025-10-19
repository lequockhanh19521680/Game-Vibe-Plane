/**
 * Triggers a screen shake effect on the canvas.
 * @param {number} intensity - The intensity of the shake (not currently used, but could be implemented).
 */
function triggerScreenShake(intensity) {
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
    const warningIndex = warnings.indexOf(circleWarning);
    if (warningIndex > -1) {
      warnings.splice(warningIndex, 1);
    }
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
  }, config.warningTime * (1000 / 60));
}

/**
 * Triggers the Asteroid Belt event.
 */
function triggerAsteroidBelt() {
  const config = GAME_CONFIG.events.asteroidBelt;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const beltWarning = new BeltWarning(centerX, centerY, config.beltRadius);
  warnings.push(beltWarning);

  setTimeout(() => {
    const warningIndex = warnings.indexOf(beltWarning);
    if (warningIndex > -1) {
      warnings.splice(warningIndex, 1);
    }
    if (!isGameRunning) return;

    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * config.beltRadius;
      const y = centerY + Math.sin(angle) * config.beltRadius;
      asteroids.push(
        new Asteroid(x, y, 15 + Math.random() * 10, "#ffbb33", {
          x: -Math.sin(angle) * config.asteroidSpeed,
          y: Math.cos(angle) * config.asteroidSpeed,
        })
      );
    }
  }, 180 * (1000 / 60)); // Hardcoded 3-second warning
}

/**
 * Creates a smaller asteroid for the "Asteroid Shower" event.
 * @param {string} direction - The direction from which the asteroid should spawn ('top', 'left', 'right', 'bottom').
 * @returns {Asteroid} A new Asteroid instance.
 */
function createMiniShowerAsteroid(direction) {
  const config = GAME_CONFIG.entities.asteroids;
  const radius =
    config.minRadius +
    Math.random() * (config.maxRadius - config.minRadius) * 0.5;
  const speed =
    (config.baseSpeed + Math.random() * config.speedVariation) * 1.5;

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
    default:
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
    this.warningDuration = options.duration || 120;

    if (options.angle !== undefined || type === "missile") {
      this.warning = new DirectionalWarning(
        x,
        y,
        type,
        options.angle !== undefined ? options.angle : 0,
        this.warningDuration
      );
    } else {
      this.warning = new Warning(x, y, type, this.warningDuration);
    }
  }

  spawn(spawnCallback) {
    warnings.push(this.warning);
    if (typeof playSound === "function") {
      playSound("warning");
    }

    setTimeout(() => {
      // Only spawn if the game is still running
      if (isGameRunning) {
        spawnCallback();
        const index = warnings.indexOf(this.warning);
        if (index > -1) {
          warnings.splice(index, 1);
        }
      }
    }, this.warningDuration * (1000 / 60));
  }
}

/**
 * Helper function to create a WarningSystem instance.
 * @param {string} type - The type of entity to spawn.
 * @param {number} x - The x-coordinate for the warning.
 * @param {number} y - The y-coordinate for the warning.
 * @param {object} options - Additional options for the warning.
 * @returns {WarningSystem} A new WarningSystem instance.
 */
function spawnWithWarning(type, x, y, options = {}) {
  if (type === "magnetic") {
    options.duration = options.duration || 180;
  } else if (type === "missile") {
    options.duration =
      options.duration || GAME_CONFIG.entities.missiles.warningDuration;
  }
  return new WarningSystem(type, x, y, options);
}

/**
 * Formats time in seconds to a MM:SS string.
 * This is now the centralized function for time formatting.
 * @param {number} seconds - The total seconds.
 * @returns {string} The formatted time string.
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
