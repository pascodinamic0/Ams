# AMS Version 1 – Frontend Implementation Blueprint

**Purpose:** Sequential, task-by-task plan for building the complete AMS frontend. No generator script. Each task is discrete; agents execute one after another, top to bottom.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Supabase

**Additional libraries:**
- `zod` + `react-hook-form` @ `@hookform/resolvers` – form validation
- `recharts` – charts for analytics, finance, dashboards
- `@dnd-kit/core` + `@dnd-kit/sortable` – drag-and-drop (timetable)
- `sonner` or `react-hot-toast` – toast notifications
- `react-day-picker` + `date-fns` – calendar (Events)

**Principle:** One task = one deliverable. Agents follow the list. No hallucination—everything is specified.

---

## School Public Websites (OS for Schools)

Each school gets a **public-facing mini-website** – its front door. Parents and students can discover the school, learn about it, and **apply for admissions online**. All data flows into the same AMS backend.

| Route | Purpose |
|-------|---------|
| `/schools` | Directory: list all schools with public sites, link to each |
| `/schools/[slug]` | School homepage (branded: logo, about, CTA to apply) |
| `/schools/[slug]/admissions` | Public admissions form – submits to same table as `/academic/admissions` |

**School onboarding:** When adding a new school (company/owner side), a **4-step wizard** guides setup. By the end, the school has name, domain, colors, and template – so their site and portal are ready. Focus: **simplify**, don't overwhelm.

**Website templates:** Schools choose from 3 predefined designs:
- **Modern** – Clean, bold typography, large hero
- **Classic** – Traditional, structured, serif accent
- **Minimal** – Ultra-simple, whitespace, subtle

**Integration:**
- School onboarding (4 steps) → creates school with initial config
- School config (slug, logo, domain, colors, template) → Admin Schools + Website tab
- Admissions from public form → `admission_applications` with `source: 'online'`
- Academic Admin sees them in `/academic/admissions` – approve → convert to student
- Main landing links to "Find a School" → `/schools`

**Backend (for reference):** `schools` table: `slug`, `logo_url`, `cover_image_url`, `about`, `contact_email`, `contact_phone`, `address`, `theme_primary_color`, `theme_secondary_color`, `website_template` (modern|classic|minimal), `custom_domain`, `public_site_enabled`.

---

## How to Use This Plan

1. **Execute tasks in order.** Task N may depend on outputs from tasks 1 through N-1.
2. **One agent run = one task** (or one small batch where explicitly grouped).
3. **Mark completion** as you go. Use `⬜` → `✅` in your tracking.

---

## Student ID Specification

Every student has a **school-generated unique ID** (`student_id`):

- **Format:** `{school_code}-{year}-{sequence}` (e.g. `SCH-2025-00001`)
- **Generated:** Auto on student creation (Task 4.5)
- **Visible in:** Academic Students list & detail, Student dashboard & grades, Parent dashboard & child performance, Report cards
- **Searchable:** Students list (Task 4.3), Invoices (Task 6.4) — search by student_id
- **Purpose:** Exams, forms, parent reference, fee/invoice linking

---

## Role Reference (for RBAC)

| Role | Access |
|------|--------|
| **Super Admin** | Full platform; admin routes |
| **Academic Admin** | `/academic/*` |
| **Teacher** | `/teacher/*` |
| **Finance Officer** | `/finance/*` |
| **Operations Manager** | `/operations/*` |
| **Parent** | `/parent/*` |
| **Student** | `/student/*` |
| **Analytics** | `/analytics/*` (can overlap with other roles) |

---

# TASK LIST

---

## Phase 0: Project Foundation

### Task 0.1 – Scaffold Next.js Project
- **Action:** Run `npx create-next-app@latest` in `AMS/` with: TypeScript, Tailwind, App Router, ESLint. Then install: `zod`, `react-hook-form`, `@hookform/resolvers`, `recharts`, `@dnd-kit/core`, `@dnd-kit/sortable`, `sonner` (or `react-hot-toast`), `react-day-picker`, `date-fns`.
- **Output:** `package.json`, `app/`, `components/`, `lib/`, `tailwind.config.ts`, `tsconfig.json`. All libs installed.
- **Dependencies:** None.

### Task 0.2 – Add Supabase
- **Action:** Install `@supabase/supabase-js`, `@supabase/ssr`. Create `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`.
- **Output:** Supabase client/server utilities. `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Dependencies:** 0.1.

### Task 0.3 – Root Layout & App Shell
- **Action:** Build `app/layout.tsx` (fonts, metadata). Create `components/layout/app-shell.tsx` with sidebar, header, main content area. Responsive.
- **Output:** Global layout; shell component reusable across all authenticated pages.
- **Dependencies:** 0.1.

### Task 0.4 – Auth Middleware
- **Action:** Create `middleware.ts` for Supabase auth. Protect routes by role; redirect unauthenticated users to `/login`. **Public routes (no auth):** `/`, `/features`, `/get-access`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/schools`, `/schools/*`.
- **Output:** `middleware.ts` that enforces auth and role-based access. School public sites remain public.
- **Dependencies:** 0.2.

### Task 0.5 – Error Monitoring (Sentry)
- **Action:** Install `@sentry/nextjs`. Run `npx @sentry/wizard@latest -i nextjs`. Configure `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`. Add `SENTRY_DSN` to `.env.example`. Wrap app in Sentry provider.
- **Output:** Production error monitoring. Unhandled errors reported to Sentry.
- **Dependencies:** 0.1.

---

## Phase 1: Shared Components

### Task 1.1 – Button, Input, Label, Card
- **Action:** Create `components/ui/button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`. Use Tailwind; support variants (primary, secondary, ghost, etc.).
- **Output:** Reusable form and layout primitives.
- **Dependencies:** 0.1.

### Task 1.10 – Loading Skeleton Components
- **Action:** Create `components/ui/skeleton.tsx` (Tailwind animate-pulse blocks). Create `components/ui/table-skeleton.tsx` (skeleton rows for data tables), `components/ui/card-skeleton.tsx` (for dashboard cards).
- **Output:** Reusable skeletons. Use while data loads instead of spinners for list/table pages.
- **Dependencies:** 1.1.

### Task 1.2 – Data Table Component
- **Action:** Create `components/ui/data-table.tsx` with sorting, pagination, column config. Generic over Row type. Accept `isLoading` prop: when true, render skeleton rows (use 1.10) instead of data.
- **Output:** Reusable table for list pages. Loading state via skeleton.
- **Dependencies:** 1.1, 1.10.

### Task 1.3 – Modal & Dialog
- **Action:** Create `components/ui/modal.tsx`, `dialog.tsx` (confirm/cancel). Accessible (focus trap, escape).
- **Output:** Modal and confirmation dialogs.
- **Dependencies:** 1.1.

### Task 1.4 – Form Components
- **Action:** Create `components/ui/select.tsx`, `checkbox.tsx`, `textarea.tsx`, `date-picker.tsx` (or basic date input).
- **Output:** Form primitives for all CRUD pages.
- **Dependencies:** 1.1.

### Task 1.5 – RBAC Guard Component
- **Action:** Create `components/auth/role-guard.tsx`. Wraps content; renders children only if user has required role(s); else shows "Access denied" or redirect.
- **Output:** `<RoleGuard roles={["admin"]}>...</RoleGuard>`.
- **Dependencies:** 0.2.

### Task 1.6 – Sidebar Navigation
- **Action:** Create `components/layout/sidebar.tsx`. Nav items vary by role. Highlight active route. **Responsive:** Desktop: full sidebar; tablet: collapsible (toggle to expand); mobile: bottom navigation bar with key routes (dashboard, main module). Use CSS `md:` breakpoints. Hamburger/toggle for mobile sheet.
- **Output:** Role-based sidebar with responsive collapse + mobile bottom nav.
- **Dependencies:** 0.3, 1.5.

### Task 1.7 – Breadcrumbs
- **Action:** Create `components/ui/breadcrumbs.tsx`. Dynamic from route.
- **Output:** Breadcrumb trail for deep pages.
- **Dependencies:** 1.1.

