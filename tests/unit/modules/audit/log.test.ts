import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/server/db';
import { appendAuditLog } from '@/modules/audit';
import type { Booking } from '@prisma/client';

async function createTestBooking(): Promise<Booking> {
  const service = await prisma.service.findFirstOrThrow({ where: { active: true } });
  const client = await prisma.client.upsert({
    where: { phone: '+60199999001' },
    update: {},
    create: { phone: '+60199999001', name: 'Test User', languagePref: 'en' },
  });
  return prisma.booking.create({
    data: {
      clientId: client.id,
      serviceId: service.id,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      durationMin: service.durationMin,
      locationType: 'studio',
      priceMyrCentsAtBooking: service.priceMyrCents,
      status: 'pending',
      paymentStatus: 'unpaid',
    },
  });
}

describe('appendAuditLog', () => {
  let bookingId: string;

  beforeEach(async () => {
    const b = await createTestBooking();
    bookingId = b.id;
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany({ where: { bookingId } });
    await prisma.booking.delete({ where: { id: bookingId } });
  });

  it('appends an entry using the top-level prisma client', async () => {
    const row = await appendAuditLog(prisma, {
      bookingId,
      action: 'booking_confirmed',
      fromStatus: 'pending',
      toStatus: 'confirmed',
    });
    expect(row.bookingId).toBe(bookingId);
    expect(row.action).toBe('booking_confirmed');
    expect(row.fromStatus).toBe('pending');
    expect(row.toStatus).toBe('confirmed');
    expect(row.userId).toBeNull();
    expect(row.reason).toBeNull();
  });

  it('participates in a transaction and rolls back', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await appendAuditLog(tx, {
          bookingId,
          action: 'booking_rejected',
          fromStatus: 'pending',
          toStatus: 'rejected',
        });
        throw new Error('deliberate rollback');
      }),
    ).rejects.toThrow('deliberate rollback');

    const count = await prisma.auditLog.count({ where: { bookingId, action: 'booking_rejected' } });
    expect(count).toBe(0);
  });

  it('stores meta JSON and reason', async () => {
    const row = await appendAuditLog(prisma, {
      bookingId,
      action: 'notify_failed',
      reason: 'Resend error: rate_limited',
      meta: { retryCount: 2, endpoint: 'resend' },
    });
    expect(row.reason).toBe('Resend error: rate_limited');
    expect(row.meta).toEqual({ retryCount: 2, endpoint: 'resend' });
  });
});
