# Game Vibe Plane - Real-time Leaderboard System

A space survival game with real-time global and country-based leaderboards, built entirely on AWS serverless architecture.

## System Overview

**Game Vibe Plane** is a space survival game featuring real-time global and country-based leaderboards. The system is built entirely on AWS using serverless architecture, ensuring high scalability and optimized costs.

---

## AWS ARCHITECTURE - BACKEND

### Backend Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   (Browser)     │<──>│   REST + WS     │<──>│   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   DynamoDB      │<────────────┘
                       │   + Streams     │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   GeoIP APIs    │
                       │   (External)    │
                       └─────────────────┘
```

### AWS Services Used

#### 1. API Gateway

- **REST API**: Handles HTTP requests for score submission and leaderboard retrieval
- **WebSocket API**: Provides real-time leaderboard updates
- **Throttling**: Rate limit 10 requests/second, burst 20 requests
- **API Keys**: Endpoint security
- **Region**: ap-southeast-1 (Singapore)

#### 2. Lambda Functions

- **Runtime**: Node.js 18. x
- **Compute Type**: Serverless, auto-scaling
- **Functions**:
  - `submitScore`: Handles score submission
  - `getLeaderboard`: Retrieves global leaderboard
  - `getCountryLeaderboard`: Retrieves country-specific leaderboard
  - `healthCheck`: System health check
  - `websocketConnect`: Handles WebSocket connections
  - `websocketDisconnect`: Handles WebSocket disconnections
  - `websocketDefault`: Handles default messages
  - `processScoreUpdate`: Processes updates from DynamoDB Stream

#### 3. DynamoDB

- **Billing Mode**: Pay-per-request (on-demand)
- **Tables**:

  **ScoresTable** (Player scores)

  - Primary Key: `userId` (String)
  - Attributes: `score`, `username`, `country`, `survivalTime`, `deathCause`, `timestamp`
  - GSI - ScoreIndex: `leaderboard` (HASH) + `score` (RANGE)
  - GSI - CountryIndex: `country` (HASH) + `score` (RANGE)
  - Stream: NEW_AND_OLD_IMAGES (for real-time updates)

  **CountriesTable** (Country leaderboard)

  - Primary Key: `country` (String)
  - Attributes: `totalScore`, `playerCount`, `averageScore`, `ranking`
  - GSI - TotalScoreIndex: `ranking` (HASH) + `totalScore` (RANGE)

  **WebSocketTable** (WebSocket connections)

  - Primary Key: `connectionId` (String)
  - TTL: Automatic cleanup of old connections

#### 4. DynamoDB Streams

- **Purpose**: Triggers Lambda function when new scores are added
- **Batch Size**: 100 records
- **Starting Position**: LATEST
- **Flow**:
  1. New score saved to DynamoDB
  2. Stream triggers Lambda `processScoreUpdate`
  3. Lambda recalculates leaderboard
  4. Broadcast updates via WebSocket

#### 5. CloudWatch

- **Logging**: All Lambda functions log to CloudWatch
- **Monitoring**: Lambda duration, errors, DynamoDB capacity
- **Log Groups**: `/aws/lambda/${FunctionName}`

### Backend Deployment

#### Development Environment (dev)

```bash
cd backend
npm install
serverless deploy --stage dev
```

**Outputs**:

- API Endpoint: `https://m7uj7jddd8.execute-api.ap-southeast-1. amazonaws.com/dev`
- WebSocket Endpoint: `wss://t3he3fvk4c. execute-api.ap-southeast-1.amazonaws.com/dev`

#### Production Environment (prod)

```bash
serverless deploy --stage prod
```

**Outputs**:

- API Endpoint: `https://m7uj7jddd8. execute-api.ap-southeast-1.amazonaws.com/prod`
- WebSocket Endpoint: `wss://t3he3fvk4c.execute-api.ap-southeast-1.amazonaws.com/prod`

### IAM Permissions

Lambda functions have the following permissions:

