import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/server/db';
import { rejectBooking } from '@/modules/admin-booking';

async function createPendingBooking() {
  const service = await prisma.service.findFirstOrThrow({ where: { active: true } });
  const client = await prisma.client.upsert({
    where: { phone: '+60199999003' },
    update: {},
    create: { phone: '+60199999003', name: 'Reject Test', languagePref: 'en' },
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

describe('rejectBooking', () => {
  let bookingId: string;

  beforeEach(async () => {
    const b = await createPendingBooking();
    bookingId = b.id;
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany({ where: { bookingId } });
    await prisma.booking.delete({ where: { id: bookingId } }).catch(() => undefined);
  });

  it('rejects with reason, persists to booking row and audit', async () => {
    const result = await rejectBooking(bookingId, 'Unavailable that day', null);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.booking.status).toBe('rejected');
    expect(result.booking.rejectionReason).toBe('Unavailable that day');

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { bookingId, action: 'booking_rejected' },
    });
    expect(audit.reason).toBe('Unavailable that day');
    expect(audit.fromStatus).toBe('pending');
    expect(audit.toStatus).toBe('rejected');
  });

  it('accepts null / empty reason', async () => {
    const result = await rejectBooking(bookingId, null, null);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.booking.rejectionReason).toBeNull();
  });

  it('truncates reason above 2000 chars', async () => {
    const long = 'x'.repeat(3000);
    const result = await rejectBooking(bookingId, long, null);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.booking.rejectionReason!.length).toBe(2000);
  });

  it('returns already_handled if status != pending', async () => {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: 'confirmed' } });
    const result = await rejectBooking(bookingId, 'late', null);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected already_handled');
    expect(result.reason).toBe('already_handled');
  });
});
