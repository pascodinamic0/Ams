import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";
import type { PlatformModule } from "@/lib/company/modules";

export function ModuleDetailPage({ module }: { module: PlatformModule }) {
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 dark:bg-[#0c1222]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover dark:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mt-8 border-b border-stone-200 pb-10 dark:border-stone-800">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light dark:bg-primary-light/50">
            <Icon className={`h-8 w-8 ${module.iconClassName}`} />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary dark:text-primary">
            {module.tagline}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-stone-900 dark:text-white md:text-5xl">
            {module.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone-500 dark:text-stone-400">
            {module.summary}
          </p>
        </header>

        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            What you can do
          </h2>
          <ul className="space-y-4">
            {module.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base text-stone-600 dark:text-stone-300"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            Who it&apos;s for
          </h2>
          <ul className="space-y-3">
            {module.whoItsFor.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {module.kenyaContext && (
          <section className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Built for Kenyan schools
            </p>
            <p className="mt-3 text-base leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
              {module.kenyaContext}
            </p>
          </section>
        )}

        <div className="mt-14 flex flex-col gap-4 border-t border-stone-200 pt-10 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Part of the {companyIdentity.productName} platform. See everything in{" "}
            <Link href="/features" className="font-medium text-primary dark:text-primary">
              all features
            </Link>
            .
          </p>
          <Link
            href="/get-access"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary"
          >
            Get access
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
