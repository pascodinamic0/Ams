import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { companyIdentity } from "@/lib/company/identity";
import { HashScroll } from "@/components/company/hash-scroll";
import {
  GraduationCap,
  School,
  Wallet,
  Settings,
  Users,
  BookOpen,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";

export default async function FeaturesPage() {
  const t = await getTranslations("marketing.features");
  const tNav = await getTranslations("marketing.nav");

  const features = [
    {
      slug: "academic",
      title: t("academicModule"),
      icon: GraduationCap,
      items: t.raw("academicItems") as string[],
    },
    {
      slug: "teacher",
      title: t("teacherModule"),
      icon: Users,
      items: t.raw("teacherItems") as string[],
    },
    {
      slug: "finance",
      title: t("financeModule"),
      icon: Wallet,
      items: t.raw("financeItems") as string[],
    },
    {
      slug: "operations",
      title: t("operationsModule"),
      icon: Settings,
      items: t.raw("operationsItems") as string[],
    },
    {
      slug: "parent-portal",
      title: t("parentPortal"),
      icon: School,
      items: t.raw("parentItems") as string[],
    },
    {
      slug: "student-portal",
      title: t("studentPortal"),
      icon: BookOpen,
      items: t.raw("studentItems") as string[],
    },
    {
      slug: "analytics",
      title: t("analyticsModule"),
      icon: BarChart3,
      items: t.raw("analyticsItems") as string[],
    },
    {
      slug: "school-websites",
      title: t("schoolWebsitesModule"),
      icon: Globe,
      items: t.raw("schoolWebsitesItems") as string[],
    },
  ];

  return (
    <div className="min-h-screen bg-mkt-canvas pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <HashScroll />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-mkt-ink/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
            {companyIdentity.productName}
          </p>
          <h1 className="mt-5 font-display text-3xl leading-tight tracking-tight text-mkt-ink sm:text-5xl md:text-6xl">
            {t("heroTitleLine1")}{" "}
            <span className="text-mkt-ink/70">{t("heroTitleLine2")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-mkt-ink/60 sm:mt-8 sm:text-lg">
            {t("heroSubtitle", { productName: companyIdentity.productName })}
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.slug}
                id={f.slug}
                className="group scroll-mt-32 border border-mkt-ink/10 bg-transparent p-6 transition-colors hover:border-mkt-ink/25 sm:p-8"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-mkt-navy text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mb-4 text-lg font-semibold text-mkt-ink sm:text-xl">
                  {f.title}
                </h2>
                <ul className="space-y-3">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-mkt-ink/55">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/school-management-system"
            className="text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
          >
            {t("schoolManagementGuide")}
          </Link>
        </div>

        <div className="mt-20 border border-mkt-ink/10 px-6 py-12 text-center sm:mt-24 sm:px-12 sm:py-16">
          <h2 className="font-display text-2xl tracking-tight text-mkt-ink sm:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-mkt-ink/55 sm:mt-6">
            {t("ctaSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/get-access"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-mkt-inverse px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mkt-inverse-ink transition-transform hover:scale-[1.02]"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-mkt-ink/35 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
            >
              {tNav("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
