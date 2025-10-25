# File Structure Guide

This document outlines the improved file structure for the Game Vibe Plane project following industry best practices.

## 📁 Project Structure Overview

```
game-vibe-plane/
├── 📁 backend/                    # Serverless backend
│   ├── 📁 src/
│   │   ├── 📁 handlers/           # Lambda function handlers
│   │   │   ├── 📁 auth/           # Authentication handlers
│   │   │   ├── 📁 game/           # Game-related handlers
│   │   │   ├── 📁 leaderboard/    # Leaderboard handlers
│   │   │   ├── 📁 avatar/         # Avatar management handlers
│   │   │   ├── 📁 websocket/      # WebSocket handlers
│   │   │   └── 📁 admin/          # Administrative handlers
│   │   ├── 📁 utils/              # Shared utilities
│   │   │   ├── 📁 database/       # Database utilities
│   │   │   ├── 📁 storage/        # S3/storage utilities
│   │   │   ├── 📁 validation/     # Input validation
│   │   │   ├── 📁 security/       # Security utilities
│   │   │   └── 📁 monitoring/     # Logging/monitoring
│   │   ├── 📁 models/             # Data models and schemas
│   │   ├── 📁 services/           # Business logic services
│   │   └── 📁 middleware/         # Lambda middleware
│   ├── 📁 schemas/                # JSON schemas for validation
│   ├── 📁 tests/                  # Test files
│   │   ├── 📁 unit/               # Unit tests
│   │   ├── 📁 integration/        # Integration tests
│   │   └── 📁 fixtures/           # Test data
│   ├── 📁 scripts/                # Deployment and utility scripts
│   ├── 📁 docs/                   # Backend documentation
│   ├── serverless.yml             # Legacy serverless config
│   ├── serverless-refactored.yml  # New optimized config
│   ├── package.json
│   └── README.md
├── 📁 frontend/                   # Client-side application
│   ├── 📁 src/                    # Source code (future React migration)
│   ├── 📁 js/                     # Current JavaScript modules
│   │   ├── 📁 api/                # API communication
│   │   ├── 📁 audio/              # Audio system
│   │   ├── 📁 base/               # Base classes
│   │   ├── 📁 config/             # Configuration
│   │   ├── 📁 core/               # Core game logic
│   │   ├── 📁 entities/           # Game entities
│   │   ├── 📁 ui/                 # User interface
│   │   │   ├── components/        # Reusable UI components
│   │   │   ├── modals/            # Modal dialogs
│   │   │   └── screens/           # Game screens
│   │   └── 📁 utils/              # Utility functions
│   ├── 📁 css/                    # Stylesheets
│   │   ├── 📁 components/         # Component-specific styles
│   │   ├── 📁 layouts/            # Layout styles
│   │   └── 📁 themes/             # Theme variations
│   ├── 📁 assets/                 # Static assets
│   │   ├── 📁 images/             # Image files
│   │   ├── 📁 audio/              # Audio files
│   │   ├── 📁 fonts/              # Font files
│   │   └── 📁 icons/              # Icon files
│   ├── 📁 tests/                  # Frontend tests
│   ├── 📁 docs/                   # Frontend documentation
│   ├── index.html
│   ├── gameConfig.js
│   └── README.md
├── 📁 infrastructure/             # Infrastructure as Code
│   ├── 📁 cloudformation/         # CloudFormation templates
│   ├── 📁 terraform/              # Terraform configurations
│   └── 📁 scripts/                # Infrastructure scripts
├── 📁 docs/                       # Project documentation
│   ├── 📁 api/                    # API documentation
│   ├── 📁 architecture/           # Architecture diagrams
│   ├── 📁 deployment/             # Deployment guides
│   └── 📁 user/                   # User documentation
├── 📁 scripts/                    # Project-wide scripts
├── 📁 .github/                    # GitHub workflows and templates
│   ├── 📁 workflows/              # CI/CD workflows
│   └── 📁 ISSUE_TEMPLATE/         # Issue templates
├── COST_OPTIMIZATION.md
├── FILE_STRUCTURE.md
├── DEPLOYMENT.md
├── README.md
└── samconfig.toml
```

## 🎯 Best Practices Implemented

### 1. **Separation of Concerns**
- **Backend**: Pure API and business logic
- **Frontend**: UI and client-side logic
- **Infrastructure**: Deployment and configuration
- **Documentation**: Comprehensive project docs

### 2. **Modular Architecture**
- **Handlers**: Organized by feature domain
- **Services**: Reusable business logic
- **Utils**: Shared utility functions
- **Models**: Data structure definitions

### 3. **Testing Strategy**
```
tests/
├── unit/                 # Fast, isolated tests
├── integration/          # API and database tests
├── e2e/                 # End-to-end tests
└── fixtures/            # Test data and mocks
```

