import { Prisma, Booking, BookingStatus } from '@prisma/client';
import { prisma } from '@/server/db';

export type AdminTab = 'pending' | 'upcoming' | 'past';

export type BookingListInput = {
  tab: AdminTab;
  q?: string;
  page?: number; // 1-indexed
  pageSize?: number;
};

export type BookingListItem = Booking & {
  client: { id: string; name: string; phone: string; email: string | null; languagePref: 'en' | 'zh' };
  service: { id: string; nameEn: string; nameZh: string; category: string; priceMyrCents: number };
  auditLogs: Array<{ id: string; action: string; reason: string | null; createdAt: Date; userId: string | null }>;
};

export type BookingListResult = {
  items: BookingListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;

export async function listBookingsForAdmin(input: BookingListInput): Promise<BookingListResult> {
  const now = new Date();
  const page = Math.max(1, input.page ?? 1);
  const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;

  const statusFilter = whereForTab(input.tab, now);

  const searchFilter: Prisma.BookingWhereInput | undefined = input.q
    ? {
        OR: [
          { client: { name: { contains: input.q } } },
          { client: { phone: { contains: input.q } } },
          { service: { nameEn: { contains: input.q } } },
          { service: { nameZh: { contains: input.q } } },
        ],
      }
    : undefined;

  const where: Prisma.BookingWhereInput = {
    deletedAt: null,
    ...statusFilter,
    ...(searchFilter ?? {}),
  };

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: orderForTab(input.tab),
      skip: input.tab === 'pending' ? 0 : (page - 1) * pageSize,
      take: input.tab === 'pending' ? 1000 : pageSize,
      include: {
        client: true,
        service: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items as unknown as BookingListItem[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function whereForTab(tab: AdminTab, now: Date): Prisma.BookingWhereInput {
  if (tab === 'pending') return { status: 'pending' };
  if (tab === 'upcoming') return { status: 'confirmed', scheduledAt: { gt: now } };
  return {
    OR: [
      { status: { in: ['completed', 'cancelled', 'rejected', 'no_show'] satisfies BookingStatus[] } },
      { status: 'confirmed', scheduledAt: { lte: now } },
    ],
  };
}

function orderForTab(tab: AdminTab): Prisma.BookingOrderByWithRelationInput[] {
  if (tab === 'past') return [{ scheduledAt: 'desc' }];
  return [{ scheduledAt: 'asc' }];
}
