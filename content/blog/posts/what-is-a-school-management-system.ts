import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaEn, coverImage } from "@/content/blog/shared";

export const whatIsSchoolManagementSystem: BlogPostContent = {
  slug: "what-is-a-school-management-system",
  locale: "en",
  category: "guides",
  focusKeyword: "school management system",
  secondaryKeywords: [
    "school management software",
    "school ERP",
    "student management system",
    "school administration software",
  ],
  relatedSlugs: [
    "student-information-system",
    "school-fee-management-software",
    "school-attendance-software",
    "parent-portal-for-schools",
    "school-management-system-drc",
  ],
  relatedModules: ["academic", "finance", "parent-student-portals"],
  title: "What is a school management system? (And what yours is missing)",
  excerpt:
    "A school management system is the single record for students, fees, attendance, grades, and parent communication ? not ten notebooks and a WhatsApp group. Here's what it includes and how to choose one.",
  date: "2026-08-14",
  readTime: "12 min read",
  metaDescription:
    "What is a school management system? Modules, benefits, spreadsheet vs software, and how African and DRC schools should choose school management software.",
  coverImage: coverImage("what-is-a-school-management-system"),
  coverImageAlt:
    "A Kinshasa school director at dusk, desk buried under registers, a spreadsheet, and a buzzing phone.",
  intro: [
    "A school management system (SMS) ? also called school management software or a school ERP ? is the operating system for everything your school runs: enrollments, classes, attendance, grades, fees, parent messages, and the public website.",
    "Most schools already have a system. It is registers in drawers, fee balances in spreadsheets, grades in chats, and parents queuing at the office. That patchwork has a price: lost fees, report-card chaos, and directors who only see problems at term end.",
    "This guide explains what a real school management system includes, how it differs from spreadsheets, and what to look for if you run a school in Africa ? especially the DRC.",
  ],
  sections: [
    {
      title: "What a school management system actually does",
      body: [
        "At minimum, a school management system connects academic records, finance, and communication around one student file. When a child enrolls, their class, guardians, fee plan, attendance history, and grades live in the same place ? not in three notebooks and someone's phone.",
        "Modern school management software also gives each role a focused view: teachers mark attendance and enter grades; bursars invoice and reconcile; parents see balances and bulletins; directors read dashboards mid-term instead of waiting for a spreadsheet in July.",
        "The goal is not more software. It is one record the whole school can trust before the next fee week or report-card season.",
      ],
    },
    {
      title: "Core modules every school management system needs",
      body: [
        "Academic management: admissions, classes, timetable, attendance, gradebook, exams, and report cards aligned to your national programme.",
        "Finance: fee structures, invoicing, payment tracking, expenses, payroll, and collection reports ? especially if you bill in more than one currency.",
        "Parent and student portals: balances, grades, attendance, timetable, assignments, and messages on the phone ? so the office is not a helpdesk.",
        "Communication: logged messaging, mass WhatsApp or SMS, and outreach with a trail ? not only unlogged chats.",
        "Operations: library, transport, events, and staff records for the work that never fit in a register.",
        "Analytics: attendance trends, collection rates, and branch comparison while the term is still running.",
        "Public presence: a branded school website with online admissions feeding the same admin queue.",
      ],
    },
    {
      title: "School management system vs spreadsheet",
      body: [
        "Spreadsheets work until they don't: someone edits the wrong tab, a formula breaks, a teacher keeps a parallel list, and by report-card week nobody agrees on the numbers.",
        "A school management system enforces one student ID, role-based access, and audit trails ? who changed a grade, who marked a payment, who sent a fee reminder.",
        "The hidden cost of spreadsheets is time: evenings re-entering attendance, Sundays reconciling fees, and directors making decisions on data that is already old.",
      ],
    },
    {
      title: "School management system vs student information system (SIS)",
      body: [
        "People use the terms interchangeably, but a student information system (SIS) often emphasises academic records ? enrollment, demographics, grades ? while a full school management system adds finance, HR, communication, and operations.",
        "If you only need transcripts, an SIS might suffice. If fees, parents, and daily operations leak without a ledger, you need the broader platform.",
        "ShuleOS covers both: Programme National report cards and the bursar's ledger in one place.",
      ],
    },
    {
      title: "What African and DRC schools should demand",
      body: [
        "French and English interfaces for staff and parents.",
        "Multi-currency fees (CDF and USD are normal in Kinshasa).",
        "Mobile money and WhatsApp-native reminders ? parents already pay and communicate on the phone.",
        "Offline-capable attendance when the connection drops mid-roll.",
        "National curriculum report cards (Programme National in DRC), not only generic GPA exports.",
        "Support in your timezone ? not a ticket queue eight hours away.",
      ],
    },
    {
      title: "How to choose school management software",
      body: [
        "List the leaks costing you this term: uncollected fees, report-card nights, parent queues, absenteeism you see too late.",
        "Require a live demo with your workflows: one admission, one invoice, one attendance mark, one bulletin.",
        "Ask who supports you after go-live and whether onboarding is measured in afternoons or months.",
        "Prefer one platform over five apps that don't share a student ID.",
      ],
    },
  ],
  faq: [
    {
      question: "What is the best school management system?",
      answer:
        "The best system is the one your staff will use daily and that matches local reality: currency, curriculum, language, mobile money, and connectivity. For DRC private schools, that usually means French-first software with Programme National report cards and WhatsApp-friendly fee reminders ? not a generic import.",
    },
    {
      question: "How much does a school management system cost?",
      answer:
        "Pricing varies by student count and modules. Hidden costs matter more: setup fees, per-SMS charges, and staff time bending foreign software. Compare total cost including the afternoons your team spends off-platform.",
    },
    {
      question: "Can a small private school use school management software?",
      answer:
        "Yes. Small schools often leak the most because one person holds every register. A single system replaces that bottleneck and scales when you add a branch or intake.",
    },
    {
      question: "Do parents need an app?",
      answer:
        "Parents need a portal they can open on any phone ? often a progressive web app (PWA) without an app-store download. Balances and bulletins should be visible before they travel to the office.",
    },
  ],
  ...blogCtaEn,
  closing: [
    "Another term on notebooks and WhatsApp is already a school management system ? just an expensive one.",
    "A purpose-built school management platform is the small next step: one afternoon to put fees, grades, and parents in one record before the next rentre locks in the same leaks.",
  ],
};
