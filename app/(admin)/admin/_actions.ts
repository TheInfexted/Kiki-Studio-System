'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import {
  confirmBooking,
  rejectBooking,
  resendNotification,
  notifyBookingConfirmed,
  notifyBookingRejected,
} from '@/modules/admin-booking';

export async function confirmFromDashboard(bookingId: string): Promise<{ ok: boolean; message?: string }> {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const result = await confirmBooking(bookingId, userId ?? null);
  if (!result.ok) {
    return { ok: false, message: result.reason === 'already_handled' ? `already_${result.status}` : result.reason };
  }
  await notifyBookingConfirmed(result.booking);
  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectFromDashboard(bookingId: string, reason: string | null): Promise<{ ok: boolean; message?: string }> {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const result = await rejectBooking(bookingId, reason, userId ?? null);
  if (!result.ok) {
    return { ok: false, message: result.reason === 'already_handled' ? `already_${result.status}` : result.reason };
  }
  await notifyBookingRejected(result.booking, reason);
  revalidatePath('/admin');
  return { ok: true };
}

export async function resendFromDashboard(bookingId: string): Promise<{ ok: boolean; message?: string }> {
  const result = await resendNotification(bookingId);
  revalidatePath('/admin');
  return result.ok ? { ok: true } : { ok: false, message: result.error };
}
