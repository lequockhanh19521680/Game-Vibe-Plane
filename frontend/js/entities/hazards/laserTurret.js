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
      const dist = Math.hypot(this.x - target.obj.x, this.y - target.obj.y);
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
    const laserEndX = this.x + Math.cos(this.rotation + Math.PI / 2) * 1000;
    const laserEndY = this.y + Math.sin(this.rotation + Math.PI / 2) * 1000;

    // Create laser beam visual effect
    for (let i = 0; i < 5; i++) {
      particles.push(
        new Particle(
          this.x + Math.cos(this.rotation + Math.PI / 2) * this.barrelLength,
          this.y + Math.sin(this.rotation + Math.PI / 2) * this.barrelLength,
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

