# Claims verification � ShuleOS / Digni Digital LLC (this product surface)

**Synthesized:** 20 September 2026 from Agent 5 (complete), plus extra claims from Agents 1�4 and 6.  
**Method:** Claims vs this repository. No invented proof. No production customer data. **No live-site rewrites in this document.**  
**Status key:** `VERIFIED` � `PARTIALLY VERIFIED` � `UNSUPPORTED` � `OUTDATED` � `CONTRADICTED` � `NEEDS OWNER CONFIRMATION`

**Contractual / pricing terms are not dropped.** Stripe **$350 USD** stays as in-app plan amount. Terms (liability cap, termination, governing law, �paid plans as agreed�) stay. JSON-LD price `0` is flagged, not treated as a license to invent a new public price.

French marketing repeats the same facts � same statuses; FR is not a second product.

---

## 1. Decision-maker summary

Highest-risk public claims vs this repo:

1. **�Works 100% offline� / offline payments** � only teacher attendance is queued. **CONTRADICTED.**
2. **Parents pay via mobile money / payment links** � parent Pay is **manual instructions**; �online card payments are not enabled yet.� **CONTRADICTED** as checkout.
3. **Invoices CDF and USD same ledger** � **no CDF** in `lib/currency.ts`; one `currency_code` per school. **CONTRADICTED.**
4. **Programme National bulletins** � printable cards exist; official PN layout **not** in code. **PARTIALLY VERIFIED / overclaim.**
5. **JSON-LD Offer price `0` USD** vs Stripe $350. **CONTRADICTED.** Do not change approved Stripe amount from this file.
6. **SMS, hiring/careers, inventory, attendance heatmaps, branch comparison page, homework submission** � marketed; missing or stubbed.
7. **No testimonials / logos / ROI.** �Serves schools across the DRC and region� unproven.
8. **Legal** disclaims uptime; marketing WhatsApp-first vs terms email+docs. **Do not delete legal terms.**
9. **Future Ready** six pillars � app + site in code; power/internet/computer/curriculum **NEEDS OWNER.**
10. **Digital director / assistant** � branding, not AI. Apex **does** sell AI Employee � **different site.**
11. **Blog FAQ �pricing varies by student count�** vs fixed $350. **CONTRADICTED** internally.
12. **Agent 6:** hiring promised; no `/schools/[slug]/careers`. Desktop nav lacks acquire CTA (process, not a product claim).

---

## 2. Approved claims (safe if wording stays tied to evidence)

Use these without guarantee adjectives:

| Claim | Status | Bound |
| --- | --- | --- |
| Digni Digital LLC provides ShuleOS, a school management platform | VERIFIED as identity | Not �AI solutions firm� on this site |
| ShuleOS is a product of Digni Digital | VERIFIED | Footer |
| Multi-role system: admin, teacher, parent, student | VERIFIED | Routes exist |
| One record architecture for fees, grades, parent messages | VERIFIED (architecture) | Not �nothing loseable� |
| Students, classes, admissions, staff in one place | VERIFIED | |
| Fee structures, invoices, payment history, payroll, expenses, budgets | VERIFIED | Balances update when staff record payments |
| Daily attendance with bulk marking | VERIFIED | |
| Gradebooks, exams, printable report cards (subject/marks/average/attendance) | VERIFIED | Not official PN grid |
| Library, transport, events, staff/HR modules | VERIFIED | |
| Analytics pages (school, student, attendance, finance) | VERIFIED | Not heatmaps / branch comparison page |
| Three website templates; public site; admissions; enroll; events; visit booking | VERIFIED | Not hiring |
| PWA install without app store | VERIFIED | |
| Offline **attendance** queue that syncs | VERIFIED | Attendance only |
| French and English interfaces | VERIFIED | |
| Stripe integration for **school SaaS** subscription | VERIFIED in code | Interval unverified |
| Plan amount **$350 USD** in `SHULEOS_PLAN_AMOUNT_USD` | VERIFIED as code constant | Not automatically public marketing |
| Access: paid subscription statuses **or** `billing_exempt` | VERIFIED | Don�t advertise exemption as a public discount |
| Terms: paid plans billed as agreed at signup | VERIFIED as legal text | Keep |
| Terms: no guarantee of uninterrupted service | VERIFIED | Keep; don�t contradict with fake status |
| Terms: liability limited to fees paid in preceding 12 months | NEEDS OWNER (counsel) | **Do not change from this audit** |
| Terms: either party may terminate with written notice | NEEDS OWNER | Keep; not �cancel anytime� banner unless owner wants |
| Privacy: we do not sell personal data | NEEDS OWNER as practice | Keep as policy; no �certified� |
| School owns uploaded data (as policy language) | VERIFIED as legal copy | |
| Governing law DRC; Kinshasa courts | VERIFIED as terms | |
| EN/FR marketing + product UI | VERIFIED | |
| Google sign-in component exists | VERIFIED | Not a partnership badge |
| No partner logos shown (empty array, UI hidden) | VERIFIED absence | Do not invent logos |
| No named testimonials on marketing site | VERIFIED absence | Do not invent quotes |
| Register creates school from name + admin email | VERIFIED | Then approval |
| Auth copy: review usually 1�2 business days | VERIFIED as **copy** | Not a measured SLA |
| Enrollment: apply online, finish in person with ID | VERIFIED as school-site copy | |
| Blog term-cost list framed as worksheet, not ShuleOS KPI | VERIFIED as prompt | Don�t convert to case-study numbers |
| Kinshasa contact details **as published in identity.ts** | NEEDS OWNER (still accurate?) | May publish if confirmed |
| SoftwareApplication category / Web+PWA in JSON-LD | VERIFIED vs architecture | Price 0 is not |

