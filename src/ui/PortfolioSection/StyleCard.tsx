'use client';

import Image from 'next/image';

export interface StyleCardData {
  id: string;
  name: string;
  subtitle: string;
  lookCount: number;
  thumbnailSrc?: string;
}

export interface StyleCardProps {
  style: StyleCardData;
  looksCountLabel: string;
  onClick: () => void;
}

export function StyleCard({ style, looksCountLabel, onClick }: StyleCardProps) {
  const thumbSrc = style.thumbnailSrc ?? `/images/portfolio/${style.id}/1.jpg`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex bg-surface border border-tan/50 text-left w-full overflow-hidden hover:border-caramel transition-colors"
    >
      <div className="relative w-24 h-24 shrink-0">
        <Image
          src={thumbSrc}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center px-4 py-3 min-w-0">
        <p className="font-serif italic text-lg text-espresso truncate">{style.name}</p>
        <p className="eyebrow text-caramel mt-0.5">{style.subtitle}</p>
        <p className="font-sans text-xs text-warmbrown mt-1">
          {style.lookCount} {looksCountLabel}
        </p>
      </div>
    </button>
  );
}
