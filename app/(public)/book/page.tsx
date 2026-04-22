import { BookingWizard } from '@/modules/booking';
import { listActiveServices } from '@/modules/service';

export default async function BookPage() {
  const services = await listActiveServices();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  return (
    <main className="px-6 py-10">
      <BookingWizard services={services} turnstileSiteKey={siteKey} />
    </main>
  );
}