---

## 3. Restricted claims (soften, scope, or remove from marketing)

| Claim | Status | Rule |
| --- | --- | --- |
| Zero tuition fee leaks / every franc tracked / bulletproof / every franc caught | UNSUPPORTED (absolute); ledger PARTIALLY VERIFIED | One place for recorded payments � no % |
| Growth = more capacity not chaos | UNSUPPORTED as result | �Designed so�� only |
| Lost intake without website | PARTIALLY VERIFIED capability | No enrollment-lift numbers |
| Most schools� software dies in first blackout | UNSUPPORTED | Opinion only |
| Setup in an afternoon / most founders finish / most schools finish setup | UNSUPPORTED | Owner typical time; never �nothing to learn� (**CONTRADICTED**) |
| Step 1 about a minute | PARTIALLY VERIFIED | Account start, not go-live |
| iOS add to home ~10 seconds | NEEDS OWNER | Typical, not SLA |
| Report-card week hours not a week | UNSUPPORTED duration | Print from gradebook |
| Attendance under two minutes per class | UNSUPPORTED | Drop figure |
| Dashboards minutes not days | PARTIALLY VERIFIED | In the app; no time comparison |
| Live fee balances | PARTIALLY VERIFIED | When payments are recorded |
| Free branded website | PARTIALLY VERIFIED feature; NEEDS OWNER commercial | Included with plan vs $0 product |
| Without paying a designer | PARTIALLY VERIFIED | Templates, not a design studio |
| Events + visit booking | VERIFIED | |
| Hiring / careers on school sites | CONTRADICTED | Remove until built |
| Fee structures by boarding | PARTIALLY VERIFIED | Drop boarding or ship field |
| Automated invoices | PARTIALLY VERIFIED | Issue from structures, not fully automatic collections |
| Mobile-money payment links / parents pay exact balance in product | CONTRADICTED | Record MM / instructions with amount |
| Fee reminders via WhatsApp | PARTIALLY VERIFIED | When Twilio configured |
| Mass WhatsApp **and SMS** | CONTRADICTED (SMS blocked) | Drop SMS |
| Inventory uniforms/materials | UNSUPPORTED | Remove |
| Branch comparison page | CONTRADICTED / OUTDATED | Remove or restore page |
| Attendance heatmaps / chronic absenteeism alerts | UNSUPPORTED | Existing charts only |
| Exportable reports for ministry | PARTIALLY VERIFIED | Exportable reports; drop ministry unless template |
| Medical notes | PARTIALLY VERIFIED | Health fields on enrolment form |
| Classes aligned to DRC grade levels | PARTIALLY VERIFIED | Configurable names; Congolese presets not in structure-presets (English Nursery/Primary/Form) |
| Absence alerts | UNSUPPORTED | |
| Official Programme National mapping / formats | PARTIALLY VERIFIED cards; UNSUPPORTED official format | Printable term cards |
| Zero math errors | UNSUPPORTED | Calculated in the app |
| Timetable with rooms | PARTIALLY VERIFIED | Owner confirm rooms |
| Parent portal assignments | PARTIALLY VERIFIED | View, not parent submit |
| Student homework **submission** | CONTRADICTED as submit | View assignments/grades |
| Low-bandwidth | PARTIALLY VERIFIED qualitative | No speed SLA |
| Real-time messaging / whole-school command in real time | PARTIALLY VERIFIED | In-app history; drop real-time unless live subs |
| Encrypted in transit, access controls, audit logging | PARTIALLY VERIFIED | Don�t add certifications; at-rest not evidenced |
| Docs �meets compliance requirements� | UNSUPPORTED | Point to Privacy; name only real frameworks |
| Daily cash register / cl�ture de caisse | PARTIALLY VERIFIED | Daily activity / collections reports |
| Tamper-proof digital receipts | CONTRADICTED / UNSUPPORTED | Printable payment records; enrolment uses paper receipt photos |
| Know who is in class from 7:30 without walking hallways | PARTIALLY VERIFIED | When teachers mark the roll |
| Works 100% offline / offline payments | CONTRADICTED | Match PWA strings |
| Logged WhatsApp and SMS campaigns with delivery trails | PARTIALLY VERIFIED | WhatsApp when connected; drop SMS |
| Multi-currency CDF and USD | CONTRADICTED | Add CDF+dual or stop claiming |
| Fee hold blocks bulletins | PARTIALLY VERIFIED tag | Don�t claim automatic bulletin block until coded |
| Trusted digital director / smart assistant handles the rest | UNSUPPORTED as AI | Metaphor only |
| Assistant helps teachers / manages for you | UNSUPPORTED as AI | Platform records� |
| No technical skill required / peace of mind meta | UNSUPPORTED | No IT department required (softer) |
| All systems operational | OUTDATED / not rendered | Don�t surface without status page |
| Contact �Open now� | PARTIALLY VERIFIED vs clock | Published hours, not SLA |
| Serving schools across the DRC | NEEDS OWNER | Else �built for DRC schools� |
| Serves DRC **and region** (FAQ) | UNSUPPORTED | Owner list |
| Why **every** Kinshasa school should run on ShuleOS | UNSUPPORTED as fact | Advocacy title |
| Schema.org price 0 | CONTRADICTED | Fix after public price policy; don�t invent |
| Trial length | PARTIALLY VERIFIED in env/UI | Don�t market unless owner+env |
| Future Ready electricity, internet, computer, student training | NEEDS OWNER | Software+site only in git |
| WhatsApp fastest channel | UNSUPPORTED as SLA | Preferred channel |
| Foreign SIS fails on DRC bulletins | PARTIALLY VERIFIED positioning | Tone down until PN format real |
| Auth meta: mobile money in one record | CONTRADICTED | Align with parent pay |
| Blog index: PN report cards | PARTIALLY VERIFIED | Same as PN row |
| FAQ �best SMS in Congo?� | PARTIALLY VERIFIED | Criteria OK; not �#1 ranked� |
| Area served CD in JSON-LD | PARTIALLY VERIFIED | Target market, not customer proof |
| M-Pesa / Airtel as product integration | UNSUPPORTED | Kinshasa context only |
| WhatsApp/Twilio/Stripe �partners� | PARTIALLY VERIFIED integrations | No badge |
| LinkedIn page live | NEEDS OWNER | URL in identity |
| Headquartered in Kinshasa vs LLC jurisdiction | NEEDS OWNER / counsel | |
| �Kinshasa schools already pay for ShuleOS. They just don�t have it yet.� | UNSUPPORTED | Rhetoric |
| You keep � growth (get-access) | UNSUPPORTED | Qualitative only |
| You have nothing to learn | CONTRADICTED | Remove |
| Join the revolution (key leftover) | Voice violation | Don�t use as CTA |

