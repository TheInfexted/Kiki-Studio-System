'use client';
import type { Service } from '@prisma/client';
import { Button } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';
import { formatMYR } from '@/lib/money';

export function ServiceStep({ services, onPick }: { services: Service[]; onPick: (s: Service) => void }) {
  const { lang, t } = useI18n<Copy>();
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">{t.booking.stepService}</h3>
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-4">
            <div>
              <div className="font-medium">{lang === 'zh' ? s.nameZh : s.nameEn}</div>
              <div className="text-sm text-neutral-600">
                {s.durationMin} min · {formatMYR(s.priceMyrCents)}
              </div>
            </div>
            <Button onClick={() => onPick(s)}>Select</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
