# AMS — Academic Management System

Multi-tenant school management platform built with Next.js and Supabase. AMS covers academic operations (students, classes, timetable, admissions), finance (invoices, payments, fee reminders), operations (library, transport, events, staff), teacher workflows (attendance, gradebook, assignments), and role-based portals for admins, teachers, parents, and students.

Public school websites with online admissions are served under `/schools/[slug]`.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Database & auth:** Supabase (Postgres + RLS)
- **Runtime / package manager:** Bun
- **Deployment:** Vercel (cron jobs, serverless functions)

## Prerequisites

- [Bun](https://bun.sh) 1.x
- A Supabase project (URL, anon key, service role key, database connection string)

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Environment variables

**Local dev uses one file:** `.env.local` (gitignored). Next.js loads `.env` then `.env.local`; local wins.

| File | Purpose |
|------|---------|
| `.env.example` | Committed template — copy values from here |
| `.env.local` | **Your real secrets for `bun run dev`** |
| `.env` | Optional non-secret defaults (no service role here) |
| `.env.vercel.*` | Snapshots from `vercel env pull` — **Next.js does not read these** |

Do not spread secrets across multiple files. After `vercel env pull`, copy what you need into `.env.local` only. The Vercel dev snapshot may point at a different Supabase project than AMC (`ooheotsnplfrpgblrnot`).

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required for local development:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key (seed scripts, webhooks, cron) |
| `DATABASE_URL` | Postgres connection string for migrations |

See `.env.example` for optional variables (Twilio/WhatsApp, Sentry, payment webhooks, cron secret).

### 3. Run database migrations

Apply SQL migrations from `supabase/migrations/` to your remote database:

```bash
bun run db:migrate
```

Requires `DATABASE_URL` in `.env` (Supabase Dashboard → **Settings → Database → Connection string → URI**; use the transaction pooler URL).

### 4. Seed super admin

Creates the initial platform super-admin user:

```bash
bun run seed:super-admin
# Or with a custom email:
bun run seed:super-admin -- you@example.com
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The script prints a generated password on first run.

Optional demo data (users, students, grades, finance, operations, etc.):

```bash
bun run seed:demo-data
```

Lightweight demo accounts only (no academic/finance sample rows):

```bash
bun run seed:demo-users
```

All `@ams.demo` accounts use password `AMSdemo2026!`. Demo rows are safe to delete manually later.

### 5. Start the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Google sign-in (optional)

Login and registration support **Sign in with Google** via Supabase Auth.

AMS uses Supabase project **AMC** (`ooheotsnplfrpgblrnot`).

1. **Google Cloud Console** — OAuth 2.0 Client ID redirect URI:
   - `https://ooheotsnplfrpgblrnot.supabase.co/auth/v1/callback`
2. **Supabase Dashboard** → **Authentication** → **Providers** → **Google** — Enable with Client ID and Secret.
3. **Supabase Dashboard** → **Authentication** → **URL Configuration** — Redirect URLs:
   - `http://localhost:3000/auth/callback` (or `http://localhost:3000/**`)
   - `https://ams-xi-two.vercel.app/auth/callback` (or `https://ams-xi-two.vercel.app/**` for register with `?intent=register`)
4. Set `NEXT_PUBLIC_APP_URL` in Vercel to your production origin (used for email and OAuth callbacks).

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Next.js dev server |
| `bun run build` | Production build |
| `bun run start` | Run production server locally |
| `bun run lint` | ESLint |
| `bun run db:migrate` | Apply Supabase migrations |
| `bun run seed:super-admin` | Create super-admin account |
| `bun run seed:demo-data` | Full demo dataset (users, students, grades, finance, …) |
| `bun run seed:demo-users` | Seed demo role accounts only |
| `bun run reset:super-admin` | Reset super-admin password |

## Deployment (Vercel)

1. Link the repo to Vercel and set all environment variables from `.env.example` for **Production** (and Preview if needed).
2. Deploy — `bun run build` runs automatically.

### Cron: fee reminders

`vercel.json` schedules a daily cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/fee-reminders",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This calls `POST /api/cron/fee-reminders` at 06:00 UTC. Set `CRON_SECRET` in Vercel env vars; Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations. The route also requires Twilio credentials if WhatsApp reminders are enabled.

### Webhooks: payments

Configure your payment provider (Paystack, Flutterwave, etc.) to POST to:

```
https://your-domain.com/api/webhooks/payments
```

Set `PAYMENT_WEBHOOK_SECRET` in Vercel. The handler verifies HMAC-SHA256 signatures via `x-payment-signature`, `x-webhook-signature`, or `stripe-signature` headers.

## Security

See [SECURITY.md](./SECURITY.md) for RLS, secrets, and webhook/cron hardening.

## Project structure (high level)

```
app/           # Next.js routes (admin, academic, finance, teacher, parent, student, …)
components/    # Shared UI and forms
lib/
  actions/     # Server actions
  auth/        # Session, RBAC, profile helpers
  db/          # Supabase data access (server)
  validations/ # Zod schemas
supabase/
  migrations/  # SQL migrations applied by scripts/migrate.mjs
scripts/       # Migrate and seed utilities
```
