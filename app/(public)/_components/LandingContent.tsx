'use client';

import { useRouter } from 'next/navigation';
import {
  Hero,
  PhotoStrip,
  ServicesSection,
  LocationSection,
  FAQAccordion,
  Footer,
  type ServiceDisplay,
} from '@/ui';
import { useI18n } from '@/lib/i18n';
import { brand, type Copy } from '@/content/kiki';

interface LandingContentProps {
  services: ServiceDisplay[];
}

export function LandingContent({ services }: LandingContentProps) {
  const router = useRouter();
  const { t, lang } = useI18n<Copy>();

  return (
    <>
      <Hero
        eyebrow={t.landing.heroEyebrow}
        headline={t.landing.heroHeadline}
        subhead={t.landing.heroSub}
        ctaPrimary={t.landing.heroCta}
        ctaSecondary={t.landing.heroCtaSecondary}
        onCtaPrimaryClick={() => router.push('/book')}
        onCtaSecondaryClick={() => {
          document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <PhotoStrip />

      <ServicesSection
        copy={{
          eyebrow: t.services.eyebrow,
          title: t.services.title,
          bookThisLabel: t.services.bookThisLabel,
          footnote: t.services.footnote,
        }}
        services={services}
        lang={lang}
        onBookService={(slug) => router.push(`/book?service=${slug}`)}
      />

      <LocationSection
        eyebrow={t.location.eyebrow}
        title={t.location.title}
        address={t.location.address}
        whatsappCta={t.location.whatsappCta}
        whatsappNumber={brand.whatsapp}
        whatsappDisplay={t.location.whatsappDisplay}
        mapsEmbedSrc="https://maps.google.com/maps?q=Sri+Delima+MRT+Kepong+Kuala+Lumpur&z=15&output=embed"
      />

      <FAQAccordion
        eyebrow={t.faq.eyebrow}
        title={t.faq.title}
        items={t.faq.items}
      />

      <Footer
        copyright={t.footer.rights}
        instagramUrl={brand.instagram}
        instagramHandle="@kiki.makeup___"
        instagramCtaLabel={t.footer.instagramCtaLabel}
      />
    </>
  );
}
