import { test, expect } from '@playwright/test';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { seedPendingBooking, cleanupBookings } from './fixtures/seed';

const MAILBOX = join(process.cwd(), 'tests', '.mailbox');
const ALLOWLISTED = 'e2e-admin@test.local';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/admin/signin');
  await page.getByLabel(/email/i).fill(ALLOWLISTED);
  await page.getByRole('button', { name: /send sign-in link/i }).click();
  await expect(page).toHaveURL(/sent=1/);
  const entries = await readdir(MAILBOX);
  const mine = entries.find((e) => e.includes(ALLOWLISTED.replace(/[^a-zA-Z0-9@.-]/g, '_')));
  const parsed = JSON.parse(await readFile(join(MAILBOX, mine!), 'utf8'));
  const m = /https?:\/\/[^\s"'<>]+\/api\/auth\/callback\/email\?[^\s"'<>]+/.exec(parsed.html)!;
  await page.goto(m[0]);
  await expect(page).toHaveURL(/\/admin(\?|$)/);
}

test.beforeEach(async () => {
  await cleanupBookings();
  await rm(MAILBOX, { recursive: true, force: true });
});

test.afterAll(async () => {
  await cleanupBookings();
});

test('confirm a pending booking from the dashboard', async ({ page }) => {
  const booking = await seedPendingBooking('101');

  await signIn(page);
  await expect(page.getByText('Pending', { exact: false })).toBeVisible();
  await page.locator('details').first().click();
  await page.getByRole('button', { name: /^Confirm$/ }).click();

  await expect(page.locator('details').first()).toContainText(/confirmed/i, { timeout: 5000 });

  const entries = await readdir(MAILBOX);
  const customerMail = entries.find((e) => e.includes('e2e-customer-101'));
  expect(customerMail).toBeTruthy();
  const raw = await readFile(join(MAILBOX, customerMail!), 'utf8');
  expect(raw).toMatch(/confirmed/i);
  expect(booking.id).toBeTruthy();
});

test('reject with reason emails the customer the reason', async ({ page }) => {
  await seedPendingBooking('102');

  await signIn(page);
  await page.locator('details').first().click();
  await page.getByRole('button', { name: /^Reject$/ }).click();
  await page.getByRole('textbox').fill('Fully booked that weekend');
  await page.getByRole('button', { name: /confirm rejection/i }).click();

  await expect(page.locator('details').first()).toContainText(/rejected/i, { timeout: 5000 });

  const entries = await readdir(MAILBOX);
  const customerMail = entries.find((e) => e.includes('e2e-customer-102'));
  expect(customerMail).toBeTruthy();
  const raw = await readFile(join(MAILBOX, customerMail!), 'utf8');
  expect(raw).toContain('Fully booked that weekend');
});
