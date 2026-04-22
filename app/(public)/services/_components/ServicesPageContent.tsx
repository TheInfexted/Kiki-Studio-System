'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { formatMYR } from '@/lib/money';
import type { Copy } from '@/content/kiki';
import type { ServiceDisplay } from '@/ui';

interface Props {
  services: ServiceDisplay[];
}

export function ServicesPageContent({ services }: Props) {
  const { lang, t } = useI18n<Copy>();

  return (
    <main className="bg-cream pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="eyebrow mb-4">{t.services.eyebrow}</p>
          <h1 className="headline text-4xl md:text-5xl mb-3">
            {t.pages.servicesTitle}
          </h1>
          <p className="font-sans text-base text-warmbrown">
            {t.pages.servicesSubtitle}
          </p>
        </div>
        <ul className="grid gap-4">
          {services.map((s) => (
            <li
              key={s.slug}
              className="rounded-2xl border border-tan/40 bg-cream p-6 md:p-7 hover:bg-surface transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl md:text-2xl text-espresso mb-1">
                    {lang === 'zh' ? s.nameZh : s.nameEn}
                  </h2>
                  <p className="font-sans text-sm text-warmbrown leading-relaxed mb-3">
                    {lang === 'zh' ? s.descriptionZh : s.descriptionEn}
                  </p>
                  <p className="font-sans text-xs text-caramel uppercase tracking-wider">
                    {s.durationMin} {t.pages.durationUnitShort}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="font-serif text-2xl text-espresso">
                    {formatMYR(s.priceMyrCents)}
                  </span>
                  <Link
                    href={`/book?service=${s.slug}`}
                    className="font-sans text-xs font-semibold uppercase tracking-wider text-caramel hover:text-espresso whitespace-nowrap transition-colors"
                  >
                    {t.pages.servicesBookLabel} →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
