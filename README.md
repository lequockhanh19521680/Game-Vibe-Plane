# Game-Vibe-Plane

A fast-paced space survival game where you navigate through cosmic hazards, collect power-ups, and trigger epic events.

![Game Screenshot](assets/images/screenshot.png) _(Add an actual screenshot of your game)_

## 🎮 Game Overview

Game-Vibe-Plane is an action-packed web-based arcade game that puts players in control of a spacecraft navigating through increasingly challenging space hazards. The game features a dynamic event system, power-ups, and special abilities that create a unique experience with every playthrough.

### Key Features:

- **Dynamic Hazard System**: Dodge asteroids, missiles, black holes, and laser grids
- **Special Events**: Experience random cosmic events like asteroid showers, wormhole portals, and supernova explosions
- **Power-ups**: Collect crystal shards for temporary shields and other bonuses
- **Thunder Shield**: Activate your special thunder shield to create lightning strikes against nearby objects
- **Increasing Difficulty**: The game progressively becomes more challenging the longer you survive

## 🚀 How to Play

1. **Movement**: Move your mouse (or finger on touch devices) to control your spacecraft
2. **Scoring**: Earn points by traveling distance and through skillful maneuvering
3. **Survival**: Avoid collisions with hazards and obstacles to stay alive
4. **Thunder Shield**: Press the spacebar when the thunder shield is active to generate lightning strikes
5. **Power-ups**: Collect crystal shards for temporary protection

## 💻 Technical Details

### Technologies Used

- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS for styling and UI elements
- Web Audio API for sound effects and music

### Game Architecture

- **Core Game Loop**: Handles physics updates, collision detection, and rendering
- **Entity Component System**: Manages game objects like asteroids, missiles, and power-ups
- **Event System**: Controls the random triggering of special cosmic events
- **Particle System**: Creates visual effects for explosions and environmental ambiance

## 🛠️ Development

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of HTML, CSS, and JavaScript (for developers)

### Setup for Development

1. Clone the repository:

```
git clone https://github.com/yourusername/Game-Vibe-Plane.git
```

2. Open `index.html` in your browser or use a local development server.

3. For development with live reload, you can use:

```
npx live-server
```

### Project Structure

```
Game-Vibe-Plane/
├── css/                  # Stylesheets
├── js/                   # JavaScript files
│   ├── audio/            # Audio system files
│   ├── base/             # Base entity classes
│   ├── core/             # Core game mechanics
│   ├── entities/         # Game entity definitions
│   ├── ui/               # User interface code
│   └── utils/            # Helper utilities
├── assets/               # Game assets
│   ├── images/           # Graphics and sprites
│   └── sounds/           # Sound effects and music
├── index.html            # Main HTML file
└── README.md             # This documentation file
```

## ✨ Recent Improvements

- Thunder shield now properly generates lightning strikes against nearby objects
- Events now occur randomly throughout gameplay rather than being score-restricted
- Increased variety and frequency of cosmic hazards
- Improved visual effects for shield impacts and explosions
- Enhanced audio system for more immersive gameplay

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Font awesome for UI icons
- All contributors who helped improve the game

---

Enjoy playing Game-Vibe-Plane!

_Last updated: May 2024_
