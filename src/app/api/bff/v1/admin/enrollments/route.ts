import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

// GET /api/bff/v1/admin/enrollments
// Query params: id (single), status, customerId, page, limit
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const enrollment = await prisma.musicEnrollment.findUnique({
        where: { id },
        include: {
          customer: true,
          package: {
            include: {
              level: {
                include: { instrument: true },
              },
            },
          },
          order: true,
        },
      });
      if (!enrollment) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: enrollment });
    }

    const status = searchParams.get('status') as EnrollmentStatus | null;
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [enrollments, total] = await Promise.all([
      prisma.musicEnrollment.findMany({
        where,
        include: {
          customer: true,
          package: {
            include: {
              level: {
                include: { instrument: { select: { name: true, nameEn: true } } },
              },
            },
          },
          order: { select: { orderNumber: true, totalAmount: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.musicEnrollment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: enrollments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — Activate a new enrollment for an order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, customerId, packageId, startDate, adminNotes, activatedBy } = body;

    if (!orderId || !customerId || !packageId || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: orderId, customerId, packageId, startDate' },
        { status: 400 }
      );
    }

    // Check if an enrollment for this order already exists
    const existing = await prisma.musicEnrollment.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: '此訂單已建立過學員資料' },
        { status: 409 }
      );
    }

    // Look up the package's validDuration (in months) to calculate expiryDate
    const pkg = await prisma.musicPackage.findUnique({
      where: { id: packageId },
      select: { validDuration: true },
    });
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + pkg.validDuration);

    const enrollment = await prisma.musicEnrollment.create({
      data: {
        orderId,
        customerId,
        packageId,
        startDate: start,
        expiryDate: expiry,
        status: EnrollmentStatus.ACTIVE,
        adminNotes: adminNotes || null,
        activatedBy: activatedBy || null,
      },
      include: {
        customer: true,
        package: {
          include: { level: { include: { instrument: true } } },
        },
        order: { select: { orderNumber: true } },
      },
    });

    return NextResponse.json({ success: true, data: enrollment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — Update enrollment status or notes
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, startDate, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing enrollment id' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // If startDate changes, recalculate expiryDate
    if (startDate) {
      const enrollment = await prisma.musicEnrollment.findUnique({
        where: { id },
        include: { package: { select: { validDuration: true } } },
      });
      if (!enrollment) {
        return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
      }
      const start = new Date(startDate);
      const expiry = new Date(start);
      expiry.setMonth(expiry.getMonth() + enrollment.package.validDuration);
      updateData.startDate = start;
      updateData.expiryDate = expiry;
    }

    const updated = await prisma.musicEnrollment.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        package: { include: { level: { include: { instrument: true } } } },
        order: { select: { orderNumber: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — Remove enrollment
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }
    await prisma.musicEnrollment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
