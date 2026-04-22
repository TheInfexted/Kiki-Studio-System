'use client';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';

export function SuccessPanel() {
  const { t } = useI18n<Copy>();
  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold text-brand-700">{t.booking.successTitle}</h3>
      <p className="mt-2 text-neutral-700">{t.booking.successBody}</p>
    </div>
  );
}
