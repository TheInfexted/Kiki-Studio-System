'use client';
import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';
import type { WizardState } from './BookingWizard';

export function ReviewStep({ state, turnstileSiteKey, onBack, onSubmitted }: {
  state: WizardState;
  turnstileSiteKey: string;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const { t, lang } = useI18n<Copy>();
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!token || !state.service || !state.slot) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnstileToken: token,
          serviceSlug: state.service.slug,
          scheduledAtIso: state.slot.startAtIso,
          customer: {
            name: state.name,
            phone: state.phone,
            email: state.email || undefined,
            languagePref: lang,
          },
          locationType: 'studio',
          customerNotes: state.notes || undefined,
          website: '', // honeypot
        }),
      });
      if (res.status === 409) { setError(t.booking.errorSlotTaken); return; }
      if (!res.ok) { setError(t.booking.errorTitle); return; }
      onSubmitted();
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review</h3>
      <dl className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        <div className="flex justify-between p-3"><dt>Service</dt><dd>{lang === 'zh' ? state.service?.nameZh : state.service?.nameEn}</dd></div>
        <div className="flex justify-between p-3"><dt>When</dt><dd>{state.slot?.startKl} KL</dd></div>
        <div className="flex justify-between p-3"><dt>Name</dt><dd>{state.name}</dd></div>
        <div className="flex justify-between p-3"><dt>Phone</dt><dd>{state.phone}</dd></div>
      </dl>
      <Turnstile siteKey={turnstileSiteKey} onSuccess={setToken} />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={!token || submitting} onClick={submit}>
          {submitting ? t.booking.submittingFallback : t.booking.submit}
        </Button>
      </div>
    </div>
  );
}
