import { listActiveServices } from '@/modules/service';
import { ServicesPageContent } from './_components/ServicesPageContent';

export default async function ServicesPage() {
  const services = await listActiveServices();
  return <ServicesPageContent services={services} />;
}
