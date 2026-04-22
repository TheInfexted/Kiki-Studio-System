import { describe, it, expect, vi } from 'vitest';
import { listActiveServices, getServiceBySlug } from '@/modules/service';

const fakeRows = [
  { id: 's1', slug: 'bridal-standard', active: true, sortOrder: 10, nameEn: 'A', nameZh: 'A', descriptionEn: '', descriptionZh: '', category: 'bridal', priceMyrCents: 80000, durationMin: 180, createdAt: new Date(), updatedAt: new Date() },
  { id: 's2', slug: 'party-glam', active: true, sortOrder: 30, nameEn: 'B', nameZh: 'B', descriptionEn: '', descriptionZh: '', category: 'party', priceMyrCents: 25000, durationMin: 75, createdAt: new Date(), updatedAt: new Date() },
  { id: 's3', slug: 'hidden', active: false, sortOrder: 99, nameEn: 'C', nameZh: 'C', descriptionEn: '', descriptionZh: '', category: 'party', priceMyrCents: 0, durationMin: 30, createdAt: new Date(), updatedAt: new Date() },
];

vi.mock('@/server/db', () => ({
  prisma: {
    service: {
      findMany: vi.fn(async ({ where, orderBy }) => {
        return fakeRows.filter(r => !where || r.active === where.active).sort((a, b) => a.sortOrder - b.sortOrder);
      }),
      findUnique: vi.fn(async ({ where: { slug } }) => fakeRows.find(r => r.slug === slug) ?? null),
    },
  },
}));

describe('service module', () => {
  it('lists only active services in sort order', async () => {
    const rows = await listActiveServices();
    expect(rows.map(r => r.slug)).toEqual(['bridal-standard', 'party-glam']);
  });

  it('fetches a service by slug', async () => {
    const row = await getServiceBySlug('party-glam');
    expect(row?.slug).toBe('party-glam');
  });

  it('returns null for an unknown slug', async () => {
    const row = await getServiceBySlug('nope');
    expect(row).toBeNull();
  });
});
