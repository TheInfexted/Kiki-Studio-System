'use client';

import { useTransition } from 'react';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';
import { resendFromDashboard } from '../_actions';

export function NotifyFailedBanner({ entries }: { entries: { bookingId: string; clientName: string }[] }) {
  const { t } = useI18n<Copy>();
  const [pending, startTransition] = useTransition();

  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
      {entries.map((e) => (
        <div key={e.bookingId} className="flex items-center justify-between text-sm">
          <span>{t.admin.booking.notifyFailedBanner.replace('{name}', e.clientName)}</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(async () => { await resendFromDashboard(e.bookingId); })}
            className="btn-ghost text-xs"
          >
            {t.admin.booking.resendAction}
          </button>
        </div>
      ))}
    </div>
  );
}
