import { formatMYR } from '@/lib/money';
import { formatKl } from '@/lib/date';
import { copyEn } from '@/content/kiki';
import type { BookingListResult, BookingListItem } from '@/modules/admin-booking';
import { BookingActions } from './BookingActions';

export function BookingsInbox({
  result,
  tab,
  query,
}: {
  result: BookingListResult;
  tab: 'pending' | 'upcoming' | 'past';
  query: string;
}) {
  const t = copyEn;

  return (
    <section>
      <nav className="flex gap-3 mb-6 border-b border-tan">
        {(['pending', 'upcoming', 'past'] as const).map((tn) => (
          <a
            key={tn}
            href={`/admin?tab=${tn}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
            className={`px-3 py-2 -mb-px border-b-2 ${tab === tn ? 'border-espresso font-semibold' : 'border-transparent text-warmbrown'}`}
          >
            {t.admin.tabs[tn]}
          </a>
        ))}
      </nav>

      <form method="get" action="/admin" className="mb-6 flex gap-2 max-w-md">
        <input type="hidden" name="tab" value={tab} />
        <input
          name="q"
          defaultValue={query}
          placeholder={t.admin.search.placeholder}
          className="flex-1 rounded border border-tan px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-ghost text-sm">{t.admin.search.submit}</button>
      </form>

      {result.items.length === 0 ? (
        <p className="text-sm text-warmbrown">{t.admin.search.noResults}</p>
      ) : (
        <ul className="space-y-3">
          {result.items.map((b) => (
            <BookingRow key={b.id} booking={b} tab={tab} />
          ))}
        </ul>
      )}

      {tab !== 'pending' && result.totalPages > 1 && (
        <nav className="mt-6 flex gap-4 text-sm">
          {result.page > 1 && (
            <a href={`/admin?tab=${tab}&page=${result.page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`}>
              {t.admin.pagination.previous}
            </a>
          )}
          <span className="text-warmbrown">
            {t.admin.pagination.pageOf
              .replace('{current}', String(result.page))
              .replace('{total}', String(result.totalPages))}
          </span>
          {result.page < result.totalPages && (
            <a href={`/admin?tab=${tab}&page=${result.page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}`}>
              {t.admin.pagination.next}
            </a>
          )}
        </nav>
      )}
    </section>
  );
}

function BookingRow({ booking, tab }: { booking: BookingListItem; tab: string }) {
  const t = copyEn;
  const isPending = booking.status === 'pending';
  return (
    <li className="rounded-xl border border-tan bg-white">
      <details>
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
          <div className="flex items-center gap-3">
            <StatusBadge status={booking.status} />
            <span className="font-medium">{booking.client.name}</span>
            <span className="text-sm text-warmbrown">{booking.service.nameEn}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>{formatKl(booking.scheduledAt, 'd MMM, h:mma')}</span>
            <span className="font-semibold">{formatMYR(booking.priceMyrCentsAtBooking)}</span>
          </div>
        </summary>
        <div className="px-4 py-4 border-t border-tan text-sm space-y-2">
          <dl className="grid grid-cols-[120px_1fr] gap-y-1">
            <dt className="text-warmbrown">Phone</dt>
            <dd>{booking.client.phone}</dd>
            <dt className="text-warmbrown">Email</dt>
            <dd>{booking.client.email ?? '—'}</dd>
            <dt className="text-warmbrown">Duration</dt>
            <dd>{booking.durationMin} {t.admin.booking.durationUnit}</dd>
            <dt className="text-warmbrown">Location</dt>
            <dd>{t.admin.booking.locationLabels[booking.locationType as keyof typeof t.admin.booking.locationLabels]}</dd>
            {booking.customerNotes && (
              <>
                <dt className="text-warmbrown">{t.admin.booking.customerNoteHeader}</dt>
                <dd>{booking.customerNotes}</dd>
              </>
            )}
            {booking.rejectionReason && (
              <>
                <dt className="text-warmbrown">Rejection reason</dt>
                <dd>{booking.rejectionReason}</dd>
              </>
            )}
          </dl>

          {booking.auditLogs.length > 0 && (
            <div>
              <p className="text-warmbrown mb-1">{t.admin.booking.auditTrailHeader}</p>
              <ul className="text-xs space-y-0.5">
                {booking.auditLogs.map((a) => (
                  <li key={a.id}>
                    <span className="text-warmbrown">{formatKl(a.createdAt, 'd MMM, h:mma')}</span>
                    {' — '}
                    {t.admin.audit.events[a.action as keyof typeof t.admin.audit.events] ?? a.action}
                    {a.reason && `: ${a.reason}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isPending && <BookingActions bookingId={booking.id} />}
        </div>
      </details>
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-slate-100 text-slate-500',
    no_show: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes[status] ?? 'bg-slate-100'}`}>
      {status}
    </span>
  );
}
