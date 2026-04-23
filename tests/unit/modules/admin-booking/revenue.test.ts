import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@/server/db';
import { getRevenueSummary } from '@/modules/admin-booking';

async function insertBooking(params: {
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  scheduledAt: Date;
  priceMyrCents: number;
  phoneSuffix: string;
  deleted?: boolean;
}) {
  const service = await prisma.service.findFirstOrThrow({ where: { active: true } });
  const client = await prisma.client.upsert({
    where: { phone: `+6019999${params.phoneSuffix}` },
    update: {},
    create: { phone: `+6019999${params.phoneSuffix}`, name: `Rev ${params.phoneSuffix}`, languagePref: 'en' },
  });
  return prisma.booking.create({
    data: {
      clientId: client.id,
      serviceId: service.id,
      scheduledAt: params.scheduledAt,
      durationMin: service.durationMin,
      locationType: 'studio',
      priceMyrCentsAtBooking: params.priceMyrCents,
      status: params.status,
      paymentStatus: 'unpaid',
      deletedAt: params.deleted ? new Date() : null,
    },
  });
}

describe('getRevenueSummary', () => {
  const created: string[] = [];

  beforeEach(() => {
    // Freeze "now" at 15 Apr 2026 12:00 KL (04:00 UTC)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-15T04:00:00Z'));
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany({ where: { bookingId: { in: created } } });
    await prisma.booking.deleteMany({ where: { id: { in: created } } });
    created.length = 0;
    vi.useRealTimers();
  });

  it('sums confirmed revenue for current KL month only', async () => {
    // In-month confirmed: 500 + 400 = 900 MYR
    const a = await insertBooking({ status: 'confirmed', scheduledAt: new Date('2026-04-10T04:00:00Z'), priceMyrCents: 50000, phoneSuffix: '101' });
    const b = await insertBooking({ status: 'confirmed', scheduledAt: new Date('2026-04-20T04:00:00Z'), priceMyrCents: 40000, phoneSuffix: '102' });
    // Last month confirmed: excluded
    const c = await insertBooking({ status: 'confirmed', scheduledAt: new Date('2026-03-30T04:00:00Z'), priceMyrCents: 30000, phoneSuffix: '103' });
    // In-month pending: excluded from revenue, counted in pending
    const d = await insertBooking({ status: 'pending', scheduledAt: new Date('2026-04-22T04:00:00Z'), priceMyrCents: 20000, phoneSuffix: '104' });
    created.push(a.id, b.id, c.id, d.id);

    const summary = await getRevenueSummary();
    expect(summary.confirmedCentsThisMonth).toBe(90000);
    expect(summary.pendingCount).toBe(1);
  });

  it('excludes rejected and cancelled even in-month', async () => {
    const a = await insertBooking({ status: 'rejected', scheduledAt: new Date('2026-04-10T04:00:00Z'), priceMyrCents: 50000, phoneSuffix: '111' });
    const b = await insertBooking({ status: 'cancelled', scheduledAt: new Date('2026-04-12T04:00:00Z'), priceMyrCents: 60000, phoneSuffix: '112' });
    created.push(a.id, b.id);
    const summary = await getRevenueSummary();
    expect(summary.confirmedCentsThisMonth).toBe(0);
  });

  it('excludes soft-deleted bookings', async () => {
    const a = await insertBooking({ status: 'confirmed', scheduledAt: new Date('2026-04-10T04:00:00Z'), priceMyrCents: 50000, phoneSuffix: '121', deleted: true });
    created.push(a.id);
    const summary = await getRevenueSummary();
    expect(summary.confirmedCentsThisMonth).toBe(0);
  });

  it('counts future confirmed as upcoming', async () => {
    const future = new Date('2026-05-10T04:00:00Z');
    const a = await insertBooking({ status: 'confirmed', scheduledAt: future, priceMyrCents: 50000, phoneSuffix: '131' });
    created.push(a.id);
    const summary = await getRevenueSummary();
    expect(summary.upcomingCount).toBeGreaterThanOrEqual(1);
  });
});
