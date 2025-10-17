// VoidRift - Portal that consumes objects and spits them out elsewhere

class VoidRift {
  constructor(x, y, pairedRift) {
    const config = GAME_CONFIG.newObjects.voidRift;

    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.radius = config.radius;
    this.pullRadius = config.pullRadius;
    this.pullStrength = config.pullStrength;
    this.teleportChance = config.teleportChance;
    this.lifetime = config.lifetime;
    this.age = 0;
    this.color = config.color;
    this.edgeColor = config.edgeColor;
    this.rotationSpeed = config.rotationSpeed;
    this.rotation = 0;

    // Paired rift for teleportation (optional)
    this.pairedRift = pairedRift;
    if (pairedRift) {
      pairedRift.pairedRift = this;
    }

    // Objects that have recently teleported (to prevent loops)
    this.recentlyTeleported = new Set();

    // Void particles
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * this.radius * 2,
        speed: 0.05 + Math.random() * 0.1,
        size: 1 + Math.random() * 2,
        spiralSpeed: 0.02 + Math.random() * 0.02,
      });
    }
  }

  draw() {
    ctx.save();

    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);

    // Draw OUTER GLOW (THÊM MỚI - để dễ nhìn thấy)
    ctx.globalAlpha = alpha * 0.4;
    const outerGlow = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius,
      this.x,
      this.y,
      this.radius * 2.5
    );
    outerGlow.addColorStop(0, this.edgeColor);
    outerGlow.addColorStop(1, "transparent");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw pull radius (faint but visible)
    ctx.globalAlpha = alpha * 0.25; // TĂNG opacity
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.pullRadius, 0, Math.PI * 2);
    ctx.strokeStyle = this.edgeColor;
    ctx.lineWidth = 2; // TĂNG độ dày
    ctx.setLineDash([10, 10]); // Dashes dài hơn
    ctx.shadowColor = this.edgeColor;
    ctx.shadowBlur = 15; // THÊM shadow
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw void center (dark but visible)
    ctx.globalAlpha = alpha * 0.9;
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, this.edgeColor);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw rotating edge
    ctx.globalAlpha = alpha * 0.8;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = Math.cos(angle) * this.radius;
      const y1 = Math.sin(angle) * this.radius;
      const x2 = Math.cos(angle) * this.radius * 1.2;
      const y2 = Math.sin(angle) * this.radius * 1.2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = this.edgeColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.edgeColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    ctx.restore();

    // Draw spiraling particles
    ctx.globalAlpha = alpha;
    this.particles.forEach((p) => {
      const x = this.x + Math.cos(p.angle) * p.distance;
      const y = this.y + Math.sin(p.angle) * p.distance;

      const particleAlpha = 1 - p.distance / (this.radius * 2);
      ctx.globalAlpha = alpha * particleAlpha;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = this.edgeColor;
      ctx.fill();
    });

    // Draw connection to paired rift
    if (this.pairedRift && this.age % 60 < 30) {
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.pairedRift.x, this.pairedRift.y);
      ctx.strokeStyle = this.edgeColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += this.rotationSpeed;

    // Update particles (spiral inward)
    this.particles.forEach((p) => {
      p.angle += p.spiralSpeed;
      p.distance -= p.speed;

      // Reset particles that reach center
      if (p.distance < 0) {
        p.distance = this.radius * 2;
        p.angle = Math.random() * Math.PI * 2;
      }
    });

    // Clear old teleported objects
    if (this.age % 60 === 0) {
      this.recentlyTeleported.clear();
    }

    // Pull and potentially teleport objects
    this.affectObjects(asteroids);
    this.affectObjects(missiles);
    this.affectObjects(fragments);

    // Pull player
    if (player && !player.shieldActive && !player.thunderShieldActive) {
      this.pullObject(player, true);
    }

    return this.age >= this.lifetime;
  }

  affectObjects(objectArray) {
    objectArray.forEach((obj) => {
      if (!this.recentlyTeleported.has(obj)) {
        this.pullObject(obj, false);
      }
    });
  }

  pullObject(obj, isPlayer) {
    const dist = Math.hypot(obj.x - this.x, obj.y - this.y);

    // Pull objects within pull radius
    if (dist < this.pullRadius && dist > 0) {
      const pullForce = this.pullStrength * (1 - dist / this.pullRadius);
      const angle = Math.atan2(this.y - obj.y, this.x - obj.x);

      if (obj.velocity) {
        obj.velocity.x += Math.cos(angle) * pullForce;
        obj.velocity.y += Math.sin(angle) * pullForce;
      } else if (isPlayer) {
        // Direct position manipulation for player
        obj.x += Math.cos(angle) * pullForce * 2;
        obj.y += Math.sin(angle) * pullForce * 2;
      }

      // Teleport if object gets too close
      if (dist < this.radius) {
        this.teleportObject(obj, isPlayer);
      }
    }
  }

  teleportObject(obj, isPlayer) {
    // Check if we should teleport
    if (Math.random() > this.teleportChance) {
      return;
    }

    // Mark as recently teleported
    this.recentlyTeleported.add(obj);

    let targetX, targetY;

    if (this.pairedRift) {
      // Teleport to paired rift
      const exitAngle = Math.random() * Math.PI * 2;
      const exitDistance = this.pairedRift.radius + 20;
      targetX = this.pairedRift.x + Math.cos(exitAngle) * exitDistance;
      targetY = this.pairedRift.y + Math.sin(exitAngle) * exitDistance;

      // Mark in paired rift too
      this.pairedRift.recentlyTeleported.add(obj);
    } else {
      // Random teleport location
      targetX = Math.random() * canvas.width;
      targetY = Math.random() * canvas.height;
    }

    // Teleport effect
    this.createTeleportEffect(obj.x, obj.y);

    // Update position
    obj.x = targetX;
    obj.y = targetY;

    // Create arrival effect
    this.createTeleportEffect(targetX, targetY);

    // Give teleported objects a slight random velocity boost
    if (obj.velocity) {
      const boostAngle = Math.random() * Math.PI * 2;
      const boostForce = 2;
      obj.velocity.x += Math.cos(boostAngle) * boostForce;
      obj.velocity.y += Math.sin(boostAngle) * boostForce;
    }

    // Play sound
    if (typeof playSound === "function") {
      playSound("wormhole", 0.5);
    }

    // End game if player teleported without shield
    if (isPlayer && typeof endGame === "function" && Math.random() < 0.3) {
      // 30% chance player doesn't survive teleportation
      endGame();
    }
  }

  createTeleportEffect(x, y) {
    // Create particle burst
    if (typeof particles !== "undefined") {
      for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        particles.push(
          new Particle(x, y, 2 + Math.random() * 2, this.edgeColor, {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          })
        );
      }
    }
  }
}
