# Agent 6 � Website copy & conversion audit

**Product:** ShuleOS (Digni Digital LLC)  
**Scope:** Customer-facing marketing, public school sites, auth funnel, public empty/error/offline copy. No source copy was edited.  
**Voice lens:** Cost-of-inaction (specific loss ? price already paid ? small next step). Nav stays clear; legal/errors stay neutral.  
**Date:** 2026-09-20  
**Sources:** `messages/{en,fr}/marketing.json`, `messages/{en,fr}/modules.json`, `messages/{en,fr}/auth.json`, `messages/{en,fr}/blog.json`, `messages/{en,fr}/schools.json`, `lib/company/*`, `app/(company)/*`, `components/company/*`, `lib/billing/types.ts`, `app/sitemap.ts`.

---

## Executive summary

ShuleOS marketing already speaks the right language for DRC school owners: fee leaks, report-card panic, WhatsApp chaos, Kinshasa support. The conversion problem is not �more features.� It is **three colliding identities**, **unproven absolute claims**, **a funnel that hides price and approval**, and **CTAs that do not match the action they name**.

Verified product truth (from code, not invented):

| Fact | Where it lives |
|------|----------------|
| Register is real: school name + admin email ? account | `/register` |
| Schools wait for platform approval (typically 1�2 business days in copy) | `auth.reviewTimeline`, `/pending` |
| Paid access is a school plan at **$350 USD** (Stripe); trial status exists in billing types | `lib/billing/types.ts` (`SHULEOS_PLAN_AMOUNT_USD`) |
| Public school sites include homepage, admissions/enroll, events, visit booking | `app/(company)/schools/[slug]/*` |
| **No** `/schools/[slug]/careers` or hiring route exists | glob of school routes |
| Offline is **partial** (PWA + attendance sync); most features need a connection | `messages/en/pwa.json` `offlineDescription` |
| Contact is WhatsApp + email; no marketing contact form | `components/company/contact-page.tsx` |
| Partners row is empty by design | `lib/company/partners.ts` `companyPartners = []` |

Highest-impact conversion issues (ranked):

1. **Price and path are invisible** until after register/approval. Schema.org even lists `price: "0"` USD (`lib/company/seo.ts`).
2. **Absolute claims** (�Zero tuition fee leaks�, �tamper-proof�, �100% offline�, �you have nothing to learn�) outrun the product copy elsewhere.
3. **Hiring/careers** is promised on module + features + blog; it is not a live school-site surface.
4. **Desktop nav has no primary conversion CTA**; Blog, Contact, and Get access are not in the header.
5. **CTA labels mismatch destinations** (�See what it�s costing you� ? WhatsApp or `/features`; �Open admin tools� ? feature list).
6. **Future Ready** (power, internet, computer) uses the same �Secure my school� path as self-serve software signup, with no scope, price, or how-to-get-hardware.

---

## Route map (public / customer-facing)

### Marketing (company shell)

| Route | Purpose | Dedicated SEO title/desc? |
|-------|---------|---------------------------|
| `/` | Homepage | Inherits root: `ShuleOS � Your school's trusted digital director` + `marketing.metaDescription` |
| `/#about` | About section (not a page) | n/a |
| `/offre` | Future Ready offer | Yes � uses offer **headline** as `<title>` (long, claim-heavy) |
| `/features` | Module feature lists | **No** `generateMetadata` � inherits homepage title |
| `/get-access` | Conversion landing | **No** `generateMetadata` � inherits homepage title |
| `/contact` | WhatsApp / email / office | Yes |
| `/docs` | �Guides� hub | **No** metadata; body is **hardcoded English** |
| `/blog` | Guide index | Yes |
| `/blog/[slug]` | Articles + FAQ on many posts | Yes (post meta) |
| `/modules/[slug]` | 7 module pages | Title + summary; no canonical helper like money pages |
| `/school-management-system` | EN SEO money page | Yes |
| `/logiciel-de-gestion-scolaire` | FR SEO money page | Yes |
| `/privacy`, `/terms`, `/cookies` | Legal | Inherit root unless browser uses H1 |
| `/schools` | Public school directory | Inherit root |
| `/schools/templates/preview/[template]` | Template preview | Not in sitemap |

