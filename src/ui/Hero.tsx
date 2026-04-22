'use client';

import Image from 'next/image';
import { LanguageToggle } from './LanguageToggle';

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
    <section className="relative w-full min-h-[88vh] overflow-hidden">
      <Image
        src={heroImageSrc}
        alt={heroImageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-espresso/75 pointer-events-none" />
      <div className="absolute top-0 right-0 p-5 z-20">
        <LanguageToggle className="text-cream border-cream" />
      </div>
      <div className="relative z-10 flex flex-col justify-end min-h-[88vh] px-6 pb-12 pt-24 max-w-content mx-auto">
        <p className="eyebrow text-cream/90 mb-4">{eyebrow}</p>
        <h1 className="headline text-5xl md:text-6xl text-cream mb-4">{headline}</h1>
        <div className="h-px w-10 bg-cream/70 my-4" />
        <p className="font-sans text-sm text-cream/90 mb-8 leading-relaxed max-w-md">{subhead}</p>
        <div className="flex flex-col gap-3 items-start">
          <button
            type="button"
            onClick={onCtaPrimaryClick}
            className="btn-primary-inverse"
          >
            {ctaPrimary} →
          </button>
          <button
            type="button"
            onClick={onCtaSecondaryClick}
            className="link-underline text-cream"
          >
            {ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
}
