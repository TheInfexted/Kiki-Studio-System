# Kiki Studio System

Operating system for a solo Korean-style makeup studio — bilingual public site, smart booking wizard, admin dashboard, media library, class enrollment.

## Tech

Next.js 14 · TypeScript · Tailwind 3 · Prisma + MySQL · NextAuth (Phase 2) · Resend · Cloudflare R2 (Phase 3) · Meta WhatsApp Cloud API (Phase 2).

## Get running locally

```bash
pnpm install
cp .env.example .env          # fill in dev keys
docker compose up -d mysql
pnpm db:deploy
pnpm db:seed
pnpm dev                       # http://localhost:3000
```

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm test` — Vitest unit tests
- `pnpm test:e2e` — Playwright end-to-end tests (boots dev server)
- `pnpm db:studio` — Prisma Studio
- `pnpm check:env` — verify required env vars are set

## Layout

See [docs/superpowers/specs/2026-04-22-tier-d-design.md](docs/superpowers/specs/2026-04-22-tier-d-design.md) §5 for folder structure and import rules.

## Resell

To deploy for a different beauty business: fork, swap everything under `src/content/kiki/` for the new client's copy, replace `public/*` imagery, update the seeded services, deploy. `src/modules/`, `src/server/`, `src/ui/`, and `src/lib/` should not be modified.
