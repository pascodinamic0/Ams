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

See `.env.example` for optional variables (Resend, Twilio/WhatsApp, Sentry, payment webhooks, cron secret, Web Push VAPID keys).

### Email (Resend)

Transactional product emails (admission approved, fee reminders) use the Resend SDK (`lib/services/email.ts`).

1. Add to `.env.local` (and Vercel):
   - `RESEND_API_KEY=re_...`
   - `RESEND_FROM=ShuleOS <noreply@your-verified-domain.com>` (optional; defaults to Resend’s test sender)
2. Verify your domain at [resend.com/domains](https://resend.com/domains).
3. For **auth** emails (invites, signup confirmation, password reset), keep using Supabase Auth but route delivery through Resend:
   - Easiest: [Resend → Integrations → Connect to Supabase](https://resend.com/docs/knowledge-base/getting-started-with-resend-and-supabase)
   - Or manually: Supabase → **Authentication → Email → SMTP Settings** with host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key ([SMTP guide](https://resend.com/docs/send-with-supabase-smtp))

### Phone / WhatsApp sign-in (Twilio Verify)

Parents and staff can sign in with a WhatsApp OTP on `/login` (alongside email and Google). Fee reminders still use the separate Messaging API in `lib/services/whatsapp.ts`.

1. Complete Twilio Verify + Meta WhatsApp setup — see **[docs/PHONE_WHATSAPP_AUTH.md](docs/PHONE_WHATSAPP_AUTH.md)**.
2. Supabase Dashboard → **Authentication → Providers → Phone** → Enable, provider **Twilio Verify**.
3. Add to `.env.local` (and Vercel where needed):
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
   - `TWILIO_VERIFY_MESSAGE_SERVICE_SID` (Messaging Service linked to your WhatsApp Sender)
   - `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` (local Supabase Auth only; same value as auth token)
4. Link phones before login works: **Settings → Phone for WhatsApp sign-in**, or guardian phone sync when a parent portal account exists.

Local dev: `supabase/config.toml` includes `[auth.sms.twilio_verify]` and optional `[auth.sms.test_otp]` mappings.

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

Full new school sub-account with every role (Horizon Academy, `@shuleos.demo`):

```bash
bun run seed:horizon-demo
```

All `@shuleos.demo` accounts use password `ShuleOS2026!`. Payment is turned off on that school.

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
3. **Supabase Dashboard** → **Authentication** → **URL Configuration**:
   - **Site URL:** `https://www.shuleos.app` (Vercel redirects apex → www; use www as canonical)
   - **Redirect URLs:**
     - `http://localhost:3000/auth/callback` (or `http://localhost:3000/**`)
     - `https://www.shuleos.app/auth/callback`
     - `https://www.shuleos.app/auth/callback?intent=register`
     - `https://www.shuleos.app/**`
     - Optional apex mirrors: `https://shuleos.app/auth/callback`, `https://shuleos.app/**`
4. Set `NEXT_PUBLIC_APP_URL=https://www.shuleos.app` in Vercel Production (used for email and OAuth callbacks).

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
| `bun run seed:horizon-demo` | New Horizon Academy sub-account with every role |
| `bun run reset:super-admin` | Reset super-admin password |

## Deployment (Vercel)

1. Link the repo to Vercel and set all environment variables from `.env.example` for **Production** (and Preview if needed).
2. Deploy — `bun run build` runs automatically.

### Cron: fee reminders & class alarms

`vercel.json` schedules:

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/cron/fee-reminders` | `0 6 * * *` (06:00 UTC daily) | WhatsApp + email fee reminders |
| `/api/cron/class-reminders` | `*/5 * * * *` (every 5 min) | Teacher class-time push alarms |

Set `CRON_SECRET` in Vercel env vars; invocations must send `Authorization: Bearer <CRON_SECRET>`. Class reminders also need VAPID keys (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) — generate with `npx web-push generate-vapid-keys`.

> **Note:** Vercel Hobby may only allow daily crons. For 5-minute class alarms on Hobby, call `/api/cron/class-reminders` from an external scheduler (cron-job.org, GitHub Actions, etc.) with the same bearer token.

### Webhooks: payments (school fees)

Configure your payment provider (Paystack, Flutterwave, etc.) to POST to:

```
https://www.shuleos.app/api/webhooks/payments
```

Set `PAYMENT_WEBHOOK_SECRET` in Vercel. The handler verifies HMAC-SHA256 signatures via `x-payment-signature`, `x-webhook-signature`, or `stripe-signature` headers.

### SaaS billing (schools pay for ShuleOS)

Schools unlock the app with a fixed **$350 USD** Stripe subscription (or a super-admin billing exemption).

1. Apply migration `00045_school_billing.sql` (`bun run db:migrate`).
2. In Stripe Dashboard, create a Product + recurring Price of **$350 USD**; copy the Price ID.
3. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and optionally `STRIPE_TRIAL_DAYS` in Vercel / `.env.local`.
4. Add a Stripe webhook endpoint to `https://www.shuleos.app/api/webhooks/stripe` for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Set `STRIPE_WEBHOOK_SECRET` from that endpoint.
6. Enable the Customer Portal in Stripe for self-serve card updates / cancellation.

Existing approved schools are marked `billing_exempt` by the migration so they are not locked out. From **Admin → Schools**, toggle **Payment off** per school for complimentary access; otherwise schools must subscribe to the $350 plan.

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
