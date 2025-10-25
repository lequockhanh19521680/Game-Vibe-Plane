# Game Vibe Plane - Real-time Leaderboard System

A modern, scalable real-time leaderboard system built with AWS serverless technologies, optimized for 1-1000 concurrent users following AWS Well-Architected Framework principles.

## 🏗️ Architecture Overview

### New Optimized Architecture (v2.0)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CloudFront (Prod) ──┐                                                         │
│  S3 Static Hosting ──┼── HTML/CSS/JS Game Client                              │
│  CodePipeline CI/CD ─┘                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                   HTTPS/WSS
                                      │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  API Gateway (REST) ──┬── Lambda Functions ──┬── DynamoDB Tables              │
│  API Gateway (WS) ────┘                      │   ├── Game Sessions            │
│                                              │   ├── Leaderboard              │
│                                              │   └── WebSocket Connections    │
│                                              │                                 │
│  DynamoDB Streams ───────────────────────────┼── Real-time Updates            │
│  CloudWatch Monitoring ──────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Improvements

✅ **Cost Optimization**
- Pay-per-request DynamoDB billing
- Right-sized Lambda functions (256MB)
- CloudFront only for production
- Automated resource cleanup

✅ **Performance**
- Node.js 20.x runtime
- Optimized database queries with GSIs
- Connection pooling and caching
- Real-time updates via DynamoDB Streams

✅ **Security**
- Least privilege IAM policies
- Input validation and sanitization
- CORS configuration
- TTL for automatic data cleanup

✅ **Reliability**
- Multi-AZ DynamoDB with point-in-time recovery
- CloudWatch monitoring and alerting
- Structured logging
- Error handling and retries

✅ **Operational Excellence**
- Infrastructure as Code (Serverless + CloudFormation)
- Automated CI/CD pipelines
- Environment separation (dev/staging/prod)
- Comprehensive monitoring

## 📁 Project Structure

```
game-vibe-plane/
├── infrastructure/                 # Backend infrastructure (NEW)
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   │   ├── database.js        # DynamoDB configuration
│   │   │   └── constants.js       # Application constants
│   │   ├── handlers/              # Lambda function handlers
│   │   │   ├── game/              # Game session management
│   │   │   ├── leaderboard/       # Leaderboard operations
│   │   │   ├── websocket/         # WebSocket handlers
│   │   │   ├── streams/           # DynamoDB stream processors
│   │   │   └── system/            # Health checks
│   │   ├── services/              # Business logic services
│   │   │   ├── gameSessionService.js
│   │   │   ├── leaderboardService.js
│   │   │   └── websocketService.js
│   │   └── utils/                 # Utility functions
│   │       ├── logger.js          # Structured logging
│   │       ├── response.js        # API responses
│   │       └── validation.js      # Input validation
│   ├── cloudformation/            # CloudFormation templates
│   │   ├── frontend-infrastructure.yml
│   │   └── monitoring.yml
│   ├── scripts/                   # Deployment scripts
│   │   ├── deploy.sh             # Automated deployment
│   │   └── cleanup.sh            # Resource cleanup
│   ├── serverless.yml            # Serverless configuration
│   └── package.json              # Dependencies
├── frontend/                      # Frontend application
│   ├── js/
│   │   ├── config/
│   │   │   └── endpoints.js       # API endpoints configuration
│   │   └── ... (existing frontend files)
│   └── ... (existing frontend files)
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or later
- **AWS CLI** v2 configured
- **Serverless Framework** v3
- **Git**

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd game-vibe-plane/infrastructure

# Install dependencies
npm install

# Install Serverless Framework globally
npm install -g serverless
```

### 2. Configure AWS Credentials

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=ap-southeast-1

# Option 3: AWS Profile
aws configure --profile game-vibe-plane
export AWS_PROFILE=game-vibe-plane
```

### 3. Deploy to Development

```bash
# Simple deployment
./scripts/deploy.sh -e dev

# With custom region
./scripts/deploy.sh -e dev -r us-east-1

# With monitoring alerts
./scripts/deploy.sh -e dev --notification-email your-email@example.com
```

### 4. Deploy to Production

```bash
# Create CodeStar connection first (for CI/CD)
# Then deploy with monitoring
./scripts/deploy.sh -e prod --notification-email admin@example.com
```

## 🛠️ Deployment Options

### Environment-Specific Deployments

```bash
# Development (basic setup)
./scripts/deploy.sh -e dev

# Staging (with pipeline)
./scripts/deploy.sh -e staging --notification-email team@example.com

# Production (full setup with monitoring)
./scripts/deploy.sh -e prod --notification-email admin@example.com
```

### Partial Deployments

```bash
# Backend only
./scripts/deploy.sh -e dev --skip-frontend

# Frontend only
./scripts/deploy.sh -e dev --skip-backend

