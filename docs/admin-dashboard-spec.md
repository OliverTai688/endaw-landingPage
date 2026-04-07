# ENDAW 後台商城管理系統規劃

## 文件資訊

| 項目 | 內容 |
|------|------|
| 專案名稱 | ENDAW 音樂教育平台後台管理系統 |
| 版本 | v1.0 |
| 日期 | 2026-04-07 |
| 基於分支 | `main` (commit: `4f6952f`) |

---

## 一、系統現況分析

### 1.1 已存在的後台功能

| 功能 | 路由 | 狀態 | 描述 |
|------|------|------|------|
| 後台首頁 | `/admin` | 已實作 | Placeholder 統計卡片、頁面連結 |
| 內容管理 | `/admin/content` | 已實作 | Workshop / Music 內容 CRUD、TipTap 富文本、圖片上傳 |
| 登入頁 | `/internal-access` | 已實作 | Cookie-based 密碼認證 |
| 回饋系統 | FeedbackOverlay | 已實作 | 元素選取式修改建議、截圖、Email 通知 |

### 1.2 已存在的架構層

```
src/
├── domain/models/Content.ts            -- ContentEntity, enums
├── application/use-cases/              -- ContentService
├── application/dto/                    -- ContentDTO
├── application/mappers/                -- ContentMapper
├── infrastructure/
│   ├── RepositoryFactory.ts            -- Runtime repository selection
│   └── repositories/
│       ├── IContentRepository.ts       -- Interface contract
│       ├── PrismaContentRepository.ts
│       ├── InMemoryContentRepository.ts
│       └── WebContentRepository.ts     -- Client-side API calls
├── components/providers/ContentProvider.tsx -- React Context
└── lib/auth-server.ts                  -- Cookie auth helper
```

### 1.3 已存在的 Prisma Schema

- 三個 Model: `Content`（base）、`Workshop`（1:1）、`MusicMetadata`（1:1）
- Enums: `ContentType`（WORKSHOP | MUSIC）、`PublishStatus`（DRAFT | PUBLISHED | ARCHIVED）

### 1.4 待遷移至資料庫的靜態資料

| 資料來源 | 檔案路徑 | 筆數 | 說明 |
|----------|----------|------|------|
| 實體商品 | `src/data/products.ts` | 4 筆 | 效果器踏板、配件，USD 定價 |
| 工作坊 | `src/data/workshops.ts` | 3 筆 | 單次活動，TWD 定價，含講師與政策 |
| 樂器課程 | `src/data/music.ts` | 4 樂器 | 多級別、套票制，含 FAQ |

### 1.5 已定義但未實作的 TypeScript 型別

位於 `src/lib/types/index.ts`:
- `Order`（orderType: `workshop` | `music`）
- `WorkshopRegistration`、`MusicRegistration`
- `MonthlyAnnouncement`、`ScheduleItem`

---

## 二、整體架構設計

### 2.1 後台模組總覽

```
┌──────────────────────────────────────────────────────────┐
│                    ENDAW Admin Dashboard                  │
├──────────┬──────────┬──────────┬──────────┬───────────────┤
│  訂單管理  │ 商品上架  │  庫存管理  │ 內容管理  │  數據洞察     │
│  Orders   │ Products │ Inventory│ Content  │  Insights     │
├──────────┴──────────┴──────────┴──────────┴───────────────┤
│               Shared Infrastructure Layer                  │
│   RepositoryFactory ← Domain Services ← API Routes        │
│   Prisma ORM ← PostgreSQL                                 │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Clean Architecture 擴展方式

延續現有 Content 模組的分層模式，每個新領域都遵循:

```
domain/models/           -- Entity + enum
application/use-cases/   -- Service class (business logic)
application/dto/         -- DTO for API transport
application/mappers/     -- Entity <-> DTO conversion
infrastructure/repositories/
    ├── I{Domain}Repository.ts        -- Interface
    ├── Prisma{Domain}Repository.ts   -- DB implementation
    └── Web{Domain}Repository.ts      -- Client-side (optional)
