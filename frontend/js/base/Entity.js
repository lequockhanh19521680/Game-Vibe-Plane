// Base Entity class - follows Single Responsibility Principle
// Provides common functionality for all game entities
class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    // To be overridden by subclasses
  }

  update() {
    // To be overridden by subclasses
    this.draw();
  }
}

// Base class for entities with position and radius
class CircularEntity extends Entity {
  constructor(x, y, radius) {
    super(x, y);
    this.radius = radius;
  }
}

// Base class for movable entities with velocity
class MovableEntity extends CircularEntity {
  constructor(x, y, radius, velocity = { x: 0, y: 0 }) {
    super(x, y, radius);
    this.velocity = velocity;
  }

  updatePosition() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Base class for colored entities
class ColoredEntity extends MovableEntity {
  constructor(x, y, radius, color, velocity = { x: 0, y: 0 }) {
    super(x, y, radius, velocity);
    this.color = color;
  }
}

// Base class for temporary entities with life timer
class TemporaryEntity extends ColoredEntity {
  constructor(x, y, radius, color, velocity, life) {
    super(x, y, radius, color, velocity);
    this.life = life;
    this.alpha = 1;
  }

  updateLife() {
    this.life--;
    this.alpha = this.life / 100; // Fade out as life decreases
  }

  isExpired() {
    return this.life <= 0;
  }
}
