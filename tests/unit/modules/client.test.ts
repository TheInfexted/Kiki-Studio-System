import { describe, it, expect, vi } from 'vitest';
import { findOrCreateClient } from '@/modules/client';

const store = new Map<string, any>();

vi.mock('@/server/db', () => ({
  prisma: {
    client: {
      findUnique: vi.fn(async ({ where: { phone } }) => store.get(phone) ?? null),
      create: vi.fn(async ({ data }) => {
        const row = { id: `c-${store.size + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        store.set(data.phone, row);
        return row;
      }),
      update: vi.fn(async ({ where: { phone }, data }) => {
        const row = { ...store.get(phone), ...data };
        store.set(phone, row);
        return row;
      }),
    },
  },
}));

describe('client.findOrCreateClient', () => {
  it('creates a client on first call with unformatted phone input', async () => {
    const c = await findOrCreateClient({ phone: '017-920 2880', name: 'Aisha', languagePref: 'en' });
    expect(c.phone).toBe('+60179202880');
    expect(c.name).toBe('Aisha');
  });

  it('returns the same row (same phone) on second call', async () => {
    const c = await findOrCreateClient({ phone: '+60179202880', name: 'Aisha Updated', languagePref: 'en' });
    expect(c.id).toBe('c-1');
  });

  it('rejects a phone that cannot be parsed', async () => {
    await expect(findOrCreateClient({ phone: 'xxx', name: 'X', languagePref: 'en' })).rejects.toThrow();
  });
});