---

## 4. Needs owner confirmation (do not invent)

| Topic | Why Git cannot close it |
| --- | --- |
| Public pricing policy | $350 vs FAQ varies vs contact-only vs JSON-LD 0 |
| Stripe **interval** (month/year) | Price ID in Stripe, not app |
| Production `STRIPE_TRIAL_DAYS` | Env |
| Website always-free vs bundled | Commercial |
| Future Ready delivery (who installs power/ISP/PCs, lead time, price) | Not in repo |
| Live school count / regions / paying vs exempt | No customer list |
| La Richarde / GS Laricharde public naming | Collateral vs apex �in progress� |
| Office address, WhatsApp +243, emails, hours staffing | Hardcoded only |
| Twilio WhatsApp live in production | Env + account |
| Parent PSP go-live | Stub webhook |
| CDF / dual currency roadmap | Product change |
| Any school-specific PN template not in Git | |
| Blog stats: MEPSP 2019�20 66.4%; Gov DRC 2022 101,000+ schools; DataReportal Digital 2026 30.5% / 34.7M; ARPTC 2025 MM volumes; UNIKIN communiqu� | Cited, not re-downloaded; age risk |
| Cookie banner vs cookies policy | Agent 6: no banner observed |
| Counsel: add WhatsApp to terms vs keep conservative | Channel mix CONTRADICTED |
| Apex vs www domain canonical | HighLevel shell vs Next apex |
| Whether $350 may appear on marketing | Agent 6: only if leadership confirms |