### Task 1.8 – Toast / Notification UI
- **Action:** Integrate `sonner` (or `react-hot-toast`). Add `Toaster` to root layout. Use `toast.success()`, `toast.error()`, `toast.info()` from `sonner`.
- **Output:** In-app toast notifications. Reusable across all forms/actions.
- **Dependencies:** 0.1.

### Task 1.9 – Form Validation Setup
- **Action:** Create `lib/validations/` with Zod schemas for common entities (student, guardian, invoice, etc.). Create `components/forms/form-wrapper.tsx` that wraps `react-hook-form` with `@hookform/resolvers/zod`. Support `onSubmit`, `defaultValues`, `children`.
- **Output:** Shared validation + form integration. All forms use Zod + RHF.
- **Dependencies:** 0.1, 1.1.

### Task 1.11 – Error Boundary
- **Action:** Create `components/error-boundary.tsx` (React Error Boundary). Create `app/error.tsx` for route-level errors. Create `app/global-error.tsx` for root. Show friendly message + retry option.
- **Output:** Graceful error handling. No white crash screens.
- **Dependencies:** 0.1.

### Task 1.12 – Chart Component
- **Action:** Create `components/ui/chart.tsx` wrapper around `recharts`. Support `BarChart`, `LineChart`, `PieChart`. Props: `data`, `type`, `xKey`, `yKey`, `title`. Responsive container.
- **Output:** Reusable chart for dashboards, analytics, finance reports.
- **Dependencies:** 0.1.

### Task 1.13 – File Upload Component
- **Action:** Create `components/ui/file-upload.tsx`. Upload to Supabase Storage. Props: `bucket`, `path`, `accept`, `maxSize`, `onUpload`, `onError`. Show preview for images. Support drag-and-drop zone.
- **Output:** Reusable upload for assignments, avatars, attachments.
- **Dependencies:** 0.2.

### Task 1.14 – Search Component
- **Action:** Create `components/ui/search-input.tsx`. Debounced input (300ms). Props: `placeholder`, `onSearch`, `value`. Icon (magnifying glass). Clear button. Accessible (aria-label, role search).
- **Output:** Reusable search input. Use in Students, Guardians, Library, Invoices.
- **Dependencies:** 1.1.

### Task 1.15 – Empty State Component
- **Action:** Create `components/ui/empty-state.tsx`. Props: `icon`, `title`, `description`, `action` (optional CTA). Use when list/table has no data. Friendly, actionable copy.
- **Output:** Reusable empty states for robust UX.
- **Dependencies:** 1.1.

### Task 1.16 – Design Tokens (Theme)
- **Action:** Add design tokens to `tailwind.config.ts`: primary/secondary colors, spacing scale, radius, typography (font families, sizes). CSS variables in `:root` for light/dark. Ensure consistency across all components.
- **Output:** Cohesive, modern visual system.
- **Dependencies:** 0.1.

### Task 1.17 – Password Strength Indicator
- **Action:** Create `components/ui/password-strength.tsx`. Props: `password` (string), `onStrengthChange` (optional). Display bar or segments (weak/medium/strong). Check: length, uppercase, lowercase, number, special char. Show feedback text. Use with password inputs on Register and password-reset flows.
- **Output:** Reusable password strength indicator.
- **Dependencies:** 1.1.

### Task 1.18 – Copy to Clipboard (CopyableBadge)
- **Action:** Create `components/ui/copyable-badge.tsx`. Props: `value` (string to copy), `label` (display text, e.g. student_id), `variant` (badge/button). On click: `navigator.clipboard.writeText(value)`, show toast "Copied to clipboard". Icon (copy). Use for Student ID.
- **Output:** One-click copy for Student ID and similar.
- **Dependencies:** 1.1, 1.8.

### Task 1.19 – Calendar Component
- **Action:** Create `components/ui/calendar.tsx` or use `react-day-picker` / `date-fns`. Month view: days grid, highlight events. Props: `events` (array of {date, title, type}), `onDateClick`, `onMonthChange`. Support list view toggle. Used for Events page.
- **Output:** Reusable calendar for Events, holidays.
- **Dependencies:** 0.1.

### Task 1.20 – Export to CSV Component
- **Action:** Create `lib/export-csv.ts` or `components/ui/export-button.tsx`. Props: `data` (array of objects), `columns` (key + label), `filename`. Generate CSV, trigger download. Use for students list, invoices, reports.
- **Output:** Reusable CSV export.
- **Dependencies:** 0.1.

### Task 1.21 – Onboarding Stepper / Wizard Component
- **Action:** Create `components/ui/onboarding-stepper.tsx`. Props: `steps` (array of { id, title, description }), `currentStep`, `onNext`, `onBack`, `onComplete`, `children` (step content). Progress indicator (1/4, 2/4...). Next/Back buttons. Final step: "Complete" or "Finish". Accessible, keyboard nav. Use for school onboarding.
- **Output:** Reusable multi-step wizard. Keeps process simple and guided.
- **Dependencies:** 1.1.

---

**Phase 1 execution order:** 1.1 → 1.10 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.11 → 1.12 → 1.13 → 1.14 → 1.15 → 1.16 → 1.17 → 1.18 → 1.19 → 1.20 → 1.21

---

## Phase 2: Company Front-End & Auth

*No direct login – visitors land on the company site first. Company login and school sign-up are reached via CTAs.*

### Task 2.0 – Company Site Layout & Design
- **Action:** Create `app/(company)/layout.tsx` or shared public layout. Header: logo, nav (Home, Features, Get Access, Login), "Find a School" → `/schools`. Footer: links, contact. **Modern, minimal, cool** – distinct from app shell. No sidebar. Clean typography, subtle animations. Responsive.
- **Output:** Company marketing site layout.
- **Dependencies:** 0.1.

### Task 2.1 – Company Homepage (`/`)
- **Action:** Build `app/page.tsx`. Hero: "The operating system for schools" (or similar). Brief value prop. Feature highlights (3–4 modules). **CTAs:** "See all features" → `/features`, "Get access as a school" → `/get-access`, "Login" → `/login` (for company/platform admin). "Find a school" → `/schools`. **No login form on home** – users must click through. Primary entry is the company site, not login.
- **Output:** Company homepage – first thing visitors see.
- **Dependencies:** 2.0.

### Task 2.2 – Features Page (`/features`)
- **Action:** Build `app/features/page.tsx`. **Visual outline of every functionality** in the system. Sections: **Platform Admin** (schools, branches, users, roles, audit), **Academic** (students, guardians, admissions, classes, timetable, curriculum), **Teacher** (attendance, gradebook, assignments, report cards), **Finance** (fees, invoices, payments, payroll, reports), **Operations** (library, transport, events, staff), **Parent Portal** (performance, fees, timetable, messages), **Student Portal** (assignments, grades, library), **Analytics** (dashboards, reports), **School Public Websites** (each school gets branded site + online admissions). Each section: icon, title, 4–6 feature bullets. Modern grid or alternating layout. CTAs: Get Access, Login.
- **Output:** Complete feature showcase – every module outlined.
- **Dependencies:** 2.0.

### Task 2.3 – Get Access Page (`/get-access`)
- **Action:** Build `app/get-access/page.tsx`. For schools wanting to join. Value prop, "Sign up your school." Form or link to `/register`. Clear CTA: "Get access as a school." Explain: connect domain later, onboarding wizard, ready in minutes.
- **Output:** School sign-up entry point.
- **Dependencies:** 2.0.

### Task 2.4 – Login Page (`/login`)
- **Action:** Build `app/login/page.tsx`. Email + password form. Use FormWrapper + Zod (1.9) for validation. Supabase `signInWithPassword`. On success, redirect by role. Accessible from company nav – for platform admin ("us") and school users. Link back to home. Toast on error.
- **Output:** Login page with validation.
- **Dependencies:** 0.2, 1.1, 1.9.

### Task 2.5 – Register Page (`/register`)
- **Action:** Build `app/register/page.tsx`. School onboarding form (school name, admin email, password). Use PasswordStrength (1.17). Zod (1.9) validation. Create school + first user. Supabase `signUp`. Link from Get Access. Toast success/error.
- **Output:** School registration with password strength indicator.
- **Dependencies:** 0.2, 1.1, 1.9, 1.17.

