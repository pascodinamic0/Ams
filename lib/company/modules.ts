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

export const platformModules: PlatformModule[] = [
  {
    slug: "academic",
    title: "Academic",
    tagline: "From admission to report card",
    summary:
      "Run your entire academic cycle in one place - enrollments, classes, timetables, attendance, grading, and national curriculum-ready report cards.",
    desc: "Students, classes, timetable, attendance, grades, report cards",
    span: "md:col-span-2",
    icon: GraduationCap,
    iconClassName: "text-blue-500",
    highlights: [
      "Student profiles with guardians, medical notes, and enrollment history",
      "Classes aligned to DRC grade levels",
      "Timetable builder with teacher and room assignments",
      "Daily attendance with bulk marking and absence alerts",
      "Gradebooks, exams, and report cards mapped to national curriculum strands",
      "Online admissions linked to your public school website",
    ],
    whoItsFor: [
      "School administrators managing enrollments and academic records",
      "Teachers recording attendance and entering grades",
      "Parents viewing timetables, attendance, and report cards",
    ],
    localContext:
      "Built for Programme National workflows - track learning areas, formative assessments, and term reports the way DRC schools actually report progress.",
  },
  {
    slug: "finance",
    title: "Finance",
    tagline: "Fees, invoices, and payroll without spreadsheets",
    summary:
      "Set fee structures, send invoices, collect payments via mobile money or bank transfer, and track payroll - all tied to each student account.",
    desc: "Fees, invoices, payments, payroll, tracking",
    span: "md:col-span-1",
    icon: Wallet,
    iconClassName: "text-emerald-500",
    highlights: [
      "Flexible fee structures by class, term, or boarding status",
      "Automated invoices with balances and payment history per student",
      "Mobile-money-ready payment links with exact amounts pre-filled",
      "Fee reminders via WhatsApp before due dates",
      "Expense tracking and financial reports for bursars",
      "Staff payroll records alongside school fee collections",
    ],
    whoItsFor: [
      "Bursars and finance officers managing school fees",
      "Administrators reviewing collections and outstanding balances",
      "Parents paying fees from their portal or payment links",
    ],
    localContext:
      "Parents expect mobile money and clear fee statements. ShuleOS keeps every franc accounted for in CDF and USD, with reminders that reach parents on WhatsApp.",
  },
  {
    slug: "operations",
    title: "Operations",
    tagline: "Everything beyond the classroom",
    summary:
      "Manage library books, school transport routes, events, and staff records - the day-to-day operations that keep your school running.",
    desc: "Library, transport, events, staff",
    span: "md:col-span-1",
    icon: Settings,
    iconClassName: "text-stone-500",
    highlights: [
      "Library catalog with lending, returns, and overdue tracking",
      "Transport routes, bus assignments, and student pickup lists",
      "School events with registrations and campus visit scheduling",
      "Staff directory with roles, departments, and HR records",
      "Inventory-friendly workflows for uniforms and materials",
      "Operational reports for administrators and directors",
    ],
    whoItsFor: [
      "Operations managers coordinating transport and events",
      "Librarians tracking books and student borrowing",
      "Administrators overseeing staff and school logistics",
    ],
    localContext:
      "From school transport lists to prize-giving day registrations, operations modules match how DRC schools run outside the classroom.",
  },
  {
    slug: "analytics",
    title: "Analytics",
    tagline: "See your school clearly",
    summary:
      "Dashboards and reports for attendance trends, fee collection, academic performance, and branch comparisons - decisions backed by data.",
    desc: "Dashboards, branch comparison, attendance & finance reports",
    span: "md:col-span-2",
    icon: BarChart3,
    iconClassName: "text-primary",
    highlights: [
      "Executive dashboards for directors and school owners",
      "Attendance heatmaps and chronic absenteeism alerts",
      "Fee collection rates and outstanding balance summaries",
      "Academic performance trends by class, subject, or term",
      "Branch comparison for schools with multiple campuses",
      "Exportable reports for board meetings and ministry submissions",
    ],
    whoItsFor: [
      "School directors reviewing performance at a glance",
      "Administrators preparing term-end and annual reports",
      "Finance teams tracking collection targets",
    ],
    localContext:
      "Term reports, fee collection targets, and national curriculum progress summaries - all in dashboards your leadership team can read in minutes, not days.",
  },
  {
    slug: "school-websites",
    title: "Free School Website",
    tagline: "Stop losing families who never find you online",
    summary:
      "Parents search WhatsApp and Google before they visit. Without a site, they enroll elsewhere. Get a branded school website free with ShuleOS — homepage, admissions, events, hiring, and school visit booking into your admin queue.",
    desc: "Your school online with admissions, events, hiring & visits — included free",
    span: "md:col-span-2",
    icon: Globe,
    iconClassName: "text-amber-500",
    highlights: [
      "Free branded homepage with your logo, colours, and cover image",
      "About, programs, gallery, and contact sections",
      "Online admissions form feeding straight into your admin queue",
      "Public events managed from ShuleOS — open days and school activities",
      "Hiring / careers listings with applications into your staff queue",
      "Book a school visit directly from the site into your calendar",
      "Three templates: Modern, Classic, and Minimal",
      "Staff login link connecting visitors to the school portal",
    ],
    whoItsFor: [
      "Schools losing intake to competitors with better online presence",
      "Admissions teams drowning in paper applications",
      "Directors who know first impressions happen on a phone screen",
    ],
    localContext:
      "Every intake season without a website, families choose the school they found first. Launch yours free — and capture enquiries before they go elsewhere.",
  },
  {
    slug: "messaging",
    title: "Messaging",
    tagline: "Reach parents where they are",
    summary:
      "Real-time messaging between teachers, parents, students, and administrators - plus bulk announcements when you need everyone at once.",
    desc: "Real-time communication for everyone",
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
      "Teachers communicating with parents about assignments and behaviour",
      "Administrators sending school-wide notices",
      "Parents staying in touch without visiting the office",
    ],
    localContext:
      "Congolese parents live on WhatsApp. ShuleOS messaging keeps school communication structured and logged, while outreach campaigns can reach guardians on the channels they already use.",
  },
  {
    slug: "parent-student-portals",
    title: "Parent & Student Portals",
    tagline: "School in every parent's pocket",
    summary:
      "Dedicated portals so parents track fees, grades, and timetables while students submit work, view schedules, and message teachers - from any phone or browser.",
    desc: "Portals for parents and students",
    showOnHomepageGrid: false,
    icon: Users,
    iconClassName: "text-rose-500",
    highlights: [
      "Parent dashboard with linked children, fees, and attendance at a glance",
      "Pay school fees via mobile money or payment links without visiting the office",
      "View report cards, timetables, assignments, and school events in real time",
      "Student portal for homework submission, grades, library, and messages",
      "Secure login with role-based access - parents only see their own children",
      "Works on mobile browsers and low-bandwidth connections common in the DRC",
    ],
    whoItsFor: [
      "Parents who want fee balances and academic updates without phone calls",
      "Students checking assignments, schedules, and exam results",
      "Schools reducing front-office queues and paper notices",
    ],
    localContext:
      "Most Congolese parents manage school life from their phone. ShuleOS portals give them the same clarity the bursar and class teacher have - fees in CDF, national curriculum report cards, and WhatsApp-friendly updates.",
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
