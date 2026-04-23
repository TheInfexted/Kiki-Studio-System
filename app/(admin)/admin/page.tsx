import { requireAdmin } from '@/server/auth';
import { getRevenueSummary } from '@/modules/admin-booking';
import { copyEn } from '@/content/kiki';
import { AdminHeader } from './_components/AdminHeader';
import { RevenueCard } from './_components/RevenueCard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const summary = await getRevenueSummary();
  const t = copyEn;
  return (
    <>
      <AdminHeader email={session.email} />
      <main className="px-6 py-8 max-w-5xl mx-auto space-y-8">
        <RevenueCard summary={summary} t={t} />
        <p className="text-sm text-warmbrown">Bookings inbox — implemented in next task.</p>
      </main>
    </>
  );
}
