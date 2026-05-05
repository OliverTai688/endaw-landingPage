/**
 * src/lib/ecpay.ts
 *
 * Central ECPay AIO SDK wrapper.
 * All ECPay-specific SDK calls are isolated here so route handlers stay clean.
 * Never import this file from client components — it's server-only.
 */
import 'server-only';
import {
  Merchant,
  CreditOneTimePayment,
  TradeInfoQuery,
  isValidReceivedCheckMacValue,
} from 'node-ecpay-aio';

// ─── Environment config ────────────────────────────────────────────────────────

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

// ─── Singleton Merchant instance ───────────────────────────────────────────────

let _merchant: Merchant | null = null;

/**
 * Returns a singleton Merchant instance.
 * ECPay mode: 'sandbox' uses test environment, 'production' uses live.
 */
export function getMerchant(): Merchant {
  if (_merchant) return _merchant;

  const isSandbox = process.env.ECPAY_IS_SANDBOX !== 'false'; // defaults to sandbox
  // ECPay mode type: 'Test' | 'Production'
  const mode = isSandbox ? 'Test' : 'Production';

  _merchant = new Merchant(mode as 'Test' | 'Production', {
    MerchantID: getRequiredEnv('ECPAY_MERCHANT_ID'),
    HashKey: getRequiredEnv('ECPAY_HASH_KEY'),
    HashIV: getRequiredEnv('ECPAY_HASH_IV'),
    // ReturnURL is required in MerchantConfig — used as default fallback
    ReturnURL: `${getRequiredEnv('APP_URL')}/api/payments/ecpay/callback`,
  });

  return _merchant;
}

// ─── MerchantTradeNo generation ────────────────────────────────────────────────

/**
 * Generates a unique MerchantTradeNo satisfying ECPay constraints:
 * - Max 20 characters
 * - Alphanumeric only
 * - Must be globally unique (never reuse)
 *
 * Format: ENDAW + 13-digit ms timestamp + 2 random alphanumeric chars = 20 chars
 * Example: ENDAW174600012345AB
 */
export function generateMerchantTradeNo(): string {
  const prefix = 'ENDAW'; // 5 chars
  const ts = Date.now().toString(); // 13 chars (ms since epoch)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = Array.from({ length: 2 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join(''); // 2 chars
  const tradeNo = `${prefix}${ts}${rand}`; // 20 chars total
  // Safety assertion — ECPay rejects if > 20 chars
  if (tradeNo.length > 20) {
    throw new Error(`MerchantTradeNo too long: ${tradeNo.length} chars (max 20)`);
  }
  return tradeNo;
}

// ─── Checkout form builder ─────────────────────────────────────────────────────

export interface CheckoutParams {
  merchantTradeNo: string;
  /** Product description shown on ECPay page (max 200 chars) */
  itemName: string;
  /** TWD integer — same unit as Order.totalAmount */
  totalAmount: number;
  /** ECPay TradeDesc — short order description (max 200 chars) */
  tradeDesc: string;
  /** MerchantTradeDate format: yyyy/MM/dd HH:mm:ss */
  merchantTradeDate: string;
}

/**
 * Builds the HTML auto-submit form string for ECPay Credit Card redirect.
 * Returns the raw HTML string from node-ecpay-aio's checkout().
 * Frontend should inject this into DOM and call form.submit().
 */
export async function buildCheckoutForm(params: CheckoutParams): Promise<string> {
  const merchant = getMerchant();
  const appUrl = getRequiredEnv('APP_URL');

  const payment = merchant.createPayment(
    CreditOneTimePayment,
    {
      MerchantTradeNo: params.merchantTradeNo,
      MerchantTradeDate: params.merchantTradeDate,
      TotalAmount: params.totalAmount,
      TradeDesc: params.tradeDesc,
      ItemName: params.itemName,
      // Server-to-server callback — source of truth for payment status
      ReturnURL: `${appUrl}/api/payments/ecpay/callback`,
      // Client-facing redirect after payment (display only, not source of truth)
      OrderResultURL: `${appUrl}/payment/result`,
      // "Return to store" button on ECPay page
      ClientBackURL: `${appUrl}/payment/result`,
    },
    {} // CreditOneTimePayment-specific params (empty = defaults)
  );

  // checkout() returns an HTML string containing a hidden form that auto-submits to ECPay
  return payment.checkout();
}

// ─── Callback verification ─────────────────────────────────────────────────────

/**
 * Verifies the CheckMacValue from ECPay's server callback.
 * Uses node-ecpay-aio's built-in verifier — no manual SHA256 needed.
 *
 * @param callbackBody - Parsed key-value pairs from application/x-www-form-urlencoded
 * @returns true if CheckMacValue is valid
 */
export function verifyCallbackCheckMacValue(
  callbackBody: Record<string, string>
): boolean {
  const { HashKey, HashIV } = getMerchant().config;
  try {
    return isValidReceivedCheckMacValue(callbackBody as any, HashKey, HashIV);
  } catch {
    return false;
  }
}

// ─── Trade info query builder ─────────────────────────────────────────────────

/**
 * Builds a TradeInfoQuery instance for querying ECPay for transaction status.
 * Phase 1: returned but not yet called remotely (reserved for Phase 2).
 */
export function buildTradeInfoQuery(merchantTradeNo: string) {
  const merchant = getMerchant();
  return merchant.createQuery(TradeInfoQuery, {
    MerchantTradeNo: merchantTradeNo,
  });
}

// ─── Date formatter ───────────────────────────────────────────────────────────

/**
 * Formats current time as ECPay-required MerchantTradeDate: "yyyy/MM/dd HH:mm:ss"
 * Uses Intl.DateTimeFormat to ensure it's always Taiwan time (UTC+8) regardless of server timezone.
 */
export function getECPayTradeDate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

  return (
    `${getPart('year')}/${getPart('month')}/${getPart('day')} ` +
    `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`
  );
}
