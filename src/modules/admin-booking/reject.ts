import { Prisma, Booking, Client, Service, BookingStatus } from '@prisma/client';
import { prisma } from '@/server/db';
import { appendAuditLog } from '@/modules/audit';

const MAX_REASON_LEN = 2000;

export type RejectResult =
  | { ok: true; booking: Booking & { client: Client; service: Service } }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'already_handled'; status: BookingStatus };

export async function rejectBooking(
  bookingId: string,
  rejectionReason: string | null,
  byUserId: string | null,
): Promise<RejectResult> {
  const cleanReason = rejectionReason?.trim()
    ? rejectionReason.trim().slice(0, MAX_REASON_LEN)
    : null;

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
        status: 'rejected',
        rejectionReason: cleanReason,
      },
      include: { client: true, service: true },
    });

    await appendAuditLog(tx, {
      bookingId,
      userId: byUserId,
      action: 'booking_rejected',
      fromStatus: 'pending',
      toStatus: 'rejected',
      reason: cleanReason,
    });

    return { ok: true as const, booking: updated };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
