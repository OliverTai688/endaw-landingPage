/**
 * src/lib/email-service.ts
 *
 * Centralised order confirmation email service.
 * - Loads templates from DB (upserts defaults on first use)
 * - Renders {{variable}} placeholders
 * - Sends via Nodemailer / Gmail SMTP
 * - Logs every attempt to EmailLog table
 */
import 'server-only';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { EmailTemplateType } from '@prisma/client';

// ─── Default templates ────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES: Record<EmailTemplateType, { subject: string; body: string }> = {
  ORDER_CONFIRMATION_ORDERER: {
    subject: '【ENDAW】報名確認通知 - {{orderNumber}}',
    body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1a1a1a;padding:24px 32px;border-bottom:3px solid #D4AF37">
    <h1 style="color:#D4AF37;font-size:24px;font-weight:300;margin:0">ENDAW</h1>
  </div>
  <div style="padding:32px">
    <h2 style="font-weight:400;font-size:20px;margin-bottom:8px">感謝您的報名！</h2>
    <p style="color:#555;line-height:1.7">親愛的 <strong>{{ordererName}}</strong>，您已成功完成報名，以下是您的訂單資訊：</p>

    <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="color:#888;padding:6px 0;width:100px">課程</td><td><strong>{{title}}</strong></td></tr>
        <tr><td style="color:#888;padding:6px 0">訂單編號</td><td><code style="background:#e8e8e8;padding:2px 6px;border-radius:4px">{{orderNumber}}</code></td></tr>
        <tr><td style="color:#888;padding:6px 0">報名人數</td><td>{{quantity}} 位</td></tr>
        <tr><td style="color:#888;padding:6px 0">合計金額</td><td><strong style="color:#D4AF37;font-size:16px">NT$ {{totalAmount}}</strong></td></tr>
        <tr><td style="color:#888;padding:6px 0">訂購模式</td><td>{{orderMode}}</td></tr>
        {{#if companyName}}<tr><td style="color:#888;padding:6px 0">公司</td><td>{{companyName}}</td></tr>{{/if}}
      </table>
    </div>

    <h3 style="font-weight:400;color:#555;font-size:15px;margin-bottom:12px">參加人名單</h3>
    <div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
      {{attendeeList}}
    </div>

    <p style="color:#888;font-size:13px;margin-top:24px;line-height:1.7">
      如有任何問題，歡迎透過 Email 或電話與我們聯繫。<br/>
      感謝您選擇 ENDAW，期待與您相見！
    </p>
  </div>
  <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">
    © ENDAW · 此為系統自動發送，請勿直接回覆
  </div>
</div>`,
  },

  ORDER_CONFIRMATION_ATTENDEE: {
    subject: '【ENDAW】您已完成課程報名 - {{orderNumber}}',
    body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1a1a1a;padding:24px 32px;border-bottom:3px solid #D4AF37">
    <h1 style="color:#D4AF37;font-size:24px;font-weight:300;margin:0">ENDAW</h1>
  </div>
  <div style="padding:32px">
    <h2 style="font-weight:400;font-size:20px;margin-bottom:8px">課程報名通知</h2>
    <p style="color:#555;line-height:1.7">親愛的 <strong>{{attendeeName}}</strong>，</p>
    <p style="color:#555;line-height:1.7">
      您已由 <strong>{{ordererName}}</strong> 完成以下課程的報名，期待在課程中見到您！
    </p>

    <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="color:#888;padding:6px 0;width:100px">課程</td><td><strong>{{title}}</strong></td></tr>
        <tr><td style="color:#888;padding:6px 0">訂單編號</td><td><code style="background:#e8e8e8;padding:2px 6px;border-radius:4px">{{orderNumber}}</code></td></tr>
      </table>
    </div>

    <p style="color:#888;font-size:13px;line-height:1.7">
      如有任何問題，請聯繫訂購人 <strong>{{ordererName}}</strong>（{{ordererEmail}}）。<br/>
      感謝您選擇 ENDAW！
    </p>
  </div>
  <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#aaa">
    © ENDAW · 此為系統自動發送，請勿直接回覆
  </div>
</div>`,
  },
};

// ─── Template rendering ────────────────────────────────────────────────────────

function render(template: string, vars: Record<string, string>): string {
  let result = template;
  // Replace {{variable}} placeholders
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value ?? '');
  }
  // Remove unused {{#if ...}}...{{/if}} blocks (simple — not nested)
  result = result.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, '');
  return result;
}

function renderWithConditionals(template: string, vars: Record<string, string>): string {
  // Process {{#if key}}content{{/if}} blocks first
  const result = template.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, key, content) => {
    return vars[key] ? content : '';
  });
  return render(result, vars);
}

// ─── Nodemailer transporter ────────────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ─── Template loader (auto-seeds defaults) ────────────────────────────────────

async function getTemplate(type: EmailTemplateType) {
  const existing = await prisma.emailTemplate.findUnique({ where: { type } });
  if (existing) return existing;

  // Seed default on first access
  const def = DEFAULT_TEMPLATES[type];
  return prisma.emailTemplate.create({
    data: { type, subject: def.subject, body: def.body },
  });
}

