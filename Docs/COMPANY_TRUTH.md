# Company truth � Digni Digital LLC / ShuleOS

**Document type:** Internal, authoritative  
**Synthesized:** 20 September 2026  
**Inputs:** Research agents 1�6 (`Docs/research/AGENT*.md`); targeted re-check of `lib/company/identity.ts`, `lib/billing/types.ts`, `lib/currency.ts`, `lib/company/seo.ts`  
**This document does not rewrite the live site.**

How to read labels:

| Label | Meaning |
| --- | --- |
| **FACT** | Supported by this repo�s code/copy, and/or by the apex company site as fetched 2026-09-20 |
| **ASSUMPTION** | Reasonable inference; not proven |
| **OWNER DECISION** | Requires Pascal / counsel / ops; do not treat as product truth until confirmed |

---

## 1. Two surfaces, one legal entity

**FACT � Do not collapse these into one commercial offer.**

| Surface | What it is | Canonical URL (as of 2026-09-20) |
| --- | --- | --- |
| **This AMS repo / this website** | **ShuleOS** � multi-tenant school operating system for DRC private schools (fees, grades, attendance, portals, school websites) | Product ops: `https://www.shuleos.app` (README / OAuth / webhooks). Marketing lives in this Next.js app. |
| **Apex company site** | **Digni Digital LLC** three-pillar consultancy: AI Employee, Future Ready Graduate, Agentic Systems | `https://digni-digital-llc.com` (`/us-en`, `/us-en/services`, `/us-en/ai-receptionist`, `/us-en/future-ready-graduate`, `/us-en/agentic-softwares`, `/us-en/about`) |
| **www company domain** | HighLevel / LeadConnector SPA shell; `x-robots-tag: noindex`; **no service copy in HTML**; sitemap 404 | `https://www.digni-digital-llc.com` |
| **Identity pointer in this repo** | `companyIdentity.website` = `https://www.digni-digital-llc.com` | `lib/company/identity.ts` � **does not match** the apex Next.js offer site |

**FACT � Legal:** Digni Digital LLC is the legal name. ShuleOS is a product of Digni Digital. Footer and privacy copy treat �Digni Digital� and �ShuleOS� as the same provider of **a school management platform** (`messages/en/marketing.json` legal; `identity.ts`).

**FACT � Not evidenced in this repo as live SKUs:** �AI Employee Service,� �Agentic Systems� as a sold software-agency line, or �Future Ready Graduate� (9-month talent program). Those names **are** marketed on the **apex** company site (Agent 4).

**ASSUMPTION:** Buyers hitting `www.digni-digital-llc.com` may see a CRM login, not the three pillars and not ShuleOS.

**OWNER DECISION:** Which domain is canonical for the parent company; whether www should redirect to apex; whether `identity.ts` should point at apex vs www.

---

## 2. Verified company overview (plain language)

**Digni Digital LLC** is the company. In **this workspace**, what it ships is **ShuleOS**: software that replaces notebooks, WhatsApp threads, and spreadsheets with one student record for a school.

One sentence for **this site:**

> ShuleOS is a Kinshasa-supported school system for DRC private-school owners: one record for fees, grades, attendance, and parent messages, plus a branded school website.

The phrase �trusted digital director� / �smart assistant� is **branding for that software**, not a shipped LLM worker. **Agentic Systems / School Brain** is **roadmap** in `IMPLEMENTATION_PLAN.md`, not in the product.

The **apex** company, separately, markets:

1. **AI Employee** � inbound capture/qualify/book (implementation, not login-only), slug `/us-en/ai-receptionist`
2. **Future Ready Graduate Program** � school/institute talent program (Learn ? Build ? Apply ? Demonstrate); services page states **9 months � 3 trimesters**; GS Laricharde named **in progress**
3. **Agentic Systems** (�Agentic Softwares� in nav) � custom workflow software; timelines ~7 days�3 months by scope

Those three pillars are **parent-company offers**. They are **not** what this ShuleOS product site should sell as if they were live here.

---

## 3. Actual offers (what exists where)

### 3.1 ShuleOS � school SaaS (**this repo: FACT**)

Shipped modules (README, `lib/company/modules.ts`, app routes, Agent 2):

- **Academic:** students, guardians, admissions, classes, subjects, timetable, attendance, grades, printable report cards, discipline, daily activity reports
- **Teacher:** classes, attendance, gradebook, assignments, exams, messages
- **Finance:** fee structures, invoices, payments recorded, payroll, expenses, budget plans, fee reminders (WhatsApp when Twilio env is set)
- **Operations:** library, transport, events, staff/HR
- **Portals:** parent and student
- **Analytics / dashboards** (multi-branch **data model**; dedicated branch-comparison **page redirects** � see claims)
- **Messaging / outreach** (in-app; WhatsApp send when configured; **SMS campaigns blocked** in code)
- **Public school website** at `/schools/[slug]` � templates Modern, Classic, Minimal; admissions, enroll, events, visit booking
- **PWA** install; **offline attendance queue** (IndexedDB), not whole-app offline