### 4. **Configuration Management**
```
config/
├── development.yml      # Dev environment
├── staging.yml         # Staging environment
├── production.yml      # Production environment
└── local.yml           # Local development
```

## 📂 Detailed Structure

### Backend Structure

```
backend/src/
├── handlers/
│   ├── game/
│   │   ├── submitScore.js
│   │   ├── getLeaderboard.js
│   │   └── getCountryLeaderboard.js
│   ├── avatar/
│   │   ├── uploadAvatar.js
│   │   ├── updateAvatar.js
│   │   └── getAvatar.js
│   ├── websocket/
│   │   ├── connect.js
│   │   ├── disconnect.js
│   │   └── message.js
│   └── admin/
│       ├── generateStats.js
│       └── cleanupConnections.js
├── services/
│   ├── GameService.js
│   ├── LeaderboardService.js
│   ├── AvatarService.js
│   └── NotificationService.js
├── utils/
│   ├── database/
│   │   ├── dynamodb.js
│   │   └── queries.js
│   ├── storage/
│   │   ├── s3.js
│   │   └── imageProcessor.js
│   ├── validation/
│   │   ├── schemas.js
│   │   └── validators.js
│   └── security/
│       ├── auth.js
│       ├── cors.js
│       └── sanitization.js
└── models/
    ├── User.js
    ├── Score.js
    ├── Avatar.js
    └── Country.js
```

### Frontend Structure

```
frontend/js/
├── api/
│   ├── BackendAPI.js
│   ├── WebSocketClient.js
│   └── endpoints.js
├── core/
│   ├── Game.js
│   ├── GameStateManager.js
│   └── EventSystem.js
├── ui/
│   ├── components/
│   │   ├── Button.js
│   │   ├── Modal.js
│   │   └── LoadingSpinner.js
│   ├── screens/
│   │   ├── MainMenu.js
│   │   ├── GameScreen.js
│   │   └── GameOver.js
│   └── modals/
│       ├── AvatarModal.js
│       ├── SettingsModal.js
│       └── LeaderboardModal.js
├── entities/
│   ├── Player.js
│   ├── Obstacles.js
│   └── Collectibles.js
└── utils/
    ├── helpers.js
    ├── constants.js
    └── validators.js
```

## 🔧 Migration Strategy

### Phase 1: Backend Refactoring ✅
- [x] Implement new serverless configuration
- [x] Organize handlers by domain
- [x] Create service layer
- [x] Add comprehensive validation

### Phase 2: Frontend Modernization (Future)
- [ ] Migrate to React/Vue.js
- [ ] Implement component-based architecture
- [ ] Add state management (Redux/Vuex)
- [ ] Implement proper routing

### Phase 3: Infrastructure Enhancement (Future)
- [ ] Add Terraform configurations
- [ ] Implement GitOps workflows
- [ ] Add comprehensive monitoring
- [ ] Implement blue-green deployments

## 📋 File Naming Conventions

### Backend Files
- **Handlers**: `camelCase.js` (e.g., `submitScore.js`)
- **Services**: `PascalCase.js` (e.g., `GameService.js`)
- **Utils**: `camelCase.js` (e.g., `dynamodb.js`)
- **Tests**: `*.test.js` or `*.spec.js`

### Frontend Files
- **Components**: `PascalCase.js` (e.g., `AvatarModal.js`)
- **Utilities**: `camelCase.js` (e.g., `helpers.js`)
- **Styles**: `kebab-case.css` (e.g., `avatar-modal.css`)
- **Assets**: `kebab-case.ext` (e.g., `game-banner.jpg`)

### Configuration Files
- **Environment**: `environment.yml`
- **Schemas**: `kebab-case.json`
- **Scripts**: `kebab-case.sh`

## 🎨 Code Organization Principles

### 1. **Domain-Driven Design**
- Group related functionality together
- Clear boundaries between domains
- Shared utilities in common areas

### 2. **Dependency Management**
- Clear dependency hierarchy
- Minimal circular dependencies
- Explicit imports/exports

### 3. **Configuration as Code**
- Environment-specific configurations
- Schema-driven validation
- Infrastructure as Code

### 4. **Documentation Co-location**
- README files in each major directory
- Inline code documentation
- API documentation with code

## 🚀 Benefits of This Structure

### 1. **Maintainability**
- Easy to locate and modify code
- Clear separation of concerns
- Consistent naming conventions

### 2. **Scalability**
- Easy to add new features
- Modular architecture
- Independent deployments

### 3. **Developer Experience**
- Intuitive file organization
- Clear development workflows
- Comprehensive documentation

### 4. **Testing**
- Isolated unit tests
- Comprehensive integration tests
- Easy mock and fixture management

This file structure provides a solid foundation for the Game Vibe Plane project, supporting both current needs and future growth.