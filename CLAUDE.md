# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview (kau-event)

跨團體票系統 — a cross-group event ticketing system for issuing and distributing **group tickets (團體票)** and **early-bird tickets (早鳥票)**.

- Production domain: `https://event.kuaglobal.org/` · Test domain: `https://kua-event.blockcode.com.tw`
- Four independent event sessions, each its own ticket type: NY early, NY late, LA early, LA late.
- UI/UX is **Mobile-First** — the ticket renders as a ticket *on a phone screen*; aspect ratio and layout center on that.
- Comments and documentation are written in **Traditional Chinese (繁體中文)**.

### Core requirements (`docs/requirement.md` is the source of truth)

- **Admin backend** logs in via **Google Auth**, gated by an email whitelist. Admins create events (title, key visual optional, time, notices).
- **Ticket face** shows: key visual, theme color, title, serial number, date/time, location, notes, QR Code, ticket type label, group name. "Light background / dark text" with **10 selectable theme colors**.
- **Group tickets**: enter group name + quantity → create a batch. Need more later? Create *another* batch — never edit an existing one. Export to **Excel** (serial number + URL, plus blank claimer name/email columns the coordinator fills in).
- **Early-bird**: upload an Excel name list; "send" emails each recipient a direct ticket link.
- **No ticket validation of any kind** — no scanning, no login to view, no check-in. Attendees just present the ticket page.

> `docs/claude-example.md` and `docs/readme-ai-example.md` are reference templates from a *different* project (BC-ERP), kept to show the team's preferred patterns. They do **not** describe this codebase.

## Commands

```bash
npm run dev          # Next.js dev server (Turbopack)
npm run build        # Production build — this is the project's typecheck + lint gate
npm run lint         # ESLint only
npm run db:generate  # Regenerate Prisma client (after any schema change)
npm run db:migrate   # prisma migrate dev (create + apply a migration)
npm run db:studio    # Prisma Studio
npm run db:seed      # Seed admin whitelist + 4 event sessions (tsx prisma/seed.ts)
```

There is **no test suite**. `npm run build` is the verification gate (it runs full TypeScript + route checks).

Requires a running PostgreSQL and a `.env` (copy `.env.example`). `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`/`AUTH_SECRET` are needed for login; `DATABASE_URL` for everything DB.

## Tech Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind v4 · Prisma 7 + PostgreSQL · NextAuth v5 (beta) Google OAuth · Zod 4 + React Hook Form. Deploy target: `output: "standalone"`.

## Architecture & Conventions

### Two audiences, one app
- **Admin** (authenticated) lives in the `app/(admin)/` route group at `/`. Guarded twice: by `proxy.ts` and again by a server-side `auth()` check in `app/(admin)/layout.tsx`.
- **Attendees** (never authenticated) view tickets at `/t/[token]` — public by design (no validation anywhere). The token is `Ticket.accessToken`.

### Auth (NextAuth v5, split config — important)
- `auth.config.ts` — **edge-safe**, no Prisma/Node imports. Holds providers + the `authorized` callback. Consumed by `proxy.ts`.
- `auth.ts` — **Node runtime**. Spreads `authConfig` and adds the Prisma-backed `signIn` (whitelist check against `WhitelistedEmail`), `jwt`, and `session` callbacks. Used by the route handler (`app/api/auth/[...nextauth]/route.ts`).
- The split exists because the pg driver adapter **cannot run on the edge**. Keep Prisma out of `auth.config.ts` and `proxy.ts`.
- Auth is **JWT-strategy** (`session.strategy: "jwt"`); the Account/Session Prisma models exist for future use but aren't the active session store.

### `proxy.ts`, not `middleware.ts`
Next 16 replaced the `middleware` convention with **`proxy.ts`**, and its static check requires a directly-exported function (a destructured re-export fails the build). The file does `const { auth } = NextAuth(authConfig); export default auth;`.

### Prisma 7 specifics (differs from older 7.x and from the BC-ERP reference)
- **Multi-file schema** in `prisma/schema/`: `base.prisma` (generator + datasource), `auth.prisma`, `event.prisma`.
- Config lives in **`prisma.config.ts`** (Prisma 7 dropped the package.json `prisma` key). It also `process.loadEnvFile()`s `.env` because **Prisma 7 no longer auto-loads `.env`**, and supplies `datasource.url` for CLI commands.
- The datasource block in the schema has **no `url`** — Prisma 7 forbids it. The connection string reaches the runtime via a **driver adapter**: `lib/prisma.ts` builds `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
- The new `prisma-client` generator outputs **TypeScript** to `prisma/generated/prisma_client/` (gitignored). The entry is `client.ts`, so the tsconfig alias maps `@prisma/client` → `./prisma/generated/prisma_client/client` (the file, not the folder). Import models/enums/`Prisma` namespace from `@prisma/client`.
- After editing any `.prisma`, run `npm run db:generate`.

### Patterns to follow
- **Server Components by default**; `"use client"` only for interactivity.
- **Server Actions** return `ActionResponse` (`lib/action-response.ts`, with `ok()`/`fail()` helpers): validate session → validate input (Zod) → mutate (use `prisma.$transaction()` for multi-table writes) → `revalidatePath()` → return.
- **Config-Driven enums** in `config/` as `as const` objects, deriving labels and Zod enums from one source: `theme-colors.ts` (the 10 themes — each carries the Tailwind `bg`/`text`/`accent` classes the ticket uses), `ticket-types.ts` (mirrors the Prisma `TicketType` enum). `config/version.json` is the single version source (SemVer).
- **Zod schemas** in `lib/schemas/` (shared client/server). **Data-access queries** in `lib/data/`; mutations call Prisma directly in Server Actions.
- **Serial numbers** via `lib/serial.ts` `nextTicketSerial(tx, eventId, type)` — must run inside a `$transaction` (atomic per-event+type `TicketCounter` upsert). Format `{eventId}-{E|G}-{seq:4}`.
- **Traditional Chinese** comments with a file-header block (name, date, path).

### Data model (`prisma/schema/event.prisma`)
`Event` (one per session; `themeColor` is a `THEME_COLORS` key) → `TicketBatch` (one per group-ticket batch or early-bird upload; additive, never edited) → `Ticket` (`accessToken` drives the public URL/QR; `claimerName`/`claimerEmail` filled by coordinator or import). `TicketCounter` is the per-event+type serial counter.

## Not yet built (intentional scaffold gaps)
Excel import/export, email sending (early-bird dispatch), QR Code rendering (the ticket page has a placeholder box), and event/ticket CRUD Server Actions + admin UI. The conventions and data layer above are in place to build these against.
