/**
 * GET  /api/bff/v1/admin/email-templates        — list all templates
 * PUT  /api/bff/v1/admin/email-templates?type=X — update a template
 * POST /api/bff/v1/admin/email-templates/preview — render preview (future)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkInternalAccess } from '@/lib/auth-server';
import { EmailTemplateType } from '@prisma/client';

const DEFAULT_BODIES: Record<EmailTemplateType, { subject: string; body: string }> = {
  ORDER_CONFIRMATION_ORDERER: {
    subject: '【ENDAW】報名確認通知 - {{orderNumber}}',
    body: `<p>親愛的 {{ordererName}}，感謝您報名 <strong>{{title}}</strong>。</p>
<p>訂單編號：{{orderNumber}}｜人數：{{quantity}} 位｜合計：NT$ {{totalAmount}}</p>
<p>參加人名單：{{attendeeList}}</p>`,
  },
  ORDER_CONFIRMATION_ATTENDEE: {
    subject: '【ENDAW】您已完成課程報名 - {{orderNumber}}',
    body: `<p>親愛的 {{attendeeName}}，您已由 {{ordererName}} 完成 <strong>{{title}}</strong> 的報名。</p>
<p>訂單編號：{{orderNumber}}</p>`,
  },
};

async function ensureTemplates() {
  for (const [type, def] of Object.entries(DEFAULT_BODIES) as [EmailTemplateType, typeof DEFAULT_BODIES[EmailTemplateType]][]) {
    await prisma.emailTemplate.upsert({
      where: { type },
      update: {},
      create: { type, subject: def.subject, body: def.body },
    });
  }
}

export async function GET(_req: NextRequest) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  await ensureTemplates();
  const templates = await prisma.emailTemplate.findMany({ orderBy: { type: 'asc' } });
  return NextResponse.json({ success: true, data: templates });
}

export async function PUT(req: NextRequest) {
  const ok = await checkInternalAccess();
  if (!ok) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as EmailTemplateType | null;
  if (!type || !Object.values(EmailTemplateType).includes(type)) {
    return NextResponse.json({ success: false, error: 'Invalid template type' }, { status: 400 });
  }

  const body = await req.json();
  const schema = z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
  });
  const data = schema.parse(body);

  const template = await prisma.emailTemplate.upsert({
    where: { type },
    update: data,
    create: { type, ...data },
  });
  return NextResponse.json({ success: true, data: template });
}
