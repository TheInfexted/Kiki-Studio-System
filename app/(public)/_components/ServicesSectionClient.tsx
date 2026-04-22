'use client';

import { useRouter } from 'next/navigation';
import { ServicesSection, type ServiceDisplay, type ServicesSectionCopy } from '@/ui';

interface ServicesSectionClientProps {
  copy: ServicesSectionCopy;
  services: ServiceDisplay[];
}

export function ServicesSectionClient({ copy, services }: ServicesSectionClientProps) {
  const router = useRouter();
  return (
    <ServicesSection
      copy={copy}
      services={services}
      onBookService={(slug) => router.push(`/book?service=${slug}`)}
    />
  );
}
