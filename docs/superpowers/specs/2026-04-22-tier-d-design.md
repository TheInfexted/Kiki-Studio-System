# Kiki Studio System — Tier D Design

**Date:** 2026-04-22
**Author:** Brendan (with Claude)
**Status:** Approved for implementation planning
**Supersedes:** none
**Source handoff:** `/HANDOFF.md`

---

## 1. Purpose and scope

Tier D is a full studio operating system for Kiki, a solo Korean-style makeup artist in Kepong, KL, and simultaneously a resellable template for other solo beauty businesses. It ships in four phases over six weeks:

| Phase | Week | Ships |
|---|---|---|
| 1 · Public Website + Smart Booking | 2 | Bilingual site (ported from Tier A) + booking wizard persisted to the database |
| 2 · Admin Dashboard + Notifications | 4 | Auth, booking inbox, confirm/reject, revenue, WhatsApp notifications |
| 3 · Media Library + Portfolio CMS | 5 | Drag-drop upload, R2 storage, style tags, featured controls |
| 4 · Class Enrollment Funnel | 6 | Dedicated class page, enrollment, auto-confirm, roster |

The critical-path insight driving the architecture: Kiki will not log into a dashboard daily. Every new booking must push to her WhatsApp with inline Confirm/Reject buttons. The dashboard is for analytics, media upload, and roster management — not for the booking decision.

Out of scope for Tier D: payment gateway integrations, multi-staff scheduling, customer logins, CRM campaigns, automated marketing.

## 2. Guiding constraints

- **Solo developer, 6-week calendar** — bias toward DX over runtime micro-optimizations.
- **Resellable template** — architecture must let a future beauty client fork the repo, swap content, and deploy without touching module internals.
- **Self-hosted VPS + CloudPanel already provisioned** for Tier A at `makeup.ninedsales.com`. Any stack choice that adds recurring infra cost must justify itself against the RM 399/mo care-package margin.
- **Tier A codebase is the starting point** — Next.js 14 App Router, TypeScript, Tailwind 3, Vitest. Port its public pages into the new repo; preserve the deployed site until cutover.

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 App Router | Matches Tier A; upgrade to 15 post-launch if safe |
| Language | TypeScript, `strict: true` | |
| Styling | Tailwind 3 | Port from Tier A verbatim; v4 upgrade is post-launch |
| Database | MySQL 8 on the VPS (CloudPanel-managed) | Zero new infra, native backup tooling |
| ORM | Prisma + Prisma Migrate | Prisma Studio for ops/debugging |
| Auth | NextAuth v5 (Auth.js) — email magic link only | Prisma adapter; admin-only users |
| File storage | Cloudflare R2 via S3-compatible SDK | Near-zero egress; private bucket, signed URLs |
| Transactional email | Resend (free tier: 3000/mo, 100/day) | Booking confirmations to Kiki + customers, magic-link delivery |
| WhatsApp | Meta WhatsApp Cloud API (official) | Interactive buttons for Confirm/Reject |
| Testing | Vitest (unit) + Playwright (e2e admin flows) | |
| Spam protection | Cloudflare Turnstile + honeypot on public forms | No DB table needed |
| Package manager | pnpm | Matches Tier A |
| Deployment | Git push → CloudPanel pull + `pnpm build` + PM2 reload | Standard Node.js Site flow |
| Backups | CloudPanel nightly MySQL dump → R2 (`backups/` prefix, 30-day lifecycle) | Enabled Day 1 |

### 3.1 Stack decisions rejected

