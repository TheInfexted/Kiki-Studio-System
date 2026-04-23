import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), '.env'));
loadEnvFile(resolve(process.cwd(), '.env.local'));

const REQUIRED = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'ADMIN_EMAILS',
  'ACTION_TOKEN_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'ADMIN_NOTIFY_EMAIL',
];

const missing = REQUIRED.filter((k) => !process.env[k] || process.env[k]!.length === 0);

if (missing.length > 0) {
  console.error(`\nMissing env vars:\n  ${missing.join('\n  ')}\n`);
  process.exit(1);
}
console.log(`All ${REQUIRED.length} env vars present.`);
