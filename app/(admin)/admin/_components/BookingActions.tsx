'use client';

import { useState, useTransition } from 'react';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';
import { confirmFromDashboard, rejectFromDashboard } from '../_actions';

export function BookingActions({ bookingId }: { bookingId: string }) {
  const { t } = useI18n<Copy>();
  const [pending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmFromDashboard(bookingId);
      if (!result.ok) setError(result.message ?? 'error');
    });
  }

  function onRejectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await rejectFromDashboard(bookingId, reason.trim() || null);
      if (!result.ok) setError(result.message ?? 'error');
      else setShowRejectForm(false);
    });
  }

  if (showRejectForm) {
    return (
      <form onSubmit={onRejectSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-medium">{t.admin.booking.rejectReasonLabel}</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t.admin.booking.rejectReasonPlaceholder}
            maxLength={2000}
            className="mt-1 block w-full rounded border border-tan px-3 py-2 text-sm"
            rows={3}
          />
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="btn-primary text-sm">
            {pending ? t.admin.booking.rejecting : t.admin.booking.rejectSubmit}
          </button>
          <button type="button" onClick={() => setShowRejectForm(false)} className="btn-ghost text-sm">
            {t.admin.booking.rejectCancel}
          </button>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    );
  }

  return (
    <div className="mt-4 flex gap-2">
      <button type="button" onClick={onConfirm} disabled={pending} className="btn-primary text-sm">
        {pending ? t.admin.booking.confirming : t.admin.booking.confirmAction}
      </button>
      <button type="button" onClick={() => setShowRejectForm(true)} disabled={pending} className="btn-ghost text-sm">
        {t.admin.booking.rejectAction}
      </button>
      {error && <p className="text-sm text-red-700 self-center">{error}</p>}
    </div>
  );
}
