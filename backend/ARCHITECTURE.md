# Game Vibe Plane - Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                     │
│                            (Browser / Game Client)                           │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ HTTPS Requests
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS API GATEWAY (REST)                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Endpoints:                                                          │   │
│  │  • POST /submit-score   - Submit game session data                  │   │
│  │  • GET  /leaderboard    - Retrieve leaderboard & stats              │   │
│  │                                                                      │   │
│  │  Features:                                                           │   │
│  │  • CORS: Enabled (configurable origins)                             │   │
│  │  • Throttling: 100 req/s, burst 200                                 │   │
│  │  • Stage: prod                                                       │   │
│  │  • Logging: CloudWatch integration                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────────────┬─────────────────────────────┘
               │                                │
               │ Invoke                         │ Invoke
               ▼                                ▼
┌───────────────────────────┐    ┌──────────────────────────────────────┐
│   AWS LAMBDA FUNCTION     │    │     AWS LAMBDA FUNCTION              │
│   SubmitScore             │    │     GetLeaderboard                   │
├───────────────────────────┤    ├──────────────────────────────────────┤
│                           │    │                                      │
│ Runtime: Node.js 18.x     │    │ Runtime: Node.js 18.x                │
│ Memory: 256MB             │    │ Memory: 256MB                        │
│ Timeout: 10s              │    │ Timeout: 10s                         │
│                           │    │                                      │
│ Functions:                │    │ Functions:                           │
│ 1. Validate input         │    │ 1. Query DynamoDB (ScoreIndex)       │
│ 2. Get client IP          │    │ 2. Optional country filter           │
│ 3. IP → Country lookup    │    │ 3. Sort and format results           │
│ 4. Generate sessionId     │    │ 4. Calculate statistics              │
│ 5. Save to DynamoDB       │    │ 5. Return leaderboard + stats        │
│                           │    │                                      │
│ Environment Variables:    │    │ Environment Variables:               │
│ • TABLE_NAME              │    │ • TABLE_NAME                         │
└────────────┬──────────────┘    └─────────────┬────────────────────────┘
             │                                  │
             │ Write                            │ Read
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AWS DYNAMODB                                      │
│                                                                              │
│  Table: GameVibePlane-GameSessions                                          │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Primary Key:                                                       │    │
│  │    • Partition Key: sessionId (STRING)                              │    │
│  │    • Sort Key: timestamp (NUMBER)                                   │    │
│  │                                                                     │    │
│  │  Attributes:                                                        │    │
│  │    • username       (STRING)  - Player name or "Me"                │    │
│  │    • score          (NUMBER)  - Final score                        │    │
│  │    • survivalTime   (NUMBER)  - Seconds survived                   │    │
│  │    • deathCause     (STRING)  - How player died                    │    │
│  │    • clientIp       (STRING)  - Player IP address                  │    │
│  │    • country        (STRING)  - Country code (e.g., US, VN)        │    │
│  │    • gameType       (STRING)  - Game mode (default: "default")     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Global Secondary Indexes:                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  1. ScoreIndex                                                      │    │
│  │     • Partition Key: gameType (STRING)                              │    │
│  │     • Sort Key: score (NUMBER, DESC)                                │    │
│  │     • Purpose: Query top scores globally                            │    │
│  │     • Projection: ALL                                               │    │
│  │                                                                     │    │
│  │  2. CountryIndex                                                    │    │
│  │     • Partition Key: country (STRING)                               │    │
│  │     • Sort Key: score (NUMBER, DESC)                                │    │
│  │     • Purpose: Query top scores by country                          │    │
│  │     • Projection: ALL                                               │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Features:                                                                  │
│  • Billing: Pay-per-request (auto-scaling)                                 │
│  • Point-in-time recovery: Enabled                                         │
│  • Encryption: At rest (AWS managed)                                       │
│  • Stream: Enabled for future analytics                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               │ Stream (optional)
                               ▼
                    ┌──────────────────────┐
                    │  Future Extensions:  │
                    ├──────────────────────┤
                    │  • Analytics         │
                    │  • Real-time updates │
                    │  • Data archiving    │
                    │  • ML insights       │
                    └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  IP Geolocation Service (ip-api.com)                                        │
