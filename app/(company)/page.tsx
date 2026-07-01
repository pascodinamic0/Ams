"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { companyIdentity } from "@/lib/company/identity";
import { getHomepageCtaSections, getPlatformModules } from "@/lib/i18n/modules";

export default function Home() {
  const t = useTranslations("marketing.home");
  const tm = useTranslations("modules");

  const homepageModuleGrid = getPlatformModules(tm).filter(
    (module) => module.showOnHomepageGrid !== false
  );
  const homepageCtaSections = getHomepageCtaSections(tm);

  const roles = [
    {
      badge: t("adminBadge"),
      title: t("adminTitle"),
      description: t("adminDescription"),
      features: [t("adminFeature1"), t("adminFeature2"), t("adminFeature3")],
      cta: t("adminCta"),
      href: "/features#admin",
      image: "/images/role_admin.png",
      icon: <Users className="h-6 w-6" />,
      color: "indigo"
    },
    {
      badge: t("teacherBadge"),
      title: t("teacherTitle"),
      description: t("teacherDescription"),
      features: [t("teacherFeature1"), t("teacherFeature2"), t("teacherFeature3")],
      cta: t("teacherCta"),
      href: "/features#teacher",
      image: "/images/role_teacher.png",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "blue"
    },
    {
      badge: t("parentBadge"),
      title: t("parentTitle"),
      description: t("parentDescription"),
      features: [t("parentFeature1"), t("parentFeature2"), t("parentFeature3")],
      cta: t("parentCta"),
      href: "/features#parent",
      image: "/images/role_parent.png",
      icon: <Users className="h-6 w-6" />,
      color: "indigo"
    },
  ];

  const stats = [
    { value: "8", label: t("statsRoles") },
    { value: "76+", label: t("statsPages") },
    { value: "1", label: t("statsPlatform") },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0f1e]">
      {/* Hero Section */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-16 pb-12 sm:min-h-[90vh] sm:pt-20 sm:pb-0">
        {/* Hero background — Kenyan school administrator at work */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/role_admin.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%] opacity-90 dark:opacity-75"
          />

          <div className="absolute inset-0 bg-indigo-950/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-indigo-950/40 to-indigo-950/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/70 via-transparent to-indigo-950/50" />

          {/* Animated Glows */}
          <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px] animate-pulse sm:h-96 sm:w-96 sm:blur-[120px]" />
          <div className="absolute bottom-1/3 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse delay-700 sm:h-96 sm:w-96 sm:blur-[120px]" />

          {/* Seamless fade into the next section */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white dark:to-[#0a0f1e] sm:h-36" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl text-center sm:max-w-none"
          >
            <h1 className="text-[2.125rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-tight md:text-7xl lg:text-8xl">
              {t("heroTitleLine1")}
              <br />
              <span className="bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                {t("heroTitleLine2")}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-indigo-100/80 sm:mt-8 sm:max-w-3xl sm:text-xl sm:text-indigo-100/70">
              {t("heroSubtitle")}
              <span className="mt-1 block sm:mt-0 sm:inline">
                {" "}{t("heroSubtitleExtra")}
              </span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
              <Link
                href="/get-access"
                className="group inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-indigo-950 transition-all hover:bg-indigo-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] sm:w-auto sm:px-8 sm:py-4"
              >
                {t("heroCtaPrimary")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/features"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-indigo-400/40 bg-indigo-900/40 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-indigo-800/60 sm:w-auto sm:px-8 sm:py-4"
              >
                {t("heroCtaSecondary")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-indigo-950/50 px-3 py-6 backdrop-blur-md sm:mt-16 sm:px-6 sm:py-8">
              <div className="grid grid-cols-3 gap-3 sm:gap-8">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl font-black text-white sm:text-4xl">{s.value}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase leading-tight tracking-wide text-indigo-200/90 sm:mt-2 sm:text-sm sm:tracking-widest">
                      {s.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles Section - Visual Uplift */}
      <section className="relative overflow-hidden bg-white py-16 dark:bg-[#0a0f1e] sm:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-24">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-6xl">
              {t("rolesSectionTitle")}
            </h2>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto sm:mt-6 sm:text-xl">
              {t("rolesSectionSubtitle")}
            </p>
          </div>

          <div className="space-y-16 sm:space-y-32">
            {roles.map((role, i) => (
              <motion.div
                key={role.badge}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={cn(
                  "flex flex-col gap-8 items-center sm:gap-12 lg:gap-20",
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                {/* Visual Side */}
                <div className="flex-1 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl transition-all group-hover:blur-3xl" />
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl sm:rounded-[2rem]">
                    <Image
                      src={role.image}
                      alt={role.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Floating Elements (Decorative) — desktop only */}
                  <div className={cn(
                    "absolute -bottom-6 hidden items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-xl border border-slate-100 dark:border-slate-800 sm:flex",
                    i % 2 === 0 ? "-right-6" : "-left-6"
                  )}>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t("activeUserPresence")}</p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-5 sm:space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wide sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
                    {role.icon}
                    {role.badge}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl md:text-5xl leading-tight">
                    {role.title}
                  </h3>
                  <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                    {role.description}
                  </p>
                  <ul className="space-y-4">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link
                      href={role.href}
                      className="inline-flex items-center gap-2 text-lg font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group"
                    >
                      {role.cta}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Modules */}
      <section className="py-16 sm:py-32 bg-slate-50 dark:bg-[#060a16] border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl sm:mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
              {t("modulesSectionTitle")}
            </h2>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 sm:mt-6 sm:text-xl">
              {t("modulesSectionSubtitle")}
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {homepageModuleGrid.map((m, idx) => {
              const Icon = m.icon;

              return (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={m.span}
                >
                  <Link
                    href={`/modules/${m.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[2rem] sm:p-8"
                  >
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div>
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 transition-colors duration-300 group-hover:bg-indigo-500/10 dark:bg-slate-800">
                          <Icon className={`h-6 w-6 ${m.iconClassName}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {m.title}
                        </h3>
                        <p className="mt-4 font-medium text-slate-500 dark:text-slate-400">
                          {m.desc}
                        </p>
                      </div>
                      <div className="mt-8">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-bold text-indigo-600 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-indigo-400">
                            {t("learnMore")}
                          </span>
                          <ArrowRight className="h-4 w-4 text-indigo-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 dark:text-indigo-400" />
                        </div>
                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                          <div className="h-full w-12 rounded-full bg-indigo-500 opacity-40 transition-all duration-500 ease-out group-hover:w-full group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-500/5 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Look */}
      <section className="relative overflow-hidden bg-indigo-950 py-16 sm:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div
            className="h-full w-full"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-10"
          >
            <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl md:text-7xl">
              {t("finalCtaTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-indigo-200/80 sm:text-xl">
              {t("finalCtaSubtitle", { productName: companyIdentity.productName })}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 sm:gap-6 sm:pt-4">
              <Link
                href="/get-access"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-950 shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 sm:w-auto sm:px-10 sm:py-5 sm:text-lg"
              >
                {t("finalCtaButton")}
              </Link>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-8 text-xs font-semibold uppercase tracking-widest text-indigo-300/70 sm:mt-16 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-4 sm:pt-12 sm:text-sm">
              {homepageCtaSections.map((section, index) => (
                <span key={section.slug} className="inline-flex items-center gap-3">
                  {index > 0 && (
                    <span className="hidden text-indigo-500/40 sm:inline" aria-hidden>
                      |
                    </span>
                  )}
                  <Link
                    href={`/modules/${section.slug}`}
                    className="rounded-lg px-2 py-1 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {section.label}
                  </Link>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
