# AWS Cost Optimization Guide

This document outlines the cost optimization strategies implemented in the Game Vibe Plane backend architecture.

## 🎯 Cost Optimization Strategies

### 1. **Compute Optimization**

#### Lambda Functions
- **ARM64 Architecture**: All functions use ARM64 (Graviton2) processors for 20% better price-performance
- **Right-sized Memory**: Functions allocated appropriate memory (256MB-1024MB) based on workload
- **Optimized Timeouts**: Conservative timeout settings to prevent runaway costs
- **Reserved Concurrency**: Limited concurrency on stream processing functions to control costs

#### Memory Allocation by Function:
```yaml
submitScore: 1024MB    # High memory for score processing
uploadAvatar: 1024MB   # High memory for image processing
getLeaderboard: 512MB  # Medium memory for data retrieval
healthCheck: 256MB     # Minimal memory for simple checks
websocket: 512MB       # Medium memory for real-time processing
```

### 2. **Storage Optimization**

#### DynamoDB
- **Pay-per-Request Billing**: No provisioned capacity, pay only for actual usage
- **Point-in-Time Recovery**: Enabled only for critical tables (Scores, Countries, Avatars)
- **TTL Configuration**: Automatic cleanup of expired WebSocket connections
- **Efficient Indexing**: Minimal GSIs with projection optimization

#### S3 Storage
- **Lifecycle Policies**: 
  - Delete incomplete multipart uploads after 1 day
  - Delete old versions after 30 days
- **Intelligent Tiering**: Automatic cost optimization for avatar storage
- **Compression**: Images optimized and compressed before storage

### 3. **Network Optimization**

#### API Gateway
- **Caching**: Enabled for leaderboard endpoints (1-5 minutes TTL)
- **Compression**: Automatic response compression
- **Regional Endpoints**: Single region deployment to minimize data transfer costs

#### CloudFront (Recommended for Production)
- **Edge Caching**: Cache static assets and API responses
- **Origin Request Policy**: Optimize cache hit ratios
- **Price Class**: Use Price Class 100 (US, Canada, Europe) for cost control

### 4. **Monitoring and Alerting**

#### CloudWatch
- **Custom Metrics**: Track cost-relevant metrics
- **Alarms**: Alert on high error rates and latency to prevent cost spikes
- **Log Retention**: 30-day retention for cost control

#### Cost Monitoring
```yaml
# CloudWatch Alarms for Cost Control
HighErrorRateAlarm:
  Threshold: 10 errors in 5 minutes
  Action: Alert operations team

HighLatencyAlarm:
  Threshold: 10 seconds average
  Action: Alert operations team

DailySpendAlarm:
  Threshold: $10/day
  Action: Alert finance team
```

### 5. **Development Environment Optimization**

#### Stage-Specific Resources
- **Development**: Minimal resources, shorter retention periods
- **Staging**: Production-like but smaller scale
- **Production**: Full resources with all optimizations

#### Resource Tagging
```yaml
Tags:
  Environment: ${self:provider.stage}
  Service: ${self:service}
  CostCenter: GameDevelopment
  Owner: GameVibeTeam
```

## 💰 Estimated Monthly Costs

### Small Scale (1,000 games/month)
- **Lambda**: $0.50
- **DynamoDB**: $1.00
- **S3**: $0.25
- **API Gateway**: $0.35
- **CloudWatch**: $0.20
- **Total**: ~$2.30/month

### Medium Scale (10,000 games/month)
- **Lambda**: $3.00
- **DynamoDB**: $5.00
- **S3**: $1.50
- **API Gateway**: $3.50
- **CloudWatch**: $1.00
- **Total**: ~$14.00/month

### Large Scale (100,000 games/month)
- **Lambda**: $15.00
- **DynamoDB**: $25.00
- **S3**: $8.00
- **API Gateway**: $35.00
- **CloudWatch**: $5.00
- **Total**: ~$88.00/month

## 🔧 Implementation Details

