// =============================================================================
// LASER MINE CLASS
// =============================================================================

class LaserMine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.laserMines.radius;
    this.chargeTimer = 0;
    this.fireTimer = 0;
    this.maxChargeTime = GAME_CONFIG.laserMines.chargeTime;
    this.maxFireTime = GAME_CONFIG.laserMines.fireDuration;
    this.isCharging = false;
    this.isFiring = false;
    this.alpha = 0;
    this.rotation = 0;
    this.pattern = GameUtils.randomChoice(GAME_CONFIG.laserMines.patterns);
    this.beams = [];
    this.pulsePhase = 0;
  }

  draw() {
    const ctx = window.ctx;

    // Draw mine core
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Core body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff5722";
    ctx.shadowColor = "#ff5722";
    ctx.shadowBlur = 15;
    ctx.fill();

    // Spikes
    const spikes = 8;
    for (let i = 0; i < spikes; i++) {
      const angle = (i * Math.PI * 2) / spikes;
      const spikeLength = this.radius * 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(angle) * (this.radius + spikeLength),
        Math.sin(angle) * (this.radius + spikeLength)
      );
      ctx.strokeStyle = "#ff8a65";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // Draw charging effect
    if (this.isCharging) {
      const chargeAlpha = (this.chargeTimer / this.maxChargeTime) * 0.5;
      ctx.save();
      ctx.globalAlpha = chargeAlpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Draw laser beams when firing
    if (this.isFiring) {
      this.drawBeams();
    }
  }

  drawBeams() {
    const ctx = window.ctx;
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "#ff0044";
    ctx.lineWidth = GAME_CONFIG.laserMines.beamWidth;
    ctx.shadowColor = "#ff0044";
    ctx.shadowBlur = 20;

    this.beams.forEach((beam) => {
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
    });

    ctx.restore();
  }

  generateBeams() {
    this.beams = [];
    const beamLength = Math.max(window.width, window.height);

    switch (this.pattern) {
      case "cross":
        // Horizontal and vertical beams
        this.beams.push(
          { x1: 0, y1: this.y, x2: window.width, y2: this.y },
          { x1: this.x, y1: 0, x2: this.x, y2: window.height }
        );
        break;

      case "diagonal":
        // Diagonal beams
        this.beams.push(
          { x1: 0, y1: 0, x2: window.width, y2: window.height },
          { x1: window.width, y1: 0, x2: 0, y2: window.height }
        );
        break;

      case "star":
        // 8-direction star pattern
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x2 = this.x + Math.cos(angle) * beamLength;
          const y2 = this.y + Math.sin(angle) * beamLength;
          this.beams.push({ x1: this.x, y1: this.y, x2, y2 });
        }
        break;

      case "random":
        // Random beams
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const x2 = this.x + Math.cos(angle) * beamLength;
          const y2 = this.y + Math.sin(angle) * beamLength;
          this.beams.push({ x1: this.x, y1: this.y, x2, y2 });
        }
        break;
    }
  }

  update() {
    // Fade in
    if (this.alpha < 1) {
      this.alpha += 0.05;
    }

    // Slow rotation as requested
    this.rotation += 0.03; // Reduced from 0.15 to make it very slow
    this.pulsePhase += 0.1;

    // Check distance to player to start charging
    const player = window.game?.player;
    if (player && !this.isCharging && !this.isFiring) {
      const distance = GameUtils.getDistance(this, player);
      if (distance < 150) {
        // Activation range
        this.isCharging = true;
        this.chargeTimer = 0;
      }
    }

    // Handle charging
    if (this.isCharging) {
      this.chargeTimer++;
      if (this.chargeTimer >= this.maxChargeTime) {
        this.isCharging = false;
        this.isFiring = true;
        this.fireTimer = 0;
        this.generateBeams();

        // Play sound
        if (window.game?.audioSystem) {
          window.game.audioSystem.playSound("laserMine");
        }
      }
    }

    // Handle firing
    if (this.isFiring) {
      this.fireTimer++;
      if (this.fireTimer >= this.maxFireTime) {
        this.isFiring = false;
        this.beams = [];
      }
    }

    this.draw();
  }

  // Check collision with beams
  checkBeamCollision(target) {
    if (!this.isFiring) return false;

    return this.beams.some((beam) => {
      return (
        GameUtils.distanceToLineSegment(
          target,
          { x: beam.x1, y: beam.y1 },
          { x: beam.x2, y: beam.y2 }
        ) <
        target.radius + GAME_CONFIG.laserMines.beamWidth / 2
      );
    });
  }
}

window.LaserMine = LaserMine;
