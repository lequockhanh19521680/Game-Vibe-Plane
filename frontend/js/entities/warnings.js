// Warning indicators

class Warning extends Entity {
  constructor(x, y, type, duration = 120, angle = 0, effectRadius = null) {
    super(x, y);
    this.type = type; // 'blackhole', 'missile', 'asteroid', 'laser', 'plasma', etc.
    this.duration = duration;
    this.timer = 0;
    this.radius = GAME_CONFIG.ui.warning.radius;
    this.alpha = 0;
    this.angle = angle; // Direction angle for directional warnings
    this.effectRadius = effectRadius; // Vùng ảnh hưởng thực tế của object

    // Mobile adjustments
    if (GAME_CONFIG.ui.mobile.detected) {
      this.radius *= GAME_CONFIG.ui.warning.universal.mobile.radiusMultiplier;
      this.duration *=
        GAME_CONFIG.ui.warning.universal.mobile.durationMultiplier;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    // Mobile pulse speed adjustment
    let pulseSpeed = GAME_CONFIG.ui.warning.pulseSpeed;
    if (GAME_CONFIG.ui.mobile.detected) {
      pulseSpeed *=
        GAME_CONFIG.ui.warning.universal.mobile.pulseSpeedMultiplier;
    }

    // Pulsing warning circle
    const pulse = Math.sin(this.timer * pulseSpeed) * 0.5 + 0.5;
    const currentRadius =
      this.radius + pulse * GAME_CONFIG.ui.warning.pulseIntensity;

    // Draw effect radius if provided (vùng ảnh hưởng thực tế)
    if (this.effectRadius && GAME_CONFIG.ui.warning.universal.showRadius) {
      ctx.beginPath();
      ctx.arc(0, 0, this.effectRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);

    // Expanded warning types for all game objects
    let warningColor, warningSymbol;
    switch (this.type) {
      case "asteroid":
        warningColor = "#ffbb33"; // Orange for asteroids
        warningSymbol = "☄️";
        break;
      case "blackhole":
        warningColor = "#aa66cc"; // Purple for blackholes
        warningSymbol = "🕳️";
        break;
      case "voidrift":
        warningColor = "#3d2963"; // Dark purple for void rifts
        warningSymbol = "⚠";
        break;
      case "supernova":
        warningColor = "#ff3333"; // Red for supernova
        warningSymbol = "💥";
        break;
      case "plasma":
        warningColor = "#ff6600"; // Orange for plasma
        warningSymbol = "🔥";
        break;
      case "laser":
        warningColor = "#00ffff"; // Cyan for lasers
        warningSymbol = "⚡";
        break;
      case "mine":
        warningColor = "#ff4444"; // Red for mines
        warningSymbol = "💣";
        break;
      case "freeze":
        warningColor = "#81d4fa"; // Light blue for freeze
        warningSymbol = "❄️";
        break;
      case "magnetic":
        warningColor = "#e91e63"; // Pink for magnetic
        warningSymbol = "🧲";
        break;
      case "lightning":
        warningColor = "#ffeb3b"; // Yellow for lightning
        warningSymbol = "⚡";
        break;
      case "gravity":
        warningColor = "#7c4dff"; // Purple for gravity
        warningSymbol = "🌀";
        break;
      case "time":
        warningColor = "#00e5ff"; // Cyan for time
        warningSymbol = "⏰";
        break;
      case "missile":
        warningColor = "#f48fb1"; // Pink for missiles
        warningSymbol = ""; // No symbol for missile, we'll draw an arrow
        break;
      default:
        warningColor = "#f48fb1"; // Pink for other warnings
        warningSymbol = "⚠️";
    }

    ctx.strokeStyle = warningColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // For missiles, draw directional arrow - Enhanced for better visibility
    if (this.type === "missile") {
      ctx.save();
      ctx.rotate(this.angle);

      // Draw larger arrow with glow effect
      ctx.shadowColor = warningColor;
      ctx.shadowBlur = 10;

      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(0, -20); // Arrow point (made larger)
      ctx.lineTo(15, 10); // Bottom right (made larger)
      ctx.lineTo(-15, 10); // Bottom left (made larger)
      ctx.closePath();

      ctx.fillStyle = warningColor;
      ctx.fill();

      // Add enhanced trail effect for arrow
      ctx.beginPath();
      ctx.moveTo(0, 12); // Start at base of arrow
      ctx.lineTo(8, 25); // Right zigzag (extended)
      ctx.lineTo(-8, 18); // Left zigzag (extended)
      ctx.lineTo(0, 30); // End of trail (extended)

      ctx.strokeStyle = warningColor;
      ctx.lineWidth = 3; // Thicker line
      ctx.stroke();

      ctx.restore();
    } else {
      // Warning symbol for non-missile warnings
      ctx.fillStyle = warningColor;
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(warningSymbol, 0, 0);
    }

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

    // Add pulsing intensity for missile warnings
    if (this.type === "missile") {
      // Make the warning pulse more intensely as time gets closer to missile launch
      const timeRatio = this.timer / this.duration;
      const pulsingIntensity = 0.7 + 0.3 * timeRatio; // Intensify pulsing as time passes
      this.alpha *= Math.sin(this.timer * 0.15) * 0.2 + pulsingIntensity;
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