**Module slugs:** `academic`, `finance`, `operations`, `analytics`, `school-websites`, `messaging`, `parent-student-portals`.

**Sitemap includes** the above marketing paths + modules + blog. **Not in sitemap:** `/login`, `/register`, template previews, individual school slugs.

### Auth & gate (customer-facing, robots disallow many app paths)

| Route | Purpose |
|-------|---------|
| `/login` | Email / Google / WhatsApp OTP |
| `/register` | Create school account |
| `/register/complete`, `/register/success` | OAuth / email confirm |
| `/forgot-password`, `/reset-password` | Recovery (4-char PIN model) |
| `/pending` | Approval / suspended wait |
| `/billing` | Subscribe $350 / Stripe portal (after approval) |
| `/offline` | PWA offline |
| `/onboarding/*` | Post-login setup (not for anonymous visitors) |

### Per-school public sites

| Route | Purpose |
|-------|---------|
| `/schools/[slug]` | School homepage |
| `/schools/[slug]/admissions` | Admissions info |
| `/schools/[slug]/enroll` | Enrollment application form |
| `/schools/[slug]/events` | Public events |
| `/schools/[slug]/visit` | Campus visit booking |

Missing vs marketing claims: **hiring / careers listings**.

---

## CTA destination map (does the button match the flow?)

| Surface | Label (EN) | Destination | Match? |
|---------|------------|-------------|--------|
| Home hero primary | Secure my school's finances | `/get-access` | Partial � finances-specific label, generic access page |
| Home hero secondary | Chat with an advisor in Kinshasa | `wa.me/243822378097` | Yes |
| Home role cards | Open admin tools / See teacher workflow / See parent portal | `/features#academic` / `#teacher` / `#parent-portal` | Weak � list of capabilities, not tools/portal |
| Home modules | Explore | `/modules/[slug]` | Yes |
| Home all features | See all features | `/features` | Yes |
| Home Future Ready primary | Secure my school | `/get-access` | Weak � hardware+training offer, software signup path |
| Home Future Ready secondary | Chat on WhatsApp | WhatsApp | Yes |
| Desktop header | Workspace | `/login` | Yes for existing users; no acquire CTA |
| Mobile menu primary | Secure my school | `/get-access` | Yes |
| Get access primary | Secure my school | `/register` | Yes |
| Get access secondary | Already have an account | `/login` | Yes |
| Get access �joinRevolution� line | Chat with an advisor whenever you wish | **Not a link** | No |
| Features primary | Stop the leaks | `/get-access` | Yes (voice) |
| Features secondary | Login (nav key, not `ctaSecondary` �Log in�) | `/login` | Yes |
| Contact new-school primary | See what it's costing you | WhatsApp | No � sounds like a calculator/audit |
| Contact new-school secondary | Secure my school | `/get-access` | Yes |
| Money pages primary | Stop the leaks | `/get-access` | Yes |
| Money pages secondary | See what it's costing you | `/features` | No � same mismatch |
| Money EN tertiary | WhatsApp us | WhatsApp URL | Yes |
| Money FR tertiary | Nous contacter | `/contact` | Yes (inconsistent with EN) |
| Login �no account� | Get access | `/get-access` | Extra hop (could go `/register`) |
| Blog mid/end CTAs | Post-specific | `/get-access`, `/features`, `/contact` | Generally yes |
| Docs �Getting started� | Read guide | `/get-access` | No � not a guide |
| Docs �Roles� | Read guide | `/features` | No |
| Docs �Security� | Read guide | `/privacy` | Partial � policy, not a guide |
| Schema Offer | price 0 USD | SoftwareApplication JSON-LD | **False vs $350 plan** |

**Real conversion path (verified):**  
`/get-access` ? `/register` ? email confirm ? `/pending` (approval 1�2 days in copy) ? school approved ? `/billing` ($350 USD unless exempt) ? product.

