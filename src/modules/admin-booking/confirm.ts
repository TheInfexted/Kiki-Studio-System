import { Prisma, Booking, Client, Service, BookingStatus } from '@prisma/client';
import { prisma } from '@/server/db';
import { appendAuditLog } from '@/modules/audit';

export type ConfirmResult =
  | { ok: true; booking: Booking & { client: Client; service: Service } }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'already_handled'; status: BookingStatus };

export async function confirmBooking(
  bookingId: string,
  byUserId: string | null,
): Promise<ConfirmResult> {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ id: string; status: BookingStatus }>>(
      Prisma.sql`SELECT id, status FROM \`Booking\` WHERE id = ${bookingId} AND deletedAt IS NULL FOR UPDATE`,
    );
    if (locked.length === 0) return { ok: false as const, reason: 'not_found' as const };
    const current = locked[0]!;
    if (current.status !== 'pending') {
      return { ok: false as const, reason: 'already_handled' as const, status: current.status };
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedByUserId: byUserId,
      },
      include: { client: true, service: true },
    });

    await appendAuditLog(tx, {
      bookingId,
      userId: byUserId,
      action: 'booking_confirmed',
      fromStatus: 'pending',
      toStatus: 'confirmed',
    });

    return { ok: true as const, booking: updated };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
