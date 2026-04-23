import type { Booking, Client, Service } from '@prisma/client';
import { prisma } from '@/server/db';
import {
  sendBookingConfirmedEmail,
  sendBookingRejectedEmail,
  type BookingEmailContext,
} from '@/modules/notifications';
import { appendAuditLog } from '@/modules/audit';
import { formatKl } from '@/lib/date';

export type NotifyOutcome =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

function buildEmailContext(booking: Booking & { client: Client; service: Service }): BookingEmailContext {
  const isZh = booking.client.languagePref === 'zh';
  return {
    bookingId: booking.id,
    customerName: booking.client.name,
    customerPhone: booking.client.phone,
    customerEmail: booking.client.email ?? undefined,
    serviceName: isZh ? booking.service.nameZh : booking.service.nameEn,
    scheduledAtKl: formatKl(booking.scheduledAt, 'd MMM yyyy, h:mma'),
    durationMin: booking.durationMin,
    priceMyrCents: booking.priceMyrCentsAtBooking,
    locationSummary: booking.locationType,
    customerNotes: booking.customerNotes ?? undefined,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    lang: booking.client.languagePref,
  };
}

async function trySend(fn: () => Promise<{ id: string }>): Promise<NotifyOutcome> {
  try {
    const { id } = await fn();
    return { ok: true, messageId: id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg.slice(0, 500) };
  }
}

export async function notifyBookingConfirmed(
  booking: Booking & { client: Client; service: Service },
): Promise<NotifyOutcome> {
  if (!booking.client.email) return { ok: false, error: 'customer_has_no_email' };
  const ctx = buildEmailContext(booking);
  const result = await trySend(() => sendBookingConfirmedEmail({ to: booking.client.email!, context: ctx }));
  await appendAuditLog(prisma, {
    bookingId: booking.id,
    action: result.ok ? 'notify_sent' : 'notify_failed',
    reason: result.ok ? null : result.error,
    meta: result.ok ? { messageId: result.messageId, kind: 'confirmed' } : { kind: 'confirmed' },
  });
  return result;
}

export async function notifyBookingRejected(
  booking: Booking & { client: Client; service: Service },
  reason: string | null,
): Promise<NotifyOutcome> {
  if (!booking.client.email) return { ok: false, error: 'customer_has_no_email' };
  const ctx = buildEmailContext(booking);
  const result = await trySend(() =>
    sendBookingRejectedEmail({ to: booking.client.email!, reason, context: ctx }),
  );
  await appendAuditLog(prisma, {
    bookingId: booking.id,
    action: result.ok ? 'notify_sent' : 'notify_failed',
    reason: result.ok ? null : result.error,
    meta: result.ok ? { messageId: result.messageId, kind: 'rejected' } : { kind: 'rejected' },
  });
  return result;
}

export async function resendNotification(bookingId: string): Promise<NotifyOutcome> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { client: true, service: true },
  });
  if (!booking) return { ok: false, error: 'not_found' };
  if (booking.status === 'confirmed') return notifyBookingConfirmed(booking);
  if (booking.status === 'rejected') return notifyBookingRejected(booking, booking.rejectionReason);
  return { ok: false, error: `cannot_resend_for_status_${booking.status}` };
}
