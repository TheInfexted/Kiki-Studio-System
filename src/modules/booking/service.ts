import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { findOrCreateClient } from '@/modules/client';
import { getServiceBySlug } from '@/modules/service';
import type { Booking, BookingLocationType, LanguagePref } from '@prisma/client';

export class SlotTakenError extends Error {
  constructor() {
    super('slot_taken');
    this.name = 'SlotTakenError';
  }
}

export interface CreateBookingInput {
  serviceSlug: string;
  scheduledAtUtc: Date;
  customer: {
    name: string;
    phone: string;
    email?: string;
    instagramHandle?: string;
    languagePref: LanguagePref;
  };
  locationType: BookingLocationType;
  locationAddress?: string;
  locationNotes?: string;
  customerNotes?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const service = await getServiceBySlug(input.serviceSlug);
  if (!service || !service.active) {
    throw new Error(`Unknown service: ${input.serviceSlug}`);
  }
  const client = await findOrCreateClient(input.customer);

  const slotStart = input.scheduledAtUtc;
  const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60_000);

  return prisma.$transaction(async (tx) => {
    // Lock any overlapping booking rows to serialize conflicting writers.
    const conflicts = await tx.$queryRaw(Prisma.sql`
      SELECT id FROM \`Booking\`
      WHERE deletedAt IS NULL
        AND status IN ('pending','confirmed')
        AND scheduledAt < ${slotEnd}
        AND DATE_ADD(scheduledAt, INTERVAL durationMin MINUTE) > ${slotStart}
      FOR UPDATE
    `) as Array<{ id: string }>;
    if (conflicts.length > 0) {
      throw new SlotTakenError();
    }
    return tx.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        scheduledAt: slotStart,
        durationMin: service.durationMin,
        locationType: input.locationType,
        locationAddress: input.locationAddress,
        locationNotes: input.locationNotes,
        priceMyrCentsAtBooking: service.priceMyrCents,
        customerNotes: input.customerNotes,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
