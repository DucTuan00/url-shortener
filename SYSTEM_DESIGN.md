# URL Shortener System Design

> Tài liệu thiết kế hệ thống URL Shortener (kiểu Bitly)
> Dùng làm nền tảng để xây dựng codebase từng bước.

---

## 1. Tổng quan dự án

### 1.1 Mục tiêu
Xây dựng hệ thống rút gọn URL cho phép:
- Chuyển URL dài thành URL ngắn (VD: `https://example.com/very-long-path` → `https://short.ly/abc123`)
- Redirect người dùng khi truy cập URL ngắn
- Theo dõi analytics (số click, vị trí, thiết bị...)
- Scale được hàng triệu link và request

### 1.2 Đánh giá độ phức tạp MVP

| Aspect | Đánh giá |
|--------|----------|
| Core (tạo link + redirect) | ⭐ Đơn giản |
| Database design | ⭐⭐ Trung bình |
| Caching với Redis | ⭐⭐ Trung bình |
| Analytics tracking | ⭐⭐⭐ Trung bình - Khó |
| Authentication | ⭐⭐ Trung bình |
| Scale & Performance | ⭐⭐⭐⭐ Khó |

**Kết luận:** MVP hoàn toàn khả thi. Nên chia thành các phase để build dần.

### 1.3 Phân chia Phase phát triển

#### Phase 1 — Core MVP
- Tạo short URL (POST API)
- Redirect khi truy cập short URL (GET)
- Lưu mapping URL vào PostgreSQL
- UI cơ bản với Next.js
- **Mục tiêu:** Hệ thống hoạt động end-to-end

#### Phase 2 — Caching & Performance
- Tích hợp Redis cache cho redirect (giảm DB hit)
- Rate limiting bằng Redis
- Custom alias (cho phép user chọn slug riêng)
- URL expiration (link hết hạn)

#### Phase 3 — Analytics & Tracking
- Đếm số click
- Tracking: IP, User-Agent, Referer, Geo location
- Dashboard hiển thị analytics
- Async processing với Job Queue (BullMQ)

#### Phase 4 — User Management & Advanced
- Authentication (đăng ký, đăng nhập)
- Quản lý link cá nhân
- Bulk URL creation
- QR Code generation
- API key cho developer

#### Phase 5 — Scale & Production
- Docker containerization
- Load balancing
- Database optimization (indexing, partitioning)
- Monitoring & Logging

---

## 2. Kiến trúc hệ thống

### 2.1 Architecture Pattern: Modular Monolith

```
Tại sao Modular Monolith?
├── Đơn giản hơn Microservices cho MVP
├── Dễ deploy, dễ debug
├── Chia module rõ ràng → dễ tách thành microservice sau
├── Phù hợp team nhỏ / solo developer
└── Vẫn đảm bảo clean code & separation of concerns
```

### 2.2 Cấu trúc tổng thể

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client     │────▶│   Next.js App    │────▶│  Express API    │
│  (Browser)   │◀────│   (Frontend)     │◀────│  (Backend)      │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                              ┌────────┼────────┐
                                              │        │        │
                                              ▼        ▼        ▼
                                          ┌──────┐ ┌──────┐ ┌──────────┐
                                          │Redis │ │Postgr│ │ BullMQ   │
                                          │Cache │ │ eSQL │ │ (Queue)  │
                                          └──────┘ └──────┘ └──────────┘
```

### 2.3 Luồng hoạt động chính

#### Tạo Short URL:
```
Client → POST /api/shorten { originalUrl: "https://..." }
  → Validate URL
  → Generate short code (Base62)
  → Check collision trong DB
  → Lưu mapping vào PostgreSQL
  → Cache vào Redis
  → Return { shortUrl: "https://short.ly/abc123" }
```

#### Redirect:
```
Client → GET /:shortCode
  → Tìm trong Redis cache (CACHE HIT → redirect ngay)
  → Nếu CACHE MISS → query PostgreSQL
  → Lưu vào Redis cache
  → Gửi async event để tracking analytics (Job Queue)
  → HTTP 301/302 Redirect đến original URL
```

#### Analytics Tracking (Async):
```
Redirect event → Push vào BullMQ Job Queue
  → Worker xử lý async:
    → Parse User-Agent (device, browser, OS)
    → Lookup Geo từ IP
    → Lưu click record vào DB
  → Không block redirect response
