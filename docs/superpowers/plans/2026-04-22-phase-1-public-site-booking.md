# Phase 1 — Public Site + Smart Booking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a bilingual public website with a smart booking wizard that persists bookings to MySQL, enforces availability rules transactionally, and emails Kiki + the customer on submission.

**Architecture:** Single Next.js 14 App Router application on a VPS running MySQL 8 (CloudPanel-managed in prod; Docker Compose locally). Domain logic lives in `src/modules/*` with strict ESLint-enforced import boundaries. Public pages ported from Tier A. Booking creation wraps the availability re-check and the insert in a single transaction with `SELECT … FOR UPDATE` on the conflict window. Emails go through Resend. Spam blocked by Cloudflare Turnstile + honeypot.

**Tech Stack:** Next.js 14.2, TypeScript 5.6 `strict`, Tailwind 3.4, Prisma 5 + Prisma Migrate, MySQL 8, NextAuth Prisma adapter tables (scaffolded now, wired in Phase 2), Resend, Zod, `sharp` (Phase 3), Vitest 2, Playwright, pnpm 9, `eslint-plugin-boundaries`.

**Source spec:** `docs/superpowers/specs/2026-04-22-tier-d-design.md` — sections 3, 4.1, 4.2, 4.6 (`Setting` only), 5, 6, 6.1, 6.2, 7 (Phase 1), 8 (Phase 1 criterion).

---

## File map (Phase 1)

Created in this phase:

- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `next-env.d.ts` — Tier A config, ported
- `.env.example`, `.gitignore`, `README.md`
- `docker-compose.yml` — local MySQL 8
- `.eslintrc.cjs` — extends `next/core-web-vitals` + `eslint-plugin-boundaries`
- `.github/workflows/ci.yml` — lint + test + build + migrate-diff on PR
- `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/*`
- `app/layout.tsx`, `app/globals.css`
- `app/(public)/page.tsx`, `app/(public)/services/page.tsx`, `app/(public)/portfolio/page.tsx`, `app/(public)/classes/page.tsx`, `app/(public)/book/page.tsx`
- `app/api/bookings/route.ts`
- `src/server/db.ts`, `src/server/email.ts`
- `src/lib/phone.ts`, `src/lib/money.ts`, `src/lib/date.ts`, `src/lib/i18n.tsx`
- `src/ui/Button.tsx`, `src/ui/Input.tsx`, `src/ui/Card.tsx`, `src/ui/Select.tsx`, `src/ui/index.ts`
- `src/content/kiki/brand.ts`, `src/content/kiki/services.ts`, `src/content/kiki/copy.en.ts`, `src/content/kiki/copy.zh.ts`
- `src/modules/settings/{service.ts,index.ts}`
- `src/modules/service/{service.ts,index.ts}`
- `src/modules/client/{service.ts,index.ts}`
- `src/modules/availability/{rules.ts,blocks.ts,slot-search.ts,service.ts,index.ts}`
- `src/modules/booking/{service.ts,components/*,index.ts}`
- `src/modules/notifications/{email-templates.ts,service.ts,index.ts}`
- `tests/unit/**` — one file per module `service.ts`
- `tests/e2e/public-booking.spec.ts`
- `tests/fixtures/{availability.ts,services.ts}`
- `scripts/check-env.ts` — fail-fast env var validator for `pnpm dev`/`pnpm build`

Ported verbatim from `~/Desktop/Kiki-Makeup/`:

- `components/Hero.tsx`, `components/Footer.tsx`, `components/LocationSection.tsx`, `components/PhotoStrip.tsx`, `components/FAQAccordion.tsx`, `components/LanguageToggle.tsx`, `components/ServicesSection.tsx`, `components/PortfolioSection/*`, `components/BookingWizard/*` — all moved under `src/ui/` or `src/modules/booking/components/` as appropriate
- `public/*` — hero photos, Tier A static assets

Not created in Phase 1 (deliberately):

- Admin routes under `app/(admin)/*` — Phase 2
- `src/server/auth.ts` — Phase 2
- `src/server/whatsapp.ts` — Phase 2
- `src/server/r2.ts` — Phase 3
- `src/modules/{media,classes,audit}/` — Phase 3/4/2
- `AuditLog`, `WhatsAppMessage`, `MediaAsset*`, `ClassSession`, `ClassEnrollment` tables — later phases

---

## Conventions for this plan

- Every task follows **TDD**: failing test first, run it, implement, run again, commit.
- Commits are frequent — one per completed task, conventional-commit style.
- Exact file paths throughout. Line ranges given when modifying existing files.
- `pnpm` everywhere (not `npm`/`yarn`).
- All new files must satisfy the import rules in spec §5.1. ESLint is configured early (Task 4) so violations fail loudly.

---

## Task 1: Initialize repository and scaffold Next.js

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `next-env.d.ts`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(public)/page.tsx` (placeholder)

- [ ] **Step 1: Initialize git and pnpm workspace**

Run:
```bash
cd ~/Desktop/Kiki-Studio-System
git init
pnpm init
```

Edit `package.json` to:

```json
{
  "name": "kiki-studio-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "check:env": "tsx scripts/check-env.ts"
  },
  "engines": { "node": ">=20" },
  "packageManager": "pnpm@9.12.1"
}
```

- [ ] **Step 2: Add Next.js + React + TS dependencies**

Run:
```bash
pnpm add next@14.2.15 react@18.3.1 react-dom@18.3.1
pnpm add -D typescript@5.6.3 @types/node@20.16.11 @types/react@18.3.11 @types/react-dom@18.3.0 eslint@8.57.1 eslint-config-next@14.2.15
```

Expected: dependencies installed, `pnpm-lock.yaml` generated.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `next.config.js` and `next-env.d.ts`**

`next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};
module.exports = nextConfig;
```

`next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
.next/
out/
.env
.env.local
.env.*.local
*.tsbuildinfo
coverage/
playwright-report/
test-results/
prisma/migrations/dev.db*
.DS_Store
```

- [ ] **Step 6: Create placeholder `app/layout.tsx`, `app/globals.css`, `app/(public)/page.tsx`**

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kiki Studio',
  description: 'Korean-style makeup artist — Kepong, KL',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`app/globals.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
```

`app/(public)/page.tsx`:

```tsx
export default function HomePage() {
  return <main><h1>Kiki Studio — coming soon</h1></main>;
}
```

- [ ] **Step 7: Verify dev server boots**

Run:
```bash
pnpm dev
```

Expected: server starts on `http://localhost:3000`, placeholder loads. Ctrl-C to stop.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: scaffold next.js 14 app router project"
```

---

## Task 2: Add Tailwind 3 styling

**Files:**
- Modify: `package.json` (add Tailwind deps)
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Modify: `app/globals.css`

- [ ] **Step 1: Install Tailwind + PostCSS**

Run:
```bash
pnpm add -D tailwindcss@3.4.13 postcss@8.4.47 autoprefixer@10.4.20
```

- [ ] **Step 2: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf7f4', 100: '#fbe9e1', 500: '#c9826d', 700: '#8a4a36',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Create `postcss.config.js`**

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 4: Replace `app/globals.css` content**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { @apply bg-white text-neutral-900 antialiased; }
```

- [ ] **Step 5: Verify Tailwind classes render**

Modify `app/(public)/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold text-brand-700">Kiki Studio — coming soon</h1>
    </main>
  );
}
```

Run `pnpm dev`, confirm the heading renders in the custom brand color.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: add tailwind 3.4 with brand color tokens"
```

---

## Task 3: Add Docker Compose for local MySQL

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: kiki-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: kiki_studio
      MYSQL_USER: kiki
      MYSQL_PASSWORD: kiki_dev
    ports:
      - '3306:3306'
    volumes:
      - kiki-mysql-data:/var/lib/mysql
    command: ['--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci']
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost', '-u', 'root', '-proot']
      interval: 10s
      timeout: 5s
      retries: 10

volumes:
  kiki-mysql-data:
```

- [ ] **Step 2: Create `.env.example`** (expanded across later tasks; initial stub)

```
# Database
DATABASE_URL="mysql://kiki:kiki_dev@localhost:3306/kiki_studio"

# NextAuth (Phase 2 wires these; placeholder entries documented now)
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

# Resend (transactional email)
RESEND_API_KEY=""
EMAIL_FROM="Kiki Studio <bookings@yourdomain.com>"

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# Public site URL (used in emails + canonical links)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 3: Copy `.env.example` to `.env` and bring MySQL up**

Run:
```bash
cp .env.example .env
docker compose up -d mysql
docker compose ps
```

Expected: `kiki-mysql` container reports `healthy` within ~20 seconds.

- [ ] **Step 4: Verify connection**

Run:
```bash
docker exec -it kiki-mysql mysql -ukiki -pkiki_dev -e "SELECT 1;" kiki_studio
```

Expected: `1` returned.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "chore: add docker compose mysql 8 for local dev"
```

---

## Task 4: Install ESLint boundaries + initial lint config

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.eslintignore`
- Modify: `package.json`

- [ ] **Step 1: Install boundaries plugin**

Run:
```bash
pnpm add -D eslint-plugin-boundaries@4.2.2
```

- [ ] **Step 2: Create `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:boundaries/recommended'],
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'app',     pattern: 'app/**/*' },
      { type: 'module',  pattern: 'src/modules/*', mode: 'folder' },
      { type: 'server',  pattern: 'src/server/*' },
      { type: 'lib',     pattern: 'src/lib/*' },
      { type: 'ui',      pattern: 'src/ui/*' },
      { type: 'content', pattern: 'src/content/**/*' },
    ],
    'boundaries/ignore': ['**/*.test.ts', '**/*.test.tsx', 'tests/**/*'],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app',     allow: ['module', 'ui', 'lib', 'content', 'server'] },
        { from: 'module',  allow: ['lib', 'ui', 'server', 'content'] },
        { from: 'server',  allow: ['lib'] },
        { from: 'ui',      allow: ['lib'] },
        { from: 'content', allow: ['lib'] },
        { from: 'lib',     allow: [] },
      ],
    }],
    'boundaries/entry-point': ['error', {
      default: 'disallow',
      rules: [
        { target: ['module'], allow: 'index.(ts|tsx)' },
      ],
    }],
  },
};
```

- [ ] **Step 3: Create `.eslintignore`**

```
node_modules/
.next/
out/
coverage/
playwright-report/
test-results/
prisma/generated/
```

- [ ] **Step 4: Verify lint runs clean on empty app**

Run:
```bash
pnpm lint
```

Expected: `No ESLint warnings or errors.`

- [ ] **Step 5: Commit**

```bash
git add .eslintrc.cjs .eslintignore package.json pnpm-lock.yaml
git commit -m "chore: wire eslint-plugin-boundaries for module import rules"
```

---

## Task 5: Install Prisma and define Phase 1 + 2 schema

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json`

- [ ] **Step 1: Install Prisma**

Run:
```bash
pnpm add -D prisma@5.22.0 tsx@4.19.2
pnpm add @prisma/client@5.22.0
```

- [ ] **Step 2: Initialize Prisma**

Run:
```bash
pnpm exec prisma init --datasource-provider mysql
```

This creates `prisma/schema.prisma` and adds a `DATABASE_URL` line to `.env` (already present — leave the Prisma-injected one and remove the duplicate if any).

- [ ] **Step 3: Replace `prisma/schema.prisma` with the full Phase 1 + 2 schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// --------- NextAuth adapter tables (wired in Phase 2) ---------

