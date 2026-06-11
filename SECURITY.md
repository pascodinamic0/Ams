# Security

This document covers how AMS protects data and sensitive endpoints.

## Row Level Security (RLS)

All tenant-scoped tables in Supabase use **Row Level Security**. Policies are defined in `supabase/migrations/` (notably `00009_rls_auth_helpers.sql`, `00010_rls_schools_helpers.sql`, and per-domain migrations).

- **Authenticated users** access data through the Supabase anon key + session JWT. RLS policies restrict rows by `school_id`, role, and relationships (e.g. guardians see only linked students).
- **Server actions and page loaders** use `lib/supabase/server.ts`, which runs queries as the logged-in user — RLS applies automatically.
- **Service role bypass:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is used only in trusted server contexts:
  - Seed scripts (`scripts/seed-*.mjs`)
  - Payment webhooks (`/api/webhooks/payments`)
  - Cron jobs (`/api/cron/fee-reminders`)
  - Admin utilities in `lib/supabase/admin.ts`

Never expose the service role key to the browser or commit it to version control.

## Secrets

| Secret | Where used | Notes |
|--------|------------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, cron, seeds | Full DB access; server-only |
| `CRON_SECRET` | `/api/cron/fee-reminders` | Random string; reject requests without `Authorization: Bearer <CRON_SECRET>` |
| `PAYMENT_WEBHOOK_SECRET` | `/api/webhooks/payments` | Shared with payment provider; used for HMAC signature verification |
| `TWILIO_AUTH_TOKEN` | WhatsApp / SMS | Server-only; paired with `TWILIO_ACCOUNT_SID` |

Generate strong random values (e.g. `openssl rand -hex 32`) for `CRON_SECRET` and `PAYMENT_WEBHOOK_SECRET`.

### Vercel cron

When `CRON_SECRET` is set in Vercel project settings, scheduled invocations of `/api/cron/fee-reminders` include the bearer token automatically. Without `CRON_SECRET`, the route returns 500 and does not run reminders.

### Payment webhooks

The webhook handler:

1. Requires `PAYMENT_WEBHOOK_SECRET` to be configured.
2. Verifies the request body signature before any database write.
3. Uses the service role client only after verification succeeds.

Configure your provider to send signatures in one of: `x-payment-signature`, `x-webhook-signature`, or `stripe-signature`.

## Client vs server boundaries

- Do not import `lib/supabase/server.ts` or `lib/db/*` query modules from `"use client"` components — they depend on `next/headers`.
- Pass data from Server Components to Client Components as props, or call server actions from the client.

## Reporting issues

If you discover a security vulnerability, report it privately to the project maintainers rather than opening a public issue.
