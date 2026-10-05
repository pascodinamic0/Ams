# Company Intelligence Brief � Digni Digital LLC / ShuleOS

**Agent:** 1 � Company & Brand Intelligence  
**Workspace:** AMS (`/Users/Pascal Digny/Github Lab/AMS`)  
**Date:** 20 September 2026  
**Scope:** Project files, docs, marketing copy, legal strings, billing code, collateral. No website source copy was edited. Corporate site `https://www.digni-digital-llc.com` could not be fetched in this pass.

---

## Hypothesis check (starting claims)

| Hypothesis | Verdict | Evidence |
|---|---|---|
| Digital transformation / AI solutions company | **Not supported by this repo as the live business.** Legal entity is Digni Digital LLC; the shipped product is a **school management platform**. AI is documented as a **future** roadmap, not a current offer. | `lib/company/identity.ts`; `README.md`; `IMPLEMENTATION_PLAN.md` � �FUTURE: AI & SMART PAYMENTS ROADMAP� |
| Three primary services: AI Employee Service, Future-Ready Program, Agentic Systems (websites, web/mobile apps, business systems) | **Mostly rejected.** Only **Future Ready** appears as a marketed offer. **AI Employee Service** is absent. **Agentic systems** appear only as internal future vision. Websites exist as a **ShuleOS feature** (school sites), not as a general software-agency line. | `messages/en/marketing.json` ? `offer`; `components/company/future-ready-offer.tsx`; grep of repo |

---

## 1. What the company does (plain language)

**Digni Digital LLC** is the legal company. **ShuleOS** is the product it sells in this codebase: a multi-tenant **academic management system** for schools (especially private schools in Kinshasa / DRC).

In one sentence: they replace notebooks, WhatsApp threads, and spreadsheets with **one student record** covering fees, grades, attendance, parent communication, and a public school website.

The product is framed as a �trusted digital director� / �smart assistant� � **marketing metaphor**, not an implemented AI employee.

---

## 2. Problem it solves

Stated customer pain (marketing + blog):

- Tuition / fee money leaking because balances live in notebooks, cash, and chats.
- Report-card week rebuilt from registers and WhatsApp.
- Attendance that dies when the network dies.
- Parents queuing at the office for balances and grades.
- Schools invisible online at intake.

**Key copy (home hero):**

> �Stop tuition fee leaks.�  
> �Every franc tracked. Report cards on time. Your school firmly in hand � no computer skills required.�  
Source: `messages/en/marketing.json` ? `home.heroTitleLine1`, `home.heroTitleLine2`

**About body:**

> �ShuleOS replaces notebooks, WhatsApp threads, and spreadsheet chaos with one record for fees, grades, and parent messages. Our Kinshasa team sets you up in an afternoon � no IT department required.�  
Source: `messages/en/marketing.json` ? `home.aboutBody`

**Product tagline:**

> �Protect your legacy. Secure your finances.�  
Source: `lib/company/identity.ts`

---

## 3. Who the customer is

**Primary (marketing):** school owners, directors, bursars, and managers of **private schools in the DRC**, especially Kinshasa. Badge copy: �Built for school owners & managers in the DRC.�

**Users of the product (roles in the app):** administrators/directors, teachers, parents, students � plus finance/operations staff. Confirmed by README, RBAC routes (`/academic`, `/finance`, `/teacher`, `/parent`, `/student`), and home role sections.

**Geographic claim:** �Serving schools across the DRC� (`identity.origin`). Blog FAQ also says the platform serves schools �across the DRC and region.� **No named paying customer list, logos, or case studies in the repo.**

**Named school in collateral (implementation, not a testimonial):** Groupe Scolaire La Richarde � inscription form fields and a budget PDF in `Docs/`. Treat as a **design/implementation reference**, not public social proof unless separately authorized.

**Demo school:** Horizon Academy (`@shuleos.demo`) is seed data, not a customer.

---

## 4. Actual offers (what exists in product + marketing)

### A. ShuleOS � school management SaaS (confirmed product)

Shipped modules (README + `lib/company/modules.ts` + features i18n):

