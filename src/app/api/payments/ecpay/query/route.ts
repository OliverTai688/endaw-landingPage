/**
 * POST /api/payments/ecpay/query
 *
 * Queries payment status for a given MerchantTradeNo.
 *
 * Phase 1: Returns local DB Payment record only.
 * TODO (Phase 2): Call ECPay TradeInfoQuery to sync remote status before returning.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
// TODO (Phase 2): import { buildTradeInfoQuery } from '@/lib/ecpay';

const QuerySchema = z.object({
  merchantTradeNo: z.string().min(1, 'merchantTradeNo is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantTradeNo } = QuerySchema.parse(body);

    // TODO (Phase 2): Call ECPay TradeInfoQuery to get live status from ECPay,
    // then reconcile with our local DB record before returning.
    // const query = buildTradeInfoQuery(merchantTradeNo);
    // const ecpayResult = await query.read();

    // Phase 1: Query local DB only
    const payment = await prisma.payment.findUnique({
      where: { merchantTradeNo },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
            currency: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        merchantTradeNo: payment.merchantTradeNo,
        ecpayTradeNo: payment.ecpayTradeNo,
        paymentStatus: payment.paymentStatus,
        paymentMethod: payment.paymentMethod,
        totalAmount: payment.totalAmount,
        rtnCode: payment.rtnCode,
        rtnMsg: payment.rtnMsg,
        paidAt: payment.paidAt,
        order: payment.order,
        // Phase 1 notice: status is from local DB, not live ECPay query
        _note: 'Status reflects last callback from ECPay. Phase 2 will add live query.',
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ECPay Query] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
