'use client';

import Image from 'next/image';

export interface HeroProps {
  eyebrow: string;
  headline: string;
  subhead: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  onCtaPrimaryClick?: () => void;
  onCtaSecondaryClick?: () => void;
}

export function Hero({
  eyebrow,
  headline,
  subhead,
  ctaPrimary,
  ctaSecondary,
  heroImageSrc = '/images/hero.jpg',
  heroImageAlt = '',
  onCtaPrimaryClick,
  onCtaSecondaryClick,
}: HeroProps) {
  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-espresso">
      <Image
        src={heroImageSrc}
        alt={heroImageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/30 via-espresso/15 to-espresso/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/50 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-end min-h-[92vh] px-6 pb-16 pt-32 md:pt-40 max-w-content mx-auto">
        <div className="max-w-2xl">
          <p className="eyebrow !text-cream/80 mb-5">{eyebrow}</p>
          <h1 className="headline !text-cream text-5xl md:text-7xl mb-6">
            {headline}
          </h1>
          <div className="h-px w-16 bg-cream/50 my-6" />
          <p className="font-sans text-base md:text-lg text-cream/90 mb-10 leading-relaxed max-w-lg">
            {subhead}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              type="button"
              onClick={onCtaPrimaryClick}
              className="btn-primary-inverse group"
            >
              {ctaPrimary}
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={onCtaSecondaryClick}
              className="font-sans text-sm font-semibold uppercase tracking-wider text-cream/90 hover:text-cream px-4 py-3 underline decoration-cream/40 decoration-1 underline-offset-[6px] hover:decoration-cream transition-all"
            >
              {ctaSecondary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
