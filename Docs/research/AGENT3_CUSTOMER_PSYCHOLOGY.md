# Agent 3 � Customer psychology & buyer clarity

**Company:** Digni Digital LLC  
**Product in copy:** ShuleOS  
**Date:** 2026-09-20  
**Scope:** Analysis of existing customer-facing copy and related docs from the *intended buyer�s* perspective.  
**This document does not rewrite website copy.**

---

## How to read this file

Every claim is tagged:

| Tag | Meaning |
|-----|---------|
| **EVIDENCE** | Directly quoted or tightly paraphrased from files in this repo. Not an interview. |
| **HYPOTHESIS** | A buyer-psychology inference. Not verified by customer interviews, NPS, or paid research in this workspace. |
| **COPY-ASSERTED (unverified as market fact)** | The site/blog *states* a market statistic or outcome. This brief treats it as *what the company currently claims*, not as independently verified research. |

**Not in this workspace:** recorded customer interviews, named testimonials, win/loss notes, or a public price on marketing pages. Do not treat invented objections as �findings.�

**Intended customer (from copy, not from interviews):** school **owners, promoters, directors, bursars/cashiers**, plus teachers and parents as *users* the buyer must satisfy. Primary geography in copy: **Kinshasa / DRC private schools**.

---

## 1. What the customer wants to achieve

### **EVIDENCE** � outcomes the copy already sells

The homepage hero frames control of money, report cards, and operations without IT skill:

> �Stop tuition fee leaks.� / �Every franc tracked. Report cards on time. Your school firmly in hand � no computer skills required.�  
> Source: `messages/en/marketing.json` (`home.heroTitleLine1`, `home.heroTitleLine2`)

French equivalent uses **minerval** (school fees), not �tuition�:

> �Arr�tez les fuites de minerval.� / �Chaque franc trac�. Vos bulletins � temps. Votre �cole tenue d'une main ferme � sans aucune comp�tence informatique.�  
> Source: `messages/fr/marketing.json`

Role-level wants stated on the homepage:

| Role in copy | Stated want | Source |
|--------------|-------------|--------|
| Directors | �run a growing school from one dashboard�; students, fees, attendance, staff, admissions in one system | `messages/en/marketing.json` `home.adminTitle`, `home.adminDescription` |
| Teachers | �capture learning once, then teach�; attendance, grades, parent messages in one workflow | `home.teacherTitle`, `home.teacherDescription` |
| Parents (end-users) | follow grades, attendance, assignments; �pay the exact balance via mobile money� without chasing the office | `home.parentTitle`, `home.parentDescription` |
| Bursars | numbers they can defend; one ledger vs Sunday reconstruction | `messages/en/blog.json` (`every-way-shuleos-stops-the-leaks`, `who` lines); `content/blog/posts/school-fee-management-software.ts` |

Product identity line:

> �ShuleOS � Your school's trusted digital director�  
> �Protect your legacy. Secure your finances.�  
> Source: `lib/company/identity.ts`

Offer page wants **tools that still work after a blackout**, not another unused license:

> �Most schools buy software that dies in the first blackout.�  
> �Future Ready is the full stack � app, training, power, internet, a machine on site, and a free school website � so the tools actually get used.�  
> Source: `messages/en/marketing.json` (`offer.title`, `offer.intro`)

Blog FAQ (copy, not independent pricing study) says the buyer wants a system staff **will use daily**, matching **currency, curriculum, language, mobile money, connectivity**:

> Source: `content/blog/posts/what-is-a-school-management-system.ts` (`faq` �best school management system�)

### **EVIDENCE** � what a real school asked the product to match (not marketing)

`Docs/ShuleOS-Payment-Justification-2026-09-16.html` is a **paiement / travaux** report for ShuleOS (repo AMS), citing paper workflows at **Groupe Scolaire La Richarde**. It is not a testimonial. It *does* show operational wants:

- Inscription fields matching a **paper fiche** (ann�e scolaire, classe d�sir�e, Nom / Post-nom / Pr�nom, lieu de naissance, �cole de provenance, parents, t�l�phone, adresse par n�/avenue/quartier/commune, sant�).
- Secretariat and **caisse** connected: fee plan at enrollment, invoice, paper receipt confirmation, then student activation.
- **Daily activity reports** for direction (recettes, t�ches, d�penses), not only monthly academic reports.
- French name order and labels (**Nom / Pr�nom / Post-nom**); checkbox �m�me adresse que le parent� (implemented as tuteur principal).
- Class capacity and **Congolese class names** (noted as not fully realized in git).

