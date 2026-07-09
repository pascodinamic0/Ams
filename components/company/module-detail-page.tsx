import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { companyIdentity } from "@/lib/company/identity";
import type { PlatformModule } from "@/lib/company/modules";

export async function ModuleDetailPage({ module }: { module: PlatformModule }) {
  const t = await getTranslations("modules");
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-black pb-24 pt-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <header className="mt-8 border-b border-white/10 pb-10">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-amber-500">
            <Icon className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {module.tagline}
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-wide text-white md:text-5xl">
            {module.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-white/55 sm:text-lg">
            {module.summary}
          </p>
        </header>

        <section className="mt-10 space-y-6">
          <h2 className="font-display text-xl tracking-wide text-white">
            What you can do
          </h2>
          <ul className="space-y-4">
            {module.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base text-white/60"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-display text-xl tracking-wide text-white">
            Who it&apos;s for
          </h2>
          <ul className="space-y-2">
            {module.whoItsFor.map((item) => (
              <li
                key={item}
                className="border border-white/10 px-4 py-3 text-sm font-medium text-white/65"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {module.localContext && (
          <section className="mt-12 border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
              {t("builtForLocalSchools")}
            </p>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              {module.localContext}
            </p>
          </section>
        )}

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/45">
            Part of the {companyIdentity.productName} platform. See everything in{" "}
            <Link href="/features" className="font-medium text-amber-500 hover:text-amber-400">
              all features
            </Link>
            .
          </p>
          <Link
            href="/get-access"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-transform hover:scale-[1.02]"
          >
            Get access
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
