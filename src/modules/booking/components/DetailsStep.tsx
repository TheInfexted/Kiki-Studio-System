'use client';
import { Button, Input } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';
import type { WizardState } from './BookingWizard';

export function DetailsStep({ state, onChange, onNext, onBack }: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n<Copy>();
  const canProceed = state.name.trim().length >= 2 && state.phone.trim().length >= 7;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t.booking.stepDetails}</h3>
      <Input name="name" label={t.booking.nameLabel} value={state.name} onChange={(e) => onChange({ name: e.target.value })} />
      <Input name="phone" label={t.booking.phoneLabel} value={state.phone} onChange={(e) => onChange({ phone: e.target.value })} />
      <Input name="email" type="email" label={t.booking.emailLabel} value={state.email} onChange={(e) => onChange({ email: e.target.value })} />
      <Input name="notes" label={t.booking.notesLabel} value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} />
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={!canProceed} onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
