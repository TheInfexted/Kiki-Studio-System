'use client';

import { MapPin, MessageCircle } from 'lucide-react';

export interface LocationSectionProps {
  eyebrow: string;
  title: string;
  address: string;
  whatsappCta: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  mapsEmbedSrc: string;
}

export function LocationSection({
  eyebrow,
  title,
  address,
  whatsappCta,
  whatsappNumber,
  whatsappDisplay,
  mapsEmbedSrc,
}: LocationSectionProps) {
  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <section id="location" className="bg-cream py-16 px-6">
      <div className="max-w-content mx-auto">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="headline text-4xl md:text-5xl mb-10">{title}</h2>

        <div className="bg-surface border border-tan/50 p-5 flex items-start gap-3 mb-5">
          <MapPin size={20} className="text-caramel shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-espresso leading-relaxed">{address}</p>
        </div>

        <div className="aspect-[16/10] bg-surface border border-tan/50 overflow-hidden mb-6">
          <iframe
            src={mapsEmbedSrc}
            title="Map"
            loading="lazy"
            className="w-full h-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            {whatsappCta} · {whatsappDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
