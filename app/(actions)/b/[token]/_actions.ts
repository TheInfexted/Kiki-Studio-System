'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { verifyBookingAction } from '@/lib/signed-url';
import {
  confirmBooking,
  rejectBooking,
  notifyBookingConfirmed,
  notifyBookingRejected,
} from '@/modules/admin-booking';

export async function handleConfirmFromLink(token: string): Promise<void> {
  const parsed = verifyBookingAction(token);
  if (!parsed.ok || parsed.action !== 'confirm') redirect(`/b/${token}?result=invalid`);

  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const result = await confirmBooking(parsed.bookingId, userId ?? null);

  if (!result.ok) {
    if (result.reason === 'already_handled') redirect(`/b/${token}?result=already`);
    redirect(`/b/${token}?result=error`);
  }
  const notify = await notifyBookingConfirmed(result.booking);
  redirect(`/b/${token}?result=confirmed&notify=${notify.ok ? 'ok' : 'fail'}`);
}

export async function handleRejectFromLink(token: string, reason: string | null): Promise<void> {
  const parsed = verifyBookingAction(token);
  if (!parsed.ok || parsed.action !== 'reject') redirect(`/b/${token}?result=invalid`);

  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const result = await rejectBooking(parsed.bookingId, reason, userId ?? null);

  if (!result.ok) {
    if (result.reason === 'already_handled') redirect(`/b/${token}?result=already`);
    redirect(`/b/${token}?result=error`);
  }
  const notify = await notifyBookingRejected(result.booking, reason);
  redirect(`/b/${token}?result=rejected&notify=${notify.ok ? 'ok' : 'fail'}`);
}