---

## 5. Full matrix (Agent 5 distilled + extras)

### 5.1 Outcomes / cost-of-inaction

| Existing claim | Location | Evidence | Status | Action |
| --- | --- | --- | --- | --- |
| Stop tuition fee leaks / Zero tuition fee leaks | `messages/en/marketing.json` home hero, trustLocal; `/` | Ledgers exist; no leak study; �zero� is a guarantee | UNSUPPORTED (absolute); PARTIALLY VERIFIED (ledger) | Soften; no recovery % |
| Every franc tracked / bulletproof / every franc caught | Hero; get-access included3; finance desc | Dual currency + live MM checkout fail | UNSUPPORTED guarantee | Recorded in one place |
| Growth = capacity not chaos | home.adminDescription | Multi-branch model; no study | UNSUPPORTED as result | Aspiration / designed so |
| Lost intake without website | modules schoolWebsites; blog | Sites + admissions exist; no conversion data | PARTIALLY VERIFIED / UNSUPPORTED lift | Capability only |
| Most schools buy software that dies in first blackout | `/offre` offer.title | Rhetoric | UNSUPPORTED | Opinion or qualify |
| Term cost worksheet | Kinshasa blog termCostItems | Worksheet not KPI | VERIFIED as prompt | Keep framing |
| You keep � growth | get-access includedSubtitle | No metric | UNSUPPORTED | Drop or qualitative |
| Teacher pay and generator fuel at risk | school-management-system-drc post | Named loss, not measured | COPY-ASSERTED scene | OK as problem language; not ShuleOS result |
| Empty seats you will still staff | modules; blog | Named loss | COPY-ASSERTED | OK as problem; no fill-rate |

### 5.2 Time / go-live

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| Afternoon setup / one afternoon to go live | aboutBody; features CTA; get-access; blog; registerSubtitle | UNSUPPORTED | Owner confirm or �guided setup� |
| Most founders finish in one afternoon. Nothing to learn | getAccess.journeySubtitle | CONTRADICTED | Remove nothing to learn; qualify most |
| Step 1 about a minute | getAccess.step1Desc | PARTIALLY VERIFIED | Account start only |
| iOS ~10 seconds | marketing.install.iosSteps | NEEDS OWNER | Typical |
| Report cards hours not a week | school-report-card-software FAQ | UNSUPPORTED | No duration |
| Attendance under two minutes | school-attendance-software FAQ | UNSUPPORTED | Drop |
| Dashboards minutes not days | modules.json analytics | PARTIALLY VERIFIED | Drop time comparison |
| Auth most schools finish in one afternoon | auth.registerSubtitle | UNSUPPORTED | Same as homepage |
| Four steps to peace of mind | getAccess.journeyTitle | UNSUPPORTED emotional | Real funnel: register ? confirm ? pending ? billing |

