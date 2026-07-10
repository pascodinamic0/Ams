"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import {
  Building2,
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

function scrollToHashTarget() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const target = document.getElementById(hash);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function FeaturesPage() {
  const t = useTranslations("marketing.features");
  const tNav = useTranslations("marketing.nav");

  const features = useMemo(
    () => [
      {
        slug: "platform-admin",
        title: t("platformAdmin"),
        icon: <Building2 className="h-5 w-5" />,
        items: t.raw("platformAdminItems") as string[],
      },
      {
        slug: "academic",
        title: t("academicModule"),
        icon: <GraduationCap className="h-5 w-5" />,
        items: t.raw("academicItems") as string[],
      },
      {
        slug: "teacher",
        title: t("teacherModule"),
        icon: <Users className="h-5 w-5" />,
        items: t.raw("teacherItems") as string[],
      },
      {
        slug: "finance",
        title: t("financeModule"),
        icon: <Wallet className="h-5 w-5" />,
        items: t.raw("financeItems") as string[],
      },
      {
        slug: "operations",
        title: t("operationsModule"),
        icon: <Settings className="h-5 w-5" />,
        items: t.raw("operationsItems") as string[],
      },
      {
        slug: "parent-portal",
        title: t("parentPortal"),
        icon: <School className="h-5 w-5" />,
        items: t.raw("parentItems") as string[],
      },
      {
        slug: "student-portal",
        title: t("studentPortal"),
        icon: <BookOpen className="h-5 w-5" />,
        items: t.raw("studentItems") as string[],
      },
      {
        slug: "analytics",
        title: t("analyticsModule"),
        icon: <BarChart3 className="h-5 w-5" />,
        items: t.raw("analyticsItems") as string[],
      },
      {
        slug: "school-websites",
        title: t("schoolWebsitesModule"),
        icon: <Globe className="h-5 w-5" />,
        items: t.raw("schoolWebsitesItems") as string[],
      },
    ],
    [t]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(scrollToHashTarget, 150);
    window.addEventListener("hashchange", scrollToHashTarget);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", scrollToHashTarget);
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-stone-600 dark:text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
            {companyIdentity.productName}
          </p>
          <h1 className="mt-5 font-display text-3xl leading-tight tracking-wide text-stone-900 dark:text-white sm:text-5xl md:text-6xl">
            {t("heroTitleLine1")}{" "}
            <span className="text-stone-600 dark:text-white/70">{t("heroTitleLine2")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-500 dark:text-white/55 sm:mt-8 sm:text-lg">
            {t("heroSubtitle", { productName: companyIdentity.productName })}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div
              key={f.slug}
              id={f.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="group scroll-mt-32 border border-stone-200 dark:border-white/10 bg-transparent p-6 transition-colors hover:border-stone-400 dark:hover:border-white/25 sm:p-8"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-white/15 text-stone-600 dark:text-white/70 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-500">
                  {f.icon}
                </div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white sm:text-xl">
                  {f.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {f.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-stone-500 dark:text-white/55">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 border border-stone-200 dark:border-white/10 px-6 py-12 text-center sm:mt-24 sm:px-12 sm:py-16"
        >
          <h2 className="font-display text-2xl tracking-wide text-stone-900 dark:text-white sm:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm uppercase tracking-[0.16em] text-stone-500 dark:text-white/50 sm:mt-6 sm:text-base">
            {t("ctaSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/get-access"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 dark:bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white dark:text-black transition-transform hover:scale-[1.02]"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 dark:border-white/35 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-900 dark:text-white transition-colors hover:border-stone-900 dark:hover:border-white hover:bg-stone-100 dark:hover:bg-white/5"
            >
              {tNav("login")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
