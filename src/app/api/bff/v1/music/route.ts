import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nameEn = searchParams.get('nameEn');
    const type = searchParams.get('type');

    // Get monthly announcements
    if (type === 'announcements') {
      const month = searchParams.get('month');
      if (month) {
        const announcement = await prisma.monthlyAnnouncement.findUnique({
          where: { month },
        });
        return NextResponse.json({ success: true, data: announcement });
      }
      const announcements = await prisma.monthlyAnnouncement.findMany({
        orderBy: { month: 'desc' },
      });
      return NextResponse.json({ success: true, data: announcements });
    }

    // Single instrument by nameEn
    if (nameEn) {
      const instrument = await prisma.musicInstrument.findUnique({
        where: { nameEn },
        include: {
          levels: {
            orderBy: { sortOrder: 'asc' },
            include: {
              packages: { orderBy: { price: 'asc' } },
            },
          },
          faqs: { orderBy: { sortOrder: 'asc' } },
        },
      });

      if (!instrument) {
        return NextResponse.json(
          { success: false, error: 'Instrument not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: instrument });
    }

    // All instruments
    const instruments = await prisma.musicInstrument.findMany({
      include: {
        levels: {
          orderBy: { sortOrder: 'asc' },
          include: {
            packages: { orderBy: { price: 'asc' } },
          },
        },
        faqs: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: instruments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
