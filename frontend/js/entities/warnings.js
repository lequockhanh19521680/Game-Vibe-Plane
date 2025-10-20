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
      case "lasermine":
        warningColor = "#ff4444"; // Red for mines
        warningSymbol = "!";
        break;
      case "crystalcluster":
        warningColor = "#40c4ff"; // Crystal color
        warningSymbol = "!";
        break;
      case "freeze": // Added freeze zone warning
        warningColor = "#81d4fa";
        warningSymbol = "❄️";
        break;
      case "meteor": // Added meteor warning
        warningColor = "#ff6b35";
        warningSymbol = "☄️";
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

    // Fade in and out logic
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

    // Self-destruct logic (FIXED: The filtering happens in game.js, but ensure timer update)
    // The core game loop filters warnings based on (w.timer < w.duration).
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

/**
 * CircleWarning for events like Asteroid Circle/Belt/Gravity Wells.
 * FIXED: Inherits from Warning for consistency and uses a proper update cycle.
 */
class CircleWarning extends Warning {
  constructor(centerX, centerY, radius) {
    super(
      centerX,
      centerY,
      "asteroidCircle",
      GAME_CONFIG.events.asteroidCircle.warningTime
    );
    this.radius = radius;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  draw() {
    ctx.save();

    // Nhấp nháy warning
    const blinkSpeed = 0.08;
    // Sử dụng alpha của lớp cha để fade in/out tổng thể, nhân với nhấp nháy
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = this.alpha * blinkAlpha * 0.8;

    // Vẽ vòng tròn warning
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Vẽ text warning ở giữa
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️ ZONE DANGER ⚠️", this.centerX, this.centerY);

    ctx.restore();
  }

  // FIX: Use the parent update logic to handle timer and alpha fade.
  // We override draw, but keep the parent update.
  // Since parent update is simple timer/alpha logic, we can call it directly:
  update() {
    super.update(); // Cập nhật timer và alpha
    this.draw();
  }
}

/**
 * BeltWarning is essentially the same as CircleWarning, just kept separate for clarity.
 * FIXED: Inherits from Warning for consistency.
 */
class BeltWarning extends Warning {
  constructor(centerX, centerY, radius) {
    // Sử dụng giá trị duration cố định 180 frames (3 giây)
    super(centerX, centerY, "asteroidBelt", 180);
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
  }

  draw() {
    ctx.save();

    // Nhấp nháy warning
    const blinkSpeed = 0.08;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = this.alpha * blinkAlpha * 0.7;

    // Vẽ vòng tròn orbit warning
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffbb33";
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.shadowColor = "#ffbb33";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ các điểm asteroid sẽ xuất hiện
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.timer * 0.02; // Thêm chuyển động nhẹ
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffbb33";
      ctx.shadowBlur = 0;
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
    super.update(); // Cập nhật timer và alpha
    this.draw();
  }
}
