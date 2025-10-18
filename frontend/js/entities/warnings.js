// Warning indicators

class Warning extends Entity {
  constructor(x, y, type, duration = 120) {
    super(x, y);
    this.type = type; // 'blackhole' or 'missile'
    this.duration = duration;
    this.timer = 0;
    this.radius = GAME_CONFIG.ui.warning.radius;
    this.alpha = 0;
  }

  draw() {
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

    // Different colors for different warning types
    let warningColor, warningSymbol;
    switch (this.type) {
      case "blackhole":
        warningColor = "#aa66cc"; // Purple for blackholes
        warningSymbol = "!";
        break;
      case "voidrift":
        warningColor = "#3d2963"; // Dark purple for void rifts
        warningSymbol = "⚠";
        break;

      case "plasma":
        warningColor = "#ff6600"; // Orange for plasma
        warningSymbol = "🔥";
        break;
      case "magnetic": // New type for Magnetic Storm
        warningColor = "#88ddff"; // Electric blue
        warningSymbol = "⚡";
        break;
      default:
        warningColor = "#f48fb1"; // Pink for missiles and others
        warningSymbol = "!";
    }

    ctx.strokeStyle = warningColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

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

    // Fade in and out
    if (this.timer < GAME_CONFIG.ui.warning.fadeInTime) {
      this.alpha = this.timer / GAME_CONFIG.ui.warning.fadeInTime;
    } else if (
      this.timer >
      this.duration - GAME_CONFIG.ui.warning.fadeOutTime
    ) {
      this.alpha =
        (this.duration - this.timer) / GAME_CONFIG.ui.warning.fadeOutTime;
    } else {
      this.alpha = 1;
    }

    this.draw();
  }
}

// New Directional Warning class for Missile/Laser Turrets/Edge Hazards
class DirectionalWarning extends Entity {
  constructor(x, y, type, angle, duration = 120) {
    super(x, y);
    this.type = type; // e.g., 'missile'
    this.angle = angle; // Radians, direction of travel
    this.duration = duration;
    this.timer = 0;
    this.size = 25; // Arrow size
    this.alpha = 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle); // Rotate to point in the direction of travel

    // Pulsing effect
    const pulse = Math.sin(this.timer * 0.3) * 0.1 + 0.9;
    const arrowColor = this.type === "missile" ? "#f48fb1" : "#ff4444";
    const finalSize = this.size * pulse;

    // Outer glow
    ctx.beginPath();
    ctx.arc(0, 0, finalSize * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha * 0.1})`;
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

    // Missile Icon at the center
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#fff";
    ctx.font = "12px Exo 2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚀", 0, 0);

    ctx.restore();
  }

  update() {
    this.timer++;

    // Fade in and out
    const fadeInTime = GAME_CONFIG.ui.warning.fadeInTime;
    const fadeOutTime = GAME_CONFIG.ui.warning.fadeOutTime;

    if (this.timer < fadeInTime) {
      this.alpha = this.timer / fadeInTime;
    } else if (this.timer > this.duration - fadeOutTime) {
      this.alpha = (this.duration - this.timer) / fadeOutTime;
    } else {
      this.alpha = 1;
    }

    this.draw();
  }
}

class CircleWarning extends Entity {
  constructor(centerX, centerY, radius) {
    super(centerX, centerY);
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.timer = 0;
    this.duration = GAME_CONFIG.events.asteroidCircle.warningTime;
    this.alpha = 0;
  }

  draw() {
    ctx.save();

    // Nhấp nháy warning
    const blinkSpeed = 0.1;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = blinkAlpha * 0.8;

    // Vẽ vòng tròn warning
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ text warning ở giữa
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️ ASTEROID CIRCLE ⚠️", this.centerX, this.centerY);

    ctx.restore();
  }
  update() {
    this.timer++;
    this.draw();
  }
}

class BeltWarning extends Entity {
  constructor(centerX, centerY, radius) {
    super(centerX, centerY);
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.timer = 0;
    this.duration = 180; // 3 seconds warning
    this.alpha = 0;
  }

  draw() {
    ctx.save();

    // Nhấp nháy warning
    const blinkSpeed = 0.08;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = blinkAlpha * 0.7;

    // Vẽ vòng tròn orbit warning
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffbb33";
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ các điểm asteroid sẽ xuất hiện
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffbb33";
      ctx.fill();
    }

    // Vẽ text warning ở giữa
    ctx.fillStyle = "#ffbb33";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️ ASTEROID BELT ⚠️", this.centerX, this.centerY);

    ctx.restore();
  }

  update() {
    this.timer++;
    this.draw();
  }
}
