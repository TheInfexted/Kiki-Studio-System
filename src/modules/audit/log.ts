import { Prisma, AuditAction, BookingStatus, AuditLog } from '@prisma/client';
import { prisma } from '@/server/db';

export type AuditLogEntry = {
  bookingId: string;
  userId?: string | null;
  action: AuditAction;
  fromStatus?: BookingStatus | null;
  toStatus?: BookingStatus | null;
  reason?: string | null;
  meta?: Prisma.InputJsonValue;
};

export async function appendAuditLog(
  tx: Prisma.TransactionClient | typeof prisma,
  entry: AuditLogEntry,
): Promise<AuditLog> {
  return tx.auditLog.create({
    data: {
      bookingId: entry.bookingId,
      userId: entry.userId ?? null,
      action: entry.action,
      fromStatus: entry.fromStatus ?? null,
      toStatus: entry.toStatus ?? null,
      reason: entry.reason ?? null,
      meta: entry.meta ?? Prisma.JsonNull,
    },
  });
}