That document�s �why� lines are the closest thing in-repo to a customer�s own problem language (operational, not slogan).

### **HYPOTHESIS**

The economic buyer (promoteur / directeur) is not shopping for �modules.� They want: **fees that match reality**, **bulletins that look official**, **fewer fights at the gate**, **teachers who do not rebuild the school at night**, and **the school still running when SNEL or the r�seau drops**. Growth (�more capacity, not more chaos�) is a secondary want once the ledger is trusted.

---

## 2. What frustrates them today

### **EVIDENCE** � current-state scenes in copy

Homepage subtitle:

> �Loose logbooks, cash gaps at closing, late teachers, and disputed marks�  
> FR: �Cahiers volants, caisse qui ne boucle jamais, profs en retard et bulletins contest�s�  
> Source: `messages/en/marketing.json` / `messages/fr/marketing.json` (`home.heroSubtitle`)

�System you already have� list (`messages/en/blog.json`, post `why-every-kinshasa-school-should-run-on-shuleos`):

- Paper register rewritten when it tears or goes missing  
- Fee balances in a notebook, a spreadsheet, and someone�s memory  
- Parents asking in WhatsApp; office answering �come in and we'll check�  
- Attendance that dies when the connection dies  
- Report-card week that shuts the office down  
- Director finding out in July what broke in October  

Fee-management article:

> �Balances in three places, gate disputes, and mobile money with no receipt trail�  
> Source: `content/blog/posts/school-fee-management-software.ts` (`excerpt`)

Parent-portal article:

> �Ask a Kinshasa parent how they talk to the school. The answer is a class WhatsApp group, a director's number, and a trip to the secretariat when the chat goes silent.�  
> Source: `content/blog/posts/parent-portal-for-schools.ts` (`intro`)

Auth funnel (still customer-facing):

> �Every day off-platform: fees slip, records diverge, and someone re-types the same list.�  
> Source: `messages/en/auth.json` (`brandQuote`)

Payment-justification �why� (school-ops voice):

> �Le secr�tariat et la caisse n��taient pas reli�s. La finance ne pouvait pas v�rifier le forfait annonc� � l�inscription.�  
> Source: `Docs/ShuleOS-Payment-Justification-2026-09-16.html`

### **HYPOTHESIS**

Frustration is **loss of face and control**, not �lack of digital transformation.� �We�ll check� is humiliating for the bursar in front of a parent. Report-card week is humiliating for teachers. Double entry after a dead signal feels like the software (or lack of it) **failed the staff**, which matches the product�s hope-not-shame voice � but buyers may still fear **another tool that creates a second parallel**.

---

## 3. What they fear losing

### **EVIDENCE** � losses named in copy

| Loss | Quote / location |
|------|-------------------|
| Uncollected / disputed fees | �Stop tuition fee leaks�; �the school finances its own leaks�; �Every �we'll check� is money that should have been on the books this week.� � homepage + `messages/en/blog.json` Kinshasa post |
| Teacher pay / generator fuel | �Disputed balances and late collections are not admin annoyances � they are teacher pay and generator fuel.� � `content/blog/posts/school-management-system-drc.ts` |
| Trust with parents | �Trust erodes when fees and grades arrive late, or wrong.� � parent portal + Kinshasa post |
| Evenings / office week | �Report cards without sleepless nights�; �report-card week that shuts the office down� |
| Intake / empty seats | �Stop losing families who never find you online�; �Empty seats you will still staff� � `lib/company/modules.ts` (`school-websites`); Kinshasa post intake section |
| Legacy / reputation | Tagline �Protect your legacy�; get-access �Give your legacy a shop window� � `lib/company/identity.ts`, `marketing.getAccess.step2Title` |
| Continuity in a blackout | Offer title: software that �dies in the first blackout�; homepage �Works 100% offline� |
| Fake receipts | UNIKIN cited as fighting *faux re�us*; �Digital invoices with history reduce faux re�us� � blog (COPY-ASSERTED as market context) |
| Control of the school as it grows | �growth means more capacity, not more chaos� � homepage admin description |

Get-access journey is framed as **peace of mind**:

> �Four steps to peace of mind�  
> Source: `messages/en/marketing.json` (`getAccess.journeyTitle`)

