// =============================================================================
// BASE ENTITY SYSTEM - Extensible and Maintainable Class Hierarchy
// =============================================================================

/**
 * Base Entity class - Foundation for all game objects
 */
class Entity {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.config = config; // Store config if needed by subclasses
    this.isActive = true;
    this.id = Entity.generateId(); // Unique ID for each entity
  }

  // Simple ID generator
  static generateId() {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Main update loop for an entity. Returns false if inactive.
   */
  update() {
    if (!this.isActive) return false;

    this.beforeUpdate();
    this.updateLogic();
    this.afterUpdate();
    this.draw(); // Draw after logic update

    return this.isActive;
  }

  // Hooks for subclasses
  beforeUpdate() {}
  updateLogic() {}
  afterUpdate() {}
  draw() {}

  // Deactivate entity for removal
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
 * Circular Entity - For objects with radius-based collision
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
    if (!other || typeof other.radius !== "number") return false; // Basic validation
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiiSum = this.radius + other.radius;
    return distanceSquared < radiiSum * radiiSum; // More efficient check
  }

  /**
   * Get bounding box
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
   * Check if entity is within screen bounds (with optional margin)
   */
  isOnScreen(margin = 0) {
    // Check global width/height variables (should be defined in game scope)
    if (typeof width === "undefined" || typeof height === "undefined") {
      console.warn("Screen width/height not defined for isOnScreen check.");
      return true; // Assume on screen if dimensions unknown
    }
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
 * Movable Entity - Adds velocity and basic physics
 */
class MovableEntity extends CircularEntity {
  constructor(x, y, radius, velocity = { x: 0, y: 0 }, config = {}) {
    super(x, y, radius, config);
    this.velocity = { ...velocity };
    this.acceleration = { x: 0, y: 0 };
    this.friction = config.friction || 1.0; // Default no friction
    this.maxSpeed = config.maxSpeed || Infinity; // Default no speed limit
  }

  updateLogic() {
    this.updatePhysics();
    this.updatePosition();
  }

  updatePhysics() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      this.velocity.x *= ratio;
      this.velocity.y *= ratio;
    }

    // Reset acceleration for the next frame
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
    // Return angle in radians
    return Math.atan2(this.velocity.y, this.velocity.x);
  }
}

/**
 * Colored Entity - Adds color, alpha, and rotation
 */
class ColoredEntity extends MovableEntity {
  constructor(x, y, radius, color, velocity = { x: 0, y: 0 }, config = {}) {
    super(x, y, radius, velocity, config);
    this.color = color;
    this.alpha = typeof config.alpha === "number" ? config.alpha : 1.0; // Default alpha 1
    this.rotation = config.rotation || 0; // Default rotation 0
    this.rotationSpeed = config.rotationSpeed || 0; // Default no rotation speed
  }

  updateLogic() {
    super.updateLogic();
    this.rotation += this.rotationSpeed; // Update rotation based on speed
  }

  // Helper for setting up context transformations
  setupDrawing(ctx) {
    if (!ctx) return; // Add null check for context
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
  }

  // Helper for restoring context state
  finishDrawing(ctx) {
    if (!ctx) return; // Add null check for context
    ctx.restore();
  }

  // Default draw method (simple circle) - intended to be overridden
  draw() {
    if (!ctx) return; // Add null check for context
    this.setupDrawing(ctx);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    this.finishDrawing(ctx);
  }
}
