import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentType, PublishStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Single workshop by id
    if (id) {
      const content = await prisma.content.findUnique({
        where: { id, type: ContentType.WORKSHOP, status: PublishStatus.PUBLISHED },
        include: { workshop: true },
      });

      if (!content) {
        return NextResponse.json(
          { success: false, error: 'Workshop not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: content });
    }

    // All published workshops
    const workshops = await prisma.content.findMany({
      where: { type: ContentType.WORKSHOP, status: PublishStatus.PUBLISHED },
      include: { workshop: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: workshops });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