- **Supabase (managed Postgres + Auth + Storage).** Rejected because CloudPanel does not natively manage Postgres and the recurring $25/mo Pro fee compounds across resell deployments. Self-hosted MySQL costs nothing extra on infra already paid for.
- **Neon serverless Postgres.** Same reasoning plus egress uncertainty on a portfolio-heavy workload.
- **Supabase Auth / Clerk.** Reject­ed for single-admin dashboard: NextAuth is free, self-hosted, and portable for the resell template.
- **Twilio WhatsApp.** Always more expensive than Meta direct (Twilio adds a flat platform fee on top of Meta's conversation fee). Meta Cloud API wins on unit economics, especially at resell scale.
- **Drizzle / Kysely.** Prisma's DX and the battle-tested NextAuth Prisma adapter outweigh Drizzle's runtime/bundle advantage for this workload.
- **Monorepo (pnpm workspaces or Turborepo) with `apps/public` + `apps/admin`.** The value-prop dissolved once we decided on a single Next.js app with route groups. Collapsed to a single-repo with module boundaries inside `src/`.

### 3.2 Open items for later planning

- **WhatsApp sender identity** (Phase 2). Kiki already has a WhatsApp Business account. If that account is the mobile Business App on her personal number, migrating it to Cloud API disables the mobile app (one number, one surface). Alternative: send from Brendan's WABA (`+60 17-920 2880`) on her behalf and route replies to an in-dashboard inbox. Decide before Phase 2 kickoff.
- **Availability seed data** (Phase 1). Phase 1 ships with placeholder working-hours seed rows and a default travel buffer; a 30-minute working session with Kiki populates her real rules before go-live. The schema is frozen in Phase 1 regardless.
- **NextAuth v5 vs v4** (scaffold time). If Auth.js v5 hasn't gone GA by scaffold day, fall back to v4. Adapter and session API are compatible enough that this is a late-binding choice; no spec changes required.
- **Chinese variant** (content layer). `*_zh` fields are locale-agnostic in the schema. Confirm Simplified vs Traditional with Kiki before seeding content; decision lives in `src/content/kiki/copy.zh.ts`, not in the schema.
- **Reschedule workflow** (post-launch). For Tier D, a reschedule is a cancel + new booking with `admin_notes` linking the two. If usage warrants it later, add `Booking.rescheduled_from_id` as a self-reference — backward-compatible.

## 4. Data model

All money stored as integer cents (MYR × 100). All timestamps stored as UTC `DATETIME`; Asia/Kuala_Lumpur conversion handled at the application layer. Internationalized fields duplicated as `*_en` / `*_zh` rather than through a translations table (only two locales, join-free reads, edited side-by-side in the admin UI).

### 4.1 Phase 1 + 2 — Core entities

**`User`** — admin accounts. NextAuth-managed; the adapter auto-generates `Account`, `Session`, and `VerificationToken` tables.
- Additional field: `role` enum `owner | staff`.

**`Service`**
- `id, slug, name_en, name_zh, description_en, description_zh, category, price_myr_cents, duration_min, active, sort_order`
- `category` enum: `bridal | party | halal | photoshoot | class`
- Tiered pricing (e.g., standard vs premium bridal) modeled as separate rows until a resell client requires proper variants.

**`Client`** — booking subjects; not login users.
- `id, phone, name, email?, instagram_handle?, language_pref, notes, created_at`
- `phone` normalized to E.164 at write time via `src/lib/phone.ts`; unique index on the normalized form.
- Deduplication key: phone.

**`Booking`**
- `id, client_id, service_id, scheduled_at, duration_min, location_type (studio|home|venue), location_address?, location_notes?, status (pending|confirmed|rejected|completed|cancelled|no_show), price_myr_cents_at_booking, customer_notes, admin_notes, payment_status (unpaid|deposit|paid), payment_reference?, created_at, confirmed_at?, confirmed_by_user_id?, rejection_reason?, deleted_at?`
- Soft delete via a Prisma client extension — `deleted_at` auto-filtered from every query.
- Indexes: `@@index([status, scheduled_at])`, `@@index([client_id])`.

### 4.2 Phase 1 — Availability

**`AvailabilityRule`** — weekly recurring working windows. Times are wall-clock **Asia/Kuala_Lumpur**, not UTC — they describe a pattern, not a point in time.
- `id, weekday (0–6), start_time, end_time, active`

**`AvailabilityBlock`** — one-off blackouts (vacation, half-day off). `start_at` / `end_at` are UTC instants.
- `id, start_at, end_at, reason`

Available slots are computed at query time as `AvailabilityRule − AvailabilityBlock − existing Bookings − travel_buffer`. Travel buffer and slot granularity (default 30 min) come from `Setting`. Customer-submitted local times are converted to UTC at the API edge before any DB read or write.

### 4.3 Phase 2 — Notifications

**`WhatsAppMessage`** — full audit trail of outbound and inbound WA traffic.
- `id, booking_id?, class_enrollment_id?, direction (outbound|inbound), template_name?, body, interactive_payload?, provider_message_id, status (queued|sent|delivered|read|failed), error?, created_at`
- CHECK constraint (raw migration; Prisma cannot express it): at most one of `booking_id` and `class_enrollment_id` is set.
- Index: `@@index([booking_id])`.

### 4.4 Phase 3 — Media

**`MediaAsset`**
- `id, r2_key, thumb_r2_key?, blur_hash?, mime_type, width?, height?, size_bytes?, alt_en?, alt_zh?, visible, upload_status (pending|ready|failed), uploaded_by_user_id, created_at, deleted_at?`
- Upload flow: admin POSTs intent → server creates row in `pending` and returns a presigned R2 PUT URL + asset_id → client uploads directly to R2 → client PATCHes asset with dimensions, thumbnail key, blur hash → row flips to `ready`. A nightly cleanup job deletes `pending` rows older than 24 hours plus their R2 blobs.
- Thumbnails generated server-side via `sharp` after the upload PATCH, before flipping status to `ready`; no separate variants table.
- Public portfolio queries filter to `upload_status = 'ready' AND visible AND deleted_at IS NULL`.
- Index: `@@index([visible, upload_status, created_at])`.

**`MediaTag`** — style tags.
- `id, slug, label_en, label_zh`

**`MediaAssetTag`** — join table (hard delete).

**`PortfolioFeature`** — placement logic kept separate from asset storage.
- `id, media_asset_id, placement (hero|grid|category_header), sort_order, visible`

### 4.5 Phase 4 — Classes

**`ClassSession`**
- `id, slug, title_en, title_zh, description_en, description_zh, scheduled_at, duration_min, location, seats_total, price_myr_cents, status (upcoming|full|completed|cancelled)`

**`ClassEnrollment`**
- `id, class_session_id, client_id, payment_status (unpaid|deposit|paid), payment_reference?, attendance_status (registered|attended|no_show), enrolled_at, notes`

### 4.6 Cross-cutting

**`Setting`** — K/V config Kiki self-services without a deploy.
- `key, value_json, updated_by_user_id, updated_at`
- Typed accessors in `src/modules/settings/` wrap the raw table.
- Seeded keys: working-hours defaults, travel_buffer_minutes, slot_granularity_minutes, min_booking_lead_hours, cancellation_policy copy, WA template names.

**`AuditLog`** — write-only, for "who confirmed what when" trust and debugging.
- `id, user_id, entity_type, entity_id, action, diff_json, created_at`
- Index: `@@index([entity_type, entity_id])`.

### 4.7 Deferred (not in Tier D scope)

- `ServiceVariant` — add when a resell client demands tiered pricing.
- `Payment` — the `payment_status` + `payment_reference` fields on `Booking`/`ClassEnrollment` cover manual bank-transfer workflows. Add a real `Payment` table when wiring Billplz or Stripe.
- `RateLimitBucket` — Turnstile + an in-process IP throttle on public `/api/*` routes is sufficient at expected volume.

## 5. Folder structure and module boundaries

```
kiki-studio-system/
├── app/                                  # Next.js App Router
│   ├── (public)/                         # Public-facing routes (no auth)
│   │   ├── page.tsx                      # Landing (ported from Tier A)
│   │   ├── services/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── classes/page.tsx
│   │   └── book/page.tsx                 # Booking wizard entry
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx                # Auth gate (NextAuth session check)
│   │       ├── page.tsx                  # Dashboard overview
│   │       ├── bookings/...
│   │       ├── clients/...
│   │       ├── media/...
│   │       ├── classes/...
│   │       └── settings/...
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── bookings/route.ts             # public POST (create booking)
│   │   ├── classes/enroll/route.ts       # public POST (enroll in class)
│   │   ├── admin/
│   │   │   ├── bookings/route.ts         # authenticated GET / PATCH
│   │   │   └── media/upload/route.ts     # authenticated presigned R2 upload URL
│   │   └── webhooks/
│   │       └── whatsapp/route.ts         # Meta Cloud API callback
│   ├── layout.tsx
│   └── globals.css
│
├── src/
│   ├── modules/                          # Domain modules — strict import boundaries
│   │   ├── booking/
│   │   │   ├── service.ts                # Pure business logic (server-only)
│   │   │   ├── slot-search.ts
│   │   │   ├── components/               # Wizard UI
│   │   │   └── index.ts                  # Public barrel — the only import point
│   │   ├── availability/
│   │   ├── client/
│   │   ├── service/
│   │   ├── media/
│   │   ├── classes/
│   │   ├── notifications/
│   │   ├── audit/
│   │   └── settings/
│   │
│   ├── server/                           # Stateful singletons
│   │   ├── db.ts                         # Prisma client
│   │   ├── auth.ts                       # NextAuth v5 config + session helper
│   │   ├── r2.ts                         # S3-compatible R2 client
│   │   ├── email.ts                      # Resend client wrapper
│   │   └── whatsapp.ts                   # Meta Cloud API fetch client
│   │
│   ├── lib/                              # Framework-agnostic utilities
│   │   ├── phone.ts                      # E.164 normalization
│   │   ├── money.ts                      # Integer-cent helpers
│   │   ├── date.ts                       # Asia/Kuala_Lumpur helpers
│   │   └── i18n.tsx                      # (ported from Tier A)
│   │
│   ├── ui/                               # Design-system primitives
│   │   ├── Button.tsx, Input.tsx, Card.tsx, Dialog.tsx, Toast.tsx, ...
│   │   └── index.ts
│   │
│   └── content/                          # Client-specific strings + seed data
│       └── kiki/                         # A fork for resell swaps this folder
│           ├── brand.ts                  # Name, tagline, colors, contact
│           ├── services.ts               # Seed rows for Service table
│           └── copy.{en,zh}.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                           # Reads from src/content/kiki/
│
├── tests/
│   ├── unit/                             # Vitest — tests module service.ts files
│   ├── e2e/                              # Playwright — public booking + admin flows
│   └── fixtures/                         # Sample availability, bookings, media for e2e setup
│
├── public/                               # Static Tier A assets (hero photos, etc.)
├── docs/superpowers/                     # Specs + plans
├── scripts/                              # One-off ops (backup verify, media reindex)
├── docker-compose.yml                    # Local MySQL 8 for development
├── .env.example
├── package.json, pnpm-lock.yaml, tsconfig.json, next.config.js, tailwind.config.ts
└── README.md
```

### 5.1 Import rules

Enforced by `eslint-plugin-boundaries`. Violations fail lint.

| From | Can import | Cannot import |
|---|---|---|
| `app/**` | `src/modules/*/index.ts`, `src/ui`, `src/lib`, `src/content`, `src/server` | any file inside a module other than its `index.ts` |
| `src/modules/X` | `src/lib`, `src/ui`, `src/server`, `src/content` | other modules directly |
| `src/modules/X/index.ts` | whatever X exports | — |
| `src/server` | `src/lib` only | modules, ui, app, content |
| `src/lib` | nothing internal | everything else |
| `src/ui` | `src/lib` only | modules, server, app, content |
| `src/content` | `src/lib` only | modules, server, ui, app |

### 5.2 Conventions

- **Modules are the unit of resell.** A future beauty client gets the same `src/modules/*` and swaps `src/content/kiki/` for their own brand. Modules never hard-code Kiki copy — content enters via props or DB rows seeded from `src/content/`.
- **`index.ts` barrel per module.** Cross-module calls go through the barrel so internal refactors don't break callers.
- **`src/server` is for stateful singletons only.** One Prisma client per process, one R2 client, one NextAuth instance, one WA Cloud API client, one Resend client. Modules `import { prisma } from '@/server/db'` etc. In tests, mock the module path.
- **`src/lib` is pure and standalone.** If a file in `src/lib` imports anything outside `src/lib`, it's in the wrong folder.
- **`app/` is dumb.** Pages compose modules via their barrels; route handlers in `app/api/*` are thin adapters that call `src/modules/*/service.ts` functions. No business logic inside `app/`.
- **Server-only code is explicit.** Any module file that imports from `src/server` runs server-side only and never appears in a `'use client'` tree.
- **Module `service.ts` signatures take primitives.** They do not accept `Request`/`Response` objects. API routes, server actions, seed scripts, and tests all call the same functions.

## 6. Operational notes

- **Soft delete** — Prisma client extension filters `deleted_at IS NOT NULL` globally for `Booking` and `MediaAsset`. Hard delete for join tables (`MediaAssetTag`) and ephemeral rows (`Session`, `VerificationToken`).
- **Secrets** — `.env` for local; CloudPanel environment variables in production. `AUTH_SECRET`, `DATABASE_URL`, `R2_*`, `WHATSAPP_*`, `TURNSTILE_*`, `RESEND_API_KEY`, `EMAIL_FROM` keys documented in `.env.example`.
- **Backups** — CloudPanel nightly MySQL dump, uploaded to R2 under `backups/` with a 30-day lifecycle rule. Monthly manual restore drill into a scratch schema to prove backups work.
- **Observability** — Phase 1 ships with structured JSON logging via `pino` and request IDs. Prisma Studio for DB inspection. Nothing heavier until scale demands it.
- **Error handling at boundaries only** — validate at the API edge (Zod on route handlers) and at the DB edge (Prisma's own types). Internal module-to-module calls trust each other.
- **Local development** — `docker-compose.yml` at the repo root brings up a MySQL 8 container; the Next.js app runs on the host against it. One command to onboard a new machine.
- **CI** — GitHub Actions on push/PR runs `pnpm lint`, `pnpm test`, `pnpm build`, and `prisma migrate diff` against `main` to catch schema drift. No auto-deploy — prod ships via manual `git pull` on the VPS.

### 6.1 Concurrency and correctness

Six cases the code must handle deliberately, not incidentally:

- **Booking slot race.** Two customers submit bookings for the same slot within seconds; both pass the availability check independently, both insert — double-booked. Mitigation: the `POST /api/bookings` handler opens a transaction, re-runs the slot-availability query with `SELECT ... FOR UPDATE` on the conflict window against `Booking` + `AvailabilityBlock`, then inserts. On conflict, return 409 and the wizard re-prompts. The pure `slot-search.ts` function is pre-flight UX; the transactional re-check is authoritative.
- **Class enrollment race.** Two students enroll in a class with one seat remaining. Mitigation: transaction wraps `SELECT seats_total - COUNT(enrollments) FROM class_session WHERE id = ? FOR UPDATE` followed by the insert; on zero seats, 409 and show "sold out" to the losing request.
- **WhatsApp webhook signature verification.** Every request to `POST /api/webhooks/whatsapp` must be verified against `X-Hub-Signature-256` with the app secret; unverified requests are dropped with 401 before any parsing. Non-negotiable.
- **WhatsApp webhook idempotency.** Meta retries on any non-2xx or >20s response. Every inbound status/message is deduped by `provider_message_id` — insert with a unique index and treat duplicate-key as success (return 200 silently).
- **WhatsApp webhook latency.** The handler must respond in under 20 seconds. For this workload, the sync path (verify → dedupe → update `WhatsAppMessage` + related `Booking` status + `AuditLog` → respond) fits comfortably. If a future template triggers heavy work, move to enqueue-and-respond.
- **Prisma transaction isolation.** Default is `REPEATABLE_READ` on MySQL, which is what we want for the slot and seat re-checks. Don't lower it.

### 6.2 Security notes

- **Webhook secret rotation** is manual via Meta's app dashboard plus a Setting update. Document in the runbook, not the schema.
- **R2 presigned URLs** expire in 10 minutes, scoped to a single `PUT` on a single key.
- **Admin magic-link emails** expire in 15 minutes, single-use. NextAuth defaults are fine.
- **No customer accounts, no password store** — the only credentials in the system are admin magic links and infra secrets.

## 7. Phase-to-phase build sequence

1. **Phase 1 · Week 1–2** — scaffold repo, Prisma schema through §4.2, seed `AvailabilityRule` + `Setting` defaults, wire Resend, port Tier A public pages into `app/(public)/`, build the booking wizard with slot search backed by `AvailabilityRule` + `AvailabilityBlock`, Turnstile on submit, `Booking` row on submit, Resend email to Kiki with the new booking (WhatsApp Confirm/Reject buttons land in Phase 2), confirmation email to the customer with booking details.
2. **Phase 2 · Week 3–4** — NextAuth magic-link login for admin (via Resend), admin layout + bookings inbox, confirm/reject actions with optimistic UI, `WhatsAppMessage` + Meta Cloud API client, interactive Confirm/Reject buttons in outbound templates, inbound webhook routing, revenue summary card, `AuditLog` writes on every status change.
3. **Phase 3 · Week 5** — `MediaAsset` + tagging + `PortfolioFeature` tables, drag-drop upload with presigned R2 URLs, `sharp` thumbnails, admin CRUD, public portfolio page reads from DB.
4. **Phase 4 · Week 6** — `ClassSession` + `ClassEnrollment` tables, public class page, enrollment flow, roster view in admin, auto-confirm for classes (no human approval step).

Each phase ends with a short demo note for Kiki and a tag in git (`phase-1-ship`, `phase-2-ship`, …).

## 8. Success criteria

- **Phase 1** — a real customer can submit a booking from the public site, the row appears in the database, Kiki receives an email; no booking is accepted outside `AvailabilityRule` minus blocks minus existing bookings.
- **Phase 2** — a new booking produces a WhatsApp message to Kiki within 10 seconds; tapping the Confirm button in WA updates the booking status and writes to `AuditLog` without Kiki touching the dashboard.
- **Phase 3** — Kiki uploads a new photo from her phone, tags it, marks it featured, and it appears on the public portfolio within 30 seconds.
- **Phase 4** — a prospective student enrolls in a class from the public site, receives a WA confirmation, and appears in the admin roster.
- **Resell validation (post-launch)** — a fresh `git clone` + swap of `src/content/kiki/` + `.env` + DB seed yields a working deployment for a second beauty business without modifying anything under `src/modules/`, `src/server/`, `src/ui/`, or `src/lib/`.
