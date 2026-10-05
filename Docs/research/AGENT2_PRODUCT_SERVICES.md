# Agent 2 � Product & service deep-dive

**Entity:** Digni Digital LLC  
**Workspace investigated:** `/Users/Pascal Digny/Github Lab/AMS` (ShuleOS / AMS school platform)  
**Date:** 2026-09-20  
**Constraint:** File-backed only. No invented capabilities, pricing, or outcomes. Website source copy was not edited.

## How this repo maps to the three named offerings

This codebase is a **multi-tenant school management product** branded **ShuleOS**, legally a product of **Digni Digital LLC** (`lib/company/identity.ts`). Privacy copy describes the company as providing �a school management platform� (`messages/en/marketing.json`, `legal.privacyP1`).

The three commercial labels in this brief **do not appear as three separate SKUs, routes, or contracts** in the repo:

| Named offering | Closest match in files | Status in this repo |
|---|---|---|
| **AI Employee Service** | Marketing metaphor: �trusted digital director�, �smart assistant�, �what the assistant manages for you� | **Positioning**, not a shipped AI worker |
| **Future-Ready Program** | Public offer at `/offre`, copy key `marketing.offer`, component `FutureReadyOffer` | **Marketed bundle**; software + school website are implemented; power/internet/hardware/training curriculum are **not implemented here** |
| **Agentic Systems** | `IMPLEMENTATION_PLAN.md` section �FUTURE: AI & SMART PAYMENTS ROADMAP� | **Explicit future vision**, labeled not built |

**UNVERIFIED outside this workspace:** Whether digni-digital-llc.com sells other non-school AI/agentic services. Identity comments that public company facts are �sourced from digni-digital-llc.com�; that site was not retrieved in this investigation.

---

## Cross-cutting commercial facts (verified)

These apply wherever ShuleOS is the delivered software. They are **not** proven to be the price of electricity, training, or an AI employee.

| Fact | Evidence | Caveat |
|---|---|---|
| Fixed school SaaS amount **$350 USD** | `lib/billing/types.ts` (`SHULEOS_PLAN_AMOUNT_USD = 350`); `README.md` SaaS billing section; `messages/en/admin.json`; `messages/en/billing.json` (`planPrice`: `"${amount} USD"`) | **Interval (month vs year) is not in code.** Checkout uses `STRIPE_PRICE_ID`; recurrence lives in Stripe. |
| Access model: Stripe subscription **or** `billing_exempt` | `lib/billing/types.ts` `hasPaidAccess`; `README.md`; admin �Payment off� | Complimentary access is an operator toggle, not a published list price. |
| Checkout: Stripe `mode: "subscription"` after school is **approved** | `lib/actions/billing.ts` | Trial days only if `STRIPE_TRIAL_DAYS` is set (`lib/billing/stripe.ts`). Default trial length: **UNVERIFIED**. |
| Terms: paid plans billed �according to the pricing agreed at signup� | `messages/en/marketing.json` `legal.termsP5` | Does not publish a number. |
| JSON-LD `SoftwareApplication` offer **price `"0"`** | `lib/company/seo.ts` `softwareApplicationJsonLd` | **Conflicts** with the $350 plan. Treat as SEO placeholder, not a free-product promise. |
| Cursor ~**200 USD/month** | `Docs/ShuleOS-Payment-Justification-2026-09-16.html` | Internal tool cost for Digni Digital; **explicitly not** a ShuleOS customer line item. |

---

# 1. AI Employee Service

## Mapping (evidence vs label)

**No file uses the string �AI Employee Service.�** Closest customer-facing language:

- Product full name: �ShuleOS � Your school's trusted digital director� (`lib/company/identity.ts`).
- Footer: �Your assistant�; tagline suffix: �The smart assistant handles the rest.� (`messages/en/marketing.json`).
- Get Access: �The assistant helps your teachers�; �What the assistant manages for you� plus eight bullets (`messages/en/marketing.json` `getAccess`).
- Meta: �trusted digital director for school founders in the DRC� (`messages/en/marketing.json` `metaDescription`).

There is **no** OpenAI/Anthropic/LLM client, chat �school brain� UI, or autonomous agent runtime in application code (search of `*.ts`/`*.tsx` for those stacks returned no product integration).

**Honest product translation:** The company is selling **software that replaces scattered notebooks/WhatsApp/spreadsheets** and *describes* that software as an assistant/director. That is a **metaphor for a role-based school OS**, not a hired digital person.

