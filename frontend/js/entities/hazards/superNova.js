class SuperNova {
  constructor(x, y) {
    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = 10;
    this.maxRadius = 300;
    this.expansionSpeed = 11; // Faster expansion for more impact
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
    // Only allow one explosion per SuperNova
    if (
      !this.hasExploded &&
      this.radius + this.expansionSpeed >= this.maxRadius
    ) {
      this.radius = this.maxRadius;
      this.clearObjects();
      this.hasExploded = true;
    } else if (this.radius < this.maxRadius) {
      this.radius += this.expansionSpeed;
      this.clearObjects();
      // Add explosive particles for visual effect
      if (this.age % 2 === 0) {
        const particleCount = 4 + Math.floor(this.radius / 30);
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = this.radius - 20 + Math.random() * 40;
          const colors = ["#ffeb3b", "#ff9800", "#ff5722", "#ffffff"];
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
    // Add screen shake effect while expanding
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
    if (playerDist < outerRadius && playerDist >= innerRadius) {
      if (player.shieldActive) {
        // Player có khiên thường, vẫn bảo vệ được
        player.shieldHit(); // Hiệu ứng khiên bị tấn công
        playSound("shield-hit", 1.0);
      } else if (player.thunderShieldActive) {
        // Player có khiên thunder, kích hoạt phản đòn sóng xung kích điện
        player.triggerThunderCounterShockwave();

        // Xóa siêu tân tinh vì đã bị phản đòn
        superNovas = superNovas.filter((sn) => sn !== this);

        // Tiếp tục xử lý các vật thể khác
        return;
      } else {
        // Player không có bảo vệ gì, kết thúc trò chơi
        endGame("supernova explosion");
        return; // Stop processing if game over
      }
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
            fragments.push(new Fragment(asteroid.x, asteroid.y, velocity));
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
        const dist = innerRadius + (outerRadius - innerRadius) * Math.random();
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
