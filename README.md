Kiến trúc AWS cho Game Vibe Plane

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

Khi người dùng truy cập trang web, họ sẽ được phục vụ từ Edge Location gần nhất, giúp giảm đáng kể độ trễ và tăng tốc độ tải trang.

Cung cấp HTTPS miễn phí thông qua AWS Certificate Manager (ACM).

Cấu hình nhiều behavior:

Behavior mặc định (\*) trỏ đến S3 origin để phục vụ các tệp tĩnh.

Các behavior tùy chỉnh (ví dụ /api/_, /ws/_) được cấu hình để chuyển tiếp các yêu cầu đến API Gateway, hoạt động như một reverse proxy.

2. Backend API (API Gateway)

REST API:

/submit-score (POST): Tiếp nhận điểm số từ người chơi.

/leaderboard (GET): Trả về bảng xếp hạng toàn cầu.

/leaderboard/country (GET): Trả về bảng xếp hạng các quốc gia.

/health (GET): Điểm cuối kiểm tra tình trạng hoạt động của hệ thống.

WebSocket API:

$connect: Xử lý khi một client mới kết nối, kích hoạt Lambda để lưu connectionId.

$disconnect: Xử lý khi một client ngắt kết nối, kích hoạt Lambda để xóa connectionId.

$default: Xử lý các tin nhắn đến khác (ví dụ: subscribe, ping).

3. Logic Nghiệp Vụ (AWS Lambda)

Các hàm Lambda được viết bằng Node.js và được quản lý bởi Serverless Framework (serverless.yml).

submitScore:

Được kích hoạt bởi API Gateway REST.

Xác thực dữ liệu đầu vào.

Sử dụng IP của client để gọi dịch vụ GeoIP bên ngoài, xác định quốc gia.

So sánh điểm mới với điểm cao nhất đã lưu của người chơi đó trong ScoresTable.

Nếu điểm cao hơn, ghi đè bản ghi. Nếu chưa có, tạo bản ghi mới.

Cập nhật (hoặc tạo mới) thống kê cho quốc gia trong CountriesTable.

getLeaderboard & getCountryLeaderboard:

Được kích hoạt bởi API Gateway REST.

Truy vấn DynamoDB (sử dụng Global Secondary Index - GSI để tối ưu) để lấy dữ liệu xếp hạng.

websocketConnect / websocketDisconnect:

Được kích hoạt bởi API Gateway WebSocket.

Thêm hoặc xóa connectionId từ WebSocketTable.

processScoreUpdate:

Điểm mấu chốt của hệ thống real-time.

Được kích hoạt bởi DynamoDB Stream từ ScoresTable mỗi khi có điểm số mới được ghi hoặc cập nhật.

Truy vấn lại ScoresTable và CountriesTable để lấy bảng xếp hạng mới nhất.

Lấy danh sách tất cả connectionId đang hoạt động từ WebSocketTable.

Sử dụng API Gateway Management API để gửi (broadcast) dữ liệu bảng xếp hạng mới đến tất cả các client đang kết nối.

4. Lưu Trữ Dữ Liệu (Amazon DynamoDB)

Kiến trúc sử dụng ba bảng NoSQL để lưu trữ dữ liệu:

ScoresTable:

Khóa chính: userId (để mỗi người chơi chỉ có một bản ghi điểm cao nhất).

Thuộc tính: username, score, country, timestamp, deathCause, leaderboard (giá trị tĩnh "global" cho GSI),...

Global Secondary Index (GSI):

ScoreIndex: leaderboard (Partition Key) và score (Sort Key) -> cho phép truy vấn top điểm toàn cầu hiệu quả.

CountryIndex: country (Partition Key) và score (Sort Key) -> cho phép truy vấn top điểm theo từng quốc gia.

CountriesTable:

Khóa chính: country.

Thuộc tính: totalScore, playerCount, averageScore, top10PercentScore.

Dùng để tổng hợp và xếp hạng các quốc gia.

WebSocketTable:

Khóa chính: connectionId.

Thuộc tính: ttl (Time to Live) để tự động dọn dẹp các kết nối cũ.

🔄 Luồng Hoạt Động Chi Tiết

Người dùng truy cập game: Yêu cầu đến CloudFront. CloudFront phục vụ các tệp tĩnh từ S3 cache.

Người dùng chơi game và kết thúc: Frontend gửi yêu cầu POST đến /api/submit-score qua CloudFront.

CloudFront chuyển tiếp yêu cầu đến API Gateway REST.

API Gateway kích hoạt Lambda submitScore.

Lambda submitScore xử lý, cập nhật dữ liệu vào DynamoDB.

Sự thay đổi trong ScoresTable tạo ra một sự kiện trong DynamoDB Stream.

Stream kích hoạt Lambda processScoreUpdate.

Lambda processScoreUpdate lấy dữ liệu xếp hạng mới nhất và sử dụng API Gateway Management API để gửi cập nhật đến tất cả các client đã kết nối qua API Gateway WebSocket.

Giao diện của tất cả người dùng đang mở bảng xếp hạng được cập nhật ngay lập tức.
