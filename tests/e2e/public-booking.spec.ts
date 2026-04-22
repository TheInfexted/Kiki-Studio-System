import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  const { execSync } = await import('node:child_process');
  execSync('pnpm exec tsx tests/fixtures/seed-e2e.ts', { stdio: 'inherit' });
});

test('customer can submit a booking', async ({ page }) => {
  await page.goto('/book');
  await page.getByRole('button', { name: 'Select' }).first().click();

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = tomorrow.toISOString().slice(0, 10);
  await page.locator('input[name="date"]').fill(iso);

  const slot = page.locator('button:has-text(":")').first();
  await expect(slot).toBeVisible({ timeout: 10_000 });
  await slot.click();

  await page.locator('input[name="name"]').fill('E2E Customer');
  await page.locator('input[name="phone"]').fill('017-920 2881');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.locator('iframe')).toBeVisible({ timeout: 10_000 });
  await expect(async () => {
    const submitBtn = page.getByRole('button', { name: /Request booking|Submitting/ });
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 });
  }).toPass();

  await page.getByRole('button', { name: /Request booking/ }).click();
  await expect(page.getByText(/your request is in/i)).toBeVisible({ timeout: 10_000 });
});
