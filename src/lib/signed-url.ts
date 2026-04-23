import { createHmac, timingSafeEqual } from 'node:crypto';

export type BookingAction = 'confirm' | 'reject';

interface Payload {
  b: string;       // bookingId
  a: BookingAction;
  e: number;       // expiresAtUnixMs
}

const DEFAULT_TTL_SECONDS = 14 * 24 * 60 * 60;

function getSecret(): string {
  const s = process.env.ACTION_TOKEN_SECRET;
  if (!s || s.length < 16) {
    throw new Error('ACTION_TOKEN_SECRET must be set and at least 16 chars');
  }
  return s;
}

function hmacOf(payloadB64: string): string {
  return createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
}

export function signBookingAction(
  bookingId: string,
  action: BookingAction,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const payload: Payload = {
    b: bookingId,
    a: action,
    e: Date.now() + ttlSeconds * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${hmacOf(payloadB64)}`;
}

export type VerifyResult =
  | { ok: true; bookingId: string; action: BookingAction }
  | { ok: false; reason: 'malformed' | 'invalid_signature' | 'expired' };

export function verifyBookingAction(token: string): VerifyResult {
  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'malformed' };
  }
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payloadB64, receivedHmac] = parts;

  let expected: string;
  try {
    expected = hmacOf(payloadB64);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const a = Buffer.from(receivedHmac, 'base64url');
  const b = Buffer.from(expected, 'base64url');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: 'invalid_signature' };
  }

  let payload: Payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (
    payload === null ||
    typeof payload !== 'object' ||
    typeof payload.b !== 'string' ||
    (payload.a !== 'confirm' && payload.a !== 'reject') ||
    typeof payload.e !== 'number'
  ) {
    return { ok: false, reason: 'malformed' };
  }
  if (Date.now() >= payload.e) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, bookingId: payload.b, action: payload.a };
}
