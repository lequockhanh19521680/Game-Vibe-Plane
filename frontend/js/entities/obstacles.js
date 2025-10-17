// Obstacle entities - asteroids, lasers, black holes, missiles, laser mines

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
        this.x += this.velocity.x + Math.cos(this.timer * 0.1) * spiralRadius;
        this.y += this.velocity.y + Math.sin(this.timer * 0.1) * spiralRadius;
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
    this.beamFlicker = 1; // For flicker effect
  }
  drawWarning() {
    ctx.save();
    // Hiệu ứng nhấp nháy đơn giản và rõ ràng
    const alpha = Math.sin((this.timer / this.maxTime) * Math.PI) * 0.9;
    ctx.globalAlpha = alpha;

    const len = width + height;
    const endX = this.x + Math.cos(this.angle) * len;
    const endY = this.y + Math.sin(this.angle) * len;
    const startX = this.x - Math.cos(this.angle) * len;
    const startY = this.y - Math.sin(this.angle) * len;

    // Một đường nét đứt duy nhất sẽ sạch sẽ hơn
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#ff8a8a"; // Màu đỏ nhạt, ít chói hơn
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.restore();
  }
  drawBeam() {
    ctx.save();
    const len = width + height;
    const endX = this.x + Math.cos(this.angle) * len;
    const endY = this.y + Math.sin(this.angle) * len;
    const startX = this.x - Math.cos(this.angle) * len;
    const startY = this.y - Math.sin(this.angle) * len;

    // Áp dụng hiệu ứng rung
    ctx.globalAlpha = this.beamFlicker;

    // Layer 1: Hào quang ngoài (rất rộng, rất trong suốt)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "rgba(255, 100, 150, 0.15)";
    ctx.lineWidth = 30;
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 35;
    ctx.stroke();

    // Layer 2: Thân tia chính (rộng vừa, màu đậm)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "rgba(255, 200, 200, 0.8)";
    ctx.lineWidth = 8;
    ctx.shadowBlur = 20;
    ctx.stroke();

    // Layer 3: Lõi sáng (mỏng, màu trắng sáng)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
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
      // Thêm hiệu ứng rung khi tia laser hoạt động
      this.beamFlicker = 0.8 + Math.random() * 0.2;
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
        difficultyLevel * GAME_CONFIG.blackHoles.strengthIncreasePerLevel) *
      strengthVariation;
    this.maxRadius =
      (GAME_CONFIG.blackHoles.baseMaxRadius +
        difficultyLevel * GAME_CONFIG.blackHoles.radiusIncreasePerLevel) *
      sizeVariation;
    this.growthRate =
      (GAME_CONFIG.blackHoles.baseGrowthRate +
        difficultyLevel * GAME_CONFIG.blackHoles.growthRateIncreasePerLevel) *
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
          obj === player ? GAME_CONFIG.blackHoles.playerForceMultiplier : 1;

        // Distance-based intensity for realistic feel
        const force = falloff * this.strength * forceMultiplier;

        obj.velocity.x += Math.cos(angle) * force;
        obj.velocity.y += Math.sin(angle) * force;

        // Visual feedback for player when in gravity field
        if (
          obj === player &&
          dist < this.gravityRadius * GAME_CONFIG.blackHoles.shakeThreshold
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
    if (!this.hasSpedUp && this.lifeTimer > GAME_CONFIG.missiles.speedUpTime) {
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

    if (this.state === "charging" && this.timer === 60 && !this.warningShown) {
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
