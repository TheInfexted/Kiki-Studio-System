import { prisma } from '@/server/db';
import { startOfMonthInKL, endOfMonthInKL } from '@/lib/date';

export type RevenueSummary = {
  confirmedCentsThisMonth: number;
  pendingCount: number;
  upcomingCount: number;
};

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const now = new Date();
  const monthStart = startOfMonthInKL(now);
  const monthEnd = endOfMonthInKL(now); // exclusive

  const [confirmedAgg, pendingCount, upcomingCount] = await Promise.all([
    prisma.booking.aggregate({
      where: {
        status: 'confirmed',
        deletedAt: null,
        scheduledAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { priceMyrCentsAtBooking: true },
    }),
    prisma.booking.count({
      where: { status: 'pending', deletedAt: null },
    }),
    prisma.booking.count({
      where: { status: 'confirmed', deletedAt: null, scheduledAt: { gt: now } },
    }),
  ]);

  return {
    confirmedCentsThisMonth: confirmedAgg._sum.priceMyrCentsAtBooking ?? 0,
    pendingCount,
    upcomingCount,
  };
}