### **HYPOTHESIS**

The deepest fear for the **promoteur** is not �missing features.� It is **running a private school on parent money without a defensible ledger** � plus **looking incompetent** at proclamation, inspection, or the gate. Secondary fear: **buying software that sits unused** (explicitly named on `/offre`). Tertiary: **data in a foreign cloud** � privacy/terms exist (`messages/en/marketing.json` `legal.*`) but marketing rarely leads with data ownership.

---

## 4. What prevents purchasing (from copy + product funnel, not interviews)

Nothing in-repo is a surveyed �top objection.� The following are **purchase-friction signals in the current journey**.

### **EVIDENCE** � information gaps on public pages

1. **No public price on marketing.** Terms say: �Paid plans, if applicable, are billed according to the pricing agreed at signup.� (`messages/en/marketing.json` `legal.termsP5`). Blog FAQ: �Pricing varies by student count and modules.� (`what-is-a-school-management-system.ts`) while in-app billing uses a **fixed $350 USD** constant (`lib/billing/types.ts` `SHULEOS_PLAN_AMOUNT_USD = 350`; `SECURITY.md`). A buyer who searches �how much� gets contradiction between FAQ and product code, and **no number on `/offre` or `/get-access`**.

2. **JSON-LD lists price `"0"` USD** for the software application (`lib/company/seo.ts` `softwareApplicationJsonLd`), which can read as �free product� vs Future Ready stack vs $350 subscription.

3. **Time-to-value vs approval.** Marketing: �most of it in an afternoon�; Kinshasa post: �No setup fees. No special hardware.� Auth: �We'll review your application�usually within 1�2 business days.� Pending: �Until you're approved, your team keeps running on manual workflows.� (`messages/en/auth.json`). Buyer can hear: **not live this afternoon**.

4. **Hardware story vs �no special hardware.�** `/offre` Future Ready includes electricity, internet, and a computer on site. Kinshasa article: �No special hardware.� PWA band: install on phone without an app store. Buyer cannot tell if they are buying **an app**, a **Kinshasa installation package**, or both.

5. **Offline claim intensity.** Homepage trust tile: �Works 100% offline� / �Fonctionne 100% sans internet.� Module and blog copy: attendance **syncs when connectivity returns**; finance still implies mobile money and WhatsApp. A technically cautious bursar may not believe �100%.�

6. **�You have nothing to learn� vs paid training.** `getAccess.journeySubtitle`: �Most founders finish in one afternoon. You have nothing to learn.� Offer pillar 2: staff and students **learn to use the tools**. Tension: is this effortless or a training project?

7. **CTA vocabulary is not one decision.** Nav �Get access� / �Secure my school�; contact �See what it's costing you�; features �Stop the leaks�; get-access �Chat with an advisor whenever you wish.� Buyer may not know whether the next step is **self-serve signup**, **WhatsApp sales**, or **an application**.

8. **Contact is easy; commercial terms are not.** Contact page: WhatsApp first, Kinshasa office, hours Mon�Fri 8:00�18:00 WAT (`lib/company/identity.ts`, `messages/en/marketing.json` `contact.*`). Missing on that page: price, contract length, who implements Future Ready power/internet, SLA, data export, trial length (`STRIPE_TRIAL_DAYS` exists in env docs, not on marketing).

### **HYPOTHESIS** (typical B2B school-software blockers � **not verified here**)

Possible blockers a Kinshasa directeur *might* raise (unverified): �Will teachers actually mark attendance?�; �What if parents won�t use a portal?�; �Who owns the data if we leave?�; �USD 350 vs cash-at-the-gate culture�; �Must I buy solar and a PC?�; �Is this only for Kinshasa?� Copy already answers some of these in blog FAQ (e.g. works outside Kinshasa � **copy claim**, not usage proof).

---

## 5. Language they would naturally understand

### **EVIDENCE** � words the French marketing already uses (closer to school speech)

- **minerval**, **caisse**, **cl�ture**, **bulletins**, **proclamation**, **pr�sences**, **cahiers**, **d�lestage**, **re�us**, **caissier**, **secr�tariat**, **promoteur**, **Programme National**, **Mobile Money**, **WhatsApp**  
  Sources: `messages/fr/marketing.json`, `messages/fr/blog.json` (same Kinshasa article).

