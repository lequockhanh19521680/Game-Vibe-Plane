// =============================================================================
// LASER CLASS
// =============================================================================

class Laser {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side; // "left" or "right"
    this.timer = 0;
    this.maxTime = GAME_CONFIG.lasers.warningTime;
    this.active = false;
    this.length = window.width;
    this.angle = side === "left" ? 0 : Math.PI;
    this.width = 8;
    this.chargeAlpha = 0;
    this.beamAlpha = 0;
  }

  draw() {
    const ctx = window.ctx;

    if (this.timer < this.maxTime) {
      // Warning phase
      this.chargeAlpha = this.timer / this.maxTime;
      ctx.save();
      ctx.globalAlpha = this.chargeAlpha * 0.5;
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(this.angle) * this.length, this.y);
      ctx.stroke();
      ctx.restore();
    } else {
      // Active beam phase
      this.active = true;
      this.beamAlpha = 1;
      ctx.save();
      ctx.globalAlpha = this.beamAlpha;
      ctx.strokeStyle = "#ff0044";
      ctx.lineWidth = this.width;
      ctx.shadowColor = "#ff0044";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(this.angle) * this.length, this.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    this.timer++;
    this.draw();
    return this.timer >= this.maxTime + GAME_CONFIG.lasers.beamDuration;
  }
}

window.Laser = Laser;