```

---

## 3. Design Patterns áp dụng

### 3.1 Repository Pattern
Tách biệt data access logic khỏi business logic.

```typescript
// Ví dụ:
interface IUrlRepository {
  create(data: CreateUrlDto): Promise<Url>;
  findByShortCode(code: string): Promise<Url | null>;
  findByOriginalUrl(url: string): Promise<Url | null>;
  incrementClickCount(code: string): Promise<void>;
}

class UrlRepository implements IUrlRepository {
  // Implementation với Prisma/PostgreSQL
}
```

**Lợi ích:** Dễ test (mock repository), dễ đổi database sau này.

### 3.2 Service Layer Pattern
Business logic nằm trong Service, không nằm trong Controller.

```typescript
// Controller chỉ handle HTTP
class UrlController {
  async shorten(req, res) {
    const result = await this.urlService.createShortUrl(req.body);
    res.json(result);
  }
}

// Service chứa business logic
class UrlService {
  async createShortUrl(dto: CreateUrlDto) {
    // Validate, generate code, check collision, save...
  }
}
```

### 3.3 Strategy Pattern — URL Encoding
Cho phép chọn/đổi thuật toán sinh short code dễ dàng.

```typescript
interface IEncodingStrategy {
  encode(input: string): string;
}

class Base62Strategy implements IEncodingStrategy {
  encode(input: string): string { /* ... */ }
}

class HashStrategy implements IEncodingStrategy {
  encode(input: string): string { /* ... */ }
}

class NanoIdStrategy implements IEncodingStrategy {
  encode(input: string): string { /* ... */ }
}

// Dễ dàng switch strategy
class UrlService {
  constructor(private encoder: IEncodingStrategy) {}
}
```

### 3.4 Cache-Aside Pattern (Redis)
```
Read: Check cache → miss → query DB → populate cache → return
Write: Write DB → invalidate/update cache
```

### 3.5 Observer/Event Pattern (Analytics)
Khi redirect xảy ra, emit event → listener xử lý async, không block response.

---

## 4. Tech Stack chi tiết

### 4.1 Core Stack

| Layer | Technology | Lý do chọn |
|-------|-----------|-------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, Server Components, API Routes, SEO tốt |
| **Frontend Libraries** | Shadcn UI |
| **Backend** | Express.js + TypeScript | Quen thuộc, linh hoạt, ecosystem lớn |
| **Database** | PostgreSQL | Reliable, ACID, JSON support, full-text search |
| **ORM** | Prisma | Type-safe, migration tốt, dễ dùng |
| **Cache** | Redis | In-memory, cực nhanh cho redirect lookup |
| **Queue** | BullMQ | Job queue dựa trên Redis, dành cho async analytics |

### 4.2 Libraries & Tools bổ sung

| Tool | Mục đích | Học được gì |
|------|----------|-------------|
| **TypeScript** | Type safety toàn project | Kiểu dữ liệu, generics, interfaces |
| **Zod** | Schema validation | Runtime validation, type inference |
| **Docker + Docker Compose** | Containerization | DevOps cơ bản, reproducible environment |
| **nanoid** | Generate short ID | Hiệu quả hơn UUID cho short codes |
| **ioredis** | Redis client cho Node.js | Redis commands, pub/sub |
| **helmet** | Security headers | HTTP security best practices |
| **express-rate-limit** | Rate limiting | API protection |
| **ua-parser-js** | Parse User-Agent | Extract device/browser info |
| **qrcode** | Generate QR code | Chức năng bổ sung hay |
| **Jest / Vitest** | Testing | Unit test, integration test |
| **Swagger/OpenAPI** | API documentation | API design best practice |

### 4.3 Tại sao chọn stack này?

**Next.js (Frontend):**
- Server Components giúp tối ưu performance
- App Router là hướng đi mới của React ecosystem
- Built-in API routes có thể dùng cho BFF (Backend for Frontend)
- Tốt cho SEO (preview link page)

**Express.js tách riêng (Backend API):**
- Tách biệt frontend/backend → dễ scale độc lập
- Express quen thuộc, dễ setup middleware
- Dễ thêm WebSocket, background jobs
- Chuẩn bị cho microservice nếu cần

**PostgreSQL:**
- Đáp ứng tốt cho read-heavy workload (URL redirect đọc nhiều hơn ghi)
- Index trên short_code → lookup O(log n)
- JSONB column cho metadata linh hoạt
- Partition table theo thời gian khi data lớn

**Redis:**
- Cache redirect mapping → giảm 80-90% DB queries
- Rate limiting counter
- Session storage (nếu cần auth)
- BullMQ queue backend

---

## 5. Thiết kế Database

### 5.1 Schema chính

```sql
-- Bảng URLs (core)
CREATE TABLE urls (
  id              BIGSERIAL PRIMARY KEY,
  short_code      VARCHAR(10) UNIQUE NOT NULL,
  original_url    TEXT NOT NULL,
  custom_alias    VARCHAR(50) UNIQUE,     -- custom slug do user đặt
  user_id         BIGINT REFERENCES users(id),  -- NULL nếu anonymous
  click_count     BIGINT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMPTZ,            -- NULL = không hết hạn
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho lookup nhanh
CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_urls_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;

-- Bảng Click Analytics
CREATE TABLE clicks (
  id              BIGSERIAL PRIMARY KEY,
  url_id          BIGINT REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at      TIMESTAMPTZ DEFAULT NOW(),
  ip_address      INET,
  user_agent      TEXT,
  referer         TEXT,
  country         VARCHAR(2),
  city            VARCHAR(100),
  device_type     VARCHAR(20),   -- mobile, desktop, tablet
  browser         VARCHAR(50),
  os              VARCHAR(50)
);

-- Index cho analytics queries
CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);

