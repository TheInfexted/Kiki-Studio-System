import { listActiveServices } from '@/modules/service';
import { formatMYR } from '@/lib/money';
import Link from 'next/link';

export default async function ServicesPage() {
  const services = await listActiveServices();
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl text-brand-700">Services</h1>
      <ul className="space-y-4">
        {services.map((s) => (
          <li key={s.id} className="rounded-md border border-neutral-200 p-5">
            <h2 className="text-xl font-medium">{s.nameEn}</h2>
            <p className="mt-1 text-neutral-600">{s.descriptionEn}</p>
            <div className="mt-3 text-sm text-neutral-500">
              {s.durationMin} min · {formatMYR(s.priceMyrCents)}
            </div>
            <Link href={`/book?service=${s.slug}`} className="mt-4 inline-block text-brand-700 underline">
              Book {s.nameEn}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
