// =============================================================================
// ENTITY FACTORY - Centralized entity creation for better extensibility
// =============================================================================

class EntityFactory {
  constructor() {
    this.entityTypes = new Map();
    this.registerDefaultEntities();
  }

  /**
   * Register an entity type with the factory
   */
  registerEntity(type, constructor, defaultConfig = {}) {
    this.entityTypes.set(type, { constructor, defaultConfig });
  }

  /**
   * Create an entity of the specified type
   */
  create(type, ...args) {
    const entityInfo = this.entityTypes.get(type);
    if (!entityInfo) {
      throw new Error(`Unknown entity type: ${type}`);
    }

    const { constructor: EntityClass, defaultConfig } = entityInfo;

    // Merge default config with any provided config
    if (
      args.length > 0 &&
      typeof args[args.length - 1] === "object" &&
      args[args.length - 1].isConfig
    ) {
      const config = { ...defaultConfig, ...args.pop() };
      return new EntityClass(...args, config);
    }

    return new EntityClass(...args, defaultConfig);
  }

  /**
   * Create multiple entities of the same type
   */
  createBatch(type, count, configGenerator) {
    const entities = [];
    for (let i = 0; i < count; i++) {
      const config = configGenerator ? configGenerator(i) : {};
      entities.push(this.create(type, config));
    }
    return entities;
  }

  /**
   * Register default entity types
   */
  registerDefaultEntities() {
    // Particles
    this.registerEntity("particle", Particle, {
      fadeSpeed: GAME_CONFIG.visual.particles.fadeSpeed,
      maxLife: 100,
    });

    // Fragments
    this.registerEntity("fragment", Fragment, {
      gravity: GAME_CONFIG.fragments.gravity,
      airResistance: GAME_CONFIG.fragments.airResistance,
      rotationSpeed: GAME_CONFIG.fragments.rotationSpeed,
    });

    this.registerEntity("missileFragment", MissileFragment, {
      ...GAME_CONFIG.fragments.missileFragments,
      lethal: true,
    });

    // Asteroids
    this.registerEntity("asteroid", Asteroid, {
      colors: GAME_CONFIG.entities.asteroids.colors,
      rotationSpeed: GAME_CONFIG.entities.asteroids.rotationSpeed,
      speedVariation: GAME_CONFIG.entities.asteroids.speedVariation,
    });

    // Weapons
    this.registerEntity("missile", Missile, {
      baseSpeed: GAME_CONFIG.entities.missiles.baseSpeed,
      turnSpeed: GAME_CONFIG.entities.missiles.baseTurnSpeed,
      lifetime: GAME_CONFIG.entities.missiles.lifetime,
    });

    this.registerEntity("laser", Laser, {
      warningTime: GAME_CONFIG.entities.lasers.warningTime,
      beamDuration: GAME_CONFIG.entities.lasers.beamDuration,
    });

    // Hazards
    this.registerEntity("blackHole", BlackHole, {
      baseRadius: GAME_CONFIG.entities.blackHoles.baseRadius,
      gravityRadius: GAME_CONFIG.entities.blackHoles.baseGravityRadius,
      strength: GAME_CONFIG.entities.blackHoles.baseStrength,
    });

    this.registerEntity("laserMine", LaserMine, {
      radius: GAME_CONFIG.entities.laserMines.radius,
      chargeTime: GAME_CONFIG.entities.laserMines.chargeTime,
      patterns: GAME_CONFIG.entities.laserMines.patterns,
    });

    // Collectibles
    this.registerEntity("crystalCluster", CrystalCluster, {
      radius: GAME_CONFIG.entities.crystalClusters.radius,
      lifetime: GAME_CONFIG.entities.crystalClusters.lifetime,
      colors: GAME_CONFIG.entities.crystalClusters.colors,
    });

    this.registerEntity("energyOrb", EnergyOrb, {
      ...GAME_CONFIG.specialObjects.energyOrb,
    });

    this.registerEntity("crystalShard", CrystalShard, {
      magneticRange: 50,
      scoreValue: 50,
      effect: (player) => player.activateShield(),
    });

    // Special Objects
    this.registerEntity("shieldGenerator", ShieldGenerator, {
      ...GAME_CONFIG.specialObjects.shieldGenerator,
    });

    this.registerEntity("freezeZone", FreezeZone, {
      ...GAME_CONFIG.specialObjects.freezeZone,
    });

    this.registerEntity("plasmaField", PlasmaField, {
      ...GAME_CONFIG.specialObjects.plasmaField,
    });

    this.registerEntity("quantumPortal", QuantumPortal, {
      lifetime: GAME_CONFIG.events.quantumTunnels.lifetime,
      teleportForce: GAME_CONFIG.events.quantumTunnels.teleportForce,
    });

    this.registerEntity("magneticStorm", MagneticStorm, {
      ...GAME_CONFIG.specialObjects.magneticStorm,
    });

    this.registerEntity("lightningStorm", LightningStorm, {
      ...GAME_CONFIG.specialObjects.lightningStorm,
    });
  }

  /**
   * Get available entity types
   */
  getAvailableTypes() {
    return Array.from(this.entityTypes.keys());
  }

  /**
   * Check if entity type exists
   */
  hasType(type) {
    return this.entityTypes.has(type);
  }
}

// Create global factory instance
const entityFactory = new EntityFactory();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { EntityFactory, entityFactory };
} else if (typeof window !== "undefined") {
  window.EntityFactory = EntityFactory;
  window.entityFactory = entityFactory;
}
