// Visual effects classes - particles, fragments, stars

class Particle extends ColoredEntity {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;
    ctx.fill();
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
        (GAME_CONFIG.fragments.maxRadius -
          GAME_CONFIG.fragments.minRadius);
    this.velocity = velocity;
    this.color = GAME_CONFIG.fragments.color;
    this.life =
      GAME_CONFIG.fragments.minLife +
      Math.random() *
        (GAME_CONFIG.fragments.maxLife - GAME_CONFIG.fragments.minLife);
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed =
      (Math.random() - 0.5) * GAME_CONFIG.fragments.rotationSpeed;
    this.lethal = false; // Regular fragments are not lethal
  }
}

class MissileFragment {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.radius =
      GAME_CONFIG.fragments.missileFragments.minRadius +
      Math.random() *
        (GAME_CONFIG.fragments.missileFragments.maxRadius -
          GAME_CONFIG.fragments.missileFragments.minRadius);
    this.velocity = velocity;
    this.color = GAME_CONFIG.fragments.missileFragments.color;
    this.life =
      GAME_CONFIG.fragments.missileFragments.minLife +
      Math.random() *
        (GAME_CONFIG.fragments.missileFragments.maxLife -
          GAME_CONFIG.fragments.missileFragments.minLife);
    this.alpha = 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.lethal = GAME_CONFIG.fragments.missileFragments.lethal;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(
      -this.radius / 2,
      -this.radius / 2,
      this.radius,
      this.radius
    );
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    // Add danger glow for lethal fragments
    if (this.lethal) {
      ctx.strokeStyle = "#ff0088";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += GAME_CONFIG.fragments.gravity;
    this.velocity.x *= GAME_CONFIG.fragments.airResistance;
    this.velocity.y *= GAME_CONFIG.fragments.airResistance;
    this.rotation += this.rotationSpeed;

    this.life--;
    this.alpha = Math.max(0, this.life / 120);

    return this.life <= 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(
      -this.radius / 2,
      -this.radius / 2,
      this.radius,
      this.radius
    );
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += GAME_CONFIG.fragments.gravity;
    this.velocity.x *= GAME_CONFIG.fragments.airResistance;
    this.velocity.y *= GAME_CONFIG.fragments.airResistance;
    this.rotation += this.rotationSpeed;

    this.life--;
    this.alpha = Math.max(0, this.life / 150);

    this.draw();
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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
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
