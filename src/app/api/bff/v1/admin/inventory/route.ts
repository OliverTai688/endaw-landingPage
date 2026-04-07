import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AdjustmentType } from '@prisma/client';
import { z } from 'zod';

const StockAdjustmentSchema = z.object({
  productId: z.string(),
  amount: z.number(),
  type: z.nativeEnum(AdjustmentType),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const inventory = await prisma.productInventory.findMany({
      include: {
        product: { select: { name: true, slug: true } },
        adjustments: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({ success: true, data: inventory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = StockAdjustmentSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.productInventory.findUnique({
        where: { productId: validatedData.productId }
      });

      if (!inventory) throw new Error('Inventory not found for product');

      const newStock = validatedData.type === AdjustmentType.INBOUND || validatedData.type === AdjustmentType.RETURN
        ? inventory.currentStock + validatedData.amount
        : inventory.currentStock - validatedData.amount;

      await tx.productInventory.update({
        where: { productId: validatedData.productId },
        data: { currentStock: newStock }
      });

      return tx.stockAdjustment.create({
        data: {
          inventoryId: inventory.id,
          type: validatedData.type,
          quantity: validatedData.amount,
          reason: validatedData.reason,
        }
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