Marketing never names approval or the $350 plan. That is the largest honesty gap.

---

## Global chrome

### Nav

**Works:** Short, clear labels (Home, About, Offer, Features). Workspace is clearer than �Login� for returning staff. Mobile has a full-width �Secure my school�. Language + theme stay in header.

**Unclear:** �About� is an in-page hash; �Offer� is French route `/offre` even in EN. �Workspace� vs footer/login �Login� inconsistency.

**Missing:** Desktop primary CTA. Blog, Contact, Get access. Parents/staff who land on marketing cannot find school directory except via `/schools` (footer does not even link it).

**Friction:** `/#about` marks Home as active. Mobile menu duplicates Home/About/Offer/Features but still hides Blog/Contact.

**Rewrite:** Keep nav labels dull and complete. Add one desktop pill: **Secure my school** ? `/get-access`. Optional: Contact.

### Footer

**Works:** Legal name, product-of Digni Digital, Privacy/Terms, LinkedIn.

**Missing:** Almost every label already in `marketing.footer` is unused: Features, Blog, Docs, Cookies, Get access, Login, both money pages, Contact, status line. Slim footer starves SEO and trust.

**Friction:** �All systems operational� exists as a string but is not shown � good (would be empty proof). Footer does not repeat WhatsApp.

### Brand / identity collision

Live strings name the product as:

1. **ShuleOS.app** (homepage H1)  
2. **Trusted digital director** (root title, meta)  
3. **The assistant / Your assistant** (footer keys, get-access �included�)  
4. **Future Ready** stack (offer)  
5. **School management system** (money pages / blog)

Visitors cannot tell whether they are buying software, a human director substitute, or a hardware bundle.

**DRAFT (one identity, verified):**  
> ShuleOS is school software for DRC private schools: fees, grades, attendance, and parent messages in one record � with a Kinshasa team on WhatsApp. Future Ready is the optional setup that includes training, power, connectivity, and a machine on site.

---

## Page-by-page audit

### `/` Homepage

**Works**

- Persona is explicit: school owners/managers in the DRC.
- Loss list in the typewriter is concrete (fees, report cards, attendance, disputes, notebooks, network).
- Trust tiles map to real modules (fees, Programme National, attendance, PWA).
- Role split (director / teacher / parent) matches RBAC in the app.
- WhatsApp + Kinshasa is a real differentiator (`identity.ts`).
- About body is two sentences and names the replacement (notebooks, WhatsApp, spreadsheets).
- Partners section hides when empty (does not invent logos).

**Unclear**

- H1 is the domain `ShuleOS.app` plus a rotating line � the value prop is in `heroTitleLine2`, which reads as a second headline (~25+ words; design rule asked for ? ~20 on subhead).
- `heroSubtitle` is a comma-separated problem list; on mobile it auto-plays then pays off � easy to miss if you look away.
- �No computer skills required� sits on the same page as Future Ready **Computer** and **training**.
- Admin CTA �Open admin tools� implies a demo/workspace.

**Missing**

- Price, what�s included in the $350 plan vs Future Ready, approval wait.
- Proof: named schools, quotes, screenshots of the actual UI, number of schools (correctly **not** invented � but then nothing replaces it).
- Link to `/contact` or `/blog` from the page body.
- Parent & student portals module is **hidden** from the homepage grid (`showOnHomepageGrid: false`) while role CTAs send parents to Features.

**Friction / distrust**

- **Zero tuition fee leaks** / **tamper-proof digital receipts** � absolute claims with no mechanism explained (audit log? receipt hash?).
- **Works 100% offline** vs PWA: �needs a connection for most features� and attendance syncs later. Homepage oversells.
- Duplicate role treatment (compact cards + long rows) repeats the same three CTAs into `/features#�`.
- Primary CTA promises �finances�; page then sells the whole OS.

**Should be rewritten**

- H1/subhead pair (one loss, one payoff, no domain-as-headline unless `.app` is the brand they want to own).
- Trust titles that use �zero�, �tamper-proof�, �100%�.
- Role CTAs (send to module pages or get-access, not feature hashes).
- Align �no IT / no computer skills� with Future Ready training + computer pillar.