│  • Used by SubmitScore Lambda                                               │
│  • Converts IP address to country code                                      │
│  • Free tier: 45 requests/minute                                            │
│  • Fallback: Returns "UNKNOWN" on error                                     │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING & LOGGING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  AWS CloudWatch                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  • API Gateway access logs                                          │    │
│  │  • Lambda execution logs                                            │    │
│  │  • Lambda metrics (invocations, errors, duration)                   │    │
│  │  • DynamoDB metrics (read/write capacity, throttles)                │    │
│  │  • Custom metrics (optional)                                        │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘


DATA FLOW:
==========

Game Over Flow (Submit Score):
1. Player dies in game → Frontend captures game data
2. Frontend calls: POST /submit-score with {username, score, survivalTime, deathCause}
3. API Gateway forwards to SubmitScore Lambda
4. Lambda extracts client IP from API Gateway event
5. Lambda calls IP geolocation service to get country
6. Lambda generates unique sessionId and timestamp
7. Lambda writes complete record to DynamoDB
8. Lambda returns: {success, sessionId, country}
9. Frontend receives confirmation

Leaderboard Flow (Get Leaderboard):
1. Player opens leaderboard → Frontend requests data
2. Frontend calls: GET /leaderboard?limit=100&country=VN (optional)
3. API Gateway forwards to GetLeaderboard Lambda
4. Lambda queries DynamoDB using ScoreIndex (or CountryIndex if filtered)
5. Lambda sorts results by score (descending)
6. Lambda calculates statistics (average score, top countries, death causes)
7. Lambda formats and returns: {leaderboard, stats, count, timestamp}
8. Frontend displays formatted leaderboard


SECURITY:
=========
• API Gateway: CORS configured, throttling enabled
• Lambda: IAM roles with least privilege
• DynamoDB: Encryption at rest, IAM-based access control
• Client IP: Stored but not exposed in public responses
• Rate limiting: Prevents abuse


COST OPTIMIZATION:
==================
• DynamoDB: Pay-per-request billing (no idle costs)
• Lambda: Only pay for actual execution time
• API Gateway: Free tier covers initial usage
• No EC2 instances = No ongoing server costs
• Auto-scaling = Cost scales with usage


SCALABILITY:
============
• API Gateway: Handles millions of requests
• Lambda: Auto-scales to thousands of concurrent executions
• DynamoDB: Unlimited throughput with on-demand mode
• Global distribution: Can add CloudFront for CDN
• Multi-region: Can deploy to multiple AWS regions
```

---

## Query Patterns

### 1. Get Top Scores (Global)
```
Query ScoreIndex where gameType = "default"
Sort by score DESC
Limit 100
```

### 2. Get Top Scores by Country
```
Query CountryIndex where country = "VN"
Sort by score DESC
Limit 100
```

### 3. Get Player Session History
```
Query Table where sessionId = "specific-session-id"
```

### 4. Get Recent Games
```
Query Table where timestamp > last_24_hours
```

---

## Deployment Architecture

```
Developer Machine
      │
      │ cdk deploy
      ▼
   AWS CDK
      │
      │ generates
      ▼
CloudFormation Stack
      │
      │ provisions
      ▼
┌─────────────────────┐
│ AWS Resources:      │
│ • API Gateway       │
│ • Lambda Functions  │
│ • DynamoDB Table    │
│ • IAM Roles         │
│ • CloudWatch Logs   │
└─────────────────────┘
```

---

## Future Enhancements

1. **Real-time Updates**: WebSocket API for live leaderboard
2. **Caching**: ElastiCache or DynamoDB DAX for faster reads
3. **Analytics**: QuickSight dashboard for insights
4. **Authentication**: Cognito for user accounts
5. **Replays**: Store game replay data
6. **Achievements**: Track player milestones
7. **Social**: Friend leaderboards and challenges
8. **Multi-region**: Global deployment for lower latency
