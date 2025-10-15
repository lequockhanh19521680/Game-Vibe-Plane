# Stellar Drift: Singularity - Code Structure

## 📁 Project Structure

This game has been refactored from a single monolithic HTML file into a professional, modular structure:

```
Game-Vibe-Plane/
├── index.html              # Main HTML file (clean!)
├── gameConfig.js           # Game configuration and balancing
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── audio/
│   │   └── audioSystem.js  # Complete audio system
│   ├── base/
│   │   └── Entity.js       # Base entity classes (SOLID principles)
│   ├── entities/           # Modular entity classes
│   │   ├── player.js       # Player class
│   │   ├── obstacles.js    # Asteroid, Laser, BlackHole, Missile, LaserMine
│   │   ├── collectibles.js # EnergyOrb, CrystalShard, ShieldGenerator, CrystalCluster
│   │   ├── hazards.js      # PlasmaField, LightningStorm, MagneticStorm, etc.
│   │   ├── portals.js      # QuantumPortal, Wormhole
│   │   ├── visuals.js      # Particle, Star, Fragment, MissileFragment
│   │   └── warnings.js     # Warning, CircleWarning, BeltWarning
│   ├── core/
│   │   └── game.js         # Game loop, init, animate, spawning
│   ├── utils/
│   │   └── helpers.js      # Utility functions (screen shake, events)
│   └── main.js             # Entry point, variables, event listeners
├── .gitignore              # Git ignore rules
└── STRUCTURE.md            # This file
```

## 📄 File Descriptions

### Core Files

#### `index.html` (61 lines)
- Clean HTML structure
- Canvas element
- UI elements (score, screens, buttons)
- Script imports in correct order

#### `gameConfig.js`
- Centralized configuration
- Player settings
- Enemy settings (asteroids, lasers, black holes, missiles, etc.)
- Difficulty progression
- Visual settings
- Audio settings
- Event system configuration

### JavaScript Modules

#### `js/base/Entity.js` (NEW - SOLID Principles)
Base classes following SOLID principles for code reusability and maintainability:
- **Entity** - Base class for all game entities
- **CircularEntity** - Entities with position and radius
- **MovableEntity** - Entities with velocity
- **ColoredEntity** - Entities with color
- **TemporaryEntity** - Entities with life timer

These base classes provide common functionality and reduce code duplication.

#### `js/entities/player.js`
Player character class:
- **Player** - Player ship with trail, shields (regular & thunder), abilities
- Movement and controls
- Shield management
- Thunder shield collision detection
- Lightning strike effects

#### `js/entities/obstacles.js`
Obstacle entities that the player must avoid:
- **Asteroid** - Dynamic obstacles with varied movement patterns
- **Laser** - Screen-crossing laser beams
- **BlackHole** - Gravitational hazards
- **Missile** - Homing projectiles
- **LaserMine** - Stationary laser traps

#### `js/entities/collectibles.js`
Power-ups and collectible items:
- **EnergyOrb** - Score bonuses
- **CrystalShard** - Shield activation
- **ShieldGenerator** - Shield power-up
- **CrystalCluster** - Special collectible with discharge effect

#### `js/entities/hazards.js`
Environmental hazards and special obstacles:
- **PlasmaField** - Damaging plasma zones
- **FreezeZone** - Time-slowing areas
- **LaserTurret** - Rotating laser obstacles
- **LightningStorm** - Electric storm hazards
- **MagneticStorm** - Magnetic field obstacles
- **SuperNova** - Explosive clearing hazards

#### `js/entities/portals.js`
Teleportation and dimensional entities:
- **QuantumPortal** - Teleportation portals
- **Wormhole** - Wormhole travel

#### `js/entities/visuals.js`
Visual effects and background elements:
- **Particle** - Generic particle effects
- **Star** - Background stars with parallax
- **Fragment** - Debris fragments from destroyed asteroids
- **MissileFragment** - Missile explosion fragments

#### `js/entities/warnings.js`
Warning indicators for upcoming hazards:
- **Warning** - Generic warning indicator
- **CircleWarning** - Circular asteroid formation warning
- **BeltWarning** - Asteroid belt warning

#### `js/audio/audioSystem.js`
Complete audio system using Web Audio API:
- `initAudioSystem()` - Initialize audio context
- `playSound(type)` - Play sound effects
- `startBackgroundMusic()` - Background music
- `stopBackgroundMusic()` - Stop music
- Individual sound functions for all game events

