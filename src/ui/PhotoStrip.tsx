'use client';

import Image from 'next/image';

export interface PhotoStripImage {
  src: string;
  alt?: string;
}

export interface PhotoStripProps {
  images?: PhotoStripImage[];
  onImageClick?: () => void;
}

const DEFAULT_IMAGES: PhotoStripImage[] = [
  { src: '/images/strip/1.jpg' },
  { src: '/images/strip/2.jpg' },
  { src: '/images/strip/3.jpg' },
  { src: '/images/strip/4.jpg' },
];

export function PhotoStrip({ images = DEFAULT_IMAGES, onImageClick }: PhotoStripProps) {
  return (
    <section className="w-full bg-cream">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
        {images.map((img, i) => (
          <button
            type="button"
            key={img.src}
            onClick={onImageClick}
            className="relative aspect-square overflow-hidden group"
            aria-label={img.alt ?? `Sample work ${i + 1}`}
          >
            <Image
              src={img.src}
              alt={img.alt ?? ''}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
