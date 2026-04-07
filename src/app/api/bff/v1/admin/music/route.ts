import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PublishStatus } from '@prisma/client';

const includeAll = {
  levels: {
    orderBy: { sortOrder: 'asc' as const },
    include: { packages: { orderBy: { price: 'asc' as const } } },
  },
  faqs: { orderBy: { sortOrder: 'asc' as const } },
};

export async function GET() {
  try {
    const instruments = await prisma.musicInstrument.findMany({
      include: includeAll,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: instruments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, nameEn, coverImage, description,
      containsEquipment, equipmentDescription,
      rentalAvailable, rentalOffsetAllowed,
      levels, faqs,
    } = body;

    const instrument = await prisma.musicInstrument.create({
      data: {
        name,
        nameEn,
        coverImage: coverImage || '',
        description: description || '',
        containsEquipment: containsEquipment || false,
        equipmentDescription: equipmentDescription || null,
        rentalAvailable: rentalAvailable || false,
        rentalOffsetAllowed: rentalOffsetAllowed || false,
        levels: {
          create: (levels || []).map((level: any, li: number) => ({
            name: level.name,
            sortOrder: li,
            packages: {
              create: (level.packages || []).map((pkg: any) => ({
                name: pkg.name,
                lessonCount: pkg.lessonCount || 1,
                bonusLessons: pkg.bonusLessons || 0,
                validDuration: pkg.validDuration || 3,
                firstClassDate: pkg.firstClassDate || null,
                registrationStartDates: pkg.registrationStartDates || [],
                formationRequired: pkg.formationRequired || false,
                formationDecisionDays: pkg.formationDecisionDays || 0,
                refundPolicy: pkg.refundPolicy || '',
                price: pkg.price || 0,
                status: pkg.status === 'PUBLISHED' ? PublishStatus.PUBLISHED : PublishStatus.DRAFT,
                includedEquipment: pkg.includedEquipment || [],
                highlights: pkg.highlights || [],
              })),
            },
          })),
        },
        faqs: {
          create: (faqs || []).map((faq: any, fi: number) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: fi,
          })),
        },
      },
      include: includeAll,
    });

    return NextResponse.json({ success: true, data: instrument });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id, name, nameEn, coverImage, description,
      containsEquipment, equipmentDescription,
      rentalAvailable, rentalOffsetAllowed,
      levels, faqs,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    // Replace strategy: delete old nested, recreate
    await prisma.musicFAQ.deleteMany({ where: { instrumentId: id } });
    // Delete packages first (via levels), then levels
    const existingLevels = await prisma.musicLevel.findMany({ where: { instrumentId: id }, select: { id: true } });
    for (const lvl of existingLevels) {
      await prisma.musicPackage.deleteMany({ where: { levelId: lvl.id } });
    }
    await prisma.musicLevel.deleteMany({ where: { instrumentId: id } });

    const instrument = await prisma.musicInstrument.update({
      where: { id },
      data: {
        name,
        nameEn,
        coverImage: coverImage || '',
        description: description || '',
        containsEquipment: containsEquipment || false,
        equipmentDescription: equipmentDescription || null,
        rentalAvailable: rentalAvailable || false,
        rentalOffsetAllowed: rentalOffsetAllowed || false,
        levels: {
          create: (levels || []).map((level: any, li: number) => ({
            name: level.name,
            sortOrder: li,
            packages: {
              create: (level.packages || []).map((pkg: any) => ({
                name: pkg.name,
                lessonCount: pkg.lessonCount || 1,
                bonusLessons: pkg.bonusLessons || 0,
                validDuration: pkg.validDuration || 3,
                firstClassDate: pkg.firstClassDate || null,
                registrationStartDates: pkg.registrationStartDates || [],
                formationRequired: pkg.formationRequired || false,
                formationDecisionDays: pkg.formationDecisionDays || 0,
                refundPolicy: pkg.refundPolicy || '',
                price: pkg.price || 0,
                status: pkg.status === 'PUBLISHED' ? PublishStatus.PUBLISHED : PublishStatus.DRAFT,
                includedEquipment: pkg.includedEquipment || [],
                highlights: pkg.highlights || [],
              })),
            },
          })),
        },
        faqs: {
          create: (faqs || []).map((faq: any, fi: number) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: fi,
          })),
        },
      },
      include: includeAll,
    });

    return NextResponse.json({ success: true, data: instrument });
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

    await prisma.musicInstrument.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