-- Bảng Users (Phase 4)
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(100),
  api_key         VARCHAR(64) UNIQUE,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Redis Cache Structure

```
# URL mapping cache (TTL: 24h, refresh on access)
KEY:   url:{shortCode}
VALUE: { originalUrl, isActive, expiresAt }

# Rate limiting (TTL: window size)
KEY:   ratelimit:{ip}:{window}
VALUE: request_count

# Analytics counter (flush to DB periodically)
KEY:   clicks:{shortCode}:count
VALUE: incremental_count
```

---

## 6. API Design

### 6.1 REST API Endpoints

```
# ─── URL Management ─────────────────────────────────
POST   /api/urls              Tạo short URL
GET    /api/urls              Lấy danh sách URL (auth required)
GET    /api/urls/:id          Lấy chi tiết URL
PATCH  /api/urls/:id          Cập nhật URL (custom alias, expiration)
DELETE /api/urls/:id          Xoá/deactivate URL

# ─── Redirect ───────────────────────────────────────
GET    /:shortCode            Redirect đến original URL

# ─── Analytics ──────────────────────────────────────
GET    /api/urls/:id/stats         Tổng quan analytics
GET    /api/urls/:id/stats/clicks  Chi tiết click theo thời gian
GET    /api/urls/:id/stats/geo     Phân bổ theo địa lý
GET    /api/urls/:id/stats/devices Phân bổ theo thiết bị

# ─── Auth (Phase 4) ────────────────────────────────
POST   /api/auth/register     Đăng ký
POST   /api/auth/login        Đăng nhập
POST   /api/auth/refresh      Refresh token

# ─── Utility ────────────────────────────────────────
POST   /api/urls/bulk         Tạo nhiều short URL cùng lúc
GET    /api/urls/:id/qrcode   Generate QR code
```

### 6.2 Request/Response Examples

**Tạo Short URL:**
```json
// POST /api/urls
// Request:
{
  "url": "https://example.com/very/long/article/path",
  "customAlias": "my-link",     // optional
  "expiresAt": "2026-12-31"    // optional
}

// Response: 201 Created
{
  "id": 1,
  "shortCode": "abc123",
  "shortUrl": "https://short.ly/abc123",
  "originalUrl": "https://example.com/very/long/article/path",
  "expiresAt": "2026-12-31T00:00:00Z",
  "createdAt": "2026-04-08T10:00:00Z"
}
```

**Redirect:**
```
GET /abc123
→ 302 Found
→ Location: https://example.com/very/long/article/path
```

**Analytics:**
```json
// GET /api/urls/1/stats
{
  "totalClicks": 15234,
  "uniqueClicks": 8921,
  "clicksByDate": [
    { "date": "2026-04-07", "clicks": 523 },
    { "date": "2026-04-08", "clicks": 312 }
  ],
  "topCountries": [
    { "country": "VN", "clicks": 8000 },
    { "country": "US", "clicks": 3000 }
  ],
  "topDevices": [
    { "device": "mobile", "percentage": 65 },
    { "device": "desktop", "percentage": 30 }
  ]
}
```

