# Owner decisions (copy transformation, 21 September 2026)

Open items from `Docs/COMPANY_TRUTH.md` and this copy pass. **Do not treat as product truth until Pascal confirms.** Stripe **$350 USD** was not changed.

## Pricing (acted on, conservative default)

| Question | What we did on the live site | Still needs you |
| --- | --- | --- |
| Publish $350 vs hide it? | **Hid the amount.** Removed JSON-LD `price: "0"`. Marketing says access after approval, then billing. Terms still “agreed at signup.” | Confirm whether $350 (and month vs year) may appear on `/get-access` or a pricing page. |
| Blog FAQ “varies by student count”? | Replaced with “priced after approval / shown at billing.” | If you want per-student pricing, that contradicts `SHULEOS_PLAN_AMOUNT_USD = 350`. |
| Website “free”? | Softened to **included with the school plan after approval.** | Confirm commercial: always bundled vs extra. |
| Trials? | Not marketed. | Confirm production `STRIPE_TRIAL_DAYS`. |

## Future Ready hardware (acted on, conservative default)

| Question | What we did | Still needs you |
| --- | --- | --- |
| Is electricity / internet / computer a real package? | **Quoted on WhatsApp**, not in self-serve register. App + school site described as the product. | Who installs, lead time, price, SLA — or retire the pillars. |
| Training pillar | Onboarding/docs — **not** a 9-month graduate program (apex). | If you sell staff/student training as a SKU, say so. |
| Same CTA as software? | Split: **Request software access** → `/get-access`; **Quote campus setup on WhatsApp**. | — |

## Claims we will not invent until you confirm

1. Canonical parent URL: apex vs `www.digni-digital-llc.com` (HighLevel). `identity.website` still points at www.
2. Live school count, paying vs `billing_exempt`, regions. Origin line is now **“Built for DRC private schools”** (not “serving across the DRC”).
3. Public naming of La Richarde / GS Laricharde.
4. Ship CDF + dual-currency **or** keep one currency (copy no longer claims same-ledger CDF+USD).
5. Official Programme National bulletin format vs printable gradebook cards (copy uses printable cards).
6. Parent PSP / in-app mobile-money checkout vs record + instructions (copy matches instructions).
7. Production Twilio WhatsApp (reminders/OTP).
8. Office 1502 / `+243 822 378 097` still accurate?
9. Footer link to apex three pillars vs none. **Not sold on this site.**
10. Keep “digital director” as nickname. Product title is now **one school record**; footer no longer says the assistant “handles the rest.”
11. Re-verify blog stats (MEPSP, DataReportal, ARPTC, UNIKIN) before ads.
12. Counsel: WhatsApp in terms vs email+docs (legal **not** edited).

## Do not change without counsel

- Liability cap (fees, prior 12 months)
- No uninterrupted-service guarantee
- Termination / governing law (DRC, Kinshasa courts)
- Stripe amount **350**
