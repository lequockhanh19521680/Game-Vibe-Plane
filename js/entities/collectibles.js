// Collectible entities - power-ups and bonuses

class EnergyOrb {
  constructor(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.radius = 8 + Math.random() * 4;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    this.rotation = 0;
    this.rotationSpeed = 0.05 + Math.random() * 0.05;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.lifetime = 300 + Math.random() * 200;
    this.age = 0;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const pulse = Math.sin(this.age * 0.1 + this.pulsePhase) * 0.3 + 1;
    const currentRadius = this.radius * pulse;

    // Outer glow
    const gradient = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      currentRadius * 2
    );
    gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
    gradient.addColorStop(0.5, "rgba(0, 150, 255, 0.4)");
    gradient.addColorStop(1, "rgba(0, 100, 200, 0)");

    ctx.beginPath();
    ctx.arc(0, 0, currentRadius * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Inner core
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += this.rotationSpeed;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Attract nearby fragments
    const attractRadius = this.radius * 3;
    fragments.forEach((fragment) => {
      const dist = Math.hypot(fragment.x - this.x, fragment.y - this.y);
      if (dist < attractRadius && dist > 0) {
        const force = (0.1 * (attractRadius - dist)) / attractRadius;
        const angle = Math.atan2(
          this.y - fragment.y,
          this.x - fragment.x
        );
        fragment.velocity.x += Math.cos(angle) * force;
        fragment.velocity.y += Math.sin(angle) * force;
      }
    });

    // Bounce off walls
    if (this.x < this.radius || this.x > canvas.width - this.radius) {
      this.velocity.x *= -0.8;
    }
    if (this.y < this.radius || this.y > canvas.height - this.radius) {
      this.velocity.y *= -0.8;
    }

    this.draw();
    return this.age < this.lifetime;
  }
}

class CrystalShard {
  constructor(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.size = 8 + Math.random() * 12;
    this.mass = this.size * 0.8; // Mass affects physics
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.08;
    this.lifetime = 400 + Math.random() * 200;
    this.age = 0;
    this.isDrifting = true;
    this.sparkleTimer = Math.random() * 60;
    this.color = ["#40c4ff", "#81d4fa", "#b3e5fc", "#e1f5fe"][
      Math.floor(Math.random() * 4)
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    ctx.globalAlpha = alpha * 0.9;

    // Outer glow effect
    if (this.isDrifting) {
      const glowRadius =
        this.size * 2 + Math.sin(this.sparkleTimer * 0.1) * 3;
      const glowGradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        glowRadius
      );
      glowGradient.addColorStop(0, `rgba(64, 196, 255, ${alpha * 0.3})`);
      glowGradient.addColorStop(1, "rgba(64, 196, 255, 0)");

      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }

    // Main crystal body
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size * 0.6, -this.size * 0.4);
    ctx.lineTo(this.size * 0.9, this.size * 0.2);
    ctx.lineTo(this.size * 0.3, this.size);
    ctx.lineTo(-this.size * 0.3, this.size);
    ctx.lineTo(-this.size * 0.9, this.size * 0.2);
    ctx.lineTo(-this.size * 0.6, -this.size * 0.4);
    ctx.closePath();

    // Create crystalline gradient
    const gradient = ctx.createRadialGradient(
      -this.size * 0.3,
      -this.size * 0.3,
      0,
      0,
      0,
      this.size
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, "rgba(64, 196, 255, 0.4)");

    ctx.fillStyle = gradient;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.fill();

