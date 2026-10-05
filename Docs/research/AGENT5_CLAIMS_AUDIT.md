# AGENT 5 � Claims verification matrix

**Scope:** Customer-facing ShuleOS / Digni Digital LLC copy (EN + FR). Closely related marketing and sales docs.  
**Date:** 20 September 2026  
**Method:** Claims extracted from live marketing strings and pages; checked against this repository�s product code, schemas, and in-app copy. **No invented proof. No production customer data queried.**  
**Not done:** Independent re-audit of cited government / DataReportal / ARPTC figures; live office walk-through; Twilio / Stripe / production env confirmation; rewriting site copy.

**Primary sources of claims**

| Surface | Path / file |
|---|---|
| Homepage | `/` � `messages/{en,fr}/marketing.json` (`home`, `offer`) � `components/company/home-page.tsx` |
| Offer | `/offre` � `marketing.offer` � `components/company/future-ready-offer.tsx` |
| Features | `/features` � `marketing.features` |
| Modules | `/modules/[slug]` � `messages/{en,fr}/modules.json` � `lib/company/modules.ts` |
| Get access | `/get-access` � `marketing.getAccess` |
| Contact | `/contact` � `marketing.contact` � `lib/company/identity.ts` |
| Docs | `/docs` � `marketing.docs` **and hardcoded English** in `app/(company)/docs/page.tsx` |
| Money pages | `/school-management-system` � `/logiciel-de-gestion-scolaire` � `lib/company/money-page-content.ts` |
| Blog + FAQs | `/blog`, `/blog/[slug]` � `messages/{en,fr}/blog.json` � `content/blog/posts/*.ts` |
| Metadata / JSON-LD | `app/layout.tsx` � `lib/company/seo.ts` � auth `messages/{en,fr}/auth.json` |
| Legal | `/privacy` `/terms` `/cookies` � `marketing.legal` |
| Auth funnel | `/login` `/register` � `messages/{en,fr}/auth.json` |
| Related sales doc | `Docs/ShuleOS-Payment-Justification-2026-09-16.html` (not the public site; conservative; excluded from �rewrite� recommendations) |

**Status key:** `VERIFIED` � `PARTIALLY VERIFIED` � `UNSUPPORTED` � `OUTDATED` � `CONTRADICTED` � `NEEDS OWNER CONFIRMATION`

**Owner confirmation** is required wherever the claim depends on live ops, contracts, env credentials, or customer outcomes that Git cannot prove.

---

## Summary (for decision-makers)

Highest-risk public claims vs this repo:

1. **�Works 100% offline� / payments recorded offline** � product only queues **teacher attendance**; in-app PWA copy says most features need a connection. Homepage trust tile is **CONTRADICTED**.
2. **Parents �pay via mobile money� / payment links** � bursars can **tag** a payment as mobile money; parent �Pay� is **manual instructions**. In-app: �online card payments are not enabled yet.� **CONTRADICTED** as a checkout product.
3. **Invoices in CDF and USD (same ledger)** � school currency list has **no CDF**; a school has **one** `currency_code`. **CONTRADICTED**.
4. **Programme National bulletins** � printable report cards exist (subjects, marks, average, attendance). **No** official PN layout / learning-area mapping in code. **PARTIALLY VERIFIED / overclaim**.
5. **JSON-LD `Offer` price `0` USD** vs Stripe school subscriptions � **CONTRADICTED** / misleading. Do **not** change approved Stripe prices from this audit; fix structured data separately after owner confirms public pricing policy.
6. **SMS campaigns**, **hiring/careers on school sites**, **inventory**, **attendance heatmaps**, **branch comparison page**, **full homework submission** � marketed; **missing or stubbed**.
7. **No testimonials, no named customers, no ROI percentages** on the marketing site. Blog �serves schools across the DRC and region� is still an **unproven customer-count claim**.
8. **Legal terms** disclaim uptime guarantees and cap liability. Do **not** delete those terms. Align **marketing** (WhatsApp support, �all systems operational� string) with **terms** (email + docs, no uninterrupted service).

