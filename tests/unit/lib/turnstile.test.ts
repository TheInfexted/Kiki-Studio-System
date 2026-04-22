import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyTurnstile } from '@/lib/turnstile';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('verifyTurnstile', () => {
  it('returns true when cloudflare says success', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });
    const ok = await verifyTurnstile('t', '1.2.3.4', 'secret');
    expect(ok).toBe(true);
  });

  it('returns false when cloudflare says failure', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });
    const ok = await verifyTurnstile('t', '1.2.3.4', 'secret');
    expect(ok).toBe(false);
  });
});
