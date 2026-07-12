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
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
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
      floatingBadge: t("adminActiveUserPresence"),
      title: t("adminTitle"),
      description: t("adminDescription"),
      features: [t("adminFeature1"), t("adminFeature2"), t("adminFeature3")],
      cta: t("adminCta"),
      href: "/features#admin",
      image: "/images/role_admin.jpg",
      icon: <Users className="h-6 w-6" />,
      color: "teal"
    },
    {
      badge: t("teacherBadge"),
      floatingBadge: t("teacherActiveUserPresence"),
      title: t("teacherTitle"),
      description: t("teacherDescription"),
      features: [t("teacherFeature1"), t("teacherFeature2"), t("teacherFeature3")],
      cta: t("teacherCta"),
      href: "/features#teacher",
      image: "/images/role_teacher.jpg",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "amber"
    },
    {
      badge: t("parentBadge"),
      floatingBadge: t("parentActiveUserPresence"),
      title: t("parentTitle"),
      description: t("parentDescription"),
      features: [t("parentFeature1"), t("parentFeature2"), t("parentFeature3")],
      cta: t("parentCta"),
      href: "/features#parent",
      image: "/images/role_parent.jpg",
      icon: <Users className="h-6 w-6" />,
      color: "teal"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero — full-bleed, one composition */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-[calc(env(safe-area-inset-top)+4rem)] pb-20 md:pt-24 md:pb-24">
        <HeroVideoBackground />

        {/* Vertical social rail — desktop */}
        <aside className="pointer-events-none absolute bottom-10 left-5 z-20 hidden flex-col items-center gap-4 lg:flex xl:left-8">
          <span className="pointer-events-none rotate-180 text-[10px] font-medium uppercase tracking-[0.35em] text-white/50 [writing-mode:vertical-rl]">
            Follow
          </span>
          <span className="h-10 w-px bg-white/25" aria-hidden />
          <div className="pointer-events-auto flex flex-col items-center gap-3">
            {(
              [
                { label: "LinkedIn", href: companyIdentity.social.linkedin, icon: Linkedin },
                { label: "Facebook", href: companyIdentity.social.facebook, icon: Facebook },
                { label: "Instagram", href: companyIdentity.social.instagram, icon: Instagram },
                { label: "YouTube", href: companyIdentity.social.youtube, icon: Youtube },
              ] as const
            ).map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/60 transition-colors hover:text-white"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </aside>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/70 sm:text-[11px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              {t("heroBadge")}
            </motion.p>

            <h1 className="mt-4 font-display text-[1.75rem] leading-[1.2] text-white sm:mt-6 sm:text-4xl sm:leading-[1.15] md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              <span className="block">
                {companyIdentity.productName}
                <span className="text-amber-500">.</span>
              </span>
              <span className="mt-2 block text-[0.92em] font-bold text-white sm:mt-3">
                {t("heroTitleLine1")}
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-snug text-white/70 sm:mt-4 sm:text-lg">
              {t("heroTitleLine2")}
            </p>

            <HeroMobileSubtitle
              frags={t("heroSubtitle")}
              payoff={t("heroSubtitleMobilePayoff")}
              className="mt-4 sm:hidden"
            />

            <p className="mx-auto mt-4 hidden max-w-lg text-xs font-medium uppercase tracking-[0.2em] text-white/65 sm:mt-5 sm:block sm:text-[13px]">
              {t("heroSubtitle")}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/5 sm:px-7 sm:py-3.5 sm:text-xs"
              >
                [ {t("heroCtaSecondary")} ]
              </Link>
              <Link
                href="/get-access"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-transform hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-3.5 sm:text-xs"
              >
                {t("heroCtaPrimary")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="border-t border-white/10 bg-black py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 border border-white/10 p-4 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-amber-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{pillar.title}</p>
                    <p className="mt-1 text-sm leading-snug text-white/50">{pillar.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compact Role Cards */}
      <section className="bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-2xl text-center text-sm uppercase tracking-[0.16em] text-white/50 sm:text-base">
            {t("audienceIntro")}
          </p>
          <div className="mt-10 grid gap-3 sm:mt-12 md:grid-cols-3">
            {roles.map((role, i) => (
              <motion.div
                key={role.badge}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={role.href}
                  className="group flex h-full flex-col overflow-hidden border border-white/10 transition-colors hover:border-white/30"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={role.image}
                      alt={role.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover brightness-75 contrast-110 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                      {role.icon}
                      {role.badge}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-white sm:text-xl">{role.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                      {role.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-500 transition-all group-hover:gap-2.5">
                      {role.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="relative overflow-hidden border-t border-white/10 bg-black py-16 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-20">
            <h2 className="font-display text-2xl tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("rolesSectionTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm uppercase tracking-[0.14em] text-white/50 sm:mt-6 sm:text-base">
              {t("rolesSectionSubtitle")}
            </p>
          </div>

          <div className="space-y-16 sm:space-y-28">
            {roles.map((role, i) => (
              <motion.div
                key={role.badge}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className={cn(
                  "flex flex-col items-center gap-8 sm:gap-12 lg:gap-16",
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                <div className="relative flex-1 group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/10">
                    <Image
                      src={role.image}
                      alt={role.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover brightness-75 contrast-110 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-4 hidden items-center gap-3 border border-white/15 bg-black/90 px-4 py-3 backdrop-blur-sm sm:flex",
                      i % 2 === 0 ? "-right-4" : "-left-4"
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
                      {role.floatingBadge}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-5 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">
                    {role.icon}
                    {role.badge}
                  </div>
                  <h3 className="font-display text-2xl leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
                    {role.title}
                  </h3>
                  <p className="text-base leading-relaxed text-white/55 sm:text-lg">
                    {role.description}
                  </p>
                  <ul className="space-y-3">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-white/65">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                        <span className="text-sm font-medium sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <Link
                      href={role.href}
                      className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-500 hover:text-amber-400"
                    >
                      {role.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectivity / PWA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-black py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                <Wifi className="h-3.5 w-3.5" />
                {companyIdentity.productName}
              </div>
              <h2 className="mt-5 font-display text-2xl leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                {t("connectivityTitle")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
                {t("connectivitySubtitle")}
              </p>
              <ul className="mt-8 space-y-3">
                {connectivityFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-white/70">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/get-access"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-transform hover:scale-[1.02]"
              >
                {t("connectivityCta")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <PwaInstallShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="border-y border-white/10 bg-black py-16 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl sm:mb-14">
            <h2 className="font-display text-2xl tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("modulesSectionTitle")}
            </h2>
            <p className="mt-4 text-sm uppercase tracking-[0.14em] text-white/50 sm:mt-5 sm:text-base">
              {t("modulesSectionSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {homepageModuleGrid.map((m, idx) => {
              const Icon = m.icon;

              return (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className={m.span}
                >
                  <Link
                    href={`/modules/${m.slug}`}
                    className="group relative flex h-full flex-col border border-white/10 p-6 transition-colors hover:border-white/30 sm:p-8"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{m.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{m.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-500 opacity-0 transition-opacity group-hover:opacity-100">
                      {t("learnMore")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-black py-20 sm:py-28">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
                {t("heroBadge")}
              </p>
              <h2 className="mt-4 font-display text-3xl leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("finalCtaTitleLine1")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-snug text-white/70 sm:mt-4 sm:text-lg lg:mx-0">
                {t("finalCtaTitleLine2")}
              </p>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg lg:mx-0">
                {t("finalCtaSubtitle", { productName: companyIdentity.productName })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border border-white/10 p-8 sm:p-10"
            >
              <ul className="space-y-4">
                {[t("finalCtaHighlight1"), t("finalCtaHighlight2"), t("finalCtaHighlight3")].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-3 text-white/70">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                    </li>
                  )
                )}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-access"
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-transform hover:scale-[1.02]"
                >
                  {t("finalCtaButton")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/35 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  {t("finalCtaSecondary")}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 sm:justify-start">
                {homepageCtaSections.map((section, index) => (
                  <span key={section.slug} className="inline-flex items-center gap-5">
                    {index > 0 && (
                      <span className="hidden h-1 w-1 rounded-full bg-amber-500/60 sm:inline" aria-hidden />
                    )}
                    <Link
                      href={`/modules/${section.slug}`}
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors hover:text-white"
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