---

## Matrix

### Revenue, growth, and cost-of-inaction (outcomes)

| Existing Claim | Location (file + page/route) | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| Stop tuition fee leaks / �Zero tuition fee leaks� | `messages/en/marketing.json` `home.heroTitleLine1`, `home.trustLocal`; `/` | Invoices, payments, outstanding balances exist (`app/finance/*`). No proof that leaks go to zero. Absolute �zero� is a guarantee. | UNSUPPORTED (absolute); PARTIALLY VERIFIED (ledger exists) | Conservative rewrite: �One ledger for cash and recorded mobile-money payments� � not �zero leaks.� Owner: no published leakage-reduction study found. |
| �Every franc tracked� / �Bulletproof finances� / �every franc caught� | Homepage hero; `/get-access` `included3`; modules finance `desc` | Payments and invoices exist. Dual currency + live MM checkout do not (see below). �Bulletproof� is unprovable. | UNSUPPORTED (guarantee language) | Soften to �recorded in one place.� Do not cite a recovery %. |
| Growth = more capacity, not chaos | `home.adminDescription` | Product has multi-school/branch data model; no outcome study. | UNSUPPORTED as result | Keep as aspiration or �designed so�� � not a delivered result. |
| Lost intake without a website | Modules `schoolWebsites` + blog | Public school sites + admissions forms exist (`app/(company)/schools/[slug]/*`). No conversion data. | PARTIALLY VERIFIED (capability); UNSUPPORTED (lost-intake proof) | Capability OK; drop implied enrollment lift unless owner has numbers. |
| �Most schools buy software that dies in the first blackout� | `/offre` `offer.title` | Opinion / category jab, not a measured market fact. | UNSUPPORTED | Keep as opinion only, or qualify (�many cloud tools need power and signal�). |
| Term cost list (uncollected fees, evenings, office shutdown) | `/blog/why-every-kinshasa-school-should-run-on-shuleos` `termCostItems` | Framed as a worksheet (�use yours�), not ShuleOS results. | VERIFIED as prompt, not as ShuleOS KPI | Keep worksheet framing; do not convert items into case-study numbers. |
| �You keep � growth� | `/get-access` `includedSubtitle` | No growth metric. | UNSUPPORTED | Drop �growth� or make it qualitative (�room to add students without extra notebooks�). |

### Productivity, time, and �go live� claims

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| Kinshasa team sets you up **in an afternoon** / �one afternoon to go live� | Homepage `aboutBody`; `/features` CTA; `/get-access` hero; blog CTAs; `/register` `registerSubtitle` | Onboarding routes exist. **No** measured onboarding times, no �most founders/schools� sample. | UNSUPPORTED | Owner confirm typical onboarding; rewrite to �we can start setup the same day� if true, else �guided setup.� |
| �Most founders finish in one afternoon. You have nothing to learn.� | `/get-access` `journeySubtitle` | Contradicted by a full SIS (roles, fees, PN, PWA). �Nothing to learn� is false for staff. | CONTRADICTED | Remove �nothing to learn.� Qualify �most founders� or drop. |
| Step 1 �about a minute� | `/get-access` `step1Desc` | School name + email is short; full school is not. | PARTIALLY VERIFIED | Scope to �account start,� not full go-live. |
| iOS add-to-home-screen �About 10 seconds� | `marketing.install.iosSteps` | Typical PWA flow; not timed in repo. | NEEDS OWNER CONFIRMATION | Harmless if framed as typical; not a SLA. |
| Report-card week �hours not a week� | Blog FAQ `school-report-card-software.ts` | Printable cards from gradebook exist. No timed study. | UNSUPPORTED as duration | �Print from the same gradebook� without hour/week guarantee. |
| Attendance �under two minutes per class� | Blog FAQ `school-attendance-software.ts` | Bulk marking exists. No timing study. | UNSUPPORTED | Drop the two-minute figure or mark as design goal. |
| Dashboards �minutes not days� | `modules.json` analytics `localContext` | Analytics pages exist (`app/analytics/*`). Branch page **redirects**. | PARTIALLY VERIFIED | Keep �in the app�; drop time comparison until measured. |
| Auth: �most schools finish setup in one afternoon� | `messages/en/auth.json` `registerSubtitle` | Same as go-live claim. | UNSUPPORTED | Same as homepage: owner confirm or qualify. |

