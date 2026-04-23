import { requireAdmin } from '@/server/auth';
import {
  getRevenueSummary,
  listBookingsForAdmin,
  listBookingsWithTrailingNotifyFailure,
  type AdminTab,
} from '@/modules/admin-booking';
import { AdminHeader } from './_components/AdminHeader';
import { RevenueCard } from './_components/RevenueCard';
import { BookingsInbox } from './_components/BookingsInbox';
import { NotifyFailedBanner } from './_components/NotifyFailedBanner';
import { copyEn } from '@/content/kiki';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string; page?: string };
}) {
  const session = await requireAdmin();
  const tab: AdminTab = (['pending', 'upcoming', 'past'] as const).includes(searchParams.tab as AdminTab)
    ? (searchParams.tab as AdminTab)
    : 'pending';
  const q = searchParams.q?.trim() ?? '';
  const page = searchParams.page ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const [summary, result, failedNotify] = await Promise.all([
    getRevenueSummary(),
    listBookingsForAdmin({ tab, q, page }),
    listBookingsWithTrailingNotifyFailure(),
  ]);

  const t = copyEn;
  return (
    <>
      <AdminHeader email={session.email} lang="en" />
      <main className="px-6 py-8 max-w-5xl mx-auto space-y-8">
        <NotifyFailedBanner entries={failedNotify} />
        <RevenueCard summary={summary} t={t} />
        <BookingsInbox result={result} tab={tab} query={q} />
      </main>
    </>
  );
}
