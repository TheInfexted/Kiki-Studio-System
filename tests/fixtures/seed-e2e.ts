import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await prisma.booking.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.availabilityBlock.deleteMany({});
  await prisma.availabilityRule.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.setting.deleteMany({});

  await prisma.service.create({
    data: {
      slug: 'e2e-service', nameEn: 'E2E Service', nameZh: '测试服务',
      descriptionEn: '', descriptionZh: '', category: 'party',
      priceMyrCents: 10000, durationMin: 60, active: true, sortOrder: 1,
    },
  });
  for (let weekday = 0; weekday <= 6; weekday++) {
    await prisma.availabilityRule.create({
      data: { weekday, startTime: '00:00', endTime: '23:30', active: true },
    });
  }
  await prisma.setting.createMany({
    data: [
      { key: 'slot_granularity_minutes', valueJson: 30 },
      { key: 'travel_buffer_minutes', valueJson: 0 },
      { key: 'min_booking_lead_hours', valueJson: 0 },
    ],
  });

  await prisma.$disconnect();
}
main();