### Automation and product capabilities

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| One record for fees, grades, parent messages | Homepage, features, money pages | Modules exist across academic, finance, messages, parent portal. | VERIFIED (architecture) | Keep; avoid �nothing loseable� as a guarantee. |
| Students, classes, admissions, staff in one place | Homepage admin features; `/features` | Matching app routes. | VERIFIED | � |
| Live fee balances per student | `home.adminFeature2` | Invoice `amount` / `amount_paid` / `balance`. �Live� depends on staff recording payments (parent MM is not instant). | PARTIALLY VERIFIED | �Balances update when payments are recorded.� |
| Free branded school website + online admissions | Homepage; features; modules school-websites | Templates modern/classic/minimal (`lib/schools/website-templates.ts`); public admissions (`schools/[slug]/admissions`). �Free� is a **pricing** claim. | PARTIALLY VERIFIED (feature); NEEDS OWNER CONFIRMATION (always-free vs bundled with paid plan) | Do not change approved pricing. Clarify �included with ShuleOS� after owner confirms commercial terms. |
| Events, hiring, school visit booking | Features `schoolWebsitesItems`; modules highlights | Events + visit booking exist. **No hiring/careers listings or staff-application queue** in repo. | CONTRADICTED (hiring); VERIFIED (events/visits) | Remove hiring until built. Keep events/visits. |
| 3 templates (Modern, Classic, Minimal) | Features; modules | `WEBSITE_TEMPLATE_IDS` | VERIFIED | � |
| Fee structures by class, term, or **boarding** | Modules finance highlight 0 | Fee structures: branch, amount, optional class, school year (`lib/validations/finance.ts`). **No boarding-status field.** | PARTIALLY VERIFIED | Drop �boarding� or add the field before claiming it. |
| Automated invoices | Modules finance | Invoices can be created (including enrollment RPC). Not fully automatic for every fee type without staff action. | PARTIALLY VERIFIED | �Issue invoices from fee structures,� not �fully automated collections.� |
| Mobile-money-ready **payment links** with amounts pre-filled | Modules finance; parent portals; blog | Parent `/parent/pay` shows balance + **manual** MM/bank steps. Generic `app/api/webhooks/payments/route.ts` is a **stub** (Paystack/Flutterwave mentioned in comments, no provider UI). | CONTRADICTED | Rewrite to �record mobile-money payments� / �instructions with exact amount.� Owner: only claim links after a live PSP. |
| Parents pay exact balance via mobile money (homepage) | `home.parentFeature2`, `parentDescription` | Same as above. Parent copy: �Manual payment instructions � online card payments are not enabled yet.� (`messages/en/parent.json`) | CONTRADICTED | Align marketing with parent pay page. |
| Fee reminders via WhatsApp | Modules; finance docs; blog | Cron + Twilio WhatsApp (`app/api/cron/fee-reminders/route.ts`, `lib/services/whatsapp.ts`). **Requires env.** SMS channel **returns error** `smsCampaignsUnavailable`. | PARTIALLY VERIFIED | Claim �WhatsApp reminders when configured.� Remove SMS from �mass WhatsApp and SMS� until shipped. |
| Mass WhatsApp **and SMS** | Blog `why-every-kinshasa�` messaging module; `every-way-shuleos�` | `lib/actions/campaigns.ts` blocks SMS. | CONTRADICTED | Remove SMS from customer-facing lists. |
| Payroll, expenses, budget, reports | Features finance items | Matching `app/finance/*` routes. | VERIFIED | � |
| Library, transport, events, staff/HR | Features operations | Matching operations apps. | VERIFIED | � |
| **Inventory** for uniforms and materials | `lib/company/modules.ts` operations highlight 4 | **No inventory module** found. | UNSUPPORTED | Remove until built. |
| Analytics dashboards (school, student, attendance, finance) | Features; `/analytics` | Pages exist. | VERIFIED | � |
| **Branch comparison** for multi-campus | Modules analytics; blog | `app/analytics/branches/page.tsx` **redirects to `/analytics`**. | CONTRADICTED / OUTDATED | Remove or restore the page before claiming. |
| Attendance **heatmaps** and **chronic absenteeism alerts** | Modules analytics | Attendance analytics: line/bar charts, not heatmaps. Student `chronic_illness` ? absenteeism alerts. | UNSUPPORTED | Describe existing charts; drop heatmap/alert language. |
| Exportable reports for **ministry submissions** | Modules analytics | Print/CSV-style reports exist (e.g. inscription export). No ministry-format templates. | PARTIALLY VERIFIED | �Exportable reports.� Drop �ministry� unless a template exists. |
| Medical notes on student profiles | Modules academic highlight 0 | Health fields: chronic illness, vision, physical, allergies (`student` inscription). Not a clinical notes EHR. | PARTIALLY VERIFIED | �Health fields from the enrolment form,� not �medical notes.� |
| Classes aligned to **DRC grade levels** | Modules academic | Presets: English Nursery/Primary/Form (`lib/schools/structure-presets.ts`). Sales doc notes Congolese class names were **not** added. | PARTIALLY VERIFIED | �Configurable grade names� until EPST labels ship. |
| Daily attendance with bulk marking | Modules academic | Teacher attendance sheet + bulk save. | VERIFIED | � |
| **Absence alerts** | Modules academic; parent portal blog | No dedicated absence-alert product found (push class reminders exist separately). | UNSUPPORTED | Remove or implement. |
| Gradebooks, exams, report cards | Features; teacher items | `app/teacher/gradebook`, report card component. | VERIFIED | � |
| **Programme National** mapping / official bulletin format | Homepage `trustSimpleDesc`; blog FAQ �Yes. ShuleOS maps� to DRC Programme National formats�; money pages | Report card: subject, marks, grade letter, average, attendance, remarks (`components/students/student-report-card.tsx`). No PN strands / official grid. | PARTIALLY VERIFIED (report cards); UNSUPPORTED (official PN format) | �Printable term report cards from the gradebook.� Owner confirm any school-specific PN template not in Git. |
| �Zero math errors� on averages | Homepage `trustSimpleDesc` | Averages computed in software; no proof of zero defects. | UNSUPPORTED | �Calculated in the app� � not zero errors. |
| Timetable builder with rooms | Modules academic | Timetable module exists. Room assignment: confirm per school setup; not independently exhaust-tested here. | PARTIALLY VERIFIED | Keep if rooms exist in timetable UI; owner confirm. |
| Parent portal: grades, attendance, timetable, assignments, fees, messages, events, transport | Features parent items | Matching `app/parent/*` routes. Assignments **read-only**. | PARTIALLY VERIFIED | �View assignments,� not submit-from-parent. |
| Student portal: homework **submission** | Modules parent-student-portals; features | `app/student/assignments/page.tsx` lists status; **no submit control** in the page. | PARTIALLY VERIFIED / CONTRADICTED as �submission� | �View assignments and grades� until upload/submit exists. |
| Low-bandwidth / mobile browsers | Modules portals | Responsive web + PWA. Not a measured bandwidth SLA. | PARTIALLY VERIFIED | Keep qualitative; no speed claims. |
| Real-time messaging / �Whole-school command in real time� | Homepage presence; modules messaging | In-app messages exist. No marketing-page proof of websocket realtime. | PARTIALLY VERIFIED | �In-app messages with history.� Drop �real time� unless product uses live subscriptions. |
| Class-wide / school-wide broadcasts | Modules messaging | Outreach campaigns (WhatsApp/in-app). | PARTIALLY VERIFIED | OK for in-app/WhatsApp when configured. |
| Integrates with fee reminders and event updates | Modules messaging highlight 5 | Fee reminders are a finance cron; not proven as a messaging-module �integration� UX. | PARTIALLY VERIFIED | �Reminders and messages in the same platform.� |
| Encrypted in transit, access controls, audit logging | `/privacy` `privacyP5` | HTTPS assumed; `audit_logs` + admin audit page exist. Encryption-at-rest not evidenced in this audit. | PARTIALLY VERIFIED | Keep transit + RBAC + audit; don�t add certifications not in repo. |
| Docs: �meets **compliance requirements**� | `app/(company)/docs/page.tsx` (hardcoded EN, not i18n) | No named standard (ISO, GDPR adequacy, etc.). | UNSUPPORTED | Point to Privacy Policy; name only frameworks the company actually follows. |
| Daily **cash register** reports / cl�ture de caisse | Homepage `trustLocalDesc` | Daily **activity** reports include fee receipts (`Docs` payment justification + `app/academic/reports/daily`). Not a dedicated cash-register / till product. | PARTIALLY VERIFIED | �Daily activity / collections reports.� |
| **Tamper-proof** digital receipts | Homepage `trustLocalDesc` | Printable **expense** receipts after approval; enrolment still uses **paper receipt photos**. No cryptographic receipt sealing found. | CONTRADICTED / UNSUPPORTED | �Printable payment records.� Drop �tamper-proof.� |
| Attendance & discipline from 7:30 AM / know who is in class without walking hallways | Homepage `trustSupport*` | Attendance + discipline boards exist **if staff mark them**. Not automatic presence sensing. | PARTIALLY VERIFIED | �When teachers mark the roll in the app.� |
| PWA install without app store (iPhone/Android) | `marketing.install`; `lib/pwa/config.ts` | Manifest + install UI exist. | VERIFIED | � |
| Offline attendance that syncs | Money pages; blog attendance FAQ; PWA | IndexedDB queue `lib/pwa/attendance-offline.ts`; teacher attendance sheet queues saves. | VERIFIED (attendance only) | Say **attendance**, not the whole school. |
| �Works **100%** offline� / app keeps recording **payments and attendance** | Homepage `trustAffordable*` | Offline page: product **needs a connection for most features**; only queued attendance. **No offline payments.** | CONTRADICTED | Match PWA strings. Highest-priority homepage fix. |
| Money page �Logged WhatsApp and SMS campaigns with delivery trails� | `lib/company/money-page-content.ts` EN messaging section | WhatsApp send exists; SMS blocked; delivery-trail completeness depends on Twilio. | PARTIALLY VERIFIED | Drop SMS; �WhatsApp outreach when connected.� |
| French and English | Money page; blog | `messages/en` + `messages/fr`. | VERIFIED | � |
| Multi-currency fees | Money page; blog | `lib/currency.ts`: USD, EUR, GBP, GHS, NGN, KES, ZAR, CAD, AUD, INR. **No CDF.** One currency per school. | CONTRADICTED vs �CDF and USD� | Add CDF and dual-currency **or** stop claiming CDF/USD same week. |
| Fee hold on students | Internal tags; blog says holds �should be system-enforced� | `fee_hold` student tag exists. Not proven to block bulletin print automatically. | PARTIALLY VERIFIED | Don�t claim automatic bulletin blocking until coded. |

