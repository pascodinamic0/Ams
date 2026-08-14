import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaEn, coverImage } from "@/content/blog/shared";

export const schoolAttendanceSoftware: BlogPostContent = {
  slug: "school-attendance-software",
  locale: "en",
  category: "attendance",
  focusKeyword: "school attendance software",
  secondaryKeywords: [
    "attendance management system for schools",
    "digital attendance register",
    "offline school attendance",
  ],
  relatedSlugs: [
    "what-is-a-school-management-system",
    "school-management-system-drc",
    "parent-portal-for-schools",
  ],
  relatedModules: ["academic", "analytics"],
  title: "School attendance software that still works when the signal dies",
  excerpt:
    "Paper registers and online-only apps both fail real classrooms. Here's what school attendance software must do  including offline sync  before absences cost you fees and trust.",
  date: "2026-08-13",
  readTime: "8 min read",
  metaDescription:
    "School attendance software for African schools: daily rolls, absence alerts, offline PWA sync, and dashboards directors trust mid-term.",
  coverImage: coverImage("school-attendance-software"),
  coverImageAlt:
    "A teacher taking roll with a paper register and a phone that has no signal, students in uniform behind her.",
  intro: [
    "Attendance is the earliest signal in any school  and the first record to break. Teachers rewrite lists when paper tears; online apps freeze when the connection drops; directors only see gaps weeks later.",
    "School attendance software should make the roll call faster than paper and more reliable than a chat forward. In Kinshasa and across the DRC, that also means offline-first: the day counts even when Vodacom doesn't.",
  ],
  sections: [
    {
      title: "Why attendance leaks money and trust",
      body: [
        "Chronic absence correlates with unpaid fees and dropout risk. When rolls live in notebooks, nobody flags patterns until a parent meeting  or never.",
        "Double entry after a dead signal wastes teacher evenings and introduces errors that become disputes.",
        "Inspectors and boards ask for attendance summaries; reconstructing them from memory is not a plan.",
      ],
    },
    {
      title: "Features to require in school attendance software",
      body: [
        "Bulk marking by class with same-day edits and audit history.",
        "Absence alerts to guardians  before the gate dispute.",
        "Offline capture with automatic sync when connectivity returns.",
        "Heatmaps and trends for directors: which class empties, which day spikes.",
        "Export for ministry or board reporting without a week of copy-paste.",
      ],
    },
    {
      title: "Offline attendance is not optional in African schools",
      body: [
        "Internet penetration remains uneven even in urban Kinshasa. A classroom cannot pause because the router blinked.",
        "Progressive web apps (PWAs) install on teachers' phones like native apps and queue attendance locally  the same object the director reads later.",
        "If your attendance tool requires constant connectivity, staff will keep a paper parallel  and you pay twice.",
      ],
    },
    {
      title: "Attendance tied to the rest of the school record",
      body: [
        "Attendance should sit beside grades, fees, and guardian contacts on one student file  not in a standalone app.",
        "When a parent opens the portal, yesterday's absence should be visible without a phone call to the office.",
        "Fee reminders and discipline workflows should see the same attendance truth.",
      ],
    },
  ],
  faq: [
    {
      question: "What is the best attendance system for schools?",
      answer:
        "One that teachers can complete in under two minutes per class, works offline, and feeds dashboards and parent portals automatically.",
    },
    {
      question: "Can teachers mark attendance without internet?",
      answer:
        "Yes  with a PWA or native app that stores rolls locally and syncs later. ShuleOS supports offline attendance for exactly this reason.",
    },
  ],
  ...blogCtaEn,
  closing: [
    "Ghost rolls and night-time re-entry are attendance software failures you already fund every week.",
    "Fix attendance in one system before the next term  while directors can still act on patterns, not excuses.",
  ],
};
