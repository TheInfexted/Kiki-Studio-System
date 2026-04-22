'use client';

import { LanguageToggle } from './LanguageToggle';

export interface FooterProps {
  copyright: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramCtaLabel: string;
  brandName?: string;
  tagline?: string;
}

export function Footer({
  copyright,
  instagramUrl,
  instagramHandle,
  instagramCtaLabel,
  brandName = 'Kiki Studio',
  tagline = 'Korean-style bridal & event makeup · Kepong, KL',
}: FooterProps) {
  return (
    <footer className="bg-espresso text-cream">
      <div className="max-w-content mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div className="md:col-span-1">
            <p className="font-serif text-2xl mb-3">{brandName}</p>
            <p className="font-sans text-sm text-cream/70 leading-relaxed max-w-xs">
              {tagline}
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <p className="eyebrow !text-cream/60 mb-4">Explore</p>
              <ul className="flex flex-col gap-2 font-sans text-sm text-cream/90">
                <li>
                  <a href="/services" className="hover:text-cream transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/portfolio" className="hover:text-cream transition-colors">
                    Portfolio
                  </a>
                </li>
                <li>
                  <a href="/classes" className="hover:text-cream transition-colors">
                    Classes
                  </a>
                </li>
                <li>
                  <a href="/book" className="hover:text-cream transition-colors">
                    Book now
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow !text-cream/60 mb-4">Connect</p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-cream/90 hover:text-cream flex items-center gap-2 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                {instagramHandle}
              </a>
              <p className="font-sans text-xs text-cream/50 mt-1">
                {instagramCtaLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-cream/15 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-sans text-xs text-cream/60">{copyright}</p>
          <LanguageToggle className="text-cream border-cream/60 !px-3 !py-2 !min-w-0 !min-h-0 rounded-full" />
        </div>
      </div>
    </footer>
  );
}