### AI / �assistant� performance

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| �Trusted digital director� / �smart assistant handles the rest� | `lib/company/identity.ts` `productFullName`; footer `taglineSuffix`; metadata | Branding. **No LLM / AI feature** found in app code (search for model APIs returned unrelated hits). | UNSUPPORTED as AI performance | Treat as metaphor. Avoid �AI� accuracy/autonomy claims. Optional: �school operating system.� |
| Get-access: �The assistant helps your teachers� / �What the assistant manages for you� | `/get-access` steps + included list | Software workflows, not an autonomous agent. | UNSUPPORTED as AI | �The platform records�� |
| Meta: �lead with peace of mind � no technical skill required� | `marketing.metaDescription` | Overclaim vs a full SIS. | UNSUPPORTED | �Designed so staff don�t need an IT department.� |

### Guarantees and risk reversal

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| Zero leaks / zero math errors / tamper-proof / 100% offline / bulletproof | Homepage + get-access | See capability rows. | UNSUPPORTED / CONTRADICTED | Remove guarantee adjectives. |
| Terms: **do not guarantee** uninterrupted service | `/terms` `termsP6` | Explicit disclaimer. | VERIFIED (legal text) | **Do not delete.** Align marketing with this. |
| Liability limited to fees paid in preceding 12 months | `/terms` `termsP7` | Contractual. | NEEDS OWNER CONFIRMATION (counsel) | **Do not change from this audit.** |
| Either party may terminate with written notice | `/terms` `termsP8` | Contractual. | NEEDS OWNER CONFIRMATION | Keep; not a marketing �cancel anytime� banner unless owner wants that. |
| We do not sell personal data | `/privacy` `privacyP4` | Policy statement; not independently audited. | NEEDS OWNER CONFIRMATION | Keep as policy; don�t add �certified.� |
| �All systems operational� | `marketing.footer.allSystemsOperational` passed from layout | **Not rendered** in `site-footer.tsx`. No status page. | OUTDATED / UNSUPPORTED | Don�t surface a live-status claim without a real status source. |
| Contact �Open now� based on 08:00�18:00 WAT weekdays | `components/company/contact-page.tsx` | Logic matches `identity.office.supportHours`. Actual staffing unproven. | PARTIALLY VERIFIED | Keep hours as **published hours**, not SLA. |