### 1. **Lambda Optimizations**

```yaml
# Optimized Lambda configuration
provider:
  architecture: arm64        # 20% cost reduction
  memorySize: 512           # Right-sized for workload
  timeout: 30               # Prevent runaway functions
  
functions:
  processScoreUpdate:
    reservedConcurrency: 5   # Limit concurrent executions
    batchSize: 10           # Process multiple records efficiently
```

### 2. **DynamoDB Optimizations**

```yaml
# Cost-optimized DynamoDB table
ScoresTable:
  BillingMode: PAY_PER_REQUEST
  PointInTimeRecoverySpecification:
    PointInTimeRecoveryEnabled: true  # Only for critical data
  
WebSocketTable:
  TimeToLiveSpecification:
    AttributeName: ttl
    Enabled: true                     # Automatic cleanup
```

### 3. **S3 Optimizations**

```yaml
# S3 lifecycle and cost optimization
AvatarBucket:
  LifecycleConfiguration:
    Rules:
      - Id: DeleteIncompleteMultipartUploads
        Status: Enabled
        AbortIncompleteMultipartUpload:
          DaysAfterInitiation: 1
      - Id: DeleteOldVersions
        Status: Enabled
        NoncurrentVersionExpiration:
          NoncurrentDays: 30
```

## 📊 Cost Monitoring Dashboard

### Key Metrics to Track
1. **Lambda Invocations**: Monitor function execution counts
2. **DynamoDB Consumption**: Track read/write capacity units
3. **S3 Storage**: Monitor storage usage and requests
4. **API Gateway Requests**: Track API call volumes
5. **Data Transfer**: Monitor outbound data transfer

### Automated Cost Alerts
```yaml
# CloudWatch Alarms for cost control
DailySpendAlarm:
  MetricName: EstimatedCharges
  Threshold: 10.00  # $10/day
  ComparisonOperator: GreaterThanThreshold
  
MonthlySpendAlarm:
  MetricName: EstimatedCharges
  Threshold: 100.00  # $100/month
  ComparisonOperator: GreaterThanThreshold
```

## 🎛️ Cost Control Measures

### 1. **Resource Limits**
- Maximum file size: 2MB for avatars
- API rate limiting: 25 requests/second
- WebSocket connection limits: 1000 concurrent
- DynamoDB item size limits: 400KB

### 2. **Cleanup Automation**
- Expired WebSocket connections: Hourly cleanup
- Old avatar versions: 30-day retention
- CloudWatch logs: 30-day retention
- Incomplete uploads: 1-day cleanup

### 3. **Environment-Specific Scaling**
```yaml
# Development environment (cost-optimized)
dev:
  memorySize: 256
  timeout: 15
  caching: false
  
# Production environment (performance-optimized)
prod:
  memorySize: 512
  timeout: 30
  caching: true
```

## 🚀 Additional Recommendations

### 1. **Reserved Capacity** (For High Volume)
- Consider DynamoDB reserved capacity for predictable workloads
- Lambda provisioned concurrency for consistent performance

### 2. **Multi-Region Considerations**
- Single region deployment for cost control
- Consider multi-region only for disaster recovery

### 3. **Third-Party Services**
- Use AWS native services to avoid data egress charges
- Minimize external API calls

### 4. **Regular Cost Reviews**
- Monthly cost analysis and optimization
- Quarterly architecture reviews
- Annual reserved instance planning

## 📈 Scaling Considerations

### Automatic Scaling
- Lambda: Automatic scaling with concurrency limits
- DynamoDB: On-demand scaling with burst capacity
- API Gateway: Automatic scaling with throttling

### Manual Scaling Triggers
- 1,000+ concurrent users: Consider provisioned capacity
- 100GB+ storage: Implement S3 Intelligent Tiering
- $500+ monthly: Review reserved capacity options

This cost optimization strategy ensures the Game Vibe Plane backend remains cost-effective while providing excellent performance and scalability.