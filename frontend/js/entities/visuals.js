// Visual effects classes - particles, fragments, stars

class Particle extends ColoredEntity {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
    // Sử dụng kích thước đơn giản cho hiệu suất vẽ cao hơn
    this.size = radius * 2;
  }
  draw() {
    ctx.save();
    // VẼ TỐI ƯU: Sử dụng fillRect thay vì arc/fill (nhanh hơn nhiều)
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    // Vẽ hình chữ nhật nhỏ tại vị trí hạt (làm tròn để trông giống hạt)
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
    this.rotationSpeed =
      (Math.random() - 0.5) * GAME_CONFIG.fragments.rotationSpeed;
    this.lethal = false; // Regular fragments are not lethal
  }
  // Thêm phương thức draw/update bị thiếu cho Fragment
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
    ctx.fillStyle = this.color;
    // Loại bỏ shadowBlur để tăng hiệu suất
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= GAME_CONFIG.fragments.airResistance;
    this.velocity.y *= GAME_CONFIG.fragments.airResistance;
    this.rotation += this.rotationSpeed;

    this.life--;
    this.alpha = Math.max(0, this.life / 120);

    this.draw();
    // Fragment không cần return giá trị, việc lọc được thực hiện trong game.js
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
    // VẼ TỐI ƯU: Sử dụng rect thay vì fill để vẽ hình vuông/chữ nhật
    ctx.rect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
    ctx.fillStyle = this.color;
    // Loại bỏ shadowBlur để tăng hiệu suất
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
    this.velocity.x *= GAME_CONFIG.fragments.airResistance;
    this.velocity.y *= GAME_CONFIG.fragments.airResistance;
    this.rotation += this.rotationSpeed;

    this.life--;
    this.alpha = Math.max(0, this.life / 120); // Dùng 120 frames làm thời gian sống mặc định

    this.draw();
    // MissileFragment không cần return giá trị, việc lọc được thực hiện trong game.js
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
    // VẼ TỐI ƯU: Không cần save/restore/begin/close path cho mỗi ngôi sao
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