- Academic: students, guardians, admissions, classes, subjects, timetable, attendance, grades, Programme National report cards, discipline, activity reports
- Teacher workflows: classes, attendance, gradebook, assignments, exams, messages
- Finance: fee structures, invoices, payments, payroll, expenses, budget plans, fee reminders
- Operations: library, transport, events, staff/HR
- Parent & student portals
- Analytics / dashboards (including multi-branch)
- Messaging / outreach (in-app; WhatsApp/SMS as integrations)
- **Free branded school website** at `/schools/[slug]` � 3 templates (Modern, Classic, Minimal); online admissions, events, hiring, visit booking
- PWA install (iPhone/Android home screen)

Public product URLs (this app): `/`, `/offre`, `/features`, `/get-access`, `/contact`, `/docs`, `/blog`, `/school-management-system`, `/logiciel-de-gestion-scolaire`, `/modules/[slug]`, legal pages.

Canonical product domain in ops docs: **https://www.shuleos.app**

### B. Future Ready (marketed bundle � not fully proven as delivered SKUs)

Homepage + `/offre` (`messages/en/marketing.json` ? `offer`):

> �Future Ready is the full stack � app, training, power, internet, a machine on site, and a free school website � so the tools actually get used.�

Six pillars in copy: (1) Management app / ShuleOS, (2) Future Ready training, (3) Electricity, (4) Internet, (5) Computer, (6) Full website � free.

**Confirmed in software:** pillars 1 and 6.  
**Not evidenced as productized SKUs in this repo:** power, ISP, hardware procurement, a priced training curriculum, delivery SLAs.

### C. Not found as current commercial lines

- AI Employee Service  
- Agentic Systems as a named service (websites/apps/business systems for non-school clients)  
- Partner logos (`lib/company/partners.ts` is an **empty array**)  
- Testimonials / named reviews  
- Public pricing page (dollar amount is in **billing/ops**, not marketing)

---

## 5. Business model

**SaaS subscription to unlock the school tenant.**

- Code constant: `SHULEOS_PLAN_AMOUNT_USD = 350` (`lib/billing/types.ts`)
- README / SECURITY.md: schools pay a **fixed $350 USD Stripe subscription**; or super-admin **billing exemption** (�Payment off�)
- Checkout: Stripe `mode: "subscription"` (`lib/actions/billing.ts`)
- Optional trial days via `STRIPE_TRIAL_DAYS` (env, not a public marketing claim)
- Existing approved schools were migrated as `billing_exempt` so they were not locked out
- Terms: �Paid plans, if applicable, are billed according to the pricing agreed at signup.� (`messages/en/marketing.json` ? `legal.termsP5`)

**Billing interval (monthly vs annual) is not specified in code** � only a recurring Stripe Price ID.

**Marketing vs billing clash:** Schema.org `SoftwareApplication` offer is `price: "0"` (`lib/company/seo.ts`). Blog: �No setup fees. No special hardware.� (`messages/en/blog.json`). In-app billing still requires **$350** unless exempt. Do not claim �free product� from JSON-LD.

**Other revenue not evidenced:** custom software agency, hardware markup, training packages with prices.

---

## 6. Differentiators (credibly supportable from files)

These are **product/positioning claims with implementation behind them**, not third-party proof:

1. **Built for DRC private-school operations:** Programme National report cards, French + English, CDF + USD fees, WhatsApp-oriented communication, Kinshasa office hours.
2. **Local presence:** Kinshasa, Crown Towers, Batetela, Floor 15, Office 1502; WhatsApp `+243 822 378 097`; support Mon�Fri 8:00�18:00 WAT.
3. **Offline-capable PWA** for recording when the network drops (attendance/payments claimed in marketing; treat �100% offline� carefully � it is a PWA with offline recording, not a guarantee the whole cloud product works without sync).
4. **One multi-role system** (admin, teacher, parent, student) plus **included school website**.
5. **Onboarding story:** �one afternoon,� four steps on Get Access (register school, public site, staff, parent portals).

---

## 7. Identity, brand, channels

