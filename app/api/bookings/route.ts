import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBooking, SlotTakenError } from '@/modules/booking';
import { getServiceBySlug } from '@/modules/service';
import { sendBookingCreatedNotifications } from '@/modules/notifications';
import { formatKl } from '@/lib/date';
import { verifyTurnstile } from '@/lib/turnstile';
import { brand } from '@/content/kiki';

const Body = z.object({
  turnstileToken: z.string().min(1),
  serviceSlug: z.string().min(1),
  scheduledAtIso: z.string().datetime(),
  customer: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().min(6).max(32),
    email: z.string().email().optional(),
    instagramHandle: z.string().max(40).optional(),
    languagePref: z.enum(['en', 'zh']),
  }),
  locationType: z.enum(['studio', 'home', 'venue']),
  locationAddress: z.string().max(500).optional(),
  locationNotes: z.string().max(500).optional(),
  customerNotes: z.string().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // Honeypot check
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ error: 'spam' }, { status: 422 });
  }

  // Verify Turnstile token
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ok = await verifyTurnstile(parsed.data.turnstileToken, ip, secret);
  if (!ok) {
    return NextResponse.json({ error: 'turnstile_failed' }, { status: 403 });
  }

  // Verify service exists
  const service = await getServiceBySlug(parsed.data.serviceSlug);
  if (!service || !service.active) {
    return NextResponse.json({ error: 'unknown_service' }, { status: 404 });
  }

  // Create booking
  try {
    const booking = await createBooking({
      serviceSlug: parsed.data.serviceSlug,
      scheduledAtUtc: new Date(parsed.data.scheduledAtIso),
      customer: parsed.data.customer,
      locationType: parsed.data.locationType,
      locationAddress: parsed.data.locationAddress,
      locationNotes: parsed.data.locationNotes,
      customerNotes: parsed.data.customerNotes,
    });

    // Send notifications
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
    if (adminTo) {
      try {
        await sendBookingCreatedNotifications({
          adminEmails: adminTo
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          customerEmail: parsed.data.customer.email,
          context: {
            bookingId: booking.id,
            customerName: parsed.data.customer.name,
            customerPhone: parsed.data.customer.phone,
            customerEmail: parsed.data.customer.email,
            serviceName:
              parsed.data.customer.languagePref === 'zh' ? service.nameZh : service.nameEn,
            scheduledAtKl: formatKl(booking.scheduledAt, 'yyyy-MM-dd HH:mm'),
            durationMin: booking.durationMin,
            priceMyrCents: booking.priceMyrCentsAtBooking,
            locationSummary:
              parsed.data.locationType === 'studio'
                ? `Studio · ${brand.address.line1}`
                : parsed.data.locationAddress ?? parsed.data.locationType,
            customerNotes: parsed.data.customerNotes,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
            lang: parsed.data.customer.languagePref,
          },
        });
      } catch (e) {
        console.error('Notification send failed', e);
      }
    }

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (e) {
    if (e instanceof SlotTakenError) {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
    }
    console.error('createBooking failed', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