### 1. Target customer

**Evidence:**

- School **owners and managers in the DRC** (`messages/en/marketing.json` `home.heroBadge`, `home.aboutTitle`).
- Roles in the product: academic admin, principal, teachers, finance, operations, parents, students (`IMPLEMENTATION_PLAN.md` �Who Uses It?�; `lib/company/modules.ts` `whoItsFor`; `README.md`).
- Company audience: administrators, teachers, parents, students (`legal.privacyP1`).

**Not evidenced:** Non-school businesses buying a generic �AI employee.�

### 2. Customer�s current problem

**Evidence (marketing + product problem statements, not measured loss):**

- Tuition and fee **leaks**; notebooks, WhatsApp, spreadsheets as the current �system� (`messages/en/marketing.json` home hero; `lib/company/money-page-content.ts`).
- Report-card reconstruction at term end; parent payment disputes; attendance and grades rewritten from paper/chats (`messages/en/marketing.json`; blog posts under `content/blog/posts/`).
- Directors informed too late; office as helpdesk (`lib/company/money-page-content.ts` parent portal section).

**UNVERIFIED:** Any quantified leak rate, collection lift, or hours saved. No case studies with named school outcomes in this repo (`lib/company/partners.ts` is empty).

### 3. Desired outcome

**What files say customers want (outcomes, not features):**

- Every franc tracked; report cards on time; school �in hand� without computer skills (`home.heroTitleLine2`).
- One record for fees, grades, parent messages (`home.aboutBody`).
- Peace of mind / control / fewer office queues (`getAccess` journey and included bullets).

**What files do not prove:** That an �employee� works nights, answers the phone, or makes decisions without staff.

### 4. Specific solution delivered

**Shipped (code/routes exist):** Multi-tenant AMS: academics, finance, teacher workflows, parent/student portals, operations, analytics, public school sites, PWA install, WhatsApp/email integrations for specific flows (`README.md`; `app/` trees; `lib/company/modules.ts`).

**Not delivered as an AI employee:** Natural-language school Q&A, tool-calling agents, unsupervised actions (`IMPLEMENTATION_PLAN.md` future tasks).

### 5. How the solution works

Staff and families **log into role-specific web/PWA surfaces**. Data lives in **Supabase** with RLS. Workflows are **forms, lists, invoices, cron reminders, and portals**�humans enter and approve.

Automation that *does* exist (still not an AI employee):

- Nightly **fee reminders** via cron (`app/api/cron/fee-reminders/route.ts`; settings in `lib/actions/fee-reminders.ts`).
- **Class reminders** cron (`app/api/cron/class-reminders/route.ts`).
- **WhatsApp** send via Twilio (`lib/services/whatsapp.ts`) when credentials are set.
- **Stripe** for *school paying Digni Digital*, not parent fees (`lib/actions/billing.ts` vs `app/parent/pay/page.tsx`).

### 6. Deliverables and capabilities

| Deliverable | Evidence | Notes |
|---|---|---|
| Academic records, attendance, gradebook, printable report cards | `app/academic/*`, `app/teacher/*`, `components/students/student-report-card.tsx` | Report card is school header + subjects/marks/attendance/average�not a documented official ministry template file. |
| Fee structures, invoices, payments recorded, payroll, expenses | `app/finance/*` | Parent �pay� page is **manual instructions** with amount due (`app/parent/pay/page.tsx`), not in-app mobile-money checkout. |
| Parent/student portals | `app/parent/*`, `app/student/*` | |
| Messaging / outreach | `app/messages/*`, `app/outreach/*`, Twilio WhatsApp | Delivery depends on env config. |
| School public website + online enrollment | `app/(company)/schools/[slug]/*`, `lib/schools/website-templates.ts` | Three templates: Modern, Classic, Minimal. |
| Offline **attendance queue** | `lib/pwa/attendance-offline.ts` (IndexedDB queue) | **Not** whole-app offline. |
| Kinshasa identity, WhatsApp/email, support hours | `lib/company/identity.ts` | Hours are stated, not an SLA. |

### 7. Features vs actual customer benefits

