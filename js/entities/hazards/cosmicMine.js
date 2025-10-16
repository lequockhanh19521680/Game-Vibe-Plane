// CosmicMine - Stationary mine that explodes into shrapnel when triggered

class CosmicMine {
  constructor(x, y) {
    const config = GAME_CONFIG.newObjects.cosmicMine;
    
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.radius = config.radius;
    this.triggerRadius = config.triggerRadius;
    this.armTime = config.armTime;
    this.explosionRadius = config.explosionRadius;
    this.shrapnelCount = config.shrapnelCount;
    this.shrapnelSpeed = config.shrapnelSpeed;
    this.shrapnelLifetime = config.shrapnelLifetime;
    this.color = config.color;
    this.pulseSpeed = config.pulseSpeed;
    
    this.age = 0;
    this.armed = false;
    this.triggered = false;
    this.pulsePhase = 0;
    
    // Spikes around mine
    this.spikes = [];
    for (let i = 0; i < 8; i++) {
      this.spikes.push({
        angle: (i / 8) * Math.PI * 2,
        length: this.radius * 1.5,
      });
    }
    
    // Warning particles
    this.particles = [];
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        angle: (i / 12) * Math.PI * 2,
        distance: this.radius + 10,
        speed: 0.1,
      });
    }
  }

  draw() {
    if (this.triggered) return; // Don't draw if exploded
    
    ctx.save();
    
    // Draw trigger radius when armed
    if (this.armed) {
      const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
      ctx.globalAlpha = 0.2 * pulse;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.triggerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw warning particles if armed
    if (this.armed) {
      ctx.globalAlpha = 0.8;
      this.particles.forEach((p) => {
        const x = this.x + Math.cos(p.angle) * p.distance;
        const y = this.y + Math.sin(p.angle) * p.distance;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });
    }
    
    // Draw mine body
    ctx.globalAlpha = 1;
    
    // Outer shell with glow
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius * 1.5
    );
    
    if (this.armed) {
      const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
      gradient.addColorStop(0, `rgba(255, 23, 68, ${0.8 * pulse})`);
      gradient.addColorStop(0.5, `rgba(255, 23, 68, ${0.4 * pulse})`);
      gradient.addColorStop(1, 'rgba(255, 23, 68, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(100, 100, 100, 0.5)');
      gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.armed ? this.color : '#666666';
    ctx.shadowColor = this.armed ? this.color : '#000000';
    ctx.shadowBlur = this.armed ? 15 : 5;
    ctx.fill();
    
    // Draw spikes
    ctx.strokeStyle = this.armed ? '#ffffff' : '#999999';
    ctx.lineWidth = 3;
    this.spikes.forEach((spike) => {
      const x = this.x + Math.cos(spike.angle) * spike.length;
      const y = this.y + Math.sin(spike.angle) * spike.length;
      
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Spike tip
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.armed ? this.color : '#999999';
      ctx.fill();
    });
    
    // Core indicator
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = this.armed ? '#ffffff' : '#333333';
    ctx.fill();
    
    // Arming progress indicator
    if (!this.armed) {
      const armProgress = this.age / this.armTime;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(
        this.x, this.y,
        this.radius * 0.6,
        -Math.PI / 2,
        -Math.PI / 2 + armProgress * Math.PI * 2
      );
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  update() {
    this.age++;
    
    // Arm after delay
    if (!this.armed && this.age >= this.armTime) {
      this.armed = true;
      this.createArmEffect();
    }
    
    if (this.armed) {
      this.pulsePhase += this.pulseSpeed;
      
      // Update warning particles
      this.particles.forEach((p) => {
        p.angle += p.speed;
      });
      
      // Check for nearby objects to trigger
      if (this.checkTrigger()) {
        this.explode();
        return true; // Remove mine
      }
    }
    
    return false;
  }
  
  checkTrigger() {
    // Check player
    if (player) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < this.triggerRadius) {
        return true;
      }
    }
    
    // Check asteroids
    for (const asteroid of asteroids) {
      const dist = Math.hypot(asteroid.x - this.x, asteroid.y - this.y);
      if (dist < this.triggerRadius) {
        return true;
      }
    }
    
    // Check missiles
    for (const missile of missiles) {
      const dist = Math.hypot(missile.x - this.x, missile.y - this.y);
      if (dist < this.triggerRadius) {
        return true;
      }
    }
    
    return false;
  }
  
  createArmEffect() {
    // Visual effect when mine becomes armed
    if (typeof particles !== 'undefined') {
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        particles.push(
          new Particle(
            this.x,
            this.y,
            2,
            this.color,
            {
              x: Math.cos(angle) * 2,
              y: Math.sin(angle) * 2,
            }
          )
        );
      }
    }
    
    // Sound effect
    if (typeof playSound === 'function') {
      playSound('warning', 0.4);
    }
  }
  
  explode() {
    this.triggered = true;
    
    // Create explosion effect
    if (typeof triggerScreenShake === 'function') {
      triggerScreenShake(0.3);
    }
    
    // Create shrapnel
    for (let i = 0; i < this.shrapnelCount; i++) {
      const angle = (i / this.shrapnelCount) * Math.PI * 2;
      const speed = this.shrapnelSpeed + Math.random() * 2;
      
      const shrapnel = {
        x: this.x,
        y: this.y,
        radius: 4 + Math.random() * 3,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        lifetime: this.shrapnelLifetime,
        age: 0,
        color: this.color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      };
      
      // Add to fragments array or create custom array
      if (typeof fragments !== 'undefined') {
        fragments.push(shrapnel);
      }
    }
    
    // Create explosion particles
    if (typeof particles !== 'undefined') {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        particles.push(
          new Particle(
            this.x,
            this.y,
            3 + Math.random() * 3,
            this.color,
            {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed,
            }
          )
        );
      }
    }
    
    // Explosion wave effect (push nearby objects)
    this.createExplosionWave();
    
    // Sound
    if (typeof playSound === 'function') {
      playSound('explosion', 0.7);
    }
  }
  
  createExplosionWave() {
    const wave = {
      x: this.x,
      y: this.y,
      radius: 0,
      maxRadius: this.explosionRadius,
      pushForce: 1.5,
    };
    
    // Push objects in explosion radius
    const affectObject = (obj) => {
      const dist = Math.hypot(obj.x - this.x, obj.y - this.y);
      if (dist < this.explosionRadius && dist > 0) {
        const force = this.explosionRadius / dist;
        const angle = Math.atan2(obj.y - this.y, obj.x - this.x);
        
        if (obj.velocity) {
          obj.velocity.x += Math.cos(angle) * force;
          obj.velocity.y += Math.sin(angle) * force;
        }
      }
    };
    
    asteroids.forEach(affectObject);
    missiles.forEach(affectObject);
    fragments.forEach(affectObject);
    
    // Damage player if nearby
    if (player) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < this.explosionRadius) {
        if (!player.shieldActive && !player.thunderShieldActive) {
          if (typeof endGame === 'function') {
            endGame();
          }
        }
      }
    }
  }
}
