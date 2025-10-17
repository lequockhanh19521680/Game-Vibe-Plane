// Portal entities - teleportation and dimensional travel

class QuantumPortal {
  constructor(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.radius = 25;
    this.innerRadius = 10;
    this.rotation = 0;
    this.lifetime = 350;
    this.age = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    const pulse = Math.sin(this.age * 0.15 + this.pulsePhase) * 0.3 + 1;

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(156, 39, 176, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner portal
    const gradient = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      this.innerRadius * pulse
    );
    gradient.addColorStop(0, `rgba(156, 39, 176, ${alpha * 0.8})`);
    gradient.addColorStop(0.7, `rgba(123, 31, 162, ${alpha * 0.4})`);
    gradient.addColorStop(1, `rgba(74, 20, 140, 0)`);

    ctx.beginPath();
    ctx.arc(0, 0, this.innerRadius * pulse, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Portal particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + this.rotation * 2;
      const distance = this.radius * 0.7 * pulse;
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(156, 39, 176, ${alpha})`;
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += 0.05;

    // Portal network effect - teleport asteroids to other portals
    const portalRadius = this.radius * 1.2;
    asteroids.forEach((asteroid) => {
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);
      if (dist < portalRadius) {
        // Find another portal to teleport to
        const otherPortals = quantumPortals.filter((p) => p !== this);
        if (otherPortals.length > 0) {
          const targetPortal =
            otherPortals[Math.floor(Math.random() * otherPortals.length)];
          asteroid.x = targetPortal.x + (Math.random() - 0.5) * 40;
          asteroid.y = targetPortal.y + (Math.random() - 0.5) * 40;

          // Add some random velocity
          asteroid.velocity.x += (Math.random() - 0.5) * 2;
          asteroid.velocity.y += (Math.random() - 0.5) * 2;

          playSound("wormhole");
        }
      }
    });

    // Disrupt nearby missiles
    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < portalRadius) {
        // Add random quantum jitter to missile
        missile.velocity.x += (Math.random() - 0.5) * 0.5;
        missile.velocity.y += (Math.random() - 0.5) * 0.5;
      }
    });

    this.draw();
    return this.age < this.lifetime;
  }
}

class Wormhole {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.maxRadius = 40;
    this.age = 0;
    this.lifetime = 600; // 10 seconds
    this.shootTimer = 0;
    this.shootInterval = 120; // 2 seconds
    this.rotationAngle = 0;
    this.particles = [];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotationAngle);

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);

    // Outer swirling ring
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    gradient.addColorStop(0, "rgba(138, 43, 226, 0)");
    gradient.addColorStop(0.7, "rgba(138, 43, 226, 0.6)");
    gradient.addColorStop(1, "rgba(75, 0, 130, 0.9)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Inner void
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();

    // Swirling effects
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + this.rotationAngle * 0.5;
      const r = this.radius * 0.8;
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(186, 85, 211, ${alpha})`;
      ctx.fill();
    }

    ctx.restore();

    // Draw particles
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ba55d3";
      ctx.fill();
      ctx.restore();
    });
  }

  update() {
    this.age++;
    this.shootTimer++;
    this.rotationAngle += 0.05;

    // Shoot asteroids at player
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.shootAsteroidAtPlayer();
    }

    // Update particles
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        this.particles.splice(index, 1);
      }
    });

    // Add swirling particles
    if (Math.random() < 0.3) {
      const angle = Math.random() * Math.PI * 2;
      const distance = this.radius * 0.9;
      this.particles.push({
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        vx: Math.cos(angle + Math.PI / 2) * 2,
        vy: Math.sin(angle + Math.PI / 2) * 2,
        size: Math.random() * 3 + 1,
        alpha: 0.8,
      });
    }

    this.draw();
    return this.age < this.lifetime;
  }

  shootAsteroidAtPlayer() {
    // Calculate direction to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.hypot(dx, dy);

    // Add some spread for difficulty
    const spread = 0.3;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * spread;

    // Create asteroid near wormhole
    const spawnDistance = this.radius + 20;
    const spawnX = this.x + Math.cos(angle) * spawnDistance;
    const spawnY = this.y + Math.sin(angle) * spawnDistance;

    const asteroidSpeed = 3 + Math.random() * 2;
    const asteroid = new Asteroid(
      spawnX,
      spawnY,
      15 + Math.random() * 10,
      "#ff6b9d", // Pink color for wormhole asteroids
      {
        x: Math.cos(angle) * asteroidSpeed,
        y: Math.sin(angle) * asteroidSpeed,
      }
    );

    asteroids.push(asteroid);

    // Visual effect
    for (let i = 0; i < 8; i++) {
      const effectAngle = angle + (Math.random() - 0.5) * 0.5;
      this.particles.push({
        x: spawnX,
        y: spawnY,
        vx: Math.cos(effectAngle) * 3,
        vy: Math.sin(effectAngle) * 3,
        size: Math.random() * 4 + 2,
        alpha: 1,
      });
    }

    playSound("wormhole", 0.5);
  }
}

