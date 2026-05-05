/**
 * POST /api/payments/ecpay/create
 *
 * Creates an ECPay AIO payment request for an existing order.
 * Returns an HTML form string that the frontend auto-submits to ECPay.
 *
 * Security: HashKey and HashIV are NEVER sent to the client.
 * The HTML form is generated server-side; the client only receives rendered HTML.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  buildCheckoutForm,
  generateMerchantTradeNo,
  getECPayTradeDate,
} from '@/lib/ecpay';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = CreatePaymentSchema.parse(body);

    // ── 1. Fetch and validate the order ─────────────────────────────────────
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        productItems: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: '找不到訂單 (Order not found)' },
        { status: 404 }
      );
    }

    // ── 1b. Guard: ensure amount is valid ───────────────────────────────────
    if (order.totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: '訂單金額必須大於 0 (Amount must be > 0)' },
        { status: 400 }
      );
    }

    // ── 2. Guard: only allow payment for PENDING_PAYMENT orders ─────────────
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: `訂單付款狀態為 ${order.paymentStatus}，不可重複付款`,
        },
        { status: 409 }
      );
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      return NextResponse.json(
        {
          success: false,
          error: `訂單狀態為 ${order.status}，不可付款`,
        },
        { status: 409 }
      );
    }

    // ── 3. Build ECPay ItemName (max 400 chars) ──────────────────────────────
    let itemName: string;
    switch (order.orderType) {
      case 'WORKSHOP':
        itemName = `工作坊 - ${order.orderNumber}`;
        break;
      case 'MUSIC':
        itemName = `音樂課程 - ${order.orderNumber}`;
        break;
      case 'PRODUCT':
        itemName =
          order.productItems
            .map((item) => `${item.product.name} x${item.quantity}`)
            .join('#') || `商品訂單 - ${order.orderNumber}`;
        break;
      default:
        itemName = `ENDAW 訂單 - ${order.orderNumber}`;
    }
    // Truncate to ECPay limit
    if (itemName.length > 400) itemName = itemName.slice(0, 397) + '...';

    // ── 4. Generate unique MerchantTradeNo ───────────────────────────────────
    // ECPay constraint: max 20 chars, alphanumeric, globally unique
    const merchantTradeNo = generateMerchantTradeNo();
    const merchantTradeDate = getECPayTradeDate();

    // ── 5. Create PENDING Payment record BEFORE calling ECPay ───────────────
    await prisma.payment.create({
      data: {
        orderId: order.id,
        merchantTradeNo,
        paymentStatus: PaymentStatus.PENDING,
        // Amount is TWD integer — same unit as order.totalAmount (no conversion needed)
        totalAmount: order.totalAmount,
      },
    });

    // ── 6. Build ECPay checkout form ─────────────────────────────────────────
    const htmlForm = await buildCheckoutForm({
      merchantTradeNo,
      itemName,
      totalAmount: order.totalAmount,
      tradeDesc: `ENDAW Order ${order.orderNumber}`,
      merchantTradeDate,
    });

    return NextResponse.json({ success: true, htmlForm });
  } catch (error: unknown) {
    // zod parse error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ECPay Create] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
