# Game Vibe Plane - Real-time Space Survival Game

A fast-paced space survival game with **real-time global leaderboards** where you navigate through cosmic hazards, collect power-ups, and compete with players worldwide.

## 🎮 Game Overview

Game Vibe Plane is an action-packed web-based arcade game featuring real-time multiplayer leaderboards. Navigate your spacecraft through increasingly challenging space hazards while competing for the top spot on global and country-based leaderboards.

### 🌟 Key Features

- **🏆 Real-time Global Leaderboards**: Compete with players worldwide with live updates
- **🌍 Country Rankings**: Countries ranked by top 10% of players' combined scores
- **⚡ Dynamic Event System**: Experience random cosmic events like asteroid showers, plasma storms, and magnetic fields
- **💎 Power-ups & Shields**: Collect crystal shards for temporary protection
- **📊 Live Statistics**: Track your progress with detailed statistics and death analytics
- **🔄 WebSocket Integration**: Real-time updates without page refresh
- **📱 Responsive Design**: Play on desktop, tablet, or mobile devices

### 🎯 Game Mechanics

1. **Movement**: Mouse/touch control for precise spacecraft navigation
2. **Scoring**: Earn points through movement and survival time
3. **Survival**: Avoid asteroids, missiles, black holes, lasers, and other hazards
4. **Events**: Random cosmic events that change gameplay dynamics
5. **Competition**: Real-time ranking against global players

## 🏗️ Architecture

### Frontend (Client)
- **HTML5 Canvas** for high-performance rendering
- **Vanilla JavaScript** for game logic and real-time communication
- **WebSocket** connection for live leaderboard updates
- **CSS3** for modern UI styling with animations

### Backend (AWS Serverless)
- **API Gateway** for REST endpoints and WebSocket connections
- **AWS Lambda** for serverless compute functions
- **DynamoDB** with streams for real-time data processing
- **Multiple GeoIP services** for reliable country detection

### Real-time Flow
```
Player Game Over → Submit Score → AWS Lambda → DynamoDB → 
DynamoDB Streams → Process Update → WebSocket Broadcast → 
All Connected Players → Live Leaderboard Update
```

## 🚀 Quick Start

### For Players
1. Open `frontend/index.html` in a modern web browser
2. Click "Start Battle" to begin playing
3. Check the "Live Dashboard" for real-time leaderboards
4. Compete for the top spots globally and in your country!

### For Developers

#### Frontend Development
```bash
cd frontend
# Serve locally (optional)
npx live-server
```

#### Backend Deployment
```bash
cd backend
npm install
npm run deploy  # Deploy to AWS
```

See [Backend README](backend/README.md) for detailed deployment instructions.

## 📊 Leaderboard System

### Global Leaderboard
- **Top 10 players** worldwide by highest score
- **Real-time updates** when new high scores are achieved
- Shows player name, country, score, and survival time

### Country Rankings
- **Top 10 countries** ranked by combined score of top 10% players
- **Fair competition** - prevents countries with many players from dominating
- **Live updates** as players from each country improve

### Statistics Tracking
- Personal best scores and survival times
- Death cause analytics (asteroids, missiles, etc.)
- Games played and average performance
- Local storage backup for offline play

## 🌍 Global Competition Features

### Real-time Updates
- **Live leaderboard** updates via WebSocket
- **Instant notifications** when rankings change
- **Connection status** indicator shows live/offline state

### Country Detection
- **Automatic IP geolocation** with multiple fallback services
- **Flag display** for visual country representation
- **Privacy-conscious** - only country-level data stored

### Fair Ranking Algorithm
Countries ranked by **top 10% of players** ensures:
- Quality over quantity competition
- Small countries can compete with large ones
- Encourages skill development over participation

## 🛠️ Technical Implementation

