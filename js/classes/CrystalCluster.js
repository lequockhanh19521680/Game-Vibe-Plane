// =============================================================================
// CRYSTAL CLUSTER CLASS
// =============================================================================

class CrystalCluster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.alpha = 0;
    this.rotation = 0;
    this.crystals = [];
    this.pulsePhase = 0;
    this.lifetime = 300;
    this.growthPhase = 0;

    // Create individual crystals
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const distance = 15 + Math.random() * 10;
      this.crystals.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 5 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  draw() {
    const ctx = window.ctx;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw energy field
    const pulseSize = 1 + Math.sin(this.pulsePhase) * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(64, 196, 255, 0.2)";
    ctx.fill();

    // Draw individual crystals
    this.crystals.forEach((crystal, index) => {
      ctx.save();
      ctx.translate(crystal.x, crystal.y);
      ctx.rotate(crystal.rotation);

      const crystalPulse =
        1 + Math.sin(this.pulsePhase + crystal.pulseOffset) * 0.2;
      const size = crystal.size * crystalPulse;

      // Crystal body (diamond shape)
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.6, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.6, 0);
      ctx.closePath();

      ctx.fillStyle = "#40c4ff";
      ctx.shadowColor = "#40c4ff";
      ctx.shadowBlur = 10;
      ctx.fill();

      // Crystal highlights
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.8);
      ctx.lineTo(size * 0.3, -size * 0.2);
      ctx.lineTo(0, size * 0.2);
      ctx.closePath();
      ctx.fillStyle = "#81d4fa";
      ctx.fill();

      ctx.restore();
    });

    ctx.restore();
  }

  update() {
    // Fade in
    if (this.alpha < 1 && this.growthPhase < 60) {
      this.alpha += 0.02;
      this.growthPhase++;
    }

    // Slow rotation
    this.rotation += 0.02;
    this.pulsePhase += 0.15;

    // Update crystal rotations
    this.crystals.forEach((crystal) => {
      crystal.rotation += crystal.rotationSpeed;
    });

    // Lifetime countdown
    this.lifetime--;
    if (this.lifetime <= 0) {
      this.alpha -= 0.05;
    }

    // Check collision with player
    const player = window.game?.player;
    if (player && this.alpha > 0.5) {
      const distance = GameUtils.getDistance(this, player);
      if (distance < this.radius) {
        // Create explosion effect
        this.explode();
        this.alpha = 0;
      }
    }

    this.draw();
    return this.alpha <= 0;
  }

  explode() {
    // Create explosion particles
    if (window.game) {
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const speed = 3 + Math.random() * 4;
        const particle = new Particle(
          this.x,
          this.y,
          2 + Math.random() * 3,
          "#40c4ff",
          {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          }
        );
        window.game.particles.push(particle);
      }

      // Screen shake
      GameUtils.triggerScreenShake(
        GAME_CONFIG.visual.screenShake.crystalIntensity
      );

      // Play sound
      if (window.game.audioSystem) {
        window.game.audioSystem.playSound("crystalForm");
      }
    }
  }
}

window.CrystalCluster = CrystalCluster;
