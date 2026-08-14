import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaEn, coverImage } from "@/content/blog/shared";

export const studentInformationSystem: BlogPostContent = {
  slug: "student-information-system",
  locale: "en",
  category: "guides",
  focusKeyword: "student information system",
  secondaryKeywords: [
    "SIS software for schools",
    "student information management system",
    "school SIS vs SMS",
  ],
  relatedSlugs: [
    "what-is-a-school-management-system",
    "school-report-card-software",
    "school-fee-management-software",
  ],
  relatedModules: ["academic", "finance"],
  title: "Student information system (SIS): when you need more than transcripts",
  excerpt:
    "An SIS holds student records  but fees, parents, and operations often live elsewhere. Here's how a student information system compares to a full school management system.",
  date: "2026-08-09",
  readTime: "7 min read",
  metaDescription:
    "Student information system (SIS) explained: enrollment, grades, SIS vs school management system, and what DRC schools should choose.",
  coverImage: coverImage("student-information-system"),
  coverImageAlt: "Registrar viewing unified student records: guardians, classes, and grades.",
  intro: [
    "A student information system (SIS) is software that stores enrollment, demographics, schedules, and academic history  the academic source of truth.",
    "Many vendors use SIS and school management system interchangeably. The difference shows up when the bursar's ledger, parent WhatsApp threads, and library cards still live outside the SIS.",
  ],
  sections: [
    {
      title: "What an SIS covers",
      body: [
        "Student and guardian profiles, admissions pipeline, class assignments.",
        "Timetable, subjects, and curriculum mapping.",
        "Attendance, gradebook, exams, and transcripts.",
        "Teacher grade entry and academic reporting.",
      ],
    },
    {
      title: "Where a standalone SIS stops",
      body: [
        "Fee invoices and mobile money often need a second product.",
        "Parent communication reverts to WhatsApp without a portal.",
        "Operations  transport, library, HR  stay on paper.",
        "Directors reconcile exports because finance is not in the same database.",
      ],
    },
    {
      title: "School management system = SIS plus the rest",
      body: [
        "A school management system (SMS) typically includes SIS functions plus finance, messaging, operations, analytics, and public websites.",
        "For private DRC schools, the SIS-only purchase often grows into five tools  unless you start integrated.",
        "ShuleOS treats academics as the core but connects fees, portals, and dashboards to the same student ID.",
      ],
    },
  ],
  faq: [
    {
      question: "Is ShuleOS an SIS or a school management system?",
      answer:
        "Both. ShuleOS provides full student information management plus finance, parent portals, messaging, operations, and analytics in one platform.",
    },
    {
      question: "Do public schools use SIS software?",
      answer:
        "Increasingly yes  wherever enrollment, transcripts, and reporting outgrow paper. Private schools often adopt faster because they run on fee income and parent expectations.",
    },
  ],
  ...blogCtaEn,
  closing: [
    "If your SIS ends at transcripts but fees still leak in a notebook, you have half a system.",
    "Choose one student record that carries academics and finance through the whole year.",
  ],
};
