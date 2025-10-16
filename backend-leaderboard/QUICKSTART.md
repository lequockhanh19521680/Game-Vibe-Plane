# Backend Leaderboard - Quick Start Guide

Hướng dẫn nhanh để triển khai backend leaderboard cho Game Vibe Plane.

## Tổng Quan

Backend này sử dụng:
- **API Gateway** - REST API endpoint
- **AWS Lambda** - Serverless functions
- **DynamoDB** - NoSQL database
- **AWS CDK** - Infrastructure as Code

## Cài Đặt Nhanh

### 1. Cài đặt dependencies

```bash
cd backend-leaderboard
npm install
cd lambda/submit-score && npm install && cd ../..
cd lambda/get-leaderboard && npm install && cd ../..
```

### 2. Cấu hình AWS credentials

```bash
aws configure
```

### 3. Bootstrap CDK (chỉ lần đầu)

```bash
cdk bootstrap
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Lấy API endpoint

Sau khi deploy, copy URL từ output:
```
ApiEndpoint = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```

### 6. Cập nhật frontend

Mở file `js/api/backendApi.js` và cập nhật:

```javascript
const BACKEND_CONFIG = {
  API_BASE_URL: 'YOUR_API_ENDPOINT_HERE',
  USE_BACKEND: true,
  FALLBACK_TO_LOCAL: true,
};
```

## Tính Năng

### 1. Submit Score (POST /submit-score)

Gửi dữ liệu khi người chơi chết:
- Username (mặc định: "Me")
- Score (điểm số)
- Survival time (thời gian sống sót)
- Death cause (nguyên nhân chết)
- Client IP (tự động)
- Country (tự động từ IP)

### 2. Get Leaderboard (GET /leaderboard)

Lấy bảng xếp hạng:
- Top scores toàn cầu
- Lọc theo quốc gia
- Thống kê chi tiết

## Database Schema

DynamoDB table: `GameVibePlane-GameSessions`

**Attributes:**
- `sessionId` (PK) - ID phiên chơi
- `timestamp` (SK) - Thời gian
- `username` - Tên người chơi
- `score` - Điểm số
- `survivalTime` - Thời gian sống sót (giây)
- `deathCause` - Nguyên nhân chết
- `clientIp` - IP address
- `country` - Mã quốc gia (VN, US, etc.)
- `gameType` - Loại game

**Global Secondary Indexes:**
1. ScoreIndex - Sắp xếp theo điểm
2. CountryIndex - Lọc theo quốc gia

## API Endpoints

### Submit Score

```bash
POST /submit-score
Content-Type: application/json

{
  "username": "PlayerName",
  "score": 12345,
  "survivalTime": 180,
  "deathCause": "asteroid collision"
}
```

### Get Leaderboard

```bash
GET /leaderboard?limit=50&country=VN
```

## Frontend Integration

### Khi game bắt đầu:

```javascript
// Lấy username từ input (mặc định "Me")
const username = document.getElementById('username-input').value || 'Me';
```

### Khi game kết thúc:

```javascript
// Tự động gửi dữ liệu
await BackendAPI.submitScore(username, score, survivalTime, deathCause);
```

### Hiển thị leaderboard:

```javascript
const data = await BackendAPI.fetchLeaderboard(100);
// data.leaderboard - danh sách top players
// data.stats - thống kê
```

## Giám Sát

### Xem logs:

```bash
# Lambda logs
aws logs tail /aws/lambda/GameVibePlane-SubmitScore --follow

# Hoặc vào AWS Console
# CloudWatch → Log groups
```

### DynamoDB:

```bash
# Xem dữ liệu
aws dynamodb scan --table-name GameVibePlane-GameSessions
```

## Chi Phí

Với free tier và usage thông thường:
- DynamoDB: Pay-per-request
- Lambda: 1M requests/tháng miễn phí
- API Gateway: $3.50/million requests

**Ước tính:** < $5/tháng cho 100K games

## Xóa Resources

```bash
cd backend-leaderboard
npm run destroy
```

**Cảnh báo:** Sẽ xóa toàn bộ dữ liệu!

## Troubleshooting

### CORS errors:
- Kiểm tra CORS settings trong API Gateway
- Redeploy: `npm run deploy`

### Lambda errors:
- Xem CloudWatch logs
- Kiểm tra environment variables

### Database errors:
- Kiểm tra IAM permissions
- Xem DynamoDB metrics

## Files Quan Trọng

```
backend-leaderboard/
├── bin/leaderboard-stack.ts      # CDK app entry point
├── lib/leaderboard-stack.ts      # Infrastructure definition
├── lambda/
│   ├── submit-score/index.js     # Submit score handler
│   └── get-leaderboard/index.js  # Get leaderboard handler
├── package.json                   # Dependencies
└── cdk.json                       # CDK config
```

## Tài Liệu Đầy Đủ

Xem `DEPLOYMENT_GUIDE.md` để biết chi tiết hơn.

## Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra CloudWatch logs
2. Xem AWS Console
3. Đọc error messages
4. Tham khảo AWS documentation

---

**Chúc bạn deploy thành công! 🚀**
