# Game Vibe Plane - Backend Leaderboard

Backend infrastructure for Game Vibe Plane using AWS CDK, API Gateway, Lambda, and DynamoDB.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│ API Gateway  │─────▶│   Lambda    │─────▶│   DynamoDB   │
│  (Browser)  │◀─────│    (REST)    │◀─────│  Functions  │◀─────│    Table     │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                            │
                            │ CORS enabled
                            │ Throttling: 100 req/s
                            │
                     ┌──────┴──────┐
                     │             │
              ┌──────▼──────┐ ┌───▼──────────┐
              │ POST        │ │ GET          │
              │/submit-score│ │/leaderboard  │
              └─────────────┘ └──────────────┘
```

## Features

### 1. Score Submission (`POST /submit-score`)
- Records game session data including:
  - Username (defaults to "Me" if not provided)
  - Score
  - Survival time
  - Death cause
  - Client IP address
  - Country (derived from IP)
  - Timestamp

### 2. Leaderboard Retrieval (`GET /leaderboard`)
- Query parameters:
  - `limit`: Number of results (default: 100, max: 500)
  - `country`: Filter by country code
  - `sortBy`: 'score' or 'survivalTime' (default: 'score')
- Returns:
  - Leaderboard entries with ranking
  - Statistics (total games, averages, top countries, common death causes)

### 3. IP-to-Country Mapping
- Automatically determines player's country from IP address
- Supports dashboard analytics for geographic insights

## DynamoDB Schema

### Table: `GameVibePlane-GameSessions`

**Primary Key:**
- Partition Key: `sessionId` (STRING) - Unique session identifier
- Sort Key: `timestamp` (NUMBER) - Unix timestamp

**Attributes:**
- `username` (STRING) - Player name
- `score` (NUMBER) - Final score
- `survivalTime` (NUMBER) - Survival time in seconds
- `deathCause` (STRING) - How the player died
- `clientIp` (STRING) - Player's IP address
- `country` (STRING) - Country code (e.g., "US", "VN")
- `gameType` (STRING) - Game mode (default: "default")

**Global Secondary Indexes:**
1. **ScoreIndex**
   - Partition Key: `gameType`
   - Sort Key: `score`
   - Purpose: Query top scores across all players

2. **CountryIndex**
   - Partition Key: `country`
   - Sort Key: `score`
   - Purpose: Query top scores by country

## Prerequisites

- Node.js 18.x or later
- AWS Account
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Installation

1. Navigate to backend directory:
```bash
cd backend-leaderboard
```

2. Install dependencies:
```bash
npm install
```

3. Install Lambda function dependencies:
```bash
cd lambda/submit-score && npm install && cd ../..
cd lambda/get-leaderboard && npm install && cd ../..
```

## Deployment

### First-time Setup

1. Bootstrap CDK (only needed once per AWS account/region):
```bash
cdk bootstrap
```

2. Deploy the stack:
```bash
npm run deploy
```

Or use CDK directly:
```bash
cdk deploy
```

### Updating

After making changes to Lambda functions or infrastructure:
```bash
npm run deploy
```

## API Endpoints

After deployment, CDK will output the API Gateway URL. Example:

```
Outputs:
GameVibePlaneLeaderboardStack.ApiEndpoint = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```

### Submit Score

**Endpoint:** `POST /submit-score`

**Request Body:**
```json
{
  "username": "PlayerName",
  "score": 12345,
  "survivalTime": 180,
  "deathCause": "asteroid collision"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "1234567890-abc123",
  "country": "US",
  "message": "Score submitted successfully"
}
```

### Get Leaderboard

**Endpoint:** `GET /leaderboard?limit=50&country=US&sortBy=score`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "TopPlayer",
      "score": 15000,
      "survivalTime": 300,
      "country": "US",
      "timestamp": 1234567890000,
      "deathCause": "black hole collision"
    }
  ],
  "stats": {
    "totalGames": 1500,
    "averageScore": 5000,
    "averageSurvivalTime": 120,
    "topCountries": [
      { "country": "US", "count": 500 },
      { "country": "VN", "count": 300 }
    ],
    "commonDeathCauses": [
      { "cause": "asteroid collision", "count": 600 },
      { "cause": "missile collision", "count": 400 }
    ]
  },
  "count": 50,
  "timestamp": 1234567890000
}
```

## Frontend Integration

Update your frontend configuration file to point to the deployed API:

```javascript
// In your game's config or constants file
const API_BASE_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com/prod';

// Submit score when game ends
async function submitGameScore(username, score, survivalTime, deathCause) {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username || 'Me',
        score,
        survivalTime,
        deathCause,
      }),
    });
    
    const data = await response.json();
    console.log('Score submitted:', data);
    return data;
  } catch (error) {
    console.error('Error submitting score:', error);
  }
}

// Fetch leaderboard
async function fetchLeaderboard(limit = 100) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}
```

## Development

### Local Testing

Test Lambda functions locally using the AWS SAM CLI or by creating test events.

### View Logs

```bash
# View submit-score function logs
aws logs tail /aws/lambda/GameVibePlane-SubmitScore --follow

# View get-leaderboard function logs
aws logs tail /aws/lambda/GameVibePlane-GetLeaderboard --follow
```

### Useful CDK Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `cdk diff` - Compare deployed stack with current state
- `cdk synth` - Emit the synthesized CloudFormation template
- `npm run destroy` - Destroy the stack (use with caution!)

## Security Considerations

1. **CORS**: Currently allows all origins (`*`). For production, restrict to your domain:
   ```typescript
   allowOrigins: ['https://yourdomain.com'],
   ```

2. **Rate Limiting**: API Gateway has throttling enabled (100 req/s, burst 200)

3. **Data Privacy**: Client IPs are stored but not exposed in leaderboard responses

4. **DynamoDB**: Point-in-time recovery enabled for data protection

## Cost Estimation

With AWS Free Tier and typical usage:
- API Gateway: ~$3.50 per million requests
- Lambda: Free tier includes 1M requests/month
- DynamoDB: Pay-per-request, ~$1.25 per million writes
- Estimated monthly cost for 100K games: < $5

## Monitoring

CloudWatch metrics are automatically created for:
- Lambda function invocations
- Lambda errors and duration
- API Gateway requests and latency
- DynamoDB read/write capacity

## Future Enhancements

- [ ] Add authentication (AWS Cognito)
- [ ] Implement caching (ElastiCache/DynamoDB DAX)
- [ ] Add WebSocket support for real-time leaderboard updates
- [ ] Implement data analytics dashboard (QuickSight)
- [ ] Add CloudWatch alarms for monitoring
- [ ] Implement more sophisticated GeoIP service
- [ ] Add data retention policies
- [ ] Implement API versioning

## Cleanup

To remove all resources:
```bash
npm run destroy
```

**Warning:** This will delete the DynamoDB table and all data. The table has `RETAIN` removal policy by default, so you may need to manually delete it from AWS Console.

## Support

For issues or questions, please open an issue in the GitHub repository.

## License

MIT