---

## 7. Thuật toán sinh Short Code

### 7.1 So sánh các phương pháp

| Method | Ưu điểm | Nhược điểm | Dùng khi |
|--------|---------|------------|----------|
| **Base62 (counter)** | Không collision, ngắn gọn | Predictable (đoán được link tiếp theo) | Simple, sequential |
| **Hash (MD5/SHA256) + truncate** | Deterministic (cùng URL → cùng code) | Có thể collision | Cần dedup |
| **NanoID / Random** | Không predictable, đơn giản | Có thể collision (rất thấp) | **Recommended cho MVP** |
| **Snowflake ID → Base62** | Unique, distributed friendly | Phức tạp hơn | Scale lớn |

### 7.2 Phương pháp đề xuất: NanoID + Base62

```typescript
import { customAlphabet } from 'nanoid';

// Alphabet: a-z A-Z 0-9 (62 ký tự)
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SHORT_CODE_LENGTH = 7;

const generateShortCode = customAlphabet(ALPHABET, SHORT_CODE_LENGTH);
// Kết quả: "aB3kX9p"

// 62^7 = 3.5 trillion combinations → đủ dùng rất lâu
```

### 7.3 Xử lý Collision
```
Generate code → Check DB exists?
  → Không: Lưu bình thường
  → Có: Retry generate (tối đa 3 lần)
  → Vẫn collision: Tăng length lên 8 rồi retry
  → Vẫn fail: Return error
```

---

## 8. Caching Strategy (Redis)

### 8.1 Cache-Aside cho Redirect

```typescript
async function resolve(shortCode: string): Promise<string | null> {
  // 1. Check Redis cache
  const cached = await redis.get(`url:${shortCode}`);
  if (cached) {
    // CACHE HIT → refresh TTL
    await redis.expire(`url:${shortCode}`, 86400); // 24h
    return JSON.parse(cached).originalUrl;
  }

  // 2. CACHE MISS → Query DB
  const url = await urlRepository.findByShortCode(shortCode);
  if (!url || !url.isActive) return null;

  // 3. Check expiration
  if (url.expiresAt && url.expiresAt < new Date()) return null;

  // 4. Populate cache
  await redis.setex(`url:${shortCode}`, 86400, JSON.stringify({
    originalUrl: url.originalUrl,
    isActive: url.isActive,
    expiresAt: url.expiresAt,
  }));

  return url.originalUrl;
}
```

### 8.2 Cache Invalidation
- Khi URL bị xoá/deactivate → `redis.del(`url:${shortCode}`)`
- Khi URL hết hạn → TTL tự xoá hoặc check khi read
- Khi update URL → xoá cache cũ, để tự populate lại

### 8.3 Dự kiến hiệu quả
- 80-90% redirect requests được serve từ Redis (< 1ms)
- Chỉ 10-20% cần query PostgreSQL
- Redirect latency: ~5-10ms (với cache) vs ~50-100ms (không cache)

---

## 9. Phân tích chức năng chi tiết

### 9.1 Chức năng cơ bản (Phase 1-2)

| # | Chức năng | Mô tả | Độ khó |
|---|-----------|-------|--------|
| 1 | Tạo Short URL | Nhập URL dài → nhận URL ngắn | ⭐ |
| 2 | Redirect | Truy cập URL ngắn → chuyển hướng | ⭐ |
| 3 | URL Validation | Kiểm tra URL hợp lệ, không phải malware | ⭐⭐ |
| 4 | Custom Alias | User tự chọn slug (VD: /my-brand) | ⭐⭐ |
| 5 | URL Expiration | Đặt thời hạn cho link | ⭐⭐ |
| 6 | Copy to Clipboard | Nút copy nhanh URL ngắn | ⭐ |
| 7 | Recent Links | Hiển thị các link vừa tạo (localStorage hoặc auth) | ⭐ |

### 9.2 Chức năng nâng cao (Phase 3-4)

