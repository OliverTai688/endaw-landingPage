/**
 * POST /api/payments/ecpay/callback
 *
 * ECPay Server-to-Server Callback (the ONLY source of truth for payment status).
 *
 * ECPay sends this as application/x-www-form-urlencoded POST immediately after payment.
 * This endpoint MUST return "1|OK" (plain text) on success, "0|Error" on failure.
 *
 * Security model:
 * - CheckMacValue is verified using ECPAY_HASH_KEY + ECPAY_HASH_IV (server-only secrets)
 * - Invalid CheckMacValue → reject with "0|Error" (logged for investigation)
 * - Idempotent: if Payment already COMPLETED, returns "1|OK" without double-processing
 * - Uses prisma.$transaction for atomic Payment + Order updates
 *
 * CSRF: This route is naturally exempt — Next.js middleware only matches "/contact",
 * and ECPay is a trusted server; we validate authenticity via CheckMacValue instead.
 */
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCallbackCheckMacValue } from '@/lib/ecpay';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// ECPay requires plain-text responses, not JSON
const ok = () =>
  new Response('1|OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });

const err = () =>
  new Response('0|Error', {
    status: 200, // ECPay expects HTTP 200 even on "error"
    headers: { 'Content-Type': 'text/plain' },
  });

export async function POST(request: NextRequest) {
  let rawBody: Record<string, string> = {};

  try {
    // ── 1. Parse application/x-www-form-urlencoded ──────────────────────────
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        rawBody[key] = value.toString();
      });
    } else {
      // Fallback: try text parsing (ECPay should always send form-encoded)
      const text = await request.text();
      new URLSearchParams(text).forEach((value, key) => {
        rawBody[key] = value;
      });
    }

    // ── 2. Verify CheckMacValue ──────────────────────────────────────────────
    const isValid = verifyCallbackCheckMacValue(rawBody);
    if (!isValid) {
      console.warn('[ECPay Callback] Invalid CheckMacValue. Body:', rawBody);
      return err();
    }

    // ── 3. Extract key fields from callback ──────────────────────────────────
    const {
      MerchantTradeNo,
      TradeNo: ecpayTradeNo,
      PaymentType: paymentMethod,
      RtnCode,
      RtnMsg,
      PaymentDate,
    } = rawBody;

    if (!MerchantTradeNo) {
      console.warn('[ECPay Callback] Missing MerchantTradeNo in callback');
      return err();
    }

    // ── 4. Find the Payment record ───────────────────────────────────────────
    const payment = await prisma.payment.findUnique({
      where: { merchantTradeNo: MerchantTradeNo },
    });

    if (!payment) {
      console.error(
        `[ECPay Callback] Payment not found for MerchantTradeNo: ${MerchantTradeNo}`
      );
      // Still return "1|OK" to prevent ECPay from retrying a phantom order
      return ok();
    }

    // ── 5. Idempotency guard ─────────────────────────────────────────────────
    // If already processed, do NOT double-update to prevent side effects
    if (payment.paymentStatus === PaymentStatus.COMPLETED) {
      console.info(
        `[ECPay Callback] Payment ${MerchantTradeNo} already COMPLETED — skipping`
      );
      return ok();
    }

    const isSuccess = RtnCode === '1';

    // ── 6. Atomic transaction: update Payment + Order ────────────────────────
    await prisma.$transaction(async (tx) => {
      if (isSuccess) {
        // Determine paidAt: prefer ECPay-reported PaymentDate, fallback to now()
        const paidAt = PaymentDate ? new Date(PaymentDate) : new Date();

        // Update Payment record to COMPLETED
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            ecpayTradeNo: ecpayTradeNo || null,
            paymentMethod: paymentMethod || null,
            rtnCode: RtnCode,
            rtnMsg: RtnMsg || null,
            rawCallback: rawBody as Record<string, string>,
            paidAt,
          },
        });

        // Update Order: mark as paid
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            status: OrderStatus.PAID,
            // Store ECPay TradeNo as our transactionId reference
            transactionId: ecpayTradeNo || null,
            paidAt,
          },
        });
      } else {
        // Payment failed or cancelled
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            rtnCode: RtnCode,
            rtnMsg: RtnMsg || null,
            rawCallback: rawBody as Record<string, string>,
          },
        });

        // Note: Order stays at PENDING_PAYMENT so customer can retry
        // (do NOT set order.paymentStatus = FAILED — that would block retries)
      }
    });

    console.info(
      `[ECPay Callback] MerchantTradeNo=${MerchantTradeNo} processed. ` +
        `RtnCode=${RtnCode} orderId=${payment.orderId}`
    );

    return ok();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ECPay Callback] Unexpected error:', message, rawBody);
    // Return "0|Error" so ECPay knows to retry
    return err();
  }
}
