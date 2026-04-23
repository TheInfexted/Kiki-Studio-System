import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/server/db';
import { confirmBooking } from '@/modules/admin-booking';

async function createPendingBooking() {
  const service = await prisma.service.findFirstOrThrow({ where: { active: true } });
  const client = await prisma.client.upsert({
    where: { phone: '+60199999002' },
    update: {},
    create: { phone: '+60199999002', name: 'Confirm Test', languagePref: 'en' },
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

describe('confirmBooking', () => {
  let bookingId: string;

  beforeEach(async () => {
    const b = await createPendingBooking();
    bookingId = b.id;
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany({ where: { bookingId } });
    await prisma.booking.delete({ where: { id: bookingId } }).catch(() => undefined);
  });

  it('confirms a pending booking and writes an audit row atomically', async () => {
    const result = await confirmBooking(bookingId, null);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.booking.status).toBe('confirmed');
    expect(result.booking.confirmedAt).toBeInstanceOf(Date);

    const audits = await prisma.auditLog.findMany({
      where: { bookingId, action: 'booking_confirmed' },
    });
    expect(audits.length).toBe(1);
    expect(audits[0]!.fromStatus).toBe('pending');
    expect(audits[0]!.toStatus).toBe('confirmed');
  });

  it('records confirmedByUserId when supplied', async () => {
    const user = await prisma.user.upsert({
      where: { email: 'admin@confirm-test' },
      update: {},
      create: { email: 'admin@confirm-test' },
    });
    const result = await confirmBooking(bookingId, user.id);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok');
    expect(result.booking.confirmedByUserId).toBe(user.id);

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { bookingId, action: 'booking_confirmed' },
    });
    expect(audit.userId).toBe(user.id);
  });

  it('returns already_handled without mutating when status != pending', async () => {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: 'rejected' } });
    const result = await confirmBooking(bookingId, null);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected already_handled');
    expect(result.reason).toBe('already_handled');
    expect(result.status).toBe('rejected');

    const audits = await prisma.auditLog.findMany({
      where: { bookingId, action: 'booking_confirmed' },
    });
    expect(audits.length).toBe(0);
  });

  it('returns not_found for unknown id', async () => {
    const result = await confirmBooking('bkg_does_not_exist', null);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected not_found');
    expect(result.reason).toBe('not_found');
  });

  it('serializes concurrent double-confirm via FOR UPDATE', async () => {
    const [a, b] = await Promise.all([
      confirmBooking(bookingId, null),
      confirmBooking(bookingId, null),
    ]);
    const successes = [a, b].filter((r) => r.ok).length;
    const alreadyHandled = [a, b].filter((r) => !r.ok && r.reason === 'already_handled').length;
    expect(successes).toBe(1);
    expect(alreadyHandled).toBe(1);

    const audits = await prisma.auditLog.findMany({
      where: { bookingId, action: 'booking_confirmed' },
    });
    expect(audits.length).toBe(1);
  });
});