### Customer counts, results, testimonials, case studies

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| Named testimonials / logos / case-study ROI | Marketing site | `companyPartners = []`; partners section hidden when empty. **No testimonial components.** Internal rule: never invent stats. | VERIFIED absence | Do not add fake social proof. |
| �Serving schools across the DRC� | `identity.origin`; contact hero | Positioning. No school count in Git. | NEEDS OWNER CONFIRMATION | Use if true; else �built for DRC schools.� |
| FAQ: �ShuleOS serves schools across the DRC **and region**� | `content/blog/posts/school-management-system-drc.ts` FAQ | No customer list in repo. | UNSUPPORTED | Owner list regions actually live; otherwise �available to schools in the DRC.� |
| �Why **every** Kinshasa school should run on ShuleOS� | Blog title | Rhetoric, not a customer result. | UNSUPPORTED as fact | Title is advocacy; don�t treat as proof of adoption. |
| Payment justification doc | `Docs/ShuleOS-Payment-Justification-2026-09-16.html` | Explicitly **does not** certify production school data; Git-only. | VERIFIED as cautious | Not public marketing; do not mine it for customer counts. |

### Pricing, discounts, trials

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| Schema.org SoftwareApplication **price 0 USD** | `lib/company/seo.ts` `softwareApplicationJsonLd`; homepage JSON-LD | Stripe checkout + `messages/en/billing.json` paid subscription; admin �price is fixed in Stripe.� | CONTRADICTED | Owner confirm public price policy. **Do not invent a new public price here.** Fix JSON-LD to �contact for pricing� / omit Offer, or match the approved Stripe amount. |
| Paid plans billed as agreed at signup | `/terms` `termsP5` | Matches Stripe + exempt schools. | VERIFIED as contract language | Keep. |
| Trialing status in billing UI | `messages/en/billing.json`; `getStripeTrialDays()` | Trial **if** Stripe env sets trial days. **Not** advertised on homepage. | PARTIALLY VERIFIED | Don�t market a free trial length unless env + owner agree. |
| �Billing handled by ShuleOS� / complimentary | Billing `exempt*` | Code path for `billing_exempt`. | VERIFIED as product behavior | Don�t advertise as a public discount. |
| Future Ready includes electricity, internet, on-site computer, training, **free website** | `/` offer + `/offre` | Software + website in product. Hardware/power/connectivity **not in this repo**. | NEEDS OWNER CONFIRMATION | Keep only if the commercial offer is real; else software-only copy. Do not invent package prices. |
| �Without paying a designer� (website) | Offer pillar 6 | Templates exist; still needs school content. | PARTIALLY VERIFIED | Fair as �no separate web agency required.� |

