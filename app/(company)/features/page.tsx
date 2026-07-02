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
  Check
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
        icon: <Building2 className="h-6 w-6" />,
        items: t.raw("platformAdminItems") as string[],
      },
      {
        slug: "academic",
        title: t("academicModule"),
        icon: <GraduationCap className="h-6 w-6" />,
        items: t.raw("academicItems") as string[],
      },
      {
        slug: "teacher",
        title: t("teacherModule"),
        icon: <Users className="h-6 w-6" />,
        items: t.raw("teacherItems") as string[],
      },
      {
        slug: "finance",
        title: t("financeModule"),
        icon: <Wallet className="h-6 w-6" />,
        items: t.raw("financeItems") as string[],
      },
      {
        slug: "operations",
        title: t("operationsModule"),
        icon: <Settings className="h-6 w-6" />,
        items: t.raw("operationsItems") as string[],
      },
      {
        slug: "parent-portal",
        title: t("parentPortal"),
        icon: <School className="h-6 w-6" />,
        items: t.raw("parentItems") as string[],
      },
      {
        slug: "student-portal",
        title: t("studentPortal"),
        icon: <BookOpen className="h-6 w-6" />,
        items: t.raw("studentItems") as string[],
      },
      {
        slug: "analytics",
        title: t("analyticsModule"),
        icon: <BarChart3 className="h-6 w-6" />,
        items: t.raw("analyticsItems") as string[],
      },
      {
        slug: "school-websites",
        title: t("schoolWebsitesModule"),
        icon: <Globe className="h-6 w-6" />,
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
    <div className="min-h-screen bg-white pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] dark:bg-[#0c1222] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-white md:text-6xl">
            {t("heroTitleLine1")} <br />
            <span className="text-primary dark:text-primary">{t("heroTitleLine2")}</span>
          </h1>
          <p className="mt-8 text-xl text-stone-500 dark:text-stone-400 leading-relaxed">
            {t("heroSubtitle", { productName: companyIdentity.productName })}
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div
              key={f.slug}
              id={f.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group relative scroll-mt-32 rounded-3xl border border-stone-200 bg-white p-8 transition-all hover:shadow-2xl hover:border-primary-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-stone-600 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-stone-800 dark:text-stone-400">
                  {f.icon}
                </div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
                  {f.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {f.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-base text-stone-600 dark:text-stone-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Check className="h-5 w-5 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 rounded-[3rem] bg-primary p-12 lg:p-20 text-center text-white"
        >
          <h2 className="text-3xl font-bold md:text-5xl">{t("ctaTitle")}</h2>
          <p className="mt-6 text-xl text-teal-100 max-w-2xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link
              href="/get-access"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-teal-900 transition-all hover:scale-105"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border-2 border-primary-400 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
            >
              {tNav("login")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
