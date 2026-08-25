# Phone + WhatsApp sign-in setup

This guide covers Twilio Verify, Meta WhatsApp, and Supabase Auth configuration for WhatsApp OTP login. Fee reminders use a separate Twilio Messaging path (`lib/services/whatsapp.ts`).

## 0. Free setup (no Twilio payment yet)

You can do all of this at **$0**:

| Step | Action |
|------|--------|
| **Apply for credits** | [Twilio for Startups](https://www.twilio.com/startups) ó up to $5K if Digni Digital LLC qualifies (free to apply) |
| **Start WABA** | Meta Business Manager ? WhatsApp Business account (free to begin; verification takes 1ñ2 weeks) |
| **Supabase UI prep** | Dashboard ? Auth ? Providers ? Phone ? enable (Twilio fields can wait) |
| **Link test user phone** | `bun run seed:phone-auth-test` ó sets `auth.users.phone` on hosted project |
| **Local end-to-end demo** | `supabase start` + test OTP below ó no Twilio send |

### Free local phone login (test OTP)

1. Start local Supabase: `supabase stop && supabase start`
2. Copy local API URL and anon key from `supabase status` into `.env.local` (or a temp copy)
3. Run migrations if needed: `bun run db:migrate` against local DB, or `supabase db reset`
4. Create/link user: `bun run seed:phone-auth-test -- parent@ams.demo +243822000001`
5. `bun run dev` ? `/login` ? **Phone** ? `+243822000001` ? OTP **`123456`**

Test mapping lives in [`supabase/config.toml`](../supabase/config.toml) (`[auth.sms.test_otp]`). Twilio Verify stays **disabled** locally until funded.

**Hosted project** (`ooheotsnplfrpgblrnot`): linking phone is free; **sending** OTP still needs Twilio Verify in the dashboard after you add balance.

## 1. Twilio Verify + WhatsApp Sender

1. Log in to [Twilio Console](https://console.twilio.com/).
2. Create a **Verify Service** (`VAù`) under Verify ? Services.
3. Enable **Fraud Guard** on the Verify service.
4. Create or reuse a **WhatsApp Sender** (WABA + phone number):
   - Messaging ? Senders ? WhatsApp Senders
   - Complete Meta business verification (often 1ù2 weeks)
   - Use a **dedicated** sender for OTPs (not the same number as fee reminders)
5. Create a **Messaging Service** (`MGù`) and attach the WhatsApp Sender.
6. In Verify ? your service ? **WhatsApp** tab, select the Messaging Service.
7. Confirm authentication templates are approved in Meta Business Manager.

## 2. Supabase Auth (hosted)

1. Dashboard ? **Authentication ? Providers ? Phone** ? Enable.
2. SMS provider: **Twilio Verify**.
3. Set Account SID, Auth Token, Verify Service SID.
4. Set OTP expiry to **300** seconds (WhatsApp delivery can be slower than SMS).
5. Disable open phone signup if the dashboard exposes it (the app passes `shouldCreateUser: false`).

## 3. Local development

In [`supabase/config.toml`](../supabase/config.toml):

- `[auth.sms]` with `enable_signup = false`
- `[auth.sms.twilio_verify]` with your Twilio credentials
- `[auth.sms.test_otp]` for fixed test numbers (see example in config)

Env vars for local Auth (add to `.env.local`):

```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_MESSAGE_SERVICE_SID=MG...
SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=...  # same as TWILIO_AUTH_TOKEN for local GoTrue
```

Restart Supabase after config changes:

```bash
supabase stop && supabase start
```

## 4. Link phones before login works

WhatsApp login only works when `auth.users.phone` is set:

- **Parents:** guardian record with `auth_user_id` + `phone` ù synced automatically on guardian save.
- **Staff:** Settings ? **Phone for WhatsApp sign-in** ù verify via OTP after linking.
- **Invited users:** link phone in Settings after first email/password login.

## 5. Production checklist

- [ ] Meta Business + WABA verified
- [ ] WhatsApp Sender quality rating healthy; messaging limits sufficient
- [ ] Twilio Verify Fraud Guard enabled
- [ ] Supabase Phone provider enabled with Twilio Verify
- [ ] OTP expiry ? 300s
- [ ] Phone signup disabled (dashboard + app `shouldCreateUser: false`)
- [ ] Test parent + staff account with linked phone
- [ ] Monitor Twilio Verify logs and Supabase Auth logs for delivery failures

## 6. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| OTP never arrives | WABA not verified, wrong Messaging Service on Verify, or Meta template pending |
| Error 63018 | WhatsApp messaging limit exceeded ù check Meta limits |
| Error 63008 | Verify WhatsApp Messaging Service not configured |
| "No account" on login | Phone not linked on `auth.users` ù use Settings or guardian sync |
| Works in prod, not local | `config.toml` Twilio Verify block or `test_otp` mapping missing |
