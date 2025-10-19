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
    return distance < this.radius + other.radius;
  }

  /**
   * Get bounding box for optimization
   */
  getBounds() {
    return {
      left: this.x - this.radius,
      right: this.x + this.radius,
      top: this.y - this.radius,
      bottom: this.y + this.radius,
    };
  }

  /**
   * Check if entity is within screen bounds
   */
  isOnScreen(margin = 0) {
    const bounds = this.getBounds();
    return (
      bounds.right >= -margin &&
      bounds.left <= width + margin &&
      bounds.bottom >= -margin &&
      bounds.top <= height + margin
    );
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

// REMOVED: Unused classes TemporaryEntity, AnimatedEntity, WeaponEntity, CollectibleEntity
