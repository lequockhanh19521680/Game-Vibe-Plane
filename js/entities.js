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

class Fragment {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.radius =
      GAME_CONFIG.fragments.minRadius +
      Math.random() *
        (GAME_CONFIG.fragments.maxRadius -
          GAME_CONFIG.fragments.minRadius);
    this.velocity = velocity;
    this.color = GAME_CONFIG.fragments.color;
    this.life =
      GAME_CONFIG.fragments.minLife +
      Math.random() *
        (GAME_CONFIG.fragments.maxLife - GAME_CONFIG.fragments.minLife);
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed =
      (Math.random() - 0.5) * GAME_CONFIG.fragments.rotationSpeed;
    this.lethal = false; // Regular fragments are not lethal
  }
}

class MissileFragment {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.radius =
      GAME_CONFIG.fragments.missileFragments.minRadius +
      Math.random() *
        (GAME_CONFIG.fragments.missileFragments.maxRadius -
          GAME_CONFIG.fragments.missileFragments.minRadius);
    this.velocity = velocity;
    this.color = GAME_CONFIG.fragments.missileFragments.color;
    this.life =
      GAME_CONFIG.fragments.missileFragments.minLife +
      Math.random() *
        (GAME_CONFIG.fragments.missileFragments.maxLife -
          GAME_CONFIG.fragments.missileFragments.minLife);
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.lethal = GAME_CONFIG.fragments.missileFragments.lethal;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(
      -this.radius / 2,
      -this.radius / 2,
      this.radius,
      this.radius
    );
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    // Add danger glow for lethal fragments
    if (this.lethal) {
      ctx.strokeStyle = "#ff0088";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += GAME_CONFIG.fragments.gravity;
    this.velocity.x *= GAME_CONFIG.fragments.airResistance;
    this.velocity.y *= GAME_CONFIG.fragments.airResistance;
    this.rotation += this.rotationSpeed;

    this.life--;
    this.alpha = Math.max(0, this.life / 120);

    return this.life <= 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(
      -this.radius / 2,
      -this.radius / 2,
      this.radius,
      this.radius
    );
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += GAME_CONFIG.fragments.gravity;
    this.velocity.x *= GAME_CONFIG.fragments.airResistance;
    this.velocity.y *= GAME_CONFIG.fragments.airResistance;
    this.rotation += this.rotationSpeed;

    this.life--;
    this.alpha = Math.max(0, this.life / 150);

    this.draw();
  }
}

class Warning {
  constructor(x, y, type, duration = 120) {
    this.x = x;
    this.y = y;
    this.type = type; // 'blackhole' or 'missile'
    this.duration = duration;
    this.timer = 0;
    this.radius = GAME_CONFIG.ui.warning.radius;
    this.alpha = 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    // Pulsing warning circle
    const pulse =
      Math.sin(this.timer * GAME_CONFIG.ui.warning.pulseSpeed) * 0.5 +
      0.5;
    const currentRadius =
      this.radius + pulse * GAME_CONFIG.ui.warning.pulseIntensity;

    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);

    // Different colors for different warning types
    let warningColor, warningSymbol;
    switch (this.type) {
      case "blackhole":
        warningColor = "#aa66cc"; // Purple for blackholes
        warningSymbol = "!";
        break;
      case "voidrift":
        warningColor = "#3d2963"; // Dark purple for void rifts
        warningSymbol = "⚠";
        break;
      case "supernova":
        warningColor = "#ff3333"; // Red for supernova
        warningSymbol = "💥";
        break;
      case "plasma":
        warningColor = "#ff6600"; // Orange for plasma
        warningSymbol = "🔥";
        break;
      default:
        warningColor = "#f48fb1"; // Pink for missiles and others
        warningSymbol = "!";
    }

    ctx.strokeStyle = warningColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Warning symbol
    ctx.fillStyle = warningColor;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(warningSymbol, 0, 0);

    ctx.restore();
  }

  update() {
    this.timer++;

    // Fade in and out
    if (this.timer < GAME_CONFIG.ui.warning.fadeInTime) {
      this.alpha = this.timer / GAME_CONFIG.ui.warning.fadeInTime;
    } else if (
      this.timer >
      this.duration - GAME_CONFIG.ui.warning.fadeOutTime
    ) {
      this.alpha =
        (this.duration - this.timer) / GAME_CONFIG.ui.warning.fadeOutTime;
    } else {
      this.alpha = 1;
    }

    this.draw();
  }
}

class CircleWarning {
  constructor(centerX, centerY, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.timer = 0;
    this.duration = GAME_CONFIG.events.asteroidCircle.warningTime;
    this.alpha = 0;
  }

  draw() {
    ctx.save();

    // Nhấp nháy warning
    const blinkSpeed = 0.1;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = blinkAlpha * 0.8;

    // Vẽ vòng tròn warning
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ text warning ở giữa
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️ ASTEROID CIRCLE ⚠️", this.centerX, this.centerY);

    ctx.restore();
  }
  update() {
    this.timer++;
    this.draw();
  }
}

class BeltWarning {
  constructor(centerX, centerY, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.timer = 0;
    this.duration = 180; // 3 seconds warning
    this.alpha = 0;
  }

  draw() {
    ctx.save();

    // Nhấp nháy warning
    const blinkSpeed = 0.08;
    const blinkAlpha = Math.abs(Math.sin(this.timer * blinkSpeed));
    ctx.globalAlpha = blinkAlpha * 0.7;

    // Vẽ vòng tròn orbit warning
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffbb33";
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ các điểm asteroid sẽ xuất hiện
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffbb33";
      ctx.fill();
    }

    // Vẽ text warning ở giữa
    ctx.fillStyle = "#ffbb33";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️ ASTEROID BELT ⚠️", this.centerX, this.centerY);

    ctx.restore();
  }

  update() {
    this.timer++;
    this.draw();
  }
}

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
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw the asteroid shape
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

    // Draw charged effect if asteroid is charged
    if (this.charged) {
      // Electric glow around the asteroid
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.3, 0, Math.PI * 2);
      ctx.strokeStyle = this.chargeColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.chargeColor;
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Electric sparks
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = this.radius * 1.1;
        const sparkLength = this.radius * 0.4;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.lineTo(
          Math.cos(angle) * (length + sparkLength),
          Math.sin(angle) * (length + sparkLength)
        );
        ctx.strokeStyle = this.chargeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
  update() {
    this.timer++;
    this.rotation += this.rotationSpeed;

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
        this.x +=
          this.velocity.x + Math.cos(this.timer * 0.1) * spiralRadius;
        this.y +=
          this.velocity.y + Math.sin(this.timer * 0.1) * spiralRadius;
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
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= GAME_CONFIG.visual.particles.fadeSpeed;
    this.draw();
  }
}

