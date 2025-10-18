# Deployment Guide - Game Vibe Plane Real-time Leaderboard

This guide will walk you through deploying the complete Game Vibe Plane system with real-time leaderboards.

## 📋 Prerequisites

### Required Tools
- **Node.js** v18 or later
- **npm** or **yarn**
- **AWS CLI** v2
- **Serverless Framework** v3
- **Git**

### AWS Account Setup
1. Create an AWS account if you don't have one
2. Create an IAM user with the following permissions:
   - `AWSLambdaFullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `CloudWatchLogsFullAccess`
   - `IAMFullAccess` (for creating roles)

## 🚀 Step-by-Step Deployment

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Game-Vibe-Plane

# Install backend dependencies
cd backend
npm install

# Install Serverless Framework globally (if not already installed)
npm install -g serverless
```

### Step 2: Configure AWS Credentials

Choose one of these methods:

#### Option A: AWS CLI Configuration
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter output format (json)
```

#### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=us-east-1
```

#### Option C: AWS Profile
```bash
aws configure --profile game-vibe-plane
export AWS_PROFILE=game-vibe-plane
```

### Step 3: Deploy Backend to Development

```bash
cd backend

# Deploy to development environment
npm run deploy
# OR
serverless deploy --stage dev
```

This will create:
- DynamoDB tables for scores, countries, and WebSocket connections
- Lambda functions for all backend logic
- API Gateway with REST and WebSocket endpoints
- CloudWatch log groups

**Expected output:**
```
Service Information
service: game-vibe-plane-backend
stage: dev
region: us-east-1
stack: game-vibe-plane-backend-dev
resources: 15
api keys:
  None
endpoints:
  POST - https://abc123def.execute-api.us-east-1.amazonaws.com/dev/submit-score
  GET - https://abc123def.execute-api.us-east-1.amazonaws.com/dev/leaderboard
  GET - https://abc123def.execute-api.us-east-1.amazonaws.com/dev/leaderboard/country
  GET - https://abc123def.execute-api.us-east-1.amazonaws.com/dev/health
  wss://xyz789.execute-api.us-east-1.amazonaws.com/dev
functions:
  submitScore: game-vibe-plane-backend-dev-submitScore
  getLeaderboard: game-vibe-plane-backend-dev-getLeaderboard
  getCountryLeaderboard: game-vibe-plane-backend-dev-getCountryLeaderboard
  healthCheck: game-vibe-plane-backend-dev-healthCheck
  websocketConnect: game-vibe-plane-backend-dev-websocketConnect
  websocketDisconnect: game-vibe-plane-backend-dev-websocketDisconnect
  websocketDefault: game-vibe-plane-backend-dev-websocketDefault
  processScoreUpdate: game-vibe-plane-backend-dev-processScoreUpdate
```

### Step 4: Configure Frontend

1. **Copy the API Gateway URL** from the deployment output
2. **Update the frontend configuration**:

```bash
cd ../frontend
```

Edit `js/api/backendApi.js`:
```javascript
const BACKEND_CONFIG = {
  // Replace with your actual API Gateway URL
  API_BASE_URL: "https://abc123def.execute-api.us-east-1.amazonaws.com/dev",
  
  // Enable backend integration
  USE_BACKEND: true,
  
  // Keep local storage as fallback
  FALLBACK_TO_LOCAL: true,
};
```

### Step 5: Test the Deployment

#### Test Backend Health
```bash
curl https://your-api-url/dev/health
```

Expected response:
```json
{
  "success": true,
  "message": "Game Vibe Plane Backend is healthy",
  "timestamp": 1634567890123,
  "version": "1.0.0",
  "environment": "dev"
}
```

#### Test Score Submission
```bash
curl -X POST https://your-api-url/dev/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestPlayer",
    "score": 1000,
    "survivalTime": 60,
    "deathCause": "asteroid collision"
  }'
```

#### Test Frontend
1. Open `frontend/index.html` in a web browser
2. Play a game and let it end
3. Check the "Live Dashboard" for your score
4. Verify the connection status shows "Live" (green dot)

### Step 6: Deploy to Production (Optional)

For production deployment:

```bash
cd backend

# Deploy to production
npm run deploy:prod
# OR
serverless deploy --stage prod
```

Then update the frontend configuration with the production URL.

## 🔧 Configuration Options

### Environment Variables

You can customize the deployment with environment variables:

```bash
# Custom region
export AWS_DEFAULT_REGION=eu-west-1

# Custom stage name
serverless deploy --stage production

# Custom service name
# Edit serverless.yml and change the 'service' field
```

### Custom Domain (Optional)

To use a custom domain:

1. **Register a domain** in Route 53 or your DNS provider
2. **Create an SSL certificate** in AWS Certificate Manager
3. **Add custom domain configuration** to `serverless.yml`:

```yaml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.yourgame.com
    certificateName: '*.yourgame.com'
    createRoute53Record: true
```

4. **Deploy with custom domain**:
```bash
serverless create_domain
serverless deploy
```

## 📊 Monitoring and Maintenance

### CloudWatch Monitoring

Access AWS CloudWatch to monitor:
- **Lambda function performance** and errors
- **DynamoDB read/write capacity**
- **API Gateway request metrics**
- **WebSocket connection counts**

### Log Analysis

View logs for debugging:
```bash
# View specific function logs
serverless logs -f submitScore -t

# View all logs
serverless logs -t
```

### Cost Monitoring

Set up AWS billing alerts:
1. Go to AWS Billing Dashboard
2. Create a billing alarm
3. Set threshold (e.g., $10/month)
4. Configure SNS notification

## 🔒 Security Considerations

### Production Security

For production deployments:

1. **Enable API throttling**:
   - Set rate limits in API Gateway
   - Configure burst limits

2. **Implement authentication** (optional):
   - Add API keys for score submission
   - Use AWS Cognito for user management

3. **Enable CORS properly**:
   - Restrict origins to your domain only
   - Remove wildcard (*) origins

4. **Set up WAF** (Web Application Firewall):
   - Protect against common attacks
   - Rate limiting by IP

### Environment Separation

Keep development and production separate:
- Use different AWS accounts or regions
- Different database tables
- Separate monitoring and alerting

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Permission Denied Errors
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify IAM permissions
aws iam get-user
```

#### 2. DynamoDB Table Already Exists
```bash
# Remove existing deployment
serverless remove

# Deploy again
serverless deploy
```

#### 3. API Gateway CORS Issues
- Verify CORS configuration in `serverless.yml`
- Check browser developer tools for CORS errors
- Test API endpoints directly with curl

#### 4. WebSocket Connection Fails
- Verify WebSocket URL format (wss://)
- Check browser support for WebSockets
- Test connection with WebSocket client tools

### Debug Mode

Enable verbose logging:
```bash
export SLS_DEBUG=*
serverless deploy --verbose
```

### Rollback Deployment

If something goes wrong:
```bash
# List deployments
serverless deploy list

# Rollback to previous version
serverless rollback -t timestamp
```

## 💰 Cost Optimization

### Expected Costs

For moderate usage (1000 games/month):
- **DynamoDB**: $0.50-1.00
- **Lambda**: $0.20-0.50
- **API Gateway**: $1.00-2.00
- **CloudWatch**: $0.50
- **Total**: ~$2-4 USD/month

### Cost Reduction Tips

1. **Use DynamoDB On-Demand**: Pay only for what you use
2. **Optimize Lambda memory**: Start with 128MB, increase if needed
3. **Set up CloudWatch log retention**: Don't keep logs forever
4. **Monitor unused resources**: Remove test deployments

## 📞 Support

### Getting Help

1. **Check the logs** first:
   ```bash
   serverless logs -f functionName -t
   ```

2. **AWS Documentation**:
   - [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
   - [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
   - [DynamoDB Docs](https://docs.aws.amazon.com/dynamodb/)

3. **Community Support**:
   - [Serverless Framework Slack](https://serverless.com/slack)
   - [AWS Developer Forums](https://forums.aws.amazon.com/)

### Cleanup

To remove everything and avoid charges:
```bash
cd backend
serverless remove
```

This will delete all AWS resources created by the deployment.

---

**Congratulations! Your real-time leaderboard system is now deployed and ready for global competition!** 🎉