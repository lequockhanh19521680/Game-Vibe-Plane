// =============================================================================
// MISSILE CLASS
// =============================================================================

class Missile {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.radius = GAME_CONFIG.missiles.radius;
    this.speed = GAME_CONFIG.missiles.baseSpeed;
    this.turnSpeed = GAME_CONFIG.missiles.baseTurnSpeed;
    this.angle = Math.atan2(targetY - y, targetX - x);
    this.velocity = {
      x: Math.cos(this.angle) * this.speed,
      y: Math.sin(this.angle) * this.speed,
    };
    this.lifetime = GAME_CONFIG.missiles.lifetime;
    this.speedUpTimer = 0;
    this.trail = [];
    this.isDead = false;
    this.rotation = this.angle;
    this.thrustParticles = [];
  }

  draw() {
    const ctx = window.ctx;

    // Draw trail
    this.trail.forEach((part, index) => {
      ctx.save();
      ctx.globalAlpha = part.alpha;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#f48fb1";
      ctx.fill();
      ctx.restore();
    });

    // Draw missile body
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Missile body
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 2, this.radius, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f48fb1";
    ctx.shadowColor = "#f48fb1";
    ctx.shadowBlur = 10;
    ctx.fill();

    // Missile tip
    ctx.beginPath();
    ctx.moveTo(this.radius * 2, 0);
    ctx.lineTo(this.radius * 3, -this.radius * 0.3);
    ctx.lineTo(this.radius * 3, this.radius * 0.3);
    ctx.closePath();
    ctx.fillStyle = "#ff6ec7";
    ctx.fill();

    // Fins
    ctx.strokeStyle = "#ff6ec7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.radius, -this.radius * 0.8);
    ctx.lineTo(-this.radius * 1.5, -this.radius * 1.2);
    ctx.moveTo(-this.radius, this.radius * 0.8);
    ctx.lineTo(-this.radius * 1.5, this.radius * 1.2);
    ctx.stroke();

    ctx.restore();
  }

  update() {
    // Update target to current player position
    const player = window.game?.player;
    if (player) {
      this.targetX = player.x;
      this.targetY = player.y;
    }

    // Calculate desired angle to target
    const desiredAngle = Math.atan2(
      this.targetY - this.y,
      this.targetX - this.x
    );

    // Turn towards target
    let angleDiff = desiredAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    this.angle +=
      Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);
    this.rotation = this.angle;

    // Update velocity based on current angle
    this.velocity.x = Math.cos(this.angle) * this.speed;
    this.velocity.y = Math.sin(this.angle) * this.speed;

    // Apply velocity
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Speed up over time
    this.speedUpTimer++;
    if (this.speedUpTimer > GAME_CONFIG.missiles.speedUpTime) {
      this.speed *= GAME_CONFIG.missiles.speedUpMultiplier;
      this.turnSpeed *= GAME_CONFIG.missiles.turnSpeedUpMultiplier;
      this.speedUpTimer = 0;
    }

    // Add trail
    this.trail.push({
      x: this.x,
      y: this.y,
      radius: this.radius * 0.6,
      alpha: 0.8,
    });

    // Limit trail length
    if (this.trail.length > 15) {
      this.trail.shift();
    }

    // Update trail
    this.trail.forEach((part, index) => {
      part.alpha -= 0.05;
      part.radius *= 0.98;
      if (part.alpha <= 0) {
        this.trail.splice(index, 1);
      }
    });

    // Decrease lifetime
    this.lifetime--;
    if (this.lifetime <= 0) {
      // Create fragments when missile expires
      if (window.game) {
        window.game.createFragments(
          this.x,
          this.y,
          GAME_CONFIG.missiles.fragmentCount,
          "missile"
        );
      }
      this.isDead = true;
    }

    // Check if off screen (with buffer)
    if (
      this.x < -100 ||
      this.x > window.width + 100 ||
      this.y < -100 ||
      this.y > window.height + 100
    ) {
      this.isDead = true;
    }

    this.draw();
  }
}

window.Missile = Missile;
