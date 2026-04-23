import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderNewBookingAdminEmail, renderCustomerConfirmationEmail } from '@/modules/notifications';

describe('email templates', () => {
  const baseCtx = {
    bookingId: 'bk_123',
    customerName: 'Aisha',
    customerPhone: '+60179202880',
    customerEmail: 'aisha@example.com',
    serviceName: 'Bridal Standard',
    scheduledAtKl: '2026-05-01 14:00',
    durationMin: 180,
    priceMyrCents: 80000,
    locationSummary: 'Studio · Kepong, KL',
    customerNotes: 'Soft glam',
    siteUrl: 'https://kiki.studio',
    lang: 'en' as const,
  };

  it('admin email includes every booking detail', () => {
    const { subject, html, text } = renderNewBookingAdminEmail(baseCtx);
    expect(subject).toMatch(/New booking/);
    expect(html).toContain('Aisha');
    expect(html).toContain('+60179202880');
    expect(html).toContain('Bridal Standard');
    expect(html).toContain('2026-05-01 14:00');
    expect(html).toContain('RM 800.00');
    expect(text).toContain('Aisha');
  });

  it('customer email excludes admin-only fields', () => {
    const { subject, html } = renderCustomerConfirmationEmail(baseCtx);
    expect(subject).toMatch(/Booking request received/);
    expect(html).toContain('Aisha');
    expect(html).toContain('Bridal Standard');
    expect(html).toContain('2026-05-01 14:00');
    expect(html).not.toContain('+60179202880');
  });

  it('renders chinese copy when lang is zh', () => {
    const { subject, html } = renderCustomerConfirmationEmail({ ...baseCtx, lang: 'zh' });
    expect(subject).toMatch(/已收到/);
    expect(html).toMatch(/Aisha/);
  });

  it('escapes HTML in user-controlled fields (admin email)', () => {
    const { html } = renderNewBookingAdminEmail({
      ...baseCtx,
      customerName: '<img src=x onerror=alert(1)>',
      customerNotes: '<script>bad</script>',
      locationSummary: 'Studio <b>HQ</b>',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>HQ</b>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;');
  });

  it('escapes HTML in customerName greeting (customer email)', () => {
    const { html } = renderCustomerConfirmationEmail({
      ...baseCtx,
      customerName: '<script>x</script>',
    });
    expect(html).not.toContain('<script>x</script>');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
  });
});

vi.mock('@/server/email', () => ({ sendEmail: vi.fn(async () => ({ id: 'res_1' })) }));

import { sendBookingCreatedNotifications } from '@/modules/notifications';

describe('sendBookingCreatedNotifications', () => {
  beforeEach(async () => {
    const { sendEmail } = await import('@/server/email');
    (sendEmail as unknown as { mockClear: () => void }).mockClear();
  });

  it('sends both admin and customer emails', async () => {
    const { sendEmail } = await import('@/server/email');
    const result = await sendBookingCreatedNotifications({
      adminEmails: ['kiki@studio.com'],
      customerEmail: 'aisha@example.com',
      context: {
        bookingId: 'bk_123',
        customerName: 'Aisha',
        customerPhone: '+60179202880',
        serviceName: 'Bridal Standard',
        scheduledAtKl: '2026-05-01 14:00',
        durationMin: 180,
        priceMyrCents: 80000,
        locationSummary: 'Studio',
        siteUrl: 'https://kiki.studio',
        lang: 'en',
      },
    });
    expect(result.adminResult.id).toBe('res_1');
    expect(result.customerResult?.id).toBe('res_1');
    expect((sendEmail as any).mock.calls.length).toBe(2);
  });

  it('skips customer email when no address provided', async () => {
    const result = await sendBookingCreatedNotifications({
      adminEmails: ['kiki@studio.com'],
      customerEmail: undefined,
      context: {
        bookingId: 'bk_456',
        customerName: 'Aisha',
        customerPhone: '+60179202880',
        serviceName: 'Bridal',
        scheduledAtKl: '2026-05-01 14:00',
        durationMin: 60,
        priceMyrCents: 25000,
        locationSummary: 'Studio',
        siteUrl: 'https://kiki.studio',
        lang: 'en',
      },
    });
    expect(result.customerResult).toBeNull();
  });
});