**DRAFT hero (loss ? price ? step; no new features):**  
> **Headline:** Stop tuition disappearing between the notebook and the bank.  
> **Subhead:** Cash, Mobile Money, and parent WhatsApp threads don�t add up at closing. Put fees, grades, and attendance in one record � Kinshasa on WhatsApp when you need a human.  
> **Primary:** See how schools go live ? `/get-access`  
> **Secondary:** WhatsApp Kinshasa (keep)

---

### `/offre` Future Ready

**Works**

- Strong cost-of-inaction headline: software that dies in the first blackout.
- Six pillars match a real DRC constraint (power, network, skills, visibility).
- Proof line: Kinshasa setup + WhatsApp � matches `identity.office`.
- Full-page variant actually explains each pillar (home only shows chips).

**Unclear**

- Is Future Ready **required**, **upsell**, or **done by Digni on request**? Same CTAs as software-only get-access.
- �Full website � free� vs pillar �without paying a designer� � free with which plan?
- Training for �staff and students� � student training is a large claim.

**Missing**

- Price, what�s quoted vs included, lead time, who installs solar/internet/PCs.
- Boundary: ShuleOS app you can register for vs hardware Digni must deliver.
- What happens if they only want the app.

**Friction / distrust**

- Clicking �Secure my school� starts **self-serve register**, not a scoped Future Ready request. Feels like bait.
- No inventory of what �Electricity� means (generator? solar? UPS?).

**Should be rewritten**

- Split **software you can start this afternoon** vs **Future Ready quote via WhatsApp**.
- SEO title should not be the full scare headline; use a searchable title + keep H1.

**DRAFT split CTAs (verified paths only):**  
> Primary: Create the school account ? `/register` (or `/get-access`)  
> Secondary: WhatsApp to scope power, internet, and a machine on site

---

### `/features`

**Works**

- Honest inventory of screens that exist (fee structure, payroll, parent portal items, etc.).
- Hash IDs match homepage role links (`#academic`, `#teacher`, `#parent-portal`).
- Closing CTA uses cost-of-inaction (�Stop the leaks before next term�).

**Unclear**

- Cards are dead (no link to `/modules/[slug]`). �Teacher� and �Student portal� are roles, not module slugs.
- `ctaSecondary` string �Log in� is unused; button uses `nav.login`.
- School websites bullet lists hiring.

**Missing**

- Page metadata (Google may show the homepage title).
- Messaging module (exists at `/modules/messaging`, absent from this grid).
- Any sense of price or �included in the school plan.�

**Friction**

- Feature dump without �who loses what.� Subtitle is good; cards revert to gain-list.
- FR money-page link is EN-only (`/school-management-system`).

**Rewrite:** One-line loss under each column; link titles to module pages; drop hiring until a careers route exists.

---

### `/modules/[slug]` (product descriptions)

**Works**

- Best product copy on the site: tagline, summary, highlights, who it�s for, DRC local context (`messages/en/modules.json`).
- Finance/academic/operations voice matches cost-of-inaction.
- CTAs to get-access + features + SMS money page.
- Related blog links for SEO cluster.

**Unclear / missing**

- Homepage teaser uses short `desc`; detail page is richer � good, but homepage `desc` is vaguer (�Every student tracked��).
- School-websites summary still lists **hiring**.
- Messaging �outreach campaigns� vs `errors.smsCampaignsUnavailable` (�SMS campaigns are not available yet�).
- No screenshots, no �open in app� (correct � visitors are not logged in).
- Back link is Home, not Features.

**Friction**

- Dual source: `lib/company/modules.ts` looks stale vs i18n `getPlatformModules` (live pages use i18n � do not �fix� by inventing; flag the dead English file as drift risk).

**Rewrite first:** `school-websites` highlights to match live routes: homepage, about/programs, admissions, enroll, events, visit booking, staff login, three templates. **Do not claim careers.**

