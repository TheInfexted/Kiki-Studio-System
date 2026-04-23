export interface RateLimiterOptions {
  max: number;
  windowMs: number;
}

export type RateLimitCheck =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number };

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): RateLimitCheck;
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const store = new Map<string, Entry>();
  return {
    check(key: string): RateLimitCheck {
      const now = Date.now();
      const existing = store.get(key);
      if (!existing || existing.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + opts.windowMs });
        return { ok: true, remaining: opts.max - 1 };
      }
      if (existing.count >= opts.max) {
        return { ok: false, retryAfterMs: existing.resetAt - now };
      }
      existing.count += 1;
      return { ok: true, remaining: opts.max - existing.count };
    },
  };
}