### Task 2.6 – Forgot Password Page (`/forgot-password`)
- **Action:** Build `app/forgot-password/page.tsx`. Email input → `resetPasswordForEmail`. Success message.
- **Output:** Password reset request flow.
- **Dependencies:** 0.2, 1.1.

### Task 2.7 – Reset Password Page (`/reset-password`)
- **Action:** Build `app/reset-password/page.tsx`. Handles Supabase auth callback. Form: new password, confirm. Use PasswordStrength (1.17). Zod validation. On submit: `updateUser({ password })`.
- **Output:** Set new password with strength indicator.
- **Dependencies:** 0.2, 1.1, 1.9, 1.17.

---

## Phase 3: Admin / Super Admin Pages

### Task 3.1 – Admin Layout
- **Action:** Create `app/admin/layout.tsx`. Uses app shell + admin sidebar. Wraps all `/admin/*` routes.
- **Output:** Admin layout with sidebar.
- **Dependencies:** 0.3, 1.6.

### Task 3.2 – Admin Dashboard (`/admin`)
- **Action:** Build `app/admin/page.tsx`. KPI cards: schools, users, students. Chart (1.12): BarChart for users by role, PieChart for schools by status. Loading: CardSkeleton.
- **Output:** Admin dashboard with Recharts.
- **Dependencies:** 3.1, 1.1, 1.12, 1.10.

### Task 3.3 – Schools List & CRUD (`/admin/schools`)
- **Action:** Build `app/admin/schools/page.tsx`. Data table of schools. **"Add School"** → navigates to `/admin/schools/new` (onboarding wizard). Edit, Delete for existing schools. Supabase: `schools` table.
- **Output:** Schools management page.
- **Dependencies:** 3.1, 1.2, 1.3, 1.4.

### Task 3.3b – School Onboarding Wizard (`/admin/schools/new`)
- **Action:** Build `app/admin/schools/new/page.tsx`. **4-step onboarding** using OnboardingStepper (1.21). **Step 1:** School name, admin contact email. **Step 2:** Custom domain (optional) – input for domain (e.g. `www.school.edu`); explain "We'll provide DNS instructions to connect"; store in `schools.custom_domain`. **Step 3:** Color palette – presets (e.g. Blue, Green, Navy, Burgundy) or primary + secondary color pickers; store `theme_primary_color`, `theme_secondary_color`. **Step 4:** Website template – 3 cards with preview thumbnails: **Modern**, **Classic**, **Minimal**; select one, store in `schools.website_template`. On complete: create school record, redirect to schools list. Toast "School created. Their site is ready at /schools/[slug]." **Principle: simple, guided, minimal friction** – school has a working site and portal from day one.
- **Output:** 4-step school onboarding wizard.
- **Dependencies:** 3.1, 1.4, 1.9, 1.21.

### Task 3.9 – School Website Config (`/admin/schools/[id]/website`)
- **Action:** Build `app/admin/schools/[id]/website/page.tsx`. Form: slug (editable, uniqueness check), **custom_domain** (optional), logo upload (1.13), cover_image_url, about (richtext/textarea), contact_email, contact_phone, address, **website_template** (dropdown: Modern, Classic, Minimal), theme_primary_color, theme_secondary_color (color pickers), public_site_enabled (toggle). Preview link to `/schools/[slug]`. Save to `schools` table.
- **Output:** School public website configuration (includes template selection).
- **Dependencies:** 3.1, 1.4, 1.9, 1.13.

### Task 3.4 – Branches List & CRUD (`/admin/branches`)
- **Action:** Build `app/admin/branches/page.tsx`. Data table of branches (filter by school). Create, Edit, Delete. Supabase: `branches` table.
- **Output:** Branches management page.
- **Dependencies:** 3.1, 1.2, 1.3, 1.4.

### Task 3.5 – Users List & CRUD (`/admin/users`)
- **Action:** Build `app/admin/users/page.tsx`. Data table of users. Use Search (1.14): search by name or email. Role assignment. Create, Edit, Delete. Supabase: `users` (or profiles), `roles`. EmptyState.
- **Output:** Users management with search by name/email.
- **Dependencies:** 3.1, 1.2, 1.3, 1.4, 1.14, 1.15.

### Task 3.6 – Roles & Permissions (`/admin/roles`)
- **Action:** Build `app/admin/roles/page.tsx`. List roles; configure permissions (checkboxes or matrix). Supabase: `roles`, `permissions`.
- **Output:** RBAC configuration page.
- **Dependencies:** 3.1, 1.2, 1.4.

### Task 3.7 – Audit Logs (`/admin/audit`)
- **Action:** Build `app/admin/audit/page.tsx`. Data table of audit entries (user, action, timestamp, entity). Filter by date, user. Supabase: `audit_logs`.
- **Output:** Audit trail page.
- **Dependencies:** 3.1, 1.2.

### Task 3.8 – Feature Toggles (`/admin/features`)
- **Action:** Build `app/admin/features/page.tsx`. List feature flags; toggle on/off. Supabase: `feature_toggles` or similar.
- **Output:** Platform configuration page.
- **Dependencies:** 3.1, 1.2, 1.4.

---

## Phase 3.5: School Public Websites (OS for Schools)

*Each school gets a public-facing mini-site. Admissions submitted here flow into `/academic/admissions`.*

### Task 3.10 – School Public Site Layout (`/schools/[slug]/layout.tsx`)
- **Action:** Create `app/schools/[slug]/layout.tsx`. Fetch school by slug (404 if not found or `public_site_enabled` false). **Render layout based on `school.website_template`:** create 3 layout variants – `components/schools/layout-modern.tsx`, `layout-classic.tsx`, `layout-minimal.tsx`. Each: header (logo, nav), footer (contact, login link), applies `theme_primary_color` and `theme_secondary_color` as accents. **Modern:** clean, bold, large hero area. **Classic:** traditional, serif accent, structured. **Minimal:** whitespace, subtle, no clutter. Switch component by template. Responsive.
- **Output:** Branded layout – template + school colors.
- **Dependencies:** 0.2, 1.1, 3.3, 3.9.