| Feature (what it is) | Benefit a buyer might want | Evidence the benefit happens |
|---|---|---|
| One database + roles | Stop reconciling three ledgers | Architecture supports one record; **no outcome study** |
| Invoices + payment history | Fewer disputed balances | Ledgers exist; disputes not measured |
| WhatsApp fee reminders | Parents pay before the gate | Cron + templates exist; **send success / collection lift UNVERIFIED** |
| Parent portal | Fewer office queues | Portal shows balances/grades; queue reduction UNVERIFIED |
| �Assistant manages for you� copy | Work happens without staff | **Contradiction:** staff must still mark attendance, enter grades, record cash |
| �Digital director� | Someone runs the school | Product is a dashboard, not a decision-maker |

### 8. Pricing and commercial model

**IF VERIFIED for this offering as a separate SKU:** **None.** No AI-employee price, seat price, or hourly rate.

**Related verified model:** $350 USD Stripe subscription per **school** for ShuleOS access (interval **UNVERIFIED** in files).

### 9. Differentiators supported by evidence

- Built for **DRC private-school workflows** in copy and modules: French/English, CDF/USD fees, WhatsApp-first contact, Kinshasa office (`lib/company/identity.ts`, `lib/company/modules.ts`, blog posts).
- **PWA + queued attendance** for dropped signal (`lib/pwa/*`).
- **Local support channel** (WhatsApp number, office address) in identity config.

These differentiate vs generic foreign SIS **as product design choices**, not as proven win-rate.

### 10. Customer objections / purchase barriers

| Barrier | Label |
|---|---|
| �Is this actually AI, or just software with assistant branding?� | **Hypothesis**, strongly suggested by absence of LLM code + presence of metaphor copy |
| Staff still have to type data; the �employee� doesn�t replace a bursar | **Evidence** (all core flows are human UI) |
| Need phones/computers and some connectivity to sync | **Evidence** (web app; offline limited to attendance queue) |
| School must be approved then pay/subscribe | **Evidence** (`lib/actions/billing.ts`) |
| Trust / data in the cloud vs notebooks | **Hypothesis** |
| $350 vs �price 0� in schema.org | **Evidence** of mixed signals (`seo.ts` vs `billing/types.ts`) |

### 11. Claims missing evidence

- Zero tuition fee leaks; tamper-proof receipts (`home.trustLocal*`) � **capability language, no audit/crypto proof in files reviewed**.
- �Works 100% offline� including **payments** (`home.trustAffordableDesc`) vs attendance-only offline queue.
- Report cards �according to the Programme National� / �mapped to national curriculum strands� (`home.trustSimpleDesc`, `lib/company/modules.ts`, blog FAQ) vs generic subject/marks report card component�**ministry-format fidelity UNVERIFIED in code**.
- �No computer skills required� / �you have nothing to learn� (`home.heroTitleLine2`, `getAccess.journeySubtitle`) vs a large multi-module app and setup wizards (`messages/en/onboarding.json`).
- Mobile-money **checkout** / �pay exact balance via mobile money� (`home.parentFeature2`, `lib/company/modules.ts` highlights) vs **manual** parent pay steps.
- Any autonomous AI employee outcomes.

### 12. Simplest accurate explanation (busy nontechnical owner)

**You are not buying a person made of AI.** You are buying **one school system** so fees, attendance, grades, and parent messages live in the same place, with your Kinshasa vendor on WhatsApp. People at the school still do the work; the software keeps the record. Calling it a �digital director� is a nickname for that system.

---

# 2. Future-Ready Program

## Mapping

**This is the only of the three labels with a dedicated public offer.**

- Route: `app/(company)/offre/page.tsx` ? `FutureReadyOffer` `variant="page"`.
- Homepage section: `components/company/home-page.tsx` (dynamic import).
- Copy: `messages/en/marketing.json` ? `offer` (FR equivalent in `messages/fr/marketing.json`).
- Design rule: �Future Ready offer architecture� (`.cursor/rules/marketing-monako-design.mdc`).

Eyebrow: **�Future Ready�**. Intro: full stack � **app, training, power, internet, a machine on site, and a free school website**.

Six pillars (titles + short labels + descriptions in `marketing.offer`):

1. Management app (ShuleOS)  
2. Future Ready training  
3. Electricity  
4. Internet connection  
5. Computer  
6. Full website � free  

CTA: `/get-access` and WhatsApp (`companyIdentity.contact.whatsappUrl`). Proof line: Kinshasa-side setup � WhatsApp support.

### 1. Target customer

