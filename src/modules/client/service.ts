import { prisma } from '@/server/db';
import { normalizePhone } from '@/lib/phone';
import type { Client, LanguagePref } from '@prisma/client';

export interface FindOrCreateInput {
  phone: string;
  name: string;
  email?: string;
  instagramHandle?: string;
  languagePref: LanguagePref;
  notes?: string;
}

export async function findOrCreateClient(input: FindOrCreateInput): Promise<Client> {
  const phone = normalizePhone(input.phone);
  const existing = await prisma.client.findUnique({ where: { phone } });
  if (existing) return existing;
  return prisma.client.create({
    data: {
      phone,
      name: input.name,
      email: input.email,
      instagramHandle: input.instagramHandle,
      languagePref: input.languagePref,
      notes: input.notes,
    },
  });
}