### Task 3.11 – School Public Homepage (`/schools/[slug]`)
- **Action:** Build `app/schools/[slug]/page.tsx`. Content varies slightly by template (Modern: large hero; Classic: structured sections; Minimal: sparse). Hero with cover image or placeholder. **About** section (from school.about). Program/curriculum highlights (optional). **Contact** section (email, phone, address). CTA: "Apply for Admissions" → `/schools/[slug]/admissions`. Nav "About" and "Contact" use anchor links (#about, #contact). Link "Staff Login" → `/login`.
- **Output:** School public homepage – template-specific styling, About, Contact, CTA.
- **Dependencies:** 3.10, 1.1.

### Task 3.12 – Public Admissions Form (`/schools/[slug]/admissions`)
- **Action:** Build `app/schools/[slug]/admissions/page.tsx`. Form: student name, DOB, gender, class/grade applying for; guardian name, email, phone, relation. Optional: FileUpload (1.13) for documents. Use FormWrapper + Zod (1.9). On submit: insert into `admission_applications` with `school_id`, `source: 'online'`, `status: 'pending'`. Success: show reference number, "We'll contact you soon." Toast success. Link back to school home.
- **Output:** Public admissions form – data flows to Academic Admin.
- **Dependencies:** 3.10, 1.4, 1.9, 1.13.

### Task 3.13 – Schools Directory (`/schools`)
- **Action:** Build `app/schools/page.tsx`. List schools where `public_site_enabled = true`. Card per school: logo, name, short excerpt (truncate about). Link to `/schools/[slug]`. Search by school name (1.14). EmptyState if none. Public – no auth required.
- **Output:** "Find a School" directory.
- **Dependencies:** 0.2, 1.1, 1.14, 1.15.

---

## Phase 4: Academic Administrator Pages

### Task 4.1 – Academic Layout
- **Action:** Create `app/academic/layout.tsx`. Uses app shell + academic sidebar.
- **Output:** Academic layout.
- **Dependencies:** 0.3, 1.6.

### Task 4.2 – Academic Dashboard (`/academic`)
- **Action:** Build `app/academic/page.tsx`. KPI cards: students, classes, attendance rate. Chart (1.12): BarChart for students by class, LineChart for attendance trend. Loading: CardSkeleton.
- **Output:** Academic dashboard with Recharts.
- **Dependencies:** 4.1, 1.1, 1.12, 1.10.

### Task 4.3 – Students List (`/academic/students`)
- **Action:** Build `app/academic/students/page.tsx`. Data table: **student_id** (first column), name, class, guardian, status. Use Search (1.14): search by name, guardian name, or **student_id** (exact or partial). Filters (class, status). **Export CSV** button (1.20): export current list/filtered results. Link to detail and new. EmptyState when no results.
- **Output:** Students list with search and CSV export.
- **Dependencies:** 4.1, 1.2, 1.14, 1.15, 1.20.

### Task 4.4 – Student Detail (`/academic/students/[id]`)
- **Action:** Build `app/academic/students/[id]/page.tsx`. **Display student_id with CopyableBadge (1.18)** – one-click copy to clipboard. Profile info, guardians, attendance summary, grades. Tabs or sections. Student ID is school-generated, unique per school; visible to student and parent in their portals.
- **Output:** Student detail with copyable Student ID.
- **Dependencies:** 4.1, 1.1, 1.7, 1.18.

### Task 4.5 – Add Student (`/academic/students/new`)
- **Action:** Build `app/academic/students/new/page.tsx`. Form: name, DOB, class, guardians, etc. **On submit: auto-generate student_id** from school (format: `{school_code}-{year}-{sequence}`, e.g. `SCH-2025-00001`). Store in `students.student_id`. Use FormWrapper + Zod (1.9). Toast success/error.
- **Output:** Add student with auto-generated Student ID.
- **Dependencies:** 4.1, 1.4, 1.9.

### Task 4.6 – Edit Student (`/academic/students/[id]/edit`)
- **Action:** Build `app/academic/students/[id]/edit/page.tsx`. Same form as new, pre-filled. Submit → update.
- **Output:** Edit student page.
- **Dependencies:** 4.4, 4.5.

### Task 4.7 – Guardians List (`/academic/guardians`)
- **Action:** Build `app/academic/guardians/page.tsx`. Data table of guardians. Use Search (1.14): search by guardian name, email, phone, or linked student name. Create, Edit, Delete. EmptyState.
- **Output:** Guardians page with search.
- **Dependencies:** 4.1, 1.2, 1.3, 1.4, 1.14, 1.15.

### Task 4.8 – Admissions (`/academic/admissions`)
- **Action:** Build `app/academic/admissions/page.tsx`. Admissions workflow: list applications from **both** manual entry and **public admissions form** (`/schools/[slug]/admissions`). Show `source` badge (online/manual). Status: pending/approved/rejected. Actions: approve, reject, **Convert to student** (creates student + guardian, sends credentials). Form to create application manually. Filter by source, status. EmptyState.
- **Output:** Admissions page – unified inbox for online + manual applications.
- **Dependencies:** 4.1, 1.2, 1.4, 1.15.

### Task 4.9 – Classes (`/academic/classes`)
- **Action:** Build `app/academic/classes/page.tsx`. Data table of classes. CRUD. Fields: name, grade, section, capacity.
- **Output:** Classes page.
- **Dependencies:** 4.1, 1.2, 1.3, 1.4.

### Task 4.10 – Sections (`/academic/sections`)
- **Action:** Build `app/academic/sections/page.tsx`. Section management. CRUD. Link sections to classes.
- **Output:** Sections page.
- **Dependencies:** 4.1, 1.2, 1.3, 1.4.

### Task 4.11 – Subjects (`/academic/subjects`)
- **Action:** Build `app/academic/subjects/page.tsx`. Subject-teacher mapping. List subjects; assign teachers. CRUD.
- **Output:** Subjects page.
- **Dependencies:** 4.1, 1.2, 1.3, 1.4.

### Task 4.12 – Timetable (`/academic/timetable`)
- **Action:** Build `app/academic/timetable/page.tsx`. Grid: periods (rows) × days (columns). Each cell = slot. Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop: drag subject/teacher cards from a palette into slots. Click slot to open modal for click-to-edit fallback. Persist to Supabase `timetable_slots` (class_id, day, period, subject_id, teacher_id). Conflict detection: warn if same teacher or class double-booked. Responsive: horizontal scroll on small screens.
- **Output:** Production-grade timetable builder with DnD.
- **Dependencies:** 4.1, 1.1, 1.3, 1.4.

### Task 4.13 – Curriculum (`/academic/curriculum`)
- **Action:** Build `app/academic/curriculum/page.tsx`. Curriculum setup: grade, subject, syllabus. CRUD.
- **Output:** Curriculum page.
- **Dependencies:** 4.1, 1.2, 1.3, 1.4.

### Task 4.14 – Bulk Student Import (`/academic/students/import`)
- **Action:** Build `app/academic/students/import/page.tsx`. CSV upload (FileUpload 1.13). Template download (sample CSV with columns: name, dob, class, guardian_email, etc.). Parse CSV, validate rows (Zod), show preview table. Confirm → bulk insert. Report: success count, errors per row. EmptyState with "Download template" CTA.
- **Output:** Bulk student import via CSV.
- **Dependencies:** 4.1, 1.4, 1.9, 1.13, 1.15.

---

## Phase 5: Teacher Pages

### Task 5.1 – Teacher Layout
- **Action:** Create `app/teacher/layout.tsx`. Uses app shell + teacher sidebar.
- **Output:** Teacher layout.
- **Dependencies:** 0.3, 1.6.

### Task 5.2 – Teacher Dashboard (`/teacher`)
- **Action:** Build `app/teacher/page.tsx`. My classes, quick actions (take attendance, enter grades). Optional: Chart (1.12) for assignment completion by class. CardSkeleton for loading.
- **Output:** Teacher dashboard.
- **Dependencies:** 5.1, 1.1, 1.12, 1.10.

### Task 5.3 – My Classes (`/teacher/classes`)
- **Action:** Build `app/teacher/classes/page.tsx`. List classes assigned to logged-in teacher. Link to timetable, attendance, gradebook per class.
- **Output:** My classes page.
- **Dependencies:** 5.1, 1.2.

### Task 5.4 – Attendance (`/teacher/attendance`)
- **Action:** Build `app/teacher/attendance/page.tsx`. Select date, class. Mark present/absent per student. **Bulk actions:** "Mark all present", "Mark all absent" (with confirm). Save. Period-wise optional.
- **Output:** Attendance entry with bulk mark all.
- **Dependencies:** 5.1, 1.2, 1.4.

### Task 5.5 – Gradebook (`/teacher/gradebook`)
- **Action:** Build `app/teacher/gradebook/page.tsx`. Select class, subject, exam. Grid: students × marks. Enter/edit grades. Save.
- **Output:** Gradebook page.
- **Dependencies:** 5.1, 1.2, 1.4.

### Task 5.6 – Assignments (`/teacher/assignments`)
- **Action:** Build `app/teacher/assignments/page.tsx`. List assignments with status. Create (title, description, due date, class, optional file attachment via 1.13). Edit, Delete. Assign to classes. Student submissions: use `FileUpload` (1.13) to Supabase Storage bucket `assignments`; store file path in `assignment_submissions`. Grade submissions (marks, feedback). Show submission count, graded count.
- **Output:** Assignments page with file upload support.
- **Dependencies:** 5.1, 1.2, 1.3, 1.4, 1.13.

### Task 5.7 – Exams (`/teacher/exams`)
- **Action:** Build `app/teacher/exams/page.tsx`. Exam setup (name, date, class, subject). Marks entry link.
- **Output:** Exams page.
- **Dependencies:** 5.1, 1.2, 1.3, 1.4.

### Task 5.8 – Report Cards (`/teacher/report-cards`)
- **Action:** Build `app/teacher/report-cards/page.tsx`. Select class, term. Generate report cards. Layout: print-ready (CSS `@media print`). Include school header, **student_id**, student name, photo placeholder, grades table, attendance %, conduct/remarks. "Print" button triggers `window.print()`. Page break between students. Clean margins, no nav/sidebar in print view (hide via print CSS). View in browser first, then print.
- **Output:** Print-ready report cards with Student ID.
- **Dependencies:** 5.1, 1.2, 1.4.

### Task 5.9 – Teacher Messages (`/teacher/messages`)
- **Action:** Build `app/teacher/messages/page.tsx`. Two-panel layout: conversation list (left) + thread (right). Inbox/sent tabs. Compose: select recipient (student/parent), subject, body. Use Supabase Realtime: subscribe to `messages` table filtered by `recipient_id = user.id OR sender_id = user.id` for live updates. Read state: `is_read` boolean; mark read when thread opened. Store in `messages` (sender_id, recipient_id, subject, body, created_at, is_read).
- **Output:** Messaging with Realtime, read states, threads.
- **Dependencies:** 5.1, 1.2, 1.4, 0.2.

---

## Phase 6: Finance Officer Pages

### Task 6.1 – Finance Layout
- **Action:** Create `app/finance/layout.tsx`. Uses app shell + finance sidebar.
- **Output:** Finance layout.
- **Dependencies:** 0.3, 1.6.

### Task 6.2 – Finance Dashboard (`/finance`)
- **Action:** Build `app/finance/page.tsx`. KPI cards: total revenue, pending fees, expenses this month. Use Chart component (1.12): BarChart for revenue vs expenses (last 6 months), PieChart for fee status breakdown (paid/pending/overdue). Loading: CardSkeleton.
- **Output:** Finance dashboard with Recharts.
- **Dependencies:** 6.1, 1.1, 1.12, 1.10.

### Task 6.3 – Fee Structure (`/finance/fee-structure`)
- **Action:** Build `app/finance/fee-structure/page.tsx`. Fee types, installments. CRUD. Define structure per class/grade.
- **Output:** Fee structure page.
- **Dependencies:** 6.1, 1.2, 1.3, 1.4.

### Task 6.4 – Invoices (`/finance/invoices`)
- **Action:** Build `app/finance/invoices/page.tsx`. List invoices. Use Search (1.14): search by invoice number, student name, or student_id. Create, send. **Per invoice: "Print" action** – opens print-ready view (school header, invoice details, line items, total, student_id; `@media print` hides nav/sidebar; `window.print()`). **Export CSV** button (1.20) for invoice list. Status (draft, sent, paid). Filter by status. EmptyState.
- **Output:** Invoices with search, print invoice, and CSV export.
- **Dependencies:** 6.1, 1.2, 1.3, 1.4, 1.14, 1.15, 1.20.

### Task 6.5 – Payments (`/finance/payments`)
- **Action:** Build `app/finance/payments/page.tsx`. Record payments. Link to invoice. Payment method, amount, date.
- **Output:** Payments page.
- **Dependencies:** 6.1, 1.2, 1.3, 1.4.

### Task 6.6 – Payroll (`/finance/payroll`)
- **Action:** Build `app/finance/payroll/page.tsx`. Staff salaries, payslips. List, generate, mark paid.
- **Output:** Payroll page.
- **Dependencies:** 6.1, 1.2, 1.3, 1.4.

### Task 6.7 – Expenses (`/finance/expenses`)
- **Action:** Build `app/finance/expenses/page.tsx`. Expense tracking. Create, list, filter. Categories.
- **Output:** Expenses page.
- **Dependencies:** 6.1, 1.2, 1.3, 1.4.

### Task 6.8 – Financial Reports (`/finance/reports`)
- **Action:** Build `app/finance/reports/page.tsx`. Date range filter. Use Chart (1.12): LineChart for revenue & expenses over time, BarChart for fee collection by class/installment. Data table for detailed breakdown. **Export CSV** button (1.20) for report data.
- **Output:** Financial reports with Recharts and CSV export.
- **Dependencies:** 6.1, 1.2, 1.12, 1.20.

### Task 6.9 – Bulk Invoice Generation (`/finance/invoices/bulk`)
- **Action:** Build `app/finance/invoices/bulk/page.tsx`. Select class or multiple students. Select fee structure, due date. Preview: list of invoices to be created. Confirm → bulk create invoices. Report: count created, any errors.
- **Output:** Bulk invoice generation.
- **Dependencies:** 6.1, 1.2, 1.3, 1.4, 1.15.

---

## Phase 7: Operations Manager Pages

### Task 7.1 – Operations Layout
- **Action:** Create `app/operations/layout.tsx`. Uses app shell + operations sidebar.
- **Output:** Operations layout.
- **Dependencies:** 0.3, 1.6.

### Task 7.2 – Operations Dashboard (`/operations`)
- **Action:** Build `app/operations/page.tsx`. KPI cards: books issued, routes active, upcoming events. Chart (1.12): BarChart for library activity. CardSkeleton for loading.
- **Output:** Operations dashboard with Recharts.
- **Dependencies:** 7.1, 1.1, 1.12, 1.10.

### Task 7.3 – Library (`/operations/library`)
- **Action:** Build `app/operations/library/page.tsx`. Catalog: books. Use Search (1.14): search by book title, author, ISBN. Issue, return. List issued items. EmptyState.
- **Output:** Library page with search.
- **Dependencies:** 7.1, 1.2, 1.3, 1.4, 1.14, 1.15.

### Task 7.4 – Transport (`/operations/transport`)
- **Action:** Build `app/operations/transport/page.tsx`. Routes, buses. Map students to routes. CRUD routes and vehicles.
- **Output:** Transport page.
- **Dependencies:** 7.1, 1.2, 1.3, 1.4.

### Task 7.5 – Events (`/operations/events`)
- **Action:** Build `app/operations/events/page.tsx`. Use **Calendar component (1.19)** for month view – events on dates, click date to add/edit. Toggle to list view. CRUD events and holidays. Events show on calendar with type (event/holiday) styling.
- **Output:** Events page with calendar view.
- **Dependencies:** 7.1, 1.2, 1.3, 1.4, 1.19.

### Task 7.6 – Staff / HR (`/operations/staff`)
- **Action:** Build `app/operations/staff/page.tsx`. Staff management. List, create, edit. Link to teachers, payroll.
- **Output:** Staff page.
- **Dependencies:** 7.1, 1.2, 1.3, 1.4.

---

## Phase 8: Parent Portal Pages

### Task 8.1 – Parent Layout
- **Action:** Create `app/parent/layout.tsx`. Uses app shell + parent sidebar.
- **Output:** Parent layout.
- **Dependencies:** 0.3, 1.6.

### Task 8.2 – Parent Dashboard (`/parent`)
- **Action:** Build `app/parent/page.tsx`. Child overview: list linked children. **Show student_id with CopyableBadge (1.18)** per child – one-click copy. Quick links to performance, fees, timetable.
- **Output:** Parent dashboard with copyable Student ID per child.
- **Dependencies:** 8.1, 1.1, 1.18.

### Task 8.3 – Child Performance (`/parent/performance/[studentId]`)
- **Action:** Build `app/parent/performance/[studentId]/page.tsx`. **Display student_id with CopyableBadge (1.18)** in header/summary. Grades, attendance for selected child.
- **Output:** Child performance with copyable Student ID.
- **Dependencies:** 8.1, 1.1, 1.7, 1.18.

### Task 8.4 – Fee & Payments (`/parent/fees`)
- **Action:** Build `app/parent/fees/page.tsx`. List invoices for linked children. **"Pay" button** per invoice → links to `/parent/pay?invoice_id=[id]` (or similar). Payment page reads `invoice_id` from URL, fetches amount due, shows pay form/placeholder. Structure supports future **smart payment links** (WhatsApp/email/SMS) – pre-informed URL with exact amount. Status.
- **Output:** Parent fees page.
- **Dependencies:** 8.1, 1.2.

### Task 8.5 – Parent Timetable (`/parent/timetable`)
- **Action:** Build `app/parent/timetable/page.tsx`. View child's timetable (read-only).
- **Output:** Parent timetable page.
- **Dependencies:** 8.1, 1.1.

### Task 8.6 – Parent Assignments (`/parent/assignments`)
- **Action:** Build `app/parent/assignments/page.tsx`. View assignments for linked children (read-only).
- **Output:** Parent assignments page.
- **Dependencies:** 8.1, 1.2.

### Task 8.7 – Parent Messages (`/parent/messages`)
- **Action:** Build `app/parent/messages/page.tsx`. Same messaging UX as 5.9: two-panel, inbox/sent, Supabase Realtime for live updates, read states. Parent can message teachers re: linked children.
- **Output:** Parent messaging with Realtime.
- **Dependencies:** 8.1, 1.2, 1.4, 0.2.

### Task 8.8 – Events & Holidays (`/parent/events`)
- **Action:** Build `app/parent/events/page.tsx`. School calendar (read-only).
- **Output:** Parent events page.
- **Dependencies:** 8.1, 1.2.

### Task 8.9 – Parent Transport (`/parent/transport`)
- **Action:** Build `app/parent/transport/page.tsx`. Transport details for linked children (route, bus, pickup/drop).
- **Output:** Parent transport page.
- **Dependencies:** 8.1, 1.1.

---

## Phase 9: Student Portal Pages

### Task 9.1 – Student Layout
- **Action:** Create `app/student/layout.tsx`. Uses app shell + student sidebar.
- **Output:** Student layout.
- **Dependencies:** 0.3, 1.6.

### Task 9.2 – Student Dashboard (`/student`)
- **Action:** Build `app/student/page.tsx`. **Display student_id with CopyableBadge (1.18)** in header or card – one-click copy. Timetable preview, assignments due. Quick links.
- **Output:** Student dashboard with copyable Student ID.
- **Dependencies:** 9.1, 1.1, 1.18.

### Task 9.3 – Student Timetable (`/student/timetable`)
- **Action:** Build `app/student/timetable/page.tsx`. Class timetable (read-only).
- **Output:** Student timetable page.
- **Dependencies:** 9.1, 1.1.

### Task 9.4 – Student Assignments (`/student/assignments`)
- **Action:** Build `app/student/assignments/page.tsx`. List assignments for student's class. View detail (title, description, due date). Submit: use FileUpload (1.13) for file submissions to Supabase Storage `assignments`; optionally text response in textarea. Store in `assignment_submissions`. Show submission status (submitted, graded).
- **Output:** Student assignments with file upload.
- **Dependencies:** 9.1, 1.2, 1.4, 1.13.

### Task 9.5 – Student Grades (`/student/grades`)
- **Action:** Build `app/student/grades/page.tsx`. Display **student_id with CopyableBadge (1.18)** in header. Marks, report card (read-only).
- **Output:** Student grades with copyable Student ID.
- **Dependencies:** 9.1, 1.2, 1.18.

### Task 9.6 – Student Library (`/student/library`)
- **Action:** Build `app/student/library/page.tsx`. Browse catalog. Request/borrow (or view issued).
- **Output:** Student library page.
- **Dependencies:** 9.1, 1.2.

### Task 9.7 – Student Messages (`/student/messages`)
- **Action:** Build `app/student/messages/page.tsx`. Same messaging UX as 5.9: two-panel, Supabase Realtime, read states. Student can message teachers.
- **Output:** Student messaging with Realtime.
- **Dependencies:** 9.1, 1.2, 1.4, 0.2.

### Task 9.8 – Student Events (`/student/events`)
- **Action:** Build `app/student/events/page.tsx`. Events, holidays (read-only).
- **Output:** Student events page.
- **Dependencies:** 9.1, 1.2.

---

## Phase 10: Analytics & Reporting Pages

### Task 10.1 – Analytics Layout
- **Action:** Create `app/analytics/layout.tsx`. Uses app shell + analytics sidebar.
- **Output:** Analytics layout.
- **Dependencies:** 0.3, 1.6.

### Task 10.2 – Analytics Dashboard (`/analytics`)
- **Action:** Build `app/analytics/page.tsx`. KPI cards (students, attendance %, revenue). Use Chart (1.12): BarChart for enrollment by class, LineChart for attendance trend (4 weeks), PieChart for gender/grade distribution. Loading: CardSkeleton.
- **Output:** Analytics dashboard with Recharts.
- **Dependencies:** 10.1, 1.1, 1.12, 1.10.

### Task 10.3 – Branch Performance (`/analytics/branches`)
- **Action:** Build `app/analytics/branches/page.tsx`. Data table: branch name, students, attendance %, revenue. Chart (1.12): BarChart comparing branches (students, revenue). Filter by date range.
- **Output:** Branch analytics with Recharts.
- **Dependencies:** 10.1, 1.2, 1.12.

### Task 10.4 – Student Analytics (`/analytics/students`)
- **Action:** Build `app/analytics/students/page.tsx`. Filter by class, term. Chart (1.12): LineChart for grade trends, BarChart for subject-wise performance. Table: top/bottom performers. Cohort: pass/fail rate by class.
- **Output:** Student analytics with Recharts.
- **Dependencies:** 10.1, 1.2, 1.12.

### Task 10.5 – Attendance Reports (`/analytics/attendance`)
- **Action:** Build `app/analytics/attendance/page.tsx`. Date range, filter by class. Chart (1.12): LineChart for daily attendance %, BarChart for class-wise comparison. Table: students with low attendance (e.g. below 80%).
- **Output:** Attendance analytics with Recharts.
- **Dependencies:** 10.1, 1.2, 1.12.

### Task 10.6 – Financial Reports (Analytics) (`/analytics/finance`)
- **Action:** Build `app/analytics/finance/page.tsx`. Same data as 6.8; analytics view. Charts: revenue vs expenses, fee collection trends. **Export CSV** button (1.20).
- **Output:** Analytics finance with Recharts and CSV export.
- **Dependencies:** 10.1, 1.2, 1.12, 1.20.

---

## Phase 11: Shared / System Pages

### Task 11.1 – Notifications (`/notifications`)
- **Action:** Build `app/notifications/page.tsx`. List notifications (title, body, created_at, is_read). Mark read on click. Use Supabase Realtime: subscribe to `notifications` where `user_id = currentUser.id` for live delivery. Badge in header/sidebar for unread count.
- **Output:** Notifications with Realtime.
- **Dependencies:** 0.3, 1.8, 0.2.

### Task 11.2 – Profile / Settings (`/settings`)
- **Action:** Build `app/settings/page.tsx`. Form: name, email (read-only or link to Supabase email change). Avatar: use FileUpload (1.13) to Supabase Storage bucket `avatars`, path `{user_id}/avatar.{ext}`. Update `profiles.avatar_url`. Preferences: theme (light/dark), notifications on/off. Zod + RHF (1.9) for validation.
- **Output:** Settings with avatar upload.
- **Dependencies:** 0.3, 1.4, 1.9, 1.13.

### Task 11.3 – 404 Page
- **Action:** Build `app/not-found.tsx`. Custom 404 with link back home.
- **Output:** Not found page.
- **Dependencies:** 0.1.

### Task 11.4 – Keyboard Shortcuts
- **Action:** Create `components/keyboard-shortcuts.tsx`. Global shortcut provider (e.g. `useEffect` + `keydown`). Shortcuts: `G` then `D` → Dashboard, `G` then `S` → Students (academic), `G` then `I` → Invoices (finance), `?` → show shortcuts modal. Add to app shell. Document in a "Keyboard shortcuts" link in footer or help.
- **Output:** Power-user keyboard navigation.
- **Dependencies:** 0.3, 1.3.

### Task 11.5 – First-Time Onboarding (Empty States)
- **Action:** Audit all list/dashboard pages. Ensure EmptyState (1.15) is used with contextual CTAs: "Add your first student", "Create your first class", "Create fee structure", etc. Add optional "Getting started" checklist for new schools on admin/academic dashboard (dismissible).
- **Output:** Robust empty states and onboarding.
- **Dependencies:** 1.15. (Integrate into existing pages; can be done as final UX pass.)

---

## Phase 12: Production Verification & Testing

### Task 12.1 – Production Verification Run
- **Action:** **Execute after all tasks 0.1–11.5 are complete.** Agent performs full verification: (1) Visit every route in the plan; (2) Verify each page renders without crash; (3) Test critical flows: login, register (password strength), reset password, add student (student_id generated), **copy Student ID button**, search student/users by name/ID, bulk import preview, attendance bulk mark, bulk invoice preview; (4) **Company front-end:** Home, Features (visual outline of all modules), Get Access; no direct login;
(5) **School public websites:** 4-step onboarding wizard, `/schools` directory, `/schools/[slug]` homepage (test template switching), `/schools/[slug]/admissions` form – submit test application, verify in `/academic/admissions` with source "online"; (5) **Export CSV**, **Print invoice**, **Calendar**; (6) Responsive, empty states, error boundary; (7) Charts, file upload, report card print. Document any broken routes. Fix critical issues before marking complete.
- **Output:** Verification report. All pages and flows confirmed working.
- **Dependencies:** All tasks 0.1–11.5.
- **Note:** This is the final QA pass. One agent run to inspect everything created.

---

# TASK SUMMARY

| Phase | Tasks | Page Count |
|-------|-------|------------|
| 0 – Foundation | 5 | 0 |
| 1 – Shared Components | 21 | 0 |
| 2 – Company & Auth | 8 | 6 |
| 3 – Admin | 14 | 9 |
| 3.5 – School Public Sites | 4 | 4 |
| 4 – Academic | 14 | 12 |
| 5 – Teacher | 9 | 8 |
| 6 – Finance | 9 | 8 |
| 7 – Operations | 6 | 5 |
| 8 – Parent | 9 | 8 |
| 9 – Student | 8 | 7 |
| 10 – Analytics | 6 | 5 |
| 11 – Shared/System | 5 | 3 |
| 12 – Verification | 1 | 0 |
| **Total** | **117 tasks** | **~76 pages** |

---

# DEPENDENCY FLOW

```
0.1 → 0.2 → 0.3 → 0.4 → 0.5
0.1 → 1.1 → 1.10 → 1.2
0.1 → 1.3, 1.4, 1.8, 1.9, 1.11, 1.12, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21
0.2 → 1.5, 1.13
0.3 → 1.6, 1.7
0.3, 1.6 → all layout tasks (3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1)
2.0 → 2.1, 2.2, 2.3 (Company site); 2.4, 2.5, 2.6, 2.7 (Auth)
3.3 → 3.3b (onboarding) → 3.9 → 3.10 → 3.11, 3.12, 3.13 (School public websites)
Each layout → its module pages (deps: 1.2, 1.3, 1.4, 1.9, 1.10, 1.12, 1.13, 1.14, 1.15, 1.17–1.21 as needed)
12.1 → all tasks 0.1–11.5
```

---

# PRODUCTION-GRADE SPECS (Summary)

| Concern | Approach |
|---------|----------|
| **Form validation** | Zod + react-hook-form (Task 1.9). All forms use it. |
| **Loading states** | Skeleton components (1.10). Data table + dashboards use them. |
| **Errors** | Error boundary (1.11), `app/error.tsx`, `app/global-error.tsx`. Sentry (0.5) for production. |
| **Charts** | Recharts via `Chart` component (1.12). Dashboards, analytics, finance. |
| **File uploads** | Supabase Storage + `FileUpload` (1.13). Assignments, avatars. |
| **Timetable DnD** | `@dnd-kit/core` + `@dnd-kit/sortable`. Conflict detection. |
| **Messaging** | Supabase Realtime on `messages`. Read states, two-panel UI. |
| **Notifications** | Supabase Realtime on `notifications`. Unread badge. |
| **Report cards** | Print-ready CSS (`@media print`), `window.print()`. |
| **Toasts** | Sonner. Success/error feedback on all mutations. |
| **Student ID** | Auto-generated on add (school_code-year-sequence). Visible: dashboard, detail, parent portal, report card. Searchable. |
| **Search** | Search component (1.14). Students, Guardians, Library, Invoices, **Users (name, email)**. |
| **Bulk operations** | CSV import students (4.14). Bulk mark attendance (5.4). Bulk invoice (6.9). |
| **Export CSV** | Export button (1.20). Students list, Invoices, Financial reports, Analytics finance. |
| **Print invoice** | Per-invoice print view (school header, line items, total). `@media print`, `window.print()`. |
| **Calendar** | Calendar component (1.19) for Events – month view, events on dates, list toggle. |
| **Password strength** | Component (1.17). Register, Reset password. |
| **Copy Student ID** | CopyableBadge (1.18). Student detail, Parent dashboard/child perf, Student dashboard/grades. |
| **Responsive** | Sidebar collapse on tablet, bottom nav on mobile (1.6). |
| **UX** | Empty states (1.15), design tokens (1.16), keyboard shortcuts (11.4), onboarding (11.5). |
| **Company front-end** | Home, Features (visual outline of all modules), Get Access. No direct login – visitors land on company site first. Modern, minimal. |
| **School public websites** | Each school: `/schools/[slug]` homepage, `/schools/[slug]/admissions`. **3 templates:** Modern, Classic, Minimal. **4-step onboarding** when adding school (name, domain, colors, template). Config in Admin. Admissions flow to `/academic/admissions`. |

---

# AGENT INSTRUCTIONS

When executing a task:

1. **Read the task** – Title, route, dependencies.
2. **Verify dependencies** – Ensure prerequisite files exist.
3. **Build exactly** – Implement what is specified. No extra features unless trivial.
4. **Use existing components** – Reuse UI from Phase 1 (Chart, FileUpload, FormWrapper, Skeleton, Search, EmptyState, etc.).
5. **Follow Supabase patterns** – Server components where appropriate; client for forms, Realtime, interactivity.
6. **Mark the task** – Update this doc or your tracking when done.
7. **Task 12.1 (Production Verification)** – Run only after all other tasks are complete. Visit every route, test critical flows, document issues. Fix critical bugs before concluding.

No generator script. No single massive prompt. One task at a time, in order.

---

# FUTURE: AI & SMART PAYMENTS ROADMAP

*This section documents the long-term vision. The current build is structured so these features can be added without rework.*

## Philosophy: AI-First, Not Static

AMS is built to **evolve with AI** – an **AI companion / agentic system**, not a static tool. AI should:
- Have access to **all information** in the system (students, attendance, fees, grades, etc.)
- Guide, advise, and answer questions across every module
- Support natural-language queries instead of requiring dashboard navigation

---

## 1. School Brain – Chat Interface for Admins / Principals

**One chat interface** (ChatGPT-style) where the principal or super admin can ask the "brain of the school":

| User asks | AI returns |
|-----------|------------|
| "How many students do we have in Standard 6?" | Count + list |
| "How many students attended Grade 5 today?" | Attendance for that class |
| "How many students were absent across the school today?" | School-wide absentee count |
| "Who has unpaid fees this month?" | List with amounts |
| "Show me low performers in Math" | Students below threshold |

**Requirements for current build:**
- Data in Supabase is queryable (structured tables: students, attendance, invoices, etc.)
- No walled-off silos – AI agents can join across tables
- Consider: audit trail for AI-generated actions

**Future tasks:** AI chat UI, RAG over school data, tool-calling for queries (e.g. "run attendance query for class X on date Y").

---

## 2. Smart Payment Links – Pre-Informed, Multi-Channel

**Flow:** Parent receives a message (WhatsApp, email, SMS) with a **smart payment link**:

- Link is **pre-filled** with: student, invoice, **exact amount due** (e.g. $40)
- Not a generic link – the URL encodes invoice ID + amount
- Parent clicks → payment page shows only that amount, one-click pay
- Once paid → **automatically** updates dashboard, invoice marked paid
- Real-time sync (webhook or polling) so finance sees it immediately

**Example message (WhatsApp/Email/SMS):**
> Hi, [Guardian name]. [Student] has a pending fee of **$40** due [date]. [Pay now →](https://ams.com/pay?invoice=xxx&amount=40)

**Requirements for current build:**
- Invoices have `id`, `amount_due`, `student_id`, `guardian_id` – link can be constructed
- Payment page route: `/pay` or `/parent/pay` that accepts `invoice_id` (and optionally amount) as query params
- Payment recording updates `fee_invoices` / `payments` – same tables finance dashboard reads from
- Parent contact info (phone, email) stored for multi-channel delivery

**Future tasks:** Payment link generator, WhatsApp API integration, email/SMS delivery, webhook for payment provider, real-time dashboard refresh.

---

## 3. AI Across Every Module

| Module | AI capability (future) |
|--------|------------------------|
| **Admissions** | Suggest acceptance based on capacity, scores |
| **Attendance** | Flag patterns (chronic absenteeism), suggest follow-up |
| **Grades** | Identify at-risk students, recommend interventions |
| **Finance** | Forecast cash flow, suggest fee reminders |
| **Messaging** | Draft templates, auto-translate |
| **Reports** | Generate narrative summaries from data |

**Principle:** Every major functionality should eventually support AI – advice, automation, or natural-language access.

---

## 4. Smart Gate Access – QR/Scannable ID at School Entrance

**Vision:** At the main gate, every student has a physical ID (card, wristband) with a QR code or barcode. No guard needed.

- Student scans ID at the door → system checks: Is this a valid student? What time are they supposed to arrive?
- If **on time** → door opens, they're marked present
- If **late** → door stays closed, attempt is logged (late arrival)
- Fully automated – the door "knows" who should enter and when

**What the current build prepares:**
- `student_id` – unique for each student; the physical card links to this
- **Timetable** – school/class start times; we can derive "expected arrival" (e.g. 7:45–8:00)
- **Attendance** – already records present/absent; can extend to record scan-in time (on time / late)
- **Future:** API for scanners (device sends `student_id` + timestamp → AMS validates, returns open/deny, logs attendance)

---

## 5. Architecture Notes for AI Readiness

- **Structured data** – Use consistent schemas (student_id, school_id, dates) so AI can join and filter
- **Audit logs** – Track AI-generated actions for transparency
- **APIs** – Server actions / API routes that AI agents can call (e.g. `getAttendance(classId, date)`)
- **Permissions** – AI chat respects RBAC; principal only sees their school's data

---

---

# COMPLETE SUMMARY (For Non-Technical Readers)

## What Is AMS?

AMS is a **school management system** – an app that helps schools run everything in one place: students, classes, fees, attendance, report cards, and more. It’s built to feel like an **operating system for schools**.

---

## Who Uses It?

| Person | What they do |
|--------|--------------|
| **Company / Owner** | Manages multiple schools, adds new schools, sets up the platform |
| **School Admin** | Manages students, classes, teachers, admissions |
| **Teacher** | Takes attendance, enters grades, creates assignments, sends messages |
| **Finance** | Creates invoices, records payments, manages fees |
| **Operations** | Library, transport, events, staff |
| **Parent** | Sees their children’s grades, fees, timetable, messages |
| **Student** | Sees timetable, assignments, grades, messages |

---

## What You Get When You Click “Build”

After all 117 tasks run, you get:

### 1. **Company Front-End (No Direct Login)**
- **Home** (`/`) – Hero, value prop, CTAs. "Find a School" link. First thing visitors see – not login.
- **Features** (`/features`) – Visual outline of every functionality.
- **Get Access** (`/get-access`) – For schools to sign up.
- **Login** (`/login`) – Reached via nav, not default landing.
- Register, Forgot/Reset Password. Modern, minimal design.

### 2. **Each School Gets Its Own Public Website**
- When you add a school, a 4-step wizard collects: name, domain, colors, and design
- 3 designs to choose from: Modern, Classic, Minimal
- Public pages: About, Contact, and **Online Admissions** (parents/students apply here)
- Directory at `/schools` so visitors can find schools

### 3. **Admin Area (Company Side)**
- Dashboard with schools, users, students
- Add schools, branches, users
- Configure each school’s public site (logo, colors, template)
- Roles and permissions, audit log, feature toggles

### 4. **Academic Area**
- Student list with search by name, guardian, or Student ID
- Add/edit students; Student ID is auto-generated (e.g. SCH-2025-00001)
- Guardian list
- Admissions – including applications from the public website
- Classes, sections, subjects
- Timetable builder (drag-and-drop)
- Curriculum
- Bulk import of students from CSV

### 5. **Teacher Area**
- My classes
- Take attendance (including “mark all present”)
- Gradebook
- Assignments (create, grade, file uploads)
- Exams
- Report cards (print-ready)
- Messages

### 6. **Finance Area**
- Fee structure
- Invoices (create, search, print, export CSV)
- Payments
- Payroll
- Expenses
- Financial reports and charts
- Bulk invoice generation

### 7. **Operations Area**
- Library (search books, issue, return)
- Transport (routes, buses)
- Events (calendar view)
- Staff management

### 8. **Parent Area**
- Dashboard with each child’s Student ID (copyable)
- Child performance (grades, attendance)
- Fees and payments (including pay links)
- Timetable, assignments, messages, events, transport

### 9. **Student Area**
- Dashboard with Student ID
- Timetable, assignments (submit files), grades
- Library, messages, events

### 10. **Analytics**
- Dashboards with charts
- Branch comparison
- Student performance
- Attendance reports
- Financial reports

### 11. **Shared Features**
- Search (students, guardians, books, invoices, users)
- CSV export (students, invoices, reports)
- Print invoice, print report cards
- Password strength indicator
- One-click copy of Student ID
- Responsive layout (sidebar on desktop, bottom nav on mobile)
- Error handling and monitoring (Sentry)
- Empty states and onboarding hints

---

## “Roadmap Keeps Options Open” – Simple Explanation

Imagine building a house.

**Right now** we are building the rooms, pipes, and wiring.  
**Later** we’ll add things like smart doorbells, AI assistants, and payment devices.

We design **now** so those things can be added **later**:

- **Structured data** = Storing info in clear, labeled places (like boxes with labels). When AI or another system needs “how many students in Grade 6?”, it knows exactly where to look.
- **Invoice IDs** = Each bill has a unique number. When we send “Pay $40”, the link points to that specific bill, not a generic page.
- **Payment routes** = A dedicated page for paying, where the URL can say “pay invoice #123”. So “pay now” goes straight to the right bill and amount.
- **Student ID** = Every student has a unique ID. It’s ready for cards, QR codes, and gate scanners later.

If we built messy or without IDs, adding AI or smart payments later would mean tearing things apart. We’re building so we can plug them in when we’re ready.

---

## Future Vision (Not Built Yet)

| Feature | Description |
|--------|-------------|
| **AI Chat (“School Brain”)** | Principal types: “How many students absent today?” and gets the answer from live data, no clicking through dashboards |
| **Smart Payment Links** | Parent gets WhatsApp/email/SMS with: “Pay $40” → link opens a page with that exact amount → pays → dashboard updates automatically |
| **Smart Gate at School** | Student scans ID at the door → system checks if they’re on time → door opens or stays closed; attendance updated automatically |

---

## What “Build” Does Not Include (Yet)

- **Database (Supabase schema)** – Tables and migrations come in a separate phase
- **Live data** – With no backend, lists and charts use mock data
- **AI, WhatsApp, gate hardware** – Those are future phases
- **Custom domain routing** – Domain connection is captured in onboarding; actual DNS/routing is later

You get a **working front-end**: all pages load, layouts work, forms validate, and flows are in place. Once the backend is added, data will start flowing and the system will be fully usable.

---

# ADDITIONAL SUGGESTIONS (Future Consideration)

These are **not** in the current task list but could be added later:

| Suggestion | Purpose |
|------------|---------|
| **Excel export** | Export to .xlsx in addition to CSV |
| **PWA / offline** | Install as app, basic offline cache for attendance on tablets |
| **Email notifications** | Invoice reminders, welcome emails (Supabase Edge or external) |
| **Accessibility audit** | WCAG compliance, screen reader testing |
| **Internationalization (i18n)** | Multi-language support for schools in different regions |
| **CI/CD pipeline** | GitHub Actions: lint, test, deploy on push |
