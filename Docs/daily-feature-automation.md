# Daily feature factory � setup

Once-a-day cloud agent invents one complete ShuleOS feature, opens a **draft PR**, CI records a video walkthrough and emails you the A?Z brief. **Merge the PR to go live.**

## 1. Apply the storage migration

```bash
npm run db:migrate:one -- 00067_daily_feature_tours_bucket.sql
```

Or apply via Supabase Dashboard. Creates public bucket `daily-feature-tours` for tour videos and screenshots.

## 2. GitHub Actions secrets

In **GitHub ? Settings ? Secrets and variables ? Actions**, add:

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Send founder brief |
| `RESEND_FROM` | e.g. `ShuleOS <noreply@shuleos.app>` |
| `OWNER_EMAIL` | Your inbox |
| `NEXT_PUBLIC_SUPABASE_URL` | Tour upload |
| `SUPABASE_SERVICE_ROLE_KEY` | Tour upload |
| `DAILY_TOUR_LOGIN_EMAIL` | Optional � demo user for logged-in tours |
| `DAILY_TOUR_LOGIN_PASSWORD` | Optional � demo password |

`GITHUB_TOKEN` is provided automatically for waiting on Vercel preview.

## 3. Cursor Automation (Agents Window)

Open **Cursor ? Automations ? New automation** and configure:

| Field | Value |
|-------|--------|
| **Name** | Daily ShuleOS feature factory |
| **Description** | Invent one A?Z feature from product gaps; draft PR only |
| **Trigger** | Cron � every day at **07:00 UTC** |
| **Tools** | GitHub � repo `pascodinamic0/Ams`, branch `main` |
| **Memory** | On |
| **Cloud compute** | Enough for a full feature ([Cloud Agents dashboard](https://cursor.com/dashboard?tab=cloud-agents)) |

**Instructions (paste into the automation prompt):**

```
Follow .cursor/rules/daily-feature-agent.mdc in the AMS repo.

1. Fetch latest origin/main.
2. If an open PR labeled daily-feature exists, stop � do not build a new feature.
3. Pick the highest cost-of-inaction gap (fees, attendance, parent surprise, admin evenings).
4. Branch daily/YYYY-MM-DD-slug, implement A?Z (schema, UI, EN+FR, RBAC).
5. Commit feature-tour.json at repo root (see feature-tour.example.json).
6. Open a DRAFT PR to main, label daily-feature, never merge.
```

The agent playbook lives at [`.cursor/rules/daily-feature-agent.mdc`](../.cursor/rules/daily-feature-agent.mdc).

**Prefill file:** [`.cursor/automations/daily-shuleos-feature-factory.yaml`](../.cursor/automations/daily-shuleos-feature-factory.yaml) — copy fields into the Automations editor or use as reference when creating the automation.

## 4. What you receive

Email subject: `ShuleOS � feature ready to go live: [name]`

- Cover: gap closed
- Video walkthrough (Playwright recording)
- Numbered A?Z screenshots
- **Open preview** and **Open the PR** links

Merge the PR when ready. Close it to drop the feature.

## 5. Local testing (optional)

```bash
export PREVIEW_URL=https://your-preview.vercel.app
node scripts/record-feature-tour.mjs   # requires feature-tour.json on branch
export TOUR_UPLOAD_PREFIX=test-local
node scripts/upload-daily-feature-tours.mjs
export OWNER_EMAIL=you@example.com PR_URL=... PR_NUMBER=1 RUN_DATE=test
node scripts/send-daily-feature-brief.mjs
```

## Flow

```
Daily cron ? Cloud agent ? draft PR (daily-feature label)
         ? Vercel preview ? GitHub Action ? Playwright tour
         ? Supabase upload ? Resend email ? you merge PR
```
