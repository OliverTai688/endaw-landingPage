import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const UpdateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: {
        customer: true,
        productItems: {
          include: {
            product: {
              select: { name: true, slug: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.order.count({
      where: status ? { status } : {},
    });

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const validatedData = UpdateOrderSchema.parse(body);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { productItems: true }
      });

      if (!order) throw new Error('Order not found');

      // State machine logic
      if (validatedData.status === OrderStatus.PROCESSING && order.status === OrderStatus.PENDING_PAYMENT) {
        // Warning: Transitioning to processing usually requires payment
      }

      // If transition to SHIPPED, ensure tracking number is provided if it's a product order
      if (validatedData.status === OrderStatus.SHIPPED && !validatedData.trackingNumber && !order.trackingNumber) {
        // We could enforce this here, or just allow it and warn
      }

      return tx.order.update({
        where: { id },
        data: {
          ...validatedData,
          paidAt: validatedData.paymentStatus === PaymentStatus.COMPLETED ? new Date() : undefined,
        },
      });
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
