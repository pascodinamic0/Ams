import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaEn, coverImage } from "@/content/blog/shared";

export const schoolReportCardSoftware: BlogPostContent = {
  slug: "school-report-card-software",
  locale: "en",
  category: "guides",
  focusKeyword: "school report card software",
  secondaryKeywords: [
    "report card generator for schools",
    "digital report cards",
    "Programme National bulletins",
  ],
  relatedSlugs: [
    "what-is-a-school-management-system",
    "school-management-system-drc",
    "school-attendance-software",
  ],
  relatedModules: ["academic"],
  title: "School report card software: Programme National bulletins can't be an all-nighter",
  excerpt:
    "When grades live in registers and chats, report-card week shuts the office down. Here's what school report card software must do for DRC and African curricula.",
  date: "2026-08-10",
  readTime: "8 min read",
  metaDescription:
    "School report card software for DRC schools: Programme National bulletins, gradebook integration, printable report cards, and no more report-card week chaos.",
  coverImage: coverImage("school-report-card-software"),
  coverImageAlt: "Teacher generating Programme National report cards from a digital gradebook.",
  intro: [
    "Report-card week is not a printing problem. It is the bill for a term of grades that lived in registers, chats, and memory.",
    "School report card software should produce Programme National bulletins from the same gradebook teachers used all term  not a manual rebuild at night.",
  ],
  sections: [
    {
      title: "Why foreign SIS tools fail on DRC bulletins",
      body: [
        "Generic GPA exports ignore Programme National learning areas and term structure families expect.",
        "Staff keep paper parallels; directors pay twice  license plus overtime.",
        "Inspectors and parents recognise the national format  your software should too.",
      ],
    },
    {
      title: "What to require from report card software",
      body: [
        "Gradebooks mapped to national curriculum strands.",
        "Attendance and conduct integrated where required.",
        "Batch generation by class with review before print.",
        "Parent portal publish when cards are ready  no photo of a PDF in WhatsApp.",
        "Historical transcripts stored on the student file.",
      ],
    },
    {
      title: "Report cards connected to attendance and fees",
      body: [
        "Some schools hold bulletins until fees clear  that rule should be system-enforced, not argued at the window.",
        "Chronic absence should surface on the report narrative, not surprise a parent in July.",
        "One student record prevents mismatched names and class levels on printed cards.",
      ],
    },
  ],
  faq: [
    {
      question: "Can ShuleOS generate Programme National report cards?",
      answer:
        "Yes. ShuleOS maps gradebooks and exams to DRC Programme National formats so teachers print bulletins from the same file they used daily.",
    },
    {
      question: "How long should report-card week take?",
      answer:
        "With integrated software, bulk generation and review should take hours  not a week of manual copying from registers.",
    },
  ],
  ...blogCtaEn,
  closing: [
    "Another all-nighter for bulletins is report card software you didn't install in September.",
    "Connect gradebook to Programme National output before the next term ends.",
  ],
};