**DRAFT websites highlight (verified):**  
> Public school site with your name and colours: admissions and enrollment into the admin queue, events, campus-visit booking, and a staff login link. Three templates.

---

### `/get-access`

**Works**

- Clear next step to `/register` and `/login`.
- Cost-of-inaction hero: �Stop the leaks. One afternoon to go live.�
- Included list maps to modules without fake metrics.

**Unclear**

- Journey steps are metaphorical (�Give your legacy a shop window�) vs register�s four operational steps (stack, public site, template, teachers).
- �Most **founders** finish in one afternoon� � persona is school owners, not startup founders.
- �You have nothing to learn� contradicts Future Ready training and onboarding guides.
- `joinRevolution` key is still named for old gain-framing; the string is WhatsApp-ish but **not linked**.

**Missing**

- Approval wait, email confirm, then billing.
- Metadata.
- WhatsApp as a real button (the line says chat whenever you wish).
- What �one afternoon� includes (structure setup + website template � register brand copy) vs Future Ready hardware.

**Friction**

- Extra page between intent and `/register`. Acceptable if it sets expectations; currently it sets **false ease**.
- Auth file still has `getAccessSubtitle`: �Request access� review� 1�2 business days� � **more honest** than this page, and unused here.

**Should be rewritten** to describe the real four-step product onboarding + the human review, without calling it a revolution or promising zero learning.

**DRAFT (truthful funnel):**  
> **Title:** Stop another term on notebooks.  
> **Body:** Create the school account (name + email). You�ll confirm email, then we review the school � usually within 1�2 business days. After approval, billing unlocks the workspace.  
> **Note:** Do not invent a trial length on this page; `trialing` exists in Stripe status enums but marketing does not document a public trial offer.

---

### `/contact`

**Works**

- Best trust page: Crown Towers address, hours, open/closed in Africa/Kinshasa, split new vs existing school, WhatsApp vs `support@` vs `growth@`.
- Maps link uses formatted address.
- Legal/privacy pointer.

**Unclear**

- �See what it's costing you� on WhatsApp � user expects a diagnosis, gets a chat window with no prefilled prompt in code.
- `legalEmail` = `growth@` (same as general). Privacy policy points to `support@`. Split is confusing.

**Missing**

- Contact form (may be intentional for WhatsApp-first).
- Prefill WhatsApp text (school name / �I want to stop fee leaks�).
- Blog or docs for people who are not ready to chat.

**Friction**

- Full-viewport hero on mobile before channels.
- �Pick the leak you need to stop� is clever; some directors will not self-identify as �leaking.�

**Rewrite CTAs:** �WhatsApp Kinshasa� / �Email growth@� � never �see what it�s costing you� unless a real calculator exists (it does not).

---

### `/docs`

**Works**

- Intent: help after they care.
- Contact support block ? `/contact`.

**Unclear / missing**

- **Not documentation.** Five cards recycle marketing URLs.
- Hardcoded EN; `marketing.docs.*` translations are unused. FR visitors get English.
- No actual getting-started steps (register fields, PIN, invite, setup guide).
- No metadata.

**Friction / distrust:** �Read guide� that lands on a sales page.

**Rewrite direction:** Either ship real docs or retitle the page �Start here� and say these are product overviews, not manuals. Point Getting started at `/register` plus the pending/approval copy.

---

### `/blog` and `/blog/[slug]`

**Works**

- Strongest cost-of-inaction long-form; Kinshasa post cites MEPSP / DataReportal with sources in the strings.
- FAQs on static SEO posts + FAQ JSON-LD.
- Mid-article CTA to get-access.
- Categories, related posts, money-page cross links.

**Unclear**

- Mix of static TS posts and legacy i18n posts (`why-every-kinshasa�`, `every-way-shuleos-stops-the-leaks`).
- Blog CTAs sometimes �Stop the leaks� without restating approval/price.
- FAQs live only on articles, not on homepage/pricing (there is no pricing page).

**Missing**

- Author is Organization �ShuleOS� in JSON-LD � fine, but no named practitioner.
- Blog not in main nav � discovery depends on footer (which doesn�t link it) and internal links.