# With specific AWS profile
./scripts/deploy.sh -e prod -p production-profile
```

## 📊 Monitoring and Observability

### CloudWatch Dashboards

The system includes comprehensive monitoring:

- **Lambda Metrics**: Duration, errors, invocations
- **DynamoDB Metrics**: Read/write capacity, throttles
- **API Gateway Metrics**: Latency, error rates
- **Custom Metrics**: Game sessions, high scores, WebSocket connections

### Alerts and Notifications

Automated alerts for:
- High error rates (>5 errors in 5 minutes)
- High latency (>10 seconds average)
- DynamoDB throttling
- API Gateway 5XX errors
- Cost anomalies (production only)

### Log Analysis

Structured JSON logging with:
- Request tracing with correlation IDs
- Performance metrics
- Error details with stack traces
- Business metrics (game sessions, scores)

## 💰 Cost Optimization

### Expected Monthly Costs (1-1000 users)

| Service | Development | Production |
|---------|-------------|------------|
| Lambda | $0.50 | $5.00 |
| DynamoDB | $1.00 | $10.00 |
| API Gateway | $1.00 | $8.00 |
| CloudFront | - | $3.00 |
| S3 | $0.50 | $2.00 |
| CloudWatch | $1.00 | $5.00 |
| **Total** | **~$4** | **~$33** |

### Cost Optimization Features

- **Pay-per-request** DynamoDB billing
- **Automatic scaling** with Lambda
- **CloudFront** only for production
- **Log retention** limits (7-14 days)
- **TTL** for automatic data cleanup
- **Resource scheduling** (optional)

## 🔒 Security Features

### Data Protection
- Input validation with Joi schemas
- SQL injection prevention
- XSS protection with input sanitization
- Rate limiting via API Gateway

### Access Control
- Least privilege IAM policies
- Resource-based permissions
- Environment isolation
- CORS configuration

### Network Security
- HTTPS/WSS only
- API Gateway throttling
- CloudFront security headers (production)

## 🔧 Configuration

### Environment Variables

Key configuration options:

```bash
# Backend Configuration
NODE_ENV=production
LOG_LEVEL=INFO
REGION=ap-southeast-1

# Database Configuration
GAME_SESSIONS_TABLE=game-vibe-plane-game-sessions-prod
LEADERBOARD_TABLE=game-vibe-plane-leaderboard-prod
WEBSOCKET_CONNECTIONS_TABLE=game-vibe-plane-websocket-connections-prod

# WebSocket Configuration
WEBSOCKET_ENDPOINT=wss://abc123.execute-api.ap-southeast-1.amazonaws.com/prod
```

### Frontend Configuration

Update `frontend/js/config/endpoints.js`:

```javascript
const BACKEND_CONFIG = {
  API_BASE_URL: "https://your-api-gateway-url/prod",
  WEBSOCKET_URL: "wss://your-websocket-url/prod",
  USE_BACKEND: true,
  FALLBACK_TO_LOCAL: false,
};
```

## 🧪 Testing

### API Testing

```bash
# Health check
curl https://your-api-url/health

# Create game session
curl -X POST https://your-api-url/game/session \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","username":"TestPlayer"}'

# Get leaderboard
curl https://your-api-url/leaderboard/global?limit=10
```

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Run load test (create your own artillery config)
artillery run load-test-config.yml
```

## 📈 Scaling Considerations

### Current Capacity (1-1000 users)

- **API Gateway**: 10,000 requests/second
- **Lambda**: 1,000 concurrent executions
- **DynamoDB**: Auto-scaling (pay-per-request)
- **WebSocket**: 10,000 concurrent connections

### Scaling Beyond 1000 Users

1. **Enable DynamoDB auto-scaling**
2. **Implement API caching**
3. **Add CloudFront for API endpoints**
4. **Consider Lambda provisioned concurrency**
5. **Implement database sharding**

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Verify permissions
   aws iam get-user
   ```

2. **CORS Errors**
   - Check API Gateway CORS configuration
   - Verify frontend endpoint configuration

3. **WebSocket Connection Fails**
   - Check WebSocket URL format (wss://)
   - Verify security group settings

4. **High Latency**
   - Check CloudWatch Lambda duration metrics
   - Review DynamoDB query patterns
   - Check for cold starts

### Debug Mode

```bash
# Enable verbose logging
export LOG_LEVEL=DEBUG

# Enable Serverless debug mode
export SLS_DEBUG=*
serverless deploy --verbose
```

## 🧹 Cleanup

### Remove All Resources

```bash
# Remove development environment
./scripts/cleanup.sh -e dev

# Remove production (with confirmation)
./scripts/cleanup.sh -e prod

# Force removal without prompts
./scripts/cleanup.sh -e staging --force
```

### Partial Cleanup

```bash
# Remove only backend
serverless remove --stage dev

# Remove specific CloudFormation stack
aws cloudformation delete-stack --stack-name game-vibe-plane-frontend-dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Workflow

```bash
# Local development
cd infrastructure
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 API Documentation

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/game/session` | Create new game session |
| POST | `/game/session/{id}/end` | End game session |
| GET | `/leaderboard/global` | Get global leaderboard |
| GET | `/leaderboard/country/{code}` | Get country leaderboard |
| GET | `/health` | Health check |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `connect` | Client connects |
| `disconnect` | Client disconnects |
| `ping/pong` | Heartbeat |
| `leaderboard_update` | Real-time leaderboard updates |

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **AWS Support**: Use AWS Support for infrastructure issues
- **Community**: Join our Discord/Slack for discussions

---

**Built with ❤️ using AWS Serverless Technologies**

*Optimized for cost-effectiveness and scalability following AWS Well-Architected Framework principles.*