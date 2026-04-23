import type { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { copyEn, copyZh } from '@/content/kiki';

export default function ActionsLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider packs={{ en: copyEn, zh: copyZh }} initial="en">
      <main className="min-h-screen bg-cream flex items-start justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-tan p-6">
          {children}
        </div>
      </main>
    </I18nProvider>
  );
}
