'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki';

export function PublicHeader() {
  const pathname = usePathname();
  const { t } = useI18n<Copy>();
  const isLanding = pathname === '/';
  return <SiteHeader navLabels={t.nav} transparent={isLanding} />;
}
