# 結帳流程設計方案

> 範圍：從使用者點擊「選擇方案」到 ECPay 付款完成、後台建立訂單。  
> 日期：2026-05-05

---

## 一、現況分析

### 已有（可複用）

| 元件 | 路徑 | 說明 |
|---|---|---|
| ECPay 整合 | `src/lib/ecpay.ts` | 產生付款表單、驗證 Callback |
| 付款 Callback | `POST /api/payments/ecpay/callback` | 原子更新 Payment + Order |
| 付款確認頁 | `/payment/checkout` | 顯示訂單摘要，觸發 ECPay 跳轉 |
| 付款結果頁 | `/payment/result` | 顯示 ECPay 回傳參數 |
| DB Schema | `prisma/schema.prisma` | Order / Customer / MusicEnrollment 已齊備 |

### 缺口（本計畫要補）

- 選方案 → 填資料 → 確認訂單 這段多步驟 Checkout UI 完全空白
- 沒有公開的「建立訂單」API（只有 admin 用的）
- `Order` 缺少訂購人（≠ 參加人時）欄位
- `MusicEnrollment` 缺少參加人補充資訊
- 台灣電子發票資訊未收集

---

## 二、完整流程總覽

```
課程/音樂課頁面
     ↓ 點擊「選擇方案」
┌─────────────────────────────────────┐
│  /checkout?packageId=xxx            │
│                                     │
│  Step 1 ── 確認課程規格              │
│  Step 2 ── 填寫報名資料              │
│  Step 3 ── 確認訂單                  │
│         ↓ 送出 → 建立訂單            │
└─────────────────────────────────────┘
     ↓ 取得 orderId
/payment/checkout?orderId=xxx  (現有頁面)
     ↓ 點擊「前往付款」
ECPay 信用卡頁面
     ↓ 付款完成（兩條路同時）
     ├─ 瀏覽器 → /payment/result   (顯示用)
     └─ Server Callback → /api/payments/ecpay/callback  (更新 DB，source of truth)
```

---

## 三、Step-by-step UI 規格

### Step 1：確認課程規格

**目的**：讓使用者在送出個資前再次確認購買的方案細節、確認開課條件。

**路由**：`/checkout?packageId={id}`（音樂課）或 `/checkout?workshopId={id}`（工作坊）

**顯示欄位**

```
┌─────────────────────────────────────────┐
│  Step 1 / 3   確認課程規格               │
├─────────────────────────────────────────┤
│  [課程名稱]  [樂器/類型 badge]           │
│                                         │
│  方案名稱      單堂體驗                  │
│  堂數          1 堂                      │
│  首堂時間      5月5日 週二               │
│  有效期限      1 個月                    │
│                                         │
│  ── 注意事項 ───────────────────────    │
│  ⚠  需成班：開課前 N 天確認成班         │
│     若未成班，全額退款                   │
│                                         │
│  ── 退款政策 ───────────────────────    │
│  [退款政策文字]                          │
│                                         │
│  小計                      NT$ 400      │
│                                         │
│            [下一步：填寫資料 →]          │
└─────────────────────────────────────────┘
```

**資料來源**：
- 音樂課：`GET /api/bff/v1/music/packages/{packageId}` → `MusicPackage` 資料
- 工作坊：`GET /api/bff/v1/workshops/{workshopId}` → `Content + Workshop` 資料

**邏輯**：
- 若 `MusicPackage.registrationStartDates` 有多個選項 → 加入日期選擇器（`<select>`）
- 若 `formationRequired = true` → 必顯示需成班警示框
- 確認按鈕不需要任何 API 呼叫，純 state 前進

---

### Step 2：填寫報名資料

**目的**：收集訂購人（付款者）、參加人（上課者）、發票資訊。

```
┌─────────────────────────────────────────┐
│  Step 2 / 3   填寫報名資料               │
├─────────────────────────────────────────┤
│  ── 訂購人資訊 ─────────────────────    │
│                                         │
│  姓名 *        [____________]           │
│  手機 *        [____________]           │
│  Email *       [____________]           │
│                                         │
│  ── 參加人資訊 ─────────────────────    │
│                                         │
│  ☐ 參加人與訂購人相同                   │
│                                         │
│  姓名 *        [____________]           │
│  手機 *        [____________]           │
│  年齡          [____________]  (音樂課)  │
│  程度說明      [初學/有基礎/進階]        │  (音樂課)
│  備註          [____________]           │
│                                         │
│  ── 電子發票 ───────────────────────    │
│                                         │
│  ○ 個人發票（手機條碼）                  │
│    條碼 [/XXXXXXX]                      │
│  ○ 公司發票（統一編號）                  │
│    公司名稱 [________] 統編 [________]  │
│  ○ 捐贈發票                             │
│    捐贈碼   [________]                  │
│                                         │
│   [← 上一步]          [下一步：確認 →]  │
└─────────────────────────────────────────┘
```