**Friction**

- Hiring claims inside blog module lists (same as websites module).
- French related link �Ecoles de Kinshasa� on the FR money page is fine if the legacy post exists (it does in `lib/company/blog.ts`).

**Do not invent new proof in rewrites;** keep sourced facts; strip unverified product bullets (careers).

---

### `/school-management-system` and `/logiciel-de-gestion-scolaire`

**Works**

- SEO intent + internal links to modules and guides.
- Headline is cost-of-inaction: the school already has a system, it costs every week.
- EN page is denser and better than FR (FR has fewer sections, missing messaging/offline blog links).

**Unclear**

- Secondary CTA �See what it�s costing you� ? `/features` (inventory, not cost).
- FR copy in `money-page-content.ts` strips accents (`ecole`, `academique`) � looks unprofessional vs `messages/fr`.
- EN subtitle �nothing loseable� is awkward English.

**Missing:** Price, local case, FAQ block (blog has FAQs; these pages don�t).

**Rewrite:** Secondary CTA ? `/contact` or WhatsApp. Fix FR typography. Don�t add fake ROI numbers.

---

### Legal `/privacy` `/terms` `/cookies`

**Works**

- Neutral voice (correct). DRC governing law, Kinshasa courts. Data ownership clause. No sale of personal data.

**Unclear / friction**

- Terms: �Paid plans, **if applicable**, billed according to the pricing agreed at signup� while code has a **fixed $350** plan � visitors never see that number on the marketing site.
- Privacy last updated **June 8, 2026** (future relative to some readers; today is 2026-09-20 so the date is in the past � OK).
- Support in terms: �documentation and email during business hours� � WhatsApp is the real channel on Contact.
- Cookies analytics �where consent or legitimate interest applies� � no cookie banner observed in company layout.
- Root metadata still the marketing tagline on legal URLs.

---

### `/schools` directory

**Works**

- Honest empty state: schools appear when they enable the public site.
- Staff login + get-access for platform seekers.

**Unclear:** Page uses marketing-dark header but is excluded from `CompanyLayoutShell` (custom chrome). No SEO description of *why* to browse.

**Missing:** Search, city filter, explanation that these are ShuleOS-hosted sites.

---

### `/schools/[slug]` and inner pages (parent-facing)

**Works**

- Nav labels are clear: Programs, About, Events, Admissions, Enroll, Book a visit, Login.
- Enrollment copy is truthful: apply online, **finish in person** with ID and reference (`schools.enrollment.*`).
- Visit empty state uses cost-of-inaction without shame.
- Apply CTAs are real routes.

**Unclear**

- Template fallbacks invent school voice: �Excellence � Integrity � Community�, �legacy of learning�� � generic, same on every empty school. Can feel fake if the school hasn�t written About.
- �Apply before seats fill� / �stop losing open seats� is school-owner voice on a **parent** page � mixed persona.
- Enroll vs Admissions vs Visit: three doors; not always obvious which is first.

**Missing vs marketing:** Hiring/careers. Messaging to the school (except phone/email if the school filled them; else �Contact details coming soon�).

**Friction**

- Staff login on a parent site is necessary but can look like the school is a SaaS demo.
- Preview templates (`/schools/templates/preview/...`) may be indexed if linked; not in sitemap (good).

**Rewrite direction:** Parent pages: one next step (Apply / Book a visit). Keep fallback About short and factual (�This school uses ShuleOS for admissions�) rather than borrowed motto � **only if** product owners agree; do not invent mottos.

---

## Auth, onboarding, empty, error, billing

### `/login` `/register`

**Works**

- Register brand side: �scattered system�, 60 seconds, 4 steps � closer to product than get-access poetry.
- Login quote is cost-of-inaction without shame.
- WhatsApp OTP copy is operationally precise (code on WhatsApp, not SMS).
- Password model explained: 4 digits or 4 letters (staff PIN) � unusual but honest on reset.

**Unclear**

