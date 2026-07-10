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
    description: `Learn how ${companyIdentity.productName} protects school data and meets compliance requirements.`,
    href: "/privacy",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-stone-600 dark:text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          Docs
        </p>
        <h1 className="mt-5 font-display text-3xl tracking-wide text-stone-900 dark:text-white md:text-5xl">
          Documentation
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-500 dark:text-white/55 sm:text-lg">
          Guides and resources to help your school get the most out of{" "}
          {companyIdentity.productName}.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {guides.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group border border-stone-200 dark:border-white/10 p-6 transition-colors hover:border-stone-400 dark:hover:border-white/25"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-white/15 text-stone-600 dark:text-white/60 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-500">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-white/50">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-500">
                Read guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 border border-stone-200 dark:border-white/10 p-8">
          <h2 className="font-display text-xl tracking-wide text-stone-900 dark:text-white">
            Need more help?
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-white/50">
            Our team is available to help with onboarding, integrations, and
            school-specific setup.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
          >
            Contact support
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
