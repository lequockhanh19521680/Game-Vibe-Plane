# Deployment Guide - Game Vibe Plane Backend Leaderboard

This guide will walk you through deploying the backend leaderboard infrastructure to AWS.

## Prerequisites

Before you begin, make sure you have:

1. **AWS Account** - Create one at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI** - Installed and configured with your credentials
3. **Node.js** - Version 18.x or later
4. **npm** - Comes with Node.js
5. **AWS CDK CLI** - Install globally: `npm install -g aws-cdk`

## Step 1: Configure AWS Credentials

### Option A: Using AWS CLI

```bash
aws configure
```

You'll need to provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

### Option B: Using Environment Variables

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

## Step 2: Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend-leaderboard

# Install CDK dependencies
npm install

# Install Lambda function dependencies
cd lambda/submit-score
npm install
cd ../..

cd lambda/get-leaderboard
npm install
cd ../..
```

## Step 3: Bootstrap AWS CDK (First-Time Only)

If this is your first time using CDK in your AWS account/region, you need to bootstrap:

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

Example:
```bash
cdk bootstrap aws://123456789012/us-east-1
```

You can find your account number by running:
```bash
aws sts get-caller-identity
```

## Step 4: Review and Deploy

### Review the CloudFormation Template

See what resources will be created:

```bash
npm run synth
# or
cdk synth
```

### Check for Differences

Compare your local stack with what's deployed (if anything):

```bash
npm run diff
# or
cdk diff
```

### Deploy the Stack

Deploy everything to AWS:

```bash
npm run deploy
# or
cdk deploy
```

You'll be asked to confirm the deployment. Type `y` and press Enter.

The deployment process will:
1. Create a DynamoDB table
2. Deploy two Lambda functions
3. Set up an API Gateway REST API
4. Configure IAM roles and permissions
5. Enable CORS for your API

**Note:** This process typically takes 2-5 minutes.

## Step 5: Get Your API Endpoint

After successful deployment, CDK will output your API endpoint:

```
Outputs:
GameVibePlaneLeaderboardStack.ApiEndpoint = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
```

**Important:** Copy this URL - you'll need it for frontend integration.

## Step 6: Update Frontend Configuration

1. Open `js/api/backendApi.js` in your game's frontend code
2. Update the configuration:

```javascript
const BACKEND_CONFIG = {
  API_BASE_URL: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod',  // Paste your API endpoint here
  USE_BACKEND: true,  // Change to true
  FALLBACK_TO_LOCAL: true,
};
```

3. Save the file

## Step 7: Test the Integration

### Test Score Submission

Use curl or a tool like Postman:

```bash
curl -X POST https://YOUR-API-ENDPOINT/prod/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestPlayer",
    "score": 1000,
    "survivalTime": 60,
    "deathCause": "asteroid collision"
  }'
```

Expected response:
```json
{
  "success": true,
  "sessionId": "1697456789-abc123",
  "country": "US",
  "message": "Score submitted successfully"
}
```

### Test Leaderboard Retrieval

```bash
curl https://YOUR-API-ENDPOINT/prod/leaderboard?limit=10
```

Expected response:
```json
{
  "leaderboard": [...],
  "stats": {...},
  "count": 10,
  "timestamp": 1697456789000
}
```

## Step 8: Play and Verify

1. Open your game in a browser
2. Enter a username (or leave empty for "Me")
3. Play the game
4. When you die, check the browser console for:
   ```
   Score submitted to backend successfully
   ```
5. Click on the Leaderboard button to see your score

## Monitoring and Logs

### View Lambda Logs

**Submit Score Function:**
```bash
aws logs tail /aws/lambda/GameVibePlane-SubmitScore --follow
```

**Get Leaderboard Function:**
```bash
aws logs tail /aws/lambda/GameVibePlane-GetLeaderboard --follow
```

### View API Gateway Metrics

Go to AWS Console → API Gateway → Your API → Dashboard

### View DynamoDB Table

Go to AWS Console → DynamoDB → Tables → GameVibePlane-GameSessions

## Cost Estimates

With typical usage patterns:

- **DynamoDB**: ~$0.25 per million write requests, ~$0.25 per million read requests
- **Lambda**: First 1M requests/month are free, then $0.20 per 1M requests
- **API Gateway**: $3.50 per million requests
- **Data Transfer**: First 1 GB/month is free

**Estimated monthly cost for 100,000 games:** < $5 USD

## Troubleshooting

### Issue: "Unable to resolve AWS account to use"

**Solution:** Make sure AWS CLI is configured:
```bash
aws configure list
```

### Issue: CDK bootstrap fails

**Solution:** Make sure you have permissions to create CloudFormation stacks:
```bash
aws iam get-user
```

### Issue: CORS errors in browser

**Solution:** 
1. Check that your API Gateway has CORS enabled
2. Verify the `allowOrigins` in `lib/leaderboard-stack.ts`
3. Redeploy: `cdk deploy`

### Issue: Lambda function errors

**Solution:**
1. Check CloudWatch Logs
2. Verify environment variables are set correctly
3. Check IAM permissions

### Issue: DynamoDB access denied

**Solution:** Verify Lambda execution role has DynamoDB permissions:
```bash
aws iam get-role --role-name GameVibePlaneLeaderboardStack-[TAB to autocomplete]
```

## Updating the Backend

After making changes to Lambda functions or infrastructure:

```bash
cd backend-leaderboard
npm run deploy
```

If you only changed Lambda code:
```bash
cd lambda/submit-score
# Make your changes
cd ../..
npm run deploy
```

## Cleanup and Removal

To remove all resources and stop charges:

```bash
cd backend-leaderboard
npm run destroy
# or
cdk destroy
```

**Warning:** This will delete:
- API Gateway
- Lambda functions
- DynamoDB table (and all data)

The DynamoDB table has a `RETAIN` policy by default. If you want to preserve data, you can export it first:

```bash
aws dynamodb scan --table-name GameVibePlane-GameSessions > backup.json
```

## Security Best Practices

### 1. Restrict CORS Origins

For production, update `lib/leaderboard-stack.ts`:

```typescript
allowOrigins: ['https://yourdomain.com'],  // Replace with your actual domain
```

### 2. Add Rate Limiting

Already configured in the stack:
- 100 requests/second
- 200 burst capacity

Adjust in `lib/leaderboard-stack.ts` if needed.

### 3. Enable CloudWatch Alarms

Consider adding alarms for:
- High error rates
- Unusual traffic patterns
- DynamoDB throttling

### 4. Use AWS WAF (Optional)

For additional protection against attacks, consider enabling AWS WAF on your API Gateway.

## Advanced Configuration

### Custom Domain Name

1. Register a domain in Route 53
2. Create an ACM certificate
3. Update CDK stack to use custom domain

### Multiple Environments

Create separate stacks for dev/staging/prod:

```bash
cdk deploy --context environment=dev
cdk deploy --context environment=prod
```

### Database Backup

Enable automatic backups:

```typescript
// In lib/leaderboard-stack.ts
pointInTimeRecovery: true,  // Already enabled
```

## Support and Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

## Next Steps

After successful deployment:

1. ✅ Test the API endpoints
2. ✅ Integrate with frontend
3. ✅ Monitor CloudWatch logs
4. ✅ Set up CloudWatch alarms
5. ✅ Plan for scaling (if needed)
6. ✅ Consider adding authentication
7. ✅ Set up CI/CD pipeline (optional)

---

**Congratulations!** Your Game Vibe Plane backend leaderboard is now live! 🎮🚀
