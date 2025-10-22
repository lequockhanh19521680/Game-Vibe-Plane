// Hazard entities - environmental dangers

// NEW: Decoy Power-up Class
class DecoyPowerUp {
  constructor(x, y) {
    this.config = GAME_CONFIG.newObjects.decoyPowerUp;
    this.x = x;
    this.y = y;
    this.size = this.config.size + Math.random() * 4;
    this.velocity = {
      x: (Math.random() - 0.5) * 1.5,
      y: (Math.random() - 0.5) * 1.5,
    };
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.lifetime = this.config.lifetime;
    this.age = 0;
    this.sparkleTimer = Math.random() * 60;
    this.triggered = false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    ctx.globalAlpha = alpha * 0.9;

    // Outer glow effect (menacing red)
    const glowRadius = this.size * 2 + Math.sin(this.sparkleTimer * 0.1) * 3;
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glowGradient.addColorStop(0, `rgba(255, 68, 68, ${alpha * 0.4})`);
    glowGradient.addColorStop(1, "rgba(255, 68, 68, 0)");
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Main body (looks like a crystal shard)
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size * 0.9, this.size * 0.2);
    ctx.lineTo(-this.size * 0.3, this.size);
    ctx.lineTo(-this.size * 0.9, this.size * 0.2);
    ctx.closePath();
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.strokeStyle = "#ff8a8a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (this.triggered) return false;

    this.age++;
    this.sparkleTimer++;
    this.rotation += this.rotationSpeed;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Bounce off walls
    const wallDamping = 0.5;
    if (this.x < this.size || this.x > canvas.width - this.size) {
      this.velocity.x *= -wallDamping;
    }
    if (this.y < this.size || this.y > canvas.height - this.size) {
      this.velocity.y *= -wallDamping;
    }

    // Check if player is nearby
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.config.triggerRadius) {
      this.explode();
      return false; // Remove from array
    }

    this.draw();
    return this.age < this.lifetime;
  }

  explode() {
    this.triggered = true;
    playSound("trap");

    // Visual explosion
    for (let i = 0; i < this.config.explosionParticles; i++) {
      particles.push(
        new Particle(
          this.x,
          this.y,
          Math.random() * 3,
          GAME_CONFIG.visual.colors.danger,
          {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8,
          }
        )
      );
    }

    // Spawn small, fast asteroids as a trap
    for (let i = 0; i < this.config.asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      asteroids.push(
        new Asteroid(
          this.x,
          this.y,
          Math.random() * 10 + 5,
          GAME_CONFIG.visual.colors.danger,
          {
            x: Math.cos(angle) * this.config.asteroidSpeed,
            y: Math.sin(angle) * this.config.asteroidSpeed,
          }
        )
      );
    }
  }
}

