'use client';

import Link from 'next/link';
import { LanguageToggle } from './LanguageToggle';

export interface SiteHeaderProps {
  navLabels: {
    services: string;
    portfolio: string;
    classes: string;
    book: string;
  };
  brandName?: string;
  transparent?: boolean;
}

export function SiteHeader({
  navLabels,
  brandName = 'Kiki Studio',
  transparent = false,
}: SiteHeaderProps) {
  const textBase = transparent ? 'text-cream' : 'text-espresso';
  const bg = transparent
    ? 'bg-transparent'
    : 'bg-cream/85 backdrop-blur-md border-b border-tan/30';
  return (
    <header className={`absolute top-0 inset-x-0 z-30 ${bg}`}>
      <div
        className={`max-w-content mx-auto flex items-center justify-between px-6 py-4 ${textBase}`}
      >
        <Link
          href="/"
          className="font-serif text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          {brandName}
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/services"
            className="font-sans text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            {navLabels.services}
          </Link>
          <Link
            href="/portfolio"
            className="font-sans text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            {navLabels.portfolio}
          </Link>
          <Link
            href="/classes"
            className="font-sans text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            {navLabels.classes}
          </Link>
          <Link
            href="/book"
            className={`font-sans text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 ${
              transparent
                ? 'bg-cream text-espresso hover:bg-white'
                : 'bg-espresso text-cream hover:bg-warmbrown'
            }`}
          >
            {navLabels.book}
          </Link>
        </nav>
        <div className="md:hidden flex items-center gap-3">
          <Link
            href="/book"
            className={`font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full ${
              transparent ? 'bg-cream text-espresso' : 'bg-espresso text-cream'
            }`}
          >
            {navLabels.book}
          </Link>
          <LanguageToggle
            className={`${transparent ? 'text-cream border-cream' : 'text-espresso border-espresso'} !px-3 !py-2 !min-w-0 !min-h-0 rounded-full`}
          />
        </div>
        <div className="hidden md:block">
          <LanguageToggle
            className={`${transparent ? 'text-cream border-cream' : 'text-espresso border-espresso'} !px-3 !py-2 !min-w-0 !min-h-0 rounded-full`}
          />
        </div>
      </div>
    </header>
  );
}
