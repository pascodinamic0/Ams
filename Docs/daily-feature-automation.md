# Daily feature factory � setup

Once-a-day cloud agent invents one complete ShuleOS feature, opens a **draft PR**, CI records a video walkthrough and posts it to the platform owner's super-admin inbox. **Approve on /admin to go live.**

## 1. Apply the storage migration

```bash
npm run db:migrate:one -- 00067_daily_feature_tours_bucket.sql
```

Or apply via Supabase Dashboard. Creates public bucket `daily-feature-tours` for tour videos and screenshots.

## 2. GitHub Actions secrets

In **GitHub ? Settings ? Secrets and variables ? Actions**, add:

| Secret | Purpose |
|--------|---------|
| `OWNER_EMAIL` | Platform owner inbox account (pascodinamic00@gmail.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Tour upload and in-app release |
| `SUPABASE_SERVICE_ROLE_KEY` | Tour upload and in-app release |
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

A notification for the platform owner, plus a card on `/admin` and `/admin/releases`.

- Cover: gap closed
- Video walkthrough (Playwright recording)
- Numbered screenshots
- **Open preview** and **Open the PR** links
- **Approve and go live** merges the pull request. Dismiss closes it.

Also apply migration `00069_product_releases.sql`. Set `GITHUB_MERGE_TOKEN` on the app server so Approve can merge. `OWNER_EMAIL` must match `platform_settings.owner_email`.

## 5. Local testing (optional)

```bash
export PREVIEW_URL=https://your-preview.vercel.app
node scripts/record-feature-tour.mjs   # requires feature-tour.json on branch
export TOUR_UPLOAD_PREFIX=test-local
node scripts/upload-daily-feature-tours.mjs
export OWNER_EMAIL=pascodinamic00@gmail.com PR_URL=... PR_NUMBER=1 RUN_DATE=test
node scripts/publish-daily-feature-release.mjs
```

## Flow

```
Daily cron ? Cloud agent ? draft PR (daily-feature label)
         ? Vercel preview ? GitHub Action ? Playwright tour
         ? Supabase upload ? in-app notification ? owner approves on /admin
```
