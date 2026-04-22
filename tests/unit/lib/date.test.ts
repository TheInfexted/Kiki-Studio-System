import { describe, it, expect } from 'vitest';
import { klToUtc, utcToKl, formatKl, KL_TZ } from '@/lib/date';

describe('date helpers', () => {
  it('exports the expected timezone identifier', () => {
    expect(KL_TZ).toBe('Asia/Kuala_Lumpur');
  });

  it('converts a KL wall-clock time to UTC', () => {
    const utc = klToUtc(new Date('2026-05-01T14:00:00'));
    expect(utc.toISOString()).toBe('2026-05-01T06:00:00.000Z');
  });

  it('converts UTC to KL wall-clock for display', () => {
    const kl = utcToKl(new Date('2026-05-01T06:00:00.000Z'));
    expect(kl.getFullYear()).toBe(2026);
    expect(kl.getMonth()).toBe(4);
    expect(kl.getDate()).toBe(1);
    expect(kl.getHours()).toBe(14);
  });

  it('formats a UTC instant in KL with a pattern', () => {
    expect(formatKl(new Date('2026-05-01T06:00:00.000Z'), 'yyyy-MM-dd HH:mm'))
      .toBe('2026-05-01 14:00');
  });
});
