import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    // Single product by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug, status: ProductStatus.PUBLISHED },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          specs: { orderBy: { sortOrder: 'asc' } },
          inventory: { select: { currentStock: true } },
        },
      });

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: product });
    }

    // All published products
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specs: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