enum UserRole {
  owner
  staff
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole  @default(owner)
  accounts      Account[]
  sessions      Session[]
  confirmedBookings Booking[] @relation("BookingConfirmedBy")
  createdAt     DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// --------- Domain tables ---------

enum ServiceCategory {
  bridal
  party
  halal
  photoshoot
  class_session
}

model Service {
  id                String          @id @default(cuid())
  slug              String          @unique
  nameEn            String
  nameZh            String
  descriptionEn     String          @db.Text
  descriptionZh     String          @db.Text
  category          ServiceCategory
  priceMyrCents     Int
  durationMin       Int
  active            Boolean         @default(true)
  sortOrder         Int             @default(0)
  bookings          Booking[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  @@index([active, sortOrder])
}

enum LanguagePref {
  en
  zh
}

model Client {
  id               String   @id @default(cuid())
  phone            String   @unique // stored E.164, e.g. +60179202880
  name             String
  email            String?
  instagramHandle  String?
  languagePref     LanguagePref @default(en)
  notes            String?  @db.Text
  bookings         Booking[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum BookingStatus {
  pending
  confirmed
  rejected
  completed
  cancelled
  no_show
}

enum BookingLocationType {
  studio
  home
  venue
}

enum PaymentStatus {
  unpaid
  deposit
  paid
}

model Booking {
  id                   String              @id @default(cuid())
  clientId             String
  serviceId            String
  scheduledAt          DateTime            // UTC
  durationMin          Int
  locationType         BookingLocationType
  locationAddress      String?
  locationNotes        String?
  status               BookingStatus       @default(pending)
  priceMyrCentsAtBooking Int
  customerNotes        String?             @db.Text
  adminNotes           String?             @db.Text
  paymentStatus        PaymentStatus       @default(unpaid)
  paymentReference     String?
  confirmedAt          DateTime?
  confirmedByUserId    String?
  rejectionReason      String?
  deletedAt            DateTime?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  client            Client @relation(fields: [clientId], references: [id])
  service           Service @relation(fields: [serviceId], references: [id])
  confirmedByUser   User?   @relation("BookingConfirmedBy", fields: [confirmedByUserId], references: [id])

  @@index([status, scheduledAt])
  @@index([clientId])
  @@index([scheduledAt])
}

model AvailabilityRule {
  id        String  @id @default(cuid())
  weekday   Int     // 0 = Sunday, 6 = Saturday
  startTime String  // "HH:mm" wall-clock Asia/Kuala_Lumpur
  endTime   String  // "HH:mm" wall-clock Asia/Kuala_Lumpur
  active    Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([weekday, active])
}

model AvailabilityBlock {
  id       String   @id @default(cuid())
  startAt  DateTime // UTC
  endAt    DateTime // UTC
  reason   String?
  createdAt DateTime @default(now())
  @@index([startAt, endAt])
}

model Setting {
  key              String   @id
  valueJson        Json
  updatedByUserId  String?
  updatedAt        DateTime @updatedAt
  createdAt        DateTime @default(now())
}
```

- [ ] **Step 4: Format the schema**

Run:
```bash
pnpm exec prisma format
```

Expected: schema rewritten with Prisma's canonical whitespace; no changes to logic.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma .env package.json pnpm-lock.yaml
git commit -m "feat(db): add prisma schema for phase 1 + 2 tables"
```

---

## Task 6: Run initial migration

**Files:**
- Create: `prisma/migrations/<timestamp>_init/migration.sql` (Prisma-generated)

- [ ] **Step 1: Generate and apply the initial migration**

Run:
```bash
pnpm exec prisma migrate dev --name init
```

Expected: a folder `prisma/migrations/<timestamp>_init/` is created with a `migration.sql`; Prisma reports `The migration(s) have been applied successfully.` and re-generates the client.

- [ ] **Step 2: Sanity-check the tables**

Run:
```bash
docker exec kiki-mysql mysql -ukiki -pkiki_dev -e "SHOW TABLES;" kiki_studio
```

Expected output includes: `User`, `Account`, `Session`, `VerificationToken`, `Service`, `Client`, `Booking`, `AvailabilityRule`, `AvailabilityBlock`, `Setting`.

- [ ] **Step 3: Commit**

```bash
git add prisma/migrations
git commit -m "feat(db): initial migration"
```

---

## Task 7: Prisma client singleton

**Files:**
- Create: `src/server/db.ts`
- Test: `tests/unit/server/db.test.ts`

- [ ] **Step 1: Install Vitest now so we can test immediately**

Run:
```bash
pnpm add -D vitest@2.1.2 @testing-library/react@16.0.1 @testing-library/jest-dom@6.6.2 @vitejs/plugin-react@4.3.2 jsdom@25.0.1
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Write failing test `tests/unit/server/db.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { prisma } from '@/server/db';

describe('prisma singleton', () => {
  it('exposes a PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$transaction).toBe('function');
  });

  it('returns the same instance across imports', async () => {
    const again = (await import('@/server/db')).prisma;
    expect(again).toBe(prisma);
  });
});
```

- [ ] **Step 5: Run test, verify it fails**

Run: `pnpm test tests/unit/server/db.test.ts`
Expected: FAIL — cannot resolve `@/server/db`.

- [ ] **Step 6: Implement `src/server/db.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Run test, verify it passes**

Run: `pnpm test tests/unit/server/db.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/server/db.ts tests/unit/server/db.test.ts vitest.config.ts vitest.setup.ts package.json pnpm-lock.yaml
git commit -m "feat(server): prisma client singleton with hot-reload safety"
```

---

## Task 8: Phone normalization utility

**Files:**
- Create: `src/lib/phone.ts`
- Test: `tests/unit/lib/phone.test.ts`

- [ ] **Step 1: Install libphonenumber-js**

Run:
```bash
pnpm add libphonenumber-js@1.11.12
```

- [ ] **Step 2: Write failing test `tests/unit/lib/phone.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { normalizePhone, isValidMalaysianMobile } from '@/lib/phone';

describe('normalizePhone', () => {
  it('normalizes Malaysian mobile numbers with local prefix', () => {
    expect(normalizePhone('017-920 2880', 'MY')).toBe('+60179202880');
    expect(normalizePhone('0179202880', 'MY')).toBe('+60179202880');
  });

  it('normalizes numbers already in international format', () => {
    expect(normalizePhone('+60 17-920 2880', 'MY')).toBe('+60179202880');
    expect(normalizePhone('+60179202880', 'MY')).toBe('+60179202880');
  });

  it('throws on unparseable input', () => {
    expect(() => normalizePhone('not-a-phone', 'MY')).toThrow();
    expect(() => normalizePhone('', 'MY')).toThrow();
  });
});

describe('isValidMalaysianMobile', () => {
  it('accepts valid mobile numbers', () => {
    expect(isValidMalaysianMobile('+60179202880')).toBe(true);
  });
  it('rejects landlines and invalid numbers', () => {
    expect(isValidMalaysianMobile('+60312345678')).toBe(false);
    expect(isValidMalaysianMobile('+60123')).toBe(false);
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `pnpm test tests/unit/lib/phone.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `src/lib/phone.ts`**

```ts
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function normalizePhone(input: string, defaultCountry: CountryCode = 'MY'): string {
  const parsed = parsePhoneNumberFromString(input, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    throw new Error(`Invalid phone number: ${input}`);
  }
  return parsed.number; // E.164, e.g. +60179202880
}

export function isValidMalaysianMobile(e164: string): boolean {
  const parsed = parsePhoneNumberFromString(e164);
  return !!parsed && parsed.country === 'MY' && parsed.getType() === 'MOBILE';
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test tests/unit/lib/phone.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/phone.ts tests/unit/lib/phone.test.ts package.json pnpm-lock.yaml
git commit -m "feat(lib): phone normalization to e.164"
```

---

## Task 9: Money utility

**Files:**
- Create: `src/lib/money.ts`
- Test: `tests/unit/lib/money.test.ts`

- [ ] **Step 1: Write failing test `tests/unit/lib/money.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { fromCents, toCents, formatMYR } from '@/lib/money';

describe('money', () => {
  it('converts cents to decimal ringgit', () => {
    expect(fromCents(12500)).toBe(125);
    expect(fromCents(12550)).toBe(125.5);
    expect(fromCents(0)).toBe(0);
  });

  it('converts ringgit to cents as integers', () => {
    expect(toCents(125)).toBe(12500);
    expect(toCents(125.5)).toBe(12550);
    expect(toCents(125.555)).toBe(12556); // banker's rounding to nearest cent
  });

  it('formats cents as MYR localized string', () => {
    expect(formatMYR(12500)).toBe('RM 125.00');
    expect(formatMYR(12550)).toBe('RM 125.50');
    expect(formatMYR(1000000)).toBe('RM 10,000.00');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/lib/money.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/money.ts`**

```ts
export function fromCents(cents: number): number {
  return cents / 100;
}

export function toCents(ringgit: number): number {
  return Math.round(ringgit * 100);
}

export function formatMYR(cents: number): string {
  const value = fromCents(cents);
  const formatted = new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `RM ${formatted}`;
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test tests/unit/lib/money.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/money.ts tests/unit/lib/money.test.ts
git commit -m "feat(lib): integer-cent money helpers + MYR formatter"
```

---

## Task 10: Date/timezone utilities

**Files:**
- Create: `src/lib/date.ts`
- Test: `tests/unit/lib/date.test.ts`

- [ ] **Step 1: Install date-fns-tz**

Run:
```bash
pnpm add date-fns@4.1.0 date-fns-tz@3.2.0
```

- [ ] **Step 2: Write failing test `tests/unit/lib/date.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { klToUtc, utcToKl, formatKl, KL_TZ } from '@/lib/date';

describe('date helpers', () => {
  it('exports the expected timezone identifier', () => {
    expect(KL_TZ).toBe('Asia/Kuala_Lumpur');
  });

  it('converts a KL wall-clock time to UTC', () => {
    // 2026-05-01 14:00 in KL (UTC+8) → 2026-05-01 06:00 UTC
    const utc = klToUtc(new Date('2026-05-01T14:00:00'));
    expect(utc.toISOString()).toBe('2026-05-01T06:00:00.000Z');
  });

  it('converts UTC to KL wall-clock for display', () => {
    const kl = utcToKl(new Date('2026-05-01T06:00:00.000Z'));
    expect(kl.getFullYear()).toBe(2026);
    expect(kl.getMonth()).toBe(4); // May
    expect(kl.getDate()).toBe(1);
    expect(kl.getHours()).toBe(14);
  });

  it('formats a UTC instant in KL with a pattern', () => {
    expect(formatKl(new Date('2026-05-01T06:00:00.000Z'), 'yyyy-MM-dd HH:mm'))
      .toBe('2026-05-01 14:00');
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `pnpm test tests/unit/lib/date.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement `src/lib/date.ts`**

```ts
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const KL_TZ = 'Asia/Kuala_Lumpur';

/** Treat the given Date's wall-clock components as KL local time, return UTC instant. */
export function klToUtc(klWallClock: Date): Date {
  return fromZonedTime(klWallClock, KL_TZ);
}

/** Return a Date whose wall-clock components are the KL rendering of the UTC instant. */
export function utcToKl(utc: Date): Date {
  return toZonedTime(utc, KL_TZ);
}

export function formatKl(utc: Date, pattern: string): string {
  return formatInTimeZone(utc, KL_TZ, pattern);
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test tests/unit/lib/date.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/date.ts tests/unit/lib/date.test.ts package.json pnpm-lock.yaml
git commit -m "feat(lib): asia/kuala_lumpur timezone helpers"
```

---

## Task 11: Content layer — Kiki brand, services, copy

**Files:**
- Create: `src/content/kiki/brand.ts`
- Create: `src/content/kiki/services.ts`
- Create: `src/content/kiki/copy.en.ts`
- Create: `src/content/kiki/copy.zh.ts`
- Create: `src/content/kiki/index.ts`

- [ ] **Step 1: Create `src/content/kiki/brand.ts`**

```ts
export const brand = {
  name: 'Kiki Studio',
  tagline: {
    en: 'Korean-style makeup artistry in Kepong, KL',
    zh: '吉隆坡甲洞韩式彩妆',
  },
  instagram: 'https://instagram.com/kiki.makeup___',
  whatsapp: '+60179202880',
  email: 'bookings@kiki.studio',
  address: {
    line1: 'Kepong',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
  },
  colors: {
    primary: '#c9826d',
    accent: '#fbe9e1',
  },
} as const;
```

- [ ] **Step 2: Create `src/content/kiki/services.ts`**

```ts
import type { ServiceCategory } from '@prisma/client';

export interface ServiceSeed {
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  category: ServiceCategory;
  priceMyrCents: number;
  durationMin: number;
  sortOrder: number;
}

export const serviceSeeds: ServiceSeed[] = [
  {
    slug: 'bridal-standard',
    nameEn: 'Bridal Makeup — Standard',
    nameZh: '新娘妆 — 标准',
    descriptionEn: 'Full bridal makeup with natural Korean aesthetic. Includes trial session at studio.',
    descriptionZh: '韩式自然风格新娘妆,包含一次试妆。',
    category: 'bridal',
    priceMyrCents: 80000, // RM 800
    durationMin: 180,
    sortOrder: 10,
  },
  {
    slug: 'bridal-premium',
    nameEn: 'Bridal Makeup — Premium',
    nameZh: '新娘妆 — 高级',
    descriptionEn: 'Premium bridal package with two looks, on-site touch-ups, and trial.',
    descriptionZh: '高级新娘妆,两款造型加现场补妆与试妆。',
    category: 'bridal',
    priceMyrCents: 120000,
    durationMin: 240,
    sortOrder: 20,
  },
  {
    slug: 'party-glam',
    nameEn: 'Party / Event Makeup',
    nameZh: '派对妆',
    descriptionEn: 'Evening or event makeup, done at studio or on-site.',
    descriptionZh: '派对或活动妆容,可至工作室或上门服务。',
    category: 'party',
    priceMyrCents: 25000,
    durationMin: 75,
    sortOrder: 30,
  },
  {
    slug: 'halal-bridal',
    nameEn: 'Halal Bridal Makeup',
    nameZh: '清真新娘妆',
    descriptionEn: 'Halal-certified product set for Muslim brides.',
    descriptionZh: '使用清真认证化妆品,专为穆斯林新娘设计。',
    category: 'halal',
    priceMyrCents: 90000,
    durationMin: 180,
    sortOrder: 40,
  },
  {
    slug: 'photoshoot',
    nameEn: 'Photoshoot Makeup',
    nameZh: '写真妆',
    descriptionEn: 'Commercial or personal photoshoot makeup, camera-ready.',
    descriptionZh: '商业或个人写真妆,适合镜头拍摄。',
    category: 'photoshoot',
    priceMyrCents: 30000,
    durationMin: 90,
    sortOrder: 50,
  },
];
```

- [ ] **Step 3: Create `src/content/kiki/copy.en.ts`**

```ts
export const copyEn = {
  nav: {
    home: 'Home',
    services: 'Services',
    portfolio: 'Portfolio',
    classes: 'Classes',
    book: 'Book now',
  },
  landing: {
    heroHeadline: 'Korean-style bridal & event makeup',
    heroSub: 'Soft, camera-ready looks for your big day. Studio-based in Kepong, KL.',
    heroCta: 'Book your session',
  },
  booking: {
    title: 'Book your session',
    stepService: 'Pick a service',
    stepSlot: 'Choose a time',
    stepDetails: 'Your details',
    stepReview: 'Review and confirm',
    nameLabel: 'Full name',
    phoneLabel: 'WhatsApp number',
    emailLabel: 'Email (optional)',
    notesLabel: 'Anything we should know?',
    submit: 'Request booking',
    submittingFallback: 'Submitting…',
    successTitle: 'Thanks — your request is in',
    successBody: 'Kiki will confirm via WhatsApp shortly. Keep an eye on your phone.',
    errorTitle: 'Something went wrong',
    errorSlotTaken: 'That time just got booked. Please pick another slot.',
  },
  footer: {
    rights: '© Kiki Studio',
  },
} as const;

export type Copy = typeof copyEn;
```

- [ ] **Step 4: Create `src/content/kiki/copy.zh.ts`**

```ts
import type { Copy } from './copy.en';

export const copyZh: Copy = {
  nav: {
    home: '首页',
    services: '服务',
    portfolio: '作品集',
    classes: '课程',
    book: '立即预订',
  },
  landing: {
    heroHeadline: '韩式新娘与活动彩妆',
    heroSub: '柔和自然、上镜的妆容。工作室位于吉隆坡甲洞。',
    heroCta: '预订您的档期',
  },
  booking: {
    title: '预订档期',
    stepService: '选择服务',
    stepSlot: '选择时间',
    stepDetails: '您的资料',
    stepReview: '确认详情',
    nameLabel: '姓名',
    phoneLabel: 'WhatsApp 号码',
    emailLabel: '电子邮件(选填)',
    notesLabel: '备注',
    submit: '提交预订',
    submittingFallback: '提交中…',
    successTitle: '已收到您的预订',
    successBody: 'Kiki 很快会通过 WhatsApp 确认,请留意您的手机。',
    errorTitle: '出现问题',
    errorSlotTaken: '该时段刚被预订,请选择其他时间。',
  },
  footer: {
    rights: '© Kiki Studio',
  },
};
```

- [ ] **Step 5: Create `src/content/kiki/index.ts`**

```ts
export { brand } from './brand';
export { serviceSeeds, type ServiceSeed } from './services';
export { copyEn, type Copy } from './copy.en';
export { copyZh } from './copy.zh';
```

- [ ] **Step 6: Run lint to confirm content layer doesn't import forbidden things**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/content
git commit -m "feat(content): kiki brand, services seed, en/zh copy"
```

---

## Task 12: i18n hook (port from Tier A, adapt to content layer)

**Files:**
- Create: `src/lib/i18n.tsx`
- Test: `tests/unit/lib/i18n.test.tsx`

- [ ] **Step 1: Write failing test `tests/unit/lib/i18n.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, useI18n } from '@/lib/i18n';

function Probe() {
  const { lang, setLang, t } = useI18n();
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <span data-testid="hero">{t.landing.heroHeadline}</span>
      <button onClick={() => setLang('zh')}>zh</button>
    </>
  );
}

describe('i18n', () => {
  it('defaults to english and renders copy', () => {
    render(<I18nProvider initial="en"><Probe /></I18nProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('hero').textContent).toMatch(/Korean-style/);
  });

  it('switches to chinese when setLang is called', () => {
    render(<I18nProvider initial="en"><Probe /></I18nProvider>);
    fireEvent.click(screen.getByText('zh'));
    expect(screen.getByTestId('lang').textContent).toBe('zh');
    expect(screen.getByTestId('hero').textContent).toMatch(/韩式/);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/lib/i18n.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/i18n.tsx`**

Note: `src/lib` is not allowed to import from `src/content` per ESLint rules. We invert the dependency: the provider takes a `packs` prop containing the copy dictionaries.

```tsx
'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'zh';

export interface I18nPack {
  en: unknown;
  zh: unknown;
}

interface I18nValue<T> {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: T;
}

const I18nContext = createContext<I18nValue<unknown> | null>(null);

interface ProviderProps<T extends I18nPack> {
  packs: T;
  initial?: Lang;
  children: ReactNode;
}

export function I18nProvider<T extends I18nPack>({ packs, initial = 'en', children }: ProviderProps<T>) {
  const [lang, setLang] = useState<Lang>(initial);
  const t = lang === 'en' ? packs.en : packs.zh;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n<T = unknown>(): I18nValue<T> {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx as I18nValue<T>;
}
```

The test above passes `<I18nProvider initial="en">` without a `packs` prop. Update the test to supply packs:

Replace the test's `I18nProvider` usage:

```tsx
import { copyEn } from '@/content/kiki/copy.en';
import { copyZh } from '@/content/kiki/copy.zh';

const packs = { en: copyEn, zh: copyZh };

// ... both renders become:
render(<I18nProvider packs={packs} initial="en"><Probe /></I18nProvider>);
```

And update `Probe` to type the hook:

```tsx
import type { Copy } from '@/content/kiki/copy.en';
const { lang, setLang, t } = useI18n<Copy>();
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test tests/unit/lib/i18n.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.tsx tests/unit/lib/i18n.test.tsx
git commit -m "feat(lib): i18n provider with injected copy packs"
```

---

## Task 13: UI primitives (Button, Input, Card, Select)

**Files:**
- Create: `src/ui/Button.tsx`
- Create: `src/ui/Input.tsx`
- Create: `src/ui/Card.tsx`
- Create: `src/ui/Select.tsx`
- Create: `src/ui/index.ts`

- [ ] **Step 1: Create `src/ui/Button.tsx`**

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-700 disabled:bg-neutral-400',
  secondary: 'bg-white border border-brand-500 text-brand-700 hover:bg-brand-50',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
      {...rest}
    />
  );
});
```

- [ ] **Step 2: Create `src/ui/Input.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block text-sm" htmlFor={inputId}>
      {label && <span className="mb-1 block font-medium text-neutral-800">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-neutral-300'} px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
```

- [ ] **Step 3: Create `src/ui/Card.tsx`**

```tsx
import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border border-neutral-200 bg-white p-6 shadow-sm ${className}`} {...rest} />;
}
```

- [ ] **Step 4: Create `src/ui/Select.tsx`**

```tsx
import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className = '', children, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <label className="block text-sm" htmlFor={selectId}>
      {label && <span className="mb-1 block font-medium text-neutral-800">{label}</span>}
      <select
        ref={ref}
        id={selectId}
        className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-neutral-300'} bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
```

- [ ] **Step 5: Create `src/ui/index.ts`**

```ts
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Card } from './Card';
export { Select, type SelectProps } from './Select';
```

- [ ] **Step 6: Lint + commit**

Run: `pnpm lint`
Expected: clean.

```bash
git add src/ui
git commit -m "feat(ui): add button, input, card, select primitives"
```

---

## Task 14: Settings module

**Files:**
- Create: `src/modules/settings/service.ts`
- Create: `src/modules/settings/index.ts`
- Test: `tests/unit/modules/settings.test.ts`

Settings module provides typed accessors for the `Setting` K/V table. Phase 1 uses four keys:

- `working_hours.default` — used only as a marker that seeding occurred
- `travel_buffer_minutes` — integer
- `slot_granularity_minutes` — integer (default 30)
- `min_booking_lead_hours` — integer (default 24)

- [ ] **Step 1: Write failing test `tests/unit/modules/settings.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSetting, setSetting, type SettingSchema } from '@/modules/settings';

// Mock the prisma module used by the settings service
vi.mock('@/server/db', () => {
  const store = new Map<string, unknown>();
  return {
    prisma: {
      setting: {
        findUnique: vi.fn(async ({ where: { key } }) =>
          store.has(key) ? { key, valueJson: store.get(key) } : null,
        ),
        upsert: vi.fn(async ({ where: { key }, create, update }) => {
          store.set(key, create.valueJson ?? update.valueJson);
          return { key, valueJson: store.get(key) };
        }),
      },
    },
  };
});

describe('settings service', () => {
  it('reads a default when the key is missing', async () => {
    const value = await getSetting('slot_granularity_minutes');
    expect(value).toBe(30);
  });

  it('writes a value and reads it back', async () => {
    await setSetting('travel_buffer_minutes', 45);
    const value = await getSetting('travel_buffer_minutes');
    expect(value).toBe(45);
  });

  it('throws on an unknown key', async () => {
    await expect(getSetting('not_a_real_key' as keyof SettingSchema)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/modules/settings.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/modules/settings/service.ts`**

```ts
import { prisma } from '@/server/db';

export interface SettingSchema {
  travel_buffer_minutes: number;
  slot_granularity_minutes: number;
  min_booking_lead_hours: number;
}

const DEFAULTS: SettingSchema = {
  travel_buffer_minutes: 30,
  slot_granularity_minutes: 30,
  min_booking_lead_hours: 24,
};

export async function getSetting<K extends keyof SettingSchema>(key: K): Promise<SettingSchema[K]> {
  if (!(key in DEFAULTS)) {
    throw new Error(`Unknown setting key: ${String(key)}`);
  }
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return DEFAULTS[key];
  return row.valueJson as SettingSchema[K];
}

export async function setSetting<K extends keyof SettingSchema>(
  key: K,
  value: SettingSchema[K],
  updatedByUserId?: string,
): Promise<void> {
  if (!(key in DEFAULTS)) {
    throw new Error(`Unknown setting key: ${String(key)}`);
  }
  await prisma.setting.upsert({
    where: { key },
    create: { key, valueJson: value as never, updatedByUserId },
    update: { valueJson: value as never, updatedByUserId },
  });
}
```

- [ ] **Step 4: Implement `src/modules/settings/index.ts`**

```ts
export { getSetting, setSetting, type SettingSchema } from './service';
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test tests/unit/modules/settings.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/modules/settings tests/unit/modules/settings.test.ts
git commit -m "feat(settings): typed key/value settings with defaults"
```

---

## Task 15: Service module

**Files:**
- Create: `src/modules/service/service.ts`
- Create: `src/modules/service/index.ts`
- Test: `tests/unit/modules/service.test.ts`

- [ ] **Step 1: Write failing test `tests/unit/modules/service.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { listActiveServices, getServiceBySlug } from '@/modules/service';

const fakeRows = [
  { id: 's1', slug: 'bridal-standard', active: true, sortOrder: 10, nameEn: 'A', nameZh: 'A', descriptionEn: '', descriptionZh: '', category: 'bridal', priceMyrCents: 80000, durationMin: 180 },
  { id: 's2', slug: 'party-glam', active: true, sortOrder: 30, nameEn: 'B', nameZh: 'B', descriptionEn: '', descriptionZh: '', category: 'party', priceMyrCents: 25000, durationMin: 75 },
  { id: 's3', slug: 'hidden', active: false, sortOrder: 99, nameEn: 'C', nameZh: 'C', descriptionEn: '', descriptionZh: '', category: 'party', priceMyrCents: 0, durationMin: 30 },
];

vi.mock('@/server/db', () => ({
  prisma: {
    service: {
      findMany: vi.fn(async ({ where, orderBy }) => {
        return fakeRows.filter(r => !where || r.active === where.active).sort((a, b) => a.sortOrder - b.sortOrder);
      }),
      findUnique: vi.fn(async ({ where: { slug } }) => fakeRows.find(r => r.slug === slug) ?? null),
    },
  },
}));

describe('service module', () => {
  it('lists only active services in sort order', async () => {
    const rows = await listActiveServices();
    expect(rows.map(r => r.slug)).toEqual(['bridal-standard', 'party-glam']);
  });

  it('fetches a service by slug', async () => {
    const row = await getServiceBySlug('party-glam');
    expect(row?.slug).toBe('party-glam');
  });

  it('returns null for an unknown slug', async () => {
    const row = await getServiceBySlug('nope');
    expect(row).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/modules/service.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/modules/service/service.ts`**

```ts
import { prisma } from '@/server/db';
import type { Service } from '@prisma/client';

export async function listActiveServices(): Promise<Service[]> {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return prisma.service.findUnique({ where: { slug } });
}
```

- [ ] **Step 4: Implement `src/modules/service/index.ts`**

```ts
export { listActiveServices, getServiceBySlug } from './service';
export type { Service } from '@prisma/client';
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test tests/unit/modules/service.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/modules/service tests/unit/modules/service.test.ts
git commit -m "feat(service): list active services + lookup by slug"
```

---

## Task 16: Client module (find-or-create by phone)

**Files:**
- Create: `src/modules/client/service.ts`
- Create: `src/modules/client/index.ts`
- Test: `tests/unit/modules/client.test.ts`

- [ ] **Step 1: Write failing test `tests/unit/modules/client.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { findOrCreateClient } from '@/modules/client';

const store = new Map<string, any>();

vi.mock('@/server/db', () => ({
  prisma: {
    client: {
      findUnique: vi.fn(async ({ where: { phone } }) => store.get(phone) ?? null),
      create: vi.fn(async ({ data }) => {
        const row = { id: `c-${store.size + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        store.set(data.phone, row);
        return row;
      }),
      update: vi.fn(async ({ where: { phone }, data }) => {
        const row = { ...store.get(phone), ...data };
        store.set(phone, row);
        return row;
      }),
    },
  },
}));

describe('client.findOrCreateClient', () => {
  it('creates a client on first call with unformatted phone input', async () => {
    const c = await findOrCreateClient({ phone: '017-920 2880', name: 'Aisha', languagePref: 'en' });
    expect(c.phone).toBe('+60179202880');
    expect(c.name).toBe('Aisha');
  });

  it('returns the same row (same phone) on second call', async () => {
    const c = await findOrCreateClient({ phone: '+60179202880', name: 'Aisha Updated', languagePref: 'en' });
    expect(c.id).toBe('c-1');
  });

  it('rejects a phone that cannot be parsed', async () => {
    await expect(findOrCreateClient({ phone: 'xxx', name: 'X', languagePref: 'en' })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/modules/client.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/modules/client/service.ts`**

```ts
import { prisma } from '@/server/db';
import { normalizePhone } from '@/lib/phone';
import type { Client, LanguagePref } from '@prisma/client';

export interface FindOrCreateInput {
  phone: string;
  name: string;
  email?: string;
  instagramHandle?: string;
  languagePref: LanguagePref;
  notes?: string;
}

export async function findOrCreateClient(input: FindOrCreateInput): Promise<Client> {
  const phone = normalizePhone(input.phone);
  const existing = await prisma.client.findUnique({ where: { phone } });
  if (existing) return existing;
  return prisma.client.create({
    data: {
      phone,
      name: input.name,
      email: input.email,
      instagramHandle: input.instagramHandle,
      languagePref: input.languagePref,
      notes: input.notes,
    },
  });
}
```

- [ ] **Step 4: Implement `src/modules/client/index.ts`**

```ts
export { findOrCreateClient, type FindOrCreateInput } from './service';
export type { Client } from '@prisma/client';
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test tests/unit/modules/client.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/modules/client tests/unit/modules/client.test.ts
git commit -m "feat(client): find-or-create by normalized phone"
```

---

## Task 17: Availability module — slot search

**Files:**
- Create: `src/modules/availability/slot-search.ts`
- Create: `src/modules/availability/service.ts`
- Create: `src/modules/availability/index.ts`
- Test: `tests/unit/modules/availability.test.ts`

The slot-search function is **pure** (takes rules, blocks, existing bookings, and settings as arguments) so it's trivially unit-testable without a DB. A thin `service.ts` wraps it with the Prisma reads.

- [ ] **Step 1: Write failing test `tests/unit/modules/availability.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { computeAvailableSlots } from '@/modules/availability/slot-search';

describe('computeAvailableSlots', () => {
  const rules = [
    // Mon 10:00–18:00 KL
    { id: 'r1', weekday: 1, startTime: '10:00', endTime: '18:00', active: true },
  ];

  it('returns slots inside the rule, minus travel buffer', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04', // Monday
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'), // 08:00 KL that morning
      rules,
      blocks: [],
      existingBookings: [],
    });
    expect(slots[0].startKl).toBe('10:00');
    expect(slots.at(-1)!.startKl).toBe('17:00'); // last 60-min slot starts at 17:00
  });

  it('excludes a slot that overlaps an existing booking', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [],
      existingBookings: [
        // 12:00–13:30 KL = 04:00–05:30 UTC
        { scheduledAt: new Date('2026-05-04T04:00:00Z'), durationMin: 90 },
      ],
    });
    expect(slots.find(s => s.startKl === '11:30')).toBeUndefined();
    expect(slots.find(s => s.startKl === '12:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '12:30')).toBeUndefined();
    expect(slots.find(s => s.startKl === '13:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '13:30')).toBeDefined();
  });

  it('respects an availability block', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [{ startAt: new Date('2026-05-04T06:00:00Z'), endAt: new Date('2026-05-04T08:00:00Z') }], // 14:00–16:00 KL
      existingBookings: [],
    });
    expect(slots.find(s => s.startKl === '14:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '15:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '13:30')).toBeDefined(); // ends at 14:30, overlaps block → excluded
    expect(slots.find(s => s.startKl === '16:00')).toBeDefined();
  });

  it('enforces the minimum lead time', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 0,
      minLeadHours: 24,
      now: new Date('2026-05-03T06:00:00Z'), // 14:00 KL Sunday
      rules,
      blocks: [],
      existingBookings: [],
    });
    // First acceptable slot is >= 14:00 KL Monday (24h later)
    expect(slots.find(s => s.startKl === '10:00')).toBeUndefined();
    expect(slots.find(s => s.startKl === '14:00')).toBeDefined();
  });

  it('adds travel buffer around an existing home booking', () => {
    const slots = computeAvailableSlots({
      dateKl: '2026-05-04',
      durationMin: 60,
      slotGranularityMin: 30,
      travelBufferMin: 60,
      minLeadHours: 0,
      now: new Date('2026-05-04T00:00:00Z'),
      rules,
      blocks: [],
      existingBookings: [
        // 12:00–13:00 KL
        { scheduledAt: new Date('2026-05-04T04:00:00Z'), durationMin: 60 },
      ],
    });
    expect(slots.find(s => s.startKl === '11:00')).toBeUndefined(); // 11:00 + 60min = 12:00 = conflict via buffer
    expect(slots.find(s => s.startKl === '14:00')).toBeDefined(); // 13:00 end + 60 buffer = 14:00 ok
    expect(slots.find(s => s.startKl === '13:30')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/modules/availability.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/modules/availability/slot-search.ts`**

```ts
import { klToUtc, formatKl } from '@/lib/date';

export interface SlotSearchRule {
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
}
export interface SlotSearchBlock {
  startAt: Date;
  endAt: Date;
}
export interface SlotSearchBooking {
  scheduledAt: Date;
  durationMin: number;
}

export interface SlotSearchInput {
  /** ISO date "YYYY-MM-DD" in KL local calendar */
  dateKl: string;
  durationMin: number;
  slotGranularityMin: number;
  travelBufferMin: number;
  minLeadHours: number;
  now: Date;
  rules: SlotSearchRule[];
  blocks: SlotSearchBlock[];
  existingBookings: SlotSearchBooking[];
}

export interface Slot {
  /** "HH:mm" wall-clock KL */
  startKl: string;
  /** UTC instant */
  startAt: Date;
  /** UTC instant */
  endAt: Date;
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(':').map(Number);
  return { h, m };
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function computeAvailableSlots(input: SlotSearchInput): Slot[] {
  const [y, m, d] = input.dateKl.split('-').map(Number);
  const klMidnight = new Date(y, m - 1, d, 0, 0, 0);
  const weekday = klMidnight.getDay();
  const dayRules = input.rules.filter(r => r.active && r.weekday === weekday);
  if (dayRules.length === 0) return [];

  const minStart = addMinutes(input.now, input.minLeadHours * 60);
  const slots: Slot[] = [];

  for (const rule of dayRules) {
    const { h: sh, m: sm } = parseHm(rule.startTime);
    const { h: eh, m: em } = parseHm(rule.endTime);
    const windowStartKl = new Date(y, m - 1, d, sh, sm, 0);
    const windowEndKl = new Date(y, m - 1, d, eh, em, 0);
    const windowStartUtc = klToUtc(windowStartKl);
    const windowEndUtc = klToUtc(windowEndKl);

    let cursor = windowStartUtc;
    while (addMinutes(cursor, input.durationMin) <= windowEndUtc) {
      const slotEnd = addMinutes(cursor, input.durationMin);

      if (cursor < minStart) {
        cursor = addMinutes(cursor, input.slotGranularityMin);
        continue;
      }

      const conflictsBlock = input.blocks.some(b => overlaps(cursor, slotEnd, b.startAt, b.endAt));
      const conflictsBooking = input.existingBookings.some(b => {
        const bStart = addMinutes(b.scheduledAt, -input.travelBufferMin);
        const bEnd = addMinutes(b.scheduledAt, b.durationMin + input.travelBufferMin);
        return overlaps(cursor, slotEnd, bStart, bEnd);
      });

      if (!conflictsBlock && !conflictsBooking) {
        slots.push({
          startKl: formatKl(cursor, 'HH:mm'),
          startAt: cursor,
          endAt: slotEnd,
        });
      }

      cursor = addMinutes(cursor, input.slotGranularityMin);
    }
  }

  return slots;
}
```

- [ ] **Step 4: Implement `src/modules/availability/service.ts`** (DB-backed wrapper)

```ts
import { prisma } from '@/server/db';
import { computeAvailableSlots, type Slot } from './slot-search';
import { getSetting } from '@/modules/settings';

export async function getAvailableSlots(params: {
  dateKl: string;
  durationMin: number;
  now?: Date;
}): Promise<Slot[]> {
  const now = params.now ?? new Date();
  const [granularity, buffer, lead, rules, blocks, bookings] = await Promise.all([
    getSetting('slot_granularity_minutes'),
    getSetting('travel_buffer_minutes'),
    getSetting('min_booking_lead_hours'),
    prisma.availabilityRule.findMany({ where: { active: true } }),
    prisma.availabilityBlock.findMany({
      where: {
        endAt: { gte: new Date(`${params.dateKl}T00:00:00Z`) },
        startAt: { lte: new Date(`${params.dateKl}T23:59:59Z`) },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        scheduledAt: {
          gte: new Date(`${params.dateKl}T00:00:00Z`),
          lte: new Date(`${params.dateKl}T23:59:59Z`),
        },
        deletedAt: null,
      },
      select: { scheduledAt: true, durationMin: true },
    }),
  ]);

  return computeAvailableSlots({
    dateKl: params.dateKl,
    durationMin: params.durationMin,
    slotGranularityMin: granularity,
    travelBufferMin: buffer,
    minLeadHours: lead,
    now,
    rules,
    blocks,
    existingBookings: bookings,
  });
}
```

- [ ] **Step 5: Implement `src/modules/availability/index.ts`**

```ts
export { getAvailableSlots } from './service';
export { computeAvailableSlots, type Slot } from './slot-search';
```

- [ ] **Step 6: Run test, verify it passes**

Run: `pnpm test tests/unit/modules/availability.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add src/modules/availability tests/unit/modules/availability.test.ts
git commit -m "feat(availability): pure slot-search + db wrapper"
```

---

## Task 18: Resend email client singleton

**Files:**
- Create: `src/server/email.ts`

- [ ] **Step 1: Install Resend SDK**

Run:
```bash
pnpm add resend@4.0.1
```

- [ ] **Step 2: Implement `src/server/email.ts`**

```ts
import { Resend } from 'resend';

const globalForResend = globalThis as unknown as { resend?: Resend };

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return globalForResend.resend ?? (globalForResend.resend = new Resend(apiKey));
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error('EMAIL_FROM is not set');
  const resend = getResend();
  const res = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });
  if (res.error) throw new Error(`Resend error: ${res.error.message}`);
  return { id: res.data!.id };
}
```

- [ ] **Step 3: Lint + commit**

Run: `pnpm lint`
Expected: clean.

```bash
git add src/server/email.ts package.json pnpm-lock.yaml
git commit -m "feat(server): resend email client singleton"
```

---

## Task 19: Notifications module — booking email templates

**Files:**
- Create: `src/modules/notifications/email-templates.ts`
- Create: `src/modules/notifications/service.ts`
- Create: `src/modules/notifications/index.ts`
- Test: `tests/unit/modules/notifications.test.ts`

- [ ] **Step 1: Write failing test `tests/unit/modules/notifications.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { renderNewBookingAdminEmail, renderCustomerConfirmationEmail } from '@/modules/notifications';

describe('email templates', () => {
  const baseCtx = {
    bookingId: 'bk_123',
    customerName: 'Aisha',
    customerPhone: '+60179202880',
    customerEmail: 'aisha@example.com',
    serviceName: 'Bridal Standard',
    scheduledAtKl: '2026-05-01 14:00',
    durationMin: 180,
    priceMyrCents: 80000,
    locationSummary: 'Studio · Kepong, KL',
    customerNotes: 'Soft glam',
    siteUrl: 'https://kiki.studio',
    lang: 'en' as const,
  };

  it('admin email includes every booking detail', () => {
    const { subject, html, text } = renderNewBookingAdminEmail(baseCtx);
    expect(subject).toMatch(/New booking/);
    expect(html).toContain('Aisha');
    expect(html).toContain('+60179202880');
    expect(html).toContain('Bridal Standard');
    expect(html).toContain('2026-05-01 14:00');
    expect(html).toContain('RM 800.00');
    expect(text).toContain('Aisha');
  });

  it('customer email excludes admin-only fields', () => {
    const { subject, html } = renderCustomerConfirmationEmail(baseCtx);
    expect(subject).toMatch(/Booking request received/);
    expect(html).toContain('Aisha');
    expect(html).toContain('Bridal Standard');
    expect(html).toContain('2026-05-01 14:00');
    expect(html).not.toContain('+60179202880');
  });

  it('renders chinese copy when lang is zh', () => {
    const { subject, html } = renderCustomerConfirmationEmail({ ...baseCtx, lang: 'zh' });
    expect(subject).toMatch(/已收到/);
    expect(html).toMatch(/Aisha/);
  });
});

vi.mock('@/server/email', () => ({ sendEmail: vi.fn(async () => ({ id: 'res_1' })) }));

import { sendBookingCreatedNotifications } from '@/modules/notifications';

describe('sendBookingCreatedNotifications', () => {
  it('sends both admin and customer emails', async () => {
    const { sendEmail } = await import('@/server/email');
    const result = await sendBookingCreatedNotifications({
      adminEmails: ['kiki@studio.com'],
      customerEmail: 'aisha@example.com',
      context: {
        bookingId: 'bk_123',
        customerName: 'Aisha',
        customerPhone: '+60179202880',
        serviceName: 'Bridal Standard',
        scheduledAtKl: '2026-05-01 14:00',
        durationMin: 180,
        priceMyrCents: 80000,
        locationSummary: 'Studio',
        siteUrl: 'https://kiki.studio',
        lang: 'en',
      },
    });
    expect(result.adminResult.id).toBe('res_1');
    expect(result.customerResult?.id).toBe('res_1');
    expect((sendEmail as any).mock.calls.length).toBe(2);
  });

  it('skips customer email when no address provided', async () => {
    const result = await sendBookingCreatedNotifications({
      adminEmails: ['kiki@studio.com'],
      customerEmail: undefined,
      context: {
        bookingId: 'bk_456',
        customerName: 'Aisha',
        customerPhone: '+60179202880',
        serviceName: 'Bridal',
        scheduledAtKl: '2026-05-01 14:00',
        durationMin: 60,
        priceMyrCents: 25000,
        locationSummary: 'Studio',
        siteUrl: 'https://kiki.studio',
        lang: 'en',
      },
    });
    expect(result.customerResult).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/modules/notifications.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/modules/notifications/email-templates.ts`**

```ts
import { formatMYR } from '@/lib/money';

export type Lang = 'en' | 'zh';

export interface BookingEmailContext {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  scheduledAtKl: string; // "YYYY-MM-DD HH:mm"
  durationMin: number;
  priceMyrCents: number;
  locationSummary: string;
  customerNotes?: string;
  siteUrl: string;
  lang: Lang;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;color:#6b6b6b;">${label}</td><td style="padding:6px 12px;font-weight:600;">${value}</td></tr>`;
}

export function renderNewBookingAdminEmail(ctx: BookingEmailContext): { subject: string; html: string; text: string } {
  const subject = `New booking · ${ctx.serviceName} · ${ctx.scheduledAtKl}`;
  const price = formatMYR(ctx.priceMyrCents);
  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;">
    <h2 style="color:#8a4a36;">New booking request</h2>
    <table style="width:100%;border-collapse:collapse;background:#fdf7f4;">
      ${row('Customer', ctx.customerName)}
      ${row('Phone', ctx.customerPhone)}
      ${row('Email', ctx.customerEmail ?? '—')}
      ${row('Service', ctx.serviceName)}
      ${row('When (KL)', ctx.scheduledAtKl)}
      ${row('Duration', `${ctx.durationMin} min`)}
      ${row('Location', ctx.locationSummary)}
      ${row('Price', price)}
      ${ctx.customerNotes ? row('Notes', ctx.customerNotes.replace(/</g, '&lt;')) : ''}
    </table>
    <p style="margin-top:16px;color:#6b6b6b;font-size:12px;">Booking ID: ${ctx.bookingId}</p>
  </div>`;
  const text = [
    `New booking request`,
    `Customer: ${ctx.customerName}`,
    `Phone: ${ctx.customerPhone}`,
    `Email: ${ctx.customerEmail ?? '-'}`,
    `Service: ${ctx.serviceName}`,
    `When (KL): ${ctx.scheduledAtKl}`,
    `Duration: ${ctx.durationMin} min`,
    `Location: ${ctx.locationSummary}`,
    `Price: ${price}`,
    ctx.customerNotes ? `Notes: ${ctx.customerNotes}` : '',
    `Booking ID: ${ctx.bookingId}`,
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

export function renderCustomerConfirmationEmail(ctx: BookingEmailContext): { subject: string; html: string; text: string } {
  const isZh = ctx.lang === 'zh';
  const subject = isZh
    ? `已收到您的预订请求 · ${ctx.serviceName}`
    : `Booking request received · ${ctx.serviceName}`;
  const greeting = isZh ? `您好 ${ctx.customerName}` : `Hi ${ctx.customerName}`;
  const intro = isZh
    ? 'Kiki 已收到您的预订请求,将尽快通过 WhatsApp 确认。'
    : 'Kiki has received your request and will confirm via WhatsApp shortly.';
  const detailsHeader = isZh ? '预订详情' : 'Booking details';
  const price = formatMYR(ctx.priceMyrCents);
  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;">
    <h2 style="color:#8a4a36;">${greeting}</h2>
    <p>${intro}</p>
    <h3 style="margin-top:24px;">${detailsHeader}</h3>
    <table style="width:100%;border-collapse:collapse;background:#fdf7f4;">
      ${row(isZh ? '服务' : 'Service', ctx.serviceName)}
      ${row(isZh ? '时间(KL)' : 'When (KL)', ctx.scheduledAtKl)}
      ${row(isZh ? '时长' : 'Duration', `${ctx.durationMin} min`)}
      ${row(isZh ? '地点' : 'Location', ctx.locationSummary)}
      ${row(isZh ? '价格' : 'Price', price)}
    </table>
    <p style="margin-top:24px;"><a href="${ctx.siteUrl}" style="color:#8a4a36;">${ctx.siteUrl}</a></p>
  </div>`;
  const text = [
    greeting,
    '',
    intro,
    '',
    `${detailsHeader}:`,
    `- ${isZh ? '服务' : 'Service'}: ${ctx.serviceName}`,
    `- ${isZh ? '时间(KL)' : 'When (KL)'}: ${ctx.scheduledAtKl}`,
    `- ${isZh ? '时长' : 'Duration'}: ${ctx.durationMin} min`,
    `- ${isZh ? '地点' : 'Location'}: ${ctx.locationSummary}`,
    `- ${isZh ? '价格' : 'Price'}: ${price}`,
    '',
    ctx.siteUrl,
  ].join('\n');
  return { subject, html, text };
}
```

- [ ] **Step 4: Implement `src/modules/notifications/service.ts`**

```ts
import { sendEmail } from '@/server/email';
import {
  renderNewBookingAdminEmail,
  renderCustomerConfirmationEmail,
  type BookingEmailContext,
} from './email-templates';

export async function sendBookingCreatedNotifications(params: {
  adminEmails: string[];
  customerEmail?: string;
  context: BookingEmailContext;
}): Promise<{ adminResult: { id: string }; customerResult: { id: string } | null }> {
  const admin = renderNewBookingAdminEmail(params.context);
  const adminResult = await sendEmail({
    to: params.adminEmails,
    subject: admin.subject,
    html: admin.html,
    text: admin.text,
    replyTo: params.context.customerEmail,
  });

  let customerResult: { id: string } | null = null;
  if (params.customerEmail) {
    const cust = renderCustomerConfirmationEmail(params.context);
    customerResult = await sendEmail({
      to: params.customerEmail,
      subject: cust.subject,
      html: cust.html,
      text: cust.text,
    });
  }
  return { adminResult, customerResult };
}
```

- [ ] **Step 5: Implement `src/modules/notifications/index.ts`**

```ts
export {
  renderNewBookingAdminEmail,
  renderCustomerConfirmationEmail,
  type BookingEmailContext,
  type Lang,
} from './email-templates';
export { sendBookingCreatedNotifications } from './service';
```

- [ ] **Step 6: Run test, verify it passes**

Run: `pnpm test tests/unit/modules/notifications.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add src/modules/notifications tests/unit/modules/notifications.test.ts package.json pnpm-lock.yaml
git commit -m "feat(notifications): booking email templates + send helper"
```

---

## Task 20: Booking module — transactional createBooking

**Files:**
- Create: `src/modules/booking/service.ts`
- Create: `src/modules/booking/index.ts`
- Test: `tests/unit/modules/booking.test.ts`

The create function wraps the slot re-check and the insert in a `prisma.$transaction` with `SELECT … FOR UPDATE` via a raw query on the window. On slot conflict, throws `SlotTakenError` which the API handler maps to HTTP 409.

- [ ] **Step 1: Write failing test `tests/unit/modules/booking.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { createBooking, SlotTakenError } from '@/modules/booking';

vi.mock('@/modules/client', () => ({
  findOrCreateClient: vi.fn(async (input) => ({
    id: 'c1',
    phone: '+60179202880',
    name: input.name,
    email: input.email ?? null,
    instagramHandle: null,
    languagePref: input.languagePref,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

vi.mock('@/modules/service', () => ({
  getServiceBySlug: vi.fn(async (slug) =>
    slug === 'bridal-standard'
      ? { id: 's1', slug, nameEn: 'Bridal Standard', nameZh: '新娘妆', descriptionEn: '', descriptionZh: '', category: 'bridal', priceMyrCents: 80000, durationMin: 180, active: true, sortOrder: 10 }
      : null,
  ),
}));

const bookingInserts: any[] = [];
vi.mock('@/server/db', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: any) => {
      const tx = {
        $queryRaw: vi.fn(async () => conflictRows),
        booking: { create: vi.fn(async ({ data }: any) => { bookingInserts.push(data); return { id: 'bk_1', ...data, createdAt: new Date(), updatedAt: new Date() }; }) },
      };
      return fn(tx);
    }),
  },
}));

let conflictRows: any[] = [];

describe('createBooking', () => {
  it('creates a booking when no conflict', async () => {
    conflictRows = [];
    bookingInserts.length = 0;
    const result = await createBooking({
      serviceSlug: 'bridal-standard',
      scheduledAtUtc: new Date('2026-05-01T06:00:00Z'),
      customer: { name: 'Aisha', phone: '017-920 2880', email: 'a@x.com', languagePref: 'en' },
      locationType: 'studio',
    });
    expect(result.id).toBe('bk_1');
    expect(bookingInserts).toHaveLength(1);
    expect(bookingInserts[0].priceMyrCentsAtBooking).toBe(80000);
    expect(bookingInserts[0].durationMin).toBe(180);
  });

  it('throws SlotTakenError on conflict', async () => {
    conflictRows = [{ id: 'existing' }];
    await expect(
      createBooking({
        serviceSlug: 'bridal-standard',
        scheduledAtUtc: new Date('2026-05-01T06:00:00Z'),
        customer: { name: 'Aisha', phone: '017-920 2880', languagePref: 'en' },
        locationType: 'studio',
      }),
    ).rejects.toBeInstanceOf(SlotTakenError);
  });

  it('rejects an unknown service slug', async () => {
    conflictRows = [];
    await expect(
      createBooking({
        serviceSlug: 'nope',
        scheduledAtUtc: new Date('2026-05-01T06:00:00Z'),
        customer: { name: 'Aisha', phone: '017-920 2880', languagePref: 'en' },
        locationType: 'studio',
      }),
    ).rejects.toThrow(/unknown service/i);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/modules/booking.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/modules/booking/service.ts`**

```ts
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { findOrCreateClient } from '@/modules/client';
import { getServiceBySlug } from '@/modules/service';
import type { Booking, BookingLocationType, LanguagePref } from '@prisma/client';

export class SlotTakenError extends Error {
  constructor() {
    super('slot_taken');
    this.name = 'SlotTakenError';
  }
}

export interface CreateBookingInput {
  serviceSlug: string;
  scheduledAtUtc: Date;
  customer: {
    name: string;
    phone: string;
    email?: string;
    instagramHandle?: string;
    languagePref: LanguagePref;
  };
  locationType: BookingLocationType;
  locationAddress?: string;
  locationNotes?: string;
  customerNotes?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const service = await getServiceBySlug(input.serviceSlug);
  if (!service || !service.active) {
    throw new Error(`Unknown service: ${input.serviceSlug}`);
  }
  const client = await findOrCreateClient(input.customer);

  const slotStart = input.scheduledAtUtc;
  const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60_000);

  return prisma.$transaction(async (tx) => {
    // Lock any overlapping booking rows to serialize conflicting writers.
    const conflicts = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id FROM \`Booking\`
      WHERE deletedAt IS NULL
        AND status IN ('pending','confirmed')
        AND scheduledAt < ${slotEnd}
        AND DATE_ADD(scheduledAt, INTERVAL durationMin MINUTE) > ${slotStart}
      FOR UPDATE
    `);
    if (conflicts.length > 0) {
      throw new SlotTakenError();
    }
    return tx.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        scheduledAt: slotStart,
        durationMin: service.durationMin,
        locationType: input.locationType,
        locationAddress: input.locationAddress,
        locationNotes: input.locationNotes,
        priceMyrCentsAtBooking: service.priceMyrCents,
        customerNotes: input.customerNotes,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
```

- [ ] **Step 4: Implement `src/modules/booking/index.ts`**

```ts
export { createBooking, SlotTakenError, type CreateBookingInput } from './service';
export type { Booking } from '@prisma/client';
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm test tests/unit/modules/booking.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/modules/booking tests/unit/modules/booking.test.ts
git commit -m "feat(booking): transactional createBooking with slot re-check"
```

---

## Task 21: Seed script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` — add `prisma.seed` config

- [ ] **Step 1: Add Prisma seed config to `package.json`**

Append to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client';
import { serviceSeeds } from '../src/content/kiki';

const prisma = new PrismaClient();

async function main() {
  // Services
  for (const s of serviceSeeds) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: s,
    });
  }

  // Default availability: Mon–Sat 10:00–19:00, Sun off (placeholder — confirm with Kiki before launch)
  const defaultWindow = { startTime: '10:00', endTime: '19:00', active: true };
  for (let weekday = 1; weekday <= 6; weekday++) {
    const existing = await prisma.availabilityRule.findFirst({ where: { weekday } });
    if (!existing) {
      await prisma.availabilityRule.create({ data: { weekday, ...defaultWindow } });
    }
  }

  // Settings
  const settings: Array<[string, unknown]> = [
    ['travel_buffer_minutes', 30],
    ['slot_granularity_minutes', 30],
    ['min_booking_lead_hours', 24],
  ];
  for (const [key, value] of settings) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, valueJson: value as never },
      update: {}, // don't overwrite Kiki's edits on re-seed
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Run seed**

Run:
```bash
pnpm db:seed
```

Expected: `Seed complete.` and five service rows, six availability rules, three settings in the DB.

- [ ] **Step 4: Verify in Prisma Studio**

Run:
```bash
pnpm db:studio
```

Expected: Studio opens in browser, `Service`, `AvailabilityRule`, `Setting` tables populated. Close the tab, Ctrl-C the process.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat(db): seed services, default availability, settings"
```

---

## Task 22: Port Tier A components into `src/ui/` and `src/modules/booking/components/`

**Files:**
- Copy from `~/Desktop/Kiki-Makeup/components/` into the new repo, then adapt imports:
- Create: `src/ui/LanguageToggle.tsx`
- Create: `src/ui/Footer.tsx`
- Create: `src/ui/Hero.tsx`
- Create: `src/ui/PhotoStrip.tsx`
- Create: `src/ui/FAQAccordion.tsx`
- Create: `src/ui/ServicesSection.tsx` (reads services from props — takes content from DB via page)
- Create: `src/ui/LocationSection.tsx`
- Create: `src/ui/PortfolioSection/` (whole folder)
- Create: `src/modules/booking/components/` (wizard components — rewritten, not copied, because the Tier A wizard was client-side-only; see Task 24)

**Note on adaptation:** the Tier A components hard-coded Kiki content. Rewrite so they accept content via props — the page composes them with data from `src/content/kiki/*` or the DB.

- [ ] **Step 1: Copy static image assets**

Run:
```bash
cp -r ~/Desktop/Kiki-Makeup/public/* public/
```

Expected: hero photos, photo strip images, og images copied.

- [ ] **Step 2: Port each component one at a time, adapting to props-driven content**

For each file in `~/Desktop/Kiki-Makeup/components/` that doesn't belong to the booking wizard:
1. Read the Tier A source.
2. Create the new file under `src/ui/<Name>.tsx`.
3. Replace any hard-coded strings with `props` inputs typed against `Copy` from `@/content/kiki/copy.en`.
4. Replace any hard-coded image paths with `props` or confirm they point to assets now in `/public/`.
5. Ensure the file does not import from `@/modules/*` or `@/server/*` (ESLint will flag).
6. Type-only imports from `@prisma/client` are permitted — `import type { Service } from '@prisma/client'` is how `ServicesSection` types its `services` prop. `@prisma/client` is an external package and not a boundary-tracked element.
7. `LanguageToggle.tsx` must use `useI18n` from `@/lib/i18n` to drive the language switch. Mark it with `'use client';` at the top.

Example adapted `src/ui/Hero.tsx`:

```tsx
import Image from 'next/image';
import { Button } from './Button';

export interface HeroProps {
  headline: string;
  sub: string;
  cta: string;
  onCtaClick?: () => void;
  heroImageSrc: string;
  heroImageAlt: string;
}

export function Hero({ headline, sub, cta, onCtaClick, heroImageSrc, heroImageAlt }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-4xl leading-tight text-brand-700 md:text-5xl">{headline}</h1>
          <p className="mt-4 text-lg text-neutral-700">{sub}</p>
          <Button className="mt-8" onClick={onCtaClick}>{cta}</Button>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image src={heroImageSrc} alt={heroImageAlt} fill className="object-cover" priority />
        </div>
      </div>
    </section>
  );
}
```

Do the analogous adaptation for `Footer`, `PhotoStrip`, `FAQAccordion`, `ServicesSection`, `LocationSection`, `LanguageToggle`, and `PortfolioSection/*`.

- [ ] **Step 3: Update `src/ui/index.ts` to re-export new components**

```ts
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Card } from './Card';
export { Select, type SelectProps } from './Select';
export { Hero, type HeroProps } from './Hero';
export { Footer } from './Footer';
export { PhotoStrip } from './PhotoStrip';
export { FAQAccordion } from './FAQAccordion';
export { ServicesSection } from './ServicesSection';
export { LocationSection } from './LocationSection';
export { LanguageToggle } from './LanguageToggle';
```

- [ ] **Step 4: Lint**

Run: `pnpm lint`
Expected: clean. Any import-boundary errors must be resolved before moving on.

- [ ] **Step 5: Commit**

```bash
git add public src/ui
git commit -m "feat(ui): port tier a components with props-driven content"
```

---

## Task 23: Public landing page

**Files:**
- Modify: `app/(public)/page.tsx`
- Create: `app/(public)/layout.tsx`

- [ ] **Step 1: Create `app/(public)/layout.tsx`**

```tsx
import type { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { copyEn, copyZh } from '@/content/kiki';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider packs={{ en: copyEn, zh: copyZh }} initial="en">
      {children}
    </I18nProvider>
  );
}
```

- [ ] **Step 2: Rewrite `app/(public)/page.tsx` to compose ported components**

```tsx
import Link from 'next/link';
import { Hero, Footer, PhotoStrip, ServicesSection, LocationSection, FAQAccordion, LanguageToggle } from '@/ui';
import { listActiveServices } from '@/modules/service';
import { copyEn } from '@/content/kiki';
import { brand } from '@/content/kiki';

export default async function HomePage() {
  const services = await listActiveServices();
  // Server component reads DB; pass strings as props — i18n toggling happens in client children.
  const t = copyEn;

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-display text-xl text-brand-700">{brand.name}</span>
        <LanguageToggle />
      </header>

      <Hero
        headline={t.landing.heroHeadline}
        sub={t.landing.heroSub}
        cta={t.landing.heroCta}
        heroImageSrc="/hero.jpg"
        heroImageAlt={t.landing.heroHeadline}
      />

      <PhotoStrip />

      <ServicesSection services={services} bookHref="/book" />

      <LocationSection address={brand.address} />

      <FAQAccordion />

      <div className="mx-auto max-w-3xl p-6 text-center">
        <Link href="/book" className="inline-block rounded-md bg-brand-500 px-6 py-3 text-white">
          {t.landing.heroCta}
        </Link>
      </div>

      <Footer rights={t.footer.rights} />
    </>
  );
}
```

- [ ] **Step 3: Run dev server, smoke-check landing page**

Run:
```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: hero renders, photo strip renders, services list pulls from DB, no console errors. Ctrl-C.

- [ ] **Step 4: Lint**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/(public)
git commit -m "feat(public): landing page composes ported components"
```

---

## Task 24: Booking wizard (client component)

**Files:**
- Create: `src/modules/booking/components/BookingWizard.tsx`
- Create: `src/modules/booking/components/ServiceStep.tsx`
- Create: `src/modules/booking/components/SlotStep.tsx`
- Create: `src/modules/booking/components/DetailsStep.tsx`
- Create: `src/modules/booking/components/ReviewStep.tsx`
- Create: `src/modules/booking/components/SuccessPanel.tsx`
- Modify: `src/modules/booking/index.ts` to export the wizard
- Create: `app/(public)/book/page.tsx`
- Create: `app/api/availability/route.ts` (supporting endpoint the wizard calls)

The wizard is client-only. It calls `GET /api/availability?service=…&date=…` for slot lists, then `POST /api/bookings` on submit. Turnstile widget mounted at the review step.

- [ ] **Step 1: Install Turnstile React helper**

Run:
```bash
pnpm add @marsidev/react-turnstile@1.1.0
```

- [ ] **Step 2: Create `src/modules/booking/components/BookingWizard.tsx`**

```tsx
'use client';
import { useState } from 'react';
import type { Service } from '@prisma/client';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki/copy.en';
import { Card } from '@/ui';
import { ServiceStep } from './ServiceStep';
import { SlotStep } from './SlotStep';
import { DetailsStep } from './DetailsStep';
import { ReviewStep } from './ReviewStep';
import { SuccessPanel } from './SuccessPanel';

export interface WizardState {
  service: Service | null;
  slot: { startKl: string; startAtIso: string } | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export function BookingWizard({ services, turnstileSiteKey }: { services: Service[]; turnstileSiteKey: string }) {
  const { t } = useI18n<Copy>();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [state, setState] = useState<WizardState>({
    service: null, slot: null, name: '', phone: '', email: '', notes: '',
  });

  function patch(p: Partial<WizardState>) { setState(s => ({ ...s, ...p })); }

  return (
    <Card className="mx-auto max-w-xl">
      <h2 className="mb-6 font-display text-2xl text-brand-700">{t.booking.title}</h2>
      {step === 1 && <ServiceStep services={services} onPick={(s) => { patch({ service: s }); setStep(2); }} />}
      {step === 2 && state.service && (
        <SlotStep
          serviceSlug={state.service.slug}
          onPick={(slot) => { patch({ slot }); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <DetailsStep
          state={state}
          onChange={patch}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <ReviewStep
          state={state}
          turnstileSiteKey={turnstileSiteKey}
          onBack={() => setStep(3)}
          onSubmitted={() => setStep(5)}
        />
      )}
      {step === 5 && <SuccessPanel />}
    </Card>
  );
}
```

- [ ] **Step 3: Create `src/modules/booking/components/ServiceStep.tsx`**

```tsx
'use client';
import type { Service } from '@prisma/client';
import { Button } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki/copy.en';
import { formatMYR } from '@/lib/money';

export function ServiceStep({ services, onPick }: { services: Service[]; onPick: (s: Service) => void }) {
  const { lang, t } = useI18n<Copy>();
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">{t.booking.stepService}</h3>
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-4">
            <div>
              <div className="font-medium">{lang === 'zh' ? s.nameZh : s.nameEn}</div>
              <div className="text-sm text-neutral-600">
                {s.durationMin} min · {formatMYR(s.priceMyrCents)}
              </div>
            </div>
            <Button onClick={() => onPick(s)}>Select</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/modules/booking/components/SlotStep.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Button, Input } from '@/ui';

interface SlotDto { startKl: string; startAtIso: string; }

export function SlotStep({ serviceSlug, onPick, onBack }: {
  serviceSlug: string;
  onPick: (s: SlotDto) => void;
  onBack: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<SlotDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setError(null);
    fetch(`/api/availability?service=${encodeURIComponent(serviceSlug)}&date=${date}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => { if (!cancelled) setSlots(data.slots); })
      .catch((e) => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [serviceSlug, date]);

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Choose a date</h3>
      <Input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} name="date" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {slots === null && !error && <p>Loading slots…</p>}
        {error && <p className="col-span-3 text-red-600">{error}</p>}
        {slots?.length === 0 && <p className="col-span-3 text-neutral-500">No slots available this day.</p>}
        {slots?.map((s) => (
          <button
            key={s.startAtIso}
            onClick={() => onPick(s)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:border-brand-500"
          >
            {s.startKl}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Button variant="ghost" onClick={onBack}>Back</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/modules/booking/components/DetailsStep.tsx`**

```tsx
'use client';
import { Button, Input } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki/copy.en';
import type { WizardState } from './BookingWizard';

export function DetailsStep({ state, onChange, onNext, onBack }: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n<Copy>();
  const canProceed = state.name.trim().length >= 2 && state.phone.trim().length >= 7;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t.booking.stepDetails}</h3>
      <Input name="name" label={t.booking.nameLabel} value={state.name} onChange={(e) => onChange({ name: e.target.value })} />
      <Input name="phone" label={t.booking.phoneLabel} value={state.phone} onChange={(e) => onChange({ phone: e.target.value })} />
      <Input name="email" type="email" label={t.booking.emailLabel} value={state.email} onChange={(e) => onChange({ email: e.target.value })} />
      <Input name="notes" label={t.booking.notesLabel} value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} />
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={!canProceed} onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/modules/booking/components/ReviewStep.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/ui';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki/copy.en';
import type { WizardState } from './BookingWizard';

export function ReviewStep({ state, turnstileSiteKey, onBack, onSubmitted }: {
  state: WizardState;
  turnstileSiteKey: string;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const { t, lang } = useI18n<Copy>();
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!token || !state.service || !state.slot) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnstileToken: token,
          serviceSlug: state.service.slug,
          scheduledAtIso: state.slot.startAtIso,
          customer: {
            name: state.name,
            phone: state.phone,
            email: state.email || undefined,
            languagePref: lang,
          },
          locationType: 'studio',
          customerNotes: state.notes || undefined,
          website: '', // honeypot
        }),
      });
      if (res.status === 409) { setError(t.booking.errorSlotTaken); return; }
      if (!res.ok) { setError(t.booking.errorTitle); return; }
      onSubmitted();
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review</h3>
      <dl className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        <div className="flex justify-between p-3"><dt>Service</dt><dd>{lang === 'zh' ? state.service?.nameZh : state.service?.nameEn}</dd></div>
        <div className="flex justify-between p-3"><dt>When</dt><dd>{state.slot?.startKl} KL</dd></div>
        <div className="flex justify-between p-3"><dt>Name</dt><dd>{state.name}</dd></div>
        <div className="flex justify-between p-3"><dt>Phone</dt><dd>{state.phone}</dd></div>
      </dl>
      <Turnstile siteKey={turnstileSiteKey} onSuccess={setToken} />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={!token || submitting} onClick={submit}>
          {submitting ? t.booking.submittingFallback : t.booking.submit}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/modules/booking/components/SuccessPanel.tsx`**

```tsx
'use client';
import { useI18n } from '@/lib/i18n';
import type { Copy } from '@/content/kiki/copy.en';

export function SuccessPanel() {
  const { t } = useI18n<Copy>();
  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold text-brand-700">{t.booking.successTitle}</h3>
      <p className="mt-2 text-neutral-700">{t.booking.successBody}</p>
    </div>
  );
}
```

- [ ] **Step 8: Update `src/modules/booking/index.ts`**

```ts
export { createBooking, SlotTakenError, type CreateBookingInput } from './service';
export type { Booking } from '@prisma/client';
export { BookingWizard } from './components/BookingWizard';
```

- [ ] **Step 9: Create `app/(public)/book/page.tsx`**

```tsx
import { BookingWizard } from '@/modules/booking';
import { listActiveServices } from '@/modules/service';

export default async function BookPage() {
  const services = await listActiveServices();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  return (
    <main className="px-6 py-10">
      <BookingWizard services={services} turnstileSiteKey={siteKey} />
    </main>
  );
}
```

Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY=""` to `.env.example`.

- [ ] **Step 10: Lint + commit**

Run: `pnpm lint`
Expected: clean.

```bash
git add src/modules/booking app/(public)/book .env.example package.json pnpm-lock.yaml
git commit -m "feat(booking): 5-step wizard with turnstile"
```

---

## Task 25: Availability API route

**Files:**
- Create: `app/api/availability/route.ts`

- [ ] **Step 1: Create `app/api/availability/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailableSlots } from '@/modules/availability';
import { getServiceBySlug } from '@/modules/service';

const Query = z.object({
  service: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Query.safeParse({
    service: url.searchParams.get('service'),
    date: url.searchParams.get('date'),
  });
  if (!parsed.success) return NextResponse.json({ error: 'bad_request', details: parsed.error.flatten() }, { status: 400 });

  const service = await getServiceBySlug(parsed.data.service);
  if (!service || !service.active) return NextResponse.json({ error: 'unknown_service' }, { status: 404 });

  const slots = await getAvailableSlots({ dateKl: parsed.data.date, durationMin: service.durationMin });
  return NextResponse.json({
    slots: slots.map(s => ({ startKl: s.startKl, startAtIso: s.startAt.toISOString() })),
  });
}
```

- [ ] **Step 2: Install Zod**

Run:
```bash
pnpm add zod@3.23.8
```

- [ ] **Step 3: Smoke-test the endpoint**

With `pnpm dev` running:

```bash
curl "http://localhost:3000/api/availability?service=bridal-standard&date=2026-05-04" | jq
```

Expected: JSON with a `slots` array listing Monday 10:00-onwards in 30-min increments.

- [ ] **Step 4: Commit**

```bash
git add app/api/availability package.json pnpm-lock.yaml
git commit -m "feat(api): GET /api/availability"
```

---

## Task 26: Booking API route with Turnstile + honeypot

**Files:**
- Create: `app/api/bookings/route.ts`
- Create: `src/lib/turnstile.ts`
- Test: `tests/unit/lib/turnstile.test.ts`

- [ ] **Step 1: Write failing test for Turnstile verifier**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyTurnstile } from '@/lib/turnstile';

const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });

describe('verifyTurnstile', () => {
  it('returns true when cloudflare says success', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ success: true }) });
    const ok = await verifyTurnstile('t', '1.2.3.4', 'secret');
    expect(ok).toBe(true);
  });

  it('returns false when cloudflare says failure', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ success: false }) });
    const ok = await verifyTurnstile('t', '1.2.3.4', 'secret');
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test tests/unit/lib/turnstile.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/turnstile.ts`**

```ts
export async function verifyTurnstile(token: string, ip: string | undefined, secret: string): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await res.json() as { success?: boolean };
  return Boolean(data.success);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test tests/unit/lib/turnstile.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `app/api/bookings/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createBooking, SlotTakenError } from '@/modules/booking';
import { getServiceBySlug } from '@/modules/service';
import { sendBookingCreatedNotifications } from '@/modules/notifications';
import { formatKl } from '@/lib/date';
import { verifyTurnstile } from '@/lib/turnstile';
import { brand } from '@/content/kiki';

const Body = z.object({
  turnstileToken: z.string().min(1),
  serviceSlug: z.string().min(1),
  scheduledAtIso: z.string().datetime(),
  customer: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().min(6).max(32),
    email: z.string().email().optional(),
    instagramHandle: z.string().max(40).optional(),
    languagePref: z.enum(['en', 'zh']),
  }),
  locationType: z.enum(['studio', 'home', 'venue']),
  locationAddress: z.string().max(500).optional(),
  locationNotes: z.string().max(500).optional(),
  customerNotes: z.string().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

export async function POST(req: Request) {
  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }); }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'validation', details: parsed.error.flatten() }, { status: 422 });

  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ error: 'spam' }, { status: 422 });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ok = await verifyTurnstile(parsed.data.turnstileToken, ip, secret);
  if (!ok) return NextResponse.json({ error: 'turnstile_failed' }, { status: 403 });

  const service = await getServiceBySlug(parsed.data.serviceSlug);
  if (!service || !service.active) return NextResponse.json({ error: 'unknown_service' }, { status: 404 });

  try {
    const booking = await createBooking({
      serviceSlug: parsed.data.serviceSlug,
      scheduledAtUtc: new Date(parsed.data.scheduledAtIso),
      customer: parsed.data.customer,
      locationType: parsed.data.locationType,
      locationAddress: parsed.data.locationAddress,
      locationNotes: parsed.data.locationNotes,
      customerNotes: parsed.data.customerNotes,
    });

    // Best-effort notifications: booking success is returned even if email fails.
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
    if (adminTo) {
      try {
        await sendBookingCreatedNotifications({
          adminEmails: adminTo.split(',').map(s => s.trim()).filter(Boolean),
          customerEmail: parsed.data.customer.email,
          context: {
            bookingId: booking.id,
            customerName: parsed.data.customer.name,
            customerPhone: parsed.data.customer.phone,
            customerEmail: parsed.data.customer.email,
            serviceName: parsed.data.customer.languagePref === 'zh' ? service.nameZh : service.nameEn,
            scheduledAtKl: formatKl(booking.scheduledAt, 'yyyy-MM-dd HH:mm'),
            durationMin: booking.durationMin,
            priceMyrCents: booking.priceMyrCentsAtBooking,
            locationSummary: parsed.data.locationType === 'studio' ? `Studio · ${brand.address.line1}` : (parsed.data.locationAddress ?? parsed.data.locationType),
            customerNotes: parsed.data.customerNotes,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
            lang: parsed.data.customer.languagePref,
          },
        });
      } catch (e) {
        console.error('Notification send failed', e);
      }
    }

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (e) {
    if (e instanceof SlotTakenError) {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
    }
    console.error('createBooking failed', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
```

- [ ] **Step 6: Add `ADMIN_NOTIFY_EMAIL` to `.env.example`**

Append:

```
# Comma-separated list of admin addresses for booking notifications
ADMIN_NOTIFY_EMAIL=""
```

- [ ] **Step 7: Lint + commit**

Run: `pnpm lint`
Expected: clean.

```bash
git add app/api/bookings src/lib/turnstile.ts tests/unit/lib/turnstile.test.ts .env.example
git commit -m "feat(api): POST /api/bookings with turnstile, honeypot, notifications"
```

---

## Task 27: Port remaining public pages (services, portfolio placeholder, classes placeholder)

**Files:**
- Create: `app/(public)/services/page.tsx`
- Create: `app/(public)/portfolio/page.tsx`
- Create: `app/(public)/classes/page.tsx`

Portfolio in Phase 1 is a **static photo grid** sourced from the Tier A `public/` assets — the DB-backed CMS comes in Phase 3. Classes page is a "coming soon" placeholder — real flow ships in Phase 4.

- [ ] **Step 1: Create `app/(public)/services/page.tsx`**

```tsx
import { listActiveServices } from '@/modules/service';
import { formatMYR } from '@/lib/money';
import Link from 'next/link';

export default async function ServicesPage() {
  const services = await listActiveServices();
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl text-brand-700">Services</h1>
      <ul className="space-y-4">
        {services.map((s) => (
          <li key={s.id} className="rounded-md border border-neutral-200 p-5">
            <h2 className="text-xl font-medium">{s.nameEn}</h2>
            <p className="mt-1 text-neutral-600">{s.descriptionEn}</p>
            <div className="mt-3 text-sm text-neutral-500">
              {s.durationMin} min · {formatMYR(s.priceMyrCents)}
            </div>
            <Link href={`/book?service=${s.slug}`} className="mt-4 inline-block text-brand-700 underline">
              Book {s.nameEn}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/(public)/portfolio/page.tsx`** (static grid)

```tsx
import Image from 'next/image';

const PORTFOLIO_IMAGES = [
  '/portfolio/01.jpg',
  '/portfolio/02.jpg',
  '/portfolio/03.jpg',
  '/portfolio/04.jpg',
  '/portfolio/05.jpg',
  '/portfolio/06.jpg',
];

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl text-brand-700">Portfolio</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {PORTFOLIO_IMAGES.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-md">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    </main>
  );
}
```

Confirm the images exist at `public/portfolio/0{1-6}.jpg` (copied from Tier A in Task 22). If they don't, copy them now:

```bash
ls public/portfolio 2>/dev/null || (mkdir -p public/portfolio && cp ~/Desktop/Kiki-Makeup/public/portfolio/*.jpg public/portfolio/ 2>/dev/null || true)
```

If Tier A doesn't have them at that path, adjust filenames to match `public/`.

- [ ] **Step 3: Create `app/(public)/classes/page.tsx`**

```tsx
export default function ClassesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl text-brand-700">Classes</h1>
      <p className="mt-3 text-neutral-600">
        Kiki's Korean makeup classes are launching soon. Check back in a few weeks, or follow on Instagram for announcements.
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Smoke-check all pages**

Run `pnpm dev`, visit:
- `/` — landing
- `/services` — services list
- `/portfolio` — grid
- `/classes` — placeholder
- `/book` — wizard

Expected: all pages render without errors. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add app/(public)
git commit -m "feat(public): services, portfolio (static), classes placeholder pages"
```

---

## Task 28: Env-var sanity script

**Files:**
- Create: `scripts/check-env.ts`
- Modify: `package.json` (add `prebuild` / `predev` hooks)

- [ ] **Step 1: Create `scripts/check-env.ts`**

```ts
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
```

- [ ] **Step 2: Verify locally**

Run:
```bash
pnpm check:env
```

Expected (initial): fails with a list of missing keys, since the `.env` has most as empty strings. Fill in your actual dev keys (Resend test key, Turnstile test keys from Cloudflare dashboard), rerun, expect PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-env.ts package.json
git commit -m "chore: add env var sanity script"
```

---

## Task 29: Playwright e2e test for public booking

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/public-booking.spec.ts`
- Create: `tests/fixtures/seed-e2e.ts`

- [ ] **Step 1: Install Playwright**

Run:
```bash
pnpm add -D @playwright/test@1.48.2
pnpm exec playwright install chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
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
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 3: Create `tests/fixtures/seed-e2e.ts`** (resets DB + seeds a known service for e2e)

```ts
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await prisma.booking.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.availabilityBlock.deleteMany({});
  await prisma.availabilityRule.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.setting.deleteMany({});

  await prisma.service.create({
    data: {
      slug: 'e2e-service', nameEn: 'E2E Service', nameZh: '测试服务',
      descriptionEn: '', descriptionZh: '', category: 'party',
      priceMyrCents: 10000, durationMin: 60, active: true, sortOrder: 1,
    },
  });
  for (let weekday = 0; weekday <= 6; weekday++) {
    await prisma.availabilityRule.create({
      data: { weekday, startTime: '00:00', endTime: '23:30', active: true },
    });
  }
  await prisma.setting.createMany({
    data: [
      { key: 'slot_granularity_minutes', valueJson: 30 },
      { key: 'travel_buffer_minutes', valueJson: 0 },
      { key: 'min_booking_lead_hours', valueJson: 0 },
    ],
  });

  await prisma.$disconnect();
}
main();
```

- [ ] **Step 4: Create `tests/e2e/public-booking.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  const { execSync } = await import('node:child_process');
  execSync('pnpm exec tsx tests/fixtures/seed-e2e.ts', { stdio: 'inherit' });
});

test('customer can submit a booking', async ({ page }) => {
  await page.goto('/book');
  await page.getByRole('button', { name: 'Select' }).first().click();

  // Pick tomorrow to avoid the "today already past 18:00" edge on a fresh run
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = tomorrow.toISOString().slice(0, 10);
  await page.locator('input[name="date"]').fill(iso);

  const slot = page.locator('button:has-text(":")').first();
  await expect(slot).toBeVisible({ timeout: 10_000 });
  await slot.click();

  await page.locator('input[name="name"]').fill('E2E Customer');
  await page.locator('input[name="phone"]').fill('017-920 2881');
  await page.getByRole('button', { name: 'Next' }).click();

  // Turnstile site key "1x00000000000000000000AA" is Cloudflare's test key that auto-passes.
  await expect(page.locator('iframe')).toBeVisible({ timeout: 10_000 });
  await expect(async () => {
    const submitBtn = page.getByRole('button', { name: /Request booking|Submitting/ });
    await expect(submitBtn).toBeEnabled({ timeout: 10_000 });
  }).toPass();

  await page.getByRole('button', { name: /Request booking/ }).click();
  await expect(page.getByText(/your request is in/i)).toBeVisible({ timeout: 10_000 });
});
```

- [ ] **Step 5: Set Turnstile test keys in `.env` for e2e**

For local e2e, use Cloudflare's always-pass test keys:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

- [ ] **Step 6: Run e2e**

Run:
```bash
pnpm test:e2e
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts tests/e2e tests/fixtures package.json pnpm-lock.yaml
git commit -m "test(e2e): public booking flow playwright test"
```

---

## Task 30: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: kiki_studio
          MYSQL_USER: kiki
          MYSQL_PASSWORD: kiki_dev
        ports: ['3306:3306']
        options: >-
          --health-cmd="mysqladmin ping -h localhost -u root -proot"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=10
    env:
      DATABASE_URL: mysql://kiki:kiki_dev@localhost:3306/kiki_studio
      RESEND_API_KEY: test
      EMAIL_FROM: test@example.com
      TURNSTILE_SITE_KEY: 1x00000000000000000000AA
      TURNSTILE_SECRET_KEY: 1x0000000000000000000000000000000AA
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 1x00000000000000000000AA
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
      ADMIN_NOTIFY_EMAIL: admin@example.com
      AUTH_SECRET: ci-secret
      AUTH_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9.12.1 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec prisma migrate deploy
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - name: Migration drift check
        run: pnpm exec prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --exit-code
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint, test, build, migrate-diff on pr"
```

---

## Task 31: Deployment runbook

**Files:**
- Create: `docs/runbooks/phase-1-deploy.md`
- Create: `README.md`

- [ ] **Step 1: Create `docs/runbooks/phase-1-deploy.md`**

```markdown
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
```

- [ ] **Step 2: Create `README.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/runbooks/phase-1-deploy.md README.md
git commit -m "docs: phase 1 deploy runbook + readme"
```

---

## Task 32: Final smoke test — the Phase 1 success criterion

**Reference:** spec §8 Phase 1 — "a real customer can submit a booking from the public site, the row appears in the database, Kiki receives an email; no booking is accepted outside `AvailabilityRule` minus blocks minus existing bookings."

- [ ] **Step 1: Reset local DB to a known state**

Run:
```bash
pnpm exec tsx tests/fixtures/seed-e2e.ts
```

Then re-seed real data on top:

```bash
pnpm db:seed
```

- [ ] **Step 2: Start dev server**

Run: `pnpm dev`

- [ ] **Step 3: Manual flow — submit a booking at a valid slot**

1. Open `http://localhost:3000/book`
2. Pick any service
3. Pick tomorrow's date, select a slot
4. Fill name + phone (use a real phone if testing Resend to your email)
5. Pass Turnstile (or use the always-pass test key)
6. Submit

Expected:
- Success panel appears
- Booking row exists in `Booking` table (confirm via `pnpm db:studio`)
- `status = 'pending'`, `priceMyrCentsAtBooking` matches the service, `scheduledAt` matches the slot you picked
- Resend sends the admin email (visible in Resend dashboard; if `ADMIN_NOTIFY_EMAIL` is your real inbox, it arrives)

- [ ] **Step 4: Manual flow — attempt a double booking at the same slot**

Repeat the flow, picking the exact same service + slot. Use a different phone to create a distinct client.

Expected:
- The SlotStep shows the taken slot as unavailable (because the earlier booking is `pending` and still counts)
- If you force-submit to an old slot via browser devtools, the API returns 409 and the wizard shows `t.booking.errorSlotTaken`

- [ ] **Step 5: Manual flow — attempt a slot outside working hours**

Pick a Sunday (since seeded rules cover Mon–Sat) — SlotStep should show "No slots available this day".

- [ ] **Step 6: Tag and commit checkpoint**

```bash
git tag phase-1-ship
git log --oneline -n 20
```

Expected: a clean sequence of ~30 commits, all small and conventional.

---

## Done

Phase 1 success criterion met. Kiki now has a public site, a smart booking wizard that refuses to double-book, and email notification on every submission.

Phase 2 (admin dashboard + WhatsApp) gets its own spec brainstorm and implementation plan — do not start it from this document.
