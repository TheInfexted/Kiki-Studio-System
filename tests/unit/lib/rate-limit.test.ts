import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRateLimiter } from '@/lib/rate-limit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T00:00:00Z'));
  });

  it('allows up to `max` requests per key within the window', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    expect(limiter.check('ip-1')).toEqual({ ok: true, remaining: 2 });
    expect(limiter.check('ip-1')).toEqual({ ok: true, remaining: 1 });
    expect(limiter.check('ip-1')).toEqual({ ok: true, remaining: 0 });
  });

  it('rejects the N+1th request with retryAfterMs', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60_000 });
    limiter.check('ip-1');
    limiter.check('ip-1');
    const third = limiter.check('ip-1');
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.retryAfterMs).toBeGreaterThan(0);
  });

  it('decays after the window', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    expect(limiter.check('ip-1').ok).toBe(true);
    expect(limiter.check('ip-1').ok).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(limiter.check('ip-1').ok).toBe(true);
  });

  it('isolates keys', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    expect(limiter.check('ip-1').ok).toBe(true);
    expect(limiter.check('ip-2').ok).toBe(true);
    expect(limiter.check('ip-1').ok).toBe(false);
    expect(limiter.check('ip-2').ok).toBe(false);
  });
});
