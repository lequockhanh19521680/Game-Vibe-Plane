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

