import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSetting, setSetting, type SettingSchema } from '@/modules/settings';

vi.mock('@/server/db', () => {
  const store = new Map<string, unknown>();
  return {
    prisma: {
      setting: {
        findUnique: vi.fn(async ({ where: { key } }) =>
          store.has(key) ? { key, valueJson: store.get(key) } : null,
        ),
        upsert: vi.fn(async ({ where: { key }, create, update }) => {
          store.set(key, create.valueJson ?? update.valueJson);
          return { key, valueJson: store.get(key) };
        }),
      },
    },
  };
});

describe('settings service', () => {
  it('reads a default when the key is missing', async () => {
    const value = await getSetting('slot_granularity_minutes');
    expect(value).toBe(30);
  });

  it('writes a value and reads it back', async () => {
    await setSetting('travel_buffer_minutes', 45);
    const value = await getSetting('travel_buffer_minutes');
    expect(value).toBe(45);
  });

  it('throws on an unknown key', async () => {
    await expect(getSetting('not_a_real_key' as keyof SettingSchema)).rejects.toThrow();
  });
});
