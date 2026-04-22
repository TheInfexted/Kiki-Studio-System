'use client';

import { Instagram } from 'lucide-react';
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
            <Instagram size={14} />
            {instagramCtaLabel} · {instagramHandle}
          </a>
        </div>
        <LanguageToggle className="text-cream border-cream" />
      </div>
    </footer>
  );
}
