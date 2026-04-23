import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    env: {
      EMAIL_TRANSPORT: 'file',
      ADMIN_EMAILS: 'e2e-admin@test.local',
      AUTH_SECRET: 'e2e-secret-32-bytes-minimum-abcde',
      ACTION_TOKEN_SECRET: 'e2e-action-secret-32-bytes-abcdefg',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
