import { describe, it, expect } from 'vitest';
import {
  renderBookingConfirmedEmail,
  renderBookingRejectedEmail,
  type BookingEmailContext,
} from '@/modules/notifications/email-templates';

const baseCtx: BookingEmailContext = {
  bookingId: 'bkg_abc',
  customerName: 'Sarah',
  customerPhone: '+60123456789',
  customerEmail: 'sarah@test',
  serviceName: 'Party Makeup',
  scheduledAtKl: '9 May 2026, 6:00pm',
  durationMin: 60,
  priceMyrCents: 40000,
  locationSummary: 'Studio',
  siteUrl: 'https://example.com',
  lang: 'en',
};

describe('renderBookingConfirmedEmail', () => {
  it('produces EN subject + body', () => {
    const r = renderBookingConfirmedEmail(baseCtx);
    expect(r.subject).toContain('confirmed');
    expect(r.html).toContain('Sarah');
    expect(r.text).toContain('Party Makeup');
  });
  it('produces ZH variant', () => {
    const r = renderBookingConfirmedEmail({ ...baseCtx, lang: 'zh' });
    expect(r.subject).toContain('已确认');
    expect(r.html).toContain('您好');
  });
});

describe('renderBookingRejectedEmail', () => {
  it('omits reason block when reason is null', () => {
    const r = renderBookingRejectedEmail(baseCtx, null);
    expect(r.html).not.toContain('Kiki shared this note');
    expect(r.text).not.toContain('Kiki shared');
  });
  it('includes reason block when reason present', () => {
    const r = renderBookingRejectedEmail(baseCtx, 'Fully booked that weekend');
    expect(r.html).toContain('Kiki shared this note');
    expect(r.html).toContain('Fully booked that weekend');
    expect(r.text).toContain('Fully booked that weekend');
  });
  it('escapes HTML in reason to prevent injection', () => {
    const r = renderBookingRejectedEmail(baseCtx, '<script>alert(1)</script>');
    expect(r.html).not.toContain('<script>');
    expect(r.html).toContain('&lt;script&gt;');
  });
});
