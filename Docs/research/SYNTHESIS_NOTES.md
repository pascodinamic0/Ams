# Synthesis notes � Brand intelligence (20 September 2026)

Lead synthesizer pass over Agents 1�6. No customer-facing website source was edited.

---

## Conflicts resolved (with evidence)

### 1. Three pillars vs this repo (critical)

**Conflict:** Master brief / Agent 1 starting hypothesis = Digni sells AI Employee, Future-Ready Program, Agentic Systems. Agents 1�3 (repo-only) largely **rejected** that for AMS. Agent 4 fetched **apex** `digni-digital-llc.com` and **validated** those three names there.

**Resolution:** **Two surfaces.** This AMS repo is **ShuleOS** (Kinshasa/DRC school OS; Stripe **$350 USD** per school in code; Future Ready **here** = marketing bundle app + training + power + internet + computer + free site; only app + school sites clearly in code). �AI Employee� **here** is branding (digital director / assistant), not an LLM worker. Agentic / School Brain is **roadmap**. Apex **does** market the three pillars. `www.digni-digital-llc.com` = HighLevel shell, not the offer site. Copy recommendations for **this repo** must match ShuleOS product truth and must **not** collapse the company site into this product.

### 2. Two �Future Readys�

**Conflict:** Same brand phrase, different goods.

**Resolution:** AMS `/offre` = campus **stack** for school operators. Apex `/us-en/future-ready-graduate` = **9-month talent program**. Competitive sets differ (SIS + infrastructure vs Moringa/Generation). Never treat as one SKU.

### 3. Price signals

**Conflict:** JSON-LD `price: "0"` (`lib/company/seo.ts`); terms �agreed at signup�; blog FAQ �varies by student count and modules�; in-app `SHULEOS_PLAN_AMOUNT_USD = 350`; marketing pages silent; �no setup fees.�

**Resolution:** **Product billing truth** = $350 USD recurring Stripe plan per school (interval **unknown** in app) or `billing_exempt`. JSON-LD 0 is **contradicted**, not a free-product offer. FAQ �varies by students� is **contradicted** by the fixed constant. Public marketing of $350 is an **owner decision**, not something this pass invents or publishes. Contract language �as agreed� is **kept**.

### 4. CDF + USD vs currency list

**Conflict:** Marketing/blog claim dual CDF/USD. Re-check `lib/currency.ts`: USD, EUR, GBP, GHS, NGN, KES, ZAR, CAD, AUD, INR � **no CDF**; one currency per school.

**Resolution:** Marketing claim **CONTRADICTED**. Either ship CDF (and dual-ledger if that�s the promise) or stop claiming it. Do not paper over.

### 5. Offline

**Conflict:** Homepage �100% offline� / offline payments vs PWA attendance queue and �most features need a connection.�

**Resolution:** Agent 5 **CONTRADICTED**. Approved claim = queued **attendance** only.

### 6. Mobile money checkout

**Conflict:** Homepage/modules �pay via mobile money� / payment links vs parent pay **manual instructions** and �online card payments are not enabled yet.�

**Resolution:** **CONTRADICTED** as checkout. Allowed: record MM payments; show amount + instructions.

### 7. Programme National

**Conflict:** �Maps to DRC Programme National formats� vs generic subject/marks report card; structure presets still English Nursery/Primary/Form; payment-justification notes Congolese class names not fully realized.

**Resolution:** Printable report cards **VERIFIED**; official PN format **UNSUPPORTED**. Tone down �foreign SIS fails on bulletins� until format is real.

### 8. Assistant vs AI vs Agentic

**Conflict:** Customer-facing assistant/director language vs no LLM in app vs apex AI Employee vs plan-doc School Brain.

**Resolution:** This site: metaphor for SaaS. Apex: separate AI Employee service. Plan: future. Do not sell vision as product on ShuleOS.

### 9. Hardware vs �no special hardware�

**Conflict:** `/offre` pillars 3�5 vs blog �no special hardware� vs Get Access software-only four steps vs PWA on phone.