    // Inner reflections
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -this.size * 0.7);
    ctx.lineTo(this.size * 0.4, -this.size * 0.2);
    ctx.lineTo(0, this.size * 0.3);
    ctx.lineTo(-this.size * 0.2, -this.size * 0.1);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Edge highlights
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sparkle effects when drifting
    if (this.isDrifting && Math.sin(this.sparkleTimer * 0.2) > 0.7) {
      for (let i = 0; i < 3; i++) {
        const sparkleX = (Math.random() - 0.5) * this.size;
        const sparkleY = (Math.random() - 0.5) * this.size;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    }

    ctx.restore();
  }

  update() {
    this.age++;
    this.sparkleTimer++;
    this.rotation += this.rotationSpeed;

    // Drifting movement with space physics
    if (this.isDrifting) {
      // Add slight gravitational drift and cosmic wind
      this.velocity.x += (Math.random() - 0.5) * 0.01;
      this.velocity.y += (Math.random() - 0.5) * 0.01;

      // Damping in space (stronger)
      this.velocity.x *= 0.995;
      this.velocity.y *= 0.995;

      // Limit max velocity
      const maxSpeed = 2;
      const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
      if (currentSpeed > maxSpeed) {
        this.velocity.x = (this.velocity.x / currentSpeed) * maxSpeed;
        this.velocity.y = (this.velocity.y / currentSpeed) * maxSpeed;
      }
    } // Physics collision with asteroids
    for (let i = 0; i < asteroids.length; i++) {
      const asteroid = asteroids[i];
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);

      if (dist < asteroid.radius + this.size) {
        // Calculate collision physics
        const dx = this.x - asteroid.x;
        const dy = this.y - asteroid.y;
        const distance = Math.max(dist, 1); // Prevent division by zero

        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Relative velocity
        const relVelX = this.velocity.x - asteroid.velocity.x;
        const relVelY = this.velocity.y - asteroid.velocity.y;

        // Relative velocity in collision normal direction
        const speed = relVelX * nx + relVelY * ny;

        // Do not resolve if velocities are separating
        if (speed > 0) continue;

        // Calculate restitution (crystal is bouncy)
        const restitution = 0.8;
        const impulse = (2 * speed) / (this.mass + asteroid.radius);

        // Apply impulse to crystal (asteroid mass is much larger)
        this.velocity.x += impulse * asteroid.radius * nx * restitution;
        this.velocity.y += impulse * asteroid.radius * ny * restitution;

        // Add some rotation from impact
        this.rotationSpeed += (Math.random() - 0.5) * 0.15;

        // Push crystal away to prevent overlap
        const overlap = asteroid.radius + this.size - distance;
        this.x += nx * overlap * 0.8;
        this.y += ny * overlap * 0.8;

        // Create impact sparkles
        for (let j = 0; j < 6; j++) {
          const sparkleAngle =
            Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
          particles.push(
            new Particle(
              this.x + Math.cos(sparkleAngle) * this.size,
              this.y + Math.sin(sparkleAngle) * this.size,
              2,
              this.color,
              {
                x: Math.cos(sparkleAngle) * (2 + Math.random() * 3),
                y: Math.sin(sparkleAngle) * (2 + Math.random() * 3),
              }
            )
          );
        }

        playSound("collision", 0.3);
        this.isDrifting = false;
        setTimeout(() => {
          this.isDrifting = true;
        }, 1000);
      }
    }

    // Crystal shield effect - deflect missiles with physics
    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      const shieldRadius = this.size * 2.2;

      if (dist < shieldRadius) {
        const dx = missile.x - this.x;
        const dy = missile.y - this.y;
        const distance = Math.max(dist, 1);

        // Deflection force based on crystal shield
        const force = ((shieldRadius - distance) / shieldRadius) * 0.3;
        const nx = dx / distance;
        const ny = dy / distance;

        missile.velocity.x += nx * force;
        missile.velocity.y += ny * force;

        // Crystal gets slightly pushed back
        this.velocity.x -= nx * force * 0.1;
        this.velocity.y -= ny * force * 0.1;
      }
    });

    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Bounce off screen edges to keep crystals contained
    if (this.x < this.size) {
      this.x = this.size;
      this.velocity.x = Math.abs(this.velocity.x) * 0.7; // Bounce back with damping
    }
    if (this.x > canvas.width - this.size) {
      this.x = canvas.width - this.size;
      this.velocity.x = -Math.abs(this.velocity.x) * 0.7;
    }
    if (this.y < this.size) {
      this.y = this.size;
      this.velocity.y = Math.abs(this.velocity.y) * 0.7;
    }
    if (this.y > canvas.height - this.size) {
      this.y = canvas.height - this.size;
      this.velocity.y = -Math.abs(this.velocity.y) * 0.7;
    }

    this.draw();
    return this.age < this.lifetime;
  }
}

