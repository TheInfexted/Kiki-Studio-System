import type { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { copyEn, copyZh } from '@/content/kiki';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider packs={{ en: copyEn, zh: copyZh }} initial="en">
      <div className="min-h-screen bg-cream">
        {children}
      </div>
    </I18nProvider>
  );
}
