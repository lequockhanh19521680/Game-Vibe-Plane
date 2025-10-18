// Hazard entities - environmental dangers

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

    missiles.forEach((missile) => {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < pushRadius && dist > 0) {
        const force = (pushForce * (pushRadius - dist)) / pushRadius;
        const angle = Math.atan2(missile.y - this.y, missile.x - this.x);
        missile.velocity.x += Math.cos(angle) * force;
        missile.velocity.y += Math.sin(angle) * force;
      }
    });

    fragments.forEach((fragment) => {
      const dist = Math.hypot(fragment.x - this.x, fragment.y - this.y);
      if (dist < pushRadius && dist > 0) {
        const fragmentPushMultiplier =
          this.config.fragmentPushMultiplier || 1.6;
        const force =
          (pushForce * fragmentPushMultiplier * (pushRadius - dist)) /
          pushRadius;
        const angle = Math.atan2(fragment.y - this.y, fragment.x - this.x);
        fragment.velocity.x += Math.cos(angle) * force;
        fragment.velocity.y += Math.sin(angle) * force;
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

class LaserTurret {
  constructor(x, y) {
    this.config = GAME_CONFIG.newObjects.laserTurret;
    this.x = x;
    this.y = y;
    this.radius = this.config.radius;
    this.barrelLength = this.config.barrelLength;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = this.config.rotationSpeed;
    this.trackingRange = this.config.trackingRange;
    this.fireInterval = this.config.fireInterval;
    this.lastFire = 0;
    this.age = 0;
    this.lifetime = GAME_CONFIG.events.laserTurrets.lifetime;
    this.isTracking = false;
    this.targetAngle = this.rotation;
    this.color = this.config.color;
    this.laserColor = this.config.laserColor || "#ff5722";

    // Turret properties for freeze interaction
    this.originalFireInterval = this.fireInterval;
    this.originalRotationSpeed = this.rotationSpeed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Turret base
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10; // FIXED CONSTANT
    ctx.fill();

    // Turret barrel
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-3, -this.barrelLength, 6, this.barrelLength); // FIXED CONSTANTS
    ctx.fillStyle = this.config.barrelColor || "#d32f2f";
    ctx.fill();

    // Barrel tip glow
    if (this.age - this.lastFire < 10) {
      // FIXED CONSTANT
      ctx.beginPath();
      ctx.arc(0, -this.barrelLength, 4, 0, Math.PI * 2); // FIXED CONSTANT
      ctx.fillStyle = this.config.chargeColor || "#ffeb3b";
      ctx.shadowColor = this.config.chargeColor || "#ffeb3b";
      ctx.shadowBlur = 15; // FIXED CONSTANT
      ctx.fill();
    }

    ctx.restore();

    // Draw tracking range when tracking
    if (this.isTracking) {
      ctx.save();
      ctx.globalAlpha = 0.2; // FIXED CONSTANT
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.trackingRange, 0, Math.PI * 2);
      ctx.strokeStyle = this.laserColor;
      ctx.lineWidth = 2; // FIXED CONSTANT
      ctx.setLineDash([5, 5]); // FIXED CONSTANT
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  update() {
    this.age++;

    // Reset properties if not frozen
    if (this.fireInterval > this.originalFireInterval) {
      this.fireInterval *= 0.99; // FIXED CONSTANT
    }
    if (this.rotationSpeed < this.originalRotationSpeed) {
      this.rotationSpeed *= 1.02; // FIXED CONSTANT
    }

    // Smart targeting
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
    const maxPriorityDistance = this.config.maxPriorityDistance || 300; // FIXED CONSTANT

    targets.forEach((target) => {
      const dist = Math.hypot(this.x - target.obj.x, this.y - target.obj.y);
      if (dist < this.trackingRange) {
        const score = target.priority / (dist / maxPriorityDistance);
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
      this.rotation += angleDiff * 0.15; // FIXED CONSTANT (Rotation speed smoothing)

      // Fire laser with different rates based on target
      const fireRateMultiplier =
        bestTarget.type === "player"
          ? 1.0
          : this.config.nonPlayerTargetRateMultiplier || 1.5;

      const effectiveFireRate = this.fireInterval * fireRateMultiplier;

      if (this.age - this.lastFire >= effectiveFireRate) {
        this.fireLaser(bestTarget.type);
        this.lastFire = this.age;
      }
    } else {
      // Idle rotation
      this.rotation += this.rotationSpeed;
    }

    // Interaction with freeze zones
    freezeZones.forEach((freeze) => {
      const dist = Math.hypot(this.x - freeze.x, this.y - freeze.y);
      if (dist < freeze.radius + this.radius) {
        // Turret malfunctions when frozen
        this.fireInterval =
          this.originalFireInterval *
          (1 + (this.config.freezeSlowdownFactor || 0.05));
        this.rotationSpeed =
          this.originalRotationSpeed *
          (1 - (this.config.freezeSlowdownFactor || 0.02));
      }
    });

    this.draw();
    return this.age < this.lifetime;
  }

  fireLaser(targetType = "player") {
    // Laser properties
    const laserLength = this.config.laserLength || 1000;
    const laserHitRadius = this.config.laserHitRadius || 8;
    const asteroidScore = this.config.asteroidScore || 20;
    const missileScore = this.config.missileScore || 15;
    const laserParticleCount = this.config.laserParticleCount || 5; // FIXED CONSTANT

    const laserEndX =
      this.x + Math.cos(this.rotation + Math.PI / 2) * laserLength;
    const laserEndY =
      this.y + Math.sin(this.rotation + Math.PI / 2) * laserLength;

    // Create laser beam visual effect
    for (let i = 0; i < laserParticleCount; i++) {
      particles.push(
        new Particle(
          this.x + Math.cos(this.rotation + Math.PI / 2) * this.barrelLength,
          this.y + Math.sin(this.rotation + Math.PI / 2) * this.barrelLength,
          Math.cos(this.rotation + Math.PI / 2) * (5 + i), // FIXED CONSTANT
          Math.sin(this.rotation + Math.PI / 2) * (5 + i), // FIXED CONSTANT
          this.laserColor
        )
      );
    }

    playSound("laser");

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

    // Check collision with objects
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
        score += asteroidScore;

        // Create fragments
        for (let j = 0; j < 4; j++) {
          // FIXED CONSTANT
          const angle = Math.random() * Math.PI * 2;
          fragments.push(
            new Fragment(
              asteroid.x + Math.cos(angle) * 8, // FIXED CONSTANT
              asteroid.y + Math.sin(angle) * 8, // FIXED CONSTANT
              Math.cos(angle) * 3, // FIXED CONSTANT
              Math.sin(angle) * 3 // FIXED CONSTANT
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
        score += missileScore;
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

class MagneticStorm {
  constructor() {
    // SỬ DỤNG CONFIG: newObjects.magneticStorm
    this.config = GAME_CONFIG.newObjects.magneticStorm;
    this.age = 0;
    this.lifetime = this.config.lifetime;
    this.intensity = 0;
    this.maxIntensity = this.config.maxIntensity;
    this.pulseTimer = 0;
    this.magneticFields = [];
    this.electricArcs = [];
    this.chargedAsteroids = new Set(); // Track charged asteroids
    this.lightningTimer = 0;
    this.lightningInterval = this.config.lightningInterval || 30;

    // Create magnetic field centers
    for (let i = 0; i < this.config.fieldCount; i++) {
      this.magneticFields.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        strength:
          this.config.baseStrength +
          Math.random() * this.config.strengthVariation,
        radius:
          this.config.fieldRadius + Math.random() * this.config.radiusVariation,
        polarity: Math.random() > 0.5 ? 1 : -1, // Attract or repel
        rotation: Math.random() * Math.PI * 2,
      });
    }
  }

  draw() {
    ctx.save();

    // Draw magnetic field effects
    this.magneticFields.forEach((field, index) => {
      const alpha = this.intensity * 0.4; // FIXED CONSTANT
      ctx.globalAlpha = alpha;

      // Field visualization
      ctx.translate(field.x, field.y);
      ctx.rotate(field.rotation);

      const lineCount = this.config.lineCount || 8;

      // Draw field lines
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const startRadius = field.radius * 0.3; // FIXED CONSTANT
        const endRadius = field.radius;

        ctx.beginPath();
        ctx.moveTo(
          Math.cos(angle) * startRadius,
          Math.sin(angle) * startRadius
        );

        // Curved field lines
        const controlRadius = field.radius * 0.7; // FIXED CONSTANT
        const controlAngle = angle + (field.polarity > 0 ? 0.3 : -0.3); // FIXED CONSTANT
        ctx.quadraticCurveTo(
          Math.cos(controlAngle) * controlRadius,
          Math.sin(controlAngle) * controlRadius,
          Math.cos(angle) * endRadius,
          Math.sin(angle) * endRadius
        );

        ctx.strokeStyle =
          field.polarity > 0
            ? this.config.attractColor || "#00ff88"
            : this.config.repelColor || "#ff4444";
        ctx.lineWidth = 2; // FIXED CONSTANT
        ctx.stroke();
      }

      // Central core
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2); // FIXED CONSTANT
      ctx.fillStyle =
        field.polarity > 0
          ? this.config.attractColor || "#00ff88"
          : this.config.repelColor || "#ff4444";
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
        // Legacy code (should not happen after fix)
        let currentX = arc.startX;
        let currentY = arc.startY;
        const segments = 8;
        const deltaX = (arc.endX - arc.startX) / segments;
        const deltaY = (arc.endY - arc.startY) / segments;

        for (let i = 1; i <= segments; i++) {
          const nextX = arc.startX + deltaX * i + (Math.random() - 0.5) * 30;
          const nextY = arc.startY + deltaY * i + (Math.random() - 0.5) * 30;
          ctx.lineTo(nextX, nextY);
          currentX = nextX;
          currentY = nextY;
        }
      }

      // Lethal lightning is brighter and more intense
      if (arc.lethal) {
        ctx.strokeStyle = this.config.lethalBoltColor || "#ffff00";
        ctx.lineWidth = 5; // FIXED CONSTANT
        ctx.shadowColor = this.config.lethalBoltColor || "#ffff00";
        ctx.shadowBlur = 15; // FIXED CONSTANT
      } else {
        ctx.strokeStyle = this.config.arcColor || "#88ddff";
        ctx.lineWidth = 3; // FIXED CONSTANT
        ctx.shadowColor = this.config.arcColor || "#88ddff";
        ctx.shadowBlur = 10; // FIXED CONSTANT
      }

      ctx.stroke();
    });

    ctx.restore();
  }

  update() {
    this.age++;
    this.pulseTimer += 0.1; // FIXED CONSTANT
    this.lightningTimer++;

    // Intensity ramps up and down
    const rampDuration = this.config.rampDuration || 60;
    if (this.age < rampDuration) {
      this.intensity = (this.age / rampDuration) * this.maxIntensity;
    } else if (this.age > this.lifetime - rampDuration) {
      this.intensity =
        ((this.lifetime - this.age) / rampDuration) * this.maxIntensity;
    } else {
      this.intensity =
        this.maxIntensity *
        (this.config.pulseMinFactor ||
          0.8 +
            Math.sin(this.pulseTimer) * (this.config.pulseMaxFactor || 0.2));
    }

    // Update magnetic fields
    this.magneticFields.forEach((field) => {
      field.rotation += this.config.fieldRotationSpeed || 0.02;
    });

    // Generate electric arcs randomly between magnetic fields
    if (Math.random() < (this.config.arcSpawnChance || 0.1)) {
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
          lifetime: 10, // FIXED CONSTANT
          segments: this.createLightningSegments(
            field1.x,
            field1.y,
            field2.x,
            field2.y,
            this.config.arcJitter || 40
          ),
        });
      }
    }

    // Generate lethal lightning between charged asteroids and player
    if (
      this.lightningTimer >= this.lightningInterval &&
      this.chargedAsteroids.size > 0
    ) {
      this.lightningTimer = 0;
      const targetRange = this.config.lethalTargetRange || 300;

      // Find the closest charged asteroid to the player
      let closestAsteroid = null;
      let closestDistance = Infinity;

      this.chargedAsteroids.forEach((asteroidId) => {
        const asteroid = asteroids.find((a) => a.id === asteroidId);
        if (asteroid) {
          const dist = Math.hypot(player.x - asteroid.x, player.y - asteroid.y);
          if (dist < closestDistance && dist < targetRange) {
            // Only target within range
            closestDistance = dist;
            closestAsteroid = asteroid;
          }
        }
      });

      // Create lightning bolt to player if asteroid is found and close enough
      if (closestAsteroid && closestDistance < targetRange) {
        this.electricArcs.push({
          startX: closestAsteroid.x,
          startY: closestAsteroid.y,
          endX: player.x,
          endY: player.y,
          alpha: 1,
          lifetime: 10, // FIXED CONSTANT
          lethal: true,
          segments: this.createLightningSegments(
            closestAsteroid.x,
            closestAsteroid.y,
            player.x,
            player.y,
            this.config.lethalJitter || 40
          ),
        });

        // Play lightning sound
        playSound("laser", 0.5); // FIXED CONSTANT
      }
    }

    // Update electric arcs
    this.electricArcs = this.electricArcs.filter((arc) => {
      arc.alpha -= this.config.arcFadeSpeed || 0.1; // FIXED CONSTANT

      // Check if lethal lightning is hitting player
      if (arc.lethal && arc.alpha > 0.7) {
        // FIXED CONSTANT
        this.checkPlayerLightningCollision(arc);
      }

      return arc.alpha > 0;
    });

    // Apply magnetic forces to objects
    this.applyMagneticForces();

    this.draw();
    return this.age < this.lifetime;
  }

  createLightningSegments(startX, startY, endX, endY, jitter) {
    const segments = [];
    const segmentCount = this.config.segmentCount || 8; // FIXED CONSTANT
    const deltaX = (endX - startX) / segmentCount;
    const deltaY = (endY - startY) / segmentCount;

    for (let i = 1; i <= segmentCount; i++) {
      const baseX = startX + deltaX * i;
      const baseY = startY + deltaY * i;
      const offsetX = (Math.random() - 0.5) * jitter;
      const offsetY = (Math.random() - 0.5) * jitter;

      segments.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
      });
    }

    return segments;
  }

  checkPlayerLightningCollision(bolt) {
    if (!player.shieldActive) {
      let playerHit = false;
      const hitTolerance =
        player.radius + (this.config.lethalHitTolerance || 10); // FIXED CONSTANT

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

        if (dist < hitTolerance) {
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

        if (dist < hitTolerance) {
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
    const playerAffectMultiplier = this.config.playerAffectMultiplier;
    const objectAffectMultiplier = this.config.objectAffectMultiplier;
    const missileAffectMultiplier = this.config.missileAffectMultiplier || 0.3;
    const chargeColor = this.config.chargeColor || "#88ddff";

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
            (field.strength * this.intensity * (field.radius - distance)) /
            field.radius;
          const forceX = (dx / distance) * force * field.polarity;
          const forceY = (dy / distance) * force * field.polarity;

          // Apply magnetic force
          if (obj === player) {
            obj.velocity.x += forceX * playerAffectMultiplier;
            obj.velocity.y += forceY * playerAffectMultiplier;
          } else {
            // Apply base object multiplier
            obj.velocity.x += forceX * objectAffectMultiplier;
            obj.velocity.y += forceY * objectAffectMultiplier;
          }

          // Metallic objects (missiles) are affected more
          if (obj.constructor.name === "Missile") {
            obj.velocity.x += forceX * missileAffectMultiplier;
            obj.velocity.y += forceY * missileAffectMultiplier;
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
          obj.chargeColor = chargeColor; // Electric blue color
        }
      }
    });
  }
}
