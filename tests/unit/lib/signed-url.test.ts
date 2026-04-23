import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signBookingAction, verifyBookingAction } from '@/lib/signed-url';

describe('signed-url', () => {
  beforeEach(() => {
    process.env.ACTION_TOKEN_SECRET = 'test-secret-32-bytes-minimum-abcdefg';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T00:00:00Z'));
  });

  it('round-trips a confirm token', () => {
    const token = signBookingAction('bkg_abc', 'confirm');
    const result = verifyBookingAction(token);
    expect(result).toEqual({ ok: true, bookingId: 'bkg_abc', action: 'confirm' });
  });

  it('round-trips a reject token', () => {
    const token = signBookingAction('bkg_xyz', 'reject');
    const result = verifyBookingAction(token);
    expect(result).toEqual({ ok: true, bookingId: 'bkg_xyz', action: 'reject' });
  });

  it('rejects a token with tampered payload', () => {
    const token = signBookingAction('bkg_abc', 'confirm');
    const [payload, hmac] = token.split('.');
    // Re-encode with a different bookingId
    const tamperedPayload = Buffer.from(
      JSON.stringify({ b: 'bkg_evil', a: 'confirm', e: 9999999999 }),
    ).toString('base64url');
    const tampered = `${tamperedPayload}.${hmac}`;
    expect(verifyBookingAction(tampered)).toEqual({ ok: false, reason: 'invalid_signature' });
  });

  it('rejects an expired token', () => {
    const token = signBookingAction('bkg_abc', 'confirm', 60); // 60s TTL
    vi.advanceTimersByTime(61_000);
    expect(verifyBookingAction(token)).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects a malformed token', () => {
    expect(verifyBookingAction('not-a-token')).toEqual({ ok: false, reason: 'malformed' });
    expect(verifyBookingAction('a.b.c')).toEqual({ ok: false, reason: 'malformed' });
    expect(verifyBookingAction('')).toEqual({ ok: false, reason: 'malformed' });
  });

  it('prevents action substitution attack', () => {
    // Sign a confirm token
    const confirmToken = signBookingAction('bkg_abc', 'confirm');
    const [confirmPayload, confirmHmac] = confirmToken.split('.');
    // Swap the action in the payload
    const decoded = JSON.parse(Buffer.from(confirmPayload, 'base64url').toString());
    const rejectPayload = Buffer.from(
      JSON.stringify({ ...decoded, a: 'reject' }),
    ).toString('base64url');
    const substituted = `${rejectPayload}.${confirmHmac}`;
    expect(verifyBookingAction(substituted)).toEqual({ ok: false, reason: 'invalid_signature' });
  });

  it('defaults to 14-day TTL when ttlSeconds omitted', () => {
    const token = signBookingAction('bkg_abc', 'confirm');
    vi.advanceTimersByTime(14 * 24 * 60 * 60 * 1000 - 1000); // just under 14 days
    expect(verifyBookingAction(token).ok).toBe(true);
    vi.advanceTimersByTime(2000); // crosses 14-day mark
    const r = verifyBookingAction(token);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('expired');
  });

  it('returns malformed for a payload that decodes to JSON null', () => {
    // Construct a token whose payload is valid base64url of "null" with a matching HMAC.
    // This bypasses the signature check but would crash on `payload.b` without the null guard.
    const { createHmac } = require('node:crypto') as typeof import('node:crypto');
    const nullPayloadB64 = Buffer.from('null').toString('base64url');
    const hmac = createHmac('sha256', process.env.ACTION_TOKEN_SECRET!)
      .update(nullPayloadB64)
      .digest('base64url');
    const token = `${nullPayloadB64}.${hmac}`;
    expect(verifyBookingAction(token)).toEqual({ ok: false, reason: 'malformed' });
  });
});