### 5.3 Product capabilities

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| One record fees, grades, messages | Home, features, money pages | VERIFIED architecture | Keep |
| Students, classes, admissions, staff | Home; features | VERIFIED | � |
| Live fee balances | home.adminFeature2 | PARTIALLY VERIFIED | When recorded |
| Free branded site + online admissions | Home; features; modules | PARTIALLY VERIFIED; NEEDS OWNER �free� | Included with ShuleOS after confirm |
| Events, hiring, visit booking | features schoolWebsites; modules | CONTRADICTED hiring; VERIFIED events/visits | Remove hiring |
| 3 templates | Features; modules | VERIFIED | � |
| Fees by class, term, or boarding | modules finance | PARTIALLY VERIFIED | Drop boarding |
| Automated invoices | modules finance | PARTIALLY VERIFIED | Issue from structures |
| MM-ready payment links pre-filled | modules; portals; blog | CONTRADICTED | Record / instructions |
| Parents pay exact balance via MM | home.parentFeature2 | CONTRADICTED vs parent.json | Align |
| Fee reminders WhatsApp | modules; docs; blog | PARTIALLY VERIFIED | When configured |
| Mass WhatsApp and SMS | blogs | CONTRADICTED SMS | Remove SMS |
| Payroll, expenses, budget, reports | features | VERIFIED | � |
| Library, transport, events, staff/HR | features | VERIFIED | � |
| Inventory | modules operations | UNSUPPORTED | Remove |
| Analytics dashboards | features; /analytics | VERIFIED | � |
| Branch comparison | modules; blog | CONTRADICTED (redirect) | Remove or restore |
| Heatmaps / chronic absenteeism alerts | modules analytics | UNSUPPORTED | Charts only |
| Ministry submission exports | modules analytics | PARTIALLY VERIFIED | Drop ministry |
| Medical notes | modules academic | PARTIALLY VERIFIED | Health fields |
| DRC grade levels | modules academic | PARTIALLY VERIFIED | Configurable names |
| Daily attendance bulk | modules | VERIFIED | � |
| Absence alerts | modules; blog | UNSUPPORTED | Remove or build |
| Gradebooks, exams, report cards | features; teacher | VERIFIED | � |
| Programme National mapping / official format | trustSimple; blog FAQ; money pages | PARTIALLY VERIFIED / UNSUPPORTED format | Printable cards |
| Zero math errors | trustSimpleDesc | UNSUPPORTED | Calculated in app |
| Timetable + rooms | modules | PARTIALLY VERIFIED | Owner confirm |
| Parent portal list | features | PARTIALLY VERIFIED | View assignments |
| Student homework submission | modules; features | CONTRADICTED submit | View only |
| Low-bandwidth / mobile | modules portals | PARTIALLY VERIFIED | Qualitative |
| Real-time messaging | home; modules | PARTIALLY VERIFIED | History, not guaranteed WS |
| Class/school broadcasts | modules messaging | PARTIALLY VERIFIED | In-app/WA when configured |
| Messaging integrates reminders | modules | PARTIALLY VERIFIED | Same platform |
| Encrypted transit, RBAC, audit | privacyP5 | PARTIALLY VERIFIED | No extra certs |
| Docs compliance requirements | docs/page.tsx hardcoded EN | UNSUPPORTED | Privacy only |
| Daily cash register | trustLocalDesc | PARTIALLY VERIFIED | Activity/collections |
| Tamper-proof receipts | trustLocalDesc | CONTRADICTED / UNSUPPORTED | Printable records |
| Attendance from 7:30 / without hallways | trustSupport | PARTIALLY VERIFIED | When marked |
| PWA no app store | install; pwa config | VERIFIED | � |
| Offline attendance sync | money; blog; pwa | VERIFIED | Say attendance |
| 100% offline + offline payments | trustAffordable | CONTRADICTED | Highest-priority honesty fix |
| WA+SMS delivery trails | money-page-content.ts | PARTIALLY VERIFIED | Drop SMS |
| French and English | money; blog | VERIFIED | � |
| Multi-currency CDF+USD | money; blog | CONTRADICTED | Code has no CDF |
| Fee hold system-enforced | blog | PARTIALLY VERIFIED | Don�t claim bulletin block |
| SMS campaigns unavailable | errors.smsCampaignsUnavailable | VERIFIED product block | Marketing must match |

### 5.4 AI / assistant

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| Trusted digital director / smart assistant | identity; footer; meta | UNSUPPORTED as AI | Metaphor; no accuracy claims |
| Assistant helps teachers / manages for you | get-access | UNSUPPORTED as AI | Platform records |
| Meta no technical skill / peace of mind | marketing.metaDescription | UNSUPPORTED | Softer IT-dept line |
| Agentic / School Brain | IMPLEMENTATION_PLAN.md | Future only | Never current product |
| AI Employee Service | Absent in AMS; present on apex 2026-09-20 | N/A this site | Do not import |