| # | Chức năng | Mô tả | Độ khó |
|---|-----------|-------|--------|
| 8 | Click Analytics | Đếm tổng click, unique click | ⭐⭐ |
| 9 | Geo Tracking | Theo dõi quốc gia, thành phố | ⭐⭐⭐ |
| 10 | Device Tracking | Thiết bị, trình duyệt, OS | ⭐⭐ |
| 11 | Time Analytics | Click theo giờ/ngày/tuần/tháng | ⭐⭐ |
| 12 | Dashboard | Giao diện quản lý + biểu đồ analytics | ⭐⭐⭐ |
| 13 | User Auth | Đăng ký, đăng nhập, quản lý account | ⭐⭐ |
| 14 | Link Management | CRUD links, search, filter, sort | ⭐⭐ |
| 15 | QR Code | Generate QR cho mỗi short URL | ⭐ |
| 16 | Bulk Creation | Tạo nhiều short URL cùng lúc (CSV upload) | ⭐⭐⭐ |

### 9.3 Chức năng scale & bảo mật (Phase 5)

| # | Chức năng | Mô tả | Độ khó |
|---|-----------|-------|--------|
| 17 | Rate Limiting | Giới hạn số request/IP/phút | ⭐⭐ |
| 18 | Spam/Malware Check | Kiểm tra URL có phải spam/phishing không | ⭐⭐⭐ |
| 19 | API Key | Cấp API key cho developer sử dụng | ⭐⭐ |
| 20 | Link Preview | Preview page trước khi redirect (an toàn) | ⭐⭐ |
| 21 | Password Protected | Link cần nhập password mới redirect | ⭐⭐ |
| 22 | A/B Testing URLs | 1 short URL → redirect random đến 2+ URLs | ⭐⭐⭐ |

---

## 10. Cấu trúc thư mục dự án

```
url-shortener/
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (marketing)/      # Landing page, about
│   │   │   │   ├── dashboard/        # User dashboard
│   │   │   │   │   ├── links/        # Link management
│   │   │   │   │   └── analytics/    # Analytics views
│   │   │   │   └── [shortCode]/      # Redirect/preview page
│   │   │   ├── components/           # React components
│   │   │   │   ├── ui/               # Base UI (Button, Input...)
│   │   │   │   ├── forms/            # Form components
│   │   │   │   └── charts/           # Analytics charts
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, API client
│   │   │   └── styles/               # Global styles
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          # Express.js Backend
│       ├── src/
│       │   ├── modules/              # Feature modules
│       │   │   ├── url/
│       │   │   │   ├── url.controller.ts
│       │   │   │   ├── url.service.ts
│       │   │   │   ├── url.repository.ts
│       │   │   │   ├── url.routes.ts
│       │   │   │   ├── url.validation.ts
│       │   │   │   └── url.types.ts
│       │   │   ├── redirect/
│       │   │   │   ├── redirect.controller.ts
│       │   │   │   ├── redirect.service.ts
│       │   │   │   └── redirect.routes.ts
│       │   │   ├── analytics/
│       │   │   │   ├── analytics.controller.ts
│       │   │   │   ├── analytics.service.ts
│       │   │   │   ├── analytics.repository.ts
│       │   │   │   ├── analytics.worker.ts     # BullMQ worker
│       │   │   │   └── analytics.routes.ts
│       │   │   └── auth/
│       │   │       ├── auth.controller.ts
│       │   │       ├── auth.service.ts
│       │   │       └── auth.routes.ts
│       │   ├── core/                 # Shared core
│       │   │   ├── database/         # Prisma client, connection
│       │   │   ├── cache/            # Redis client, cache utils
│       │   │   ├── queue/            # BullMQ setup
│       │   │   ├── middleware/       # Auth, rate-limit, error handler
│       │   │   ├── encoding/         # Short code strategies
│       │   │   └── config/           # Environment config
│       │   ├── shared/               # Shared types, utils
│       │   │   ├── types/
│       │   │   ├── utils/
│       │   │   └── errors/           # Custom error classes
│       │   └── app.ts                # Express app setup
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── tests/
│       ├── tsconfig.json
│       └── package.json
│
├── docker-compose.yml                # PostgreSQL + Redis + App
├── .env.example
├── .gitignore
├── README.md
└── SYSTEM_DESIGN.md                  # ← File này
```

---

## 11. 301 vs 302 Redirect — Khi nào dùng gì?

| | 301 (Permanent) | 302 (Temporary) |
|---|---|---|
| Browser cache | Có (browser nhớ, không request lại) | Không (luôn request server) |
| SEO | Chuyển SEO juice sang URL đích | Giữ SEO ở short URL |
| Analytics | ❌ Không track được sau lần đầu | ✅ Track được mọi click |
| Dùng khi | Link không bao giờ đổi | **Cần tracking → Dùng 302** |

