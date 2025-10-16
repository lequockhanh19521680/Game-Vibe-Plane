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
          const nextX = arc.startX + deltaX * i + (Math.random() - 0.5) * 30;
          const nextY = arc.startY + deltaY * i + (Math.random() - 0.5) * 30;
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
      this.intensity = ((this.lifetime - this.age) / 60) * this.maxIntensity;
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
          const dist = Math.hypot(player.x - asteroid.x, player.y - asteroid.y);
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
            (field.strength * this.intensity * (field.radius - distance)) /
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

