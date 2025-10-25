# Game Vibe Plane - Well-Architected Real-time Leaderboard System

[![AWS Well-Architected](https://img.shields.io/badge/AWS-Well--Architected-orange)](https://aws.amazon.com/architecture/well-architected/)
[![Cost Optimized](https://img.shields.io/badge/Cost-Optimized-green)](https://aws.amazon.com/pricing/)
[![Serverless](https://img.shields.io/badge/Architecture-Serverless-blue)](https://aws.amazon.com/serverless/)

A cost-optimized, well-architected real-time leaderboard system built for 1-1000 users with dev/prod environments. Follows AWS Well-Architected Framework principles with unified deployment.

## 🏗️ Architecture Overview

### New Well-Architected Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  CloudFront CDN  │  S3 Static Hosting  │  Route 53 (Optional)  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│     API Gateway REST      │      API Gateway WebSocket          │
│   (Rate Limited: 20-100)  │    (Real-time Updates)             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       COMPUTE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Lambda Functions (128MB, 30s timeout)                         │
│  • Submit Score      • Get Leaderboard    • Health Check       │
│  • WebSocket Mgmt    • Real-time Updates  • Country Stats      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│              DynamoDB (Pay-per-Request)                         │
│  • Scores Table (Global + Country GSIs)                        │
│  • WebSocket Connections (TTL Enabled)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MONITORING LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  CloudWatch Logs  │  CloudWatch Alarms  │  Cost Monitoring     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Improvements

✅ **Cost Optimization**
- Pay-per-request DynamoDB (vs provisioned)
- 128MB Lambda functions (vs 256MB+)
- CloudFront PriceClass_100 (vs All)
- Removed separate countries table (calculated on-demand)

✅ **Well-Architected Principles**
- **Operational Excellence**: Unified deployment, monitoring
- **Security**: CORS, input validation, least privilege IAM
- **Reliability**: Multi-AZ, error handling, graceful degradation
- **Performance**: CDN, optimized queries, efficient Lambda
- **Cost Optimization**: Right-sized resources, pay-per-use
- **Sustainability**: Minimal resource footprint

✅ **Simplified Architecture**
- Single SAM template for all resources
- Unified deployment script
- Removed complex CI/CD pipeline
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites

- AWS CLI v2 configured
- SAM CLI installed
- Node.js 18+ 
- Git

### One-Command Deployment

```bash
# Clone repository
git clone <your-repo>
cd game-vibe-plane

# Install dependencies
npm run install-deps

# Deploy to development (infrastructure + frontend)
npm run deploy:dev:full

# Deploy to production (infrastructure + frontend)  
npm run deploy:prod:full
```

That's it! No warnings, no complex setup. ✨

## 📋 Available Commands

### Deployment Commands

```bash
# Infrastructure only
npm run deploy:dev          # Deploy backend to dev
npm run deploy:prod         # Deploy backend to prod

# Frontend only  
npm run deploy-frontend:dev  # Deploy frontend to dev
npm run deploy-frontend:prod # Deploy frontend to prod

# Full deployment (recommended)
npm run deploy:dev:full     # Deploy everything to dev
npm run deploy:prod:full    # Deploy everything to prod
```

### Development Commands

```bash
npm run local               # Run API locally
npm run test                # Run tests
npm run lint                # Lint code
npm run logs:dev            # View dev logs
npm run logs:prod           # View prod logs
```

### Cleanup Commands

```bash
npm run destroy:dev         # Remove dev environment
npm run destroy:prod        # Remove prod environment
```

## 🏛️ Well-Architected Framework Compliance

### 1. Operational Excellence

- **Infrastructure as Code**: Single SAM template
- **Automated Deployment**: One-command deployment
- **Monitoring**: CloudWatch logs and alarms
- **Environment Separation**: Dev/prod isolation

### 2. Security

- **Least Privilege**: IAM roles with minimal permissions
- **Data Protection**: CORS, input validation, sanitization
- **Network Security**: CloudFront, API Gateway rate limiting
- **Audit**: CloudWatch logging for all operations

### 3. Reliability

- **Multi-AZ**: DynamoDB and Lambda auto-scaling
- **Error Handling**: Graceful degradation, retry logic
- **Backup**: Point-in-time recovery (prod only)
- **Monitoring**: Health checks and alarms

### 4. Performance Efficiency

- **Right Sizing**: 128MB Lambda for 1-1000 users
- **Caching**: CloudFront CDN, API Gateway caching
- **Database**: Optimized DynamoDB GSIs
- **Real-time**: WebSocket for live updates

### 5. Cost Optimization

- **Pay-per-Use**: DynamoDB on-demand, Lambda
- **Resource Right-Sizing**: Minimal memory/timeout
- **Efficient Architecture**: Removed unnecessary services
- **Monitoring**: Cost alarms and budgets

### 6. Sustainability

- **Minimal Resources**: Only what's needed
- **Efficient Code**: Optimized Lambda functions
- **Regional Deployment**: Single region (ap-southeast-1)
- **Auto-scaling**: Resources scale to zero when unused

## 💰 Cost Analysis

### Expected Monthly Costs (1-1000 users)

| Service | Dev Environment | Prod Environment | Notes |
|---------|----------------|------------------|-------|
| **Lambda** | $0.20 | $2.00 | 128MB, pay-per-invocation |
| **DynamoDB** | $0.50 | $5.00 | Pay-per-request, GSIs |
| **API Gateway** | $0.30 | $3.00 | REST + WebSocket |
| **CloudFront** | $0.10 | $1.00 | PriceClass_100 |
| **S3** | $0.05 | $0.20 | Static hosting |
| **CloudWatch** | $0.10 | $0.50 | Logs and monitoring |
| **Total** | **~$1.25** | **~$11.70** | **Per month** |

### Cost Optimization Features

- **Auto-scaling to Zero**: No idle costs
- **Pay-per-Request**: Only pay for actual usage
- **Efficient Queries**: Optimized DynamoDB access patterns
- **CDN Caching**: Reduced origin requests
- **Right-sized Resources**: No over-provisioning

## 🔧 Configuration

### Environment Variables

The system automatically configures based on environment:

```bash
# Development
ENVIRONMENT=dev
CORS_ORIGIN=*

# Production  
ENVIRONMENT=prod
CORS_ORIGIN=https://yourdomain.com
```

### Custom Domain (Optional)

For production with custom domain:

```bash
# Update samconfig.toml
[prod.deploy.parameters]
parameter_overrides = "Environment=prod DomainName=yourdomain.com CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/..."
```

## 📊 Monitoring & Observability

### CloudWatch Dashboards

- **API Performance**: Request count, latency, errors
- **Lambda Metrics**: Duration, memory usage, errors  
- **DynamoDB Metrics**: Read/write capacity, throttling
- **Cost Tracking**: Daily spend, budget alerts

### Alarms (Production Only)

- High error rate (>10 errors in 5 minutes)
- Lambda duration >10 seconds average
- DynamoDB throttling
- Cost budget exceeded

### Log Analysis

```bash
# View real-time logs
npm run logs:dev
npm run logs:prod

# Search specific function logs
sam logs --stack-name game-vibe-plane-prod --name SubmitScoreFunction --tail
```

## 🔒 Security Features

### API Security

- **CORS**: Environment-specific origin validation
- **Rate Limiting**: 20 req/s (dev), 100 req/s (prod)
- **Input Validation**: Score validation, sanitization
- **Authentication**: Ready for API keys/Cognito

### Data Security

- **Encryption**: DynamoDB encryption at rest
- **Network**: VPC endpoints (optional)
- **Access Control**: IAM least privilege
- **Audit Trail**: CloudWatch logging

## 🧪 Testing

### Local Development

```bash
# Start local API
npm run local

# Test endpoints
curl http://localhost:3000/health
curl -X POST http://localhost:3000/submit-score -d '{"username":"test","score":100,"survivalTime":60}'
```

### Integration Testing

```bash
# Run test suite
npm run test

# Test specific environment
curl https://your-api-url/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Verify SAM CLI
   sam --version
   ```

2. **Frontend Not Loading**
   ```bash
   # Check CloudFront distribution
   aws cloudfront list-distributions
   
   # Invalidate cache
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

3. **API Errors**
   ```bash
   # Check logs
   npm run logs:dev
   
   # Test health endpoint
   curl https://your-api-url/health
   ```

### Debug Mode

```bash
# Enable verbose logging
export SAM_CLI_TELEMETRY=0
sam deploy --debug
```

## 📈 Scaling Considerations

### Current Capacity (1-1000 users)

- **API Gateway**: 100 req/s burst
- **Lambda**: 1000 concurrent executions
- **DynamoDB**: 40,000 RCU/WCU on-demand
- **CloudFront**: Global CDN

### Scaling Beyond 1000 Users

1. **Enable DynamoDB Auto Scaling**
2. **Add API Gateway caching**
3. **Implement Lambda reserved concurrency**
4. **Add WAF for DDoS protection**
5. **Consider Aurora Serverless for complex queries**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS Well-Architected Framework
- AWS SAM CLI
- Serverless best practices community

---

**Built with ❤️ following AWS Well-Architected Framework principles**

🎮 **Ready to deploy your real-time leaderboard system!**