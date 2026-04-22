import { describe, it, expect } from 'vitest';
import { prisma } from '@/server/db';

describe('prisma singleton', () => {
  it('exposes a PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$transaction).toBe('function');
  });

  it('returns the same instance across imports', async () => {
    const again = (await import('@/server/db')).prisma;
    expect(again).toBe(prisma);
  });
});
