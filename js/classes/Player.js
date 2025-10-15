// =============================================================================
// PLAYER CLASS
// =============================================================================

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.trail = [];
    this.velocity = { x: 0, y: 0 };
  }

  draw() {
    const ctx = window.ctx;

    this.trail.forEach((part) => {
      ctx.save();
      ctx.globalAlpha = part.alpha;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
      ctx.fillStyle = part.color;
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius * 0.8, this.radius * 0.8);
    ctx.lineTo(-this.radius * 0.8, this.radius * 0.8);
    ctx.closePath();
    const shadowColor = this.color;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  update() {
    const mouse = window.mouse || { x: this.x, y: this.y };
    const width = window.width || 800;
    const height = window.height || 600;

    // Apply velocity from external forces like gravity
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    // Dampen velocity over time (friction)
    this.velocity.x *= GAME_CONFIG.player.friction;
    this.velocity.y *= GAME_CONFIG.player.friction;

    // Responsive but smooth controls for precision feel
    const ease = GAME_CONFIG.player.responsiveness;
    this.x += (mouse.x - this.x) * ease;
    this.y += (mouse.y - this.y) * ease;

    // Keep player within screen bounds
    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));

    this.trail.push({
      x: this.x,
      y: this.y,
      radius: this.radius * 0.5,
      color: this.color,
      alpha: 1,
    });
    // Limit trail length for performance
    if (this.trail.length > GAME_CONFIG.player.trailLength) {
      this.trail.shift();
    }

    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= GAME_CONFIG.player.trailFadeSpeed;
      this.trail[i].radius -= 0.1;
      if (this.trail[i].alpha <= 0) this.trail.splice(i, 1);
    }
    this.draw();
  }
}

window.Player = Player;
