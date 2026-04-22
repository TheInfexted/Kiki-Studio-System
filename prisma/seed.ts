import { PrismaClient } from '@prisma/client';
import { serviceSeeds } from '../src/content/kiki';

const prisma = new PrismaClient();

async function main() {
  // Services
  for (const s of serviceSeeds) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: s,
    });
  }

  // Default availability: Mon–Sat 10:00–19:00, Sun off (placeholder — confirm with Kiki before launch)
  const defaultWindow = { startTime: '10:00', endTime: '19:00', active: true };
  for (let weekday = 1; weekday <= 6; weekday++) {
    const existing = await prisma.availabilityRule.findFirst({ where: { weekday } });
    if (!existing) {
      await prisma.availabilityRule.create({ data: { weekday, ...defaultWindow } });
    }
  }

  // Settings
  const settings: Array<[string, unknown]> = [
    ['travel_buffer_minutes', 30],
    ['slot_granularity_minutes', 30],
    ['min_booking_lead_hours', 24],
  ];
  for (const [key, value] of settings) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, valueJson: value as never },
      update: {}, // don't overwrite Kiki's edits on re-seed
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