### Frontend Architecture
```
frontend/
├── index.html              # Main game page
├── css/
│   ├── styles.css         # Core game styling
│   ├── dialog.css         # UI dialog styling
│   └── leaderboard.css    # Real-time leaderboard styling
├── js/
│   ├── api/
│   │   └── backendApi.js  # AWS backend communication
│   ├── core/
│   │   ├── game.js        # Main game loop
│   │   ├── eventSystem.js # Dynamic events
│   │   └── gameStateManager.js # State management
│   ├── entities/          # Game objects (player, asteroids, etc.)
│   ├── ui/
│   │   └── dashboard.js   # Real-time leaderboard UI
│   └── utils/             # Helper functions
└── gameConfig.js          # Game configuration
```

### Backend Architecture
```
backend/
├── serverless.yml         # AWS infrastructure definition
├── src/
│   ├── handlers/          # Lambda function handlers
│   │   ├── submitScore.js # Score submission endpoint
│   │   ├── getLeaderboard.js # Leaderboard retrieval
│   │   ├── websocket.js   # WebSocket connection handling
│   │   └── processScoreUpdate.js # Real-time processing
│   └── utils/
│       ├── dynamodb.js    # Database operations
│       ├── geoip.js       # Country detection
│       └── websocket.js   # WebSocket utilities
└── package.json
```

## 🔧 Configuration

### Backend Configuration
Update `frontend/js/api/backendApi.js`:
```javascript
const BACKEND_CONFIG = {
  API_BASE_URL: "https://your-api-id.execute-api.region.amazonaws.com/stage",
  USE_BACKEND: true,
  FALLBACK_TO_LOCAL: true
};
```

### Game Configuration
Modify `frontend/gameConfig.js` for:
- Difficulty progression
- Event frequencies and types
- Scoring mechanics
- Visual and audio settings

## 📈 Performance & Scalability

### Cost-Optimized AWS Architecture
- **DynamoDB**: Pay-per-request pricing
- **Lambda**: Serverless with generous free tier
- **API Gateway**: Pay-per-request with WebSocket support
- **Expected cost**: $1-5 USD/month for moderate usage (1000+ games)

### Real-time Performance
- **WebSocket connections** for instant updates
- **DynamoDB Streams** for efficient real-time processing
- **Optimized queries** with Global Secondary Indexes
- **Connection management** with automatic cleanup

### Scalability Features
- **Serverless architecture** scales automatically
- **Global deployment** possible with CloudFront
- **Multi-region support** for reduced latency
- **Efficient caching** strategies for leaderboards

## 🎮 Game Events & Features

### Dynamic Events
- **Asteroid Showers**: Waves of space debris
- **Missile Barrages**: Guided projectile attacks
- **Plasma Storms**: Energy field hazards
- **Magnetic Storms**: Electromagnetic interference
- **Black Hole Chains**: Gravitational anomalies
- **Crystal Rain**: Collectible power-up events
- **Laser Grids**: Precision beam patterns
- **Wormhole Portals**: Teleportation effects

### Power-ups & Abilities
- **Crystal Shields**: Temporary invincibility
- **Energy Orbs**: Score multipliers
- **Thunder Shield**: Lightning strike abilities
- **Quantum Portals**: Emergency teleportation

## 🚨 Troubleshooting

### Common Issues

#### Frontend Issues
- **Events not triggering**: Check browser console for JavaScript errors
- **Leaderboard not loading**: Verify backend configuration and internet connection
- **WebSocket connection fails**: Check CORS settings and WebSocket URL format

#### Backend Issues
- **Deployment fails**: Verify AWS credentials and permissions
- **CORS errors**: Check API Gateway CORS configuration
- **DynamoDB errors**: Verify IAM roles and table permissions

### Debug Mode
Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS Serverless** for scalable backend infrastructure
- **Multiple GeoIP services** for reliable country detection
- **Web Audio API** for immersive sound experience
- **HTML5 Canvas** for high-performance graphics
- **Font Awesome** for UI icons
- **All contributors** who helped improve the game

## 🔗 Links

- [Backend Documentation](backend/README.md)
- [Live Demo](https://your-game-url.com) _(Update with actual URL)_
- [AWS Architecture Guide](backend/README.md#architecture)

---

**Ready to compete globally? Start playing and climb the leaderboards!**

_Last updated: October 2024_
