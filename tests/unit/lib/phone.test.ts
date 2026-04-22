import { describe, it, expect } from 'vitest';
import { normalizePhone, isValidMalaysianMobile } from '@/lib/phone';

describe('normalizePhone', () => {
  it('normalizes Malaysian mobile numbers with local prefix', () => {
    expect(normalizePhone('017-920 2880', 'MY')).toBe('+60179202880');
    expect(normalizePhone('0179202880', 'MY')).toBe('+60179202880');
  });

  it('normalizes numbers already in international format', () => {
    expect(normalizePhone('+60 17-920 2880', 'MY')).toBe('+60179202880');
    expect(normalizePhone('+60179202880', 'MY')).toBe('+60179202880');
  });

  it('throws on unparseable input', () => {
    expect(() => normalizePhone('not-a-phone', 'MY')).toThrow();
    expect(() => normalizePhone('', 'MY')).toThrow();
  });
});

describe('isValidMalaysianMobile', () => {
  it('accepts valid mobile numbers', () => {
    expect(isValidMalaysianMobile('+60179202880')).toBe(true);
  });
  it('rejects landlines and invalid numbers', () => {
    expect(isValidMalaysianMobile('+60312345678')).toBe(false);
    expect(isValidMalaysianMobile('+60123')).toBe(false);
  });
});
