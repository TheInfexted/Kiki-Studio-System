import { listActiveServices } from '@/modules/service';
import { LandingContent } from './_components/LandingContent';

export default async function HomePage() {
  const services = await listActiveServices();
  return <LandingContent services={services} />;
}