### 5.5 Guarantees / legal / risk

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| Zero / tamper-proof / 100% / bulletproof | Home; get-access | UNSUPPORTED / CONTRADICTED | Remove guarantees |
| Do not guarantee uninterrupted service | termsP6 | VERIFIED | **Do not delete** |
| Liability = fees prior 12 months | termsP7 | NEEDS OWNER counsel | **Do not change from audit** |
| Terminate with written notice | termsP8 | NEEDS OWNER | Keep |
| Do not sell personal data | privacyP4 | NEEDS OWNER | Policy, not certified |
| All systems operational | marketing.footer | OUTDATED / unused | Don�t show |
| Open now (office clock) | contact-page.tsx | PARTIALLY VERIFIED | Hours not SLA |
| Support docs + email vs WhatsApp first | terms vs contact | CONTRADICTED mix | Counsel align; don�t delete terms |
| Cookies policy vs no banner | legal; layout | NEEDS OWNER | |

### 5.6 Customers / social proof

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| Testimonials / logos / ROI | Marketing | VERIFIED absence | Don�t fake |
| Serving schools across the DRC | identity.origin; contact | NEEDS OWNER | Or �built for� |
| DRC and region | DRC SMS FAQ | UNSUPPORTED | Owner list |
| Every Kinshasa school (title) | blog | UNSUPPORTED as fact | Advocacy |
| Payment-justification as customer proof | Docs HTML | VERIFIED cautious / not certifying production data | Not marketing |
| Horizon Academy | seed | Demo | Never customer |
| Groupe Scolaire La Richarde | Docs; inscription | Implementation reference | Not testimonial unless authorized |
| Partners row | partners.ts empty | VERIFIED | Add only with permission |
| Kinshasa schools already pay for ShuleOS� | blog.json | UNSUPPORTED | Rhetoric |

### 5.7 Pricing, discounts, trials (do not silently drop)

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| JSON-LD price 0 USD | seo.ts | CONTRADICTED vs $350 | Owner policy; omit Offer or match approved amount; **do not invent new price** |
| Paid plans as agreed at signup | termsP5 | VERIFIED contract | Keep |
| $350 USD school plan | billing/types.ts; billing.json; README/SECURITY | VERIFIED in product | Public pages only if owner confirms |
| Billing interval | Stripe Price | NEEDS OWNER | Not in app code |
| Trialing / STRIPE_TRIAL_DAYS | billing; stripe.ts | PARTIALLY VERIFIED | Don�t market length unless agreed |
| Complimentary / Payment off | exempt paths | VERIFIED behavior | Not a public discount |
| Pricing varies by student count and modules | what-is-a-school-management-system FAQ | CONTRADICTED vs fixed 350 | Owner pick one story |
| No setup fees / no special hardware | blog FR/EN FAQ | PARTIALLY VERIFIED vs Future Ready hardware | Software onboarding copy vs bundle |
| Future Ready includes power, internet, computer, training, free site | `/` + `/offre` | NEEDS OWNER except app+site | Don�t invent package prices |
| Cursor ~200 USD/month | payment-justification | VERIFIED internal cost | **Not** a customer price |

### 5.8 Certifications, partnerships, identity

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| Our partners | marketing.partners | VERIFIED empty | Permissioned logos only |
| Crown Towers, Batetela, 15, 1502 | identity | NEEDS OWNER | Confirm |
| +243 822 378 097 / wa.me | identity | NEEDS OWNER | Confirm |
| growth@ / support@ | identity | NEEDS OWNER | � |
| Mon�Fri 8:00�18:00 WAT | identity | NEEDS OWNER staffing | Published hours |
| LinkedIn company/shuleos | identity | NEEDS OWNER | URL present |
| Product of Digni Digital LLC | footer | VERIFIED stated | � |
| Google sign-in | auth | VERIFIED feature | Not partnership |
| WhatsApp Twilio | reminders/OTP | PARTIALLY VERIFIED | No Meta/Twilio badge |
| Stripe | billing | VERIFIED code | No partnership badge |
| M-Pesa / Airtel brands | blog context | PARTIALLY VERIFIED market; UNSUPPORTED PSP | Context only |
| Headquartered Kinshasa | privacyP1 | NEEDS OWNER | Entity vs office |
| identity.website www.digni-digital-llc.com | identity.ts | CONTRADICTED vs apex offer site + HighLevel shell | Owner canonical URL |
| Apex AI Employee / Graduate / Agentic | digni-digital-llc.com 2026-09-20 | VERIFIED on **apex** | Not ShuleOS SKUs |
| Company WhatsApp +254 702 593 518 | apex footer Agent 4 | VERIFIED on apex | Different from ShuleOS +243 |