class ShieldGenerator {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.newObjects.shieldGenerator.radius;
    this.shieldRadius =
      GAME_CONFIG.newObjects.shieldGenerator.shieldRadius;
    this.chargeTime = GAME_CONFIG.newObjects.shieldGenerator.chargeTime;
    this.activeTime = GAME_CONFIG.newObjects.shieldGenerator.activeTime;
    this.age = 0;
    this.isCharging = true;
    this.isActive = false;
    this.rotation = 0;
    this.shieldAlpha = 0;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.isCharging) {
      // Charging animation
      const chargeProgress = this.age / this.chargeTime;
      const pulse = Math.sin(this.age * 0.3) * 0.3 + 0.7;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(33, 150, 243, ${chargeProgress})`;
      ctx.shadowColor = "#2196f3";
      ctx.shadowBlur = 15;
      ctx.fill();

      // Charging ring
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2 * chargeProgress);
      ctx.strokeStyle = "#64b5f6";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (this.isActive) {
      // Generator core
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#2196f3";
      ctx.shadowColor = "#2196f3";
      ctx.shadowBlur = 20;
      ctx.fill();

      // Shield bubble
      ctx.beginPath();
      ctx.arc(0, 0, this.shieldRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(79, 195, 247, ${this.shieldAlpha})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shield fill
      ctx.beginPath();
      ctx.arc(0, 0, this.shieldRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 195, 247, ${this.shieldAlpha * 0.1})`;
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += 0.02;

    if (this.isCharging && this.age >= this.chargeTime) {
      this.isCharging = false;
      this.isActive = true;
      this.age = 0;
      playSound("shield");
    }

    if (this.isActive) {
      this.shieldAlpha = Math.sin(this.age * 0.1) * 0.3 + 0.7;

      // Shield deflects incoming missiles
      missiles.forEach((missile) => {
        const dist = Math.hypot(this.x - missile.x, this.y - missile.y);
        if (dist < this.shieldRadius && dist > this.radius) {
          // Deflect missile away
          const deflectAngle = Math.atan2(
            missile.y - this.y,
            missile.x - this.x
          );
          const deflectForce = 0.3;
          missile.velocity.x += Math.cos(deflectAngle) * deflectForce;
          missile.velocity.y += Math.sin(deflectAngle) * deflectForce;

          // Create shield spark effect
          particles.push(
            new Particle(
              missile.x,
              missile.y,
              Math.cos(deflectAngle) * 3,
              Math.sin(deflectAngle) * 3,
              "#4fc3f7"
            )
          );
        }
      });

      // Shield blocks asteroids
      asteroids.forEach((asteroid) => {
        const dist = Math.hypot(this.x - asteroid.x, this.y - asteroid.y);
        if (dist < this.shieldRadius && dist > this.radius) {
          // Bounce asteroid away
          const bounceAngle = Math.atan2(
            asteroid.y - this.y,
            asteroid.x - this.x
          );
          asteroid.velocity.x =
            Math.cos(bounceAngle) *
            Math.hypot(asteroid.velocity.x, asteroid.velocity.y) *
            0.8;
          asteroid.velocity.y =
            Math.sin(bounceAngle) *
            Math.hypot(asteroid.velocity.x, asteroid.velocity.y) *
            0.8;
        }
      });

      // Check collision with player for protection
      const playerDist = Math.hypot(this.x - player.x, this.y - player.y);
      if (playerDist < this.shieldRadius) {
        player.shieldProtected = true;
      }

      if (this.age >= this.activeTime) {
        return false; // Remove generator
      }
    }

    this.draw();
    return true;
  }
}

class CrystalCluster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.timer = 0;
    this.maxChargeTime = 180; // 3 seconds
    this.state = "charging"; // charging, discharging
    this.dischargeRadius = 0;
    this.dischargeSpeed = 5;
    this.alpha = 0;
    this.crystals = Array(5)
      .fill(null)
      .map(() => ({
        angle: Math.random() * Math.PI * 2,
        dist: this.radius + Math.random() * 10,
        size: 3 + Math.random() * 4,
      }));
  }
  draw() {
    if (this.alpha <= 0 && this.state !== "charging") return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    // Draw orbiting crystals
    this.crystals.forEach((c) => {
      ctx.save();
      ctx.rotate(c.angle);
      ctx.beginPath();
      ctx.rect(c.dist, -c.size / 2, c.size * 1.5, c.size);
      ctx.fillStyle = "var(--crystal-color)";
      ctx.shadowColor = "var(--crystal-color)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });

    // Draw central core
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.shadowColor = "var(--crystal-color)";
    ctx.shadowBlur = 20;
    ctx.fill();

    if (this.state === "charging") {
      const chargeAuraRadius =
        this.radius + (this.timer / this.maxChargeTime) * 30;
      ctx.beginPath();
      ctx.arc(0, 0, chargeAuraRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(64, 196, 255, ${
        0.5 * (this.timer / this.maxChargeTime)
      })`;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (this.state === "discharging") {
      ctx.beginPath();
      ctx.arc(0, 0, this.dischargeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(64, 196, 255, ${
        1 - this.dischargeRadius / (width / 2)
      })`;
      ctx.lineWidth = 10;
      ctx.stroke();
    }
    ctx.restore();
  }
  update() {
    if (this.alpha < 1 && this.state === "charging") this.alpha += 0.02;
    this.crystals.forEach((c) => (c.angle += 0.01));
    this.timer++;

    if (this.state === "charging" && this.timer > this.maxChargeTime) {
      this.state = "discharging";
      triggerScreenShake(0.3);
    }
    if (this.state === "discharging") {
      this.dischargeRadius += this.dischargeSpeed;
      this.alpha -= 0.01;
    }
    this.draw();
  }
}
