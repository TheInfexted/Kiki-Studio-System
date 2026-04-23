import { verifyBookingAction } from '@/lib/signed-url';
import { prisma } from '@/server/db';
import { copyEn, type Copy } from '@/content/kiki';
import { handleConfirmFromLink, handleRejectFromLink } from './_actions';

export const dynamic = 'force-dynamic';

interface BookingSummaryData {
  client: { name: string };
  service: { nameEn: string };
  scheduledAt: Date;
  priceMyrCentsAtBooking: number;
  durationMin: number;
}

export default async function BookingActionPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { result?: string; notify?: string };
}) {
  const t = copyEn;
  const parsed = verifyBookingAction(params.token);

  if (!parsed.ok) {
    return (
      <section className="text-center space-y-2">
        <h1 className="headline text-2xl">
          {parsed.reason === 'expired' ? t.admin.actions.expiredLink : t.admin.actions.invalidLink}
        </h1>
      </section>
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.bookingId },
    include: { client: true, service: true },
  });

  if (!booking || booking.deletedAt) {
    return (
      <section className="text-center space-y-2">
        <h1 className="headline text-2xl">{t.admin.actions.notFound}</h1>
      </section>
    );
  }

  if (searchParams.result === 'confirmed') {
    return (
      <section className="text-center space-y-2">
        <h1 className="headline text-2xl">{t.admin.actions.confirmedHeading}</h1>
        <p className="text-warmbrown">
          {searchParams.notify === 'fail'
            ? t.admin.actions.confirmedBodyWithNotifyFail
            : t.admin.actions.confirmedBodyWithNotifyOk}
        </p>
      </section>
    );
  }
  if (searchParams.result === 'rejected') {
    return (
      <section className="text-center space-y-2">
        <h1 className="headline text-2xl">{t.admin.actions.rejectedHeading}</h1>
      </section>
    );
  }
  if (searchParams.result === 'already' || booking.status !== 'pending') {
    return (
      <section className="text-center space-y-2">
        <h1 className="headline text-xl">{t.admin.booking.alreadyHandled}</h1>
        <p className="text-warmbrown text-sm">
          {t.admin.booking.statusLabels[booking.status as keyof typeof t.admin.booking.statusLabels]}
        </p>
      </section>
    );
  }

  if (parsed.action === 'confirm') {
    const confirmWithToken = handleConfirmFromLink.bind(null, params.token);
    return (
      <section className="space-y-4">
        <h1 className="headline text-2xl text-center">{t.admin.actions.confirmHeading}</h1>
        <p className="text-warmbrown text-sm text-center">{t.admin.actions.confirmBody}</p>
        <BookingSummary booking={booking} t={t} />
        <form action={confirmWithToken}>
          <button type="submit" className="btn-primary w-full">{t.admin.actions.confirmButton}</button>
        </form>
      </section>
    );
  }

  const rejectWithToken = handleRejectFromLink.bind(null, params.token);
  return (
    <section className="space-y-4">
      <h1 className="headline text-2xl text-center">{t.admin.actions.rejectHeading}</h1>
      <p className="text-warmbrown text-sm text-center">{t.admin.actions.rejectBody}</p>
      <BookingSummary booking={booking} t={t} />
      <form
        action={async (formData: FormData) => {
          'use server';
          const reason = formData.get('reason');
          await rejectWithToken(typeof reason === 'string' && reason.trim() ? reason : null);
        }}
        className="space-y-3"
      >
        <label className="block">
          <span className="text-sm font-medium">{t.admin.booking.rejectReasonLabel}</span>
          <textarea
            name="reason"
            placeholder={t.admin.booking.rejectReasonPlaceholder}
            maxLength={2000}
            rows={3}
            className="mt-1 block w-full rounded border border-tan px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="btn-primary w-full">{t.admin.actions.rejectButton}</button>
      </form>
    </section>
  );
}

function BookingSummary({ booking, t }: { booking: BookingSummaryData; t: Copy }) {
  return (
    <dl className="grid grid-cols-[100px_1fr] gap-y-1 text-sm bg-cream rounded p-3">
      <dt className="text-warmbrown">Customer</dt>
      <dd>{booking.client.name}</dd>
      <dt className="text-warmbrown">Service</dt>
      <dd>{booking.service.nameEn}</dd>
      <dt className="text-warmbrown">Duration</dt>
      <dd>{booking.durationMin} {t.admin.booking.durationUnit}</dd>
    </dl>
  );
}
