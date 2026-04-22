'use client';

import { useState } from 'react';
import { StyleCard, type StyleCardData } from './StyleCard';
import { StyleGallery } from './StyleGallery';

export type { StyleCardData };

export interface PortfolioSectionCopy {
  eyebrow: string;
  title: string;
  looksCountLabel: string;
  closeLabel: string;
}

export interface PortfolioSectionProps {
  copy: PortfolioSectionCopy;
  styles: StyleCardData[];
}

export function PortfolioSection({ copy, styles }: PortfolioSectionProps) {
  const [active, setActive] = useState<StyleCardData | null>(null);

  return (
    <section id="portfolio" className="bg-cream py-16 px-6">
      <div className="max-w-content mx-auto">
        <p className="eyebrow mb-3">{copy.eyebrow}</p>
        <h2 className="headline text-4xl md:text-5xl mb-10">{copy.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {styles.map((s) => (
            <StyleCard
              key={s.id}
              style={s}
              looksCountLabel={copy.looksCountLabel}
              onClick={() => setActive(s)}
            />
          ))}
        </div>
      </div>
      {active && (
        <StyleGallery
          style={active}
          closeLabel={copy.closeLabel}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
