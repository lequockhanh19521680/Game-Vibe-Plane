Game Vibe Plane - Game Sinh Tồn Không Gian Thời Gian Thực

Một trò chơi sinh tồn không gian có nhịp độ nhanh với bảng xếp hạng toàn cầu thời gian thực, nơi bạn điều hướng qua các mối nguy hiểm trong vũ trụ, thu thập vật phẩm tăng sức mạnh và cạnh tranh với người chơi trên toàn thế giới.

🌟 Tính Năng Chính

🏆 Bảng Xếp Hạng Toàn Cầu Thời Gian Thực: Cạnh tranh với người chơi trên toàn thế giới với các cập nhật trực tiếp.

🌍 Xếp Hạng Quốc Gia: Các quốc gia được xếp hạng dựa trên tổng điểm của 10% người chơi hàng đầu.

⚡ Hệ Thống Sự Kiện Động: Trải nghiệm các sự kiện vũ trụ ngẫu nhiên như mưa thiên thạch, bão plasma và từ trường.

💎 Vật Phẩm Tăng Sức Mạnh & Khiên: Thu thập các mảnh tinh thể để có được sự bảo vệ tạm thời.

📊 Thống Kê Trực Tiếp: Theo dõi tiến trình của bạn với số liệu thống kê chi tiết.

🔄 Tích Hợp WebSocket: Cập nhật thời gian thực mà không cần làm mới trang.

📱 Thiết Kế Đáp Ứng: Chơi trên máy tính để bàn, máy tính bảng hoặc thiết bị di động.

🏗️ Kiến trúc AWS cho Game Vibe Plane

Tài liệu này mô tả kiến trúc hạ tầng đám mây được xây dựng trên Amazon Web Services (AWS) cho dự án "Game Vibe Plane". Kiến trúc này được thiết kế theo mô hình serverless, tập trung vào khả năng mở rộng, hiệu suất cao, tối ưu chi phí và cập nhật dữ liệu theo thời gian thực.

🎯 Tổng Quan Kiến Trúc

Hệ thống được chia thành hai phần chính: Frontend được phân phối toàn cầu qua CDN và Backend xử lý logic nghiệp vụ hoàn toàn serverless.

Frontend Hosting: Các tài sản tĩnh (HTML, CSS, JavaScript, hình ảnh, âm thanh) được lưu trữ trên Amazon S3 và phân phối đến người dùng cuối thông qua Amazon CloudFront, giúp tăng tốc độ tải trang và giảm độ trễ trên toàn cầu.

Backend API:

Amazon API Gateway đóng vai trò là cửa ngõ cho tất cả các yêu cầu, quản lý cả REST API (cho các tác vụ như gửi điểm) và WebSocket API (cho việc cập nhật bảng xếp hạng trực tiếp).

AWS Lambda cung cấp năng lực tính toán, thực thi các hàm logic nghiệp vụ khi được kích hoạt bởi API Gateway hoặc các sự kiện khác.

Amazon DynamoDB là cơ sở dữ liệu NoSQL được quản lý hoàn toàn, lưu trữ điểm số người chơi, bảng xếp hạng quốc gia và thông tin kết nối WebSocket.

DynamoDB Streams được sử dụng để kích hoạt Lambda function một cách tự động khi có sự thay đổi dữ liệu (ví dụ: điểm số mới được ghi), tạo nên một hệ thống cập nhật real-time hiệu quả.

Sơ Đồ Kiến Trúc Chi Tiết

graph TD
subgraph "Người Dùng"
User("👨‍🚀 Người Chơi")
end

    subgraph "AWS Edge Network (CDN)"
        CF["🌐 Amazon CloudFront"]
    end

    subgraph "AWS Cloud - Region (ví dụ: ap-southeast-1)"
        subgraph "Frontend Hosting"
            S3["🗂️ Amazon S3 Bucket<br/>(Lưu trữ file tĩnh: HTML, JS, CSS)"]
        end

        subgraph "Backend API"
            AG_REST["🚪 API Gateway (REST API)<br/>/submit-score, /leaderboard"]
            AG_WS["🔌 API Gateway (WebSocket API)<br/>$connect, $disconnect"]
        end

        subgraph "Compute"
            L_Submit["λ Lambda<br/>(submitScore)"]
            L_Get["λ Lambda<br/>(getLeaderboard)"]
            L_WS["λ Lambda<br/>(websocketConnect, etc.)"]
            L_Process["λ Lambda<br/>(processScoreUpdate)"]
        end

        subgraph "Database"
            DDB_Scores["🗄️ DynamoDB<br/>(ScoresTable)"]
            DDB_Countries["🗄️ DynamoDB<br/>(CountriesTable)"]
            DDB_WS["🗄️ DynamoDB<br/>(WebSocketTable)"]
        end

        DDB_Stream["🔥 DynamoDB Stream"]
        AG_Mgmt["⚙️ API Gateway<br/>Management API"]
    end

    subgraph "Dịch Vụ Bên Ngoài"
        GeoIP["🌍 Dịch vụ GeoIP"]
    end

    %% Định nghĩa các luồng dữ liệu
    User -- "HTTPS: game.yourdomain.com" --> CF

    CF -- "Phân phối tài sản tĩnh (cached)" --> S3
    CF -- "API requests (/api/*)" --> AG_REST
    CF -- "WebSocket connections (/ws/*)" --> AG_WS

    AG_REST -- "/submit-score" --> L_Submit
    AG_REST -- "/leaderboard" --> L_Get

    L_Submit -- "Lấy thông tin quốc gia" --> GeoIP
    L_Submit -- "Ghi/Cập nhật điểm" --> DDB_Scores
    L_Submit -- "Cập nhật thống kê" --> DDB_Countries

    L_Get -- "Đọc Bảng xếp hạng" --> DDB_Scores
    L_Get -- "Đọc BXH Quốc gia" --> DDB_Countries

    AG_WS -- "$connect, $disconnect" --> L_WS
    L_WS -- "Lưu/Xóa Connection ID" --> DDB_WS

    DDB_Scores -- "Sự kiện thay đổi dữ liệu" --> DDB_Stream
    DDB_Stream -- "Kích hoạt (Trigger)" --> L_Process
    L_Process -- "Lấy Top Scores & Countries" --> DDB_Scores & DDB_Countries
    L_Process -- "Lấy danh sách kết nối" --> DDB_WS
    L_Process -- "Gửi tin nhắn" --> AG_Mgmt
    AG_Mgmt -- "Phát cập nhật real-time" --> User

