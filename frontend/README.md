# Stellar Drift Frontend

A modern space survival game with real-time multiplayer features.

## 🚀 Quick Start

### For Players
1. Open `index.html` in a modern web browser
2. Enter your name and click "Start Battle"
3. Use mouse/touch to control your spacecraft
4. Survive as long as possible and compete on the global leaderboard!

### For Developers

#### Environment Configuration

The game uses a modern environment configuration system. Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your backend URLs:

```env
# Backend API Configuration
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/stage
VITE_WEBSOCKET_URL=wss://your-websocket-url.execute-api.region.amazonaws.com/stage

# Environment
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_LEADERBOARD=true
VITE_ENABLE_REAL_TIME_UPDATES=true
```

#### Configuration Priority

The system loads configuration in this order (highest priority first):

1. **Runtime overrides** - localStorage settings
2. **Environment variables** - `.env` file (if using Vite/bundler)
3. **Embedded configuration** - Fallback hardcoded values
4. **Defaults** - Built-in safe defaults

#### Development Setup

For local development:

```bash
# Install a local server (optional)
npm install -g live-server

# Serve the frontend
live-server --port=8080

# Or use Python
python -m http.server 8080

# Or use Node.js
npx serve -p 8080
```

#### Environment Variables

All environment variables are prefixed with `VITE_` for Vite compatibility:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | None |
| `VITE_WEBSOCKET_URL` | WebSocket URL | None |
| `VITE_ENVIRONMENT` | Environment name | `production` |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` |
| `VITE_ENABLE_LEADERBOARD` | Enable leaderboard | `true` |
| `VITE_ENABLE_REAL_TIME_UPDATES` | Enable WebSocket updates | `true` |

#### Configuration API

Access configuration in your code:

```javascript
// Get configuration value
const apiUrl = window.getConfig('apiBaseUrl');

// Check if feature is enabled
if (window.isFeatureEnabled('leaderboard')) {
  // Initialize leaderboard
}

// Get environment info
const env = window.environmentConfig.getEnvironmentInfo();
console.log('Running in:', env.environment);
```

## 🎮 Game Features

- **Real-time Global Leaderboards** - Compete with players worldwide
- **Multi-language Support** - 20+ languages supported
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dynamic Events** - Random cosmic events change gameplay
- **Progressive Difficulty** - Game gets harder as you survive longer
- **Audio System** - Immersive sound effects and music
- **Customizable Settings** - Adjust graphics, audio, and gameplay

## 🌍 Supported Languages

- English, Vietnamese, Chinese, Japanese, Korean
- Spanish, French, German, Russian, Arabic
- Hindi, Portuguese, Italian, Dutch, Swedish
- Turkish, Polish, Thai, Indonesian, Malay

## 📱 Mobile Support

The game is fully optimized for mobile devices:

- **Touch Controls** - Intuitive touch navigation
- **Responsive UI** - Adapts to all screen sizes
- **Performance Optimized** - Smooth gameplay on mobile
- **Offline Capable** - Core game works without internet

## 🔧 Customization

### Game Configuration

Edit `gameConfig.js` to customize:

- Difficulty progression
- Event frequencies
- Scoring mechanics
- Visual effects
- Audio settings

### Styling

The game uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #00ffff;
  --danger-color: #ff4444;
  --energy-color: #aa66cc;
  --highlight-color: #ffbb33;
}
```

### Adding New Languages

1. Add language to `js/config/settings.js`:

```javascript
languages: {
  // ... existing languages
  newLang: {
    code: 'xx',
    name: 'Language Name',
    flag: '🏁'
  }
}
```

2. Add translations:

```javascript
translations: {
  // ... existing translations
  xx: {
    'menu.title': 'Translated Title',
    // ... other translations
  }
}
```

## 🚨 Troubleshooting

### Configuration Issues

1. **No backend connection**:
   - Check `.env` file exists and has correct URLs
   - Verify CORS settings on your backend
   - Check browser console for errors

2. **WebSocket connection fails**:
   - Ensure WebSocket URL uses `wss://` for HTTPS sites
   - Check firewall/proxy settings
   - Verify WebSocket endpoint is accessible

3. **Game not loading**:
   - Check browser console for JavaScript errors
   - Ensure all files are served over HTTP/HTTPS (not file://)
   - Verify all script files are accessible

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// In browser console
localStorage.setItem('stellarDriftConfig', JSON.stringify({
  debugMode: true,
  showConsoleLogs: true
}));

// Reload the page
location.reload();
```

### Performance Issues

1. **Low FPS on mobile**:
   - Disable particle effects in settings
   - Reduce screen shake effects
   - Close other browser tabs

2. **Memory usage**:
   - The game automatically manages memory
   - Restart if playing for extended periods
   - Check for browser memory leaks

## 📊 Analytics & Monitoring

The game includes built-in analytics (can be disabled):

- Player engagement metrics
- Performance monitoring
- Error tracking
- Feature usage statistics

Disable analytics:

```env
VITE_ENABLE_ANALYTICS=false
```

## 🔒 Security

- Environment variables are not exposed to client
- API endpoints use secure HTTPS/WSS
- No sensitive data stored in localStorage
- CORS properly configured
- Input validation on all user data

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to play? Open `index.html` and start your space adventure!**