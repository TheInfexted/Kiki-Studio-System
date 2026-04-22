import { Footer, PhotoStrip, FAQAccordion, LocationSection } from '@/ui';
import { listActiveServices } from '@/modules/service';
import { copyEn, brand } from '@/content/kiki';
import { HeroClient } from './_components/HeroClient';
import { ServicesSectionClient } from './_components/ServicesSectionClient';

export default async function HomePage() {
  const services = await listActiveServices();
  const t = copyEn;

  return (
    <>
      <HeroClient
        eyebrow={t.landing.heroEyebrow}
        headline={t.landing.heroHeadline}
        subhead={t.landing.heroSub}
        ctaPrimary={t.landing.heroCta}
        ctaSecondary={t.landing.heroCtaSecondary}
      />

      <PhotoStrip />

      <ServicesSectionClient
        copy={{
          eyebrow: t.services.eyebrow,
          title: t.services.title,
          bookThisLabel: t.services.bookThisLabel,
          footnote: t.services.footnote,
        }}
        services={services}
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
        instagramHandle='@kiki.makeup___'
        instagramCtaLabel={t.footer.instagramCtaLabel}
      />
    </>
  );
}
