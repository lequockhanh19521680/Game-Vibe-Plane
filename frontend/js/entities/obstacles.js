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
    this.movementPattern = Math.random();
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.rotation = 0;
    this.wobbleAmount =
      Math.random() * GAME_CONFIG.entities.asteroids.wobbleAmount;
    this.wobbleSpeed =
      Math.random() * GAME_CONFIG.entities.asteroids.wobbleSpeed;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.timer = 0;
  }

  createShape() {
    const p = [];
    const s = 7 + ~~(Math.random() * 5);
    for (let i = 0; i < s; i++) {
      const a = (i / s) * Math.PI * 2;
      const r = this.radius * (0.7 + Math.random() * 0.3);
      p.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return p;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
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
    ctx.restore();
  }

  update() {
    this.timer++;
    this.rotation += this.rotationSpeed;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    if (this.movementPattern < 0.2) {
      // 20% get wobble
      const wobble =
        Math.sin(this.timer * this.wobbleSpeed + this.wobblePhase) *
        this.wobbleAmount;
      this.x += Math.sin(this.rotation) * wobble;
      this.y += Math.cos(this.rotation) * wobble;
    }

    this.draw();
  }
}

class Laser {
  constructor(targetPlayer = false) {
    this.targetPlayer = targetPlayer;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      // top
      this.x = Math.random() * width;
      this.y = 0;
    } else if (edge === 1) {
      // right
      this.x = width;
      this.y = Math.random() * height;
    } else if (edge === 2) {
      // bottom
      this.x = Math.random() * width;
      this.y = height;
    } else {
      // left
      this.x = 0;
      this.y = Math.random() * height;
    }

    if (this.targetPlayer && player) {
      this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    } else {
      this.angle = Math.random() * Math.PI * 2;
    }

    this.timer = 0;
    this.maxTime = GAME_CONFIG.entities.lasers.warningTime;
    this.fired = false;
  }

  drawWarning() {
    ctx.save();
    const alpha = Math.sin((this.timer / this.maxTime) * Math.PI) * 0.9;
    ctx.globalAlpha = alpha;
    const len = width + height;
    const endX = this.x + Math.cos(this.angle) * len;
    const endY = this.y + Math.sin(this.angle) * len;
    const startX = this.x - Math.cos(this.angle) * len;
    const startY = this.y - Math.sin(this.angle) * len;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#ff8a8a";
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
    ctx.globalAlpha = 0.8 + Math.random() * 0.2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "rgba(255, 200, 200, 0.8)";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
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
    const config = GAME_CONFIG.entities.blackHoles;
    this.radius = config.baseRadius;
    const difficultyLevel = Math.floor(
      score / GAME_CONFIG.difficulty.scorePerLevel
    );
    this.gravityRadius =
      config.baseGravityRadius +
      difficultyLevel * config.gravityRadiusIncreasePerLevel;
    this.strength =
      config.baseStrength + difficultyLevel * config.strengthIncreasePerLevel;
    this.maxRadius =
      config.baseMaxRadius + difficultyLevel * config.radiusIncreasePerLevel;
    this.growthRate =
      config.baseGrowthRate +
      difficultyLevel * config.growthRateIncreasePerLevel;
    this.alpha = 0;
    this.isTemporary = isTemporary;
    this.life = config.temporaryLifetime;
    this.state = "growing"; // growing, fading
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.gravityRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(170, 102, 204, ${0.1 * this.alpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
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
      }
    } else {
      this.alpha -= 0.01;
    }

    [player, ...asteroids, ...missiles, ...fragments].forEach((obj) => {
      if (!obj || !obj.velocity) return;
      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
      if (dist < this.gravityRadius && dist > 0) {
        const angle = Math.atan2(this.y - obj.y, this.x - obj.x);
        const falloff = 1 - dist / this.gravityRadius;
        const forceMultiplier =
          obj === player
            ? GAME_CONFIG.entities.blackHoles.playerForceMultiplier
            : 1;
        const force = falloff * this.strength * forceMultiplier;
        obj.velocity.x += Math.cos(angle) * force;
        obj.velocity.y += Math.sin(angle) * force;
        if (
          obj === player &&
          dist <
            this.gravityRadius * GAME_CONFIG.entities.blackHoles.shakeThreshold
        ) {
          triggerScreenShake(GAME_CONFIG.entities.blackHoles.shakeIntensity);
        }
      }
    });
    this.draw();
  }
}

