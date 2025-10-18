// =============================================================================
// BASE ENTITY SYSTEM - Extensible and Maintainable Class Hierarchy
// =============================================================================

/**
 * Base Entity class - Foundation for all game objects
 * Follows Single Responsibility Principle and provides common functionality
 */
class Entity {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.isActive = true;
    this.id = Entity.generateId();
  }

  static generateId() {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Template method pattern - defines the algorithm structure
   */
  update() {
    if (!this.isActive) return false;
    
    this.beforeUpdate();
    this.updateLogic();
    this.afterUpdate();
    this.draw();
    
    return this.isActive;
  }

  beforeUpdate() {
    // Hook for pre-update logic
  }

  updateLogic() {
    // To be overridden by subclasses
  }

  afterUpdate() {
    // Hook for post-update logic
  }

  draw() {
    // To be overridden by subclasses
  }

  destroy() {
    this.isActive = false;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Circular Entity - Base class for entities with circular collision
 */
class CircularEntity extends Entity {
  constructor(x, y, radius, config = {}) {
    super(x, y, config);
    this.radius = radius;
  }

  /**
   * Check collision with another circular entity
   */
  collidesWith(other) {
    if (!other || !other.radius) return false;
    const distance = Math.hypot(this.x - other.x, this.y - other.y);
    return distance < (this.radius + other.radius);
  }

  /**
   * Get bounding box for optimization
   */
  getBounds() {
    return {
      left: this.x - this.radius,
      right: this.x + this.radius,
      top: this.y - this.radius,
      bottom: this.y + this.radius
    };
  }

  /**
   * Check if entity is within screen bounds
   */
  isOnScreen(margin = 0) {
    const bounds = this.getBounds();
    return bounds.right >= -margin && 
           bounds.left <= width + margin && 
           bounds.bottom >= -margin && 
           bounds.top <= height + margin;
  }
}

/**
 * Movable Entity - Base class for entities with velocity and physics
 */
class MovableEntity extends CircularEntity {
  constructor(x, y, radius, velocity = { x: 0, y: 0 }, config = {}) {
    super(x, y, radius, config);
    this.velocity = { ...velocity };
    this.acceleration = { x: 0, y: 0 };
    this.friction = config.friction || 1.0;
    this.maxSpeed = config.maxSpeed || Infinity;
  }

  updateLogic() {
    this.updatePhysics();
    this.updatePosition();
  }

  updatePhysics() {
    // Apply acceleration
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // Limit maximum speed
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      this.velocity.x *= ratio;
      this.velocity.y *= ratio;
    }

    // Reset acceleration
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  updatePosition() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  addForce(fx, fy) {
    this.acceleration.x += fx;
    this.acceleration.y += fy;
  }

  setVelocity(vx, vy) {
    this.velocity.x = vx;
    this.velocity.y = vy;
  }

  getSpeed() {
    return Math.hypot(this.velocity.x, this.velocity.y);
  }

  getDirection() {
    return Math.atan2(this.velocity.y, this.velocity.x);
  }
}

/**
 * Colored Entity - Base class for entities with visual properties
 */
class ColoredEntity extends MovableEntity {
  constructor(x, y, radius, color, velocity = { x: 0, y: 0 }, config = {}) {
    super(x, y, radius, velocity, config);
    this.color = color;
    this.alpha = config.alpha || 1.0;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
  }

  updateLogic() {
    super.updateLogic();
    this.rotation += this.rotationSpeed;
  }

  /**
   * Common drawing setup
   */
  setupDrawing(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
  }

  /**
   * Common drawing cleanup
   */
  finishDrawing(ctx) {
    ctx.restore();
  }

  /**
   * Draw a basic circle (can be overridden)
   */
  draw() {
    this.setupDrawing(ctx);
    
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    this.finishDrawing(ctx);
  }
}

/**
 * Temporary Entity - Base class for entities with limited lifetime
 */
class TemporaryEntity extends ColoredEntity {
  constructor(x, y, radius, color, velocity, life, config = {}) {
    super(x, y, radius, color, velocity, config);
    this.life = life;
    this.maxLife = life;
    this.fadeOut = config.fadeOut !== false; // Default to true
  }

  updateLogic() {
    super.updateLogic();
    this.updateLife();
  }

  updateLife() {
    this.life--;
    
    if (this.fadeOut) {
      this.alpha = Math.max(0, this.life / this.maxLife);
    }
    
    if (this.life <= 0) {
      this.destroy();
    }
  }

  isExpired() {
    return this.life <= 0;
  }

  getRemainingLifeRatio() {
    return this.life / this.maxLife;
  }
}

/**
 * Animated Entity - Base class for entities with animation support
 */
class AnimatedEntity extends ColoredEntity {
  constructor(x, y, radius, color, velocity = { x: 0, y: 0 }, config = {}) {
    super(x, y, radius, color, velocity, config);
    this.animations = new Map();
    this.currentAnimation = null;
    this.animationFrame = 0;
    this.animationSpeed = config.animationSpeed || 1;
  }

  addAnimation(name, frames, loop = true) {
    this.animations.set(name, { frames, loop, currentFrame: 0 });
  }

  playAnimation(name) {
    if (this.animations.has(name)) {
      this.currentAnimation = name;
      this.animationFrame = 0;
    }
  }

  updateLogic() {
    super.updateLogic();
    this.updateAnimation();
  }

  updateAnimation() {
    if (!this.currentAnimation) return;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;

    this.animationFrame += this.animationSpeed;
    
    if (this.animationFrame >= animation.frames.length) {
      if (animation.loop) {
        this.animationFrame = 0;
      } else {
        this.animationFrame = animation.frames.length - 1;
      }
    }
  }

  getCurrentFrame() {
    if (!this.currentAnimation) return null;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return null;
    
    const frameIndex = Math.floor(this.animationFrame);
    return animation.frames[frameIndex];
  }
}

/**
 * Weapon Entity - Base class for projectiles and weapons
 */
class WeaponEntity extends MovableEntity {
  constructor(x, y, radius, velocity, config = {}) {
    super(x, y, radius, velocity, config);
    this.damage = config.damage || 1;
    this.lifetime = config.lifetime || 300; // 5 seconds at 60fps
    this.age = 0;
    this.owner = config.owner || null;
    this.piercing = config.piercing || false;
    this.explosive = config.explosive || false;
    this.explosionRadius = config.explosionRadius || 0;
  }

  updateLogic() {
    super.updateLogic();
    this.age++;
    
    if (this.age >= this.lifetime) {
      this.destroy();
    }
  }

  onHit(target) {
    if (this.explosive) {
      this.explode();
    }
    
    if (!this.piercing) {
      this.destroy();
    }
  }

  explode() {
    // Create explosion particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push(new Particle(
        this.x + Math.cos(angle) * 5,
        this.y + Math.sin(angle) * 5,
        Math.random() * 3 + 1,
        this.color || "#ff6600",
        {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        }
      ));
    }
  }
}