```

### 2.3 RepositoryFactory 擴展策略

擴展現有 `RepositoryFactory`，為每個 domain 增加 getter:

```typescript
export class RepositoryFactory {
    // 既有
    static async getContentRepository(): Promise<IContentRepository> { ... }
    // 新增
    static async getOrderRepository(): Promise<IOrderRepository> { ... }
    static async getProductRepository(): Promise<IProductRepository> { ... }
    static async getInventoryRepository(): Promise<IInventoryRepository> { ... }
    static async getAnnouncementRepository(): Promise<IAnnouncementRepository> { ... }
}
```

### 2.4 認證與權限

維持現有 cookie-based auth，密碼改為環境變數 `ADMIN_PASSWORD`。預留角色擴展空間:

```typescript
enum AdminRole {
    OWNER = 'OWNER',       // 全部權限
    EDITOR = 'EDITOR',     // 內容管理、商品上架
    VIEWER = 'VIEWER',     // 唯讀、數據檢視
}
```

---

## 三、統一側邊導覽結構

### 3.1 導覽架構

```
┌──────────────────────────┐
│  ENDAW Admin             │
├──────────────────────────┤
│                          │
│ 📊 總覽 Overview          │  /admin
│                          │
│ ── 商務管理 ──            │
│ 📋 訂單管理 Orders        │  /admin/orders
│ 🏷️ 商品上架 Products      │  /admin/products
│ 📦 庫存管理 Inventory     │  /admin/inventory
│                          │
│ ── 內容管理 ──            │
│ ✏️ 內容編輯 Content       │  /admin/content（既有）
│ 📢 公告管理 Announcements │  /admin/announcements
│                          │
│ ── 數據分析 ──            │
│ 📈 數據洞察 Insights      │  /admin/insights
│                          │
├──────────────────────────┤
│ 🚪 登出 Logout           │
└──────────────────────────┘
```

### 3.2 實作方式

建立共用 Admin Layout，取代目前各頁面重複的 sidebar:

- **`src/app/admin/layout.tsx`** — Server Component wrapper，包含 auth check 和 sidebar
- **`src/components/admin/AdminSidebar.tsx`** — Client Component，使用 `usePathname()` 判斷 active route

### 3.3 路由結構

```
src/app/admin/
├── layout.tsx                -- 共用 layout (sidebar + auth)
├── page.tsx                  -- Overview dashboard
├── content/page.tsx          -- 既有 CMS
├── orders/
│   ├── page.tsx              -- 訂單列表
│   └── [id]/page.tsx         -- 訂單詳情
├── products/
│   ├── page.tsx              -- 商品列表
│   └── [id]/page.tsx         -- 商品編輯
├── inventory/page.tsx        -- 庫存管理
├── announcements/page.tsx    -- 月份公告管理
└── insights/page.tsx         -- 數據洞察
```

---

## 四、Dashboard 總覽頁面 (`/admin`)

### 4.1 KPI 卡片

| KPI | 數據來源 | 說明 |
|-----|----------|------|
| 本月營收 | Orders SUM(amount) | 已完成付款總額 (TWD) |
| 待處理訂單 | Orders WHERE status='pending' | 需處理的訂單數 |
| 工作坊報名率 | Workshop capacity used / total | 各工作坊填充率 |
| 商品庫存警示 | Product WHERE stock < threshold | 低庫存商品數量 |

### 4.2 頁面佈局

```
┌──────────────────────────────────────────────────┐
│  KPI Cards (4 columns)                            │
│  [本月營收] [待處理訂單] [報名率] [庫存警示]         │
├──────────────────────┬────────────────────────────┤
│  近期訂單 (Table)     │  快速操作面板               │
│  最近 10 筆訂單       │  - 新增商品                │
│  可點擊進入詳情       │  - 發佈公告                │
│                      │  - 處理退款                │
├──────────────────────┴────────────────────────────┤
│  營收趨勢圖 (近 30 天折線圖)                        │
└──────────────────────────────────────────────────┘
```

---

## 五、模組一：訂單管理 (`/admin/orders`)

### 5.1 功能清單

| 功能 | 子功能 | 優先級 |
|------|--------|--------|
| 訂單列表 | 分頁瀏覽、搜尋（訂單號/客戶名稱/Email） | P0 |
| 訂單篩選 | 按類型（工作坊/樂器課/商品）、狀態、日期範圍 | P0 |
| 訂單詳情 | 完整訂單資訊、客戶資料、付款記錄 | P0 |
| 訂單狀態更新 | 手動更新付款狀態 (pending → completed → refunded) | P0 |
| 退款處理 | 退款原因、退款金額（全額/部分）、退款時間 | P1 |
| 訂單備註 | 管理者內部備註（客戶不可見） | P1 |
| 訂單匯出 | CSV 匯出（按日期範圍、按類型） | P2 |
| Email 通知 | 付款/退款確認自動發送通知 | P2 |

### 5.2 資料模型

```prisma
enum OrderType {
    WORKSHOP
    MUSIC
    PRODUCT
}

enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
    PARTIALLY_REFUNDED
}

enum RefundStatus {
    PENDING
    APPROVED
    PROCESSED
    REJECTED
}

