import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedPendingBooking(suffix: string) {
  const service = await prisma.service.findFirstOrThrow({ where: { active: true } });
  const client = await prisma.client.upsert({
    where: { phone: `+6019000${suffix}` },
    update: {},
    create: {
      phone: `+6019000${suffix}`,
      name: `E2E Customer ${suffix}`,
      email: `e2e-customer-${suffix}@test.local`,
      languagePref: 'en',
    },
  });
  return prisma.booking.create({
    data: {
      clientId: client.id,
      serviceId: service.id,
      scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      durationMin: service.durationMin,
      locationType: 'studio',
      priceMyrCentsAtBooking: service.priceMyrCents,
      status: 'pending',
      paymentStatus: 'unpaid',
    },
  });
}

export async function cleanupBookings() {
  await prisma.auditLog.deleteMany({ where: { booking: { client: { phone: { startsWith: '+6019000' } } } } });
  await prisma.booking.deleteMany({ where: { client: { phone: { startsWith: '+6019000' } } } });
}
