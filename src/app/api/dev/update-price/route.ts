import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || '歌曲創作工作坊';
    const price = parseInt(searchParams.get('price') || '300');

    const updated = await prisma.content.updateMany({
      where: {
        title: { contains: title }
      },
      data: {
        price: price
      }
    });

    return NextResponse.json({ success: true, updatedCount: updated.count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