### Certifications, partnerships, integrations

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| �Our partners� | `marketing.partners` | Empty `lib/company/partners.ts`; UI hidden. | VERIFIED (no false logos) | Add logos only with permission. |
| Kinshasa office: Crown Towers, Batetela, Floor 15, Office 1502 | `lib/company/identity.ts`; contact; blog sources | Hardcoded. Not physically verified in this audit. | NEEDS OWNER CONFIRMATION | Confirm still accurate. |
| Phone +243 822 378 097 / wa.me | Identity + contact CTAs | Hardcoded. | NEEDS OWNER CONFIRMATION | Confirm WhatsApp business number. |
| Emails growth@ / support@ digni-digital-llc.com | Identity | Hardcoded. | NEEDS OWNER CONFIRMATION | � |
| Support Mon�Fri 8:00�18:00 WAT | Identity; blog fact �8:00�18:00� | Matches contact clock. | NEEDS OWNER CONFIRMATION (staffing) | Same as published hours. |
| LinkedIn company/shuleos | Identity + footer | URL present; live page not fetched. | NEEDS OWNER CONFIRMATION | � |
| Product of Digni Digital LLC | Footer | Identity `legalName`. | VERIFIED as stated identity | � |
| Google sign-in | Auth pages | `google-auth-button.tsx`. | VERIFIED (feature) | Not a partnership badge. |
| WhatsApp (Twilio) | Fee reminders / OTP | Code + env required. | PARTIALLY VERIFIED | Don�t claim Meta/Twilio partnership. |
| Stripe | Billing | `lib/billing/stripe.ts`. | VERIFIED (integration in code) | Don�t claim Stripe partnership badge. |
| Mobile money brands (M-Pesa, Airtel Money, etc.) | Blog sources / UNIKIN example | **Market context**, not �ShuleOS is certified with M-Pesa.� Parent pay does not call those APIs. | PARTIALLY VERIFIED (market); UNSUPPORTED (product integration) | Keep as Kinshasa context; don�t imply a PSP partnership. |
| Headquartered in Kinshasa | Privacy `privacyP1` | Identity office. | NEEDS OWNER CONFIRMATION | Legal entity vs office: owner/counsel. |

