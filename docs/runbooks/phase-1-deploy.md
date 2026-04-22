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