English marketing mixes **plain operational English** (�we'll check�, �gate�, �notebooks�) with **product English** (see jargon list below).

### **EVIDENCE** � school-ops language from the La Richarde-aligned report

- fiche papier, ann�e scolaire, classe d�sir�e, post-nom, �cole de provenance, forfait de frais, re�u papier, �l�ves en attente, rapport d�activit� quotidien  
  Source: `Docs/ShuleOS-Payment-Justification-2026-09-16.html`

### **HYPOTHESIS**

For the economic buyer, **French school-admin French** (minerval, caisse, bulletin, inscription) will beat **SMS / ERP / PWA / SIS / �operating system.�** English pages are useful for SEO and bilingual staff; they are not the inner voice of most Kinshasa secretariats. Parents in copy are expected to live on **WhatsApp** and **t�l�phone**, not �parent portal� as a category name.

---

## 6. What would make the offer feel credible

### **EVIDENCE** � credibility moves already in copy

| Move | Example | File |
|------|---------|------|
| Local office | Crown Towers, Batetela, 15th floor, office 1502; phone +243 822 378 097; WhatsApp | `lib/company/identity.ts` |
| Local hours | Mon�Fri 8:00�18:00 WAT | same |
| Named curriculum | Programme National bulletins, DRC grade levels | modules, blog, homepage |
| Named money rails | CDF and USD, mobile money, WhatsApp reminders | finance module, blogs |
| Named city economics | Kinshasa as private-school city | `messages/en/blog.json` Kinshasa post |
| Cited sources on one article | MEPSP yearbook, DataReportal, ARPTC, UNIKIN communiqu� | same post `sources` |
| Legal entity | Digni Digital LLC; privacy/terms; school owns uploaded data | `marketing.legal.*` |
| Setup narrative | Four steps: school name, public site, staff, family portals | `marketing.getAccess` |
| �No invented partner stats� is a design rule | Partners row only with real logos | `.cursor/rules/marketing-monako-design.mdc` |

### **EVIDENCE** � credibility gaps (what copy does *not* show)

- No named school testimonials or case studies in marketing JSON / company pages reviewed.  
- Kinshasa post headline: �Kinshasa schools already pay for ShuleOS. They just don't have it yet.� � **rhetorical**, not a customer list.  
- Strong product adjectives without a demo artifact on the homepage strings: �Zero tuition fee leaks�, �Tamper-proof digital receipts�, �Zero math errors�, �Works 100% offline.�  
- Payment-justification doc is internally honest (partial / not realized items). That honesty is **credible to a paying client**; it is not on the public site.

### **HYPOTHESIS**

Credibility for this buyer is: **a person in Kinshasa on WhatsApp**, **a bulletin that looks like theirs**, **a fee screen in CDF/USD**, **a paper-like inscription**, **price and what�s included in Future Ready**, and **one live school they can call**. Abstract �digital director / intelligent assistant� language (`footer.taglineSuffix`, `getAccess.includedTitle`) is weaker than the Kinshasa article�s concrete scenes.

---

## 7. What they need to know before contacting the company

### **EVIDENCE** � what the site already gives before contact

- Who it�s for: school owners & managers in the DRC (`home.heroBadge`).  
- Channels: WhatsApp (fastest for directors and bursars), email, office map (`contact.*`).  
- Support hours and city (`identity.ts`, `contact.officeTitle`: �We're in Kinshasa, not another timezone.�).  
- Feature inventory (`messages/en/marketing.json` `features.*`, `lib/company/modules.ts`).  
- High-level journey (four steps) on `/get-access`.  
- Legal: privacy, terms, cookies. Terms: data ownership, governing law DRC, billing �if applicable.�  
- Blog FAQ answers (copy): works outside Kinshasa; no setup fees (French RDC post); parents don�t necessarily need an app store download.

French RDC FAQ:

> �Y a-t-il des frais d'installation ?� / �Non. L'objectif est une mise en route en une apr�s-midi : site public, r�les, portails � sans mat�riel sp�cial.�  
> Source: `content/blog/posts/systeme-de-gestion-scolaire-rdc.ts`

### **EVIDENCE** � what a careful buyer still cannot answer from marketing pages alone

- **Price** (public), billing currency, student-count vs flat $350, trial days.  
- What **Future Ready** electricity/internet/computer actually costs, who installs, and whether software is sold without that stack.  
- Whether access is **instant after register** or **gated by approval + Stripe**.  
- Offline **scope** (attendance only vs payments vs full school).  
- Implementation for **Congolese class names / paper fiche** (justification doc shows this still matters).  
- Proof: live reference school, sample bulletin, sample re�u.

Contact CTAs assume the leak is already felt:

> �Reach us before the next leak.� / �Pick the leak you need to stop.�  
> Source: `messages/en/marketing.json` `contact.heroTitleLine2`, `contact.pathsTitle`

### **HYPOTHESIS**

Before WhatsApp, a directeur wants: **price**, **what�s included vs optional**, **who trains teachers**, **what happens in a d�lestage**, **French UI**, **CDF/USD**, **who holds the data**, **how long until the caisse and bulletin are live**. The contact page currently answers **how to reach a human**, not **whether the purchase is safe**.

---

## 8. Jargon, buzzwords, abstract claims, unexplained terms

### Product / tech terms (likely unclear without a demo)

| Term | Where it appears | Buyer-clarity issue |
|------|------------------|---------------------|
| **PWA** | money pages, attendance blogs, modules | Unexplained acronym; FR money page: �PWA installable� |
| **SIS / school ERP / SMS** | `what-is-a-school-management-system.ts` | Industry English; FAQ even defines SIS vs SMS |
| **Operating system** (for a school) | `every-way-shuleos-stops-the-leaks` intro | Metaphor; can sound like IT, not caisse |
| **Digital director / assistant / smart assistant** | `identity.ts`, footer `taglineSuffix`, get-access �What the assistant manages� | Abstract personification vs a bursar tool |
| **Future Ready** | `/offre` eyebrow and training pillar | Brand name; not a school-admin phrase |
| **Full stack** | `offer.intro` | Developer metaphor |
| **Analytics / heatmaps / branch comparison** | `lib/company/modules.ts` analytics | Director may want �taux de recouvrement,� not heatmaps |
| **Role-based access / audit logging** | modules, privacy policy | Precise but IT-coded |
| **Cloud-based** | terms `termsP2` | May raise data-location fear if unexplained |
| **Subprocessors** | privacy policy | Legal, not buyer language |
| **Get access / Workspace** | nav | SaaS English vs �ouvrir un compte �cole� |
| **Templates Modern, Classic, Minimal** | school websites module | Designer English |
| **Proclamation** (EN hero list) | `home.heroFixesList` | Works in FR school calendar; English readers may miss it |

### Absolute / abstract claims (high skepticism risk)

Quoted from `messages/en/marketing.json` unless noted:

- �Zero tuition fee leaks�  
- �Tamper-proof digital receipts�  
- �Zero math errors�  
- �Works 100% offline�  
- �You have nothing to learn.� (`getAccess.journeySubtitle`)  
- �Bulletproof finances � every franc caught� (`getAccess.included3`)  
- �Kinshasa schools already pay for ShuleOS. They just don't have it yet.� (`messages/en/blog.json`)  
- SEO offer price `"0"` (`lib/company/seo.ts`) vs paid plan in `lib/billing/types.ts`

### Words that *are* concrete (keep as the buyer�s dictionary)

minerval, caisse, re�u, WhatsApp, mobile money, CDF, USD, bulletin, Programme National, d�lestage, secr�tariat, �we'll check�, gate queue, rentr�e, Kinshasa / Batetela.

---

## 9. Customer-centered messaging angles

Each angle: **problem (from copy)** ? **tangible outcome (from copy)** ? tag.

### Angle A � One ledger at the gate

- **Problem (EVIDENCE):** balances in three places; �we'll check�; Sunday reconciliation.  
- **Outcome (EVIDENCE):** bursar, director, and parent see the same balance; invoices CDF/USD; reminders before the queue.  
- **HYPOTHESIS:** Lead with **caisse / minerval**, not �finance module.�

### Angle B � Bulletins without the all-nighter

- **Problem (EVIDENCE):** grades in registers and chats; office shut for a week; parent fights.  
- **Outcome (EVIDENCE):** Programme National cards from the same gradebook; �hours not a week� (FAQ claim in report-card post � **copy, not timed study**).  
- **HYPOTHESIS:** Show a **sample bulletin**, not �academic management.�

### Angle C � WhatsApp is not the dossier

- **Problem (EVIDENCE):** unlogged chats; office as helpdesk.  
- **Outcome (EVIDENCE):** portal + logged outreach; fewer trips across Kinshasa for a balance.  
- **HYPOTHESIS:** Never insult WhatsApp; position it as **reminder channel**, portal as **source of truth**.

### Angle D � The day still counts when the r�seau dies

- **Problem (EVIDENCE):** attendance dies with the signal; double entry at night.  
- **Outcome (EVIDENCE):** mark on phone, sync later.  
- **HYPOTHESIS:** Soften �100% offline� to the attendance/payment scope that is actually described elsewhere, or buyers will test-fail the claim.

### Angle E � Software that survives d�lestage (offer)

- **Problem (EVIDENCE):** �software that dies in the first blackout.�  
- **Outcome (EVIDENCE):** Future Ready stack so tools get used.  
- **HYPOTHESIS:** Split **software-only** vs **installed stack** or the offer will block software-only buyers and confuse �no special hardware.�

### Angle F � Invisible school / lost intake

- **Problem (EVIDENCE):** families search WhatsApp and Google; paper admissions vanish.  
- **Outcome (EVIDENCE):** free branded site; admissions into admin queue.  
- **HYPOTHESIS:** Strong for directors competing in Gombe/Lemba/Ngaliema (named in copy); weaker if the buyer has no website anxiety.

### Angle G � Know in October, not July

- **Problem (EVIDENCE):** director learns damage after the term.  
- **Outcome (EVIDENCE):** mid-term collection and attendance view.  
- **HYPOTHESIS:** Speak **taux de recouvrement** and **absences**, not �analytics.�

### Angle H � Paper fiche ? caisse (operational buyer)

- **Problem (EVIDENCE):** La Richarde-style inscription vs finance disconnect (`Docs/ShuleOS-Payment-Justification-2026-09-16.html`).  
- **Outcome (EVIDENCE in product work, not homepage):** pending student, fee plan, enrollment invoice, receipt confirmation.  
- **HYPOTHESIS:** This is the **most credible** sales story for schools already in conversation � more than �digital director.�

### Angle I � Peace of mind / h�ritage (emotional)

- **EVIDENCE:** tagline, get-access �peace of mind,� �legacy,� �families at ease.�  
- **HYPOTHESIS:** Works *after* the ledger is believed. Alone, it reads as luxury brand, not caisse.

---

## 10. Copy vs copy: tensions a buyer would notice

| Tension | Side A | Side B |
|---------|--------|--------|
| Speed | �One afternoon to go live� | 1�2 day application review; pending until approved |
| Hardware | �No special hardware� | Future Ready: electricity, internet, computer |
| Effort | �You have nothing to learn� | Future Ready training for staff and students |
| Offline | �100% offline� | Sync when network returns; WhatsApp/mobile money |
| Price | Blog: varies by students/modules; JSON-LD $0 | Code: $350 USD school plan |
| Metaphor | Assistant / digital director | Record / ledger / operating system / Future Ready |

These are **evidence of inconsistent buyer instructions**, not proof of which story is �true� in production.

---

## 11. Source index (customer-facing and buyer-adjacent)

| Path | Role |
|------|------|
| `messages/en/marketing.json`, `messages/fr/marketing.json` | Homepage, offer, features, contact, get-access, legal |
| `lib/company/identity.ts` | Brand, office, contact |
| `lib/company/modules.ts` | Module promises and �who it�s for� |
| `lib/company/money-page-content.ts` | `/school-management-system`, `/logiciel-de-gestion-scolaire` |
| `messages/en/blog.json` | Kinshasa long-form + leak map |
| `content/blog/posts/*.ts` | Guides and FAQs |
| `messages/en/auth.json`, `messages/en/billing.json` | Purchase/access funnel |
| `lib/company/seo.ts` | Public structured-data price claim |
| `lib/billing/types.ts`, `SECURITY.md` | Plan amount (not on marketing pages) |
| `Docs/ShuleOS-Payment-Justification-2026-09-16.html` | Client-ops evidence (La Richarde-aligned fields), not a testimonial |

---

## 12. What this brief deliberately does not do

- Does not rewrite site copy.  
- Does not invent interviews, NPS, conversion rates, or �top 5 objections from the field.�  
- Does not treat blog statistics as verified by this agent (they are **COPY-ASSERTED** with citations *inside the blog post*).  
- Does not claim ShuleOS outcomes (zero leaks, tamper-proof receipts) as measured facts.