**Evidence:** Same as ShuleOS�**DRC school owners/managers** whose software �dies in the first blackout� (`offer.title`). Get Access is school signup (`getAccess.createSchoolAccount`).

**UNVERIFIED:** Whether hardware/power is sold to non-school clients.

### 2. Customer�s current problem

**Evidence in offer copy:** Schools buy **software that isn�t used** because of blackouts, no internet, no machine, no training (`offer.title`, `offer.intro`, pillar descriptions).

Supporting product/blog context: network drops during roll call; generator fuel as a real cost (`content/blog/posts/school-management-system-drc.ts`; `lib/pwa` attendance queue).

### 3. Desired outcome

**Stated:** Tools **actually get used** (`offer.intro`). School keeps running when the grid drops (pillar 3). Records **sync when network returns** (pillar 4). Staff and students **learn to use the tools** (pillar 2). School **found online** without paying a designer (pillar 6).

### 4. Specific solution delivered

**In this git repo, delivered as software:**

| Pillar | Delivered in AMS? |
|---|---|
| 1 ShuleOS app | **Yes** � the application |
| 2 Training | **Partial at best:** in-app onboarding/setup guides (`messages/en/onboarding.json`), docs page (`app/(company)/docs/page.tsx`). **No** Future Ready curriculum, LMS, student training program, or staffing model in files. |
| 3 Electricity | **No** � marketing string only. No solar/generator SKU, vendor, BOM, or install playbook. |
| 4 Internet | **No** as a supplied connection. Product assumes connectivity for sync; PWA queues attendance. |
| 5 Computer | **No** hardware procurement in repo. PWA can be installed on phone/tablet/computer (`messages/en/settings.json` install copy). |
| 6 Website free | **Yes as product feature** � branded school site with templates, admissions, events, hiring, visit booking (`lib/company/modules.ts` school-websites; `lib/schools/website-templates.ts`). �Without paying a designer� is a **positioning claim**; implementation is template-based, not a custom design studio workflow in code. |

### 5. How the solution works

**Software path (verified):** Visitor sees offer ? Get Access / register school ? structure setup ? invite roles ? use modules; website configured in admin (`IMPLEMENTATION_PLAN.md` onboarding; `getAccess` four steps).

**Hardware/power/ISP path:** **UNVERIFIED.** No operations docs for delivery, SLAs, or inventory.

**Training path:** **UNVERIFIED** beyond product UI walkthroughs. Copy says �staff and students learn to use the tools � not just install them.�

### 6. Deliverables and capabilities

**Verified software deliverables:** See section 1.6 plus public `/offre` page listing six pillars.

**Claimed but not in repo:** On-site electricity, ISP, a physical computer, a named training program.

**Commercial packaging:** Get Access �included� list is **software outcomes** (students tracked, finances, families, visibility)�not kWh, SIM cards, or laptops (`getAccess.included1`�`included8`).

### 7. Features vs actual customer benefits

| Pillar / feature | Customer benefit if true | File-backed? |
|---|---|---|
| ShuleOS | One operational record | Yes (product) |
| Training | Staff use it daily | Onboarding UI only; **adoption UNVERIFIED** |
| Electricity | Work continues in blackout | **Not in repo**; software offline is attendance-queue only |
| Internet | Sync / parent access | Not supplied here; still required for most features |
| Computer | Office can run the system | Not supplied here |
| Free website | Families find and apply | Templates + enrollment forms **yes**; �free� vs $350 plan: website is **included in product**, not proven as a $0 total contract |

### 8. Pricing and commercial model

**IF VERIFIED for the six-pillar bundle as a package price:** **Not in files.** No line items for solar, Starlink, laptops, or training days.

**Verified:** School software access **$350 USD** recurring via Stripe (interval **UNVERIFIED**). Super-admin can exempt billing (`README.md`).

**Hypothesis (not evidence):** Hardware/connectivity might be quoted offline on WhatsApp. Files do not confirm.

### 9. Differentiators supported by evidence

- **Naming and UX:** Dedicated Future Ready section vs �software-only� landing (`FutureReadyOffer`, `/offre`).
- **Problem framing:** Blackouts and unused software�matches DRC ops language in blogs.
- **Included website** as a first-class module, not an upsell page in `platformModules`.

**Not evidenced:** That Digni Digital actually installs power or internet better than a local electrician/ISP.

### 10. Customer objections / purchase barriers

