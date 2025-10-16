// GravityWave - Rippling wave that pushes objects away in concentric circles

class GravityWave {
  constructor(x, y) {
    const config = GAME_CONFIG.newObjects.gravityWave;
    
    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = config.radius;
    this.maxRadius = config.maxRadius;
    this.expansionSpeed = config.expansionSpeed;
    this.pushForce = config.pushForce;
    this.lifetime = config.lifetime;
    this.age = 0;
    this.color = config.color;
    this.waveCount = config.waveCount;
    
    // Visual effects
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        angle: (i / 30) * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.05,
        offset: Math.random() * 20,
      });
    }
  }

  draw() {
    ctx.save();
    
    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    ctx.globalAlpha = alpha;
    
    // Draw expanding wave rings
    for (let i = 0; i < this.waveCount; i++) {
      const waveRadius = this.radius - (i * this.radius / this.waveCount);
      if (waveRadius > 0) {
        const waveAlpha = 1 - (i / this.waveCount);
        ctx.globalAlpha = alpha * waveAlpha * 0.6;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
      }
    }
    
    // Draw energy particles
    ctx.globalAlpha = alpha;
    this.particles.forEach((p) => {
      const particleRadius = this.radius + p.offset;
      const x = this.x + Math.cos(p.angle) * particleRadius;
      const y = this.y + Math.sin(p.angle) * particleRadius;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fill();
    });
    
    // Draw central core
    const coreSize = 10 * (1 - this.age / this.lifetime);
    ctx.beginPath();
    ctx.arc(this.x, this.y, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.fill();
    
    ctx.restore();
  }

  update() {
    this.age++;
    
    // Expand wave
    this.radius += this.expansionSpeed;
    
    // Update particles
    this.particles.forEach((p) => {
      p.angle += p.speed;
    });
    
    // Push away asteroids, missiles, and fragments
    this.applyForceToObjects(asteroids);
    this.applyForceToObjects(missiles);
    this.applyForceToObjects(fragments);
    
    // Also affect other hazards for interesting interactions
    if (typeof blackHoles !== 'undefined') {
      this.applyForceToObjects(blackHoles);
    }
    
    // Can push player too for challenge
    if (player && this.affectsPlayer()) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      const waveFront = Math.abs(dist - this.radius);
      
      // Only push if near the wave front
      if (waveFront < 30 && dist > 0) {
        const force = this.pushForce * (1 - waveFront / 30);
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.velocity.x += Math.cos(angle) * force;
        player.velocity.y += Math.sin(angle) * force;
      }
    }
    
    return this.age >= this.lifetime || this.radius > this.maxRadius;
  }
  
  applyForceToObjects(objectArray) {
    objectArray.forEach((obj) => {
      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
      const waveFront = Math.abs(dist - this.radius);
      
      // Only push if near the wave front (within 30 pixels)
      if (waveFront < 30 && dist > 0) {
        const force = this.pushForce * (1 - waveFront / 30);
        const angle = Math.atan2(obj.y - this.y, obj.x - this.x);
        
        if (obj.velocity) {
          obj.velocity.x += Math.cos(angle) * force;
          obj.velocity.y += Math.sin(angle) * force;
        }
        
        // Mark asteroids as charged for visual effect
        if (obj.constructor.name === 'Asteroid' && !obj.charged) {
          obj.charged = true;
          obj.chargeColor = this.color;
          setTimeout(() => {
            obj.charged = false;
          }, 2000);
        }
      }
    });
  }
  
  affectsPlayer() {
    // Check if player has shield active
    return !player.shieldActive && !player.thunderShieldActive;
  }
}
