'use client';

import { SiteHeader } from '@/ui';

interface Props {
  navLabels: {
    services: string;
    portfolio: string;
    classes: string;
    book: string;
  };
  transparent?: boolean;
}

export function SiteHeaderClient({ navLabels, transparent }: Props) {
  return <SiteHeader navLabels={navLabels} transparent={transparent} />;
}