/**
 * Collectible Entity - Base class for power-ups and collectibles
 */
class CollectibleEntity extends ColoredEntity {
  constructor(x, y, radius, color, config = {}) {
    super(x, y, radius, color, { x: 0, y: 0 }, config);
    this.collectSound = config.collectSound || 'powerup';
    this.scoreValue = config.scoreValue || 50;
    this.effect = config.effect || null;
    this.magneticRange = config.magneticRange || 0;
    this.pulseSpeed = config.pulseSpeed || 0.1;
    this.pulseAmount = config.pulseAmount || 0.2;
  }

  updateLogic() {
    super.updateLogic();
    
    // Pulsing animation
    const pulse = Math.sin(Date.now() * this.pulseSpeed) * this.pulseAmount;
    this.alpha = 0.8 + pulse;
    
    // Magnetic attraction to player
    if (this.magneticRange > 0 && typeof player !== 'undefined') {
      const distance = Math.hypot(player.x - this.x, player.y - this.y);
      if (distance < this.magneticRange) {
        const force = 0.1 * (1 - distance / this.magneticRange);
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.addForce(Math.cos(angle) * force, Math.sin(angle) * force);
      }
    }
  }

  onCollect(collector) {
    if (this.collectSound && typeof playSound === 'function') {
      playSound(this.collectSound);
    }
    
    if (this.scoreValue && typeof score !== 'undefined') {
      score += this.scoreValue;
    }
    
    if (this.effect && typeof this.effect === 'function') {
      this.effect(collector);
    }
    
    this.destroy();
  }
}
