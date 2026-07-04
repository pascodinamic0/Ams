"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  HeadphonesIcon,
  Wallet,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { companyIdentity } from "@/lib/company/identity";
import { HeroVideoBackground } from "@/components/company/hero-video-background";
import { HeroMobileSubtitle } from "@/components/company/hero-mobile-subtitle";
import { PwaInstallShowcase } from "@/components/pwa/pwa-install-showcase";
import { getHomepageCtaSections, getPlatformModules } from "@/lib/i18n/modules";

export function HomePage() {
  const t = useTranslations("marketing.home");
  const tm = useTranslations("modules");

  const homepageModuleGrid = getPlatformModules(tm).filter(
    (module) => module.showOnHomepageGrid !== false
  );
  const homepageCtaSections = getHomepageCtaSections(tm);

  const trustPillars = [
    { icon: MapPin, title: t("trustLocal"), desc: t("trustLocalDesc") },
    { icon: Sparkles, title: t("trustSimple"), desc: t("trustSimpleDesc") },
    { icon: HeadphonesIcon, title: t("trustSupport"), desc: t("trustSupportDesc") },
    { icon: Wallet, title: t("trustAffordable"), desc: t("trustAffordableDesc") },
  ];

  const connectivityFeatures = [
    t("connectivityFeature1"),
    t("connectivityFeature2"),
    t("connectivityFeature3"),
  ];

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
      color: "teal"
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
      color: "amber"
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
      color: "teal"
    },
  ];

  const stats = [
    { value: "8", label: t("statsRoles") },
    { value: "76+", label: t("statsPages") },
    { value: "1", label: t("statsPlatform") },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0c1222]">
      {/* Hero Section */}
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-24 sm:min-h-[90vh] sm:pb-28 md:pt-28 md:pb-32 lg:pt-32">
        <HeroVideoBackground />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl text-center sm:max-w-none"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-teal-100 backdrop-blur-sm sm:text-sm"
            >
              {t("heroBadge")}
            </motion.span>
            <h1 className="mt-6 text-[2.125rem] font-extrabold leading-[1.08] tracking-tight text-white sm:mt-8 sm:text-5xl sm:leading-tight md:text-7xl lg:text-8xl">
              {t("heroTitleLine1")}
              <br />
              <span className="bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 bg-clip-text text-transparent">
                {t("heroTitleLine2")}
              </span>
            </h1>
            <HeroMobileSubtitle
              frags={t("heroSubtitle")}
              payoff={t("heroSubtitleMobilePayoff")}
              className="mt-5 sm:hidden"
            />
            <p className="mx-auto mt-5 hidden max-w-xl text-base leading-relaxed text-teal-100/80 sm:mt-8 sm:block sm:max-w-3xl sm:text-xl sm:text-teal-100/70">
              <span className="block">{t("heroSubtitle")}</span>
              <span className="mt-2 block">{t("heroSubtitleBody")}</span>
              <span className="mt-2 block text-teal-100/70">{t("heroSubtitleExtra")}</span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
              <Link
                href="/get-access"
                className="group inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-teal-950 transition-all hover:bg-primary-light hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] sm:w-auto sm:px-8 sm:py-4"
              >
                {t("heroCtaPrimary")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-primary-400/40 bg-teal-900/40 px-6 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-teal-800/60 sm:w-auto sm:px-8 sm:py-4"
              >
                {t("heroCtaSecondary")}
              </Link>
            </div>

            {/* Stats */}
            <div className="relative z-10 mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-teal-950/70 px-3 py-6 shadow-lg shadow-teal-950/30 backdrop-blur-md sm:mt-16 sm:px-6 sm:py-8">
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
                    <p className="mt-1 text-[10px] font-medium uppercase leading-tight tracking-wide text-teal-200/90 sm:mt-2 sm:text-sm sm:tracking-widest">
                      {s.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Pillars — local differentiators vs enterprise competitors */}
      <section className="bg-white py-10 dark:bg-[#0c1222] sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-950/5 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-2 sm:gap-6 sm:rounded-3xl sm:p-6 lg:grid-cols-4">
            {trustPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 rounded-2xl p-3 sm:p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary dark:bg-primary-light/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">{pillar.title}</p>
                    <p className="mt-0.5 text-sm leading-snug text-stone-500 dark:text-stone-400">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compact Role Cards — Schoolap-style quick scan */}
      <section className="bg-white py-16 dark:bg-[#0c1222] sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-2xl text-center text-lg text-stone-500 dark:text-stone-400 sm:text-xl">
            {t("audienceIntro")}
          </p>
          <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-3">
            {roles.map((role, i) => (
              <motion.div
                key={role.badge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={role.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900/50 sm:rounded-3xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={role.image}
                      alt={role.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                      {role.icon}
                      {role.badge}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white sm:text-xl">
                      {role.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                      {role.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
                      {role.cta}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section - Visual Uplift */}
      <section className="relative overflow-hidden bg-white py-16 dark:bg-[#0c1222] sm:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-24">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl md:text-6xl">
              {t("rolesSectionTitle")}
            </h2>
            <p className="mt-4 text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto sm:mt-6 sm:text-xl">
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
                  <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-teal-500/20 rounded-[2.5rem] blur-2xl transition-all group-hover:blur-3xl" />
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl sm:rounded-[2rem]">
                    <Image
                      src={role.image}
                      alt={role.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Floating Elements (Decorative) — desktop only */}
                  <div className={cn(
                    "absolute -bottom-6 hidden items-center gap-3 rounded-2xl bg-white dark:bg-stone-900 p-4 shadow-xl border border-stone-100 dark:border-stone-800 sm:flex",
                    i % 2 === 0 ? "-right-6" : "-left-6"
                  )}>
                    <div className="h-10 w-10 rounded-full bg-primary-light dark:bg-primary-light/50 flex items-center justify-center text-primary dark:text-primary">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-stone-900 dark:text-white">{t("activeUserPresence")}</p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-5 sm:space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary-light dark:bg-primary-light/40 px-3 py-1.5 text-primary dark:text-primary font-bold text-xs tracking-wide sm:gap-3 sm:px-4 sm:py-2 sm:text-sm">
                    {role.icon}
                    {role.badge}
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 dark:text-white sm:text-3xl md:text-5xl leading-tight">
                    {role.title}
                  </h3>
                  <p className="text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:text-lg">
                    {role.description}
                  </p>
                  <ul className="space-y-4">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link
                      href={role.href}
                      className="inline-flex items-center gap-2 text-lg font-bold text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary group"
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

      {/* Connectivity / PWA — inspired by Schoolap offline messaging, our own angle */}
      <section className="relative overflow-hidden bg-teal-950 py-16 dark:bg-[#071018] sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-800/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-900/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-200">
                <Wifi className="h-3.5 w-3.5" />
                {companyIdentity.productName}
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
                {t("connectivityTitle")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-teal-100/70 sm:text-lg">
                {t("connectivitySubtitle")}
              </p>
              <ul className="mt-8 space-y-4">
                {connectivityFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-teal-50">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/get-access"
                className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-teal-950 transition-all hover:bg-teal-50"
              >
                {t("connectivityCta")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <PwaInstallShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Modules */}
      <section className="py-16 sm:py-32 bg-stone-50 dark:bg-[#0c1222] border-y border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl sm:mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl md:text-5xl">
              {t("modulesSectionTitle")}
            </h2>
            <p className="mt-4 text-base text-stone-500 dark:text-stone-400 sm:mt-6 sm:text-xl">
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
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-2xl dark:border-stone-800 dark:bg-stone-900 sm:rounded-[2rem] sm:p-8"
                  >
                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div>
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 transition-colors duration-300 group-hover:bg-primary/10 dark:bg-stone-800">
                          <Icon className={`h-6 w-6 ${m.iconClassName}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                          {m.title}
                        </h3>
                        <p className="mt-4 font-medium text-stone-500 dark:text-stone-400">
                          {m.desc}
                        </p>
                      </div>
                      <div className="mt-8">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-bold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-primary">
                            {t("learnMore")}
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 dark:text-primary" />
                        </div>
                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-stone-200/80 dark:bg-stone-700/80">
                          <div className="h-full w-12 rounded-full bg-primary opacity-40 transition-all duration-500 ease-out group-hover:w-full group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-white py-20 dark:bg-[#0c1222] sm:py-28 lg:py-32">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary dark:text-primary">
                {t("heroBadge")}
              </p>
              <h2 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight text-stone-900 dark:text-white sm:text-5xl lg:text-6xl">
                {t("finalCtaTitleLine1")}
                <span className="mt-1 block text-primary dark:text-primary sm:mt-2">
                  {t("finalCtaTitleLine2")}
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:text-lg lg:mx-0">
                {t("finalCtaSubtitle", { productName: companyIdentity.productName })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl bg-primary p-8 shadow-2xl shadow-primary/25 sm:rounded-[2rem] sm:p-10 lg:p-12"
            >
              <ul className="space-y-4">
                {[t("finalCtaHighlight1"), t("finalCtaHighlight2"), t("finalCtaHighlight3")].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-teal-50">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
                    <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-access"
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-bold text-primary-hover transition-all hover:bg-primary-light"
                >
                  {t("finalCtaButton")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border-2 border-primary-400/60 px-6 py-4 text-base font-bold text-white transition-all hover:bg-white/10"
                >
                  {t("finalCtaSecondary")}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-primary-500/40 pt-6 sm:justify-start">
                {homepageCtaSections.map((section, index) => (
                  <span key={section.slug} className="inline-flex items-center gap-5">
                    {index > 0 && (
                      <span className="hidden h-1 w-1 rounded-full bg-primary/60 sm:inline" aria-hidden />
                    )}
                    <Link
                      href={`/modules/${section.slug}`}
                      className="text-sm font-semibold text-teal-100/90 transition-colors hover:text-white"
                    >
                      {section.label}
                    </Link>
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