**驗證規則**：
- 姓名：必填，2–20 字
- 手機：必填，台灣格式 `09xxxxxxxx`
- Email：必填，合法格式
- 手機條碼：`/` 開頭，7 碼英數
- 統一編號：8 碼數字
- 捐贈碼：3–7 碼數字

**欄位細節說明**：

| 欄位 | 必填 | 僅音樂課 | 說明 |
|---|---|---|---|
| 訂購人姓名 | ✓ | - | 付款者，對應 Customer.name |
| 訂購人手機 | ✓ | - | 聯絡用 |
| 訂購人 Email | ✓ | - | 訂單通知、未來登入用 |
| 參加人姓名 | ✓ | - | 實際上課者 |
| 參加人手機 | ✓ | - | 緊急聯絡 |
| 年齡 | - | ✓ | 協助師資安排 |
| 程度說明 | - | ✓ | 初學/有基礎/進階（下拉） |
| 備註 | - | - | 自由填寫 |
| 發票類型 | ✓ | - | 個人/公司/捐贈 |

---

### Step 3：確認訂單

**目的**：最後一次 review 全部資訊後送出建立訂單。

```
┌─────────────────────────────────────────┐
│  Step 3 / 3   確認訂單                   │
├─────────────────────────────────────────┤
│  ── 課程方案 ───────────────────────    │
│  [課程名稱] — [方案名稱]                 │
│  首堂：5月5日 週二                       │
│                                         │
│  ── 訂購人 ─────────────────────────    │
│  王小明｜0912-345-678｜abc@email.com    │
│                                         │
│  ── 參加人 ─────────────────────────    │
│  王小明（同訂購人）                      │
│  程度：初學  備註：—                    │
│                                         │
│  ── 發票 ───────────────────────────    │
│  個人發票  /ABCD123                     │
│                                         │
│  ── 金額明細 ────────────────────────   │
│  課程費用                    NT$ 400    │
│  折扣                          -NT$ 0   │
│  ────────────────────────────────────  │
│  應付總額                    NT$ 400    │
│                                         │
│  ☐ 我已閱讀並同意退款政策與服務條款      │
│                                         │
│  [← 上一步]   [確認，前往付款 →]        │
└─────────────────────────────────────────┘
```

**送出動作**：
1. 呼叫 `POST /api/bff/v1/orders/checkout`
2. 取得 `orderId`
3. 跳轉至 `/payment/checkout?orderId={orderId}`（現有頁面接手 ECPay 流程）

---

## 四、步驟指示器（Progress Indicator）

所有三步共用頂部固定 UI：

```
確認規格  ──●──  填寫資料  ──●──  確認訂單
  ①              ②              ③
```

- 已完成步驟：金色實心圓 + 文字
- 當前步驟：白色實心圓 + 粗體
- 未到步驟：灰色空心圓

---

## 五、新增 API 規格

### `POST /api/bff/v1/orders/checkout`

**用途**：公開端點，從 Checkout 表單建立訂單。

**Request Body**：

```typescript
{
  // 課程識別（擇一）
  packageId?: string;      // MusicPackage.id
  workshopId?: string;     // Workshop（Content）.id
  selectedDate?: string;   // ISO date，多個開課日時使用

  // 訂購人
  purchaser: {
    name: string;
    phone: string;
    email: string;
  };

  // 參加人
  participant: {
    sameAsPurchaser: boolean;
    name?: string;          // sameAsPurchaser=false 時必填
    phone?: string;
    age?: number;           // 音樂課選填
    level?: 'beginner' | 'intermediate' | 'advanced';
    notes?: string;
  };

  // 電子發票
  invoice: {
    type: 'personal' | 'company' | 'donate';
    carrier?: string;       // 手機條碼 /XXXXXXX
    companyName?: string;
    taxId?: string;         // 統一編號
    donateCode?: string;
  };
}
```

**Response**：

```typescript
// 200 OK
{ orderId: string; orderNumber: string }

// 400
{ error: string }

// 409（方案額滿或不存在）
{ error: '此方案目前無法報名' }
```

**Server 邏輯**：

```
1. 驗證 packageId 或 workshopId 存在且為 PUBLISHED
2. upsert Customer（依 purchaser.email 找或建）
3. 若 participant.sameAsPurchaser = false，另建/找 participant Customer
4. 建立 Order（status: PENDING_PAYMENT）
   - orderType: MUSIC 或 WORKSHOP
   - customerId: participant customer id（課程的學生）
   - 若 purchaser ≠ participant → 記錄於 Order.metadata JSON
5. 若 MUSIC：建立 MusicEnrollment（status: PENDING）
6. 回傳 { orderId, orderNumber }
```

**注意**：
- 付款前不扣名額，名額在 callback 確認付款後由 admin 管理
- 此端點不需要 auth cookie（公開報名）