- Register title �Stop the leaks� doesn�t say �create school account.�
- Placeholder �Greenfield Academy� is not DRC-flavored (minor).
- No mention that access is gated after signup.

**Friction**

- Google + email + phone methods on login; register is school-admin oriented � teachers arriving via login �Get access� go to marketing, not an invite explainer.

### `/pending`

**Works:** Timeline + �name who gets invited first� � cost of waiting without insult.

**Missing:** WhatsApp to ask about review status (only contact support on suspend). Billing not mentioned yet (correct until approved).

### `/billing` (post-approval)

**Works:** �Access is waiting on payment� / $350 from `planPrice` + `SHULEOS_PLAN_AMOUNT_USD`. Locked vs active vs exempt copy is clear. �Ask a school admin� for non-managers.

**Friction:** First time a buyer sees **price**. Marketing silence makes this feel like a bait-and-switch even if $350 is fair.

**Do not put $350 on the homepage unless leadership confirms it is the public price** � it is in code; Agent 6 reports it as verified internal truth.

### Empty states (in-app, samples)

Many already use cost-of-inaction (`teacher.noClassesAssignedYet`, finance invoice empty, visit slots). Good. Keep operational, one line. Don�t market-voice legal errors.

### Errors / 404 / offline

- 404: �Page not found� + Go home � fine, sparse (no search, no WhatsApp).
- `app/error.tsx` may **surface `error.message`** � can leak internal strings to users.
- Offline page is more honest than homepage �100% offline.�

### Onboarding (`messages/en/onboarding.json`)

Strong: skip cost, photo optional vs required inconsistency in strings (`photoRequired` vs �or skip later�) � in-product friction, not marketing. Home-screen step is excellent cost-of-inaction.

---

## Pricing

**There is no public pricing page.**

| Signal | Copy |
|--------|------|
| JSON-LD SoftwareApplication | `price: "0"` USD � **conflicts with paid plan** |
| Terms | �Paid plans, if applicable� |
| Billing UI | `$350 USD` school subscription |
| Marketing | �free school website�, Future Ready bundle unnamed |
| Features | No plan matrix |

**Trust risk:** Google and comparison shoppers may treat ShuleOS as free. Schools that register expecting free full access hit pending + paywall.

**Recommended copy direction (DRAFT, only if $350 is the sellable public price):**  
> School plan: $350 USD per school. Website included. Kinshasa WhatsApp support during business hours. Power, internet, and on-site computers are quoted separately (Future Ready).  
If $350 is not for public pages, **remove price:0 from JSON-LD** and say �Talk to Kinshasa for access� without implying free software.

---

## FAQs

| Location | Status |
|----------|--------|
| Blog posts (static SEO cluster) | Real Q&A + FAQ schema |
| Homepage / get-access / offre / contact | None |
| Product FAQ (price, offline, approval, PIN login, languages) | Missing |

**DRAFT FAQ topics (answers only from verified files):**

- **Do I get in immediately?** You create an account, confirm email, then wait for school approval (copy says typically 1�2 business days).
- **Is it free?** A branded school website is described as included. Workspace access is billed on the school subscription in-app ($350 USD in billing types). JSON-LD currently says 0 � treat as a bug, not a promise.
- **Does it work without internet?** Attendance can be recorded offline and synced; the offline page says most features need a connection.
- **Can parents apply online?** Yes, then complete enrollment in person.
- **Careers listings?** Not a public school route today.

---

## SEO titles & descriptions

| Page | Issue |
|------|--------|
| Root | Title is brand slogan, not a query (�school management DRC�). Description is �digital director / peace of mind / no technical skill� � soft vs money pages. |
| `/`, `/features`, `/get-access`, `/docs`, `/schools`, legal | Homepage title reuse |
| `/offre` | Title = scare headline; may wrap/truncate; weak for �offre ShuleOS� queries |
| `/contact` | Description is the subtitle (WhatsApp first) � OK |
| Modules | Description = long summary (good uniqueness, maybe long for SERP) |
| Money pages | Best query match |
| Default OG image | Kinshasa blog photo for pages that don�t override � OK geographically, odd on legal |
| FR/EN | Language switcher exists; money pages are separate URLs (good). Docs not translated. |

