# Stellar Drift: Singularity - Code Structure

## 📁 Project Structure

This game has been refactored from a single monolithic HTML file into a professional, modular structure:

```
Game-Vibe-Plane/
├── index.html              # Main HTML file (61 lines - clean!)
├── gameConfig.js           # Game configuration and balancing
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── audio/
│   │   └── audioSystem.js  # Complete audio system
│   ├── core/
│   │   └── game.js         # Game loop, init, animate, spawning
│   ├── utils/
│   │   └── helpers.js      # Utility functions (screen shake, events)
│   ├── entities.js         # All game entity classes
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

#### `js/audio/audioSystem.js`
Complete audio system using Web Audio API:
- `initAudioSystem()` - Initialize audio context
- `playSound(type)` - Play sound effects
- `startBackgroundMusic()` - Background music
- `stopBackgroundMusic()` - Stop music
- Individual sound functions for all game events

#### `js/entities.js`
All game entity classes (29 classes total):
- **Player** - Player character with trail, shields, abilities
- **Asteroid** - Obstacles with various behaviors
- **Laser** - Laser obstacles
- **BlackHole** - Black holes with gravity
- **Missile** - Homing missiles
- **LaserMine** - Stationary mines
- **CrystalCluster** - Collectible power-ups
- **EnergyOrb** - Energy collectibles
- **PlasmaField** - Plasma hazards
- **CrystalShard** - Shard power-ups
- **QuantumPortal** - Teleportation portals
- **ShieldGenerator** - Shield power-ups
- **FreezeZone** - Time freeze zones
- **LaserTurret** - Turret obstacles
- **LightningStorm** - Lightning hazards
- **MagneticStorm** - Magnetic field obstacles
- **Wormhole** - Wormhole portals
- **SuperNova** - Explosive hazards
- **Star** - Background stars
- **Particle** - Visual effects particles
- **Fragment** - Debris fragments
- **MissileFragment** - Missile debris
- **Warning** - Warning indicators
- **CircleWarning** - Circle warnings
- **BeltWarning** - Belt warnings
- **MissileWarning** - Missile warnings
- **PlasmaWarning** - Plasma warnings
- **MeteorWarning** - Meteor warnings
- **SuperNovaWarning** - SuperNova warnings

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
3. `js/entities.js` - All game classes
4. `js/core/game.js` - Game logic
5. `js/utils/helpers.js` - Utilities
6. `js/main.js` - Initialization and event listeners

## 🔧 How to Run

1. Open `index.html` in a web browser, OR
2. Run a local server:
   ```bash
   python3 -m http.server 8000
   # Then open http://localhost:8000
   ```

## ✨ Benefits of This Structure

### Before Refactoring
- ❌ Single `index.html` file with 6,291 lines
- ❌ All JavaScript code embedded in HTML
- ❌ Difficult to maintain and debug
- ❌ Hard to find specific functionality
- ❌ Not professional or scalable

### After Refactoring
- ✅ Clean separation of concerns
- ✅ Easy to locate and modify specific features
- ✅ Professional folder structure
- ✅ Maintainable and scalable
- ✅ Clear dependencies
- ✅ Better for collaboration
- ✅ **Game plays identically to the original!**

## 🎯 Key Points

- **No game logic changes** - The game plays exactly the same
- **Modular design** - Each module has a clear purpose
- **Easy maintenance** - Find and fix issues quickly
- **Professional structure** - Follows industry best practices
- **Well documented** - Clear file organization

## 🚀 Future Improvements

With this structure, you can now easily:
- Add new enemy types (add to `entities.js`)
- Modify game balance (edit `gameConfig.js`)
- Add new sound effects (extend `audioSystem.js`)
- Implement new game modes (modify `game.js`)
- Add multiplayer features
- Create level editor
- Add more visual effects

## 📝 Notes

- All functionality preserved from original
- No external dependencies added
- Compatible with all modern browsers
- Uses vanilla JavaScript (no frameworks)
- Web Audio API for sound
- Canvas 2D for rendering
