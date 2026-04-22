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
    <div className="mb-10">
      <h3 className="eyebrow mb-4 text-caramel">{label}</h3>
      <ul className="divide-y divide-tan/40 border-y border-tan/40">
        {items.map((svc) => (
          <li key={svc.slug} className="flex items-center justify-between py-4 gap-4">
            <div className="min-w-0">
              <p className="font-sans text-base text-espresso">
                {lang === 'zh' ? svc.nameZh : svc.nameEn}
              </p>
              <p className="font-sans text-xs text-warmbrown mt-1">
                {lang === 'zh' ? svc.descriptionZh : svc.descriptionEn}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-serif italic text-lg text-espresso">
                {formatPrice(svc.priceMyrCents)}
              </span>
              {onBookService && (
                <button
                  type="button"
                  onClick={() => onBookService(svc.slug)}
                  className="font-sans text-xs font-semibold uppercase tracking-wider text-caramel hover:text-espresso whitespace-nowrap"
                >
                  {bookThisLabel}
                </button>
              )}
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
    <section id="services" className="bg-cream py-16 px-6">
      <div className="max-w-content mx-auto">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="headline text-4xl md:text-5xl mb-10">{title}</h2>
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
          <p className="font-sans text-xs text-warmbrown leading-relaxed border-t border-tan/40 pt-4">
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}