| Field | Value | Source |
|---|---|---|
| Legal name | Digni Digital LLC | `identity.ts`, privacy/terms, footer |
| Product | ShuleOS | `identity.ts` |
| Product line | �ShuleOS � Your school's trusted digital director� | `identity.ts` |
| Company site (claimed) | https://www.digni-digital-llc.com | `identity.ts` (comment: �sourced from digni-digital-llc.com�) |
| Product site | https://www.shuleos.app | README, OAuth, webhooks |
| LinkedIn | https://www.linkedin.com/company/shuleos/ | `identity.ts` (product company page, not a generic Digni Digital page) |
| Email | growth@ / support@ digni-digital-llc.com | `identity.ts` |
| Phone / WhatsApp | +243 822 378 097 | `identity.ts` |
| Languages | English, French | JSON-LD `availableLanguage`; `messages/en` + `messages/fr` |
| Brand colors | Teal `#0d9488` in app; marketing navy `#1a365d` + amber `#f59e0b` | `identity.ts`; `.cursor/rules/marketing-monako-design.mdc` |
| Voice | Cost-of-inaction (loss ? price already paid ? small next step) | workspace rule; `messages/en/marketing.json` CTAs |

Footer: �ShuleOS is a product of Digni Digital.�

Governing law: **Democratic Republic of the Congo**; disputes in Kinshasa courts (`legal.termsH9`).

---

## 8. Confirmed facts vs assumptions vs unanswered

### Confirmed (in-repo)

- Legal entity Digni Digital LLC; product ShuleOS.
- Kinshasa address, WAT hours, contact channels as coded.
- Multi-tenant school OS with the modules listed above.
- Stripe $350 recurring plan in application billing (plus exemptions).
- EN/FR marketing and product UI.
- Future Ready **copy** with six pillars; software implements app + school websites.
- AI/agentic chat is **roadmap**, not shipped (`IMPLEMENTATION_PLAN.md`).
- No partner logos configured.
- No testimonial components or customer quotes (login �quote� is brand copy, not a named customer).
- Collateral: payment-justification report for ShuleOS work (16 Sep 2026); La Richarde budget PDF and inscription-field alignment.
- Schema.org Organization + SoftwareApplication on marketing pages.

### Assumptions (do not treat as fact)

- Digni Digital�s **other** services on digni-digital-llc.com (AI employees, generic digital transformation, custom apps).
- Future Ready hardware/power/internet is actually sold, delivered, or contracted.
- �Serving schools across the DRC� means many live paying schools.
- $350 is monthly (or annual) � interval unknown.
- WhatsApp OTP login is live in production (memory note 2026-08-25: Twilio funding was paused; code exists).
- �All systems operational� footer string is a real status feed (it is a static label).

### Unanswered questions

1. What does **digni-digital-llc.com** currently claim vs this product site? (fetch blocked in this investigation)
2. How many **live schools**, paying vs exempt?
3. Is La Richarde a **paying customer**, pilot, or form-template source only?
4. Stripe price **interval**, trial length in production, and whether $350 is public?
5. Who delivers electricity, connectivity, and computers in Future Ready?
6. Is �AI Employee Service� a **parent-company** offer elsewhere, or a discarded idea?
7. LLC jurisdiction (US LLC vs DRC operating company) is not specified beyond DRC governing law in terms.
8. Are payment providers (Paystack/Flutterwave/Stripe school-fee webhooks) live for parent fee collection, or only Stripe for SaaS billing?

---

## 9. Messaging confusion (inconsistencies)

1. **Company vs product:** Footer and legal say Digni Digital; almost all UX, SEO, LinkedIn, and meta titles are **ShuleOS**. Easy to think the company *is* a school-software brand only.
2. **Assistant / digital director vs AI:** Copy implies an assistant that �handles the rest.� Implementation is a conventional SaaS + PWA, not an AI employee.
3. **Future Ready vs Get Access:** Offer page sells power/internet/computer; Get Access journey is software onboarding (school, website, staff, families). Hardware is not in the four steps.
4. **Price 0 in JSON-LD vs $350 in billing vs �no setup fees� in blog vs �pricing agreed at signup� in terms vs blog FAQ �Pricing varies by student count.�**
5. **�Zero tuition fee leaks� / �Works 100% offline�** � absolute marketing claims; no audit or SLA in repo.
6. **�Classes aligned to DRC grade levels�** in modules vs payment-justification doc: structure presets still English nursery/primary/form; Congolese class names **not** verified as shipped defaults.
7. **Origin �across the DRC� vs evidence concentrated on Kinshasa** (office, blog, WhatsApp).
8. **Two domains:** company site vs shuleos.app � relationship not explained in-app beyond a footer link.
9. Nav �Offer� = Future Ready; product is still ShuleOS. Easy to invent a second product.

