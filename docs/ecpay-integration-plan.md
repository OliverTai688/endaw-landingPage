# 綠界金流（ECPay）串接計劃

> 建立日期：2026-04-30  
> 目標：將 ECPay AIO 全方位金流整合進現有 ENDAW 商城（音樂工作坊、音樂課程、實體商品）

---

## 一、背景與現況

### 現有商城架構
- **訂單模型**：`Order` 資料表已具備 `paymentStatus`、`transactionId`、`paidAt` 欄位，直接支援串接
- **訂單狀態機**：`PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED`
- **付款流程（現況）**：手動 — 管理員在後台手動更新付款狀態
- **訂單類型**：`WORKSHOP`（工作坊）、`MUSIC`（音樂課程）、`PRODUCT`（實體商品）

### 串接目標
用 ECPay AIO（All-In-One）取代手動付款確認，實現：
1. 前台結帳 → 導轉至 ECPay 付款頁
2. ECPay Webhook 自動更新訂單狀態
3. 管理後台可查看交易明細及手動退款

---

## 二、技術選型

| 項目 | 選擇 | 理由 |
|------|------|------|
| ECPay SDK | `node-ecpay-aio` (v0.2.3) | TypeScript 支援、自動產生 CheckMacValue、符合 ECPay 規格 V5.4.1 |
| 付款方式 | 信用卡（主要）+ 超商代碼（選配） | 工作坊/課程以信用卡為主，實體商品可加開超商 |
| 付款流程 | AIO 導轉式（Redirect） | 不需申請特殊帳戶，上線門檻最低 |
| 環境變數 | 新增 4 個 ECPay 相關變數 | 見下方「環境變數」章節 |

### 新增環境變數
```env
ECPAY_MERCHANT_ID=         # 綠界特店編號
ECPAY_HASH_KEY=            # 金鑰 HashKey
ECPAY_HASH_IV=             # 金鑰 HashIV
ECPAY_IS_SANDBOX=true      # true=測試環境, false=正式環境

# 測試用參數 (綠界官方提供)
# ECPAY_MERCHANT_ID=2000132
# ECPAY_HASH_KEY=pwFHCqoQZGmoCMRZhAeh9w
# ECPAY_HASH_IV=EkRm7iFT261dpevs
```

---

## 三、付款流程設計

```
[前台結帳頁]
    │
    ▼
POST /api/payments/ecpay/create
    │  建立訂單（DB）
    │  產生 MerchantTradeNo（唯一）
    │  計算 CheckMacValue
    │  回傳 HTML Form
    │
    ▼
[前端自動 Submit Form] ──────────► [ECPay 付款頁面]
                                          │
                    ┌─────────────────────┤
                    │ 付款成功/失敗        │
                    ▼                     ▼
        POST /api/payments/ecpay/callback  [OrderResultURL 導回前台]
            │  驗證 CheckMacValue          /payment/result?...
            │  更新 Order.paymentStatus
            │  RtnCode=1 → COMPLETED
            │  其他     → FAILED
            │  回傳 "1|OK"
            ▼
        [寄送確認 Email]（使用現有 Nodemailer）
```

---

## 四、分階段開發計劃

### Phase 0 — 準備工作（½ 天）

**目標**：申請測試帳號、確認環境

