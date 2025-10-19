# Game Vibe Plane - Game Sinh Tồn Không Gian Thời Gian Thực

Một trò chơi sinh tồn không gian có nhịp độ nhanh với **bảng xếp hạng toàn cầu thời gian thực**, nơi bạn điều hướng qua các mối nguy hiểm trong vũ trụ, thu thập vật phẩm tăng sức mạnh và cạnh tranh với người chơi trên toàn thế giới.

## 🎮 Tổng Quan Trò Chơi

Game Vibe Plane là một trò chơi arcade dựa trên web đầy hành động với bảng xếp hạng nhiều người chơi theo thời gian thực. Điều khiển tàu vũ trụ của bạn vượt qua các mối nguy hiểm không gian ngày càng thử thách trong khi cạnh tranh vị trí hàng đầu trên bảng xếp hạng toàn cầu và theo quốc gia.

### 🌟 Tính Năng Chính

- **🏆 Bảng Xếp Hạng Toàn Cầu Thời Gian Thực**: Cạnh tranh với người chơi trên toàn thế giới với các cập nhật trực tiếp.
- **🌍 Xếp Hạng Quốc Gia**: Các quốc gia được xếp hạng dựa trên tổng điểm của 10% người chơi hàng đầu.
- **⚡ Hệ Thống Sự Kiện Động**: Trải nghiệm các sự kiện vũ trụ ngẫu nhiên như mưa thiên thạch, bão plasma và từ trường.
- **💎 Vật Phẩm Tăng Sức Mạnh & Khiên**: Thu thập các mảnh tinh thể để có được sự bảo vệ tạm thời.
- **📊 Thống Kê Trực Tiếp**: Theo dõi tiến trình của bạn với số liệu thống kê chi tiết và phân tích nguyên nhân "game over".
- **🔄 Tích Hợp WebSocket**: Cập nhật thời gian thực mà không cần làm mới trang.
- **📱 Thiết Kế Đáp Ứng**: Chơi trên máy tính để bàn, máy tính bảng hoặc thiết bị di động.

### 🎯 Cơ Chế Chơi

1.  **Di Chuyển**: Điều khiển bằng chuột/cảm ứng để điều hướng tàu vũ trụ chính xác.
2.  **Tính Điểm**: Kiếm điểm thông qua di chuyển và thời gian sống sót.
3.  **Sinh Tồn**: Tránh thiên thạch, tên lửa, hố đen, tia laser và các mối nguy hiểm khác.
4.  **Sự Kiện**: Các sự kiện vũ trụ ngẫu nhiên làm thay đổi động lực chơi.
5.  **Cạnh Tranh**: Xếp hạng thời gian thực so với người chơi toàn cầu.

---

## 🏗️ Kiến Trúc Hệ Thống

### 🎯 Tổng Quan

Stellar Drift (tên cũ của Game Vibe Plane được tìm thấy trong code) sử dụng kiến trúc serverless hiện đại được thiết kế cho khả năng mở rộng, hiệu suất và phạm vi tiếp cận toàn cầu. Hệ thống hỗ trợ các tính năng nhiều người chơi thời gian thực với khả năng tự động thay đổi quy mô và tối ưu hóa chi phí.

### 🖥️ Kiến Trúc Frontend

- **HTML5 Canvas**: Công cụ kết xuất 2D hiệu suất cao.
- **Vanilla JavaScript**: Game engine không phụ thuộc để đạt hiệu suất tối đa.
- **CSS3**: Hệ thống bố cục đáp ứng.
- **WebSocket API**: Giao tiếp hai chiều thời gian thực.
- **Web Audio API**: Hệ thống âm thanh không gian sống động.
- **LocalStorage**: Lưu trữ cài đặt và tiến trình phía client.

### ☁️ Kiến Trúc Backend (AWS Serverless)

#### Các Thành Phần Hạ Tầng AWS

- **Amazon API Gateway**: Cung cấp các điểm cuối API RESTful (để gửi điểm, lấy bảng xếp hạng) và WebSocket API (cho cập nhật thời gian thực).
- **AWS Lambda**: Các hàm tính toán serverless (Node.js 18.x) xử lý logic nghiệp vụ.
- **Amazon DynamoDB**: Cơ sở dữ liệu NoSQL với khả năng tự động thay đổi quy mô, lưu trữ điểm số, thông tin quốc gia và kết nối WebSocket.
- **DynamoDB Streams**: Xử lý thay đổi dữ liệu thời gian thực (ví dụ: khi điểm mới được ghi) để cập nhật bảng xếp hạng.
- **CloudWatch**: Giám sát, ghi log và cảnh báo.
- **AWS IAM**: Quản lý quyền truy cập chi tiết cho các tài nguyên AWS.

#### Sơ Đồ Kiến Trúc AWS

```mermaid
graph TD
    F[Frontend (Browser)] -->|REST API| AG_REST[API Gateway REST]
    F -->|WebSocket (WSS)| AG_WS[API Gateway WebSocket]

    AG_REST -->|submitScore| L_Submit[Lambda: submitScore]
    AG_REST -->|getLeaderboard| L_GetGlobal[Lambda: getLeaderboard]
    AG_REST -->|getCountryLeaderboard| L_GetCountry[Lambda: getCountryLeaderboard]
    AG_REST -->|healthCheck| L_Health[Lambda: healthCheck]

    AG_WS -- $connect --> L_Connect[Lambda: websocketConnect]
    AG_WS -- $disconnect --> L_Disconnect[Lambda: websocketDisconnect]
    AG_WS -- $default --> L_Default[Lambda: websocketDefault]

    L_Submit --> DDB_Scores[(DynamoDB: ScoresTable)]
    L_Submit --> DDB_Countries[(DynamoDB: CountriesTable)]
    L_GetGlobal --> DDB_Scores
    L_GetCountry --> DDB_Countries
    L_GetCountry --> DDB_Scores # Lấy top players của quốc gia

    L_Connect --> DDB_WS[(DynamoDB: WebSocketTable)]
    L_Disconnect --> DDB_WS

    DDB_Scores -- Stream --> L_Process[Lambda: processScoreUpdate]
    L_Process --> L_GetGlobal # Lấy BXH mới
    L_Process --> L_GetCountry # Lấy BXH quốc gia mới
    L_Process --> AGW_Mgmt[API Gateway Management API]
    AGW_Mgmt -->|Broadcast Update| AG_WS

    L_Submit --> GeoIP[GeoIP APIs (External)]

    subgraph AWS Cloud
        AG_REST
        AG_WS
        L_Submit
        L_GetGlobal
        L_GetCountry
        L_Health
        L_Connect
        L_Disconnect
        L_Default
        L_Process
        DDB_Scores
        DDB_Countries
        DDB_WS
        AGW_Mgmt[API Gateway Management API]
    end

    style F fill:#f9f,stroke:#333,stroke-width:2px
    style GeoIP fill:#ccf,stroke:#333,stroke-width:2px
```
