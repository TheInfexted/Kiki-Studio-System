import { formatMYR } from '@/lib/money';

export type Lang = 'en' | 'zh';

export interface BookingEmailContext {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  scheduledAtKl: string;
  durationMin: number;
  priceMyrCents: number;
  locationSummary: string;
  customerNotes?: string;
  siteUrl: string;
  lang: Lang;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;color:#6b6b6b;">${label}</td><td style="padding:6px 12px;font-weight:600;">${value}</td></tr>`;
}

export function renderNewBookingAdminEmail(ctx: BookingEmailContext): { subject: string; html: string; text: string } {
  const subject = `New booking · ${ctx.serviceName} · ${ctx.scheduledAtKl}`;
  const price = formatMYR(ctx.priceMyrCents);
  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;">
    <h2 style="color:#8a4a36;">New booking request</h2>
    <table style="width:100%;border-collapse:collapse;background:#fdf7f4;">
      ${row('Customer', ctx.customerName)}
      ${row('Phone', ctx.customerPhone)}
      ${row('Email', ctx.customerEmail ?? '—')}
      ${row('Service', ctx.serviceName)}
      ${row('When (KL)', ctx.scheduledAtKl)}
      ${row('Duration', `${ctx.durationMin} min`)}
      ${row('Location', ctx.locationSummary)}
      ${row('Price', price)}
      ${ctx.customerNotes ? row('Notes', ctx.customerNotes.replace(/</g, '&lt;')) : ''}
    </table>
    <p style="margin-top:16px;color:#6b6b6b;font-size:12px;">Booking ID: ${ctx.bookingId}</p>
  </div>`;
  const text = [
    `New booking request`,
    `Customer: ${ctx.customerName}`,
    `Phone: ${ctx.customerPhone}`,
    `Email: ${ctx.customerEmail ?? '-'}`,
    `Service: ${ctx.serviceName}`,
    `When (KL): ${ctx.scheduledAtKl}`,
    `Duration: ${ctx.durationMin} min`,
    `Location: ${ctx.locationSummary}`,
    `Price: ${price}`,
    ctx.customerNotes ? `Notes: ${ctx.customerNotes}` : '',
    `Booking ID: ${ctx.bookingId}`,
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

export function renderCustomerConfirmationEmail(ctx: BookingEmailContext): { subject: string; html: string; text: string } {
  const isZh = ctx.lang === 'zh';
  const subject = isZh
    ? `已收到您的预订请求 · ${ctx.serviceName}`
    : `Booking request received · ${ctx.serviceName}`;
  const greeting = isZh ? `您好 ${ctx.customerName}` : `Hi ${ctx.customerName}`;
  const intro = isZh
    ? 'Kiki 已收到您的预订请求,将尽快通过 WhatsApp 确认。'
    : 'Kiki has received your request and will confirm via WhatsApp shortly.';
  const detailsHeader = isZh ? '预订详情' : 'Booking details';
  const price = formatMYR(ctx.priceMyrCents);
  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;">
    <h2 style="color:#8a4a36;">${greeting}</h2>
    <p>${intro}</p>
    <h3 style="margin-top:24px;">${detailsHeader}</h3>
    <table style="width:100%;border-collapse:collapse;background:#fdf7f4;">
      ${row(isZh ? '服务' : 'Service', ctx.serviceName)}
      ${row(isZh ? '时间(KL)' : 'When (KL)', ctx.scheduledAtKl)}
      ${row(isZh ? '时长' : 'Duration', `${ctx.durationMin} min`)}
      ${row(isZh ? '地点' : 'Location', ctx.locationSummary)}
      ${row(isZh ? '价格' : 'Price', price)}
    </table>
    <p style="margin-top:24px;"><a href="${ctx.siteUrl}" style="color:#8a4a36;">${ctx.siteUrl}</a></p>
  </div>`;
  const text = [
    greeting,
    '',
    intro,
    '',
    `${detailsHeader}:`,
    `- ${isZh ? '服务' : 'Service'}: ${ctx.serviceName}`,
    `- ${isZh ? '时间(KL)' : 'When (KL)'}: ${ctx.scheduledAtKl}`,
    `- ${isZh ? '时长' : 'Duration'}: ${ctx.durationMin} min`,
    `- ${isZh ? '地点' : 'Location'}: ${ctx.locationSummary}`,
    `- ${isZh ? '价格' : 'Price'}: ${price}`,
    '',
    ctx.siteUrl,
  ].join('\n');
  return { subject, html, text };
}