Public product routes include `/`, `/offre`, `/features`, `/get-access`, `/contact`, `/docs`, `/blog`, `/school-management-system`, `/logiciel-de-gestion-scolaire`, `/modules/[slug]`, legal pages.

**Users (roles):** administrators/directors, teachers, finance/ops, parents, students.

**Not shipped here:** LLM chat, RAG, tool-calling �School Brain,� smart gate QR, in-app parent mobile-money **checkout**, hiring/careers on school sites, inventory, SMS campaigns.

### 3.2 Future Ready � **name collision (FACT)**

| Surface | Meaning |
| --- | --- |
| **This repo `/offre`** | Marketing **bundle**: ShuleOS app + training + electricity + internet + on-site computer + free school website. **In code:** app + school sites are real. Training = onboarding/docs at best. Power / ISP / hardware = **not productized in this git repo**. |
| **Apex `/us-en/future-ready-graduate`** | **Graduate / talent program** for schools/institutes (AI-era hireability, portfolio). Not the hardware stack. |

**ASSUMPTION:** Hardware/connectivity might be quoted on WhatsApp. Files do not confirm vendors, SLAs, or prices.

**OWNER DECISION:** Is the six-pillar stack a real commercial package, software-only plus optional quote, or aspirational copy?

### 3.3 �AI Employee� on **this** site (**FACT**)

No string �AI Employee Service� in this repo. Closest copy: digital director / assistant metaphor. **Honest translation:** role-based school OS, humans still enter data.

On the **apex** site, AI Employee **is** a marketed service (inbound system). That offer **must not** be copied onto ShuleOS pages as if this product were an AI receptionist.

### 3.4 Agentic Systems (**FACT**)

- **This repo:** one phrase in `IMPLEMENTATION_PLAN.md` as long-term vision; explicitly not built.
- **Apex:** marketed custom software line; destinations listed include AMS/ShuleOS among other named systems.

ShuleOS is an **agentic-systems destination on the parent site**, not an agentic product in this codebase.

---

## 4. Target customers

### This website (ShuleOS)

**FACT � primary buyer in copy:** school owners, promoters, directors, bursars/cashiers, managers of **private schools in the DRC**, especially Kinshasa. Badge: �Built for school owners & managers in the DRC.�

**FACT � users the buyer must satisfy:** teachers, parents, students.

**FACT � named school in collateral, not a testimonial:** Groupe Scolaire La Richarde (inscription/budget alignment in `Docs/`; payment-justification HTML). Treat as **implementation reference**. Apex Future Ready also names **GS Laricharde** as partnership **in progress** (Agent 4) � related operator, **not** public social proof unless authorized.

**FACT � not a customer:** Horizon Academy (`@shuleos.demo`) is seed/demo data.

**COPY vs evidence:** `identity.origin` �Serving schools across the DRC�; blog FAQ �DRC and region.� **No named paying customer list, logos, or case studies in this repo** (`lib/company/partners.ts` is empty).

**OWNER DECISION:** Live school count (paying vs `billing_exempt`); whether La Richarde is paying, pilot, or form source only; geographic claim tightness.

### Apex company (not this site�s ICP)

Service businesses (AI Employee: clinics etc. � Fremo Medical named on AI Employee page per Agent 4); schools/institutes for the **graduate** program; operators needing custom workflow software.

---

## 5. Business model

### ShuleOS (this repo)

**FACT:**

- Access: Stripe **subscription** after school **approval**, or super-admin **`billing_exempt`** (�Payment off�).
- Amount in code: `SHULEOS_PLAN_AMOUNT_USD = 350` (`lib/billing/types.ts`). README/SECURITY: fixed **$350 USD** Stripe subscription per school.
- Checkout: Stripe `mode: "subscription"` (`lib/actions/billing.ts`). Recurrence lives on Stripe Price ID � **interval (month vs year) is not in application code.**
- Optional trial days via `STRIPE_TRIAL_DAYS` (env). **Not** a public marketing offer. Status enum includes `trialing`.
- Terms: �Paid plans, if applicable, are billed according to the pricing agreed at signup.�
- Funnel (Agent 6): `/get-access` ? `/register` ? email confirm ? `/pending` (copy: usually 1�2 business days) ? approval ? `/billing` ($350 unless exempt).

**FACT � conflicts (do not pick a public story without owner):**

| Signal | What it says |
| --- | --- |
| Billing code | $350 USD school plan |
| JSON-LD `SoftwareApplication` | `price: "0"` (`lib/company/seo.ts`) |
| Blog FAQ | �Pricing varies by student count and modules� |
| Marketing pages | No public price |
| Terms | Agreed at signup |
| Blog (Kinshasa / RDC posts) | �No setup fees. No special hardware.� |

**FACT:** Cursor ~USD 200/month in payment-justification doc is **internal tool cost**, not a customer line item.

**ASSUMPTION:** $350 is monthly. **Not proven.**