---

## 10. What can be credibly claimed

Safe if you stay tied to the product:

- Digni Digital LLC builds and operates **ShuleOS**, a school management platform for administrators, teachers, parents, and students.
- It is **headquartered / office in Kinshasa** (Crown Towers, Batetela) with WhatsApp and email support during stated WAT hours.
- The platform covers **academics, fees, operations, portals, analytics, messaging, and a branded school website**.
- Interfaces exist in **French and English**; fee workflows are described for **CDF and USD** and **mobile money�ready** amounts.
- Schools can **subscribe via Stripe** at a **fixed $350 USD** plan in the app, or receive complimentary access if exempted by platform admin.
- Onboarding is designed to be **short** (copy: one afternoon); Kinshasa-side setup is claimed in offer proof line.
- **No public customer testimonials or partner logos** are in this codebase � do not invent them.

---

## 11. What NOT to claim

- That Digni Digital is (in this evidence set) an **AI solutions / digital-transformation consultancy** with three service pillars.
- **AI Employee Service**, live **agentic** school brain, or ChatGPT-style �school brain� (roadmap only).
- Named customers, headcount, �X schools,� student counts, or ROI numbers. Design rule explicitly: never invent stats (e.g. �56,200 students�).
- That Future Ready **includes delivered electricity, internet, and computers** as a contracted, priced package.
- That the product is **free** (JSON-LD price 0 is not a commercial offer).
- **Proven** �zero leaks,� 100% uptime (�All systems operational�), or ministry certification.
- Generic **web/mobile app agency** work for non-school clients.
- Partner ecosystem (array is empty).
- That Horizon Academy is a real customer.
- US-style SIS/GPA product; the differentiator is **Programme National / DRC private-school ops**.

---

## 12. Key quotes (for downstream agents � do not rewrite live site)

Identity:

> �ShuleOS � Your school's trusted digital director�  
> �Protect your legacy. Secure your finances.�  
> �Serving schools across the DRC�

Meta:

> �ShuleOS, the trusted digital director for school founders in the DRC. Protect your legacy, secure your finances, lead with peace of mind � no technical skill required.�

Offer:

> �Most schools buy software that dies in the first blackout.�

Login brand (not a testimonial):

> �Every day off-platform: fees slip, records diverge, and someone re-types the same list.�

Legal (privacy):

> �Digni Digital LLC (�Digni Digital�, �ShuleOS�, �we�, �us�) provides a school management platform��

---

## 13. Evidence index (primary files)

| Topic | Path |
|---|---|
| Legal/product identity | `lib/company/identity.ts` |
| SEO / JSON-LD | `lib/company/seo.ts` |
| Marketing copy EN/FR | `messages/en/marketing.json`, `messages/fr/marketing.json` |
| Home / offer UI | `components/company/home-page.tsx`, `components/company/future-ready-offer.tsx`, `app/(company)/offre/page.tsx` |
| Modules | `lib/company/modules.ts` |
| Money pages | `lib/company/money-page-content.ts` |
| Partners (none) | `lib/company/partners.ts` |
| Product README / $350 | `README.md` |
| Billing | `lib/billing/types.ts`, `lib/actions/billing.ts`, `messages/en/billing.json` |
| AI future | `IMPLEMENTATION_PLAN.md` (from �FUTURE: AI & SMART PAYMENTS�) |
| Blog / Kinshasa narrative | `messages/en/blog.json`, `content/blog/posts/*` |
| FAQs | Per-post `faq` in `content/blog/posts/*.ts` (no standalone FAQ page) |
| Payment justification | `Docs/ShuleOS-Payment-Justification-2026-09-16.html` |
| La Richarde | `lib/students/inscription.ts`; `Docs/PREVISION BUDGETAIRE� LA RICHARDE�pdf` |
| Marketing design rules | `.cursor/rules/marketing-monako-design.mdc` |

---

## Bottom line for other agents

**In this workspace, Digni Digital LLC = the company behind ShuleOS, a Kinshasa-based school operating system sold as SaaS (and marketed as a �Future Ready� stack). It is not evidenced here as an AI-employee or general agentic-systems firm.** Use parent-company language only if the corporate site independently confirms other lines � this repo does not.
