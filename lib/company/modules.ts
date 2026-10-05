import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Globe,
  GraduationCap,
  MessageSquare,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

export type PlatformModule = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  desc: string;
  span?: string;
  showOnHomepageGrid?: boolean;
  icon: LucideIcon;
  iconClassName: string;
  highlights: string[];
  whoItsFor: string[];
  localContext?: string;
};

/** English catalog kept in sync with `messages/en/modules.json`. Live pages use `lib/i18n/modules.ts`. */
export const platformModules: PlatformModule[] = [
  {
    slug: "academic",
    title: "School life",
    tagline: "Report card season shouldn't shut down the office",
    summary:
      "When enrollments, attendance, and grades live in separate places, report cards take days and errors multiply. One academic cycle—from admission to printable term cards—without rebuilding from chats.",
    desc: "Every student tracked. Attendance, grades, and report cards — without you carrying it all.",
    span: "md:col-span-2",
    icon: GraduationCap,
    iconClassName: "text-blue-500",
    highlights: [
      "Student profiles with guardians, medical notes, and enrollment history",
      "Classes with names you configure (including DRC grade labels you set)",
      "Timetable builder with teacher assignments",
      "Daily attendance with bulk marking",
      "Gradebooks, exams, and printable term report cards from the same file",
      "Online admissions linked to your public school website",
    ],
    whoItsFor: [
      "School administrators tired of reconciling records at term end",
      "Teachers losing evenings to attendance lists and grade re-entry",
      "Parents who only see progress when there's already a problem",
    ],
    localContext:
      "Every term without a single academic system, DRC schools re-type the same grades. ShuleOS keeps the gradebook and printable cards together—as you work, not as a foreign GPA export.",
  },
  {
    slug: "finance",
    title: "Finance",
    tagline: "Stop chasing the same balances every month",
    summary:
      "Unpaid balances hide in notebooks until parents dispute them at the gate. Invoices, recorded payments, and WhatsApp reminders (when connected) tied to every student account.",
    desc: "Recorded payments in one place. No more guessing which notebook is true.",
    span: "md:col-span-1",
    icon: Wallet,
    iconClassName: "text-emerald-500",
    highlights: [
      "Flexible fee structures by class or term",
      "Invoices issued from fee structures, with balances and payment history per student",
      "Record a mobile-money or cash payment against the amount due — parents also see pay instructions",
      "Fee reminders via WhatsApp before due dates, when WhatsApp is connected",
      "Expense tracking and financial reports for bursars",
      "Staff payroll records alongside school fee collections",
    ],
    whoItsFor: [
      "Bursars tired of end-of-term reconciliation surprises",
      "Directors who can't trust cash position until someone adds it up",
      "Parents who pay late because balances weren't clear",
    ],
    localContext:
      "Parents in Kinshasa already pay in cash, dollars, and mobile money. ShuleOS uses one currency per school in the app — ask Kinshasa if you need a different setup.",
  },
  {
    slug: "operations",
    title: "Organisation",
    tagline: "Stop losing track outside the classroom",
    summary:
      "Transport lists on paper, library books that never return, event registrations in WhatsApp threads. Library, transport, events, and staff in one place.",
    desc: "Transport, books, events, staff — held together, without you chasing.",
    span: "md:col-span-1",
    icon: Settings,
    iconClassName: "text-stone-500",
    highlights: [
      "Library catalog with lending, returns, and overdue tracking",
      "Transport routes, bus assignments, and student pickup lists",
      "School events with registrations and campus visit scheduling",
      "Staff directory with roles, departments, and HR records",
      "Events and visit booking in the same school record",
      "Operational reports for administrators and directors",
    ],
    whoItsFor: [
      "Operations managers who can't find the latest transport list",
      "Librarians losing books to manual lending logs",
      "Administrators juggling staff records across files",
    ],
    localContext:
      "From school transport lists to prize-giving day registrations, DRC schools lose hours every week on logistics that should take minutes.",
  },
  {
    slug: "analytics",
    title: "Oversight",
    tagline: "Stop deciding blind at term end",
    summary:
      "When attendance, fees, and performance live in separate notebooks, directors learn the damage after the term. Dashboards for collection rates and attendance.",
    desc: "The results, not the details. You see collections and attendance in the app — without compiling it yourself.",
    span: "md:col-span-2",
    icon: BarChart3,
    iconClassName: "text-primary",
    highlights: [
      "Executive dashboards for directors and school owners",
      "Attendance charts from rolls teachers already marked",
      "Fee collection rates and outstanding balance summaries",
      "Academic performance trends by class, subject, or term",
      "School and finance dashboards (multi-campus data can live in one school record)",
      "Exportable reports for board meetings",
    ],
    whoItsFor: [
      "Directors who find out about problems too late",
      "Administrators spending days on reports spreadsheets could generate",
      "Finance teams missing collection targets until term end",
    ],
    localContext:
      "Term reports and fee collection targets shouldn't wait until July. ShuleOS dashboards show collections and attendance in the app—without claiming a timed study.",
  },
  {
    slug: "school-websites",
    title: "Your visibility",
    tagline: "Stop losing families who never find you online",
    summary:
      "Parents search WhatsApp and Google before they visit. ShuleOS includes a branded school website with the plan after approval — homepage, admissions, events, and visit booking into your admin queue.",
    desc: "Families find you. Enrolments arrive. Your legacy is visible.",
    span: "md:col-span-2",
    icon: Globe,
    iconClassName: "text-amber-500",
    highlights: [
      "Branded homepage with your logo, colours, and cover image",
      "About, programs, gallery, and contact sections",
      "Online admissions form feeding straight into your admin queue",
      "Public events managed from ShuleOS — open days and school activities",
      "Three templates: Modern, Classic, and Minimal",
      "Book a school visit directly from the site into your calendar",
    ],
    whoItsFor: [
      "Schools losing intake to competitors with better online presence",
      "Admissions teams drowning in paper applications",
      "Directors who know first impressions happen on a phone screen",
    ],
    localContext:
      "Every intake season without a website, families choose the school they found first. Launch yours with the school plan — and capture enquiries before they go elsewhere.",
  },
  {
    slug: "messaging",
    title: "The link with families",
    tagline: "Stop \"come to the office\" as your default reply",
    summary:
      "Unlogged WhatsApp threads mean disputes with no record. Structured messaging between teachers, parents, and admins—with history tied to every student.",
    desc: "Fewer office queues. More trust. You are no longer the school's switchboard.",
    span: "md:col-span-1",
    icon: MessageSquare,
    iconClassName: "text-purple-500",
    highlights: [
      "Direct conversations between teachers and guardians",
      "Class-wide and school-wide announcement broadcasts",
      "Message history tied to student and staff profiles",
      "Notifications for new messages and urgent alerts",
      "Role-based access so students, parents, and staff see the right threads",
      "Integrates with fee reminders and event updates",
    ],
    whoItsFor: [
      "Teachers repeating the same update to twenty parents",
      "Administrators with no audit trail for what was communicated",
      "Parents who only hear about problems after they've escalated",
    ],
    localContext:
      "Congolese parents live on WhatsApp—but unstructured chats lose messages and create disputes. ShuleOS keeps school communication logged and reachable.",
  },
  {
    slug: "parent-student-portals",
    title: "Parent & Student Portals",
    tagline: "Stop the office queue",
    summary:
      "Every parent visit for a balance check or grade update costs staff time. Portals put fees, grades, timetables, and assignments on their phone.",
    desc: "Portals for parents and students",
    showOnHomepageGrid: false,
    icon: Users,
    iconClassName: "text-rose-500",
    highlights: [
      "Parent dashboard with linked children, fees, and attendance at a glance",
      "See the amount due and follow the school's pay instructions (cash or mobile money outside the app)",
      "View report cards, timetables, assignments, and school events",
      "Student portal to view homework, grades, library, and messages — not homework upload",
      "Secure login with role-based access - parents only see their own children",
      "Works on mobile browsers and low-bandwidth connections common in the DRC",
    ],
    whoItsFor: [
      "Parents tired of visiting the office for information they should see at home",
      "Students missing deadlines because assignments weren't visible",
      "Schools whose front office becomes a help desk every fee season",
    ],
    localContext:
      "Most Congolese parents manage school life from their phone. Without a portal, they miss fee balances, grades, and absences until the office queue or a crisis.",
  },
];

export const homepageModuleGrid = platformModules.filter(
  (module) => module.showOnHomepageGrid !== false
);

export const homepageCtaSections = [
  { label: "Academic management", slug: "academic" },
  { label: "Fee & finance tracking", slug: "finance" },
  { label: "Parent & student portals", slug: "parent-student-portals" },
] as const;

export const platformModulesBySlug = Object.fromEntries(
  platformModules.map((module) => [module.slug, module])
) as Record<string, PlatformModule>;

export function getPlatformModule(slug: string): PlatformModule | undefined {
  return platformModulesBySlug[slug];
}