---

## 六、Schema 異動

### 6a. `Order` 新增欄位

```prisma
model Order {
  // ... 現有欄位

  // 新增：訂購人資訊（參加人 ≠ 訂購人時使用）
  purchaserName   String?
  purchaserPhone  String?
  purchaserEmail  String?

  // 新增：電子發票
  invoiceType     String?   // personal | company | donate
  invoiceCarrier  String?   // 手機條碼
  invoiceCompanyName String?
  invoiceTaxId    String?   // 統一編號
  invoiceDonateCode String?
}
```

### 6b. `MusicEnrollment` 新增欄位

```prisma
model MusicEnrollment {
  // ... 現有欄位

  // 新增：參加人補充資訊
  participantAge   Int?
  participantLevel String?   // beginner | intermediate | advanced
  participantNotes String?   @db.Text
  selectedDate     DateTime? // 選擇的開課日
}
```

### Migration 指令

```bash
npx prisma migrate dev --name add_checkout_fields
```

---

## 七、前端元件結構

```
src/app/checkout/
├── page.tsx                    ← Server Component，讀取 packageId/workshopId 資料
└── CheckoutWizard.tsx          ← Client Component，管理 step state

src/components/checkout/
├── StepIndicator.tsx           ← 進度條
├── Step1PlanConfirm.tsx        ← Step 1 UI
├── Step2FillInfo.tsx           ← Step 2 UI（最大）
├── Step3OrderReview.tsx        ← Step 3 UI
└── InvoiceForm.tsx             ← 發票欄位（Step 2 子元件）
```

**State 設計**（`CheckoutWizard.tsx`）：

```typescript
const [step, setStep] = useState<1 | 2 | 3>(1);
const [selectedDate, setSelectedDate] = useState<string>();
const [purchaser, setPurchaser] = useState<PurchaserInfo>();
const [participant, setParticipant] = useState<ParticipantInfo>();
const [invoice, setInvoice] = useState<InvoiceInfo>();
const [isSubmitting, setIsSubmitting] = useState(false);
```

---

## 八、付款完成後的後台訂單

付款成功後的資料狀態：

```
Order
  status:        PENDING_PAYMENT → PAID
  paymentStatus: PENDING → COMPLETED
  paidAt:        [timestamp]
  transactionId: [ECPay TradeNo]

Payment
  paymentStatus: COMPLETED
  ecpayTradeNo:  [ECPay TradeNo]
  rawCallback:   { ... }   ← 完整 ECPay callback 存檔

MusicEnrollment（音樂課）
  status:        PENDING → ACTIVE  ← admin 手動或自動啟動
  startDate:     [首堂日期]
  expiryDate:    [startDate + validDuration months]
```

Admin 在 `/admin/orders` 可以：
- 看到訂單 + 訂購人 + 參加人資訊
- 手動將 MusicEnrollment 從 PENDING → ACTIVE
- 新增 adminNotes
- 處理退款（觸發 Refund 流程）

---

## 九、實作優先順序

| 優先 | 項目 | 說明 |
|---|---|---|
| P0 | Schema migration | 新增 Order 和 MusicEnrollment 欄位 |
| P0 | `POST /api/bff/v1/orders/checkout` | 核心訂單建立 API |
| P0 | `/checkout` 頁面（三步驟） | 主要 UI |
| P1 | Step 1 UI | 方案確認 |
| P1 | Step 2 UI | 訂購人 + 參加人 + 發票 |
| P1 | Step 3 UI | 訂單確認 |
| P1 | StepIndicator | 進度條 |
| P2 | Admin 訂單頁補充欄位顯示 | 顯示訂購人/參加人資訊 |
| P2 | 訂單確認 Email | Nodemailer 寄送訂單摘要 |
| P3 | 電子發票串接 | ECPay Invoice API |

---

## 十、設計注意事項

1. **付款前不鎖名額**：名額管理由 admin 手動確認，避免未付款卡位問題。

2. **需成班邏輯**：`formationRequired = true` 時，Step 1 明顯警示，Step 3 確認欄位中重複提示。未成班退款流程走現有 Refund 模型。

3. **訂購人 ≠ 參加人**：常見情境（家長幫孩子報名），`Order.customerId` 指向參加人（學生），訂購人資訊額外存在新增的 `purchaser*` 欄位。

4. **手機格式**：前端驗證 `/^09\d{8}$/`，後端再驗一次。

5. **ECPay 商品名稱**：`ItemName` 限制 200 字、不能有特殊字元，buildCheckoutForm 端需做 sanitize。

6. **CSRF**：`/api/bff/v1/orders/checkout` 是公開 API，但需限制來源（`Referer` 檢查）或加入 honeypot 防機器人大量建單。

7. **發票後整合**：目前只收集資料不串 ECPay Invoice，Phase 2 再接。
