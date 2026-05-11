/**
 * POST /api/bff/v1/orders/workshop
 *
 * Creates a workshop (or music) order from the multi-step checkout form.
 * Steps:
 *  1. Upsert Customer by email
 *  2. Create Order with B2B/B2C + invoice + fieldValues
 *  3. Create Attendee records
 * Returns { orderId } for the client to redirect to ECPay payment.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { OrderStatus, PaymentStatus, OrderType, Prisma } from '@prisma/client';
import { sendOrderConfirmationEmails } from '@/lib/email-service';

const AttendeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

const CreateWorkshopOrderSchema = z.object({
  contentId: z.string().min(1),
  contentType: z.enum(['WORKSHOP', 'MUSIC']).default('WORKSHOP'),

  // Orderer
  orderMode: z.enum(['B2C', 'B2B']),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  companyAddress: z.string().optional(),

  // E-invoice
  invoiceType: z.enum(['PERSONAL', 'COMPANY', 'DONATE']),
  carruerType: z.enum(['NONE', 'PHONE', 'CITIZEN']).optional(),
  carruerNum: z.string().optional(),
  donationCode: z.string().optional(),

  // Attendees
  attendees: z.array(AttendeeSchema).min(1),

  // Order-level custom fields
  fieldValues: z.record(z.string(), z.string()).optional(),
});

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WS-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateWorkshopOrderSchema.parse(body);

    // 1. Fetch content to get price
    const content = await prisma.content.findUnique({
      where: { id: data.contentId },
      select: { id: true, price: true, type: true, status: true, title: true },
    });

    if (!content) {
      return NextResponse.json({ success: false, error: '找不到課程' }, { status: 404 });
    }
    if (content.status !== 'PUBLISHED') {
      return NextResponse.json({ success: false, error: '此課程未開放報名' }, { status: 400 });
    }

    const quantity = data.attendees.length;
    const unitPrice = content.price;
    const subtotal = unitPrice * quantity;
    const totalAmount = subtotal;

    // 2. Upsert customer by email
    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      update: { name: data.name, phone: data.phone },
      create: { name: data.name, email: data.email, phone: data.phone },
    });

    // 3. Create order + attendees atomically
    const orderType =
      content.type === 'MUSIC' ? OrderType.MUSIC : OrderType.WORKSHOP;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType,
        status: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        customerId: customer.id,
        workshopId: orderType === OrderType.WORKSHOP ? data.contentId : undefined,
        musicPackageId: orderType === OrderType.MUSIC ? data.contentId : undefined,
        currency: 'TWD',
        subtotal,
        totalAmount,
        quantity,

        orderMode: data.orderMode,
        companyName: data.companyName,
        taxId: data.taxId,
        companyAddress: data.companyAddress,

        invoiceType: data.invoiceType,
        carruerType: data.carruerType ?? 'NONE',
        carruerNum: data.carruerNum,
        donationCode: data.donationCode,

        fieldValues: (data.fieldValues ?? {}) as Prisma.InputJsonValue,

        attendees: {
          create: data.attendees.map((a, i) => ({
            name: a.name,
            email: a.email || null,
            phone: a.phone || null,
            metadata: (a.metadata ?? {}) as Prisma.InputJsonValue,
            sortOrder: i,
          })),
        },
      },
    });

    // Fire confirmation emails (non-blocking)
    sendOrderConfirmationEmails({
      orderId: order.id,
      orderNumber: order.orderNumber,
      title: content.title,
      totalAmount,
      quantity,
      orderMode: data.orderMode,
      companyName: data.companyName,
      ordererName: data.name,
      ordererEmail: data.email,
      ordererPhone: data.phone,
      attendees: data.attendees.map((a) => ({ name: a.name, email: a.email || null })),
    }).catch((e) => console.error('[Email] workshop order emails failed:', e));

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.issues[0].message },
        { status: 400 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[CreateWorkshopOrder]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
