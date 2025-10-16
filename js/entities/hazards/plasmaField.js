// Hazard entities - environmental dangers

class PlasmaField {
  constructor(x, y) {
    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = 80 + Math.random() * 40;
    this.particles = [];
    this.lifetime = 400;
    this.age = 0;
    this.rotation = 0;

    // Create particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        angle: (i / 15) * Math.PI * 2,
        distance: 20 + Math.random() * 40,
        speed: 0.02 + Math.random() * 0.03,
        size: 2 + Math.random() * 3,
      });
    }
  }

  draw() {
    ctx.save();

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    ctx.globalAlpha = alpha * 0.6;

    // Draw field boundary
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ff6b35";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw plasma particles
    this.particles.forEach((p) => {
      const x = this.x + Math.cos(p.angle + this.rotation) * p.distance;
      const y = this.y + Math.sin(p.angle + this.rotation) * p.distance;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ff6b35";
      ctx.shadowColor = "#ff6b35";
      ctx.shadowBlur = 8;
      ctx.fill();
    });

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += 0.02;

    this.particles.forEach((p) => {
      p.angle += p.speed;
      p.distance += Math.sin(this.age * 0.05) * 0.5;
    });

    // Push away nearby missiles and fragments
    const pushRadius = this.radius * 1.5;
    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < pushRadius && dist > 0) {
        const force = (0.05 * (pushRadius - dist)) / pushRadius;
        const angle = Math.atan2(missile.y - this.y, missile.x - this.x);
        missile.velocity.x += Math.cos(angle) * force;
        missile.velocity.y += Math.sin(angle) * force;
      }
    });

    fragments.forEach((fragment) => {
      const dist = Math.hypot(fragment.x - this.x, fragment.y - this.y);
      if (dist < pushRadius && dist > 0) {
        const force = (0.08 * (pushRadius - dist)) / pushRadius;
        const angle = Math.atan2(fragment.y - this.y, fragment.x - this.x);
        fragment.velocity.x += Math.cos(angle) * force;
        fragment.velocity.y += Math.sin(angle) * force;
      }
    });

    this.draw();
    return this.age < this.lifetime;
  }
}

