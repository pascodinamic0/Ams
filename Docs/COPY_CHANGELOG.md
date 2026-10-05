# Copy changelog — ShuleOS brand alignment (21 September 2026)

Source of truth: `Docs/COMPANY_TRUTH.md`, `Docs/BRAND_POSITIONING.md`, `Docs/CLAIMS_VERIFICATION.md`, `Docs/CUSTOMER_MESSAGING_GUIDE.md`. Voice: cost-of-inaction on marketing only. Legal/terms/privacy were **not** rewritten except as noted (docs compliance line only). Stripe **$350** unchanged.

CTA rule: if the control goes to WhatsApp, the label says WhatsApp. “See what it’s costing you” is not used for `/features` or WhatsApp (no leak calculator).

---

## Homepage (`/` — `messages/en|fr/marketing.json`, `lib/company/identity.ts`)

| Location | Original | Revised | Reason |
| --- | --- | --- | --- |
| Document title / `productFullName` | ShuleOS — Your school's trusted digital director | ShuleOS — one school record for DRC private schools | One identity: school software, not an AI worker |
| `origin` (contact badge) | Serving schools across the DRC | Built for DRC private schools | Unproven geographic customer claim |
| Hero line 2 | Every franc tracked… no computer skills required | One ledger for recorded fees. Printable report cards. Attendance that still marks when the signal drops. | Drop guarantees / “no skill”; scoped offline |
| Primary hero CTA | Secure my school's finances | Stop the leaks | Destination `/get-access`; cost-of-inaction; not instant “secure” |
| Trust: leaks | Zero tuition fee leaks / tamper-proof receipts | One place for the caisse / printable records, not zero leaks | Absolute claim unsupported |
| Trust: PN | Programme National; zero math errors | Printable term cards; not official ministry grid | Overclaim |
| Trust: 7:30 / hallways | Know who is in class without walking hallways | When teachers mark the roll | Overclaim |
| Trust: offline | Works 100% offline + payments | Attendance queued offline; rest needs connection; payments not offline | Contradicted by PWA |
| About | Kinshasa sets you up in an afternoon | WhatsApp + register then review | Funnel truth |
| Parent MM | Pay exact balance via mobile money | Amount due + how the school asks you to pay | No in-app checkout |
| Website | Free branded site | Included with school plan after approval | Not a $0 product |
| Meta description | Trusted digital director… no technical skill | School software for DRC private schools… Kinshasa on WhatsApp | Banned metaphor-as-skill |

Secondary hero CTA unchanged in intent: **Chat with an advisor in Kinshasa** → WhatsApp.

---

## Footer

| Original | Revised | Reason |
| --- | --- | --- |
| Platform: Your assistant / L'assistant | ShuleOS | Colliding brand story |
| Smart assistant handles the rest | One school record — staff still operate it | Not an AI employee |

Legal “product of Digni Digital LLC” kept.

---

## `/offre` (Future Ready)

| Original | Revised | Reason |
| --- | --- | --- |
| Full stack: app, training, power, internet, machine, free site as delivered | App + website in product; power/internet/computer **quoted on WhatsApp**; onboarding ≠ graduate program | Hardware not in git; two Future Readys |
| CTA: Secure my school | Request software access → `/get-access` | Do not funnel hardware intent into silent register |
| CTA: Chat on WhatsApp | Quote campus setup on WhatsApp | Destination match |

---

## Features + modules

Removed or qualified: hiring/careers, inventory, heatmaps, chronic absenteeism alerts, branch-comparison **page**, ministry exports, boarding fee structures, MM payment links, homework **submission**, live/real-time, CDF+USD same ledger, official PN mapping, “bulletproof.”

---

## Get access + register + auth meta

| Original | Revised | Reason |
| --- | --- | --- |
| One afternoon to go live / nothing to learn | Then we review. Then billing. | Real funnel |
| Assistant manages for you / bulletproof finances | What lives in the school record | Metaphor ≠ labor replacement |
| Create/Secure my school | Request access → `/register` | Honesty |
| joinRevolution caption | Prefer a human first? Chat on WhatsApp (now a WhatsApp link) | Destination match |
| Register: one afternoon / 60 seconds / 4-step go-live | Confirm email; 1–2 day review; then billing | Funnel |

Header mobile CTA **Get access** → `/get-access` (was “Secure my school”).

---

## Contact

| Original | Revised | Reason |
| --- | --- | --- |
| See what it's costing you (WhatsApp) | Chat on WhatsApp | No calculator; destination match |
| Fastest channel | Preferred channel | Unsupported SLA |

---

## JSON-LD (`lib/company/seo.ts`)

| Original | Revised | Reason |
| --- | --- | --- |
| Offer `price: "0"` USD | Offer without a catalog price; description = after approval / billing | Contradicted $350; owner has not authorized publishing $350 |

---

## Money pages (`/school-management-system`, `/logiciel-de-gestion-scolaire`)

Dropped CDF+USD ledger, SMS campaigns, 100% offline, “nothing loseable,” MM checkout. Secondary CTA **See all features** → `/features` (was “See what it's costing you”). Aside copy describes register → review → billing, not “one afternoon.”

---

## Blog (JSON + `content/blog/posts/*` + `content/blog/shared.ts`)

| Original | Revised | Reason |
| --- | --- | --- |
| Kinshasa schools already pay for ShuleOS | Another Kinshasa term on notebooks is already costing you | Unsupported rhetoric |
| Pricing varies by student count | After approval, shown at billing | Contradicts fixed $350 |
| Serves DRC and region | Ask Kinshasa; no published regional list | Unproven |
| PN official mapping / hours not a week / under two minutes | Qualified or dropped | Unsupported timings/format |
| Parents pay via MM in portal | Instructions + recorded payments | Contradicted |
| SMS, hiring, heatmaps, branch comparison, dual currency as product | Removed or qualified | Missing/stubbed |
| See what it's costing you (→ features) | See all features | CTA match |
| No setup fees / no special hardware / afternoon go-live | Hardware quoted; funnel described | `/offre` conflict |

Blog market stats (MEPSP, DataReportal, etc.) **kept with years** — owner should re-verify before ads.

---

## Docs page (hardcoded EN)

“Meets compliance requirements” → points to privacy/roles, not a named certification.

---

## In-app (light)

- Outreach compose: WhatsApp or in-app (not SMS as a send option in the subtitle).
- PWA Android hint: queued attendance, not generic offline.

Parent pay page already said manual instructions — left as-is.

---

## i18n extras

`scripts/i18n-extras/*/marketing.json` and `auth.json` meta descriptions synced with live messages.

---

## Not changed (on purpose)

- Stripe amounts, billing logic, auth, DB, APIs
- Terms liability, uptime disclaimer, governing law
- Nav labels (Home, Features, Contact, Get access)
- Error strings
- Apex AI Employee / Graduate / Agentic — not sold here
