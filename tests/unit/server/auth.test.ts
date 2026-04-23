import { describe, it, expect, beforeEach } from 'vitest';
import { isAllowlisted } from '@/server/auth';

describe('isAllowlisted', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'Admin@Example.com, brendan@test.local,kiki@test.local';
  });

  it('accepts exact match', () => {
    expect(isAllowlisted('brendan@test.local')).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(isAllowlisted('BRENDAN@TEST.LOCAL')).toBe(true);
    expect(isAllowlisted('admin@example.com')).toBe(true);
  });
  it('trims whitespace', () => {
    expect(isAllowlisted('  kiki@test.local  ')).toBe(true);
  });
  it('rejects unknown email', () => {
    expect(isAllowlisted('hacker@evil.com')).toBe(false);
  });
  it('rejects empty input', () => {
    expect(isAllowlisted('')).toBe(false);
    expect(isAllowlisted(null as unknown as string)).toBe(false);
  });
  it('handles empty ADMIN_EMAILS safely', () => {
    process.env.ADMIN_EMAILS = '';
    expect(isAllowlisted('anyone@anywhere')).toBe(false);
  });
});
