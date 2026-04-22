'use client';

import { LanguageToggle } from './LanguageToggle';

export interface FooterProps {
  copyright: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramCtaLabel: string;
}

export function Footer({ copyright, instagramUrl, instagramHandle, instagramCtaLabel }: FooterProps) {
  return (
    <footer className="bg-espresso text-cream py-10 px-6">
      <div className="max-w-content mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <p className="font-sans text-xs text-cream/80">{copyright}</p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs text-cream/90 hover:text-cream flex items-center gap-2"
          >
            {/* Instagram icon — inline SVG to avoid lucide-react brand icon removal */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            {instagramCtaLabel} · {instagramHandle}
          </a>
        </div>
        <LanguageToggle className="text-cream border-cream" />
      </div>
    </footer>
  );
}
