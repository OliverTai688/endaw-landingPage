import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CreateProductSchema, UpdateProductSchema } from '@/domain/schemas/ProductSchema';

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specs: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images, variants, specs, ...productData } = CreateProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...productData,
        inventory: {
          create: { currentStock: 0, lowThreshold: 5 },
        },
        ...(images?.length && {
          images: { create: images },
        }),
        ...(variants?.length && {
          variants: { create: variants },
        }),
        ...(specs?.length && {
          specs: { create: specs },
        }),
      },
      include: {
        inventory: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specs: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, images, variants, specs, ...productData } = UpdateProductSchema.parse(body);

    // Replace strategy: delete old sub-resources and recreate
    await prisma.$transaction(async (tx) => {
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
      }
      if (specs !== undefined) {
        await tx.productSpec.deleteMany({ where: { productId: id } });
      }
    });

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(images !== undefined && {
          images: { create: images },
        }),
        ...(variants !== undefined && {
          variants: { create: variants },
        }),
        ...(specs !== undefined && {
          specs: { create: specs },
        }),
      },
      include: {
        inventory: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specs: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
