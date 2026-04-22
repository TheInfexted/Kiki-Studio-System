import { describe, it, expect, vi } from 'vitest';
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
});

vi.mock('@/server/email', () => ({ sendEmail: vi.fn(async () => ({ id: 'res_1' })) }));

import { sendBookingCreatedNotifications } from '@/modules/notifications';

describe('sendBookingCreatedNotifications', () => {
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
