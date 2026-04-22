'use client';

import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';

export function ClassesPageContent() {
  const { t } = useI18n<Copy>();
  return (
    <main className="bg-cream pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="headline text-4xl md:text-5xl mb-6">
          {t.pages.classesTitle}
        </h1>
        <p className="font-sans text-base text-warmbrown leading-relaxed">
          {t.pages.classesBody}
        </p>
      </div>
    </main>
  );
}
