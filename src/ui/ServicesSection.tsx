'use client';

import type { Service } from '@prisma/client';

export type ServiceDisplay = Pick<
  Service,
  | 'slug'
  | 'nameEn'
  | 'nameZh'
  | 'descriptionEn'
  | 'descriptionZh'
  | 'priceMyrCents'
  | 'durationMin'
  | 'category'
>;

export interface ServicesSectionCopy {
  eyebrow: string;
  title: string;
  bookThisLabel: string;
  footnote?: string;
  categoryLabels?: Partial<Record<string, string>>;
}

export interface ServicesSectionProps {
  copy: ServicesSectionCopy;
  services: ServiceDisplay[];
  lang?: 'en' | 'zh';
  onBookService?: (slug: string) => void;
}

function formatPrice(cents: number) {
  return `RM${(cents / 100).toLocaleString('en-MY', { minimumFractionDigits: 0 })}`;
}

function formatDuration(min: number) {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${min}m`;
}

function Group({
  label,
  items,
  lang,
  bookThisLabel,
  onBookService,
}: {
  label: string;
  items: ServiceDisplay[];
  lang: 'en' | 'zh';
  bookThisLabel: string;
  onBookService?: (slug: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-14 last:mb-0">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="eyebrow whitespace-nowrap">{label}</h3>
        <div className="h-px flex-1 bg-tan/40" />
      </div>
      <ul className="grid gap-px bg-tan/30 rounded-2xl overflow-hidden border border-tan/30">
        {items.map((svc) => (
          <li
            key={svc.slug}
            className="group bg-cream hover:bg-surface transition-colors"
          >
            <div className="flex items-start justify-between gap-6 p-6 md:px-8 md:py-7">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl md:text-2xl text-espresso mb-1">
                  {lang === 'zh' ? svc.nameZh : svc.nameEn}
                </p>
                <p className="font-sans text-sm text-warmbrown leading-relaxed mb-2">
                  {lang === 'zh' ? svc.descriptionZh : svc.descriptionEn}
                </p>
                <p className="font-sans text-xs text-caramel uppercase tracking-wider">
                  {formatDuration(svc.durationMin)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="font-serif text-2xl md:text-3xl text-espresso">
                  {formatPrice(svc.priceMyrCents)}
                </span>
                {onBookService && (
                  <button
                    type="button"
                    onClick={() => onBookService(svc.slug)}
                    className="font-sans text-xs font-semibold uppercase tracking-wider text-caramel hover:text-espresso whitespace-nowrap transition-colors"
                  >
                    {bookThisLabel}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  bridal: 'Bridal',
  party: 'Party & Events',
  halal: 'Halal',
  photoshoot: 'Photoshoot',
  class_session: 'Classes',
};

export function ServicesSection({
  copy,
  services,
  lang = 'en',
  onBookService,
}: ServicesSectionProps) {
  const { eyebrow, title, bookThisLabel, footnote, categoryLabels } = copy;
  const labels = { ...DEFAULT_CATEGORY_LABELS, ...categoryLabels };

  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <section id="services" className="bg-cream py-24 px-6">
      <div className="max-w-content mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="headline text-4xl md:text-5xl">{title}</h2>
        </div>
        {categories.map((cat) => (
          <Group
            key={cat}
            label={labels[cat] ?? cat}
            items={services.filter((s) => s.category === cat)}
            lang={lang}
            bookThisLabel={bookThisLabel}
            onBookService={onBookService}
          />
        ))}
        {footnote && (
          <p className="font-sans text-xs text-warmbrown leading-relaxed mt-10 pt-6 border-t border-tan/40 max-w-2xl">
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}
