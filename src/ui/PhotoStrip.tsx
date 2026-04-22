'use client';

import Image from 'next/image';

export interface PhotoStripImage {
  src: string;
  alt?: string;
}

export interface PhotoStripProps {
  images?: PhotoStripImage[];
  onImageClick?: () => void;
  eyebrow?: string;
  title?: string;
}

const DEFAULT_IMAGES: PhotoStripImage[] = [
  { src: '/images/strip/1.jpg' },
  { src: '/images/strip/2.jpg' },
  { src: '/images/strip/3.jpg' },
  { src: '/images/strip/4.jpg' },
];

export function PhotoStrip({
  images = DEFAULT_IMAGES,
  onImageClick,
  eyebrow = 'RECENT WORK',
  title = 'A quiet kind of beautiful.',
}: PhotoStripProps) {
  return (
    <section className="w-full bg-surface py-20 px-6">
      <div className="max-w-content mx-auto">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h2 className="headline text-3xl md:text-4xl">{title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <button
              type="button"
              key={img.src}
              onClick={onImageClick}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl group shadow-sm hover:shadow-lg transition-shadow"
              aria-label={img.alt ?? `Sample work ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt ?? ''}
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
