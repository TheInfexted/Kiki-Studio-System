import { BookingWizard } from '@/modules/booking';
import { listActiveServices } from '@/modules/service';

export default async function BookPage() {
  const services = await listActiveServices();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  return (
    <main className="bg-cream pt-28 pb-20 px-6 min-h-screen">
      <BookingWizard services={services} turnstileSiteKey={siteKey} />
    </main>
  );
}
