import { formatMYR } from '@/lib/money';
import type { RevenueSummary } from '@/modules/admin-booking';
import type { Copy } from '@/content/kiki';

export function RevenueCard({ summary, t }: { summary: RevenueSummary; t: Copy }) {
  return (
    <section className="max-w-md p-6 rounded-2xl bg-white shadow-sm border border-tan">
      <h2 className="eyebrow text-xs text-warmbrown mb-2">{t.admin.revenue.thisMonth}</h2>
      <div className="headline text-3xl mb-2">
        {formatMYR(summary.confirmedCentsThisMonth)}{' '}
        <span className="text-sm font-normal text-warmbrown">{t.admin.revenue.confirmed}</span>
      </div>
      <div className="text-sm text-warmbrown">
        {summary.pendingCount} {t.admin.revenue.pending} · {summary.upcomingCount} {t.admin.revenue.upcoming}
      </div>
    </section>
  );
}