// ─── Log helper ───────────────────────────────────────────────────────────────

async function log(params: {
  orderId?: string;
  toEmail: string;
  toName?: string;
  subject: string;
  templateType: EmailTemplateType;
  status: 'SENT' | 'FAILED';
  error?: string;
}) {
  await prisma.emailLog.create({
    data: {
      orderId: params.orderId,
      toEmail: params.toEmail,
      toName: params.toName,
      subject: params.subject,
      templateType: params.templateType,
      status: params.status,
      error: params.error,
      sentAt: params.status === 'SENT' ? new Date() : null,
    },
  });
}

// ─── Order payload type ────────────────────────────────────────────────────────

interface OrderEmailPayload {
  orderId: string;
  orderNumber: string;
  title: string;            // workshop/course name
  totalAmount: number;
  quantity: number;
  orderMode: string;        // "B2C" | "B2B"
  companyName?: string | null;
  ordererName: string;
  ordererEmail: string;
  ordererPhone?: string | null;
  attendees: Array<{ name: string; email?: string | null }>;
}

// ─── Send orderer confirmation ────────────────────────────────────────────────

export async function sendOrdererConfirmation(payload: OrderEmailPayload) {
  const template = await getTemplate(EmailTemplateType.ORDER_CONFIRMATION_ORDERER);
  const transporter = getTransporter();

  // Build attendee list HTML
  const attendeeListHtml = payload.attendees
    .map(
      (a, i) =>
        `<div style="padding:10px 16px;border-bottom:1px solid #e0e0e0;font-size:13px;background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
          <strong>${i + 1}. ${a.name}</strong>${a.email ? `<span style="color:#888;margin-left:8px">${a.email}</span>` : ''}
        </div>`
    )
    .join('');

  const vars: Record<string, string> = {
    ordererName: payload.ordererName,
    orderNumber: payload.orderNumber,
    title: payload.title,
    totalAmount: payload.totalAmount.toLocaleString('zh-TW'),
    quantity: String(payload.quantity),
    orderMode: payload.orderMode === 'B2B' ? '企業購買' : '個人購買',
    companyName: payload.companyName ?? '',
    attendeeList: attendeeListHtml,
  };

  const subject = renderWithConditionals(template.subject, vars);
  const body = renderWithConditionals(template.body, vars);

  try {
    await transporter.sendMail({
      from: `"ENDAW" <${process.env.GMAIL_USER}>`,
      to: payload.ordererEmail,
      subject,
      html: body,
    });
    await log({
      orderId: payload.orderId,
      toEmail: payload.ordererEmail,
      toName: payload.ordererName,
      subject,
      templateType: EmailTemplateType.ORDER_CONFIRMATION_ORDERER,
      status: 'SENT',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Email] orderer confirmation failed:', msg);
    await log({
      orderId: payload.orderId,
      toEmail: payload.ordererEmail,
      toName: payload.ordererName,
      subject,
      templateType: EmailTemplateType.ORDER_CONFIRMATION_ORDERER,
      status: 'FAILED',
      error: msg,
    });
  }
}

// ─── Send attendee confirmation ───────────────────────────────────────────────

export async function sendAttendeeConfirmations(payload: OrderEmailPayload) {
  const template = await getTemplate(EmailTemplateType.ORDER_CONFIRMATION_ATTENDEE);
  const transporter = getTransporter();

  const emailableAttendees = payload.attendees.filter(
    (a) => a.email && a.email !== payload.ordererEmail
  );

  for (const attendee of emailableAttendees) {
    const vars: Record<string, string> = {
      attendeeName: attendee.name,
      ordererName: payload.ordererName,
      ordererEmail: payload.ordererEmail,
      orderNumber: payload.orderNumber,
      title: payload.title,
    };

    const subject = renderWithConditionals(template.subject, vars);
    const body = renderWithConditionals(template.body, vars);

    try {
      await transporter.sendMail({
        from: `"ENDAW" <${process.env.GMAIL_USER}>`,
        to: attendee.email!,
        subject,
        html: body,
      });
      await log({
        orderId: payload.orderId,
        toEmail: attendee.email!,
        toName: attendee.name,
        subject,
        templateType: EmailTemplateType.ORDER_CONFIRMATION_ATTENDEE,
        status: 'SENT',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Email] attendee confirmation failed:', msg, attendee.email);
      await log({
        orderId: payload.orderId,
        toEmail: attendee.email!,
        toName: attendee.name,
        subject,
        templateType: EmailTemplateType.ORDER_CONFIRMATION_ATTENDEE,
        status: 'FAILED',
        error: msg,
      });
    }
  }
}

// ─── Convenience: send both ───────────────────────────────────────────────────

export async function sendOrderConfirmationEmails(payload: OrderEmailPayload) {
  // Fire both — don't await sequentially to avoid one failure blocking the other
  await Promise.allSettled([
    sendOrdererConfirmation(payload),
    sendAttendeeConfirmations(payload),
  ]);
}
