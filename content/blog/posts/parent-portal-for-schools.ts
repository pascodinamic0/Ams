import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaEn, coverImage } from "@/content/blog/shared";

export const parentPortalForSchools: BlogPostContent = {
  slug: "parent-portal-for-schools",
  locale: "en",
  category: "guides",
  focusKeyword: "parent portal for schools",
  secondaryKeywords: [
    "school parent portal",
    "parent communication app for schools",
    "student parent portal software",
  ],
  relatedSlugs: [
    "school-fee-management-software",
    "school-attendance-software",
    "what-is-a-school-management-system",
  ],
  relatedModules: ["parent-student-portals", "messaging"],
  title: "Parent portal for schools: your parents already have one  it's WhatsApp",
  excerpt:
    "Unlogged chats are not a parent portal. Here's what a real school parent portal must show  fees, grades, attendance  before the office becomes a call centre.",
  date: "2026-08-11",
  readTime: "8 min read",
  metaDescription:
    "Parent portal for schools: balances, grades, attendance, timetable, and logged messaging vs WhatsApp-only communication for African schools.",
  coverImage: coverImage("parent-portal-for-schools"),
  coverImageAlt: "Parent checking school fees and grades on a smartphone at home.",
  intro: [
    "Ask a Kinshasa parent how they talk to the school. The answer is a class WhatsApp group, a director's number, and a trip to the secretariat when the chat goes silent.",
    "That is communication  not a parent portal. A real parent portal for schools gives guardians the same facts the office has: balances, grades, absences, timetable, and messages  without a queue.",
  ],
  sections: [
    {
      title: "What a parent portal must show",
      body: [
        "Current fee balance and payment history with receipts.",
        "Grades and report cards as they are published  not after a gate argument.",
        "Attendance and absence alerts while they still matter.",
        "Timetable, events, and assignments for each enrolled child.",
        "Secure messaging with the school  logged, not lost in a chat scroll.",
      ],
    },
    {
      title: "Student portal: same record, student view",
      body: [
        "Older students need their own view: assignments, grades, library loans, and timetable.",
        "One login per role keeps teachers from repeating the same update twenty times.",
        "Portals should work on any phone browser or installed PWA  no app-store friction.",
      ],
    },
    {
      title: "WhatsApp plus portal  not WhatsApp instead of portal",
      body: [
        "Schools should meet parents on WhatsApp for reminders  but the ledger and grades live in the portal.",
        "Mass outreach with delivery logs beats forwarding PDFs in groups.",
        "When disputes happen, the school needs proof of what was sent and when.",
      ],
    },
    {
      title: "Cost of no parent portal",
      body: [
        "The secretariat becomes a helpdesk for balance checks.",
        "Trust erodes when fees and grades arrive late or wrong.",
        "Collections slip because reminders happen after the due date, not before.",
      ],
    },
  ],
  faq: [
    {
      question: "Do parents need to download an app?",
      answer:
        "Not necessarily. A mobile-friendly portal or PWA they can add to the home screen is enough for most African parents.",
    },
    {
      question: "Can parents pay fees through the portal?",
      answer:
        "Yes  when fee management is integrated, parents see the exact balance and pay via mobile money or recorded cash at the office.",
    },
  ],
  ...blogCtaEn,
  closing: [
    "Parents should not cross Kinshasa for a balance the portal could have shown Tuesday.",
    "Give every guardian a logged view before the next fee week fills the office queue.",
  ],
};
