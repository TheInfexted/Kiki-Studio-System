# Kiki Studio System — Tier D

Project handoff from the Tier A build session (`~/Desktop/Kiki-Makeup/`).

## Context

**Client:** Kiki, solo Korean-style makeup artist, Kepong, KL. Instagram: @kiki.makeup___. WhatsApp: +60 17-920 2880.

**Path chosen:** Portfolio-optimized. Build Tier D as a showcase piece + resellable template for other beauty businesses, regardless of whether Kiki signs.

**Tier A status:** Already built and deployed to https://makeup.ninedsales.com (source in `~/Desktop/Kiki-Makeup/`). Mobile toggle, Google Maps, Chinese translations, Instagram-in-footer all fixed. Kept as the public landing portion of Tier D — Phase 1 will extend from there.

## Tier D Scope

Full studio operating system, 6-week phased build, pitched at **RM 15,000 one-time + RM 399/month care** (or RM 4,390/yr annual prepay).

### Phases

| Phase | Week | Ships | Price |
|---|---|---|---|
| 1 · Public Website + Smart Booking | 2 | Bilingual site + booking wizard (port from Tier A) | RM 4,000 |
| 2 · Admin Dashboard + Notifications | 4 | Auth, booking inbox, confirm/reject, revenue, WhatsApp notif | RM 4,500 |
| 3 · Media Library + Portfolio CMS | 5 | Drag-drop upload, S3 storage, style tags, featured controls | RM 2,500 |
| 4 · Class Enrollment Funnel | 6 | Dedicated class page, enrollment, auto-confirm, roster | RM 4,000 |

### Key technical decisions (open)

- **Stack:** TBD. Leading candidates: Next.js App Router full-stack (API routes), or Next.js frontend + separate Nuxt/Express backend. Discuss in first session.
- **Database:** Postgres (Supabase hosted) or Postgres on same VPS.
- **Auth:** Supabase Auth, Clerk, or NextAuth — decide based on stack.
- **File storage:** Cloudflare R2 (cheap egress) or S3.
- **Notifications:** WhatsApp via Twilio / Meta Cloud API. Brendan's existing WhatsApp number: 60179202880.
- **Hosting:** Self-hosted VPS + CloudPanel (existing infra already used for Tier A at makeup.ninedsales.com). Node.js Site type.

### Pricing reference

- Tier A (public site only): RM 2,500 setup + RM 199/mo · proposal at `~/Desktop/Kiki-Makeup/proposals/kiki-tier-a-proposal-v2.pdf`
- Tier D: RM 15,000 + RM 399/mo · proposal at `~/Desktop/Kiki-Makeup/proposals/kiki-tier-d-proposal.pdf`
- If Kiki upgrades Tier A → Tier D within 12 months, her Tier A setup fee credits toward Tier D.

## Adoption risk (flag for future decisions)

Solo operators often don't log into dashboards daily after years of WhatsApp muscle memory. Mitigation baked into Tier D scope: every new booking pings her WhatsApp with inline Confirm/Reject — she never has to "log in" for the critical path. Dashboard is for analytics, media upload, class roster — not for the booking decision.

## Suggested first session task

Brainstorm + plan: scope out tech stack, data model (Booking, Service, Client, Media, ClassSession, ClassEnrollment, User), auth model, and project folder structure. Then write the implementation plan before any coding.

## How to pick up cleanly

```bash
cd ~/Desktop/Kiki-Studio-System
claude
```

In the new session, share this file or reference it. The brainstorming + writing-plans skills are the right entry point.
