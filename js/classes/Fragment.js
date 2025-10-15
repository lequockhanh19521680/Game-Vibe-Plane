// =============================================================================
// FRAGMENT CLASS
// =============================================================================

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
    this.rotationSpeed =
      (Math.random() - 0.5) * GAME_CONFIG.fragments.rotationSpeed;
    this.lethal = false; // Regular fragments are not lethal
  }

  draw() {
    const ctx = window.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
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
    const ctx = window.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
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
}

window.Fragment = Fragment;
window.MissileFragment = MissileFragment;
