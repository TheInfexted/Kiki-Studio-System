import { test, expect } from '@playwright/test';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const MAILBOX = join(process.cwd(), 'tests', '.mailbox');
const ALLOWLISTED = 'e2e-admin@test.local';
const NOT_ALLOWLISTED = 'intruder@test.local';

test.beforeEach(async () => {
  await rm(MAILBOX, { recursive: true, force: true });
});

test('non-allowlisted email submits without writing a mailbox file', async ({ page }) => {
  await page.goto('/admin/signin');
  await page.getByLabel(/email/i).fill(NOT_ALLOWLISTED);
  await page.getByRole('button', { name: /send sign-in link/i }).click();
  await expect(page).toHaveURL(/sent=1/);

  const entries = await readdir(MAILBOX).catch(() => []);
  expect(entries.filter((e) => e.includes(NOT_ALLOWLISTED.replace(/[^a-zA-Z0-9@.-]/g, '_'))).length).toBe(0);
});

test('allowlisted email signs in and lands on /admin', async ({ page }) => {
  await page.goto('/admin/signin');
  await page.getByLabel(/email/i).fill(ALLOWLISTED);
  await page.getByRole('button', { name: /send sign-in link/i }).click();
  await expect(page).toHaveURL(/sent=1/);

  const entries = await readdir(MAILBOX);
  const mine = entries.find((e) => e.includes(ALLOWLISTED.replace(/[^a-zA-Z0-9@.-]/g, '_')));
  expect(mine).toBeTruthy();

  const raw = await readFile(join(MAILBOX, mine!), 'utf8');
  const parsed = JSON.parse(raw);
  const urlMatch = /https?:\/\/[^\s"'<>]+\/api\/auth\/callback\/email\?[^\s"'<>]+/.exec(parsed.html);
  expect(urlMatch).not.toBeNull();

  await page.goto(urlMatch![0]);
  await expect(page).toHaveURL(/\/admin(\?|$)/);
});

test('sign out returns to home', async ({ page }) => {
  await page.goto('/admin');
  if (/\/admin\/signin/.test(page.url())) {
    await page.getByLabel(/email/i).fill(ALLOWLISTED);
    await page.getByRole('button', { name: /send sign-in link/i }).click();
    await expect(page).toHaveURL(/sent=1/);
    const entries = await readdir(MAILBOX);
    const mine = entries.find((e) => e.includes(ALLOWLISTED.replace(/[^a-zA-Z0-9@.-]/g, '_')));
    const raw = await readFile(join(MAILBOX, mine!), 'utf8');
    const parsed = JSON.parse(raw);
    const urlMatch = /https?:\/\/[^\s"'<>]+\/api\/auth\/callback\/email\?[^\s"'<>]+/.exec(parsed.html)!;
    await page.goto(urlMatch[0]);
  }
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
});
