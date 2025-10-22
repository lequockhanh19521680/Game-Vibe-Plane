// Visual effects classes - particles, fragments, stars

class Particle extends ColoredEntity {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
    this.size = radius * 2;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius,
      this.size,
      this.size
    );
    ctx.restore();
  }
  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= GAME_CONFIG.visual.particles.fadeSpeed;
    this.draw();
  }
}

class Fragment {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.radius =
      GAME_CONFIG.fragments.minRadius +
      Math.random() *
        (GAME_CONFIG.fragments.maxRadius - GAME_CONFIG.fragments.minRadius);
    this.velocity = velocity;
    this.color = GAME_CONFIG.fragments.color;
    this.life =
      GAME_CONFIG.fragments.minLife +
      Math.random() *
        (GAME_CONFIG.fragments.maxLife - GAME_CONFIG.fragments.minLife);
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2; // Use a fixed value instead of config
    this.lethal = false;
    this.isActive = true; // Ensure fragment starts active
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    if (!this.isActive) return false; // Exit early if not active

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.rotation += this.rotationSpeed;
    this.life--;
    this.alpha = Math.max(0, this.life / 120); // Base alpha calculation on initial life? Maybe use maxLife?
    if (this.life <= 0) {
      this.isActive = false;
      return false;
    }
    this.draw();
    return true; // Indicate it's still active
  }
}

class MissileFragment extends Fragment {
  constructor(x, y, velocity) {
    super(x, y, velocity);
    const config = GAME_CONFIG.fragments.missileFragments;
    this.radius =
      config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
    this.color = config.color;
    this.life =
      config.minLife + Math.random() * (config.maxLife - config.minLife);
    this.lethal = false; // SỬA LỖI 2: Mảnh tên lửa không gây kết thúc game
    this.isActive = true; // Ensure fragment starts active
  }

  draw() {
    if (!this.isActive) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8; // Giảm shadow blur cho mảnh vỡ
    ctx.fill();
    ctx.restore();
  }
}

class Star extends CircularEntity {
  constructor(x, y, radius, layer) {
    super(x, y, radius);
    this.layer = layer;
    this.velocity = 0.2 + layer * 0.5;
    this.alpha = 0.5 + layer * 0.5;
  }
  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }
  update() {
    this.y += this.velocity * globalSpeedMultiplier;
    if (this.y - this.radius > height) {
      this.y = 0 - this.radius;
      this.x = Math.random() * width;
    }
    this.draw();
  }
}
