import { prisma } from '@/server/db';

export interface SettingSchema {
  travel_buffer_minutes: number;
  slot_granularity_minutes: number;
  min_booking_lead_hours: number;
}

const DEFAULTS: SettingSchema = {
  travel_buffer_minutes: 30,
  slot_granularity_minutes: 30,
  min_booking_lead_hours: 24,
};

export async function getSetting<K extends keyof SettingSchema>(key: K): Promise<SettingSchema[K]> {
  if (!(key in DEFAULTS)) {
    throw new Error(`Unknown setting key: ${String(key)}`);
  }
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return DEFAULTS[key];
  return row.valueJson as SettingSchema[K];
}

export async function setSetting<K extends keyof SettingSchema>(
  key: K,
  value: SettingSchema[K],
  updatedByUserId?: string,
): Promise<void> {
  if (!(key in DEFAULTS)) {
    throw new Error(`Unknown setting key: ${String(key)}`);
  }
  await prisma.setting.upsert({
    where: { key },
    create: { key, valueJson: value as never, updatedByUserId },
    update: { valueJson: value as never, updatedByUserId },
  });
}
