// =============================================================================
// STAR CLASS
// =============================================================================

class Star {
  constructor(x, y, radius, layer) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.layer = layer;
    this.velocity = 0.2 + layer * 0.5;
    this.alpha = 0.5 + layer * 0.5;
  }

  draw() {
    const ctx = window.ctx;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
  }

  update() {
    const globalSpeedMultiplier = window.game
      ? window.game.globalSpeedMultiplier
      : 1;
    this.y += this.velocity * globalSpeedMultiplier;
    if (this.y - this.radius > window.height) {
      this.y = 0 - this.radius;
      this.x = Math.random() * window.width;
    }
    this.draw();
  }
}

window.Star = Star;
