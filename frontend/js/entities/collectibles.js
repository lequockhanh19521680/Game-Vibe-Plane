// Collectible entities - power-ups and bonuses

// Class EnergyOrb has been updated to use config from GAME_CONFIG.newObjects.energyOrb
class EnergyOrb {
  constructor(x, y) {
    // Get config from GAME_CONFIG
    const config = GAME_CONFIG.newObjects.energyOrb;

    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;

    // Use config.baseRadius (reduced)
    this.radius = config.baseRadius + Math.random();

    // Use config.baseVelocity (reduced)
    this.velocity = {
      x: (Math.random() - 0.5) * config.baseVelocity * 2,
      y: (Math.random() - 0.5) * config.baseVelocity * 2,
    };

    this.rotation = 0;
    this.rotationSpeed = config.rotationSpeed + Math.random() * 0.01;

    this.pulsePhase = Math.random() * Math.PI * 2;

    // Use config.minLifetime and config.maxLifetime (increased)
    this.lifetime =
      config.minLifetime +
      Math.random() * (config.maxLifetime - config.minLifetime);

    this.age = 0;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // NEW: Ramp-up effect for the first 30 frames
    const initialRampDuration = 30; // Ramp-up time: 30 frames (0.5 seconds)
    const initialScale = Math.min(1, this.age / initialRampDuration);

    // Reduced pulse/expansion speed from 0.1 to 0.04 for slower pulsing.
    const pulse = Math.sin(this.age * 0.04 + this.pulsePhase) * 0.3 + 1;

    // Apply initialScale so size starts from 0
    const currentRadius = this.radius * pulse * initialScale;

    // Outer glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius * 2);
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
    const config = GAME_CONFIG.newObjects.energyOrb;

    this.age++;
    this.rotation += this.rotationSpeed;
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // --- REPULSION LOGIC ---
    // EnergyOrb pushes away other objects like asteroids, missiles, and fragments.
    const repulsionRadius = this.radius * (config.repulsionRadiusFactor || 5);
    const repulsionForce = config.repulsionForce || 0.25;

    // Create a list of all objects that can be repelled
    const objectsToRepel = [player, ...asteroids, ...missiles, ...fragments];

    objectsToRepel.forEach((obj) => {
      // Ensure the object is valid, has velocity, and is not the orb itself
      if (!obj || !obj.velocity || obj === this) return;

      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);

      // Check if the object is within the repulsion radius
      if (dist < repulsionRadius && dist > 0) {
        // Calculate force based on distance (stronger when closer)
        const force =
          (repulsionForce * (repulsionRadius - dist)) / repulsionRadius;
        const angle = Math.atan2(obj.y - this.y, obj.x - this.x); // Angle from orb to object

        // Apply force to push the object away
        obj.velocity.x += Math.cos(angle) * force;
        obj.velocity.y += Math.sin(angle) * force;

        // Apply a smaller counter-force to the orb to make it react to the push
        this.velocity.x -= Math.cos(angle) * force * 0.1;
        this.velocity.y -= Math.sin(angle) * force * 0.1;
      }
    });
    // --- END REPULSION LOGIC ---

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

// Renamed from CrystalShard to ShieldCrystal and modified appearance/behavior
class ShieldCrystal {
  constructor(x, y) {
    const config = GAME_CONFIG.newObjects.shieldCrystal || {}; // Use new config section
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height * 0.7; // Spawn higher up
    this.size = config.size || 15; // Larger base size
    this.velocity = {
      x: (Math.random() - 0.5) * (config.driftSpeed || 0.5), // Slower drift
      y: (Math.random() - 0.5) * (config.driftSpeed || 0.5),
    };
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.03; // Slower rotation
    this.lifetime = config.lifetime || 1200; // Stays longer (e.g., 20 seconds)
    this.age = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.color = config.color || GAME_CONFIG.visual.colors.crystal || "#40c4ff";
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const alpha = Math.max(0, 1 - this.age / this.lifetime); // Fade out over lifetime
    ctx.globalAlpha = alpha;

    // Pulsing effect
    const pulse = Math.sin(this.age * 0.08 + this.pulsePhase) * 0.2 + 1; // Faster pulse
    const currentSize = this.size * pulse;

    // Outer glow effect
    const glowRadius = currentSize * 1.8;
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glowGradient.addColorStop(0, `${this.color}80`); // Brighter inner glow
    glowGradient.addColorStop(0.7, `${this.color}30`);
    glowGradient.addColorStop(1, `${this.color}00`);

    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Shield Icon Shape (Simplified)
    // Draw a simple shield shape or icon here
    ctx.beginPath();
    // Simple shield shape
    ctx.moveTo(0, -currentSize * 0.8);
    ctx.lineTo(currentSize * 0.7, -currentSize * 0.3);
    ctx.lineTo(currentSize * 0.7, currentSize * 0.5);
    ctx.arc(0, currentSize * 0.5, currentSize * 0.7, 0, Math.PI, false); // Bottom curve
    ctx.lineTo(-currentSize * 0.7, -currentSize * 0.3);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  update() {
    this.age++;
    this.rotation += this.rotationSpeed;

    // Slow drift
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Gentle wall bounce or wrap around
    const padding = this.size * 2;
    if (this.x < -padding) this.x = canvas.width + padding;
    if (this.x > canvas.width + padding) this.x = -padding;
    if (this.y < -padding) this.y = canvas.height + padding;
    if (this.y > canvas.height + padding) this.y = -padding;

    // Add slight random drift change
    this.velocity.x += (Math.random() - 0.5) * 0.02;
    this.velocity.y += (Math.random() - 0.5) * 0.02;
    // Clamp velocity
    const maxDrift = GAME_CONFIG.newObjects.shieldCrystal?.driftSpeed || 0.5;
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > maxDrift) {
      this.velocity.x = (this.velocity.x / speed) * maxDrift;
      this.velocity.y = (this.velocity.y / speed) * maxDrift;
    }

    this.draw();
    return this.age < this.lifetime; // Check lifetime
  }
}

class ShieldGenerator {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = GAME_CONFIG.newObjects.shieldGenerator.radius;
    this.shieldRadius = GAME_CONFIG.newObjects.shieldGenerator.shieldRadius;
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