- DynamoDB: Query, Scan, GetItem, PutItem, UpdateItem, DeleteItem
- DynamoDB Streams: GetRecords, GetShardIterator, DescribeStream
- API Gateway: ManageConnections (for WebSocket)

### Backend Cost Estimation

**Estimated cost for 1000 games/month**:

- DynamoDB: $0.50-1.00
- Lambda: $0.20-0.50
- API Gateway: $1.00-2.00
- CloudWatch: $0.50
- **Total: approximately $2-4 USD/month**

---

## AWS ARCHITECTURE - FRONTEND (CI/CD)

### CI/CD Pipeline Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────>│ CodePipeline │────>│  CodeBuild   │────>│   Staging    │
│   (Source)   │     │              │     │  (Build &    │     │   S3 Bucket  │
└──────────────┘     │              │     │   Minify)    │     └──────────────┘
                     │              │     └──────────────┘            │
                     │              │            │                    │
                     │              │            │                    v
                     │              │            │           ┌──────────────┐
                     │              │            │           │   Manual     │
                     │              │            │           │   Approval   │
                     │              │            │           └──────────────┘
                     │              │            │                    │
                     │              │            v                    v
                     │              │     ┌──────────────┐     ┌──────────────┐
                     │              │────>│  Production  │────>│  CloudFront  │
                     └──────────────┘     │   S3 Bucket  │     │ Distribution │
                                          └──────────────┘     └──────────────┘
