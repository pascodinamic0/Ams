import Link from "next/link";
import { companyIdentity } from "@/lib/company/identity";
import {
  BookOpen,
  GraduationCap,
  Shield,
  Wallet,
  Users,
  ArrowRight,
} from "lucide-react";

const guides = [
  {
    icon: BookOpen,
    title: "Getting started",
    description:
      "Create your school account, complete onboarding, and invite your first users.",
    href: "/get-access",
  },
  {
    icon: GraduationCap,
    title: "Academic module",
    description:
      "Set up classes, timetables, attendance, grades, and report cards.",
    href: "/modules/academic",
  },
  {
    icon: Wallet,
    title: "Finance & fees",
    description:
      "Configure fee structures, generate invoices, and track payments.",
    href: "/modules/finance",
  },
  {
    icon: Users,
    title: "Roles & permissions",
    description:
      "Understand admin, teacher, parent, and student access levels.",
    href: "/features#platform-admin",
  },
  {
    icon: Shield,
    title: "Security & privacy",
    description:
      `Learn how ${companyIdentity.productName} protects school data and meets compliance requirements.`,
    href: "/privacy",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] dark:bg-[#0c1222] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-white md:text-5xl">
          Documentation
        </h1>
        <p className="mt-4 text-lg text-stone-500 dark:text-stone-400">
          Guides and resources to help your school get the most out of {companyIdentity.productName}.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {guides.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-primary-300 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-primary-700"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary dark:bg-primary-light dark:text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-primary">
                Read guide
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-stone-200 bg-stone-50 p-8 dark:border-stone-800 dark:bg-stone-900/50">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            Need more help?
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Our team is available to help with onboarding, integrations, and
            school-specific setup.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover dark:text-primary"
          >
            Contact support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
