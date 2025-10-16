# Deployment Verification Checklist

Use this checklist to verify your backend deployment is working correctly.

## Pre-Deployment

- [ ] AWS CLI installed and configured
- [ ] Node.js 18.x or later installed
- [ ] AWS CDK CLI installed (`npm install -g aws-cdk`)
- [ ] AWS account has necessary permissions (CloudFormation, Lambda, DynamoDB, API Gateway, IAM)
- [ ] All dependencies installed in backend-leaderboard
- [ ] All dependencies installed in Lambda functions

## Deployment

- [ ] CDK bootstrap completed (first time only)
- [ ] `cdk synth` runs without errors
- [ ] `cdk deploy` completes successfully
- [ ] API Gateway endpoint URL received in output
- [ ] No CloudFormation errors in AWS Console

## Post-Deployment Verification

### 1. AWS Console Checks

#### API Gateway
- [ ] API created: "GameVibePlane Leaderboard API"
- [ ] Stage "prod" exists
- [ ] Resources `/submit-score` and `/leaderboard` exist
- [ ] CORS enabled on both endpoints
- [ ] Throttling configured (100 req/s, 200 burst)

#### Lambda Functions
- [ ] Function exists: `GameVibePlane-SubmitScore`
  - [ ] Runtime: Node.js 18.x
  - [ ] Environment variable `TABLE_NAME` set correctly
  - [ ] IAM role has DynamoDB write permissions
- [ ] Function exists: `GameVibePlane-GetLeaderboard`
  - [ ] Runtime: Node.js 18.x
  - [ ] Environment variable `TABLE_NAME` set correctly
  - [ ] IAM role has DynamoDB read permissions

#### DynamoDB
- [ ] Table exists: `GameVibePlane-GameSessions`
- [ ] Primary key: `sessionId` (String), `timestamp` (Number)
- [ ] GSI exists: `ScoreIndex`
- [ ] GSI exists: `CountryIndex`
- [ ] Billing mode: On-demand
- [ ] Point-in-time recovery: Enabled
- [ ] Encryption: Enabled

#### CloudWatch
- [ ] Log group exists: `/aws/lambda/GameVibePlane-SubmitScore`
- [ ] Log group exists: `/aws/lambda/GameVibePlane-GetLeaderboard`
- [ ] API Gateway logs configured (optional)

### 2. API Testing

#### Test Submit Score
```bash
# Run this command (replace with your API endpoint)
curl -X POST https://YOUR-API-ENDPOINT/prod/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestPlayer",
    "score": 1000,
    "survivalTime": 60,
    "deathCause": "test"
  }'
```

Expected Response:
- [ ] Status code: 200
- [ ] Response contains: `"success": true`
- [ ] Response contains: `sessionId`
- [ ] Response contains: `country`

#### Test Get Leaderboard
```bash
# Run this command (replace with your API endpoint)
curl https://YOUR-API-ENDPOINT/prod/leaderboard?limit=10
```

Expected Response:
- [ ] Status code: 200
- [ ] Response contains: `leaderboard` array
- [ ] Response contains: `stats` object
- [ ] Response contains: `count` number
- [ ] Leaderboard entries have: rank, username, score, country

#### Test with Script
```bash
cd backend-leaderboard
./test-api.sh https://YOUR-API-ENDPOINT/prod
```

- [ ] All 4 tests pass
- [ ] Data is visible in leaderboard
- [ ] Statistics are calculated correctly

### 3. DynamoDB Data Verification

#### Check Data in AWS Console
- [ ] Go to DynamoDB → Tables → GameVibePlane-GameSessions
- [ ] Click "Explore table items"
- [ ] Verify test data exists
- [ ] Verify all attributes are populated correctly
- [ ] Check ScoreIndex: items sorted by score
- [ ] Check CountryIndex: items organized by country

#### Query Test
```bash
# Scan table
aws dynamodb scan \
  --table-name GameVibePlane-GameSessions \
  --limit 5
```

- [ ] Command returns data
- [ ] Items have all expected attributes
- [ ] Timestamps are correct (Unix milliseconds)
- [ ] Scores are stored as numbers

### 4. Frontend Integration

#### Update Configuration
- [ ] File `js/api/backendApi.js` updated with API endpoint
- [ ] `USE_BACKEND` set to `true`
- [ ] `FALLBACK_TO_LOCAL` set to `true`

#### Test in Browser
- [ ] Open game in browser
- [ ] Check browser console for errors
- [ ] Enter username in menu (or leave empty for "Me")
- [ ] Start game
- [ ] Play until game over
- [ ] Check console for "Score submitted to backend successfully"
- [ ] Click Leaderboard button
- [ ] Verify your score appears in leaderboard
- [ ] Verify country code is displayed (if available)

