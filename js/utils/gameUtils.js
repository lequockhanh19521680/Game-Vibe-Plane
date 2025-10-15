// =============================================================================
// GAME UTILITIES
// =============================================================================

class GameUtils {
  // Screen shake system
  static triggerScreenShake(intensity = 0.1) {
    const canvas = document.getElementById("game-canvas");
    const shakeClass = "shake";

    canvas.style.transform = `translate(${
      (Math.random() - 0.5) * intensity * 20
    }px, ${(Math.random() - 0.5) * intensity * 20}px)`;

    canvas.classList.add(shakeClass);

    setTimeout(() => {
      canvas.classList.remove(shakeClass);
      canvas.style.transform = "translate(0, 0)";
    }, GAME_CONFIG.visual.screenShake.duration * 1000);
  }

  // Collision detection
  static checkCollision(obj1, obj2) {
    const distance = Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
    return distance < obj1.radius + obj2.radius;
  }

  // Laser collision detection (line-circle intersection)
  static checkLaserCollision(player, laser) {
    if (!laser.active) return false;

    const lineStart = { x: laser.x, y: laser.y };
    const lineEnd = {
      x: laser.x + Math.cos(laser.angle) * laser.length,
      y: laser.y + Math.sin(laser.angle) * laser.length,
    };

    return (
      GameUtils.distanceToLineSegment(player, lineStart, lineEnd) <
      player.radius
    );
  }

  // Distance from point to line segment
  static distanceToLineSegment(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Distance calculation
  static getDistance(obj1, obj2) {
    return Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
  }

  // Angle calculation
  static getAngle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  // Random utilities
  static randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Nebula creation
  static createNebula() {
    const width = window.width;
    const height = window.height;
    const ctx = window.ctx;

    const x = Math.random() * width;
    const y = Math.random() * height;
    const r =
      GAME_CONFIG.visual.nebula.minRadius +
      Math.random() *
        (GAME_CONFIG.visual.nebula.maxRadius -
          GAME_CONFIG.visual.nebula.minRadius);

    const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
    const color = GameUtils.randomChoice([
      `rgba(0, 255, 255, ${GAME_CONFIG.visual.nebula.opacity})`,
      `rgba(170, 102, 204, ${GAME_CONFIG.visual.nebula.opacity})`,
      `rgba(51, 181, 229, ${GAME_CONFIG.visual.nebula.opacity})`,
    ]);

    grad.addColorStop(
      0,
      color.replace(
        `${GAME_CONFIG.visual.nebula.opacity})`,
        `${GAME_CONFIG.visual.nebula.opacity * 2})`
      )
    );
    grad.addColorStop(1, color);
    return grad;
  }

  // Formatting utilities
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  static formatScore(score) {
    return Math.floor(score).toLocaleString();
  }

  // Local storage utilities
  static saveHighScore(score) {
    const currentHigh = GameUtils.getHighScore();
    if (score > currentHigh) {
      localStorage.setItem(
        GAME_CONFIG.advanced.localStorageKey,
        score.toString()
      );
      return true; // New high score
    }
    return false;
  }

  static getHighScore() {
    return (
      parseInt(localStorage.getItem(GAME_CONFIG.advanced.localStorageKey)) || 0
    );
  }
}

window.GameUtils = GameUtils;