### Comparative and superlative claims

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| FAQ �best school management system in Congo?� answered with criteria, not �ShuleOS is #1� | `school-management-system-drc.ts` | Criteria list. Still sits on a ShuleOS site. | PARTIALLY VERIFIED | Acceptable if not �#1 ranked.� |
| Foreign SIS fails on DRC bulletins / �not a generic import� | Blog posts | Positioning. PN format gap weakens the contrast. | PARTIALLY VERIFIED | Tone down until PN format is real. |
| WhatsApp first / fastest for directors | Contact | Sales channel, not measured SLA vs email. | UNSUPPORTED as �fastest� | �Preferred channel.� |
| Terms say support via **docs and email**; marketing says **WhatsApp first** | `/terms` vs `/contact` | Both exist as channels; legal understates WhatsApp. | CONTRADICTED (channel mix) | Counsel: add WhatsApp to terms **or** keep terms conservative and soften marketing �first.� **Do not delete support terms.** |

### Blog / FAQ market statistics (not ShuleOS performance)

Cited as external facts with sources in `messages/en/blog.json` `sources`. **This audit did not re-download yearbooks.** Status = cited, not re-verified.

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| 66.4% of Kinshasa primary schools private (MEPSP 2019�2020) | Blog facts + sources | Source string present. Figure is ~6 years old vs 2026 copy. | NEEDS OWNER CONFIRMATION; risk of OUTDATED | Keep with year; don�t imply 2026 census. |
| 101,000+ schools nationwide (Gov DRC 2022) | Same | Cited. | NEEDS OWNER CONFIRMATION | Keep with year. |
| 30.5% internet penetration / 34.7M users (DataReportal Digital 2026) | Same | Cited. | NEEDS OWNER CONFIRMATION | Re-check DataReportal before reuse in ads. |
| ARPTC 2025 M-Pesa / Airtel ~USD 200M each | Same | Cited as �on the order of.� | NEEDS OWNER CONFIRMATION | Keep hedging language. |
| UNIKIN communiqu� n�002/2025 mobile payment | Same | Cited as university practice, not ShuleOS. | NEEDS OWNER CONFIRMATION | Don�t imply ShuleOS built that. |
| �Two-thirds of Kinshasa primary schools are private� in excerpt | Blog excerpt | Matches 66.4% rounding. | Same as 66.4% row | � |

