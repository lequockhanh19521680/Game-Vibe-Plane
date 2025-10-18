function triggerScreenShake(intensity) {
  canvas.classList.add("shake");
  setTimeout(
    () => canvas.classList.remove("shake"),
    GAME_CONFIG.visual.screenShake.duration * 1000
  );
}

function triggerAsteroidCircle() {
  const config = GAME_CONFIG.events.asteroidCircle;

  // Tạo vị trí ngẫu nhiên cho trung tâm vòng tròn
  const centerX =
    config.centerVariation +
    Math.random() * (canvas.width - 2 * config.centerVariation);
  const centerY =
    config.centerVariation +
    Math.random() * (canvas.height - 2 * config.centerVariation);

  // Tạo warning nhấp nháy trước
  const circleWarning = new CircleWarning(centerX, centerY, config.radius);
  warnings.push(circleWarning);

  // Sau thời gian warning, spawn asteroids thành vòng tròn
  setTimeout(() => {
    // Remove warning
    const warningIndex = warnings.indexOf(circleWarning);
    if (warningIndex > -1) {
      warnings.splice(warningIndex, 1);
    }

    // Spawn asteroids trong formation vòng tròn
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * config.radius;
      const y = centerY + Math.sin(angle) * config.radius;

      // Di chuyển ra ngoài từ trung tâm
      const dx = Math.cos(angle) * config.speed;
      const dy = Math.sin(angle) * config.speed;

      const asteroid = new Asteroid(x, y, config.asteroidRadius, "#ffbb33", {
        x: dx,
        y: dy,
      });
      asteroids.push(asteroid);
    }
  }, config.warningTime * (1000 / 60)); // Convert frames to milliseconds
}

function triggerAsteroidBelt() {
  const config = GAME_CONFIG.events.asteroidBelt;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Tạo warning nhấp nháy trước
  const beltWarning = new BeltWarning(centerX, centerY, config.beltRadius);
  warnings.push(beltWarning);

  // Sau thời gian warning, spawn asteroid belt
  setTimeout(() => {
    // Remove warning
    const warningIndex = warnings.indexOf(beltWarning);
    if (warningIndex > -1) {
      warnings.splice(warningIndex, 1);
    }

    // Spawn asteroid belt
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
  }, 180 * (1000 / 60)); // 3 seconds warning
}

function createMiniShowerAsteroid(direction) {
  const config = GAME_CONFIG.asteroids;
  const radius =
    config.minRadius +
    Math.random() * (config.maxRadius - config.minRadius) * 0.5; // Smaller asteroids for showers
  const speed =
    (config.baseSpeed + Math.random() * config.speedVariation) * 1.5; // Slightly faster

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
    default: // Default to top
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
 * Class for handling time-delayed spawning with a prior visual warning.
 * This replaces the complex inline warning logic in eventSystem.js.
 */
class WarningSystem {
  // Added options parameter to constructor
  constructor(type, x, y, options = {}) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.warningDuration = options.duration || 120; // 2 seconds by default

    // NEW LOGIC: Use DirectionalWarning if angle is provided or type is missile
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

  /**
   * Spawns the final entity after the warning period ends.
   * @param {function} spawnCallback The function to execute to spawn the entity.
   */
  spawn(spawnCallback) {
    // 1. Add the visual warning immediately
    warnings.push(this.warning);
    if (typeof playSound === "function") {
      playSound("warning");
    }

    // 2. Schedule the actual entity spawn
    setTimeout(() => {
      if (isGameRunning) {
        // Execute the spawn logic
        spawnCallback();

        // Optional: Remove the warning if it hasn't faded out yet (it handles its own fading)
        const index = warnings.indexOf(this.warning);
        if (index > -1) {
          warnings.splice(index, 1);
        }
      }
    }, this.warningDuration * (1000 / 60)); // Convert frames to milliseconds
  }
}

/**
 * Factory function to create a WarningSystem instance.
 * This is the missing function causing the ReferenceError.
 * @param {string} type The type of warning ('freeze', 'plasma', 'supernova', etc.).
 * @param {number} x X coordinate of the warning.
 * @param {number} y Y coordinate of the warning.
 * @param {object} options Additional options (e.g., duration, angle).
 * @returns {WarningSystem} A new WarningSystem instance.
 */
function spawnWithWarning(type, x, y, options = {}) {
  // Use a longer warning duration for magnetic storm (3 seconds as requested)
  if (type === "magnetic") {
    options.duration = options.duration || 180; // 3 seconds = 180 frames
  } else if (type === "missile") {
    options.duration = options.duration || GAME_CONFIG.missiles.warningDuration;
  }
  return new WarningSystem(type, x, y, options);
}
