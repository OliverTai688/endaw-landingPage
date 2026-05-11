/**
 * POST /api/bff/v1/orders/music
 *
 * Creates a music package order from the checkout form.
 * MusicPackage is separate from the Content model — uses MusicPackage.id.
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

const CreateMusicOrderSchema = z.object({
  packageId: z.string().min(1),

  orderMode: z.enum(['B2C', 'B2B']),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  companyAddress: z.string().optional(),

  invoiceType: z.enum(['PERSONAL', 'COMPANY', 'DONATE']),
  carruerType: z.enum(['NONE', 'PHONE', 'CITIZEN']).optional(),
  carruerNum: z.string().optional(),
  donationCode: z.string().optional(),

  attendees: z.array(AttendeeSchema).min(1),
  fieldValues: z.record(z.string(), z.string()).optional(),

  rentalRequested: z.boolean().optional().default(false),
  rentalAmount: z.number().int().min(0).optional().default(0),
});

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MS-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateMusicOrderSchema.parse(body);

    const pkg = await prisma.musicPackage.findUnique({
      where: { id: data.packageId },
      select: { id: true, price: true, status: true, name: true },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, error: '找不到課程方案' }, { status: 404 });
    }
    if (pkg.status !== 'PUBLISHED') {
      return NextResponse.json({ success: false, error: '此課程方案未開放報名' }, { status: 400 });
    }

    const quantity = data.attendees.length;
    const subtotal = pkg.price * quantity;
    const totalAmount = subtotal + (data.rentalAmount ?? 0);

    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      update: { name: data.name, phone: data.phone },
      create: { name: data.name, email: data.email, phone: data.phone },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderType: OrderType.MUSIC,
        status: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        customerId: customer.id,
        musicPackageId: data.packageId,
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

        rentalRequested: data.rentalRequested ?? false,
        rentalAmount: data.rentalAmount ?? 0,

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
      title: pkg.name,
      totalAmount,
      quantity,
      orderMode: data.orderMode,
      companyName: data.companyName,
      ordererName: data.name,
      ordererEmail: data.email,
      ordererPhone: data.phone,
      attendees: data.attendees.map((a) => ({ name: a.name, email: a.email || null })),
    }).catch((e) => console.error('[Email] music order emails failed:', e));

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.issues[0].message },
        { status: 400 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[CreateMusicOrder]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
