import { describe, it, expect } from 'vitest';
import { startOfMonthInKL, endOfMonthInKL } from '@/lib/date';

describe('startOfMonthInKL / endOfMonthInKL', () => {
  it('returns UTC instant for Jan 1 00:00 KL when given mid-January UTC', () => {
    // 15 Jan 2026 04:00 UTC == 15 Jan 12:00 KL
    const midJan = new Date('2026-01-15T04:00:00Z');
    const start = startOfMonthInKL(midJan);
    // 1 Jan 2026 00:00 KL == 31 Dec 2025 16:00 UTC
    expect(start.toISOString()).toBe('2025-12-31T16:00:00.000Z');
  });

  it('returns start-of-next-KL-month as exclusive upper bound', () => {
    const midJan = new Date('2026-01-15T04:00:00Z');
    const end = endOfMonthInKL(midJan);
    // 1 Feb 2026 00:00 KL == 31 Jan 2026 16:00 UTC (exclusive upper bound)
    expect(end.toISOString()).toBe('2026-01-31T16:00:00.000Z');
  });

  it('handles month with 30 days', () => {
    const midApr = new Date('2026-04-15T04:00:00Z');
    const start = startOfMonthInKL(midApr);
    const end = endOfMonthInKL(midApr);
    expect(start.toISOString()).toBe('2026-03-31T16:00:00.000Z');
    expect(end.toISOString()).toBe('2026-04-30T16:00:00.000Z');
  });

  it('handles December → January rollover', () => {
    const midDec = new Date('2026-12-15T04:00:00Z');
    const end = endOfMonthInKL(midDec);
    expect(end.toISOString()).toBe('2026-12-31T16:00:00.000Z');
  });
});