#### `js/core/game.js`
Core game logic:
- `createNebula()` - Background nebula generation
- `init()` - Initialize game state
- `animate()` - Main game loop
- Difficulty progression
- Entity spawning system
- Collision detection
- Event system
- Score and level management

#### `js/utils/helpers.js`
Utility functions:
- `triggerScreenShake(intensity)` - Screen shake effect
- `triggerAsteroidCircle()` - Asteroid circle event
- `triggerAsteroidBelt()` - Asteroid belt event
- Event handling helpers

#### `js/main.js`
Entry point and setup:
- Canvas and context initialization
- Global variables (game objects, timers, state)
- UI element references
- `startGame()` - Start game function
- `endGame()` - End game function
- Event listeners (mouse, touch, buttons)
- Initial background rendering

## 🎮 Game Loading Order

The scripts are loaded in this specific order for proper dependencies:

1. `gameConfig.js` - Configuration loaded first
2. `js/audio/audioSystem.js` - Audio system
3. `js/base/Entity.js` - Base entity classes (SOLID foundation)
4. `js/entities/player.js` - Player class
5. `js/entities/visuals.js` - Visual effects
6. `js/entities/warnings.js` - Warning indicators
7. `js/entities/obstacles.js` - Obstacle classes
8. `js/entities/collectibles.js` - Collectible classes
9. `js/entities/hazards.js` - Hazard classes
10. `js/entities/portals.js` - Portal classes
11. `js/core/game.js` - Game logic
12. `js/utils/helpers.js` - Utilities
13. `js/main.js` - Initialization and event listeners

## 🔧 How to Run

1. Open `index.html` in a web browser, OR
2. Run a local server:
   ```bash
   python3 -m http.server 8000
   # Then open http://localhost:8000
   ```

## ✨ Benefits of This Structure

### Before This Refactoring
- ❌ Single `entities.js` file with 3,691 lines
- ❌ All 25 entity classes in one file
- ❌ Difficult to find specific entities
- ❌ Code duplication across similar entities
- ❌ Hard to extend or maintain

### After This Refactoring (SOLID Principles Applied)
- ✅ **Single Responsibility** - Each file has one clear purpose
- ✅ **Open/Closed** - Base classes allow extension without modification
- ✅ **Liskov Substitution** - Derived classes can replace base classes
- ✅ **Interface Segregation** - Specific base classes for different needs
- ✅ **Dependency Inversion** - Code depends on abstractions (base classes)
- ✅ Clean separation into 8 focused files (68-1461 lines each)
- ✅ Easy to locate and modify specific entity types
- ✅ Reduced code duplication through inheritance
- ✅ Better for collaboration and code review
- ✅ **Game plays identically to before!**

### File Size Breakdown
- `js/base/Entity.js` - 64 lines (base classes)
- `js/entities/player.js` - 350 lines
- `js/entities/visuals.js` - 166 lines
- `js/entities/warnings.js` - 186 lines
- `js/entities/obstacles.js` - 703 lines
- `js/entities/collectibles.js` - 569 lines
- `js/entities/hazards.js` - 1,461 lines
- `js/entities/portals.js` - 258 lines
- **Total: 3,757 lines** (was 3,691 in single file)

## 🎯 Key Points

- **No game logic changes** - The game plays exactly the same
- **SOLID principles applied** - Better architecture for future development
- **Modular design** - Each module has a clear, focused purpose
- **Easy maintenance** - Find and fix issues quickly
- **Professional structure** - Follows industry best practices
- **Well documented** - Clear file organization
- **Inheritance hierarchy** - Base classes reduce code duplication

## 🚀 Future Improvements

With this SOLID structure, you can now easily:
- **Add new entity types** - Extend base classes in appropriate category file
- **Modify entity behavior** - Changes are isolated to specific files
- **Create new entity categories** - Add new files following the same pattern
- **Refactor common code** - Move shared logic to base classes
- **Add new features** - Extend base classes without modifying existing code
- **Test entities independently** - Each file can be tested in isolation
- **Modify game balance** - Edit `gameConfig.js`
- **Add new sound effects** - Extend `audioSystem.js`
- **Implement new game modes** - Modify `game.js`

## 📝 Notes

- All functionality preserved from original
- No external dependencies added
- Compatible with all modern browsers
- Uses vanilla JavaScript (no frameworks)
- Web Audio API for sound
- Canvas 2D for rendering