model Customer {
    id        String   @id @default(cuid())
    name      String
    email     String   @unique
    phone     String?
    notes     String?  @db.Text
    orders    Order[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Order {
    id              String        @id @default(cuid())
    orderNumber     String        @unique  // "ORD-20260407-001"
    orderType       OrderType
    customerId      String
    customer        Customer      @relation(fields: [customerId], references: [id])
    workshopId      String?
    musicPackageId  String?
    productItems    OrderItem[]
    subtotal        Int
    currency        String        @default("TWD")
    discount        Int           @default(0)
    totalAmount     Int
    paymentStatus   PaymentStatus @default(PENDING)
    paymentMethod   String?
    transactionId   String?
    paidAt          DateTime?
    adminNotes      String?       @db.Text
    refunds         Refund[]
    createdAt       DateTime      @default(now())
    updatedAt       DateTime      @updatedAt
}

model OrderItem {
    id         String  @id @default(cuid())
    orderId    String
    order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
    productId  String
    product    Product @relation(fields: [productId], references: [id])
    quantity   Int     @default(1)
    unitPrice  Int
    variant    String?
}

model Refund {
    id          String       @id @default(cuid())
    orderId     String
    order       Order        @relation(fields: [orderId], references: [id])
    amount      Int
    reason      String       @db.Text
    status      RefundStatus @default(PENDING)
    processedBy String?
    processedAt DateTime?
    createdAt   DateTime     @default(now())
}
```

### 5.3 頁面設計

**訂單列表頁** (`/admin/orders/page.tsx`):
```
┌──────────────────────────────────────────────────────┐
│ 訂單管理                               [匯出 CSV ▼]  │
├──────────────────────────────────────────────────────┤
│ [🔍 搜尋訂單號/客戶] [類型 ▼] [狀態 ▼] [日期範圍 📅]  │
├──────────────────────────────────────────────────────┤
│ 訂單號     │ 客戶   │ 類型   │ 金額    │ 狀態  │ 操作 │
│ ORD-001   │ 王小明 │ 工作坊 │ $1,800  │ ✅已付 │ 👁  │
│ ORD-002   │ 李美玲 │ 樂器課 │ $6,000  │ ⏳待付 │ 👁  │
│ ORD-003   │ 張建宏 │ 商品   │ $129    │ 🔄退款 │ 👁  │
├──────────────────────────────────────────────────────┤
│ 顯示 1-20 筆，共 156 筆                ◀ 1 2 3 ... ▶ │
└──────────────────────────────────────────────────────┘
```

**訂單詳情頁** (`/admin/orders/[id]/page.tsx`):
```
┌──────────────────────────────────────────────────────┐
│ ← 返回訂單列表    訂單 #ORD-20260407-001              │
├────────────────────────┬─────────────────────────────┤
│ 訂單資訊                │ 操作面板                     │
│ 類型: 工作坊            │ [更新狀態 ▼]                 │
│ 建立時間: 2026/04/07    │ [處理退款]                   │
│ 付款方式: 信用卡         │ [發送通知 Email]             │
├────────────────────────┤                             │
│ 客戶資訊                │                             │
│ 姓名: 王小明            │                             │
│ Email: wang@mail.com   │                             │
│ 電話: 0912-345-678     │                             │
├────────────────────────┼─────────────────────────────┤
│ 訂購項目                │ 內部備註                     │
│ 拉丁音樂節工作坊 x1     │ [新增備註...]                │
│ 單價: NT$1,800          │ 04/07 - 客戶詢問停車資訊     │
│ 總計: NT$1,800          │                             │
├────────────────────────┴─────────────────────────────┤
│ 退款記錄                                              │
└──────────────────────────────────────────────────────┘
```

### 5.4 UI 組件

| 組件 | 路徑 | 說明 |
|------|------|------|
| OrderTable | `src/components/admin/orders/OrderTable.tsx` | 可排序/篩選訂單表格 |
| OrderDetail | `src/components/admin/orders/OrderDetail.tsx` | 訂單完整資訊 |
| OrderStatusBadge | `src/components/admin/orders/OrderStatusBadge.tsx` | 狀態標籤 |
| RefundModal | `src/components/admin/orders/RefundModal.tsx` | 退款處理彈窗 |
| OrderFilters | `src/components/admin/orders/OrderFilters.tsx` | 篩選控制列 |
| OrderNotes | `src/components/admin/orders/OrderNotes.tsx` | 內部備註時間軸 |

### 5.5 API 端點

```
GET    /api/admin/orders              -- 訂單列表（含篩選/分頁）
GET    /api/admin/orders/:id          -- 訂單詳情
PATCH  /api/admin/orders/:id/status   -- 更新付款狀態
POST   /api/admin/orders/:id/refund   -- 建立退款
PATCH  /api/admin/orders/:id/notes    -- 新增備註
GET    /api/admin/orders/export       -- CSV 匯出
```

---

## 六、模組二：商品上架 (`/admin/products`)

### 6.1 功能清單

| 功能 | 子功能 | 優先級 |
|------|--------|--------|
| **實體商品管理** | | |
| 商品列表 | 搜尋、篩選（上架/下架/草稿） | P0 |
| 新增/編輯商品 | 名稱、Slogan、價格、多幣種、描述、規格 | P0 |
| 圖片管理 | 多張上傳、排序、主圖設定 | P0 |
| 變體管理 | 顏色、尺寸、套件選項 | P1 |
| 商品規格 | 動態 key-value 規格列表 | P0 |
| **工作坊管理** | | |
| 講師管理 | 講師資料庫：姓名、頭像、簡介 | P1 |
| 時程設定 | 日期、地點、持續時間、報名截止日 | P0 |
| 政策管理 | 上課須知、退費政策（富文本） | P0 |
| **樂器課程管理** | | |
| 套票管理 | 課堂數、贈送堂數、有效期、價格 | P0 |
| 成班設定 | 拇指琴等需成班課程的最低人數設定 | P1 |
| FAQ 管理 | 各樂器的常見問題管理 | P2 |

### 6.2 資料模型

```prisma
enum ProductStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
}

model Product {
    id               String           @id @default(cuid())
    slug             String           @unique
    name             String
    slogan           String?
    shortDescription String?
    description      String           @db.Text
    price            Int
    currency         String           @default("USD")
    status           ProductStatus    @default(DRAFT)
    images           ProductImage[]
    variants         ProductVariant[]
    specs            ProductSpec[]
    orderItems       OrderItem[]
    inventory        ProductInventory?
    createdAt        DateTime         @default(now())
    updatedAt        DateTime         @updatedAt
}

model ProductImage {
    id        String  @id @default(cuid())
    productId String
    product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
    url       String
    alt       String?
    sortOrder Int     @default(0)
    isPrimary Boolean @default(false)
}

model ProductVariant {
    id        String  @id @default(cuid())
    productId String
    product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
    type      String  // "color", "kit"
    value     String  // "Green", "Valcro"
    priceAdj  Int     @default(0)
}

model ProductSpec {
    id        String  @id @default(cuid())
    productId String
    product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
    label     String
    value     String
    sortOrder Int     @default(0)
}

model Instructor {
    id        String   @id @default(cuid())
    name      String
    bio       String?  @db.Text
    avatar    String?
    createdAt DateTime @default(now())
}

model MusicInstrument {
    id                   String       @id @default(cuid())
    contentId            String?      @unique
    name                 String
    nameEn               String       @unique
    coverImage           String
    description          String       @db.Text
    containsEquipment    Boolean      @default(false)
    equipmentDescription String?
    rentalAvailable      Boolean      @default(false)
    rentalOffsetAllowed  Boolean      @default(false)
    levels               MusicLevel[]
    faqs                 MusicFAQ[]
    createdAt            DateTime     @default(now())
    updatedAt            DateTime     @updatedAt
}

model MusicLevel {
    id           String          @id @default(cuid())
    instrumentId String
    instrument   MusicInstrument @relation(fields: [instrumentId], references: [id], onDelete: Cascade)
    name         String
    sortOrder    Int             @default(0)
    packages     MusicPackage[]
}

model MusicPackage {
    id                     String        @id @default(cuid())
    levelId                String
    level                  MusicLevel    @relation(fields: [levelId], references: [id], onDelete: Cascade)
    name                   String
    lessonCount            Int
    bonusLessons           Int           @default(0)
    validDuration          Int           // 月數
    firstClassDate         DateTime?
    registrationStartDates DateTime[]
    formationRequired      Boolean       @default(false)
    formationDecisionDays  Int           @default(0)
    refundPolicy           String        @db.Text
    price                  Int
    status                 PublishStatus @default(DRAFT)
    includedEquipment      String[]
    highlights             String[]
    createdAt              DateTime      @default(now())
    updatedAt              DateTime      @updatedAt
}

model MusicFAQ {
    id           String          @id @default(cuid())
    instrumentId String
    instrument   MusicInstrument @relation(fields: [instrumentId], references: [id], onDelete: Cascade)
    question     String
    answer       String          @db.Text
    sortOrder    Int             @default(0)
}

model MonthlyAnnouncement {
    id            String   @id @default(cuid())
    month         String   @unique  // "2026-03"
    instrumentIds String[]
    schedule      Json     // ScheduleItem[]
    announcements String[]
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
}
```

### 6.3 頁面設計

**商品列表頁** (`/admin/products/page.tsx`):
```
┌──────────────────────────────────────────────────────┐
│ 商品上架管理                           [+ 新增商品]    │
├──────────┬───────────────────────────────────────────┤
│ 商品類型  │ 搜尋: [🔍                    ]            │
│          │                                           │
│ 🛍️ 實體商品│ 名稱       │ 價格   │ 狀態  │ 庫存│ 操作  │
│ 🎪 工作坊 │ Pebble 5  │ $129  │ ✅上架 │  15 │ ✏️🗑  │
│ 🎵 樂器課 │ JO-ONE    │ $119  │ 📝草稿 │   8 │ ✏️🗑  │
│          │ JO-COOL   │ $59   │ ✅上架 │  22 │ ✏️🗑  │
│ 狀態篩選  │ Slip-Clip │ $9    │ ✅上架 │  50 │ ✏️🗑  │
│ ● 全部   │                                          │
│ ● 上架中  │                                          │
│ ● 草稿   │                                          │
│ ● 已下架  │                                          │
└──────────┴───────────────────────────────────────────┘
```

**商品編輯頁** (`/admin/products/[id]/page.tsx`):
```
┌──────────────────────────────────────────────────────┐
│ ← 返回列表   編輯: Tributary Pebble 5   [儲存] [預覽] │
├──────────────────────────────────────────────────────┤
│ Tab: [基本資訊] [圖片管理] [變體/規格] [庫存設定]       │
├──────────────────────────────────────────────────────┤
│ 商品名稱: [Tributary Pebble 5          ]              │
│ Slogan:  [Small board, ready for...]                │
│ 價格:    [129] 幣種: [USD ▼]                          │
│ 狀態:    [Published ▼]                               │
│ 簡短描述: [Incredible Size. Incredible Tone...]       │
│ 詳細描述: [TipTap Rich Text Editor]                   │
└──────────────────────────────────────────────────────┘
```

### 6.4 UI 組件

| 組件 | 路徑 | 說明 |
|------|------|------|
| ProductTable | `src/components/admin/products/ProductTable.tsx` | 三類型切換列表 |
| ProductForm | `src/components/admin/products/ProductForm.tsx` | 商品表單 |
| ImageGalleryManager | `src/components/admin/products/ImageGalleryManager.tsx` | 多圖上傳/排序 |
| VariantManager | `src/components/admin/products/VariantManager.tsx` | 變體增刪 |
| SpecEditor | `src/components/admin/products/SpecEditor.tsx` | 規格 key-value |
| WorkshopEditor | `src/components/admin/products/WorkshopEditor.tsx` | 工作坊專用欄位 |
| MusicPackageEditor | `src/components/admin/products/MusicPackageEditor.tsx` | 套票編輯器 |

### 6.5 API 端點

```
// 實體商品
GET    /api/admin/products                    -- 商品列表
POST   /api/admin/products                    -- 新增商品
GET    /api/admin/products/:id                -- 商品詳情
PUT    /api/admin/products/:id                -- 更新商品
DELETE /api/admin/products/:id                -- 刪除商品
POST   /api/admin/products/:id/images         -- 上傳圖片
PATCH  /api/admin/products/:id/images/order   -- 圖片排序

// 講師
GET    /api/admin/instructors                 -- 講師列表
POST   /api/admin/instructors                 -- 新增講師

// 樂器課程
GET    /api/admin/music/instruments           -- 樂器列表
POST   /api/admin/music/instruments           -- 新增樂器
PUT    /api/admin/music/instruments/:id       -- 更新樂器
POST   /api/admin/music/packages              -- 新增套票
PUT    /api/admin/music/packages/:id          -- 更新套票

// 公告
GET    /api/admin/announcements               -- 公告列表
POST   /api/admin/announcements               -- 新增公告
PUT    /api/admin/announcements/:id           -- 更新公告
```

---

## 七、模組三：庫存管理 (`/admin/inventory`)

### 7.1 功能清單

| 功能 | 子功能 | 優先級 |
|------|--------|--------|
| **實體商品庫存** | | |
| 庫存總覽 | 所有商品的當前庫存數量 | P0 |
| 庫存調整 | 手動增減（入庫、出庫、盤點修正） | P0 |
| 庫存紀錄 | 調整歷史（誰、何時、調整多少） | P1 |
| 低庫存警示 | 設定門檻，低於門檻顯示警示 | P1 |
| **工作坊名額** | | |
| 名額總覽 | 各工作坊總名額/剩餘名額/報名率 | P0 |
| 名額調整 | 手動增減名額 | P0 |
| **樂器課程名額** | | |
| 成班狀態 | 需成班課程的報名人數 vs 最低人數 | P1 |

### 7.2 資料模型

```prisma
model ProductInventory {
    id           String            @id @default(cuid())
    productId    String            @unique
    product      Product           @relation(fields: [productId], references: [id], onDelete: Cascade)
    currentStock Int               @default(0)
    lowThreshold Int               @default(5)
    adjustments  StockAdjustment[]
    updatedAt    DateTime          @updatedAt
}

enum AdjustmentType {
    INBOUND       // 入庫
    OUTBOUND      // 出庫（訂單扣減）
    CORRECTION    // 盤點修正
    RETURN        // 退貨回庫
}

model StockAdjustment {
    id          String           @id @default(cuid())
    inventoryId String
    inventory   ProductInventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
    type        AdjustmentType
    quantity    Int              // 正數=增加, 負數=減少
    reason      String?
    adjustedBy  String?
    createdAt   DateTime         @default(now())
}
```

### 7.3 頁面設計

```
┌──────────────────────────────────────────────────────┐
│ 庫存管理                                              │
├──────────────────────────────────────────────────────┤
│ ⚠️ 低庫存警示                                         │
│ [JO-COOL: 剩 3 件] [Slip-Clip: 剩 2 套]              │
├──────────────────────────────────────────────────────┤
│ 實體商品庫存                                          │
│ 商品名稱    │ 現有庫存 │ 門檻 │ 狀態   │ 操作          │
│ Pebble 5   │   15    │  5  │ ✅正常  │ [調整] [紀錄] │
│ Slip-Clip  │    2    │  5  │ ⚠️低量  │ [調整] [紀錄] │
│ JO-ONE     │    8    │  5  │ ✅正常  │ [調整] [紀錄] │
│ JO-COOL    │    3    │  5  │ ⚠️低量  │ [調整] [紀錄] │
├──────────────────────────────────────────────────────┤
│ 工作坊名額                                            │
│ 活動名稱        │ 總名額 │ 剩餘 │ 報名率 │ 操作        │
│ 拉丁音樂節      │  25   │  12  │  52%  │ [調整]      │
│ 電子音樂製作入門 │  20   │   8  │  60%  │ [調整]      │
│ 歌曲創作工作坊   │  18   │  15  │  17%  │ [調整]      │
├──────────────────────────────────────────────────────┤
│ 樂器課程名額（需成班）                                  │
│ 課程              │ 已報名 │ 最低人數 │ 成班狀態      │
│ 拇指琴製作工坊     │   2   │    4    │ 🔴未達標     │
│ 拇指琴演奏入門     │   5   │    4    │ 🟢已達標     │
└──────────────────────────────────────────────────────┘
```

### 7.4 庫存自動扣減邏輯

訂單狀態更新為 `COMPLETED` 時，自動建立 `OUTBOUND` 調整。退款時建立 `RETURN` 調整。邏輯在 `OrderService` 中統一處理。

### 7.5 UI 組件

| 組件 | 路徑 | 說明 |
|------|------|------|
| InventoryOverview | `src/components/admin/inventory/InventoryOverview.tsx` | 主容器 |
| StockTable | `src/components/admin/inventory/StockTable.tsx` | 商品庫存表格 |
| StockAdjustModal | `src/components/admin/inventory/StockAdjustModal.tsx` | 庫存調整彈窗 |
| StockHistoryDrawer | `src/components/admin/inventory/StockHistoryDrawer.tsx` | 調整歷史側滑面板 |
| CapacityTable | `src/components/admin/inventory/CapacityTable.tsx` | 工作坊名額 |
| LowStockAlert | `src/components/admin/inventory/LowStockAlert.tsx` | 低庫存警示 |

### 7.6 API 端點

```
GET    /api/admin/inventory                      -- 庫存總覽
PATCH  /api/admin/inventory/:productId           -- 調整庫存
GET    /api/admin/inventory/:productId/history   -- 調整歷史
GET    /api/admin/inventory/alerts               -- 低庫存警示
PATCH  /api/admin/workshops/:id/capacity         -- 調整工作坊名額
```

---

## 八、模組四：內容管理增強

### 8.1 功能清單

| 功能 | 子功能 | 優先級 |
|------|--------|--------|
| **既有增強** | | |
| 內容預覽 | admin 內嵌入前台頁面預覽 | P1 |
| 批次操作 | 勾選多筆一次發佈/下架/刪除 | P2 |
| 版本歷史 | 保存最近 5 次編輯記錄 | P2 |
| **月份公告** | | |
| 公告管理 | 建立/編輯月份公告 | P0 |
| 課表編輯 | 日曆視圖設定每月課程時間表 | P1 |
| 公告預覽 | 預覽在前台的呈現效果 | P1 |
| **橫幅管理** | | |
| Banner 管理 | 首頁輪播 banner 圖片/文字/連結 | P2 |
| Banner 排序 | 拖拉排序 | P2 |

### 8.2 資料模型

```prisma
model Banner {
    id        String   @id @default(cuid())
    title     String?
    subtitle  String?
    imageUrl  String
    linkUrl   String?
    sortOrder Int      @default(0)
    isActive  Boolean  @default(true)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model ContentRevision {
    id        String   @id @default(cuid())
    contentId String
    data      Json     // content snapshot
    editedBy  String?
    createdAt DateTime @default(now())
}
```

### 8.3 公告管理頁面設計

```
┌──────────────────────────────────────────────────────┐
│ 月份公告管理                      [+ 新增月份公告]     │
├──────────────────────────────────────────────────────┤
│ 月份: [2026-03 ▼]                                    │
├──────────────────────────────────────────────────────┤
│ 課程時間表（日曆視圖）                                 │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐         │
│ │ 日  │ 一  │ 二  │ 三  │ 四  │ 五  │ 六  │          │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤         │
│ │     │     │     │     │     │     │  8  │          │
│ │     │     │     │     │     │     │ 吉他 │          │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤         │
│ │  9  │ 10  │     │ 12  │     │     │ 15  │          │
│ │吉他進│爵士鼓│     │烏克  │     │     │吉他  │          │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘         │
├──────────────────────────────────────────────────────┤
│ 公告事項:                                             │
│ 1. [三月份新開班：吉他初學、爵士鼓、烏克麗麗  ] [刪除]   │
│ 2. [拇指琴製作工坊開放報名（需滿 4 人開班）    ] [刪除]   │
│ 3. [清明連假（4/4-4/5）暫停上課              ] [刪除]   │
│ [+ 新增公告項目]                                      │
├──────────────────────────────────────────────────────┤
│ [儲存]  [預覽]                                        │
└──────────────────────────────────────────────────────┘
```

---

## 九、模組五：數據洞察 (`/admin/insights`)

### 9.1 功能清單

| 功能 | 子功能 | 優先級 |
|------|--------|--------|
| 營收總覽 | 本月/本季/本年營收，同期比較 | P0 |
| 營收趨勢 | 每日/每週/每月營收折線圖 | P1 |
| 收入分布 | 按類型的營收佔比圓餅圖 | P1 |
| 訂單統計 | 訂單數量趨勢、平均客單價 | P1 |
| 報名趨勢 | 各工作坊/課程的報名人數趨勢 | P1 |
| 商品表現 | 銷量排名、營收貢獻 | P2 |
| 報表匯出 | 月報/季報 CSV 匯出 | P2 |

### 9.2 頁面設計

```
┌──────────────────────────────────────────────────────┐
│ 數據洞察                  時間範圍: [本月 ▼] [自訂 📅] │
├──────────────────────────────────────────────────────┤
│ [總營收 NT$158,200] [訂單數 47筆] [客單價 NT$3,366]   │
│ [報名率 68%]                                         │
├───────────────────────┬──────────────────────────────┤
│ 營收趨勢 (折線圖)      │ 收入分布 (圓餅圖)             │
│                       │                              │
│     ╱\     ╱\        │  ┌──┐                         │
│   ╱    \ ╱    \      │  ├─┤商品├── 35%               │
│ ╱        ╳      \    │  ├─┤工作坊├─ 25%              │
│                       │  └─┤樂器課├─ 40%              │
│ 4/1  4/7  4/14  4/21 │                              │
├───────────────────────┴──────────────────────────────┤
│ 熱門商品/課程排名                                      │
│ 排名 │ 名稱          │ 銷量/報名 │ 營收       │ 趨勢  │
│  1  │ 吉他基礎套票    │  12 人   │ NT$72,000 │  ↑   │
│  2  │ Pebble 5      │   8 件   │ $1,032    │  ↑   │
│  3  │ 拉丁音樂節     │  13 人   │ NT$23,400 │  →   │
└──────────────────────────────────────────────────────┘
```

### 9.3 UI 組件

| 組件 | 路徑 | 說明 |
|------|------|------|
| InsightsDashboard | `src/components/admin/insights/InsightsDashboard.tsx` | 主容器 |
| KPICard | `src/components/admin/insights/KPICard.tsx` | 統計指標卡片 |
| RevenueChart | `src/components/admin/insights/RevenueChart.tsx` | 折線圖 |
| DistributionChart | `src/components/admin/insights/DistributionChart.tsx` | 圓餅圖 |
| RankingTable | `src/components/admin/insights/RankingTable.tsx` | 排名表格 |
| DateRangePicker | `src/components/admin/insights/DateRangePicker.tsx` | 日期範圍選擇器 |

### 9.4 API 端點

```
GET /api/admin/insights/revenue      -- 營收數據
GET /api/admin/insights/orders       -- 訂單統計
GET /api/admin/insights/products     -- 商品表現排名
GET /api/admin/insights/enrollment   -- 報名趨勢
GET /api/admin/insights/summary      -- Dashboard KPI 摘要
```

### 9.5 圖表技術

建議使用 `recharts`（React 生態、響應式、支持折線/柱狀/圓餅圖）。替代方案：純 SVG 手繪簡易圖表。

---

## 十、新增檔案清單

### 10.1 Domain 層

```
src/domain/models/
├── Content.ts          -- (既有)
├── Order.ts            -- OrderEntity, OrderType, PaymentStatus enums
├── Product.ts          -- ProductEntity, ProductStatus enum
├── Inventory.ts        -- InventoryEntity, AdjustmentType enum
├── Customer.ts         -- CustomerEntity
└── Announcement.ts     -- AnnouncementEntity
```

### 10.2 Application 層

```
src/application/
├── use-cases/
│   ├── ContentUseCases.ts     -- (既有)
│   ├── OrderUseCases.ts       -- OrderService
│   ├── ProductUseCases.ts     -- ProductService
│   ├── InventoryUseCases.ts   -- InventoryService
│   └── InsightsUseCases.ts    -- InsightsService
├── dto/
│   ├── ContentDTO.ts          -- (既有)
│   ├── OrderDTO.ts
│   ├── ProductDTO.ts
│   └── InsightsDTO.ts
└── mappers/
    ├── ContentMapper.ts       -- (既有)
    ├── OrderMapper.ts
    └── ProductMapper.ts
```

### 10.3 Infrastructure 層

```
src/infrastructure/
├── RepositoryFactory.ts              -- (擴展)
└── repositories/
    ├── IContentRepository.ts         -- (既有)
    ├── IOrderRepository.ts
    ├── IProductRepository.ts
    ├── IInventoryRepository.ts
    ├── IAnnouncementRepository.ts
    ├── PrismaContentRepository.ts    -- (既有)
    ├── PrismaOrderRepository.ts
    ├── PrismaProductRepository.ts
    ├── PrismaInventoryRepository.ts
    └── PrismaAnnouncementRepository.ts
```

---

## 十一、實作分期

### Phase A: 基礎建設

| 步驟 | 工作項目 |
|------|----------|
| A-1 | 建立 Admin Layout (`layout.tsx` + `AdminSidebar.tsx`) |
| A-2 | 改寫既有 `/admin` 和 `/admin/content` 使用共用 layout |
| A-3 | Prisma schema 擴展（全部新 model） |
| A-4 | 執行 `prisma migrate dev`，建立 seed 腳本遷移靜態資料 |
| A-5 | 擴展 `RepositoryFactory`，建立 Repository 介面 |
| A-6 | 建立各 Domain model + Service |

### Phase B: 商品上架

| 步驟 | 工作項目 |
|------|----------|
| B-1 | 實體商品 CRUD (ProductService + PrismaProductRepository) |
| B-2 | 商品管理頁面 UI (ProductTable + ProductForm) |
| B-3 | 圖片管理 (ImageGalleryManager) |
| B-4 | 變體與規格編輯器 |
| B-5 | 工作坊擴展（講師、完整時程） |
| B-6 | 樂器課擴展（級別、套票 CRUD） |
| B-7 | 月份公告管理 |

### Phase C: 訂單管理

| 步驟 | 工作項目 |
|------|----------|
| C-1 | OrderService + PrismaOrderRepository |
| C-2 | 訂單列表頁 UI + 篩選/搜尋 |
| C-3 | 訂單詳情頁 UI |
| C-4 | 退款處理流程 |
| C-5 | 訂單備註功能 |
| C-6 | CSV 匯出 |
| C-7 | Email 通知整合 |

### Phase D: 庫存管理

| 步驟 | 工作項目 |
|------|----------|
| D-1 | InventoryService + PrismaInventoryRepository |
| D-2 | 庫存管理頁面 UI |
| D-3 | 庫存調整 modal + 歷史紀錄 |
| D-4 | 訂單完成時自動扣減庫存邏輯 |

### Phase E: 數據洞察

| 步驟 | 工作項目 |
|------|----------|
| E-1 | InsightsService（聚合查詢） |
| E-2 | Dashboard KPI 改寫（接真實數據） |
| E-3 | 營收趨勢圖 + 收入分布圖 |
| E-4 | 排名表 + 日期範圍篩選器 |
| E-5 | 報表匯出 |

---

## 十二、技術注意事項

### 12.1 API 路由組織

所有 admin API 統一放在 `/api/admin/` 下:

```
src/app/api/admin/
├── orders/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── status/route.ts
│       ├── refund/route.ts
│       └── notes/route.ts
├── products/
│   ├── route.ts
│   └── [id]/route.ts
├── inventory/
│   ├── route.ts
│   └── [productId]/
│       ├── route.ts
│       └── history/route.ts
├── music/
│   ├── instruments/route.ts
│   └── packages/route.ts
├── announcements/route.ts
├── instructors/route.ts
└── insights/
    ├── revenue/route.ts
    ├── orders/route.ts
    ├── products/route.ts
    ├── enrollment/route.ts
    └── summary/route.ts
```

### 12.2 Middleware 擴展

擴展 `src/middleware.ts` 的 matcher 加入 admin API 認證:

```typescript
export const config = {
    matcher: ["/contact", "/api/admin/:path*"],
};
```

### 12.3 UI 設計語言（沿用現有）

| 設計元素 | 值 |
|----------|-----|
| 背景色 | `bg-black`（主體）、`bg-zinc-900/40`（卡片） |
| 邊框 | `border-white/5`、`border-white/10` |
| 強調色 | `text-gold`、`bg-gold`（#D4AF37） |
| 狀態色 | `emerald-400`（成功）、`orange-400`（警示）、`red-400`（錯誤） |
| 動畫 | Framer Motion `whileHover`、`whileTap` |
| 圓角 | `rounded-2xl`（卡片）、`rounded-xl`（按鈕） |

### 12.4 建議新增套件

| 套件 | 用途 | 必要性 |
|------|------|--------|
| `recharts` | 數據洞察圖表 | 建議（Phase E） |
| `date-fns` | 日期格式化/計算 | 建議 |
| `papaparse` | CSV 匯出 | 可選（Phase C） |

### 12.5 安全性

- 所有 `/api/admin/*` 端點通過 `checkInternalAccess()` 驗證
- 密碼從硬編碼改為 `process.env.ADMIN_PASSWORD`
- Prisma parameterized queries（預設安全）
- 考慮 admin API 的 rate limiting

### 12.6 效能

- 列表頁面實作 server-side pagination
- 數據洞察聚合查詢考慮 Prisma raw SQL
- Dashboard KPI 可用 Upstash Redis 快取（5 分鐘 TTL）
