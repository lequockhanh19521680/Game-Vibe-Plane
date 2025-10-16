class FreezeZone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.newObjects.freezeZone.radius;
    this.effectStrength = GAME_CONFIG.newObjects.freezeZone.effectStrength;
    this.particleCount = GAME_CONFIG.newObjects.freezeZone.particleCount * 1.5; // Increase particles for better visual
    this.particles = [];
    this.age = 0;
    this.lifetime = GAME_CONFIG.events.freezeZone.duration || 450; // Use config value or fallback
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.frozenObjects = []; // Track objects that are completely frozen

    // Create ice particles
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * this.radius,
        size: 1 + Math.random() * 3,
        speed: 0.01 + Math.random() * 0.02,
      });
    }
  }

  draw() {
    ctx.save();

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    const pulse =
      Math.sin(
        this.age * GAME_CONFIG.newObjects.freezeZone.pulseSpeed +
          this.pulsePhase
      ) *
        0.3 +
      0.7;

    ctx.globalAlpha = alpha * 0.6;

    // Freeze zone boundary
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = GAME_CONFIG.newObjects.freezeZone.color;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Freeze zone fill
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `${GAME_CONFIG.newObjects.freezeZone.color}20`;
    ctx.fill();

    // Ice particles
    this.particles.forEach((p) => {
      const x = this.x + Math.cos(p.angle) * p.distance;
      const y = this.y + Math.sin(p.angle) * p.distance;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = GAME_CONFIG.newObjects.freezeZone.color;
      ctx.shadowColor = GAME_CONFIG.newObjects.freezeZone.color;
      ctx.shadowBlur = 5;
      ctx.fill();
    });

    ctx.restore();
  }

  update() {
    this.age++;

    // Update particles
    this.particles.forEach((p) => {
      p.angle += p.speed;
      p.distance += Math.sin(this.age * 0.02) * 0.5;
    });

    // Apply freeze effect to nearby entities
    const freezeDistance = this.radius;

    // Slow down asteroids in range and create ice crystals
    asteroids.forEach((asteroid) => {
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);
      if (dist < freezeDistance) {
        // Apply slow effect to all asteroids in range
        asteroid.velocity.x *= this.effectStrength;
        asteroid.velocity.y *= this.effectStrength;

        // Visual effect - ice particles coming off asteroids
        if (Math.random() < 0.1) {
          // 10% chance per frame
          const angle = Math.random() * Math.PI * 2;
          particles.push(
            new Particle(
              asteroid.x + Math.cos(angle) * asteroid.radius,
              asteroid.y + Math.sin(angle) * asteroid.radius,
              Math.random() * 2 + 1,
              GAME_CONFIG.newObjects.freezeZone.color,
              {
                x: Math.cos(angle) * 1,
                y: Math.sin(angle) * 1,
              }
            )
          );
        }

        // Chance to freeze asteroid completely (higher chance now)
        if (Math.random() < 0.02) {
          // 2% chance per frame (up from 0.5%)
          // Almost completely stop the asteroid
          asteroid.velocity.x *= 0.05;
          asteroid.velocity.y *= 0.05;

          // Add visual frozen effect
          if (!asteroid.isFrozen) {
            asteroid.isFrozen = true;
            asteroid.originalColor = asteroid.color;
            asteroid.color = GAME_CONFIG.newObjects.freezeZone.color;

            // Add ice particles instead of creating crystals
            for (let i = 0; i < 8; i++) {
              const angle = Math.random() * Math.PI * 2;
              particles.push(
                new Particle(
                  asteroid.x + Math.cos(angle) * asteroid.radius,
                  asteroid.y + Math.sin(angle) * asteroid.radius,
                  Math.random() * 2 + 1,
                  GAME_CONFIG.newObjects.freezeZone.color,
                  {
                    x: Math.cos(angle) * 0.5,
                    y: Math.sin(angle) * 0.5,
                  }
                )
              );
            }

            // Add to tracked frozen objects
            this.frozenObjects.push({
              object: asteroid,
              type: "asteroid",
              freezeTime: this.age,
            });
          }
        }
      } else if (asteroid.isFrozen) {
        // Check if this asteroid should thaw out (if outside freeze zone)
        asteroid.isFrozen = false;
        asteroid.color = asteroid.originalColor || asteroid.color;
      }
    });

    // Slow down missiles in range and chance to freeze them
    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < freezeDistance) {
        // Slow down the missile
        missile.velocity.x *= this.effectStrength;
        missile.velocity.y *= this.effectStrength;

        // Visual effect - ice trail
        if (Math.random() < 0.2) {
          // 20% chance per frame
          missile.trail.push({
            x: missile.x,
            y: missile.y,
            r: missile.radius / 1.5,
            a: 1,
            color: GAME_CONFIG.newObjects.freezeZone.color, // Add ice color to trail
          });
        }

        // Chance to completely freeze missile (higher chance)
        if (Math.random() < 0.03) {
          // 3% chance per frame (up from 1%)
          // Completely stop the missile
          missile.velocity.x = 0;
          missile.velocity.y = 0;
          missile.turnSpeed *= 0.05; // Almost completely stop turning

          // Add visual frozen effect
          if (!missile.isFrozen) {
            missile.isFrozen = true;

            // Create ice crystal effect around missile
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              particles.push(
                new Particle(
                  missile.x + Math.cos(angle) * 10,
                  missile.y + Math.sin(angle) * 10,
                  3,
                  GAME_CONFIG.newObjects.freezeZone.color,
                  {
                    x: Math.cos(angle) * 2,
                    y: Math.sin(angle) * 2,
                  }
                )
              );
            }

            // Add to tracked frozen objects
            this.frozenObjects.push({
              object: missile,
              type: "missile",
              freezeTime: this.age,
            });
          }
        }
      } else if (missile.isFrozen) {
        // Allow gradual thawing when outside freeze zone
        missile.isFrozen = false;
        missile.turnSpeed /= 0.05; // Restore normal turning
      }
    });

    // Interact with plasma fields - create steam effect
    plasmaFields.forEach((plasma) => {
      const dist = Math.hypot(plasma.x - this.x, plasma.y - this.y);
      if (dist < freezeDistance + plasma.radius) {
        // Create steam particles where ice meets plasma
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push(
            new Particle(
              this.x + Math.cos(angle) * freezeDistance * 0.8,
              this.y + Math.sin(angle) * freezeDistance * 0.8,
              Math.cos(angle) * 2,
              Math.sin(angle) * 2,
              "#e1f5fe"
            )
          );
        }
      }
    });

    // Interact with energy orbs - create electrical discharge
    energyOrbs.forEach((orb) => {
      const dist = Math.hypot(orb.x - this.x, orb.y - this.y);
      if (dist < freezeDistance + orb.radius) {
        // Create electrical effect
        for (let i = 0; i < 2; i++) {
          const angle =
            Math.atan2(orb.y - this.y, orb.x - this.x) +
            (Math.random() - 0.5) * 0.5;
          particles.push(
            new Particle(
              this.x + Math.cos(angle) * freezeDistance,
              this.y + Math.sin(angle) * freezeDistance,
              Math.cos(angle) * 4,
              Math.sin(angle) * 4,
              "#00ffff"
            )
          );
        }
      }
    });

    this.draw();
    return this.age < this.lifetime;
  }
}

