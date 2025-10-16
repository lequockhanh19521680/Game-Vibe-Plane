// TimeDistortion - Area that slows or speeds time for objects passing through

class TimeDistortion {
  constructor(x, y, isFast) {
    const config = GAME_CONFIG.newObjects.timeDistortion;
    
    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.radius = config.radius;
    this.isFast = isFast !== undefined ? isFast : Math.random() > 0.5;
    this.factor = this.isFast ? config.fastFactor : config.slowFactor;
    this.lifetime = config.lifetime;
    this.age = 0;
    this.color = this.isFast ? "#ff6b6b" : config.color;
    this.pulseSpeed = config.pulseSpeed;
    this.pulsePhase = 0;
    
    // Time particles
    this.particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * this.radius,
        speed: (Math.random() - 0.5) * 0.1,
        size: 1 + Math.random() * 2,
      });
    }
    
    // Track objects currently affected
    this.affectedObjects = new Set();
  }

  draw() {
    ctx.save();
    
    const alpha = Math.max(0, (this.lifetime - this.age) / this.lifetime);
    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    
    // Draw distortion field
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    
    if (this.isFast) {
      gradient.addColorStop(0, `rgba(255, 107, 107, ${alpha * 0.3 * pulse})`);
      gradient.addColorStop(0.5, `rgba(255, 107, 107, ${alpha * 0.15})`);
      gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
    } else {
      gradient.addColorStop(0, `rgba(0, 229, 255, ${alpha * 0.3 * pulse})`);
      gradient.addColorStop(0.5, `rgba(0, 229, 255, ${alpha * 0.15})`);
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
    
    // Draw boundary
    ctx.globalAlpha = alpha * 0.6 * pulse;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw time particles
    ctx.globalAlpha = alpha;
    this.particles.forEach((p) => {
      const x = this.x + Math.cos(p.angle) * p.distance;
      const y = this.y + Math.sin(p.angle) * p.distance;
      
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 5;
      ctx.fill();
    });
    
    // Draw center symbol (clock-like)
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    const symbolRadius = 15;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, symbolRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Clock hands
    const handAngle = this.isFast ? this.age * 0.2 : this.age * 0.05;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(handAngle) * symbolRadius * 0.8,
      this.y + Math.sin(handAngle) * symbolRadius * 0.8
    );
    ctx.stroke();
    
    ctx.restore();
  }

  update() {
    this.age++;
    this.pulsePhase += this.pulseSpeed;
    
    // Update particles with time effect
    this.particles.forEach((p) => {
      p.angle += p.speed * (this.isFast ? 2 : 0.5);
      p.distance += Math.sin(this.age * 0.1 + p.angle) * 0.5;
      
      // Keep particles within bounds
      if (p.distance > this.radius) p.distance = this.radius;
      if (p.distance < 0) p.distance = 0;
    });
    
    // Apply time distortion to objects
    this.applyTimeDistortion(asteroids);
    this.applyTimeDistortion(missiles);
    this.applyTimeDistortion(fragments);
    
    // Also affect other hazards
    if (typeof plasmaFields !== 'undefined') {
      this.applyTimeDistortion(plasmaFields);
    }
    
    // Affect player movement
    if (player) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < this.radius) {
        // Apply time distortion to player velocity
        const distortionStrength = 1 - (dist / this.radius);
        const timeEffect = 1 + (this.factor - 1) * distortionStrength;
        
        if (!player.baseVelocity) {
          player.baseVelocity = { x: player.velocity.x, y: player.velocity.y };
        }
        
        player.velocity.x *= timeEffect;
        player.velocity.y *= timeEffect;
        
        this.affectedObjects.add('player');
      } else {
        if (this.affectedObjects.has('player')) {
          this.affectedObjects.delete('player');
          player.baseVelocity = null;
        }
      }
    }
    
    return this.age >= this.lifetime;
  }
  
  applyTimeDistortion(objectArray) {
    objectArray.forEach((obj) => {
      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
      
      if (dist < this.radius) {
        // Calculate distortion strength based on distance
        const distortionStrength = 1 - (dist / this.radius);
        const timeEffect = 1 + (this.factor - 1) * distortionStrength;
        
        if (obj.velocity) {
          // Store original velocity if not already stored
          if (!obj.originalTimeVelocity) {
            obj.originalTimeVelocity = { x: obj.velocity.x, y: obj.velocity.y };
          }
          
          // Apply time distortion
          obj.velocity.x = obj.originalTimeVelocity.x * timeEffect;
          obj.velocity.y = obj.originalTimeVelocity.y * timeEffect;
        }
        
        // Visual indicator for affected objects
        if (obj.constructor.name === 'Asteroid' && !obj.timeDistorted) {
          obj.timeDistorted = true;
          obj.timeDistortionColor = this.color;
        }
        
        this.affectedObjects.add(obj);
      } else {
        // Reset velocity when object leaves field
        if (this.affectedObjects.has(obj)) {
          if (obj.originalTimeVelocity) {
            obj.velocity.x = obj.originalTimeVelocity.x;
            obj.velocity.y = obj.originalTimeVelocity.y;
            obj.originalTimeVelocity = null;
          }
          obj.timeDistorted = false;
          this.affectedObjects.delete(obj);
        }
      }
    });
  }
}
