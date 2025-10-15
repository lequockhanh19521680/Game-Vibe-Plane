// =============================================================================
// ASTEROID CLASS
// =============================================================================

class Asteroid {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.shapePoints = this.createShape();
    this.isFragment = false;

    // Random movement patterns for diversity
    this.movementPattern = Math.random();
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.rotation = 0;
    this.wobbleAmount = Math.random() * 0.5;
    this.wobbleSpeed = Math.random() * 0.1;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.timer = 0;

    // Occasional direction changes
    this.changeDirectionTimer = 60 + Math.random() * 180; // 1-4 seconds
    this.originalVelocity = { ...velocity };
  }

  createShape() {
    const p = [];
    const s = 7 + ~~(Math.random() * 5);
    for (let i = 0; i < s; i++) {
      const a = (i / s) * Math.PI * 2,
        r = this.radius * (0.7 + Math.random() * 0.3);
      p.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return p;
  }

  draw() {
    const ctx = window.ctx;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.moveTo(this.shapePoints[0].x, this.shapePoints[0].y);
    for (let i = 1; i < this.shapePoints.length; i++) {
      ctx.lineTo(this.shapePoints[i].x, this.shapePoints[i].y);
    }
    ctx.closePath();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  update() {
    this.timer++;
    this.rotation += this.rotationSpeed;

    // Ensure velocity exists
    if (!this.velocity) {
      this.velocity = { x: 0, y: 2 };
    }

    // Apply different movement patterns for unpredictability
    if (!this.isFragment) {
      if (this.movementPattern < 0.6) {
        // Straight movement (60%)
        this.x += this.velocity.x;
        this.y += this.velocity.y;
      } else if (this.movementPattern < 0.8) {
        // Wobbling movement (20%)
        const wobble =
          Math.sin(this.timer * this.wobbleSpeed + this.wobblePhase) *
          this.wobbleAmount;
        this.x += this.velocity.x + Math.sin(this.rotation) * wobble;
        this.y += this.velocity.y + Math.cos(this.rotation) * wobble;
      } else if (this.movementPattern < 0.9) {
        // Spiral movement (10%)
        const spiralRadius = Math.sin(this.timer * 0.02) * 2;
        this.x += this.velocity.x + Math.cos(this.timer * 0.1) * spiralRadius;
        this.y += this.velocity.y + Math.sin(this.timer * 0.1) * spiralRadius;
      } else {
        // Erratic movement (10%)
        const jitter = 0.5;
        this.x += this.velocity.x + (Math.random() - 0.5) * jitter;
        this.y += this.velocity.y + (Math.random() - 0.5) * jitter;
      }

      // Random direction changes for some asteroids
      this.changeDirectionTimer--;
      if (this.changeDirectionTimer <= 0 && Math.random() < 0.3) {
        const changeAmount = 0.3;
        this.velocity.x += (Math.random() - 0.5) * changeAmount;
        this.velocity.y += (Math.random() - 0.5) * changeAmount;
        this.changeDirectionTimer = 120 + Math.random() * 240; // 2-6 seconds
      }
    } else {
      // Fragment movement
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.velocity.x *= GAME_CONFIG.asteroids.fragmentSpeed;
      this.velocity.y *= GAME_CONFIG.asteroids.fragmentSpeed;
    }

    this.draw();
  }
}

window.Asteroid = Asteroid;
