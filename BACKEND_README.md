# Backend Leaderboard - Game Vibe Plane

## 🎯 Tổng Quan

Hệ thống backend leaderboard hoàn chỉnh cho Game Vibe Plane, sử dụng AWS serverless architecture.

## 📦 Nội Dung

### Backend Infrastructure (`backend-leaderboard/`)
- **AWS CDK Stack** - Infrastructure as Code
- **API Gateway** - REST API endpoints
- **Lambda Functions** - Serverless compute
- **DynamoDB** - NoSQL database
- **IP Geolocation** - Country detection

### Frontend Integration
- Username input field (mặc định "Me")
- Auto-submit score khi game over
- Backend API integration
- Enhanced leaderboard display

## 🚀 Quick Start

### 1. Deploy Backend

```bash
cd backend-leaderboard
npm install
cd lambda/submit-score && npm install && cd ../..
cd lambda/get-leaderboard && npm install && cd ../..

# Deploy
cdk bootstrap  # Chỉ lần đầu
cdk deploy
```

### 2. Update Frontend

Sau khi deploy, copy API endpoint và cập nhật `js/api/backendApi.js`:

```javascript
const BACKEND_CONFIG = {
  API_BASE_URL: 'https://YOUR-API-ENDPOINT/prod',
  USE_BACKEND: true,
  FALLBACK_TO_LOCAL: true,
};
```

### 3. Test

```bash
cd backend-leaderboard
./test-api.sh https://YOUR-API-ENDPOINT/prod
```

## 📚 Documentation

| File | Description |
|------|-------------|
| [README.md](backend-leaderboard/README.md) | Main documentation |
| [DEPLOYMENT_GUIDE.md](backend-leaderboard/DEPLOYMENT_GUIDE.md) | Step-by-step deployment |
| [QUICKSTART.md](backend-leaderboard/QUICKSTART.md) | Quick start (Vietnamese) |
| [ARCHITECTURE.md](backend-leaderboard/ARCHITECTURE.md) | System architecture |
| [DEPLOYMENT_CHECKLIST.md](backend-leaderboard/DEPLOYMENT_CHECKLIST.md) | Verification checklist |
| [IMPLEMENTATION_SUMMARY.md](backend-leaderboard/IMPLEMENTATION_SUMMARY.md) | Complete overview |

## 🏗️ Architecture

```
Browser → API Gateway → Lambda → DynamoDB
                ↓
          IP → Country
```

**Components:**
- **API Gateway**: 2 endpoints (submit-score, leaderboard)
- **Lambda**: 2 functions (Node.js 18.x)
- **DynamoDB**: 1 table with 2 GSI indexes

## 📊 Features

### Game Data Collected
1. **Username** - Tên người chơi (mặc định "Me")
2. **Score** - Điểm số
3. **Survival Time** - Thời gian sống sót
4. **Death Cause** - Nguyên nhân chết
5. **Client IP** - IP address
6. **Country** - Mã quốc gia (từ IP)

### Analytics Support
- Global leaderboard
- Country-based leaderboards
- Death cause statistics
- Average scores and survival times
- Top countries by player count

## 💰 Cost

**Ước tính cho 100K games/tháng**: ~$1.50-$5 USD

- DynamoDB: Pay-per-request
- Lambda: Free tier covers 1M requests
- API Gateway: $3.50/million requests

## 🔒 Security

- CORS enabled (configurable)
- Rate limiting (100 req/s)
- IAM roles with least privilege
- DynamoDB encryption at rest
- Point-in-time recovery

## 🎮 Usage

### In Menu
- Player enters username (or leaves empty for "Me")
- Username saved for current session

### On Game Over
- Auto-submit: username, score, survival time, death cause
- Client IP and country automatically added
- Data stored in DynamoDB

### In Leaderboard
- Display global top scores
- Show country codes
- Can filter by country (in future)

## 🛠️ Tech Stack

- **AWS CDK** - Infrastructure
- **TypeScript** - CDK code
- **Node.js 18.x** - Lambda runtime
- **JavaScript** - Frontend integration
- **DynamoDB** - Database
- **API Gateway** - REST API

## 📝 Database Schema

```typescript
{
  sessionId: "unique-id",           // PK
  timestamp: 1697456789000,         // SK
  username: "PlayerName",
  score: 12345,
  survivalTime: 180,
  deathCause: "asteroid collision",
  clientIp: "123.45.67.89",
  country: "VN",
  gameType: "default"
}
```

**Indexes:**
- `ScoreIndex`: gameType + score (DESC)
- `CountryIndex`: country + score (DESC)

## 🔧 Development

### Test API
```bash
./backend-leaderboard/test-api.sh YOUR-API-ENDPOINT
```

### View Logs
```bash
aws logs tail /aws/lambda/GameVibePlane-SubmitScore --follow
```

### Update Backend
```bash
cd backend-leaderboard
# Make changes
cdk deploy
```

## 🎯 Next Steps

1. ✅ Deploy backend to AWS
2. ✅ Update frontend config
3. ✅ Test integration
4. ✅ Monitor CloudWatch
5. [ ] Set up alarms (optional)
6. [ ] Create analytics dashboard (optional)
7. [ ] Add authentication (optional)

## 📞 Support

For issues:
1. Check CloudWatch logs
2. Review documentation
3. Run test script
4. Check AWS Console

## 🌟 Features for Future

- Real-time leaderboard updates (WebSocket)
- Analytics dashboard (QuickSight)
- User authentication (Cognito)
- Friend leaderboards
- Achievements system
- Replay storage
- Multi-region deployment

---

**Built with ❤️ for Game Vibe Plane**

Ready to deploy! 🚀