#### Browser Console Checks
```javascript
// In browser console, verify config:
console.log(BACKEND_CONFIG);
// Should show USE_BACKEND: true and your API endpoint

// Test API manually:
BackendAPI.submitScore('TestUser', 5000, 100, 'manual test')
  .then(console.log);

BackendAPI.fetchLeaderboard(10)
  .then(console.log);
```

- [ ] Config shows correct values
- [ ] Manual API calls work
- [ ] Responses logged correctly

### 5. Error Handling Tests

#### Test Invalid Input
```bash
# Missing required fields
curl -X POST https://YOUR-API-ENDPOINT/prod/submit-score \
  -H "Content-Type: application/json" \
  -d '{"username": "Test"}'
```
- [ ] Returns 400 error
- [ ] Error message is descriptive

#### Test Rate Limiting
```bash
# Send many requests quickly
for i in {1..150}; do
  curl -X POST https://YOUR-API-ENDPOINT/prod/submit-score \
    -H "Content-Type: application/json" \
    -d '{"username":"Test","score":100,"survivalTime":10,"deathCause":"test"}' &
done
```
- [ ] Some requests return 429 (Too Many Requests)
- [ ] Throttling is working

#### Test CORS
```bash
# From browser console on different domain
fetch('https://YOUR-API-ENDPOINT/prod/leaderboard')
  .then(r => r.json())
  .then(console.log);
```
- [ ] Request succeeds
- [ ] CORS headers present
- [ ] No CORS errors in console

### 6. Performance Checks

#### Lambda Cold Start
- [ ] First request completes in < 3 seconds
- [ ] Subsequent requests < 1 second

#### DynamoDB Performance
- [ ] Submit score < 500ms
- [ ] Get leaderboard < 1 second
- [ ] No throttling errors

#### Check CloudWatch Metrics
- [ ] API Gateway: 4XX errors = 0% (for valid requests)
- [ ] API Gateway: 5XX errors = 0%
- [ ] Lambda: Error rate = 0%
- [ ] DynamoDB: Throttled requests = 0

### 7. Cost Monitoring

#### Check Billing Dashboard
- [ ] No unexpected charges
- [ ] DynamoDB: On-demand billing active
- [ ] Lambda: Within free tier (if applicable)
- [ ] API Gateway: Reasonable request count

#### Set Up Billing Alerts (Recommended)
- [ ] CloudWatch billing alarm created
- [ ] Alert threshold set (e.g., $10/month)
- [ ] Email notification configured

### 8. Security Verification

#### API Gateway
- [ ] CORS origins configured (not wide-open in production)
- [ ] Rate limiting active
- [ ] CloudWatch logging enabled

#### Lambda
- [ ] IAM roles follow least privilege
- [ ] No hardcoded credentials
- [ ] Environment variables used correctly

#### DynamoDB
- [ ] Point-in-time recovery enabled
- [ ] Encryption at rest enabled
- [ ] No public access

### 9. Documentation

- [ ] API endpoint documented in team notes
- [ ] AWS account info saved securely
- [ ] Deployment date recorded
- [ ] Team members have access

### 10. Rollback Plan

#### If Issues Occur
- [ ] Know how to run `cdk destroy`
- [ ] Have backup of any important data
- [ ] Can revert frontend changes
- [ ] Have previous git commit hash

## Optional Enhancements

### CloudWatch Alarms
- [ ] Create alarm for Lambda errors
- [ ] Create alarm for API Gateway 5xx errors
- [ ] Create alarm for DynamoDB throttles
- [ ] Create alarm for high costs

### Monitoring Dashboard
- [ ] Create CloudWatch dashboard
- [ ] Add API Gateway metrics
- [ ] Add Lambda metrics
- [ ] Add DynamoDB metrics

### Backup Strategy
- [ ] Set up DynamoDB backup schedule
- [ ] Document restore procedure
- [ ] Test restore from backup

### CI/CD Pipeline
- [ ] Set up GitHub Actions (optional)
- [ ] Automated testing (optional)
- [ ] Automated deployment (optional)

## Final Checks

- [ ] All team members can access AWS Console
- [ ] Frontend works in production
- [ ] Leaderboard displays correctly
- [ ] Scores are being recorded
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Costs are as expected

## Sign-off

**Deployment Date**: ________________

**Deployed By**: ________________

**API Endpoint**: ________________

**Notes**: 
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## Troubleshooting

If any checks fail, refer to:
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `README.md` - General documentation
- CloudWatch Logs - Error details
- AWS Support - For AWS-specific issues

---

**✅ All checks passed? Congratulations! Your backend is live!** 🎉