**OWNER DECISION:** Public price policy (publish $350 vs �contact Kinshasa� vs per-student FAQ); billing interval; trial length in production; whether website is �free� standalone or included with the plan; whether Future Ready hardware is extra.

### Apex company

**FACT (Agent 4, corporate pages):** AI Employee sold as implementation (not HighLevel-style self-serve login); Future Ready Graduate is a program (duration stated on services page); Agentic Systems quoted by scope (7 days�3 months). **No prices from this synthesis for those SKUs** � not in this repo.

---

## 6. Confirmed capabilities (ShuleOS software)

Safe to treat as **product capability** (architecture exists), **not** as measured outcomes:

- One multi-tenant school record across academics, finance, ops, portals, messaging, public site
- French + English UI (`messages/en` + `messages/fr`)
- Kinshasa office identity, WhatsApp `+243 822 378 097`, emails `growth@` / `support@digni-digital-llc.com`, hours Mon�Fri 8:00�18:00 WAT (`identity.ts`) � **physical occupancy and staffing not independently verified**
- PWA install; teacher attendance offline queue + sync
- Stripe for **school paying Digni Digital**, not parent fee PSP checkout
- Parent pay page: **manual instructions**; in-app: �online card payments are not enabled yet�
- WhatsApp fee reminders / send via Twilio **when credentials are set**
- Three website templates; enroll then finish in person (school-site copy)
- Printable report cards (subjects, marks, average, attendance, remarks) � **not** proven official Programme National grid
- School currencies in code: USD, EUR, GBP, GHS, NGN, KES, ZAR, CAD, AUD, INR � **no CDF**; **one `currency_code` per school** (`lib/currency.ts`) � contradicts marketing �CDF and USD same ledger�
- Partners array empty; no testimonials in marketing

Governing law in terms: **DRC**; disputes in Kinshasa courts.

**OWNER DECISION:** US LLC vs DRC operating company vs both; data-residency story.

---

## 7. Identity, brand, channels (this product)

| Field | Value | Label |
| --- | --- | --- |
| Legal name | Digni Digital LLC | FACT (stated) |
| Product | ShuleOS | FACT |
| Product line | �ShuleOS � Your school's trusted digital director� | FACT as copy, not AI |
| Tagline | �Protect your legacy. Secure your finances.� | FACT as copy |
| Company site in identity | www.digni-digital-llc.com | FACT as coded; **CONFLICT** with apex + HighLevel shell |
| Product site | shuleos.app | FACT in ops docs |
| LinkedIn | linkedin.com/company/shuleos/ | FACT as URL; page not fetched in Agent 5 |
| Apex LinkedIn / Kenya WhatsApp | Corporate footer `wa.me/254702593518` (Agent 4) | FACT on apex; **different number** from ShuleOS DRC line |
| Voice (internal rule) | Cost-of-inaction for marketing; not legal/errors/nav | FACT as workspace policy |

---

## 8. Unresolved questions (owner)

1. Canonical parent URL: apex vs www vs HighLevel; update `identity.website`?
2. How many live schools, paying vs exempt? Which regions?
3. La Richarde / GS Laricharde: customer, partner, pilot, or template source � and what may be named publicly?
4. Stripe interval, production trial days, public vs private $350?
5. Who delivers Future Ready electricity, internet, computers � and at what commercial terms?
6. Keep �digital director / assistant� metaphor vs �school operating system / one ledger�?
7. Add CDF + dual-currency, or stop claiming CDF/USD?
8. Programme National: ship official bulletin format, or soften copy?
9. Parent mobile money: live PSP, or keep �record payments / instructions�?
10. Twilio WhatsApp OTP/reminders live in production? (Memory/history: funding pauses are **not** re-verified here.)
11. LLC jurisdiction vs DRC terms.
12. Blog stats (MEPSP, DataReportal, ARPTC, UNIKIN): re-verify before ads.
13. Office still Crown Towers 1502? WhatsApp number still correct?
14. Apex three pillars: keep fully off this product site (recommended) or add a single �other Digni Digital services� footer link without selling them here?

---

## 9. What this company is / is not (for this website)

**Is:** The operator of ShuleOS, a DRC-oriented school management platform, legally Digni Digital LLC, with a Kinshasa contact story.

**Is not (on this site, from this repo):** An AI-employee vendor, a general digital-transformation consultancy, a proven Future Ready hardware installer, a ministry-certified SIS, a free product (JSON-LD notwithstanding), or a company with published customer logos/ROI.

**Parent company additionally is (apex, 2026-09-20):** Marketer of AI Employee, Future Ready Graduate, and Agentic Systems. That is **another website�s truth**, not this app�s SKU list.

---

## 10. Evidence index

Primary: `lib/company/identity.ts`, `lib/billing/types.ts`, `lib/company/seo.ts`, `lib/currency.ts`, `messages/en/marketing.json`, `README.md`, `IMPLEMENTATION_PLAN.md`, `Docs/research/AGENT1`�`AGENT6`, Agent 4 fetch of `https://digni-digital-llc.com/us-en*`.
