/**
 * GET/POST  /api/bff/v1/admin/content/[id]/fields
 * PUT/DELETE /api/bff/v1/admin/content/[id]/fields?fieldId=xxx
 *
 * Admin CRUD for custom registration fields per content item.
 * Requires admin cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkInternalAccess } from '@/lib/auth-server';

const FieldSchema = z.object({
  label: z.string().min(1),
  labelEn: z.string().optional(),
  type: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'DATE']),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  placeholder: z.string().optional(),
  scope: z.enum(['ORDER', 'ATTENDEE']).default('ORDER'),
  sortOrder: z.number().int().default(0),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const fields = await prisma.registrationField.findMany({
    where: { contentId: id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ success: true, data: fields });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const data = FieldSchema.parse(body);

  const field = await prisma.registrationField.create({
    data: { ...data, contentId: id },
  });
  return NextResponse.json({ success: true, data: field }, { status: 201 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id: contentId } = await params;
  const { searchParams } = new URL(req.url);
  const fieldId = searchParams.get('fieldId');
  if (!fieldId) return NextResponse.json({ success: false, error: 'fieldId required' }, { status: 400 });

  const body = await req.json();
  const data = FieldSchema.partial().parse(body);

  const field = await prisma.registrationField.update({
    where: { id: fieldId, contentId },
    data,
  });
  return NextResponse.json({ success: true, data: field });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id: contentId } = await params;
  const { searchParams } = new URL(req.url);
  const fieldId = searchParams.get('fieldId');
  if (!fieldId) return NextResponse.json({ success: false, error: 'fieldId required' }, { status: 400 });

  await prisma.registrationField.delete({ where: { id: fieldId, contentId } });
  return NextResponse.json({ success: true });
}