⚙️ Chi Tiết Các Thành Phần

1. Phân Phối Frontend (S3 + CloudFront)

Amazon S3 (Simple Storage Service): Được cấu hình như một website hosting tĩnh. Thùng S3 này chứa tất cả các tệp của thư mục frontend. Quyền truy cập công khai vào các tệp này bị hạn chế, chỉ cho phép CloudFront truy cập thông qua Origin Access Identity (OAI).

Amazon CloudFront:

Hoạt động như một Mạng phân phối nội dung (CDN), cache các tệp tĩnh tại các điểm biên (Edge Location) trên toàn cầu.

Khi người dùng truy cập trang web, họ sẽ được phục vụ từ Edge Location gần nhất.

Cung cấp HTTPS miễn phí thông qua AWS Certificate Manager (ACM).

Cấu hình nhiều behavior để chuyển tiếp các yêu cầu API (/api/_) và WebSocket (/ws/_) đến API Gateway.

2. Backend API (API Gateway)

REST API: Cung cấp các điểm cuối cho việc gửi điểm, lấy bảng xếp hạng và kiểm tra tình trạng hệ thống.

WebSocket API: Quản lý các kết nối thời gian thực để gửi cập nhật trực tiếp đến client.

3. Logic Nghiệp Vụ (AWS Lambda)

submitScore: Xử lý điểm số mới, xác định quốc gia qua IP và cập nhật cơ sở dữ liệu.

getLeaderboard & getCountryLeaderboard: Truy vấn và trả về dữ liệu bảng xếp hạng.

websocketConnect / websocketDisconnect: Quản lý vòng đời kết nối WebSocket.

processScoreUpdate: Trái tim của hệ thống real-time. Được kích hoạt bởi DynamoDB Stream, hàm này tính toán lại bảng xếp hạng và phát (broadcast) cập nhật đến tất cả người dùng đang kết nối.

4. Lưu Trữ Dữ Liệu (Amazon DynamoDB)

ScoresTable: Lưu điểm cao nhất của mỗi người chơi (userId là khóa chính). Sử dụng GSI để truy vấn hiệu quả top điểm toàn cầu và theo quốc gia.

CountriesTable: Tổng hợp dữ liệu xếp hạng cho các quốc gia.

WebSocketTable: Lưu trữ ID của các kết nối WebSocket đang hoạt động. Sử dụng TTL để tự động xóa các kết nối cũ.

🔄 Luồng Hoạt Động Chi Tiết

Truy cập Game: Người dùng truy cập URL, CloudFront phục vụ các tệp frontend từ S3.

Kết thúc Game: Frontend gửi yêu cầu POST điểm số đến API Gateway REST.

Xử lý điểm: API Gateway kích hoạt Lambda submitScore để xác thực và lưu điểm vào DynamoDB.

Kích hoạt Stream: Việc ghi dữ liệu vào ScoresTable sẽ kích hoạt DynamoDB Stream.

Cập nhật Real-time: Stream gọi Lambda processScoreUpdate. Hàm này lấy lại bảng xếp hạng mới nhất, sau đó sử dụng API Gateway Management API để phát cập nhật đến tất cả các client đang kết nối qua WebSocket.

Hiển thị: Giao diện của tất cả người dùng đang xem bảng xếp hạng được cập nhật ngay lập tức.

🚀 Bắt Đầu Nhanh

🎮 Cho Người Chơi

Mở tệp frontend/index.html trong một trình duyệt hiện đại.

Nhập tên của bạn và nhấp "Start Battle".

Sử dụng chuột hoặc cảm ứng để điều khiển tàu vũ trụ.

Sống sót lâu nhất có thể và cạnh tranh trên bảng xếp hạng!

💻 Cho Nhà Phát Triển

Yêu Cầu

Node.js v18+

AWS CLI

Serverless Framework v3

Cài Đặt Backend

# Di chuyển vào thư mục backend

cd backend

# Cài đặt các gói phụ thuộc

npm install

# Triển khai lên AWS (yêu cầu đã cấu hình AWS CLI)

npm run deploy

Chạy Frontend Cục Bộ

# Di chuyển vào thư mục frontend

cd frontend

# Cài đặt một máy chủ cục bộ (nếu chưa có)

npm install -g live-server

# Chạy máy chủ

live-server

Sau khi triển khai backend, hãy cập nhật các URL endpoint trong tệp frontend/js/config/endpoints.js.

Để biết hướng dẫn chi tiết về triển khai và khắc phục sự cố, vui lòng xem các tệp backend/README.md và DEPLOYMENT.md.

📝 Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT.
