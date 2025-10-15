// =============================================================================
// WARNING CLASS
// =============================================================================

class Warning {
  constructor(x, y, type, duration = 120) {
    this.x = x;
    this.y = y;
    this.type = type; // 'blackhole' or 'missile'
    this.duration = duration;
    this.timer = 0;
    this.radius = GAME_CONFIG.ui.warning.radius;
    this.alpha = 0;
  }

  draw() {
    const ctx = window.ctx;
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
    ctx.strokeStyle = this.type === "blackhole" ? "#aa66cc" : "#f48fb1";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Warning symbol
    ctx.fillStyle = this.type === "blackhole" ? "#aa66cc" : "#f48fb1";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 0, 0);

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

window.Warning = Warning;
