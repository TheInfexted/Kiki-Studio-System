import { test, expect } from '@playwright/test';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { seedPendingBooking, cleanupBookings } from './fixtures/seed';

const MAILBOX = join(process.cwd(), 'tests', '.mailbox');

test.beforeEach(async () => {
  await cleanupBookings();
  await rm(MAILBOX, { recursive: true, force: true });
});

test('signed-link confirm flow transitions booking status and emails customer', async ({ page }) => {
  const booking = await seedPendingBooking('201');
  const { signBookingAction } = await import('../../src/lib/signed-url');
  const token = signBookingAction(booking.id, 'confirm');

  await page.goto(`/b/${token}`);
  await expect(page.getByRole('heading', { name: /confirm this booking/i })).toBeVisible();
  await page.getByRole('button', { name: /confirm booking/i }).click();
  await expect(page.getByRole('heading', { name: /booking confirmed/i })).toBeVisible();

  const prisma = new PrismaClient();
  const updated = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
  expect(updated.status).toBe('confirmed');
  await prisma.$disconnect();

  const entries = await readdir(MAILBOX);
  const confirmedMail = entries.map(async (e) => JSON.parse(await readFile(join(MAILBOX, e), 'utf8')));
  const resolved = await Promise.all(confirmedMail);
  const toCustomer = resolved.find((m) => {
    const to = Array.isArray(m.to) ? m.to[0] : m.to;
    return to === 'e2e-customer-201@test.local';
  });
  expect(toCustomer).toBeTruthy();
  expect(toCustomer.subject).toMatch(/confirmed/i);

  await page.goto(`/b/${token}`);
  await expect(page.getByText(/already been handled/i)).toBeVisible();
});
