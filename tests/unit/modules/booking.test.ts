import { describe, it, expect, vi } from 'vitest';
import { createBooking, SlotTakenError } from '@/modules/booking';

vi.mock('@/modules/client', () => ({
  findOrCreateClient: vi.fn(async (input) => ({
    id: 'c1',
    phone: '+60179202880',
    name: input.name,
    email: input.email ?? null,
    instagramHandle: null,
    languagePref: input.languagePref,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

vi.mock('@/modules/service', () => ({
  getServiceBySlug: vi.fn(async (slug) =>
    slug === 'bridal-standard'
      ? { id: 's1', slug, nameEn: 'Bridal Standard', nameZh: '新娘妆', descriptionEn: '', descriptionZh: '', category: 'bridal', priceMyrCents: 80000, durationMin: 180, active: true, sortOrder: 10 }
      : null,
  ),
}));

const bookingInserts: any[] = [];
vi.mock('@/server/db', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: any) => {
      const tx = {
        $queryRaw: vi.fn(async () => conflictRows),
        booking: { create: vi.fn(async ({ data }: any) => { bookingInserts.push(data); return { id: 'bk_1', ...data, createdAt: new Date(), updatedAt: new Date() }; }) },
      };
      return fn(tx);
    }),
  },
}));

let conflictRows: any[] = [];

describe('createBooking', () => {
  it('creates a booking when no conflict', async () => {
    conflictRows = [];
    bookingInserts.length = 0;
    const result = await createBooking({
      serviceSlug: 'bridal-standard',
      scheduledAtUtc: new Date('2026-05-01T06:00:00Z'),
      customer: { name: 'Aisha', phone: '017-920 2880', email: 'a@x.com', languagePref: 'en' },
      locationType: 'studio',
    });
    expect(result.id).toBe('bk_1');
    expect(bookingInserts).toHaveLength(1);
    expect(bookingInserts[0].priceMyrCentsAtBooking).toBe(80000);
    expect(bookingInserts[0].durationMin).toBe(180);
  });

  it('throws SlotTakenError on conflict', async () => {
    conflictRows = [{ id: 'existing' }];
    await expect(
      createBooking({
        serviceSlug: 'bridal-standard',
        scheduledAtUtc: new Date('2026-05-01T06:00:00Z'),
        customer: { name: 'Aisha', phone: '017-920 2880', languagePref: 'en' },
        locationType: 'studio',
      }),
    ).rejects.toBeInstanceOf(SlotTakenError);
  });

  it('rejects an unknown service slug', async () => {
    conflictRows = [];
    await expect(
      createBooking({
        serviceSlug: 'nope',
        scheduledAtUtc: new Date('2026-05-01T06:00:00Z'),
        customer: { name: 'Aisha', phone: '017-920 2880', languagePref: 'en' },
        locationType: 'studio',
      }),
    ).rejects.toThrow(/unknown service/i);
  });
});
