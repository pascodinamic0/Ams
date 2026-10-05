import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaEn, coverImage } from "@/content/blog/shared";

export const schoolManagementSystemDrc: BlogPostContent = {
  slug: "school-management-system-drc",
  locale: "en",
  category: "drc",
  focusKeyword: "school management system DRC",
  secondaryKeywords: [
    "school software Congo",
    "school management system Kinshasa",
    "logiciel scolaire RDC",
  ],
  relatedSlugs: [
    "why-every-kinshasa-school-should-run-on-shuleos",
    "what-is-a-school-management-system",
    "school-fee-management-software",
    "systeme-de-gestion-scolaire-rdc",
  ],
  relatedModules: ["finance", "academic", "parent-student-portals"],
  title: "School management system for DRC schools: built for Kinshasa, not translated",
  excerpt:
    "CDF and USD fees in the city, printable bulletins, WhatsApp parents, queued offline attendance — a school management system for the DRC must match how schools actually run.",
  date: "2026-08-08",
  readTime: "10 min read",
  metaDescription:
    "School management system DRC: Kinshasa private schools, printable report cards, recorded fees, French-first support, and queued offline attendance on ShuleOS.",
  coverImage: coverImage("school-management-system-drc"),
  coverImageAlt:
    "Students in uniform in a Kinshasa private-school courtyard at midday, a parent speaking with the director.",
  intro: [
    "Kinshasa is a private-school city: most primary schools live on parent fees, not ministry payroll. That changes what a school management system must do  collections matter as much as curriculum.",
    "Foreign school software translated into French still often ignores WhatsApp-heavy parents, classrooms where the signal drops, and bulletins that are not a US GPA export.",
    "A school management system for DRC schools should be built for that reality  ShuleOS is developed in Kinshasa on Batetela for exactly this.",
  ],
  sections: [
    {
      title: "Private-school economics in Kinshasa",
      body: [
        "When two-thirds of primary schools are private, the fee ledger is the operating budget.",
        "Disputed balances and late collections are not admin annoyances  they are teacher pay and generator fuel.",
        "Directors need mid-term collection rates, not a bursar spreadsheet in July.",
      ],
    },
    {
      title: "Programme National and French-first workflows",
      body: [
        "Schools here talk in Programme National language — ShuleOS prints term cards from the gradebook, not a certified ministry grid.",
        "Staff work in French; parents may prefer French or Lingala messaging but expect official documents in French.",
        "Software menus in English only push work back to paper.",
      ],
    },
    {
      title: "Mobile money, WhatsApp, and the parent phone",
      body: [
        "Fees arrive in cash, CDF, USD, and mobile money  sometimes the same family uses all four.",
        "Reminders should go where parents already are, with a payment trail.",
        "Portals reduce gate queues; WhatsApp alone does not.",
      ],
    },
    {
      title: "Support from Kinshasa, not another timezone",
      body: [
        "Fee week and report-card season do not wait for tickets answered eight hours later.",
        "Local support on WhatsApp during published WAT business hours matches how schools already work.",
        "Register, then a 1–2 business day review, then billing — not a measured afternoon go-live.",
      ],
    },
  ],
  faq: [
    {
      question: "What is the best school management system in Congo?",
      answer:
        "One that handles French-first staff, printable bulletins from the gradebook, recorded fees, WhatsApp contact, queued offline attendance, and local support — without forcing staff to keep parallel notebooks.",
    },
    {
      question: "Does ShuleOS work outside Kinshasa?",
      answer:
        "ShuleOS is built for DRC private schools, with Kinshasa WhatsApp hours. Ask the office if you run outside Kinshasa — we do not publish a regional customer list.",
    },
  ],
  ...blogCtaEn,
  closing: [
    "Importing software built for another country is already a school management system  one your staff maintain by hand.",
    "Choose a DRC-ready platform before the next rentrée  fees, bulletins, and parents in one Kinshasa-built record.",
  ],
};