// ===== VẬT THỂ MỚI =====

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
        const angle = Math.atan2(
          fragment.y - this.y,
          fragment.x - this.x
        );
        fragment.velocity.x += Math.cos(angle) * force;
        fragment.velocity.y += Math.sin(angle) * force;
      }
    });

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

class FreezeZone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.newObjects.freezeZone.radius;
    this.effectStrength =
      GAME_CONFIG.newObjects.freezeZone.effectStrength;
    this.particleCount = GAME_CONFIG.newObjects.freezeZone.particleCount;
    this.particles = [];
    this.age = 0;
    this.lifetime = 300;
    this.pulsePhase = Math.random() * Math.PI * 2;

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
        asteroid.velocity.x *= this.effectStrength;
        asteroid.velocity.y *= this.effectStrength;

        // Chance to freeze asteroid completely
        if (Math.random() < 0.005) {
          // 0.5% chance per frame
          asteroid.velocity.x *= 0.1;
          asteroid.velocity.y *= 0.1;

          // Create ice crystal around asteroid
          crystalShards.push(
            new CrystalShard(
              asteroid.x + (Math.random() - 0.5) * 20,
              asteroid.y + (Math.random() - 0.5) * 20
            )
          );
        }
      }
    });

    // Slow down missiles in range and chance to freeze them
    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < freezeDistance) {
        missile.velocity.x *= this.effectStrength;
        missile.velocity.y *= this.effectStrength;

        // Chance to completely freeze missile
        if (Math.random() < 0.01) {
          // 1% chance per frame
          missile.velocity.x = 0;
          missile.velocity.y = 0;
          missile.turnSpeed *= 0.1; // Almost stop turning
        }
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

class LaserTurret {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.newObjects.laserTurret.radius;
    this.barrelLength = GAME_CONFIG.newObjects.laserTurret.barrelLength;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = GAME_CONFIG.newObjects.laserTurret.rotationSpeed;
    this.trackingRange = GAME_CONFIG.newObjects.laserTurret.trackingRange;
    this.fireInterval = GAME_CONFIG.newObjects.laserTurret.fireInterval;
    this.lastFire = 0;
    this.age = 0;
    this.lifetime = GAME_CONFIG.events.laserTurrets.lifetime;
    this.isTracking = false;
    this.targetAngle = this.rotation;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Turret base
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = GAME_CONFIG.newObjects.laserTurret.color;
    ctx.shadowColor = GAME_CONFIG.newObjects.laserTurret.color;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Turret barrel
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-3, -this.barrelLength, 6, this.barrelLength);
    ctx.fillStyle = "#d32f2f";
    ctx.fill();

    // Barrel tip glow
    if (this.age - this.lastFire < 10) {
      ctx.beginPath();
      ctx.arc(0, -this.barrelLength, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffeb3b";
      ctx.shadowColor = "#ffeb3b";
      ctx.shadowBlur = 15;
      ctx.fill();
    }

    ctx.restore();

    // Draw tracking range when tracking
    if (this.isTracking) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.trackingRange, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff5722";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  update() {
    this.age++;

    // Smart targeting - can also target asteroids and missiles
    let targets = [
      { obj: player, priority: 3, type: "player" },
      ...asteroids.map((a) => ({
        obj: a,
        priority: 1,
        type: "asteroid",
      })),
      ...missiles.map((m) => ({ obj: m, priority: 2, type: "missile" })),
    ];

    // Find closest high-priority target
    let bestTarget = null;
    let bestScore = -1;

    targets.forEach((target) => {
      const dist = Math.hypot(
        this.x - target.obj.x,
        this.y - target.obj.y
      );
      if (dist < this.trackingRange) {
        const score = target.priority / (dist / 100); // Priority/distance ratio
        if (score > bestScore) {
          bestScore = score;
          bestTarget = target;
        }
      }
    });

    this.isTracking = bestTarget !== null;

    if (this.isTracking) {
      // Track best target
      this.targetAngle =
        Math.atan2(bestTarget.obj.y - this.y, bestTarget.obj.x - this.x) -
        Math.PI / 2;

      // Smooth rotation towards target
      let angleDiff = this.targetAngle - this.rotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.rotation += angleDiff * 0.15;

      // Fire laser with different rates based on target
      const fireRate =
        bestTarget.type === "player"
          ? this.fireInterval
          : this.fireInterval * 1.5;
      if (this.age - this.lastFire >= fireRate) {
        this.fireLaser(bestTarget.type);
        this.lastFire = this.age;
      }
    } else {
      // Idle rotation but also scan for threats
      this.rotation += this.rotationSpeed;
    }

    // Interact with freeze zones - malfunction when frozen
    freezeZones.forEach((freeze) => {
      const dist = Math.hypot(this.x - freeze.x, this.y - freeze.y);
      if (dist < freeze.radius + this.radius) {
        // Turret malfunctions when frozen
        this.fireInterval *= 1.05; // Slower firing
        this.rotationSpeed *= 0.98; // Slower rotation

        // Create ice buildup effect
        if (Math.random() < 0.02) {
          particles.push(
            new Particle(
              this.x + (Math.random() - 0.5) * 20,
              this.y + (Math.random() - 0.5) * 20,
              0,
              0,
              "#81d4fa"
            )
          );
        }
      }
    });

    this.draw();
    return this.age < this.lifetime;
  }

  fireLaser(targetType = "player") {
    const laserEndX =
      this.x + Math.cos(this.rotation + Math.PI / 2) * 1000;
    const laserEndY =
      this.y + Math.sin(this.rotation + Math.PI / 2) * 1000;

    // Create laser beam visual effect
    for (let i = 0; i < 5; i++) {
      particles.push(
        new Particle(
          this.x +
            Math.cos(this.rotation + Math.PI / 2) * this.barrelLength,
          this.y +
            Math.sin(this.rotation + Math.PI / 2) * this.barrelLength,
          Math.cos(this.rotation + Math.PI / 2) * (5 + i),
          Math.sin(this.rotation + Math.PI / 2) * (5 + i),
          "#ff5722"
        )
      );
    }

    playSound("laser");

    const laserHitRadius = 8;

    // Check collision with player (only if targeting player)
    if (targetType === "player") {
      const distToPlayer = this.distanceToLine(
        player.x,
        player.y,
        this.x,
        this.y,
        laserEndX,
        laserEndY
      );
      if (distToPlayer < laserHitRadius + player.radius) {
        if (!player.shieldProtected) {
          endGame("laser turret");
        }
      }
    }

    // Check collision with asteroids - destroy them
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      const distToAsteroid = this.distanceToLine(
        asteroid.x,
        asteroid.y,
        this.x,
        this.y,
        laserEndX,
        laserEndY
      );
      if (distToAsteroid < laserHitRadius + asteroid.radius) {
        // Destroy asteroid
        score += 20;

        // Create fragments
        for (let j = 0; j < 4; j++) {
          const angle = Math.random() * Math.PI * 2;
          fragments.push(
            new Fragment(
              asteroid.x + Math.cos(angle) * 8,
              asteroid.y + Math.sin(angle) * 8,
              Math.cos(angle) * 3,
              Math.sin(angle) * 3
            )
          );
        }

        asteroids.splice(i, 1);
        break;
      }
    }

    // Check collision with missiles - destroy them
    for (let i = missiles.length - 1; i >= 0; i--) {
      const missile = missiles[i];
      const distToMissile = this.distanceToLine(
        missile.x,
        missile.y,
        this.x,
        this.y,
        laserEndX,
        laserEndY
      );
      if (distToMissile < laserHitRadius + missile.radius) {
        missiles[i].explode();
        missiles.splice(i, 1);
        score += 15;
        break;
      }
    }
  }

  distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class LightningStorm {
  constructor() {
    this.age = 0;
    this.lifetime = 600; // 10 seconds
    this.gates = [];
    this.lightningBolts = [];
    this.speedBoostActive = false;
    this.speedBoostTimer = 0;

    // Create 2 lightning gates
    for (let i = 0; i < 2; i++) {
      this.gates.push({
        x: (canvas.width / 3) * (i + 1),
        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
        radius: 40,
        charge: 0,
        maxCharge: 120, // 2 seconds to charge
        particles: [],
      });
    }
  }

  draw() {
    // Draw gates
    this.gates.forEach((gate) => {
      ctx.save();
      ctx.translate(gate.x, gate.y);

      const chargeRatio = gate.charge / gate.maxCharge;

      // Gate ring
      ctx.beginPath();
      ctx.arc(0, 0, gate.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgb(${255 * chargeRatio}, ${
        255 * chargeRatio
      }, 255)`;
      ctx.lineWidth = 4;
      ctx.shadowColor = "#88ddff";
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Charging energy
      if (gate.charge > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, gate.radius * 0.7, 0, Math.PI * 2 * chargeRatio);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      // Gate particles
      gate.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#88ddff";
        ctx.fill();
        ctx.restore();
      });
    });

    // Draw lightning bolts
    this.lightningBolts.forEach((bolt) => {
      if (bolt.alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = bolt.alpha;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#88ddff";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(bolt.startX, bolt.startY);

      // Create jagged lightning path
      for (let i = 0; i < bolt.segments.length; i++) {
        ctx.lineTo(bolt.segments[i].x, bolt.segments[i].y);
      }

      ctx.stroke();
      ctx.restore();
    });
  }

  update() {
    this.age++;

    // Update gates
    this.gates.forEach((gate) => {
      gate.charge++;
      if (gate.charge > gate.maxCharge) {
        gate.charge = 0;
        this.createLightningBolt();
      }

      // Add gate particles
      if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const distance =
          gate.radius * 0.5 + Math.random() * gate.radius * 0.5;
        gate.particles.push({
          x: gate.x + Math.cos(angle) * distance,
          y: gate.y + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          alpha: 1,
        });
      }

      // Update gate particles
      gate.particles = gate.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.05;
        return p.alpha > 0;
      });
    });

    // Update lightning bolts
    this.lightningBolts = this.lightningBolts.filter((bolt) => {
      bolt.alpha -= 0.1;
      return bolt.alpha > 0;
    });

    // Check player collision with lightning
    this.checkPlayerCollision();

    // Update speed boost
    if (this.speedBoostActive) {
      this.speedBoostTimer--;
      if (this.speedBoostTimer <= 0) {
        this.speedBoostActive = false;
        globalSpeedMultiplier /= 0.8; // Remove speed effect
        // Thunder shield expiration is handled by the player class
      }
    }

    this.draw();
    return this.age < this.lifetime;
  }

  createLightningBolt() {
    if (this.gates.length < 2) return;

    const gate1 = this.gates[0];
    const gate2 = this.gates[1];

    // Create lightning segments
    const segments = [];
    const segmentCount = 12;
    const deltaX = (gate2.x - gate1.x) / segmentCount;
    const deltaY = (gate2.y - gate1.y) / segmentCount;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = gate1.x + deltaX * i;
      const baseY = gate1.y + deltaY * i;
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 60;

      segments.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
      });
    }

    this.lightningBolts.push({
      startX: gate1.x,
      startY: gate1.y,
      endX: gate2.x,
      endY: gate2.y,
      segments: segments,
      alpha: 1,
      width: 8,
    });

    playSound("laser", 0.7);
  }

  checkPlayerCollision() {
    this.lightningBolts.forEach((bolt) => {
      if (bolt.alpha <= 0.5) return; // Only check for fresh bolts

      // Check if player is near the lightning path
      for (let i = 0; i < bolt.segments.length - 1; i++) {
        const seg1 =
          i === 0
            ? { x: bolt.startX, y: bolt.startY }
            : bolt.segments[i - 1];
        const seg2 = bolt.segments[i];

        const dist = this.distanceToLineSegment(
          player.x,
          player.y,
          seg1.x,
          seg1.y,
          seg2.x,
          seg2.y
        );

        if (dist < 25) {
          // Lightning collision radius
          this.activateSpeedBoost();
          return;
        }
      }
    });
  }

  distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);

    if (length === 0) return Math.hypot(px - x1, py - y1);

    const t = Math.max(
      0,
      Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length))
    );
    const projection = {
      x: x1 + t * dx,
      y: y1 + t * dy,
    };

    return Math.hypot(px - projection.x, py - projection.y);
  }

  activateSpeedBoost() {
    if (this.speedBoostActive) return; // Already active

    this.speedBoostActive = true;
    this.speedBoostTimer = 600; // 10 seconds

    // Activate thunder shield instead of just speed boost
    player.activateThunderShield();

    // We still slow down everything else slightly
    globalSpeedMultiplier *= 0.8;
  }
}

class MagneticStorm {
  constructor() {
    this.age = 0;
    this.lifetime = 480; // 8 seconds
    this.intensity = 0;
    this.maxIntensity = 1.2;
    this.pulseTimer = 0;
    this.magneticFields = [];
    this.electricArcs = [];
    this.chargedAsteroids = new Set(); // Track charged asteroids
    this.lightningTimer = 0;

    // Create magnetic field centers
    for (let i = 0; i < 4; i++) {
      this.magneticFields.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        strength: 0.5 + Math.random() * 0.8,
        radius: 100 + Math.random() * 80,
        polarity: Math.random() > 0.5 ? 1 : -1, // Attract or repel
        rotation: Math.random() * Math.PI * 2,
      });
    }
  }

  draw() {
    ctx.save();

    // Draw magnetic field effects
    this.magneticFields.forEach((field, index) => {
      const alpha = this.intensity * 0.4;
      ctx.globalAlpha = alpha;

      // Field visualization
      ctx.translate(field.x, field.y);
      ctx.rotate(field.rotation);

      // Draw field lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startRadius = field.radius * 0.3;
        const endRadius = field.radius;

        ctx.beginPath();
        ctx.moveTo(
          Math.cos(angle) * startRadius,
          Math.sin(angle) * startRadius
        );

        // Curved field lines
        const controlRadius = field.radius * 0.7;
        const controlAngle = angle + (field.polarity > 0 ? 0.3 : -0.3);
        ctx.quadraticCurveTo(
          Math.cos(controlAngle) * controlRadius,
          Math.sin(controlAngle) * controlRadius,
          Math.cos(angle) * endRadius,
          Math.sin(angle) * endRadius
        );

        ctx.strokeStyle = field.polarity > 0 ? "#00ff88" : "#ff4444";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Central core
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = field.polarity > 0 ? "#00ff88" : "#ff4444";
      ctx.fill();

      ctx.resetTransform();
    });

    // Draw electric arcs
    this.electricArcs.forEach((arc) => {
      ctx.globalAlpha = arc.alpha;
      ctx.beginPath();
      ctx.moveTo(arc.startX, arc.startY);

      // Draw lightning using segments if they exist
      if (arc.segments) {
        // Draw each segment of the lightning
        for (const segment of arc.segments) {
          ctx.lineTo(segment.x, segment.y);
        }
        // Connect to the end point
        ctx.lineTo(arc.endX, arc.endY);
      } else {
        // Legacy code for old arcs without segments
        let currentX = arc.startX;
        let currentY = arc.startY;
        const segments = 8;
        const deltaX = (arc.endX - arc.startX) / segments;
        const deltaY = (arc.endY - arc.startY) / segments;

        for (let i = 1; i <= segments; i++) {
          const nextX =
            arc.startX + deltaX * i + (Math.random() - 0.5) * 30;
          const nextY =
            arc.startY + deltaY * i + (Math.random() - 0.5) * 30;
          ctx.lineTo(nextX, nextY);
          currentX = nextX;
          currentY = nextY;
        }
      }

      // Lethal lightning is brighter and more intense
      if (arc.lethal) {
        ctx.strokeStyle = "#ffff00"; // Bright yellow for lethal lightning
        ctx.lineWidth = 5;
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 15;
      } else {
        ctx.strokeStyle = "#88ddff"; // Normal blue for regular arcs
        ctx.lineWidth = 3;
        ctx.shadowColor = "#88ddff";
        ctx.shadowBlur = 10;
      }

      ctx.stroke();
    });

    ctx.restore();
  }

  update() {
    this.age++;
    this.pulseTimer += 0.1;
    this.lightningTimer++;

    // Intensity ramps up and down
    if (this.age < 60) {
      this.intensity = (this.age / 60) * this.maxIntensity;
    } else if (this.age > this.lifetime - 60) {
      this.intensity =
        ((this.lifetime - this.age) / 60) * this.maxIntensity;
    } else {
      this.intensity =
        this.maxIntensity * (0.8 + Math.sin(this.pulseTimer) * 0.2);
    }

    // Update magnetic fields
    this.magneticFields.forEach((field) => {
      field.rotation += 0.02;
    });

    // Generate electric arcs randomly between magnetic fields
    if (Math.random() < 0.1) {
      const field1 =
        this.magneticFields[
          Math.floor(Math.random() * this.magneticFields.length)
        ];
      const field2 =
        this.magneticFields[
          Math.floor(Math.random() * this.magneticFields.length)
        ];

      if (field1 !== field2) {
        this.electricArcs.push({
          startX: field1.x,
          startY: field1.y,
          endX: field2.x,
          endY: field2.y,
          alpha: 1,
          lifetime: 10,
          segments: this.createLightningSegments(
            field1.x,
            field1.y,
            field2.x,
            field2.y
          ),
        });
      }
    }

    // Generate lethal lightning between charged asteroids and player
    if (this.lightningTimer >= 30 && this.chargedAsteroids.size > 0) {
      // Every half second
      this.lightningTimer = 0;

      // Find the closest charged asteroid to the player
      let closestAsteroid = null;
      let closestDistance = Infinity;

      this.chargedAsteroids.forEach((asteroidId) => {
        const asteroid = asteroids.find((a) => a.id === asteroidId);
        if (asteroid) {
          const dist = Math.hypot(
            player.x - asteroid.x,
            player.y - asteroid.y
          );
          if (dist < closestDistance && dist < 300) {
            // Only target within range
            closestDistance = dist;
            closestAsteroid = asteroid;
          }
        }
      });

      // Create lightning bolt to player if asteroid is found and close enough
      if (closestAsteroid && closestDistance < 300) {
        this.electricArcs.push({
          startX: closestAsteroid.x,
          startY: closestAsteroid.y,
          endX: player.x,
          endY: player.y,
          alpha: 1,
          lifetime: 10,
          lethal: true, // This lightning can kill the player
          segments: this.createLightningSegments(
            closestAsteroid.x,
            closestAsteroid.y,
            player.x,
            player.y
          ),
        });

        // Play lightning sound
        playSound("laser", 0.5);
      }
    }

    // Update electric arcs
    this.electricArcs = this.electricArcs.filter((arc) => {
      arc.alpha -= 0.1;

      // Check if lethal lightning is hitting player
      if (arc.lethal && arc.alpha > 0.7) {
        // Only fresh bolts can kill
        this.checkPlayerLightningCollision(arc);
      }

      return arc.alpha > 0;
    });

    // Apply magnetic forces to objects
    this.applyMagneticForces();

    this.draw();
    return this.age < this.lifetime;
  }

  createLightningSegments(startX, startY, endX, endY) {
    const segments = [];
    const segmentCount = 8;
    const deltaX = (endX - startX) / segmentCount;
    const deltaY = (endY - startY) / segmentCount;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = startX + deltaX * i;
      const baseY = startY + deltaY * i;
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;

      segments.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
      });
    }

    return segments;
  }

  checkPlayerLightningCollision(bolt) {
    if (!player.shieldActive) {
      // Lightning can be blocked by shield
      // Calculate distance from player to each segment
      let playerHit = false;

      // Check if player is near the lightning path
      const start = { x: bolt.startX, y: bolt.startY };

      // Check each segment
      for (let i = 0; i < bolt.segments.length; i++) {
        const seg1 = i === 0 ? start : bolt.segments[i - 1];
        const seg2 = bolt.segments[i];

        const dist = this.distanceToLineSegment(
          player.x,
          player.y,
          seg1.x,
          seg1.y,
          seg2.x,
          seg2.y
        );

        if (dist < player.radius + 10) {
          // 10px buffer for lightning thickness
          playerHit = true;
          break;
        }
      }

      // Check last segment to end point
      if (!playerHit) {
        const lastSeg = bolt.segments[bolt.segments.length - 1];
        const dist = this.distanceToLineSegment(
          player.x,
          player.y,
          lastSeg.x,
          lastSeg.y,
          bolt.endX,
          bolt.endY
        );

        if (dist < player.radius + 10) {
          playerHit = true;
        }
      }

      if (playerHit) {
        endGame("lightning strike");
      }
    }
  }

  distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);

    if (length === 0) return Math.hypot(px - x1, py - y1);

    const t = Math.max(
      0,
      Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length))
    );
    const projection = {
      x: x1 + t * dx,
      y: y1 + t * dy,
    };

    return Math.hypot(px - projection.x, py - projection.y);
  }

  applyMagneticForces() {
    const objects = [player, ...asteroids, ...missiles, ...fragments];

    objects.forEach((obj) => {
      if (
        !obj ||
        !obj.velocity ||
        typeof obj.velocity !== "object" ||
        typeof obj.velocity.x !== "number" ||
        typeof obj.velocity.y !== "number"
      )
        return;

      // Check if object is in a magnetic field
      let isInMagneticField = false;

      this.magneticFields.forEach((field) => {
        const dx = obj.x - field.x;
        const dy = obj.y - field.y;
        const distance = Math.hypot(dx, dy);

        if (distance < field.radius && distance > 0) {
          isInMagneticField = true;
          const force =
            (field.strength *
              this.intensity *
              (field.radius - distance)) /
            field.radius;
          const forceX = (dx / distance) * force * field.polarity;
          const forceY = (dy / distance) * force * field.polarity;

          // Apply magnetic force
          if (obj === player) {
            // Affect player movement more subtly
            obj.velocity.x += forceX * 0.3;
            obj.velocity.y += forceY * 0.3;
          } else {
            // Affect other objects more dramatically
            obj.velocity.x += forceX * 0.5;
            obj.velocity.y += forceY * 0.5;
          }

          // Metallic objects (missiles) are affected more
          if (obj.constructor.name === "Missile") {
            obj.velocity.x += forceX * 0.3;
            obj.velocity.y += forceY * 0.3;
          }
        }
      });

      // Charge asteroids when they are in a magnetic field
      if (obj.constructor.name === "Asteroid" && isInMagneticField) {
        // Ensure asteroid has an ID
        if (!obj.id) {
          obj.id = Math.random().toString(36).substr(2, 9);
        }

        // Add to charged asteroids set
        this.chargedAsteroids.add(obj.id);

        // Add visual indicator that asteroid is charged
        if (!obj.charged) {
          obj.charged = true;
          obj.chargeColor = "#88ddff"; // Electric blue color
        }
      }
    });
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

class SuperNova {
  constructor(x, y) {
    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = 10;
    this.maxRadius = 300;
    this.expansionSpeed = 8;
    this.age = 0;
    this.lifetime = 120; // 2 seconds
    this.intensity = 1;
    this.lastClearRadius = 0; // Keep track of last cleared radius
    this.createFragmentsOnClear = false;
  }

  draw() {
    ctx.save();

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);

    // Outer shockwave ring
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffeb3b";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Inner core explosion
    ctx.globalAlpha = alpha * 0.6;
    const coreGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 0.5
    );
    coreGradient.addColorStop(0, "#fff");
    coreGradient.addColorStop(0.4, "#ffeb3b");
    coreGradient.addColorStop(0.8, "#ff9800");
    coreGradient.addColorStop(1, "rgba(255, 152, 0, 0)");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Outer glow
    ctx.globalAlpha = alpha * 0.3;
    const glowGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius * 0.8,
      this.x,
      this.y,
      this.radius * 1.5
    );
    glowGradient.addColorStop(0, "rgba(255, 235, 59, 0.3)");
    glowGradient.addColorStop(1, "rgba(255, 235, 59, 0)");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    ctx.restore();
  }

  update() {
    this.age++;

    // Expand the supernova
    if (this.radius < this.maxRadius) {
      this.radius += this.expansionSpeed;

      // Clear objects continuously as the shockwave expands
      this.clearObjects();

      // Add explosive particles for visual effect
      if (this.age % 2 === 0) {
        const particleCount = 4 + Math.floor(this.radius / 30); // Thêm nhiều hạt hơn khi supernova mở rộng
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          // Tạo hạt ở vòng sóng mở rộng
          const dist = this.radius - 20 + Math.random() * 40;
          const colors = ["#ffeb3b", "#ff9800", "#ff5722", "#ffffff"]; // Nhiều màu sắc hơn
          particles.push(
            new Particle(
              this.x + Math.cos(angle) * dist,
              this.y + Math.sin(angle) * dist,
              Math.random() * 3 + 1,
              colors[Math.floor(Math.random() * colors.length)],
              {
                x: Math.cos(angle) * (3 + Math.random() * 2),
                y: Math.sin(angle) * (3 + Math.random() * 2),
              }
            )
          );
        }
      }
    }

    // Add screen shake effect while expanding - tăng cường độ khi mở rộng
    if (this.age % 10 === 0 && this.radius < this.maxRadius) {
      const intensity = 0.3 + (this.radius / this.maxRadius) * 0.5;
      triggerScreenShake(intensity);
    }

    this.draw();
    return this.age < this.lifetime;
  }

  clearObjects() {
    // Only clear objects in the expanding ring (between lastClearRadius and current radius)
    const innerRadius = this.lastClearRadius;
    const outerRadius = this.radius;

    // Check if player is caught in the supernova's expanding shockwave
    const playerDist = Math.hypot(player.x - this.x, player.y - this.y);
    if (
      playerDist < outerRadius &&
      playerDist >= innerRadius &&
      !player.shieldActive
    ) {
      // Player is caught in the supernova explosion
      endGame("supernova explosion");
      return; // Stop processing if game over
    }

    // Update last clear radius for next frame
    this.lastClearRadius = this.radius;

    // Clear asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        // Create explosion particles
        for (let j = 0; j < 8; j++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push(
            new Particle(
              asteroid.x + Math.cos(angle) * 5,
              asteroid.y + Math.sin(angle) * 5,
              Math.cos(angle) * 6,
              Math.sin(angle) * 6,
              "#ffbb33"
            )
          );
        }

        // Create fragments if enabled
        if (this.createFragmentsOnClear) {
          const fragmentCount = 4 + Math.floor(asteroid.radius / 8);
          for (let k = 0; k < fragmentCount; k++) {
            const angle =
              (k / fragmentCount) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 4 + Math.random() * 6;
            const velocity = {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed,
            };
            fragments.push(
              new Fragment(asteroid.x, asteroid.y, velocity)
            );
          }
        }

        asteroids.splice(i, 1);
        score += 10; // Bonus for clearing
      }
    }

    // Clear missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
      const missile = missiles[i];
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        missiles[i].explode();
        missiles.splice(i, 1);
      }
    }

    // Clear fragments
    for (let i = fragments.length - 1; i >= 0; i--) {
      const fragment = fragments[i];
      const dist = Math.hypot(fragment.x - this.x, fragment.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        fragments.splice(i, 1);
      }
    }

    // Clear lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
      const laser = lasers[i];
      const laserMidX = (laser.startX + laser.endX) / 2;
      const laserMidY = (laser.startY + laser.endY) / 2;
      const dist = Math.hypot(laserMidX - this.x, laserMidY - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        lasers.splice(i, 1);
      }
    }

    // Clear laser mines
    for (let i = laserMines.length - 1; i >= 0; i--) {
      const mine = laserMines[i];
      const dist = Math.hypot(mine.x - this.x, mine.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        laserMines.splice(i, 1);
      }
    }

    // Clear other objects
    for (let i = energyOrbs.length - 1; i >= 0; i--) {
      const orb = energyOrbs[i];
      const dist = Math.hypot(orb.x - this.x, orb.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        energyOrbs.splice(i, 1);
      }
    }

    for (let i = plasmaFields.length - 1; i >= 0; i--) {
      const plasma = plasmaFields[i];
      const dist = Math.hypot(plasma.x - this.x, plasma.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        plasmaFields.splice(i, 1);
      }
    }

    for (let i = crystalShards.length - 1; i >= 0; i--) {
      const crystal = crystalShards[i];
      const dist = Math.hypot(crystal.x - this.x, crystal.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        crystalShards.splice(i, 1);
      }
    }

    for (let i = quantumPortals.length - 1; i >= 0; i--) {
      const portal = quantumPortals[i];
      const dist = Math.hypot(portal.x - this.x, portal.y - this.y);
      if (dist < outerRadius && dist >= innerRadius) {
        quantumPortals.splice(i, 1);
      }
    }

    // Black holes are NOT cleared by supernova
    if (outerRadius > innerRadius) {
      // Chỉ phát ra âm thanh và hiệu ứng khi thực sự có vật thể bị xóa
      playSound("explosion");
      triggerScreenShake(0.4);

      // Thêm hiệu ứng hạt khi vòng sóng mở rộng
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist =
          innerRadius + (outerRadius - innerRadius) * Math.random();
        particles.push(
          new Particle(
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            Math.random() * 3 + 1,
            "#ffbb33",
            {
              x: Math.cos(angle) * 3,
              y: Math.sin(angle) * 3,
            }
          )
        );
      }
    }
  }
}

class Star {
  constructor(x, y, radius, layer) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.layer = layer;
    this.velocity = 0.2 + layer * 0.5;
    this.alpha = 0.5 + layer * 0.5;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
  }
  update() {
    this.y += this.velocity * globalSpeedMultiplier;
    if (this.y - this.radius > height) {
      this.y = 0 - this.radius;
      this.x = Math.random() * width;
    }
    this.draw();
  }
}
class Laser {
  constructor(targetPlayer = false) {
    this.targetPlayer = targetPlayer;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      this.x = 0;
      this.y = Math.random() * height;
    } else if (edge === 1) {
      this.x = width;
      this.y = Math.random() * height;
    } else if (edge === 2) {
      this.x = Math.random() * width;
      this.y = 0;
    } else {
      this.x = Math.random() * width;
      this.y = height;
    }

    if (this.targetPlayer && player) {
      // Aim at player's position
      this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    } else {
      // Random angle
      this.angle = Math.random() * Math.PI * 2;
    }

    this.timer = 0;
    this.maxTime = GAME_CONFIG.lasers.warningTime;
    this.fired = false;
  }
  drawWarning() {
    ctx.save();
    ctx.globalAlpha = this.timer / this.maxTime;
    ctx.beginPath();
    const len = width + height;
    ctx.moveTo(
      this.x - Math.cos(this.angle) * len,
      this.y - Math.sin(this.angle) * len
    );
    ctx.lineTo(
      this.x + Math.cos(this.angle) * len,
      this.y + Math.sin(this.angle) * len
    );
    ctx.strokeStyle = "var(--danger-color)";
    ctx.lineWidth = 4;
    ctx.shadowColor = "var(--danger-color)";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();
  }
  drawBeam() {
    ctx.save();
    ctx.beginPath();
    const len = width + height;
    ctx.moveTo(
      this.x - Math.cos(this.angle) * len,
      this.y - Math.sin(this.angle) * len
    );
    ctx.lineTo(
      this.x + Math.cos(this.angle) * len,
      this.y + Math.sin(this.angle) * len
    );
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 15;
    ctx.shadowColor = "var(--danger-color)";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.restore();
  }
  update() {
    this.timer++;
    if (this.timer < this.maxTime) {
      this.drawWarning();
    } else {
      if (!this.fired) {
        triggerScreenShake(GAME_CONFIG.visual.screenShake.laserIntensity);
        this.fired = true;
      }
      this.drawBeam();
    }
  }
}
class BlackHole {
  constructor(x, y, isTemporary = false) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.blackHoles.baseRadius;
    const difficultyLevel = Math.floor(score / 3000);

    // Random variations for unpredictability
    const sizeVariation = 0.7 + Math.random() * 0.6; // 70%-130%
    const strengthVariation = 0.8 + Math.random() * 0.4; // 80%-120%

    this.gravityRadius =
      (GAME_CONFIG.blackHoles.baseGravityRadius +
        difficultyLevel *
          GAME_CONFIG.blackHoles.gravityRadiusIncreasePerLevel) *
      sizeVariation;
    this.strength =
      (GAME_CONFIG.blackHoles.baseStrength +
        difficultyLevel *
          GAME_CONFIG.blackHoles.strengthIncreasePerLevel) *
      strengthVariation;
    this.maxRadius =
      (GAME_CONFIG.blackHoles.baseMaxRadius +
        difficultyLevel * GAME_CONFIG.blackHoles.radiusIncreasePerLevel) *
      sizeVariation;
    this.growthRate =
      (GAME_CONFIG.blackHoles.baseGrowthRate +
        difficultyLevel *
          GAME_CONFIG.blackHoles.growthRateIncreasePerLevel) *
      (0.5 + Math.random());
    this.alpha = 0;
    this.isTemporary = isTemporary;
    this.life = GAME_CONFIG.blackHoles.temporaryLifetime;
    this.state = "growing"; // growing, fading
    this.particles = Array(50)
      .fill(null)
      .map(() => ({
        angle: Math.random() * Math.PI * 2,
        radius: this.radius + 5 + Math.random() * 20,
        speed: 0.01 + Math.random() * 0.02,
        size: Math.random() * 1.5,
      }));
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    this.particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(
        p.radius * Math.cos(p.angle),
        p.radius * Math.sin(p.angle),
        p.size,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(170, 102, 204, ${
        0.8 * (1 - p.radius / this.gravityRadius)
      })`;
      ctx.fill();
    });
    // Draw gravity field indicator
    ctx.beginPath();
    ctx.arc(0, 0, this.gravityRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(170, 102, 204, ${0.1 * this.alpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Black hole core
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();
  }
  update() {
    if (this.isTemporary) {
      this.life--;
      if (this.life <= 0) this.state = "fading";
    }
    if (this.state === "growing") {
      if (this.alpha < 1) this.alpha += 0.01;
      if (this.radius < this.maxRadius && !this.isTemporary) {
        this.radius += this.growthRate;
        this.gravityRadius += this.growthRate * 4;
      } else if (!this.isTemporary) {
        this.state = "fading";
      }
    } else {
      // fading
      this.alpha -= 0.01;
    }

    this.particles.forEach((p) => {
      p.angle += p.speed;
      if (p.radius > this.radius + 5) p.radius -= 0.1;
    });

    [player, ...asteroids, ...missiles, ...fragments].forEach((obj) => {
      if (
        !obj ||
        !obj.velocity ||
        typeof obj.velocity !== "object" ||
        typeof obj.velocity.x !== "number" ||
        typeof obj.velocity.y !== "number"
      )
        return;
      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
      if (dist < this.gravityRadius && dist > 0) {
        const angle = Math.atan2(this.y - obj.y, this.x - obj.x);
        const falloff = 1 - dist / this.gravityRadius;

        // Stronger effect on player for dramatic gameplay
        let forceMultiplier =
          obj === player
            ? GAME_CONFIG.blackHoles.playerForceMultiplier
            : 1;

        // Distance-based intensity for realistic feel
        const force = falloff * this.strength * forceMultiplier;

        obj.velocity.x += Math.cos(angle) * force;
        obj.velocity.y += Math.sin(angle) * force;

        // Visual feedback for player when in gravity field
        if (
          obj === player &&
          dist <
            this.gravityRadius * GAME_CONFIG.blackHoles.shakeThreshold
        ) {
          triggerScreenShake(GAME_CONFIG.blackHoles.shakeIntensity);
        }
      }
    });
    this.draw();
  }
}
class Missile {
  constructor() {
    // Diverse spawn patterns for missiles
    const spawnPattern = Math.random();
    if (spawnPattern < 0.4) {
      // Side spawn (40%)
      this.fromLeft = Math.random() > 0.5;
      this.x = this.fromLeft ? -20 : width + 20;
      this.y = Math.random() * height;
      this.angle = this.fromLeft ? 0 : Math.PI;
    } else if (spawnPattern < 0.7) {
      // Top/Bottom spawn (30%)
      this.fromTop = Math.random() > 0.5;
      this.x = Math.random() * width;
      this.y = this.fromTop ? -20 : height + 20;
      this.angle = this.fromTop ? Math.PI / 2 : -Math.PI / 2;
      this.fromLeft = false; // For trail purposes
    } else if (spawnPattern < 0.85) {
      // Corner spawn (15%)
      this.x = Math.random() < 0.5 ? -20 : width + 20;
      this.y = Math.random() < 0.5 ? -20 : height + 20;
      this.angle = Math.atan2(height / 2 - this.y, width / 2 - this.x);
      this.fromLeft = this.x < 0;
    } else {
      // Random edge spawn (15%)
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: // Top
          this.x = Math.random() * width;
          this.y = -20;
          this.angle = Math.PI / 2;
          break;
        case 1: // Right
          this.x = width + 20;
          this.y = Math.random() * height;
          this.angle = Math.PI;
          break;
        case 2: // Bottom
          this.x = Math.random() * width;
          this.y = height + 20;
          this.angle = -Math.PI / 2;
          break;
        case 3: // Left
          this.x = -20;
          this.y = Math.random() * height;
          this.angle = 0;
          break;
      }
      this.fromLeft = this.x < width / 2;
    }
    this.radius = GAME_CONFIG.missiles.radius;
    const difficultyLevel = Math.floor(score / 3000);
    this.speed =
      (GAME_CONFIG.missiles.baseSpeed +
        difficultyLevel * GAME_CONFIG.missiles.speedIncreasePerLevel) *
      globalSpeedMultiplier;
    this.turnSpeed =
      GAME_CONFIG.missiles.baseTurnSpeed +
      difficultyLevel * GAME_CONFIG.missiles.turnSpeedIncreasePerLevel;
    this.trail = [];
    this.lifeTimer = 0;
    this.hasSpedUp = false;
    this.isDead = false;
    this.velocity = { x: 0, y: 0 };
  }
  draw() {
    this.trail.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 143, 177, ${p.a})`;
      ctx.fill();
    });
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    // Vẽ thân rocket
    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 2.5);
    ctx.lineTo(this.radius * 0.8, this.radius * 0.5);
    ctx.lineTo(this.radius * 0.4, this.radius * 1.2);
    ctx.lineTo(-this.radius * 0.4, this.radius * 1.2);
    ctx.lineTo(-this.radius * 0.8, this.radius * 0.5);
    ctx.closePath();

    // Gradient màu thân
    const gradient = ctx.createLinearGradient(
      0,
      -this.radius * 2.5,
      0,
      this.radius * 1.2
    );
    gradient.addColorStop(0, "#ff6b9d");
    gradient.addColorStop(0.6, "#f48fb1");
    gradient.addColorStop(1, "#f8bbd9");

    ctx.fillStyle = gradient;
    ctx.shadowColor = "#ff6b9d";
    ctx.shadowBlur = 15;
    ctx.fill();

    // Vẽ đường viền
    ctx.strokeStyle = "#ff1744";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vẽ flame đuôi rocket
    if (this.lifeTimer > 5) {
      const flameLength = this.radius * (1.5 + Math.random() * 0.8);
      const flameWidth = this.radius * 0.6;

      ctx.beginPath();
      ctx.moveTo(-flameWidth, this.radius * 1.2);
      ctx.lineTo(0, this.radius * 1.2 + flameLength);
      ctx.lineTo(flameWidth, this.radius * 1.2);
      ctx.closePath();

      const flameGradient = ctx.createLinearGradient(
        0,
        this.radius * 1.2,
        0,
        this.radius * 1.2 + flameLength
      );
      flameGradient.addColorStop(0, "#ff9800");
      flameGradient.addColorStop(0.5, "#f44336");
      flameGradient.addColorStop(1, "rgba(255, 87, 34, 0.3)");

      ctx.fillStyle = flameGradient;
      ctx.fill();
    }

    ctx.restore();
  }
  update() {
    this.lifeTimer++;
    if (
      !this.hasSpedUp &&
      this.lifeTimer > GAME_CONFIG.missiles.speedUpTime
    ) {
      this.speed *= GAME_CONFIG.missiles.speedUpMultiplier;
      this.turnSpeed *= GAME_CONFIG.missiles.turnSpeedUpMultiplier;
      this.hasSpedUp = true;
      playSound("missile"); // Play sound when speeding up
    }
    if (this.lifeTimer > GAME_CONFIG.missiles.lifetime) {
      this.explode();
      return;
    }

    const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
    let angleDiff = targetAngle - this.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.angle += angleDiff * this.turnSpeed;
    this.velocity.x += Math.cos(this.angle) * this.speed;
    this.velocity.y += Math.sin(this.angle) * this.speed;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= GAME_CONFIG.missiles.velocity.friction;
    this.velocity.y *= GAME_CONFIG.missiles.velocity.friction;

    this.trail.push({ x: this.x, y: this.y, r: this.radius / 2, a: 1 });
    this.trail.forEach((p) => {
      p.a -= 0.05;
      p.r -= 0.05;
    });
    this.trail = this.trail.filter((p) => p.a > 0);
    this.draw();
  }
  explode(isImpact = false) {
    this.isDead = true;
    const fragmentCount = isImpact
      ? GAME_CONFIG.missiles.fragmentCountOnImpact
      : GAME_CONFIG.missiles.fragmentCount;
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (i / fragmentCount) * Math.PI * 2;
      const fragmentSpeed = 3 + Math.random() * 4;
      const vel = {
        x: Math.cos(angle) * fragmentSpeed,
        y: Math.sin(angle) * fragmentSpeed,
      };

      // Create missile fragments (now non-lethal, just visual effect)
      const missileFragment = new MissileFragment(this.x, this.y, vel);
      // Still mark as lethal for visual effects, but they won't kill player
      missileFragment.lethal = true;
      fragments.push(missileFragment);

      // Create visual effect particles
      for (let j = 0; j < 3; j++) {
        particles.push(
          new Particle(
            this.x + Math.cos(angle) * 5,
            this.y + Math.sin(angle) * 5,
            Math.cos(angle) * 6,
            Math.sin(angle) * 6,
            "#ff6b9d"
          )
        );
      }
    }

    // Play explosion sound
    playSound("explosion");
  }
}
class LaserMine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.laserMines.radius;
    this.timer = 0;
    this.maxTime = GAME_CONFIG.laserMines.chargeTime;
    this.fireDuration = GAME_CONFIG.laserMines.fireDuration;
    this.state = "charging";
    this.alpha = 0;
    this.pattern =
      GAME_CONFIG.laserMines.patterns[
        Math.floor(Math.random() * GAME_CONFIG.laserMines.patterns.length)
      ];
    this.warningShown = false;
  }

  getFireAngles() {
    switch (this.pattern) {
      case "cross":
        return [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      case "diagonal":
        return [
          Math.PI / 4,
          (3 * Math.PI) / 4,
          (5 * Math.PI) / 4,
          (7 * Math.PI) / 4,
        ];
      case "star":
        const angles = [];
        for (let i = 0; i < 8; i++) {
          angles.push((i * Math.PI) / 4);
        }
        return angles;
      case "random":
        const randomAngles = [];
        const count = Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          randomAngles.push(Math.random() * Math.PI * 2);
        }
        return randomAngles;
      default:
        return [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    }
  }

  drawWarningBeams() {
    if (this.state !== "charging" || this.timer < 30) return;

    ctx.save();
    ctx.globalAlpha = GAME_CONFIG.laserMines.warningOpacity;
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const angles = this.getFireAngles();
    angles.forEach((angle) => {
      const endX = this.x + Math.cos(angle) * 1000;
      const endY = this.y + Math.sin(angle) * 1000;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    ctx.setLineDash([]);
    ctx.restore();
  }

  draw() {
    if (this.state === "fading") return;

    this.drawWarningBeams();

    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.state === "charging") {
      // Vẽ LaserMine tĩnh, không xoay
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4444";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 15;
      ctx.fill();

      // Pattern indicator
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "#ffff00";
      ctx.font = "12px Exo 2";
      ctx.textAlign = "center";
      ctx.fillText(
        this.pattern.toUpperCase(),
        this.x,
        this.y - this.radius - 10
      );
    } else if (this.state === "firing") {
      const angles = this.getFireAngles();
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 20;

      angles.forEach((angle) => {
        const length = 1500;
        const beamWidth = GAME_CONFIG.laserMines.beamWidth;
        const endX = this.x + Math.cos(angle) * length;
        const endY = this.y + Math.sin(angle) * length;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.fillRect(0, -beamWidth / 2, length, beamWidth);
        ctx.restore();
      });
    }
    ctx.restore();
  }

  update() {
    if (this.alpha < 1 && this.state !== "fading") this.alpha += 0.02;
    this.timer++;

    if (
      this.state === "charging" &&
      this.timer === 60 &&
      !this.warningShown
    ) {
      playSound("laserMine");
      this.warningShown = true;
    }

    if (this.state === "charging" && this.timer > this.maxTime) {
      this.state = "firing";
      this.timer = 0;
      triggerScreenShake(GAME_CONFIG.visual.screenShake.mineIntensity);
    }
    if (this.state === "firing" && this.timer > this.fireDuration) {
      this.state = "fading";
    }
    this.draw();
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