**Resolution:** Unresolved **commercially** (owner). **In git:** software + site. Messaging should split software register vs WhatsApp quote **if** hardware is real; otherwise `/offre` overclaims.

### 10. Go-live speed vs approval

**Conflict:** �One afternoon� / �nothing to learn� vs 1�2 day review, pending lock, then billing, plus a full SIS.

**Resolution:** Funnel **EVIDENCE** (Agent 6). Afternoon is UNSUPPORTED as measured go-live; �nothing to learn� **CONTRADICTED**.

### 11. Support channels

**Conflict:** Contact WhatsApp-first vs terms docs+email.

**Resolution:** Both exist. **Counsel** to align. Do not delete liability/uptime terms. Marketing must not imply an SLA the terms disclaim.

### 12. Company domains

**Conflict:** `identity.website` = www (HighLevel, noindex). Apex Next.js has the three-pillar story. Product = shuleos.app. Apex footer WhatsApp **+254**; ShuleOS **+243**.

**Resolution:** Document all four. Owner must pick canonical parent URL. Do not tell ShuleOS visitors they are buying Kenyan AI receptionist service.

### 13. La Richarde / GS Laricharde / Horizon

**Conflict:** Named school in docs vs apex �in progress� vs demo Horizon Academy.

**Resolution:** La Richarde = implementation/collateral, **not** a testimonial. Apex Laricharde = graduate partnership in progress. Horizon = **demo**. No logos (`partners.ts` empty).

### 14. SMS, hiring, inventory, heatmaps, branch comparison, homework submit

**Conflict:** Module/blog/features copy vs code (SMS blocked; no careers route; no inventory; no heatmap/alerts; branches redirect; student assignments no submit).

**Resolution:** Agent 5 statuses stand. Restricted until built.

### 15. IMPLEMENTATION_PLAN staleness

**Conflict:** Plan still lists some WhatsApp/AI as future; WhatsApp **send** now exists; schema phase note outdated.

**Resolution:** Agent 2: treat **vision vs code** separately. WhatsApp send ? School Brain.

### 16. Cost-of-inaction vs legal/nav

**Resolution:** Workspace rule applies to marketing/onboarding/empty-state **product** copy. Not legal, errors, nav labels. Cost-of-inaction angles in `CUSTOMER_MESSAGING_GUIDE.md` **only** where existing copy already names the loss � **no invented ROI**.

---

## Remaining owner questions (priority)

1. Canonical parent domain: apex vs www vs HighLevel; fix `identity.website`.  
2. Public price policy: publish $350 (and interval), �contact Kinshasa,� or keep terms-only � and fix JSON-LD + blog FAQ to match.  
3. Is Future Ready **stack** a real delivered package, optional quote, or copy to retire? Who installs power/internet/PCs?  
4. Live schools: count, paying vs exempt, regions; what geographic sentence is true.  
5. May La Richarde / GS Laricharde be named on which site, as what (customer / partner / in progress)?  
6. Keep �digital director/assistant� or shift to ledger/OS language?  
7. Ship CDF + dual currency or drop the claim.  
8. Ship official PN bulletin + Congolese class presets or soften copy.  
9. Parent PSP (Paystack/Flutterwave/etc.) vs stay on recorded payments.  
10. Production Twilio (reminders + OTP) and Stripe trial days.  
11. LLC jurisdiction vs DRC terms / �headquartered in Kinshasa.�  
12. Re-verify blog stats (MEPSP, DataReportal, ARPTC, UNIKIN) before ads.  
13. Office 1502 / +243 WhatsApp still accurate? Counsel: WhatsApp in terms?  
14. Apex three pillars: footer link only on ShuleOS, or no mention?  
15. Whether $350 is monthly or annual (Stripe dashboard).

---

## Files written this pass

- `Docs/COMPANY_TRUTH.md`  
- `Docs/BRAND_POSITIONING.md`  
- `Docs/CLAIMS_VERIFICATION.md`  
- `Docs/CUSTOMER_MESSAGING_GUIDE.md`  
- `Docs/COMPETITIVE_INTELLIGENCE.md`  

Website pages, components, and live metadata were **not** edited.