      if (typeof showEventText === "function") {
        showEventText("Shield Generator Active!");
      }
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
              3, // radius
              "#4fc3f7", // color
              {
                // velocity
                x: Math.cos(deflectAngle) * 3,
                y: Math.sin(deflectAngle) * 3,
              }
            )
          );
        }
      });

      // Shield blocks asteroids
      asteroids.forEach((asteroid) => {
        if (!asteroid.isActive) return;
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
        player.shieldProtected = true; // This needs to be handled/reset in Player class or game loop
      } else {
        // If player moves out, potentially reset the protected flag
        // player.shieldProtected = false; // Add logic if needed
      }

      if (this.age >= this.activeTime) {
        if (typeof showEventText === "function") {
          showEventText("Shield Generator Depleted");
        }
        return false; // Remove generator
      }
    }

    this.draw();
    return true;
  }
}

class CrystalCluster {
  constructor(x, y) {
    // SỬA LỖI: Sử dụng đường dẫn config chính xác
    this.config = GAME_CONFIG.entities.crystalClusters;
    this.x = x;
    this.y = y;
    this.radius = this.config.radius;
    this.timer = 0;
    this.maxChargeTime = this.config.lifetime;
    this.state = "charging";
    this.dischargeRadius = 0;
    // YÊU CẦU 1: Giảm vận tốc mở rộng, mở rộng từ từ
    this.dischargeSpeed = 1.5; // Giảm từ 5 xuống 1.5
    this.alpha = 0;

    this.maxDischargeRadius = canvas ? Math.min(width, height) * 0.3 : 300;

    this.crystals = Array(this.config.crystalCount)
      .fill(null)
      .map(() => ({
        angle: Math.random() * Math.PI * 2,
        dist: this.radius + Math.random() * 10,
        size: 3 + Math.random() * 4,
      }));
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Chỉ vẽ lõi và các tinh thể quay quanh nếu chúng còn hiển thị
    if (this.alpha > 0) {
      ctx.globalAlpha = this.alpha;

      // Vẽ các tinh thể quay quanh
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

      // Vẽ lõi trung tâm
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.shadowColor = "var(--crystal-color)";
      ctx.shadowBlur = 20;
      ctx.fill();

      // Vẽ hào quang khi đang sạc
      if (this.state === "charging") {
        const chargeProgress = this.timer / this.maxChargeTime;
        const chargeAuraRadius = this.radius + chargeProgress * 30;
        ctx.beginPath();
        ctx.arc(0, 0, chargeAuraRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(64, 196, 255, ${0.5 * chargeProgress})`;
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }

    // Vẽ sóng xả năng lượng một cách riêng biệt
    if (this.state === "discharging") {
      const fadeAlpha = 1 - this.dischargeRadius / this.maxDischargeRadius;
      if (fadeAlpha > 0) {
        ctx.globalAlpha = Math.max(0, fadeAlpha);

        // Hào quang bên ngoài
        ctx.beginPath();
        ctx.arc(0, 0, this.dischargeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(64, 196, 255, ${Math.max(0, fadeAlpha) * 0.5})`;
        ctx.lineWidth = 20;
        ctx.shadowColor = "var(--crystal-color)";
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Đường sắc nét bên trong
        ctx.beginPath();
        ctx.arc(0, 0, this.dischargeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, fadeAlpha)})`;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
  update() {
    // Tăng độ mờ khi đang sạc
    if (this.alpha < 1 && this.state === "charging") {
      this.alpha += 0.02;
    }

    // Luôn xoay các tinh thể
    this.crystals.forEach((c) => (c.angle += this.config.rotationSpeed));
    this.timer++;

    if (this.state === "charging" && this.timer > this.maxChargeTime) {
      this.state = "discharging";
      this.timer = 0; // Đặt lại timer cho giai đoạn xả
      triggerScreenShake(0.3);
      playSound("crystalDischarge"); // Chơi âm thanh khi xả
    }

    if (this.state === "discharging") {
      this.dischargeRadius += this.dischargeSpeed;
      // Làm mờ lõi trung tâm
      this.alpha -= 0.02;

      // YÊU CẦU 2: Đẩy các vật thể khác ra khi chạm
      const waveWidth = 20; // Độ rộng của sóng va chạm
      const repulsionForce = 0.5; // Lực đẩy
      const objectsToRepel = [
        player,
        ...asteroids,
        ...missiles,
        ...fragments,
        ...laserMines,
        ...energyOrbs,
      ];

      objectsToRepel.forEach((obj) => {
        if (!obj || !obj.velocity || !obj.isActive) return; // Check isActive

        const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
        const objectRadius = obj.radius || obj.size / 2 || 10;

        // Kiểm tra va chạm với sóng năng lượng
        if (
          Math.abs(dist - this.dischargeRadius) <
          objectRadius + waveWidth / 2
        ) {
          const angle = Math.atan2(obj.y - this.y, obj.x - this.x);

          // Đẩy vật thể ra ngoài
          obj.velocity.x += Math.cos(angle) * repulsionForce;
          obj.velocity.y += Math.sin(angle) * repulsionForce;
        }
      });

      if (this.dischargeRadius > this.maxDischargeRadius) {
        return false;
      }
    }

    this.draw();

    return true;
  }
}
