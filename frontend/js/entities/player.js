class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.trail = [];
    this.velocity = { x: 0, y: 0 };
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldDuration = 600; // 10 seconds at 60fps
    this.thunderShieldActive = false;
    this.thunderShieldTimer = 0;
    this.thunderShieldDuration = 600; // 10 seconds at 60fps
    this.thunderShieldRadius = this.radius * 3.5; // Range of the thunder shield
    this.thunderBolts = [];
    this.thunderTimer = 0;
  }
  draw() {
    this.trail.forEach((part) => {
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${part.alpha})`;
      ctx.fill();
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

    // Draw regular shield if active
    if (this.shieldActive) {
      let shieldAlpha = Math.min(1, this.shieldTimer / 60);

      // Flashing effect in last 5 seconds (300 frames)
      if (this.shieldTimer <= 300) {
        const flashSpeed = this.shieldTimer <= 120 ? 0.3 : 0.15; // Faster flash when almost expired
        shieldAlpha *= Math.sin(Date.now() * flashSpeed) * 0.4 + 0.6;
      }

      ctx.globalAlpha = shieldAlpha * 0.7;

      // Outer shield ring
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2);
      const shieldGradient = ctx.createRadialGradient(
        0,
        0,
        this.radius,
        0,
        0,
        this.radius * 2.5
      );
      shieldGradient.addColorStop(0, "rgba(0, 255, 255, 0)");
      shieldGradient.addColorStop(0.7, "rgba(0, 255, 255, 0.4)");
      shieldGradient.addColorStop(1, "rgba(0, 255, 255, 0.8)");
      ctx.strokeStyle = shieldGradient;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner shield glow
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }

    // Draw thunder shield if active
    if (this.thunderShieldActive) {
      let thunderAlpha = Math.min(1, this.thunderShieldTimer / 60);

      // Flashing effect in last 5 seconds (300 frames)
      if (this.thunderShieldTimer <= 300) {
        const flashSpeed = this.thunderShieldTimer <= 120 ? 0.3 : 0.15; // Faster flash when almost expired
        thunderAlpha *= Math.sin(Date.now() * flashSpeed) * 0.5 + 0.5;
      }

      ctx.globalAlpha = thunderAlpha * 0.6;

      // Thunder shield outer ring
      ctx.beginPath();
      ctx.arc(0, 0, this.thunderShieldRadius, 0, Math.PI * 2);
      const thunderGradient = ctx.createRadialGradient(
        0,
        0,
        this.radius,
        0,
        0,
        this.thunderShieldRadius
      );
      thunderGradient.addColorStop(0, "rgba(255, 255, 0, 0)");
      thunderGradient.addColorStop(0.6, "rgba(255, 255, 0, 0.2)");
      thunderGradient.addColorStop(1, "rgba(255, 200, 0, 0.4)");
      ctx.strokeStyle = thunderGradient;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Electric arcs
      const arcCount = 8;
      for (let i = 0; i < arcCount; i++) {
        if (Math.random() < 0.3) {
          // Random flickering effect
          const angle =
            (i / arcCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
          const length = this.thunderShieldRadius * 0.8;

          ctx.beginPath();
          ctx.moveTo(0, 0);

          // Create jagged lightning
          let x = 0,
            y = 0;
          const segments = 4;
          for (let j = 1; j <= segments; j++) {
            const segLength = (j / segments) * length;
            const jitter = length * 0.15 * (j < segments ? 1 : 0);
            x =
              Math.cos(angle) * segLength +
              (Math.random() - 0.5) * jitter;
            y =
              Math.sin(angle) * segLength +
              (Math.random() - 0.5) * jitter;
            ctx.lineTo(x, y);
          }

          ctx.strokeStyle = "#ffff00";
          ctx.lineWidth = 1 + Math.random();
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 10;
          ctx.stroke();
        }
      }

      // Inner thunder glow
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
  update() {
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
    this.y = Math.max(
      this.radius,
      Math.min(height - this.radius, this.y)
    );

    this.trail.push({
      x: this.x,
      y: this.y + 10,
      radius: this.radius / 3,
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

    // Update regular shield
    if (this.shieldActive) {
      this.shieldTimer--;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
      }
    }

    // Update thunder shield
    if (this.thunderShieldActive) {
      this.thunderShieldTimer--;
      this.thunderTimer++;

      // Check for nearby objects every 10 frames to avoid excessive calculations
      if (this.thunderTimer % 10 === 0) {
        this.checkThunderShieldCollisions();
      }

      if (this.thunderShieldTimer <= 0) {
        this.thunderShieldActive = false;
        showEventText("⚡ Thunder Shield Deactivated ⚡");
      }
    }

    this.draw();
  }

  activateShield() {
    this.shieldActive = true;
    this.shieldTimer = this.shieldDuration;
    playSound("shield");
  }

  activateThunderShield() {
    this.thunderShieldActive = true;
    this.thunderShieldTimer = this.thunderShieldDuration;
    this.thunderTimer = 0;

    // Increase player speed slightly while thunder shield is active
    globalSpeedMultiplier *= 0.8;

    // Visual effect
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      particles.push(
        new Particle(
          this.x + Math.cos(angle) * this.radius * 2,
          this.y + Math.sin(angle) * this.radius * 2,
          3,
          "#ffff00",
          {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5,
          }
        )
      );
    }

    showEventText("⚡ THUNDER SHIELD ACTIVATED! ⚡");
    playSound("powerup");
  }

  checkThunderShieldCollisions() {
    if (!this.thunderShieldActive) return;

    // Check asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      const dist = Math.hypot(ast.x - this.x, ast.y - this.y);

      if (dist < this.thunderShieldRadius + ast.radius) {
        // Create lightning effect to the asteroid
        this.createLightningStrike(ast.x, ast.y);

        // Create explosion particles
        for (let j = 0; j < 8; j++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push(
            new Particle(
              ast.x + Math.cos(angle) * 5,
              ast.y + Math.sin(angle) * 5,
              Math.cos(angle) * 6,
              Math.sin(angle) * 6,
              "#ffff00"
            )
          );
        }

        // Remove asteroid and add score
        asteroids.splice(i, 1);
        score += 15;
        playSound("explosion", 0.4);
      }
    }

    // Check missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
      const missile = missiles[i];
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);

      if (dist < this.thunderShieldRadius + missile.radius) {
        // Create lightning effect to the missile
        this.createLightningStrike(missile.x, missile.y);

        // Make the missile explode
        missile.explode(true);
        score += 25;
      }
    }
  }

  createLightningStrike(targetX, targetY) {
    // Calculate vector from player to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    // Create lightning segments
    const segments = [];
    const segmentCount = 6;
    const segmentLength = distance / segmentCount;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = this.x + Math.cos(angle) * segmentLength * i;
      const baseY = this.y + Math.sin(angle) * segmentLength * i;

      // Add jitter to all except the last segment
      const jitter = i < segmentCount ? 10 : 0;
      const offsetX = (Math.random() - 0.5) * jitter;
      const offsetY = (Math.random() - 0.5) * jitter;

      segments.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
      });
    }

    // Draw lightning effect
    ctx.save();
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    segments.forEach((segment) => {
      ctx.lineTo(segment.x, segment.y);
    });
    ctx.stroke();
    ctx.restore();
  }
}
