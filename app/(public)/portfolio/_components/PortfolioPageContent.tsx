'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';

interface Props {
  images: string[];
}

export function PortfolioPageContent({ images }: Props) {
  const { t } = useI18n<Copy>();
  return (
    <main className="bg-cream pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="headline text-4xl md:text-5xl mb-3">
            {t.pages.portfolioTitle}
          </h1>
          <p className="font-sans text-base text-warmbrown">
            {t.pages.portfolioSubtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src) => (
            <div
              key={src}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width:768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
