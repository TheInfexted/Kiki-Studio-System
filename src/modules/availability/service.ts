import { prisma } from '@/server/db';
import { computeAvailableSlots, type Slot } from './slot-search';
import { getSetting } from '@/modules/settings';

export async function getAvailableSlots(params: {
  dateKl: string;
  durationMin: number;
  now?: Date;
}): Promise<Slot[]> {
  const now = params.now ?? new Date();
  const [granularity, buffer, lead, rules, blocks, bookings] = await Promise.all([
    getSetting('slot_granularity_minutes'),
    getSetting('travel_buffer_minutes'),
    getSetting('min_booking_lead_hours'),
    prisma.availabilityRule.findMany({ where: { active: true } }),
    prisma.availabilityBlock.findMany({
      where: {
        endAt: { gte: new Date(`${params.dateKl}T00:00:00Z`) },
        startAt: { lte: new Date(`${params.dateKl}T23:59:59Z`) },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        scheduledAt: {
          gte: new Date(`${params.dateKl}T00:00:00Z`),
          lte: new Date(`${params.dateKl}T23:59:59Z`),
        },
        deletedAt: null,
      },
      select: { scheduledAt: true, durationMin: true },
    }),
  ]);

  return computeAvailableSlots({
    dateKl: params.dateKl,
    durationMin: params.durationMin,
    slotGranularityMin: granularity,
    travelBufferMin: buffer,
    minLeadHours: lead,
    now,
    rules,
    blocks,
    existingBookings: bookings,
  });
}
