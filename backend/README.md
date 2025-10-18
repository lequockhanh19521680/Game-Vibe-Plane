# Game Vibe Plane - Real-time Leaderboard Backend

A serverless backend built with AWS services for real-time leaderboard functionality with global and country-based rankings.

## 🏗️ Architecture

### AWS Services Used

- **API Gateway**: REST API endpoints for score submission and leaderboard retrieval
- **WebSocket API**: Real-time updates for live leaderboard
- **Lambda Functions**: Serverless compute for all backend logic
- **DynamoDB**: NoSQL database with streams for real-time processing
- **CloudWatch**: Logging and monitoring

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   (Browser)     │◄──►│   REST + WS     │◄──►│   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   DynamoDB      │◄────────────┘
                       │   + Streams     │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   GeoIP APIs    │
                       │   (External)    │
                       └─────────────────┘
```

### Database Schema

#### Scores Table
- **Primary Key**: `id` (String)
- **Attributes**: `username`, `score`, `survivalTime`, `deathCause`, `country`, `countryCode`, `clientIP`, `timestamp`
- **GSI**: `ScoreIndex` (score, timestamp) - for global leaderboard
- **GSI**: `CountryIndex` (country, score) - for country-specific leaderboard

#### Countries Table
- **Primary Key**: `country` (String)
- **Attributes**: `totalScore`, `playerCount`, `averageScore`, `lastUpdated`
- **GSI**: `TotalScoreIndex` (totalScore) - for country rankings

#### WebSocket Connections Table
- **Primary Key**: `connectionId` (String)
- **Attributes**: `ttl`, `connectedAt`
- **TTL**: Automatic cleanup of stale connections

## 🚀 Deployment

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **Node.js** (v18 or later)
3. **Serverless Framework** v3
4. **AWS CLI** configured with credentials

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Serverless Framework** (if not already installed):
   ```bash
   npm install -g serverless
   ```

3. **Configure AWS credentials**:
   ```bash
   aws configure
   # OR set environment variables:
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```

### Deploy to Development

```bash
npm run deploy
# OR
serverless deploy --stage dev
```

### Deploy to Production

```bash
npm run deploy:prod
# OR
serverless deploy --stage prod
```

### Local Development

```bash
# Install DynamoDB Local
npm install
# Start offline development server
npm run dev
```

This will start:
- REST API on `http://localhost:3000`
- WebSocket API on `http://localhost:3001`
- DynamoDB Local on `http://localhost:8000`

## 📡 API Endpoints

### REST API

#### Submit Score
```http
POST /submit-score
Content-Type: application/json

{
  "username": "Player1",
  "score": 15420,
  "survivalTime": 225,
  "deathCause": "asteroid collision",
  "clientIP": "192.168.1.1" // Optional, auto-detected
}
```

#### Get Global Leaderboard
```http
GET /leaderboard?limit=10
```

#### Get Country Leaderboard
```http
GET /leaderboard/country?limit=10&country=USA
```

#### Health Check
```http
GET /health
```

### WebSocket API

#### Connect
```javascript
const ws = new WebSocket('wss://your-api-id.execute-api.region.amazonaws.com/stage');

// Subscribe to real-time updates
ws.send(JSON.stringify({ action: 'subscribe' }));

// Handle incoming messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'leaderboard_update') {
    // Update UI with new leaderboard data
  }
};
```

## 🌍 Country Detection & Ranking

### IP Geolocation

The backend uses multiple fallback services for reliable country detection:

1. **ipapi.co** (Primary)
2. **ip-api.com** (Fallback)
3. **ipinfo.io** (Fallback)

### Country Ranking Algorithm

Countries are ranked by the **top 10% of players' combined score**:

1. Get all players from a country
2. Sort by score (descending)
3. Take top 10% (minimum 1 player)
4. Sum their scores
5. Rank countries by this sum

This ensures that countries with a few excellent players rank higher than countries with many average players.

## 📊 Real-time Updates

### DynamoDB Streams

When a new score is submitted:

1. Score is stored in DynamoDB
2. DynamoDB Stream triggers Lambda function
3. Lambda function:
   - Calculates new leaderboards
   - Updates country statistics
   - Broadcasts updates via WebSocket

### WebSocket Messages

#### Leaderboard Update
```json
{
  "type": "leaderboard_update",
  "timestamp": 1634567890123,
  "data": {
    "type": "global",
    "leaderboard": [
      {
        "rank": 1,
        "username": "Player1",
        "score": 15420,
        "country": "USA",
        "timestamp": 1634567890123
      }
    ]
  }
}
```

#### Country Update
```json
{
  "type": "country_update",
  "timestamp": 1634567890123,
  "data": {
    "type": "countries",
    "countries": [
      {
        "rank": 1,
        "country": "USA",
        "totalScore": 150000,
        "playerCount": 42,
        "averageScore": 3571
      }
    ]
  }
}
```

## 🔧 Configuration

### Environment Variables

- `SCORES_TABLE`: DynamoDB table for scores
- `COUNTRIES_TABLE`: DynamoDB table for country stats
- `WEBSOCKET_TABLE`: DynamoDB table for WebSocket connections
- `STAGE`: Deployment stage (dev/prod)

### Cost Optimization

This architecture is designed for minimal AWS costs:

- **DynamoDB**: Pay-per-request pricing
- **Lambda**: Pay-per-execution with generous free tier
- **API Gateway**: Pay-per-request
- **CloudWatch**: Basic logging included in free tier

Expected monthly cost for moderate usage (1000 games/month): **$1-5 USD**

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Manual Testing
```bash
# Test health endpoint
curl https://your-api-id.execute-api.region.amazonaws.com/stage/health

# Test score submission
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/stage/submit-score \
  -H "Content-Type: application/json" \
  -d '{"username":"TestPlayer","score":1000,"survivalTime":60,"deathCause":"test"}'
```

## 📈 Monitoring

### CloudWatch Metrics

- Lambda function duration and errors
- DynamoDB read/write capacity
- API Gateway request count and latency
- WebSocket connection count

### Logs

All functions log to CloudWatch with structured logging:

```bash
# View logs
serverless logs -f submitScore -t
```

## 🔒 Security

### CORS Configuration

API Gateway is configured with CORS headers for web browser access.

### Input Validation

All inputs are validated and sanitized:
- Username length limited to 50 characters
- Score and time values validated as numbers
- SQL injection protection via DynamoDB

### Rate Limiting

Consider implementing rate limiting for production:
- API Gateway usage plans
- Lambda concurrent execution limits

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure API Gateway has proper CORS configuration
2. **WebSocket Connection Fails**: Check WebSocket URL format (wss://)
3. **DynamoDB Errors**: Verify IAM permissions
4. **Geo-IP Fails**: Check internet connectivity and API limits

### Debug Mode

Enable debug logging:
```bash
export SLS_DEBUG=*
serverless deploy --verbose
```

## 📝 License

MIT License - see LICENSE file for details.