### Identity, metadata, JSON-LD

| Existing Claim | Location | Evidence | Status | Recommended Action |
|---|---|---|---|---|
| Product ShuleOS; legal Digni Digital LLC | Identity, footer, JSON-LD Organization | Consistent in code. | VERIFIED as intended identity | � |
| SoftwareApplication category BusinessApplication; OS Web, PWA | `lib/company/seo.ts` | Matches architecture. | VERIFIED | � |
| areaServed CD; languages English, French | Organization JSON-LD | Matches i18n + positioning. �Serves� ? proven customers. | PARTIALLY VERIFIED | OK as target market. |
| Root metaDescription: trusted digital director, no technical skill | `marketing.metaDescription` � `app/layout.tsx` | Same as AI/skill overclaim. | UNSUPPORTED (skill/trust) | Align with conservative homepage. |
| Auth metaDescription: mobile money in one record | `auth.metaDescription` | Overstates MM checkout. | CONTRADICTED | Same rewrite as homepage MM. |
| Blog index meta: Programme National report cards | `messages/en/blog.json` index | Overstates PN format. | PARTIALLY VERIFIED | Same as report-card row. |

---

## Surfaces with **no** performance claims of note

- Cookie policy mechanics (standard).
- Nav labels.
- Empty partner row (correctly hidden).
- Payment-justification HTML/PDF: Git work log, not customer ROI.

---

## Priority actions (copy only � this audit does not edit the site)

**Do now (contradictions):** homepage 100% offline + offline payments; parent mobile-money checkout / payment links; CDF+USD ledger; SMS; hiring; JSON-LD price 0; �tamper-proof�; branch comparison; homework submission.

**Do next (overclaims):** Programme National official format; zero leaks / zero errors; afternoon go-live / nothing to learn; AI assistant; ministry exports; heatmaps; inventory; boarding fees; compliance unnamed.

**Owner confirm (do not invent):** office address, WhatsApp hours/staffing, live Twilio/Stripe, trial days, website �free� vs subscription, Future Ready hardware bundle, any live school/region list, blog statistics.

**Do not change from this audit:** Terms limitation of liability, termination, governing law, �paid plans as agreed,� Stripe **amount** itself.

---

## EN / FR

French marketing (`messages/fr/marketing.json`, `modules.json`, `blog.json`, money page FR) repeats the same factual claims (100% hors ligne, mobile money, CDF/USD, Programme National, SMS, site offert, etc.). Apply the same statuses; do not treat FR as a separate product story.
