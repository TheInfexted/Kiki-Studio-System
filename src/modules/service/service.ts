import { prisma } from '@/server/db';
import type { Service } from '@prisma/client';

export async function listActiveServices(): Promise<Service[]> {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return prisma.service.findUnique({ where: { slug } });
}