class Missile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = GAME_CONFIG.entities.missiles.radius;
    const difficultyLevel = Math.floor(
      score / GAME_CONFIG.difficulty.scorePerLevel
    );
    this.speed =
      (GAME_CONFIG.entities.missiles.baseSpeed +
        difficultyLevel * GAME_CONFIG.entities.missiles.speedIncreasePerLevel) *
      globalSpeedMultiplier;
    this.turnSpeed =
      GAME_CONFIG.entities.missiles.baseTurnSpeed +
      difficultyLevel * GAME_CONFIG.entities.missiles.turnSpeedIncreasePerLevel;
    this.trail = [];
    this.lifeTimer = 0;
    this.hasSpedUp = false;
    this.isDead = false;
    this.velocity = {
      x: Math.cos(this.angle) * this.speed,
      y: Math.sin(this.angle) * this.speed,
    };
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
    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 2.5);
    ctx.lineTo(this.radius * 0.8, this.radius * 0.5);
    ctx.lineTo(-this.radius * 0.8, this.radius * 0.5);
    ctx.closePath();
    ctx.fillStyle = GAME_CONFIG.entities.missiles.color || "#f48fb1";
    ctx.shadowColor = GAME_CONFIG.entities.missiles.color || "#f48fb1";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.lifeTimer++;
    if (
      !this.hasSpedUp &&
      this.lifeTimer > GAME_CONFIG.entities.missiles.speedUpTime
    ) {
      this.speed *= GAME_CONFIG.entities.missiles.speedUpMultiplier;
      this.turnSpeed *= GAME_CONFIG.entities.missiles.turnSpeedUpMultiplier;
      this.hasSpedUp = true;
      playSound("missile");
    }
    if (this.lifeTimer > GAME_CONFIG.entities.missiles.lifetime) {
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
    this.velocity.x *= GAME_CONFIG.entities.missiles.velocity.friction;
    this.velocity.y *= GAME_CONFIG.entities.missiles.velocity.friction;

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
      ? GAME_CONFIG.entities.missiles.fragmentCountOnImpact
      : GAME_CONFIG.entities.missiles.fragmentCount;
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (i / fragmentCount) * Math.PI * 2;
      const fragmentSpeed = 3 + Math.random() * 4;
      fragments.push(
        new MissileFragment(this.x, this.y, {
          x: Math.cos(angle) * fragmentSpeed,
          y: Math.sin(angle) * fragmentSpeed,
        })
      );
    }
    playSound("explosion");
  }
}

class LaserMine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const config = GAME_CONFIG.entities.laserMines;
    this.radius = config.radius;
    this.timer = 0;
    this.maxTime = config.chargeTime;
    this.fireDuration = config.fireDuration;
    this.state = "charging";
    this.alpha = 0;
    this.pattern =
      config.patterns[Math.floor(Math.random() * config.patterns.length)];
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
        for (let i = 0; i < 8; i++) angles.push((i * Math.PI) / 4);
        return angles;
      default:
        return [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.state === "charging") {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4444";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 15;
      ctx.fill();
    } else if (this.state === "firing") {
      const angles = this.getFireAngles();
      angles.forEach((angle) => {
        const length = 1500;
        const beamWidth = GAME_CONFIG.entities.laserMines.beamWidth;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 20;
        ctx.fillRect(0, -beamWidth / 2, length, beamWidth);
        ctx.restore();
      });
    }
    ctx.restore();
  }

  update() {
    if (this.alpha < 1 && this.state !== "fading") this.alpha += 0.02;
    this.timer++;
    if (this.state === "charging" && this.timer > this.maxTime) {
      this.state = "firing";
      this.timer = 0;
      triggerScreenShake(GAME_CONFIG.visual.screenShake.mineIntensity);
      playSound("laserMine");
    }
    if (this.state === "firing" && this.timer > this.fireDuration) {
      this.state = "fading";
    }
    this.draw();
  }
}
