# Phase 1 Deployment Runbook

## Prerequisites on VPS

- CloudPanel installed
- Node.js Site created for the target domain (e.g., `studio.ninedsales.com`)
- MySQL database + user created via CloudPanel:
  - Database: `kiki_studio`
  - User: `kiki_prod`, strong password
- Cloudflare R2 bucket + API token (Phase 3 — skip for Phase 1)
- Resend account with verified sending domain
- Cloudflare Turnstile site + secret keys

## First-time deploy

1. SSH to VPS as the site user.
2. Clone repo: `git clone git@github.com:<owner>/kiki-studio-system.git .`
3. `pnpm install --frozen-lockfile`
4. Copy `.env.example` to `.env`, fill in production values:
   - `DATABASE_URL=mysql://kiki_prod:<password>@127.0.0.1:3306/kiki_studio`
   - `RESEND_API_KEY=<from resend.com>`
   - `EMAIL_FROM="Kiki Studio <bookings@<your-verified-domain>>"`
   - `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
   - `ADMIN_NOTIFY_EMAIL=<kiki's email>`
5. Run migrations: `pnpm db:deploy`
6. Seed: `pnpm db:seed`
7. Build: `pnpm build`
8. In CloudPanel → Sites → <your site> → Vhost, set the startup command to: `pnpm start` (port 3000, which CloudPanel proxies from 443)
9. Enable CloudPanel nightly MySQL backup; set the backup location (configure R2 integration once Phase 3 lands — until then, local disk backup is acceptable)

## Subsequent deploys

```bash
git pull
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm build
pm2 reload kiki-studio || (CloudPanel reload via admin UI)
```

## Rollback

```bash
git checkout <previous-commit>
pnpm install --frozen-lockfile
pnpm build
pm2 reload kiki-studio
```

For DB migration rollback: restore from CloudPanel nightly backup into a scratch schema, verify, then swap.

## Post-deploy smoke checks

1. `curl https://<your-domain>/` returns 200 with landing HTML.
2. `curl 'https://<your-domain>/api/availability?service=bridal-standard&date=<tomorrow>'` returns a slot list.
3. Submit a test booking from `/book` with a real phone number; confirm email arrives at `ADMIN_NOTIFY_EMAIL` within 30s.
4. Verify the booking row in Prisma Studio (locally, against a read-only tunnel) or a direct MySQL query.

## Sign-off before handing to Kiki

- Replace placeholder `AvailabilityRule` rows with Kiki's real hours
- Replace placeholder `travel_buffer_minutes` / `min_booking_lead_hours` with her preferences
- Replace any placeholder service descriptions with Kiki's wording (bilingual)

---

## Phase 2a — Admin Dashboard

### New environment variables

- `AUTH_SECRET` — 32+ random bytes (`openssl rand -base64 32`). Required. Rotating primarily invalidates in-flight verification tokens; database sessions persist. To force all sessions to end: `TRUNCATE TABLE Session;`
- `AUTH_URL` — optional; Auth.js v5 auto-detects in most deploys. Set to the public origin if behind a proxy with unusual `Host` rewrites.
- `ADMIN_EMAILS` — comma-separated list of emails allowed to sign in to `/admin`. Case-insensitive, whitespace-trimmed. Adding an admin: edit this var and redeploy.
- `ACTION_TOKEN_SECRET` — 32+ random bytes, distinct from `AUTH_SECRET`. Rotating invalidates outstanding confirm/reject email links; pending bookings need manual re-send.
- `EMAIL_TRANSPORT` — optional, default `resend`. Set to `file` only in local dev / CI.

Phase 1's `NEXTAUTH_SECRET` / `NEXTAUTH_URL` are superseded by `AUTH_SECRET` / `AUTH_URL`.

### Admin operations without a UI (2a omissions)

- **Block a date range.**
  ```sql
  INSERT INTO AvailabilityBlock (id, startAt, endAt, reason, createdAt)
  VALUES (CONCAT('blk_', FLOOR(RAND()*1e9)), '2026-05-01 00:00:00', '2026-05-05 00:00:00', 'Vacation', NOW());
  ```
- **Disable a service.**
  ```sql
  UPDATE Service SET active = FALSE, updatedAt = NOW() WHERE slug = 'party-makeup';
  ```
- **Add a new admin email.** Edit `ADMIN_EMAILS` env var → redeploy.
- **Force all sessions to expire.** `TRUNCATE TABLE Session;` then rotate `AUTH_SECRET`.

### Phase 1 → 2a upgrade

1. Run migrations in order: first `20260424000000_phase2a_audit_log`, then `20260425000000_phase2a_drop_user_role`. Prisma handles both via `prisma migrate deploy`.
2. Regenerate the Prisma client: `pnpm exec prisma generate`.
3. Redeploy the app.
4. Verify the audit backfill: `SELECT COUNT(*) FROM AuditLog WHERE action = 'booking_created';` matches the `Booking` count.

### Token and secret rotation

- `AUTH_SECRET` — in-flight verification tokens become invalid. Sessions persist unless you truncate `Session`.
- `ACTION_TOKEN_SECRET` — all outstanding confirm/reject links in Kiki's inbox become invalid. If a booking has a pending email with a stale link, either re-send via the admin dashboard resend flow or ask Kiki to act via the dashboard directly.