class PlasmaField {
  constructor(x, y) {
    this.config = GAME_CONFIG.newObjects.plasmaField || {};

    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = this.config.radius || 80 + Math.random() * 40;
    this.particles = [];
    this.lifetime = this.config.lifetime || 400;
    this.age = 0;
    this.rotation = 0;
    this.damageRate = this.config.damageRate || 0.02; // New config field for damage rate
    this.color = this.config.color || "#ff6b35";

    // Create particles
    for (let i = 0; i < (this.config.particleCount || 15); i++) {
      this.particles.push({
        angle: (i / 15) * Math.PI * 2,
        distance:
          (this.config.particleMinDist || 20) +
          Math.random() * (this.config.particleMaxDist || 40),
        speed:
          (this.config.particleMinSpeed || 0.02) +
          Math.random() * (this.config.particleMaxSpeed || 0.03),
        size:
          (this.config.particleMinSize || 2) +
          Math.random() * (this.config.particleMaxSize || 3),
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
    ctx.strokeStyle = this.color;
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
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    });

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += this.config.rotationSpeed || 0.02;

    this.particles.forEach((p) => {
      p.angle += p.speed;
      p.distance +=
        Math.sin(this.age * (this.config.distancePulseSpeed || 0.05)) *
        (this.config.distancePulseAmount || 0.5);
    });

    // Push away nearby missiles and fragments
    const pushRadius = this.radius * (this.config.pushRadiusMultiplier || 1.5);
    const pushForce = this.config.pushForce || 0.05;

    // SỬA ĐỔI: Thêm logic đẩy thiên thạch
    const objectsToPush = [...asteroids, ...missiles, ...fragments];
    objectsToPush.forEach((obj) => {
      if (!obj || !obj.velocity) return;
      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
      if (dist < pushRadius && dist > 0) {
        let forceMultiplier = 1;
        if (obj instanceof Fragment) {
          forceMultiplier = this.config.fragmentPushMultiplier || 1.6;
        }
        const force =
          (pushForce * forceMultiplier * (pushRadius - dist)) / pushRadius;
        const angle = Math.atan2(obj.y - this.y, obj.x - this.x);
        obj.velocity.x += Math.cos(angle) * force;
        obj.velocity.y += Math.sin(angle) * force;
      }
    });

    this.draw();
    return this.age < this.lifetime;
  }
}

class FreezeZone {
  constructor(x, y) {
    this.config = GAME_CONFIG.newObjects.freezeZone;
    this.x = x;
    this.y = y;
    this.radius = this.config.radius;
    this.effectStrength = this.config.effectStrength;
    this.particleCount = this.config.particleCount;
    this.particles = [];
    this.age = 0;
    this.lifetime = this.config.duration;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.color = this.config.color;

    // Create ice particles
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * this.radius,
        size: 1 + Math.random() * 3,
        speed:
          (this.config.particleMinSpeed || 0.01) +
          Math.random() * (this.config.particleMaxSpeed || 0.02),
      });
    }
  }

  draw() {
    ctx.save();

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    const pulse =
      Math.sin(this.age * this.config.pulseSpeed + this.pulsePhase) * 0.3 + 0.7;

    ctx.globalAlpha = alpha * 0.6;

    // Freeze zone boundary
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4; // FIXED CONSTANT
    ctx.setLineDash([8, 4]); // FIXED CONSTANT
    ctx.stroke();
    ctx.setLineDash([]);

    // Freeze zone fill
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}20`; // FIXED CONSTANT
    ctx.fill();

    // Ice particles
    this.particles.forEach((p) => {
      const x = this.x + Math.cos(p.angle) * p.distance;
      const y = this.y + Math.sin(p.angle) * p.distance;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 5; // FIXED CONSTANT
      ctx.fill();
    });

    ctx.restore();
  }

  update() {
    this.age++;

    // Update particles
    this.particles.forEach((p) => {
      p.angle += p.speed;
      p.distance += Math.sin(this.age * 0.02) * 0.5; // FIXED CONSTANTS
    });

    // Apply freeze effect to nearby entities
    const freezeDistance = this.radius;
    const freezeChance = this.config.freezeChance || 0.005;
    const missileFreezeChance = this.config.missileFreezeChance || 0.01;
    const fullFreezeFactor = this.config.fullFreezeFactor || 0.1;

    // Slow down asteroids in range and create ice crystals
    asteroids.forEach((asteroid) => {
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);
      if (dist < freezeDistance) {
        asteroid.velocity.x *= this.effectStrength;
        asteroid.velocity.y *= this.effectStrength;

        // Chance to freeze asteroid completely
        if (Math.random() < freezeChance) {
          asteroid.velocity.x *= fullFreezeFactor;
          asteroid.velocity.y *= fullFreezeFactor;

          // Create ice crystal around asteroid
          crystalShards.push(
            new CrystalShard(
              asteroid.x + (Math.random() - 0.5) * 20, // FIXED CONSTANT
              asteroid.y + (Math.random() - 0.5) * 20 // FIXED CONSTANT
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
        if (Math.random() < missileFreezeChance) {
          missile.velocity.x = 0;
          missile.velocity.y = 0;
          missile.turnSpeed *= fullFreezeFactor;
        }
      }
    });

    // Interaction effects (kept as FIXED CONSTANTS for visual effects)

    this.draw();
    return this.age < this.lifetime;
  }
}

class LightningStorm {
  constructor() {
    // SỬ DỤNG CONFIG: newObjects.lightningStorm
    this.config = GAME_CONFIG.newObjects.lightningStorm || {};
    this.age = 0;
    this.lifetime = this.config.lifetime || 600;
    this.gates = [];
    this.lightningBolts = [];
    this.speedBoostActive = false;
    this.speedBoostTimer = 0;
    this.lightningInterval = this.config.lightningInterval || 120; // 2 seconds
    this.lightningJitter = this.config.lightningJitter || 60; // Jitter distance

    // Create 2 lightning gates
    for (let i = 0; i < (this.config.gateCount || 2); i++) {
      // FIXED CONSTANT
      this.gates.push({
        x: (canvas.width / 3) * (i + 1),
        y:
          canvas.height / 2 +
          (Math.random() - 0.5) * (this.config.gatePlacementRange || 200),
        radius: this.config.gateRadius || 40,
        charge: 0,
        maxCharge: this.config.gateChargeTime || 120,
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
      const chargeColor = this.config.chargeColor || "#88ddff";

      // Gate ring
      ctx.beginPath();
      ctx.arc(0, 0, gate.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgb(${255 * chargeRatio}, ${255 * chargeRatio}, 255)`; // FIXED CONSTANT color calculation
      ctx.lineWidth = 4; // FIXED CONSTANT
      ctx.shadowColor = chargeColor;
      ctx.shadowBlur = 15; // FIXED CONSTANT
      ctx.stroke();

      // Charging energy
      if (gate.charge > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, gate.radius * 0.7, 0, Math.PI * 2 * chargeRatio); // FIXED CONSTANT
        ctx.strokeStyle = "#ffffff"; // FIXED CONSTANT
        ctx.lineWidth = 2; // FIXED CONSTANT
        ctx.stroke();
      }

      ctx.restore();

      // Gate particles
      gate.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = chargeColor;
        ctx.fill();
        ctx.restore();
      });
    });

    // Draw lightning bolts
    this.lightningBolts.forEach((bolt) => {
      if (bolt.alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = bolt.alpha;
      ctx.strokeStyle = "#ffffff"; // FIXED CONSTANT
      ctx.lineWidth = 4; // FIXED CONSTANT
      ctx.shadowColor = this.config.boltColor || "#88ddff";
      ctx.shadowBlur = 20; // FIXED CONSTANT

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
      if (Math.random() < (this.config.particleSpawnChance || 0.3)) {
        const angle = Math.random() * Math.PI * 2;
        const distance = gate.radius * 0.5 + Math.random() * gate.radius * 0.5; // FIXED CONSTANTS
        gate.particles.push({
          x: gate.x + Math.cos(angle) * distance,
          y: gate.y + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 2, // FIXED CONSTANT
          vy: (Math.random() - 0.5) * 2, // FIXED CONSTANT
          size: Math.random() * 3 + 1, // FIXED CONSTANT
          alpha: 1,
        });
      }

      // Update gate particles
      gate.particles = gate.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.05; // FIXED CONSTANT
        return p.alpha > 0;
      });
    });

    // Update lightning bolts
    this.lightningBolts = this.lightningBolts.filter((bolt) => {
      bolt.alpha -= this.config.boltFadeSpeed || 0.1;
      return bolt.alpha > 0;
    });

    // Check player collision with lightning
    this.checkPlayerCollision();

    // Update speed boost
    if (this.speedBoostActive) {
      this.speedBoostTimer--;
      if (this.speedBoostTimer <= 0) {
        this.speedBoostActive = false;
        globalSpeedMultiplier /= this.config.speedBoostMultiplier || 0.8;
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
    const segmentCount = this.config.segmentCount || 12;
    const deltaX = (gate2.x - gate1.x) / segmentCount;
    const deltaY = (gate2.y - gate1.y) / segmentCount;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = gate1.x + deltaX * i;
      const baseY = gate1.y + deltaY * i;
      const offsetX = (Math.random() - 0.5) * this.lightningJitter;
      const offsetY = (Math.random() - 0.5) * this.lightningJitter;

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
      width: 8, // FIXED CONSTANT
    });

    playSound("laser", 0.7); // FIXED CONSTANT
  }

  checkPlayerCollision() {
    this.lightningBolts.forEach((bolt) => {
      if (bolt.alpha <= 0.5) return; // FIXED CONSTANT

      // Check if player is near the lightning path
      for (let i = 0; i < bolt.segments.length - 1; i++) {
        const seg1 =
          i === 0 ? { x: bolt.startX, y: bolt.startY } : bolt.segments[i - 1];
        const seg2 = bolt.segments[i];

        const dist = this.distanceToLineSegment(
          player.x,
          player.y,
          seg1.x,
          seg1.y,
          seg2.x,
          seg2.y
        );

        if (dist < (this.config.hitRadius || 25)) {
          this.activateSpeedBoost();
          return;
        }
      }
    });
  }

  distanceToLineSegment(px, py, x1, y1, x2, y2) {
    // ... (logic giữ nguyên)
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
    if (this.speedBoostActive) return;

    this.speedBoostActive = true;
    this.speedBoostTimer = this.config.boostDuration || 600;

    // Activate thunder shield instead of just speed boost
    player.activateThunderShield();

    // We still slow down everything else slightly
    globalSpeedMultiplier *= this.config.speedBoostMultiplier || 0.8;
  }
}