```

### Pipeline Stages

#### 1. Source Stage

- **Provider**: AWS CodeStar Connection (GitHub)
- **Repository**: `lequockhanh19521680/Game-Vibe-Plane`
- **Branch**: `main`
- **Trigger**: Automatic on new commits
- **Output**: Source code artifact

#### 2. Build & Optimize Stage

- **Service**: AWS CodeBuild
- **Build Environment**:
  - Image: `aws/codebuild/standard:5.0`
  - Compute: `BUILD_GENERAL1_SMALL`
  - Runtime: Node. js 18
- **Build Process**:

  ```yaml
  1. Install Tools:
    - terser (JS minification)
    - csso-cli (CSS minification)
    - html-minifier (HTML minification)

  2. Build Steps:
    - Copy assets from frontend/assets
    - Minify CSS files (frontend/css/*)
    - Minify JavaScript files (frontend/js/*)
    - Minify gameConfig.js
    - Minify index.html

  3. Output: build_output/ artifact
  ```

#### 3. Deploy to Staging Stage

- **Service**: S3 Deployment
- **Bucket**: Public S3 bucket with website hosting
- **Access**: Public read access
- **URL**: `http://[staging-bucket].s3-website-[region].amazonaws.com`
- **Purpose**: Testing and QA before production deployment

#### 4. Manual Approval Stage

- **Type**: Manual approval step
- **Purpose**: Review staging before production deployment
- **Approver**: Dev team/Product owner

#### 5. Deploy to Production Stage

- **Service**: S3 + CloudFront
- **S3 Bucket**: Private bucket (CloudFront access only)
- **CloudFront Distribution**:
  - Origin: S3 bucket with OAI (Origin Access Identity)
  - SSL/TLS: Certificate from ACM (for custom domain)
  - Caching: Default TTL 24h, Max TTL 1 year
  - Compression: Enabled
  - HTTPS: Redirect HTTP to HTTPS
- **Cache Invalidation**: Automatically invalidates `/*` after deployment

### AWS CI/CD Services

#### S3 Buckets

1. **Staging Bucket**

   - Public website hosting
   - Direct S3 website endpoint
   - Lifecycle: No expiration

2. **Production Bucket**

   - Private access only
   - CloudFront OAI access
   - Block all public access

3. **Pipeline Artifact Bucket**
   - Store build artifacts
   - Lifecycle: 30 days retention
   - Non-current versions: 7 days

#### CloudFront Distribution

- **Default Root Object**: index.html
- **Viewer Protocol**: Redirect to HTTPS
- **Allowed Methods**: GET, HEAD, OPTIONS
- **Cached Methods**: GET, HEAD, OPTIONS
- **Compression**: Enabled
- **Custom Domain**: Optional (configure with Route53)
- **SSL Certificate**: ACM (us-east-1)

#### CodeBuild Projects

1. **BuildProject**: Builds and minifies frontend
2. **InvalidateCacheProject**: Invalidates CloudFront cache

#### CodePipeline

- **Artifact Store**: S3 bucket
- **Stages**: Source → Build → Staging → Approval → Production
- **IAM Role**: CodePipelineRole with permissions for S3, CodeBuild, CodeStar

### Cost Optimization Automation

#### EventBridge Schedules + Lambda

System automatically stops/starts resources and pipeline to save costs:

**1. Idle Resources Management**

- **StopIdleResourcesFunction**: Stops EC2/RDS instances

  - Schedule: 1:00 AM Vietnam Time (18:00 UTC previous day)
  - Cron: `cron(0 18 * * ? *)`

- **StartIdleResourcesFunction**: Starts EC2/RDS instances
  - Schedule: 8:00 AM Vietnam Time (01:00 UTC)
  - Cron: `cron(0 1 * * ? *)`

**2. Pipeline Control**

- **DisablePipelineFunction**: Disables pipeline Source stage

  - Schedule: 1:00 AM Vietnam Time
  - Purpose: Prevents pipeline from running automatically during off-hours

- **EnablePipelineFunction**: Enables pipeline Source stage
  - Schedule: 8:00 AM Vietnam Time
  - Purpose: Re-enables pipeline during working hours

**IAM Permissions**:

- EC2: StartInstances, StopInstances, DescribeInstances
- RDS: StartDBInstance, StopDBInstance, DescribeDBInstances
- CodePipeline: DisableStageTransition, EnableStageTransition

### Environments

#### Development (dev)

- **Backend**: `--stage dev`
- **API**: `https://[api-id].execute-api.ap-southeast-1.amazonaws.com/dev`
- **Purpose**: Local testing, development
- **DynamoDB**: Separate dev tables
- **Cost**: Minimal (free tier eligible)

#### Staging

- **Hosting**: Public S3 website
- **URL**: S3 website endpoint
- **Purpose**: QA testing, stakeholder review
- **Backend**: Can use dev or staging backend
- **Deployment**: Automatic after build

#### Production (prod)

- **Hosting**: CloudFront + S3
- **URL**: CloudFront domain or custom domain
- **Backend**: `--stage prod`
- **API**: `https://[api-id].execute-api.ap-southeast-1.amazonaws.com/prod`
- **Purpose**: Live production
- **Deployment**: Manual approval required
- **Monitoring**: Enhanced CloudWatch monitoring

### Frontend Environment Variables

Frontend uses dynamic configuration:

```javascript
// frontend/js/config/endpoints.js
VITE_API_BASE_URL=https://m7uj7jddd8.execute-api. ap-southeast-1.amazonaws. com/prod
VITE_WEBSOCKET_URL=wss://t3he3fvk4c.execute-api.ap-southeast-1.amazonaws.com/prod
VITE_ENVIRONMENT=production
VITE_ENABLE_LEADERBOARD=true
VITE_ENABLE_REAL_TIME_UPDATES=true
```

**Configuration Priority**:

1. Runtime overrides (localStorage)
2. Environment variables (. env file)
3. Embedded configuration
4. Defaults

### Frontend Deployment

```bash
# Deploy stack with SAM/CloudFormation
sam deploy --template-file template.yml \
  --stack-name game-vibe-plane-cicd \
  --parameter-overrides \
    GitHubOwner=lequockhanh19521680 \
    GitHubRepo=Game-Vibe-Plane \
    GitHubBranch=main \
    CodeStarConnectionArn=arn:aws:codestar-connections:...  \
  --capabilities CAPABILITY_IAM
```

### CI/CD Cost Estimation

**Estimated monthly cost**:

- CodePipeline: $1/pipeline/month (after free tier)
- CodeBuild: $0.005/build minute (estimated 10 builds/month × 5 mins)
- S3 Storage: $0.023/GB (staging + production + artifacts)
- CloudFront: $0.085/GB transfer + $0.01/10,000 requests
- EventBridge Scheduler: $1/million invocations (minimal)
- Lambda (schedulers): Free tier eligible
- **Total: approximately $5-15 USD/month** (depending on traffic)

---

## Security

### Backend Security

- **CORS**: Configured for web browser access
- **Input Validation**: Username ≤50 chars, score/time validation
- **API Throttling**: Rate limiting 10 req/s
- **DynamoDB**: SQL injection protection (NoSQL)
- **IAM**: Least privilege principle

### Frontend Security

- **HTTPS**: CloudFront enforces HTTPS
- **OAI**: S3 bucket not public in production
- **No Sensitive Data**: No sensitive info in localStorage
- **Environment Variables**: No exposed secrets

### Production Hardening

1. Enable API throttling and usage plans
2. Implement authentication (AWS Cognito - optional)
3. Restrict CORS origins (no wildcard)
4. Set up WAF for CloudFront (must be created separately in us-east-1)
5. Enable CloudWatch alarms for errors

---

## Monitoring & Logging

### CloudWatch Metrics

- **Lambda**: Duration, errors, invocations, concurrent executions
- **DynamoDB**: Read/write capacity, throttled requests
- **API Gateway**: Request count, latency, 4xx/5xx errors
- **CloudFront**: Requests, bytes downloaded/uploaded, error rate

### Logs

```bash
# View Lambda logs
serverless logs -f submitScore -t --stage prod

# View CodeBuild logs
aws logs tail /aws/codebuild/${ProjectName} --follow

# View all backend logs
serverless logs -t --stage prod
```

### Recommended Alarms

- Lambda error rate > 5%
- API Gateway 5xx errors
- DynamoDB throttling
- CloudFront 5xx error rate

---

## Deployment Commands

### Backend

```bash
# Development
cd backend
npm install
serverless deploy --stage dev

# Production
serverless deploy --stage prod

# Remove stack
serverless remove --stage dev
```

### Frontend CI/CD

```bash
# Deploy pipeline stack
sam deploy --guided

# Update stack
sam deploy

# Remove stack
aws cloudformation delete-stack --stack-name game-vibe-plane-cicd
```

### View Deployment Info

```bash
# Get API endpoints
serverless info --stage prod

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name game-vibe-plane-cicd \
  --query 'Stacks[0].Outputs'
```

---

## File Structure

```
Game-Vibe-Plane/
├── backend/
│   ├── serverless.yml          # Backend infrastructure
│   ├── src/handlers/           # Lambda functions
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── css/                    # Styles
│   ├── js/                     # Game logic
│   │   └── config/
│   │       └── endpoints.js    # API configuration
│   ├── assets/                 # Images, audio
│   └── gameConfig.js
├── template.yml                # CI/CD infrastructure (SAM)
├── samconfig.toml             # SAM deployment config
└── DEPLOYMENT. md              # Deployment guide
```

---

## Key Features

- **Serverless Architecture**: 100% serverless, auto-scaling
- **Real-time Updates**: WebSocket for live leaderboard
- **Multi-region Support**: Optimized for APAC (Singapore)
- **Cost Optimized**: Pay-per-use, automated resource scheduling
- **CI/CD Pipeline**: Automated build, test, deploy
- **Multi-environment**: Dev, Staging, Production
- **Global CDN**: CloudFront distribution
- **Monitoring**: CloudWatch integration
- **Security**: IAM, CORS, HTTPS, input validation

---

## Support

- **Backend Logs**: `serverless logs -f <function-name> -t`
- **CloudWatch Console**: AWS Console → CloudWatch
- **Pipeline Console**: AWS Console → CodePipeline
- **Stack Outputs**: `sam deploy` or CloudFormation console

---

**License**: MIT