**Quyết định:** Dùng **302 Found** cho tất cả redirect để đảm bảo tracking analytics chính xác.

---

## 12. Xử lý các vấn đề quan trọng

### 12.1 Collision Handling
- NanoID 7 chars = 62^7 ≈ 3.5 trillion combinations
- Probability collision cực thấp ở quy mô triệu links
- Giải pháp: Retry + tăng length nếu cần

### 12.2 Expired Links
- Check `expires_at` khi redirect
- Cron job chạy hàng ngày: deactivate expired links
- Trả về 410 Gone cho link hết hạn

### 12.3 Security
- Validate URL format (chống injection)
- Rate limiting: 10 creates/phút, 100 redirects/phút per IP
- Sanitize input (XSS, SQL injection → Prisma đã handle)
- Helmet.js cho HTTP security headers
- CORS configuration

### 12.4 Read-Heavy Optimization
- Tỷ lệ Read:Write ≈ 100:1 (redirect nhiều hơn create rất nhiều)
- Redis cache ưu tiên read path
- PostgreSQL: Index trên `short_code` (B-tree)
- Connection pooling (Prisma built-in)
- Tách read replica nếu cần scale thêm

---

## 13. Deployment Strategy

### 13.1 Production Platforms (Free tier, không ngủ đông)

| Service | Platform | Ghi chú |
|---------|----------|---------|
| **Next.js Frontend** | [Vercel](https://vercel.com) | Deploy thẳng từ GitHub, free tier rất tốt |
| **Express.js API** | [Koyeb](https://koyeb.com) | Free tier không sleep, deploy từ GitHub |
| **PostgreSQL** | [Neon](https://neon.tech) | Serverless Postgres, free tier 0.5 GB |
| **Redis + BullMQ** | [Upstash](https://upstash.com) | Serverless Redis, free tier 10k commands/ngày |

### 13.2 Docker — Dùng ở đâu?

**Local development:** Docker Compose để chạy PostgreSQL + Redis trên máy (không cần cài thủ công).

**Production:** **Không cần Docker.** Vercel và Koyeb đều deploy thẳng từ GitHub repo, Neon và Upstash là managed services. Koyeb hỗ trợ cả Docker image nếu sau này muốn containerize thêm.

```
Local:       docker-compose up  →  PostgreSQL + Redis chạy local
Production:  push to GitHub     →  Vercel + Koyeb tự build & deploy
```

---

## 14. Monitoring & Observability (Bonus)

Khi production, nên track:
- **Response time** của redirect endpoint (target: < 50ms)
- **Cache hit ratio** (target: > 80%)
- **Error rate** (target: < 0.1%)
- **DB connection pool** usage
- **Redis memory** usage

Tools đề xuất: `pino` (logging), `prom-client` (Prometheus metrics)

---

## 15. Checklist bắt đầu phát triển

### Chuẩn bị môi trường
- [ ] Cài Node.js 20+, pnpm/npm
- [ ] Cài Docker Desktop (cho PostgreSQL + Redis)
- [ ] Setup IDE (VS Code + extensions)

### Phase 1 — Bắt đầu code
- [ ] Init project structure (monorepo hoặc 2 repos)
- [ ] Setup Express + TypeScript
- [ ] Setup Prisma + PostgreSQL schema
- [ ] Implement URL encoding (NanoID)
- [ ] API: POST /api/urls (tạo short URL)
- [ ] API: GET /:shortCode (redirect)
- [ ] Setup Next.js frontend
- [ ] UI: Form tạo short URL
- [ ] UI: Hiển thị kết quả + copy button
- [ ] Docker Compose cho dev environment
- [ ] Basic error handling

### Phase 2 — Tiếp theo
- [ ] Tích hợp Redis cache
- [ ] Rate limiting
- [ ] Custom alias
- [ ] URL expiration
- [ ] Input validation (Zod)

---

## 16. Tham khảo & Học thêm

### Concepts sẽ học được qua project này:
1. **System Design** — thiết kế hệ thống từ đầu
2. **Caching Strategy** — Redis, cache invalidation
3. **Database Design** — indexing, query optimization
4. **API Design** — RESTful, validation, error handling
5. **Async Processing** — Job queue, background workers
6. **TypeScript** — strict typing, generics, interfaces
7. **Docker** — containerization, compose
8. **Security** — rate limiting, input validation, CORS
9. **Performance** — profiling, optimization
10. **Clean Architecture** — separation of concerns, SOLID principles
