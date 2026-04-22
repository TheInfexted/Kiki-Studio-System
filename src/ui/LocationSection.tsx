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
    <section id="location" className="bg-surface py-24 px-6">
      <div className="max-w-content mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="headline text-4xl md:text-5xl">{title}</h2>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 flex flex-col gap-5">
            <div className="bg-cream border border-tan/40 rounded-2xl p-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-espresso/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-espresso" />
              </div>
              <div>
                <p className="eyebrow mb-2">Studio</p>
                <p className="font-sans text-sm text-espresso leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-2 w-full"
            >
              <MessageCircle size={16} />
              <span className="truncate">
                {whatsappCta} · {whatsappDisplay}
              </span>
            </a>
          </div>

          <div className="md:col-span-3 aspect-[4/3] md:aspect-auto md:min-h-[320px] bg-cream border border-tan/40 rounded-2xl overflow-hidden">
            <iframe
              src={mapsEmbedSrc}
              title="Map"
              loading="lazy"
              className="w-full h-full"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
