// =============================================================================
// BLACK HOLE CLASS
// =============================================================================

class BlackHole {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.blackHoles.baseRadius;
    this.maxRadius = GAME_CONFIG.blackHoles.baseMaxRadius;
    this.gravityRadius = GAME_CONFIG.blackHoles.baseGravityRadius;
    this.eventHorizon = this.radius * 3;
    this.strength = GAME_CONFIG.blackHoles.baseStrength;
    this.growthRate = GAME_CONFIG.blackHoles.baseGrowthRate;
    this.alpha = 0;
    this.lifetime = GAME_CONFIG.blackHoles.temporaryLifetime;
    this.rotation = 0;
    this.particles = [];
    this.warningShown = false;
  }

  draw() {
    const ctx = window.ctx;

    // Draw gravitational field
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.3;
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.gravityRadius
    );
    gradient.addColorStop(0, "#9c27b0");
    gradient.addColorStop(0.5, "rgba(156, 39, 176, 0.5)");
    gradient.addColorStop(1, "rgba(156, 39, 176, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.gravityRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw event horizon
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.eventHorizon, 0, Math.PI * 2);
    ctx.fillStyle = "#1a0d26";
    ctx.fill();
    ctx.restore();

    // Draw black hole core
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();

    // Draw swirling effect
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.strokeStyle = "#9c27b0";
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.alpha * 0.6;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 5 + i * 3, angle, angle + Math.PI / 3);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  update() {
    // Grow over time
    if (this.radius < this.maxRadius) {
      this.radius += this.growthRate;
      this.eventHorizon = this.radius * 3;
    }

    // Fade in
    if (this.alpha < 1) {
      this.alpha += 0.02;
    }

    // Rotation
    this.rotation += 0.05;

    // Apply gravitational force to player
    const player = window.game?.player;
    if (player) {
      const distance = Math.hypot(player.x - this.x, player.y - this.y);
      if (distance < this.gravityRadius) {
        const force = this.strength * (1 - distance / this.gravityRadius);
        const angle = Math.atan2(this.y - player.y, this.x - player.x);
        player.velocity.x += Math.cos(angle) * force;
        player.velocity.y += Math.sin(angle) * force;

        // Screen shake when close
        if (distance < this.gravityRadius * 0.5 && Math.random() < 0.1) {
          GameUtils.triggerScreenShake(GAME_CONFIG.blackHoles.shakeIntensity);
        }
      }
    }

    // Decay over time
    this.lifetime--;
    if (this.lifetime <= 0) {
      this.alpha -= 0.05;
    }

    this.draw();
    return this.alpha <= 0;
  }
}

window.BlackHole = BlackHole;
