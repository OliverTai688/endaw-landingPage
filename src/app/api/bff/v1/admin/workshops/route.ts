import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentType, PublishStatus } from '@prisma/client';

export async function GET() {
  try {
    const workshops = await prisma.content.findMany({
      where: { type: ContentType.WORKSHOP },
      include: { workshop: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: workshops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, description, coverImage, price, tags, status, metadata } = body;

    const content = await prisma.content.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || '',
        coverImage: coverImage || '',
        price: price || 0,
        type: ContentType.WORKSHOP,
        status: status || PublishStatus.DRAFT,
        tags: tags || [],
        metadata: metadata || {},
        workshop: {
          create: {
            location: metadata?.schedule?.location || '',
            duration: metadata?.schedule?.duration || '',
            totalCap: metadata?.capacity?.total || 0,
            remCap: metadata?.capacity?.remaining || 0,
          },
        },
      },
      include: { workshop: true },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, subtitle, description, coverImage, price, tags, status, metadata } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || null,
        description: description || '',
        coverImage: coverImage || '',
        price: price || 0,
        status: status || PublishStatus.DRAFT,
        tags: tags || [],
        metadata: metadata || {},
        workshop: {
          update: {
            location: metadata?.schedule?.location || '',
            duration: metadata?.schedule?.duration || '',
            totalCap: metadata?.capacity?.total || 0,
            remCap: metadata?.capacity?.remaining || 0,
          },
        },
      },
      include: { workshop: true },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await prisma.content.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
