const REQUIRED = [
  'DATABASE_URL',
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
