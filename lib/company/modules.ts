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
  kenyaContext?: string;
};

export const platformModules: PlatformModule[] = [
  {
    slug: "academic",
    title: "Academic",
    tagline: "From admission to report card",
    summary:
      "Run your entire academic cycle in one place - enrollments, classes, timetables, attendance, grading, and CBC-ready report cards.",
    desc: "Students, classes, timetable, attendance, grades, report cards",
    span: "md:col-span-2",
    icon: GraduationCap,
    iconClassName: "text-blue-500",
    highlights: [
      "Student profiles with guardians, medical notes, and enrollment history",
      "Classes, sections, and streams aligned to Kenyan grade levels",
      "Timetable builder with teacher and room assignments",
      "Daily attendance with bulk marking and absence alerts",
      "Gradebooks, exams, and report cards mapped to CBC strands",
      "Online admissions linked to your public school website",
    ],
    whoItsFor: [
      "School administrators managing enrollments and academic records",
      "Teachers recording attendance and entering grades",
      "Parents viewing timetables, attendance, and report cards",
    ],
    kenyaContext:
      "Built for CBC workflows - track learning areas, formative assessments, and term reports the way Kenyan schools actually report progress.",
  },
  {
    slug: "finance",
    title: "Finance",
    tagline: "Fees, invoices, and payroll without spreadsheets",
    summary:
      "Set fee structures, send invoices, collect payments via M-Pesa or bank transfer, and track payroll - all tied to each student account.",
    desc: "Fees, invoices, payments, payroll, tracking",
    span: "md:col-span-1",
    icon: Wallet,
    iconClassName: "text-emerald-500",
    highlights: [
      "Flexible fee structures by class, term, or boarding status",
      "Automated invoices with balances and payment history per student",
      "M-Pesa-ready payment links with exact amounts pre-filled",
      "Fee reminders via WhatsApp before due dates",
      "Expense tracking and financial reports for bursars",
      "Staff payroll records alongside school fee collections",
    ],
    whoItsFor: [
      "Bursars and finance officers managing school fees",
      "Administrators reviewing collections and outstanding balances",
      "Parents paying fees from their portal or payment links",
    ],
    kenyaContext:
      "Parents expect M-Pesa and clear fee statements. ShuleOS keeps every shilling accounted for in KES, with reminders that reach parents on WhatsApp.",
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
    iconClassName: "text-slate-500",
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
    kenyaContext:
      "From matatu-route transport lists to prize-giving day registrations, operations modules match how Kenyan schools run outside the classroom.",
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
    iconClassName: "text-indigo-500",
    highlights: [
      "Executive dashboards for directors and school owners",
      "Attendance heatmaps and chronic absenteeism alerts",
      "Fee collection rates and outstanding balance summaries",
      "Academic performance trends by class, subject, or term",
      "Branch comparison for schools with multiple campuses",
      "Exportable reports for board meetings and MOE submissions",
    ],
    whoItsFor: [
      "School directors reviewing performance at a glance",
      "Administrators preparing term-end and annual reports",
      "Finance teams tracking collection targets",
    ],
    kenyaContext:
      "Term reports, fee collection targets, and CBC progress summaries - all in dashboards your leadership team can read in minutes, not days.",
  },
  {
    slug: "school-websites",
    title: "School Websites",
    tagline: "Your school online, on brand",
    summary:
      "Launch a branded public website with online admissions, events, and contact details - connected directly to your ShuleOS portal.",
    desc: "Branded sites with online admissions",
    span: "md:col-span-2",
    icon: Globe,
    iconClassName: "text-amber-500",
    highlights: [
      "Branded homepage with your logo, colours, and cover image",
      "About, programs, gallery, and contact sections",
      "Online admissions form feeding straight into your admin queue",
      "Public events page for open days and school activities",
      "Three templates: Modern, Classic, and Minimal",
      "Staff login link connecting visitors to the school portal",
    ],
    whoItsFor: [
      "Schools launching or upgrading their public web presence",
      "Admissions teams collecting online applications",
      "Marketing staff showcasing programs and achievements",
    ],
    kenyaContext:
      "Parents often discover your school on WhatsApp or Google first. A professional site with online admissions helps you capture enquiries before they go to a competitor.",
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
    kenyaContext:
      "Kenyan parents live on WhatsApp. ShuleOS messaging keeps school communication structured and logged, while outreach campaigns can reach guardians on the channels they already use.",
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
      "Pay school fees via M-Pesa or payment links without visiting the office",
      "View report cards, timetables, assignments, and school events in real time",
      "Student portal for homework submission, grades, library, and messages",
      "Secure login with role-based access - parents only see their own children",
      "Works on mobile browsers and low-bandwidth connections common in Kenya",
    ],
    whoItsFor: [
      "Parents who want fee balances and academic updates without phone calls",
      "Students checking assignments, schedules, and exam results",
      "Schools reducing front-office queues and paper notices",
    ],
    kenyaContext:
      "Most Kenyan parents manage school life from their phone. ShuleOS portals give them the same clarity the bursar and class teacher have - fees in KES, CBC report cards, and WhatsApp-friendly updates.",
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