| Barrier | Label |
|---|---|
| �Will you really bring electricity and a computer?� | **Hypothesis**; **no delivery evidence in repo** |
| Software still needs some power/network to be useful | **Evidence** (architecture) |
| Training vs �nothing to learn� tension | **Evidence** (conflicting copy: offer pillar 2 vs getAccess.journeySubtitle) |
| What is in the $350 vs what is extra? | **Evidence gap** � software price exists; bundle composition unpriced |
| Setup �in an afternoon� | **Claim** (`home.aboutBody`, `getAccess.heroTitleHighlight`); complexity of full AMS **suggests risk**; not measured |

### 11. Claims missing evidence

- Full-stack **delivery** of power, internet, and a machine.
- Training that includes **students**, not just admin onboarding.
- Website �without paying a designer� as a custom design outcome (templates are coded, not designer hours).
- �Most schools buy software that dies in the first blackout� � rhetorical; no survey data in repo.
- Partners proving the stack (`companyPartners` empty).

### 12. Simplest accurate explanation (busy nontechnical owner)

**On the website, Future Ready means:** we know software alone fails if the lights, the network, the PC, and the people aren�t there�so we *talk about* app + training + power + internet + a computer + a free school site.

**In this codebase, what you can actually log into is:** the school app and the school website. Training is mostly setup screens. Power, internet, and a physical computer are **not specified or priced in these files.** Ask WhatsApp what, if anything, is installed on campus versus what is only software.

---

# 3. Agentic Systems

## Mapping

**No public marketing page** titled Agentic Systems.

The phrase **�agentic system�** appears once, as **engineering vision**:

> AMS is built to **evolve with AI** � an **AI companion / agentic system**, not a static tool.  
> (`IMPLEMENTATION_PLAN.md`, �FUTURE: AI & SMART PAYMENTS ROADMAP�)

That section is explicitly **�long-term vision�** and **�current build is structured so these features can be added without rework.�** Later: **�Future Vision (Not Built Yet)�** and **�What Build Does Not Include (Yet)�** listing AI.

### 1. Target customer

**Intended (plan doc):** Principals / super admins using a ChatGPT-style **�School Brain�**; later every module (`IMPLEMENTATION_PLAN.md` ��1, 3).

**Same commercial customer as ShuleOS** if this ships inside AMS�not a separate ICP in files.

### 2. Customer�s current problem

**Stated in the plan:** Admins must **click through dashboards** instead of asking questions; AI should query students, attendance, fees, grades.

**Related shipped pain (not agentic):** Directors reconstructing numbers from WhatsApp (`money-page-content.ts`, blogs). That pain is addressed today by **dashboards and reports**, not agents (`lib/db/analytics.ts`).

### 3. Desired outcome

**Plan:** Ask in natural language��Who has unpaid fees this month?��and get live lists; advice and automation per module (admissions suggestions, absenteeism flags, cash-flow forecast, draft messages, narrative reports).

**Customer-buy outcome (if it existed):** Answers and actions without hunting screens. **Not sold as a live SKU in this repo.**

### 4. Specific solution delivered

**Not delivered.** Future tasks listed: AI chat UI, RAG over school data, tool-calling.

**What is delivered instead (preparatory, not agentic):**

- Structured Postgres schemas (students, attendance, invoices, etc.) so queries are possible (`IMPLEMENTATION_PLAN.md` �Requirements for current build�; `supabase/migrations/` exists�plan�s old note that schema was �separate phase� is **outdated** relative to current repo).
- Server actions / APIs humans use; **not** documented as agent tool APIs.
- RBAC so a future chat �respects� school scope (requirement, not an AI chat implementation).
- Analytics lists such as **low attendance students**, top/bottom performers (`lib/db/analytics.ts`)�**reports**, not agents.

### 5. How the solution works

**Intended:** Chat ? tools/RAG ? Supabase ? answers; audit trail for AI-generated actions; permissions.

**Actual today:** Users navigate routes. No agent loop.

Related **non-AI** automations (do not call these agentic systems without stretching language):

- Fee reminder cron  
- Class reminder cron  
- Payment webhook **stub** for school-fee providers (`app/api/webhooks/payments/route.ts` generic HMAC payload)  
- Parent pay **link** with `invoice` query param (`app/parent/pay/page.tsx`)�shows amount; **does not** complete provider checkout as in the �Smart Payment Links� future spec  

