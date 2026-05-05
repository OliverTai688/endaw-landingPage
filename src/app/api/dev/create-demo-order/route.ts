import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus, PaymentStatus, OrderType } from '@prisma/client';

/**
 * ONLY FOR DEV/TESTING.
 * Creates a mock order for testing the ECPay flow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, amount, itemName, type } = body;

    // Map content type to OrderType enum
    let orderType: OrderType = OrderType.PRODUCT;
    if (type === 'WORKSHOP') orderType = OrderType.WORKSHOP;
    if (type === 'MUSIC') orderType = OrderType.MUSIC;

    // 1. Create a dummy customer
    let customer = await prisma.customer.findFirst({
      where: { email: 'tester@example.com' }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: '金流測試員',
          email: 'tester@example.com',
          phone: '0912345678',
        }
      });
    }

    // 2. Create the Order
    const orderNumber = `TEST-${Date.now()}`;
    const totalAmount = amount || 100;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        orderType: orderType,
        subtotal: totalAmount, // Required field
        totalAmount: totalAmount,
        currency: 'TWD',
        customerId: customer.id,
        // Add a product item if productId is provided
        productItems: productId ? {
          create: [{
            productId,
            quantity: 1,
            unitPrice: totalAmount,
          }]
        } : undefined,
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('[CreateDemoOrder] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