| 任務 | 說明 |
|------|------|
| 申請 ECPay 特店帳號 | 前往 [ECPay 開發者後台](https://developer.ecpay.com.tw/) 申請測試特店帳號 |
| 取得測試憑證 | 取得測試用 MerchantID / HashKey / HashIV |
| 安裝 SDK | `pnpm add node-ecpay-aio` |
| 設定環境變數 | 在 `.env.local` 新增 ECPAY_* 變數 |
| 確認 Callback URL | 本地測試用 ngrok 建立公開 URL；正式環境為 `https://endaw.co/api/payments/ecpay/callback` |

---

### Phase 1 — 核心付款流程（2-3 天）

**目標**：完整的「下單 → 付款 → 狀態更新」流程

#### 1.1 資料庫 Schema 更新

**檔案**：`prisma/schema.prisma`

新增 `Payment` 資料表儲存完整交易紀錄：

```prisma
model Payment {
  id                String        @id @default(cuid())
  orderId           String
  order             Order         @relation(fields: [orderId], references: [id])
  merchantTradeNo   String        @unique  // ECPay 用的交易編號
  ecpayTradeNo      String?                // ECPay 回傳的交易編號
  paymentMethod     String?                // Credit, CVS, ATM...
  paymentStatus     PaymentStatus @default(PENDING)
  totalAmount       Int
  checkMacValue     String?                // 保存用於 audit
  rtnCode           String?                // ECPay 回傳碼
  rtnMsg            String?
  rawCallback       Json?                  // 完整 callback 原始資料
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

`Order` model 加上 relation：
```prisma
model Order {
  // ... 現有欄位 ...
  payments  Payment[]
}
```

#### 1.2 建立付款 API

**新增檔案結構**：
```
src/app/api/payments/
├── ecpay/
│   ├── create/route.ts        # POST - 建立付款請求，回傳 HTML Form
│   ├── callback/route.ts      # POST - ECPay Server Callback（更新 DB）
│   └── query/route.ts         # POST - 查詢交易狀態
└── result/route.ts            # GET  - 付款結果頁導向（可選）
```

**`create/route.ts` 核心邏輯**：
```typescript
// 1. 驗證 orderId，確認訂單為 PENDING_PAYMENT
// 2. 產生 MerchantTradeNo（格式：ENDAW + timestamp，最多20字）
// 3. 呼叫 node-ecpay-aio 產生付款參數 + CheckMacValue
// 4. 回傳 HTML form 字串供前端自動提交
// 5. 同時在 Payment 資料表建立 PENDING 紀錄
```

**`callback/route.ts` 核心邏輯**：
```typescript
// 1. 解析 POST body（x-www-form-urlencoded）
// 2. 使用 node-ecpay-aio 驗證 CheckMacValue
// 3. 驗證失敗 → 記錄警告，回傳 "0|Error"
// 4. RtnCode === "1" → 更新 Payment + Order status
//    - Payment: COMPLETED, 記錄 ecpayTradeNo、rawCallback
//    - Order: paymentStatus=COMPLETED, paidAt=now()
//    - Order status: PENDING_PAYMENT → PAID
// 5. 使用 Prisma Transaction 確保原子性
// 6. 回傳 "1|OK"（ECPay 要求的格式）
```

#### 1.3 領域層擴充

**更新**：`src/application/use-cases/OrderUseCases.ts`
- 新增 `initiatePayment(orderId, orderType)` — 組裝 ECPay 參數
- 新增 `handlePaymentCallback(callbackData)` — 驗證並更新狀態
- 新增 `queryPaymentStatus(merchantTradeNo)` — 查詢交易狀態

**新增**：`src/infrastructure/repositories/IPaymentRepository.ts`  
**新增**：`src/infrastructure/repositories/PrismaPaymentRepository.ts`

#### 1.4 前台結帳頁（基本版）

**新增**：`src/app/checkout/page.tsx`
- 顯示訂單摘要（品項、金額）
- 「前往付款」按鈕 → 呼叫 `/api/payments/ecpay/create`
- 接收 HTML form → 插入 DOM → 自動 submit

**新增**：`src/app/payment/result/page.tsx`
- 顯示付款結果（成功 / 失敗）
- 從 query params 解析 ECPay 回傳參數（注意：結果頁僅供顯示，狀態以 callback 為準）

**測試項目**：
- [ ] 測試信用卡下單 → 付款成功流程
- [ ] 測試付款失敗/取消流程
- [ ] 確認 Callback 正確更新 DB
- [ ] 確認 Prisma Transaction rollback 機制

---

### Phase 2 — 管理後台整合（1-2 天）

**目標**：後台可查看交易明細、手動補單

#### 2.1 訂單詳情頁加入付款資訊

**更新**：`src/app/admin/orders/[id]/page.tsx`

新增付款資訊區塊：
```
交易紀錄
├── MerchantTradeNo：ENDAW20260430001
├── ECPay TradeNo：2026043012345678
├── 付款方式：信用卡
├── 付款時間：2026-04-30 14:32:01
└── ECPay 回傳碼：1 (付款成功)
```

#### 2.2 手動重新觸發付款連結

**更新**：`src/components/admin/OrderManager.tsx`

針對 `PENDING_PAYMENT` 訂單新增：
- 「複製付款連結」按鈕 → 產生可寄給客戶的付款 URL
- 「查詢付款狀態」按鈕 → 呼叫 `/api/payments/ecpay/query` 同步最新狀態

#### 2.3 新增後台付款狀態篩選

在 OrderManager 篩選器新增 `paymentStatus` 維度，方便快速找到待付款或付款失敗的訂單。

---

### Phase 3 — Email 通知（½ 天）

**目標**：付款成功後自動寄送確認信

**利用現有 Nodemailer / Gmail SMTP**

觸發點：`callback/route.ts` 確認 `RtnCode === "1"` 且 DB 更新成功後

**客戶確認信內容**：
- 訂單編號
- 付款金額
- 品項清單（工作坊/課程名稱 或 商品名稱）
- 工作坊：附上日期、地點、注意事項
- 課程：附上課程連結或後續聯繫方式

**更新**：`src/app/contact/action.ts` 或獨立建立 `src/lib/email.ts`，抽出共用寄信函式。

---

### Phase 4 — 退款流程（1 天）

**目標**：管理後台可操作 ECPay 退款 API

#### 4.1 退款 API

**新增**：`src/app/api/payments/ecpay/refund/route.ts`
- 呼叫 ECPay `DoAction` API（信用卡退款：`R`；放棄：`E`）
- 更新 `Refund` 資料表（現有 schema 已包含）
- 更新 `Order.paymentStatus` → `REFUNDED` / `PARTIALLY_REFUNDED`

#### 4.2 後台退款 UI

**更新**：`src/app/admin/orders/[id]/page.tsx`
- 新增「申請退款」按鈕（僅 PAID/DELIVERED 狀態）
- 退款金額輸入（全額或部分）
- 退款原因輸入
- 確認對話框（二次確認）

---

### Phase 5 — 上線準備（½ 天）

**目標**：切換正式環境

| 項目 | 內容 |
|------|------|
| 申請正式特店帳號 | 準備公司/個人資料，向 ECPay 申請正式帳號 |
| 切換環境變數 | `ECPAY_IS_SANDBOX=false`，更新 MerchantID/HashKey/HashIV |
| Callback URL 白名單 | 確認正式域名已在 ECPay 後台設定 |
| CSRF 保護 | Callback endpoint 需豁免 CSRF（因 ECPay Server POST），確認 `src/middleware.ts` 設定 |
| Rate Limiting | Callback endpoint 加上 IP 白名單（ECPay IP 範圍）或豁免限制 |
| 壓力測試 | 使用 ECPay 測試工具模擬多筆交易 |
| 監控告警 | 記錄 callback 失敗到 console.error，考慮接 Sentry 或 upstash logging |

---

## 五、檔案異動清單

### 新增
```
src/app/
├── api/payments/ecpay/
│   ├── create/route.ts
│   ├── callback/route.ts
│   ├── query/route.ts
│   └── refund/route.ts
├── checkout/page.tsx
└── payment/result/page.tsx

src/application/use-cases/
└── PaymentUseCases.ts

src/infrastructure/repositories/
├── IPaymentRepository.ts
└── PrismaPaymentRepository.ts

src/lib/
└── ecpay.ts              # ECPay 工具函式（初始化 SDK、組裝參數）
```

### 修改
```
prisma/schema.prisma      # 新增 Payment model
src/application/use-cases/OrderUseCases.ts   # 新增付款相關方法
src/app/admin/orders/[id]/page.tsx           # 付款資訊 + 退款 UI
src/components/admin/OrderManager.tsx        # 付款操作按鈕
src/lib/email.ts（或新增）                   # 抽出共用 email 函式
src/middleware.ts                            # Callback URL 豁免 CSRF
.env.local                                   # 新增 ECPAY_* 變數
```

---

## 六、重要技術注意事項

### CheckMacValue 計算
ECPay 使用 SHA256：
```
HashKey=xxx&{參數按字母排序}&HashIV=xxx
→ URLEncode → 轉小寫 → SHA256 → 轉大寫
```
使用 `node-ecpay-aio` 可自動處理，不需手動實作。

### MerchantTradeNo 規則
- 最多 **20 字元**
- 英數字，唯一，**不可重複使用**
- 建議格式：`ENDAWYYMMDDHHmmssXX`（17字 + 2位隨機）

### CSRF Middleware 豁免
`src/middleware.ts` 目前對 `/contact` 有 CSRF 保護。  
Callback endpoint `/api/payments/ecpay/callback` 是 ECPay Server 直接 POST，**必須豁免 CSRF**，但須用 CheckMacValue 驗證替代。

### 金額單位
系統目前金額以「分」（cents）儲存（整數），ECPay 使用「元」（整數 TWD）。  
需在 API 層做 `totalAmount / 100` 轉換（確認現有資料的儲存慣例）。

### Prisma Transaction
Callback 處理必須使用 `prisma.$transaction`，確保 Payment 紀錄和 Order 狀態同步更新，避免部分失敗。

---

## 七、開發時間估算

| Phase | 內容 | 預估時間 |
|-------|------|---------|
| Phase 0 | 準備、帳號申請、SDK 安裝 | 0.5 天 |
| Phase 1 | 核心付款流程 | 2-3 天 |
| Phase 2 | 管理後台整合 | 1-2 天 |
| Phase 3 | Email 通知 | 0.5 天 |
| Phase 4 | 退款流程 | 1 天 |
| Phase 5 | 上線準備 | 0.5 天 |
| **合計** | | **6-8 天** |

---

## 八、參考資源

- [ECPay 開發者文件](https://developers.ecpay.com.tw/)
- [node-ecpay-aio NPM](https://www.npmjs.com/package/node-ecpay-aio)
- [node-ecpay-aio GitHub](https://github.com/simenkid/node-ecpay-aio)
- [ECPay 官方 GitHub](https://github.com/ECPay)
- ECPay AIO 規格文件 V5.4.1（登入開發者後台後可下載）
