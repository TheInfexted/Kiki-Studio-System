import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailableSlots } from '@/modules/availability';
import { getServiceBySlug } from '@/modules/service';

const Query = z.object({
  service: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Query.safeParse({
    service: url.searchParams.get('service'),
    date: url.searchParams.get('date'),
  });
  if (!parsed.success) return NextResponse.json({ error: 'bad_request', details: parsed.error.flatten() }, { status: 400 });

  const service = await getServiceBySlug(parsed.data.service);
  if (!service || !service.active) return NextResponse.json({ error: 'unknown_service' }, { status: 404 });

  const slots = await getAvailableSlots({ dateKl: parsed.data.date, durationMin: service.durationMin });
  return NextResponse.json({
    slots: slots.map(s => ({ startKl: s.startKl, startAtIso: s.startAt.toISOString() })),
  });
}
