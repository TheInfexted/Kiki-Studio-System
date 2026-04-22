'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  eyebrow: string;
  title: string;
  items: FAQItem[];
}

export function FAQAccordion({ eyebrow, title, items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="faq" className="bg-cream py-24 px-6">
      <div className="max-w-content mx-auto">
        <div className="grid md:grid-cols-5 gap-10 md:gap-16">
          <div className="md:col-span-2">
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h2 className="headline text-4xl md:text-5xl mb-4">{title}</h2>
            <p className="font-sans text-sm text-warmbrown leading-relaxed max-w-sm">
              Still unsure? Message me on WhatsApp — quickest way to ask anything.
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="divide-y divide-tan/40 border-y border-tan/40">
              {items.map((f) => {
                const open = openId === f.id;
                return (
                  <div key={f.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : f.id)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between py-5 text-left gap-6 group"
                    >
                      <span className="font-serif text-lg md:text-xl text-espresso group-hover:text-warmbrown transition-colors">
                        {f.question}
                      </span>
                      <span
                        className={`shrink-0 h-8 w-8 rounded-full border border-tan/60 flex items-center justify-center transition-all ${
                          open ? 'bg-espresso border-espresso' : 'bg-transparent'
                        }`}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            open ? 'rotate-180 text-cream' : 'text-espresso'
                          }`}
                        />
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        open ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="font-sans text-sm md:text-base text-warmbrown leading-relaxed max-w-prose">
                          {f.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
