'use client';

import { useRouter } from 'next/navigation';
import { Hero } from '@/ui';

interface HeroClientProps {
  eyebrow: string;
  headline: string;
  subhead: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export function HeroClient({
  eyebrow,
  headline,
  subhead,
  ctaPrimary,
  ctaSecondary,
}: HeroClientProps) {
  const router = useRouter();
  return (
    <Hero
      eyebrow={eyebrow}
      headline={headline}
      subhead={subhead}
      ctaPrimary={ctaPrimary}
      ctaSecondary={ctaSecondary}
      onCtaPrimaryClick={() => router.push('/book')}
      onCtaSecondaryClick={() => {
        document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
      }}
    />
  );
}
