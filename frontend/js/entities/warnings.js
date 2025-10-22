// Warning indicators

class Warning extends Entity {
  constructor(x, y, type, duration = 120) {
    super(x, y);
    this.type = type;
    this.duration = duration;
    this.timer = 0;
    this.radius = GAME_CONFIG.ui.warning.radius;
    this.alpha = 0;
  }

  draw() {
    if (!ctx) return; // Context check
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    // Pulsing warning circle
    const pulse =
      Math.sin(this.timer * GAME_CONFIG.ui.warning.pulseSpeed) * 0.5 + 0.5;
    const currentRadius =
      this.radius + pulse * GAME_CONFIG.ui.warning.pulseIntensity;

    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);

    // Color and symbol based on type
    let warningColor, warningSymbol;
    switch (this.type) {
      case "blackhole":
        warningColor = "#aa66cc";
        warningSymbol = "!";
        break;
      case "voidrift":
        warningColor = "#3d2963";
        warningSymbol = "⚠";
        break;
      case "plasma":
        warningColor = "#ff6600";
        warningSymbol = "🔥";
        break;
      case "magnetic":
        warningColor = "#88ddff";
        warningSymbol = "⚡";
        break;
      case "lasermine":
        warningColor = "#ff4444";
        warningSymbol = "!";
        break;
      case "crystalcluster":
        warningColor = "#40c4ff";
        warningSymbol = "!";
        break;
      case "freeze":
        warningColor = "#81d4fa";
        warningSymbol = "❄️";
        break;
      case "meteor":
        warningColor = "#ff6b35";
        warningSymbol = "☄️";
        break;
      default: // Includes 'missile' implicitly now
        warningColor = "#f48fb1";
        warningSymbol = "!";
    }

    ctx.strokeStyle = warningColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Warning symbol
    ctx.fillStyle = warningColor;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(warningSymbol, 0, 0);

    ctx.restore();
  }

  update() {
    this.timer++;

    // Fade in/out logic
    const fadeInTime = GAME_CONFIG.ui.warning.fadeInTime;
    const fadeOutTime = GAME_CONFIG.ui.warning.fadeOutTime;

    if (this.timer < fadeInTime) {
      this.alpha = this.timer / fadeInTime;
    } else if (this.timer > this.duration - fadeOutTime) {
      this.alpha = (this.duration - this.timer) / fadeOutTime;
    } else {
      this.alpha = 1;
    }

    this.alpha = Math.max(0, Math.min(1, this.alpha)); // Clamp alpha

    this.draw();
    // No self-destruction logic needed here, handled by game loop filter
  }
}

// Directional Warning (for Missiles, etc.)
class DirectionalWarning extends Entity {
  constructor(x, y, type, angle, duration = 120) {
    super(x, y);
    this.type = type;
    this.angle = angle; // Radians
    this.duration = duration;
    this.timer = 0;
    this.size = 25; // Base size
    this.alpha = 0;
  }

  draw() {
    if (!ctx) return; // Context check
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle); // Point in direction of travel

    const pulse = Math.sin(this.timer * 0.3) * 0.1 + 0.9; // Subtle pulse
    const arrowColor = this.type === "missile" ? "#f48fb1" : "#ff4444"; // Default red for non-missiles
    const finalSize = this.size * pulse;

    // Outer glow
    ctx.beginPath();
    ctx.arc(0, 0, finalSize * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha * 0.1})`; // Faint red glow
    ctx.fill();

    // Arrow Head
    ctx.beginPath();
    ctx.moveTo(finalSize, 0);
    ctx.lineTo(-finalSize * 0.5, finalSize * 0.5);
    ctx.lineTo(-finalSize * 0.5, -finalSize * 0.5);
    ctx.closePath();
    ctx.fillStyle = arrowColor;
    ctx.shadowColor = arrowColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Missile Icon at the center (optional, could be conditional)
    if (this.type === "missile") {
      ctx.globalAlpha = this.alpha; // Reset alpha for text
      ctx.fillStyle = "#fff";
      ctx.font = "12px 'Exo 2', sans-serif"; // Use game font
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚀", 0, 0);
    }

    ctx.restore();
  }

  update() {
    this.timer++;

    // Fade in/out logic (same as generic Warning)
    const fadeInTime = GAME_CONFIG.ui.warning.fadeInTime;
    const fadeOutTime = GAME_CONFIG.ui.warning.fadeOutTime;

    if (this.timer < fadeInTime) {
      this.alpha = this.timer / fadeInTime;
    } else if (this.timer > this.duration - fadeOutTime) {
      this.alpha = (this.duration - this.timer) / fadeOutTime;
    } else {
      this.alpha = 1;
    }
    this.alpha = Math.max(0, Math.min(1, this.alpha)); // Clamp alpha

    this.draw();
  }
}

/**
 * CircleWarning for events like Asteroid Circle. Inherits from Warning.
 */
class CircleWarning extends Warning {
  constructor(centerX, centerY, radius) {
    // Uses its own duration from config, passed to parent
    super(
      centerX,
      centerY,
      "asteroidCircle",
      GAME_CONFIG.events.asteroidCircle.warningTime
    );
    this.radius = radius;
    // Store centerX/Y separately as parent x/y might be less clear
    this.centerX = centerX;
    this.centerY = centerY;
  }

  draw() {
    if (!ctx) return; // Context check
    ctx.save();

    // Blinking effect combined with parent's alpha fade
    const blinkSpeed = 0.08;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = this.alpha * blinkAlpha * 0.8; // Use parent's alpha

    // Draw warning circle
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffff00"; // Yellow
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
    ctx.shadowBlur = 0; // Reset shadow

    // Draw warning text in center (adjust alpha for text visibility)
    ctx.globalAlpha = this.alpha * 0.9; // Slightly less fade than circle
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Using simple text, emoji might not render consistently everywhere
    ctx.fillText("DANGER ZONE", this.centerX, this.centerY);

    ctx.restore();
  }

  // Uses the parent update() method for timer and alpha logic
}

/**
 * BeltWarning, similar to CircleWarning. Inherits from Warning.
 */
class BeltWarning extends Warning {
  constructor(centerX, centerY, radius) {
    // Define a fixed duration or get from config if available
    const duration = GAME_CONFIG.events.asteroidBelt?.warningTime || 180;
    super(centerX, centerY, "asteroidBelt", duration);
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
  }

  draw() {
    if (!ctx) return; // Context check
    ctx.save();

    // Blinking effect combined with parent alpha
    const blinkSpeed = 0.08;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = this.alpha * blinkAlpha * 0.7; // Use parent alpha

    // Draw orbit warning circle
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffbb33"; // Orange/Yellow
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.shadowColor = "#ffbb33";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw indicators for asteroid positions
    const count = 20;
    ctx.globalAlpha = this.alpha * 0.8; // Use parent alpha for indicators
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.timer * 0.02; // Slight rotation
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffbb33";
      ctx.shadowBlur = 0; // No shadow for small indicators
      ctx.fill();
    }

    // Draw warning text in center
    ctx.globalAlpha = this.alpha * 0.9; // Use parent alpha
    ctx.fillStyle = "#ffbb33";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ASTEROID BELT", this.centerX, this.centerY);

    ctx.restore();
  }
  // Uses the parent update() method for timer and alpha logic
}