### 5.9 Comparative / SEO

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| Best SMS in Congo FAQ | DRC post | PARTIALLY VERIFIED | Not #1 ranked |
| Foreign SIS / not generic import | blogs | PARTIALLY VERIFIED | Tone down PN gap |
| WhatsApp first/fastest | contact | UNSUPPORTED fastest | Preferred |
| Root meta digital director | layout | UNSUPPORTED skill/trust | Conservative |
| Auth meta MM one record | auth | CONTRADICTED | Rewrite when copy allowed |
| Blog meta PN cards | blog.json | PARTIALLY VERIFIED | Qualify |
| JSON-LD areaServed CD; EN/FR | seo.ts | PARTIALLY VERIFIED | Target OK |
| Cheapest / best / first | � | Not used as ranked claim in Agent 4 instruction | **Never** |

### 5.10 Blog market statistics (not ShuleOS performance)

| Claim | Location | Status | Action |
| --- | --- | --- | --- |
| 66.4% Kinshasa primary private (MEPSP 2019�2020) | blog facts | NEEDS OWNER; OUTDATED risk | Keep year; not 2026 census |
| 101,000+ schools nationwide (Gov DRC 2022) | same | NEEDS OWNER | Keep year |
| 30.5% internet / 34.7M users (DataReportal Digital 2026) | same | NEEDS OWNER | Re-check before ads |
| ARPTC 2025 M-Pesa/Airtel ~USD 200M each | same | NEEDS OWNER | Keep �on the order of� |
| UNIKIN communiqu� n�002/2025 | same | NEEDS OWNER | Don�t imply ShuleOS built it |
| Two-thirds Kinshasa primary private (excerpt) | excerpt | Same as 66.4% | Rounding |

### 5.11 Extra claims from Agents 1�4, 6 (not duplicated above)

| Claim | Source agent | Status | Action |
| --- | --- | --- | --- |
| Future Ready Graduate 9 months � 3 trimesters | 4 (apex services) | VERIFIED on apex | Off this product site |
| GS Laricharde partnership in progress (graduate) | 4 | VERIFIED as **in progress** on apex | Not placement rate; not ShuleOS testimonial |
| Fremo Medical named on AI Employee page | 4 | Apex only | Don�t reuse on ShuleOS |
| Shep Engineering testimonial / Proposal Agent 90% faster | 4 apex | First-party apex | Don�t import; unaudited |
| 2026 commitment 10 jobs + 100 AI-trained (projected) | 4 about | Projected not completed | Apex mission; not ShuleOS traction |
| HBR lead-response numbers on AI Employee page | 4 | Body not recovered 2026-09-20 | Don�t rest ShuleOS claims on them |
| Docs �Read guide� ? sales URLs; hardcoded EN | 6 | Process/trust | Not a product capability claim |
| Schema Offer 0 vs funnel $350 after approval | 6 | CONTRADICTED | Honesty layer |
| �Apply before seats fill� on parent school sites | 6 | Owner-voice on parent page | Persona mix; not a capacity metric |

---

## 6. Priority (copy later � not this task)

**Contradictions first:** 100% offline + offline payments; MM checkout / links; CDF+USD; SMS; hiring; JSON-LD 0; tamper-proof; branch comparison; homework submission; student-count pricing FAQ vs $350.

**Overclaims next:** official PN; zero leaks/errors; afternoon / nothing to learn; AI assistant; ministry; heatmaps; inventory; boarding; unnamed compliance.

**Do not change from this audit:** liability cap, termination, governing law, paid-plans-as-agreed, Stripe **amount** 350.

---

## 7. Source index

Agent 5 matrix; `lib/billing/types.ts`; `lib/currency.ts`; `lib/company/seo.ts`; `lib/company/identity.ts`; `messages/*/marketing.json`; `app/parent/pay`; `lib/pwa/attendance-offline.ts`; `lib/actions/campaigns.ts`; `IMPLEMENTATION_PLAN.md`; Agents 1�4, 6 extras as cited.
