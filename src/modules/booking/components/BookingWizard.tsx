'use client';
import { useState } from 'react';
import type { Service } from '@prisma/client';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';
import { Card } from '@/ui';
import { ServiceStep } from './ServiceStep';
import { SlotStep } from './SlotStep';
import { DetailsStep } from './DetailsStep';
import { ReviewStep } from './ReviewStep';
import { SuccessPanel } from './SuccessPanel';

export interface WizardState {
  service: Service | null;
  slot: { startKl: string; startAtIso: string } | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export function BookingWizard({ services, turnstileSiteKey }: { services: Service[]; turnstileSiteKey: string }) {
  const { t } = useI18n<Copy>();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [state, setState] = useState<WizardState>({
    service: null, slot: null, name: '', phone: '', email: '', notes: '',
  });

  function patch(p: Partial<WizardState>) { setState(s => ({ ...s, ...p })); }

  return (
    <Card className="mx-auto max-w-xl">
      <h2 className="mb-6 font-display text-2xl text-brand-700">{t.booking.title}</h2>
      {step === 1 && <ServiceStep services={services} onPick={(s) => { patch({ service: s }); setStep(2); }} />}
      {step === 2 && state.service && (
        <SlotStep
          serviceSlug={state.service.slug}
          onPick={(slot) => { patch({ slot }); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <DetailsStep
          state={state}
          onChange={patch}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <ReviewStep
          state={state}
          turnstileSiteKey={turnstileSiteKey}
          onBack={() => setStep(3)}
          onSubmitted={() => setStep(5)}
        />
      )}
      {step === 5 && <SuccessPanel />}
    </Card>
  );
}