Smart gate QR access: **vision only** (`IMPLEMENTATION_PLAN.md` �4).

### 6. Deliverables and capabilities

| Item | Status |
|---|---|
| School Brain chat | **Not built** |
| RAG / tool-calling | **Not built** |
| Per-module AI advice table | **Specified as future** |
| Structured data / IDs for later AI | **Present** (product DB) |
| Public �Agentic Systems� service page | **Absent** |

### 7. Features vs actual customer benefits

| Plan feature | Benefit | Status |
|---|---|---|
| NL query of school data | Time back for the principal | **Not available** |
| Forecast / at-risk suggestions | Intervene earlier | Analytics has low-attendance and bottom performers; **not AI recommendations** |
| Auto-translate / draft messages | Faster parent comms | Messaging exists; **draft-AI UNVERIFIED** |
| �Agentic� brand | Sounds like next-gen ops | **Risk:** selling vision as product |

Module marketing still claims **�Attendance heatmaps and chronic absenteeism alerts�** (`lib/company/modules.ts` analytics highlights). Code has attendance charts and `lowAttendanceStudents`, not a heatmap UI or alert engine named as such�**overclaim risk** even without AI.

### 8. Pricing and commercial model

**None verified.** No agentic add-on price, token fee, or implementation SOW in files.

### 9. Differentiators supported by evidence

- **Roadmap honesty in the plan file:** labeled future, with a nontechnical explanation that AI is like adding smart doorbells later (`IMPLEMENTATION_PLAN.md` �Roadmap Keeps Options Open�).
- Data model designed for joins (student_id, school_id, invoices).

**Not a marketplace differentiator today:** no working agent product to compare.

### 10. Customer objections / purchase barriers

| Barrier | Label |
|---|---|
| �Do you have AI agents or only a plan?� | **Evidence:** plan says not built |
| Data privacy of an AI that �has access to all information� | **Hypothesis**; privacy policy covers platform use, not a third-party LLM (`legal.privacyP*`) |
| Hallucinated answers on fees/grades | **Hypothesis** (no product yet) |
| Confusing Future Ready / assistant marketing with agents | **Hypothesis** |

### 11. Claims missing evidence

Any public claim that Digni Digital currently delivers **agentic systems** as a service **cannot be supported from this workspace**.

Also missing: live WhatsApp **pre-filled payment checkout** as specified in the plan (parent pay is instructional). IMPLEMENTATION_PLAN still says WhatsApp/AI are future in one summary table while WhatsApp **sending** now exists�**the plan document is partially stale**; treat vision vs code separately.

### 12. Simplest accurate explanation (busy nontechnical owner)

**Agentic systems, in this project, means a future idea:** a chat that can look up your school�s real numbers the way ChatGPT answers questions. **It is not in the product you can use today.** Today you click screens and run reports. The database is organized so that kind of chat *could* be added later. Do not budget for an AI agent based on this repo.

---

## Cross-offering synthesis (do not confuse capability with outcome)

| Customer might think they buy | What files support |
|---|---|
| An AI staff member | Nickname for ShuleOS + **no** LLM |
| A campus digital transformation kit | **Marketed** on `/offre`; **software+website in git**; rest **unverified** |
| Autonomous agents running the school | **Roadmap only** |
| Lower fee leakage / faster bulletins | **Plausible product mechanism**; **no measured outcomes** |
| $350 for �everything Future Ready� | **$350 is the school SaaS flag**; **not itemized for power/training/hardware** |

## Source index (primary)

- `lib/company/identity.ts`
- `messages/en/marketing.json` (and FR twin)
- `components/company/future-ready-offer.tsx`
- `app/(company)/offre/page.tsx`
- `lib/company/modules.ts`
- `lib/company/money-page-content.ts`
- `lib/company/seo.ts`
- `lib/billing/types.ts`, `lib/billing/stripe.ts`, `lib/actions/billing.ts`
- `README.md`
- `IMPLEMENTATION_PLAN.md` (future AI / agentic)
- `lib/pwa/attendance-offline.ts`
- `app/parent/pay/page.tsx`
- `components/students/student-report-card.tsx`
- `lib/company/partners.ts`
- `Docs/ShuleOS-Payment-Justification-2026-09-16.html` (internal tool cost only)

## Explicitly out of scope for this file

Rewriting site copy, inventing prices, or asserting customer ROI.