---

## Mobile readability

**Works:** Full-width CTAs, safe-area padding, typewriter/fixes at ~1.75rem, PWA install band, WhatsApp as an actual mobile behavior.

**Friction**

- Homepage is **very long** (hero 100dvh + 4 trust + 3 cards + 3 detailed rows + about + offer + modules). Role story is told twice.
- Hero H1 + typewriter + `heroTitleLine2` + subtitle = four competing messages before a button.
- Contact and home heroes are full viewport � primary action below the fold on short phones until they scroll the stacked CTAs (CTAs are in-hero, so OK if they wait for motion).
- Uppercase tracking on buttons (`11px` / `10px`) is hard to read for older directors.
- Get-access journey is 4 tall cards; fine.
- School header: tagline hidden on smallest screens; name truncates.

---

## Trust signals � inventory

| Signal | Present? | Quality |
|--------|----------|---------|
| Kinshasa address + hours | Yes | High |
| WhatsApp number | Yes | High |
| Legal entity Digni Digital LLC | Yes | High |
| LinkedIn | Yes | Medium (only social) |
| Programme National / CDF+USD | Yes | High (product-shaped) |
| Named customer logos | No (empty partners) | Correctly not faked |
| Named testimonials | No | Gap |
| Product UI screenshots | Role photos, not product | Gap |
| �All systems operational� | String only | Don�t show without status |
| Schema price 0 | Yes | **Harmful** |
| Reviews / ministry endorsement | No | Don�t invent |

---

## Voice score vs cost-of-inaction

| Surface | Score | Note |
|---------|-------|------|
| Home typewriter + about | Strong | Then diluted by �digital director / no skills� |
| Offer headline | Strong | CTA generic |
| Module i18n pages | Strong | |
| Get-access journey | Mixed | Metaphor + �nothing to learn� |
| Features cards | Weak | Feature lists |
| Contact | Strong | CTA mismatch |
| Nav | Correctly plain | Incomplete |
| Docs | Weak | Fake guides |
| Blog | Strong | Watch product-claim drift (hiring) |
| Auth pending | Strong | |
| Homepage trust tiles | Over-claim | Absolutes |

Banned-on-purpose leftovers: `joinRevolution` key; footer �Your assistant�; gain-y �peace of mind� in meta.

---

## What to rewrite first (no implementation this audit)

1. **Honesty layer:** approval + what �included� means; fix JSON-LD price; remove hiring until built; align offline language with PWA.
2. **Hero:** one H1, one subhead, finances CTA or school-wide CTA � not both stories.
3. **Get-access:** real steps + link WhatsApp; drop �founders� / �nothing to learn.�
4. **Chrome:** desktop Get access; footer links that already exist as labels.
5. **Features cards ? module routes;** metadata on `/features`, `/get-access`, `/docs`.
6. **Offre:** two products, two CTAs.
7. **Docs:** stop calling marketing pages guides.
8. **Pricing page or Contact sentence** � only with confirmed public price.

---

## Out of scope / not invented

- No booking-a-demo product (none in app). WhatsApp is the human path.
- No free trial copy (status `trialing` exists; no public trial length in marketing).
- No school count, revenue saved, or partner names.
- No careers feature copy recommended as if it shipped.

---

## Appendix � string file map

| Concern | File |
|---------|------|
| Marketing EN/FR | `messages/en/marketing.json`, `messages/fr/marketing.json` |
| Module pages | `messages/en/modules.json` (live) vs `lib/company/modules.ts` (likely unused on pages) |
| Identity / phones | `lib/company/identity.ts` |
| SEO JSON-LD | `lib/company/seo.ts` |
| Money pages | `lib/company/money-page-content.ts` |
| Auth funnel | `messages/en/auth.json` |
| School sites | `messages/en/schools.json` |
| Billing amount | `lib/billing/types.ts` |
| Blog | `content/blog/posts/*`, `messages/*/blog.json`, `lib/company/blog.ts` |
