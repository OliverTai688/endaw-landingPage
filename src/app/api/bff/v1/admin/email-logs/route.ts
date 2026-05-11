/**
 * GET /api/bff/v1/admin/email-logs
 * Query params: page (default 1), limit (default 20), orderId?, status?
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkInternalAccess } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const orderId = searchParams.get('orderId') ?? undefined;
  const status = searchParams.get('status') as 'SENT' | 'FAILED' | null;

  const where = {
    ...(orderId ? { orderId } : {}),
    ...(status ? { status } : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
