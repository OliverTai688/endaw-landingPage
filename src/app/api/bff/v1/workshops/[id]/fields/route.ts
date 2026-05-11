/**
 * GET /api/bff/v1/workshops/[id]/fields
 *
 * Public endpoint — returns registration fields for a content item.
 * Used by the checkout flow to render custom form fields.
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fields = await prisma.registrationField.findMany({
    where: { contentId: id },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      label: true,
      labelEn: true,
      type: true,
      required: true,
      options: true,
      placeholder: true,
      scope: true,
      sortOrder: true,
    },
  });
  return NextResponse.json({ success: true, data: fields });
}
