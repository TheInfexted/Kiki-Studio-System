import { describe, it, expect } from 'vitest';
import { fromCents, toCents, formatMYR } from '@/lib/money';

describe('money', () => {
  it('converts cents to decimal ringgit', () => {
    expect(fromCents(12500)).toBe(125);
    expect(fromCents(12550)).toBe(125.5);
    expect(fromCents(0)).toBe(0);
  });

  it('converts ringgit to cents as integers', () => {
    expect(toCents(125)).toBe(12500);
    expect(toCents(125.5)).toBe(12550);
    expect(toCents(125.555)).toBe(12556);
  });

  it('formats cents as MYR localized string', () => {
    expect(formatMYR(12500)).toBe('RM 125.00');
    expect(formatMYR(12550)).toBe('RM 125.50');
    expect(formatMYR(1000000)).toBe('RM 10,000.00');
  });
});
