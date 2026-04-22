import type { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { copyEn, copyZh } from '@/content/kiki';
import { PublicHeader } from './_components/PublicHeader';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider packs={{ en: copyEn, zh: copyZh }} initial="en">
      <PublicHeader />
      {children}
    </I18nProvider>
  );
}
