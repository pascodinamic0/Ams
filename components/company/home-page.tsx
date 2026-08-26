"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowRight as ArrowIcon,
  Wallet,
  FileSpreadsheet,
  Clock,
  Smartphone,
  Linkedin,
  Users,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { companyIdentity } from "@/lib/company/identity";
import { HeroVideoBackground } from "@/components/company/hero-video-background";
import { HeroMobileSubtitle } from "@/components/company/hero-mobile-subtitle";
import { HeroFixesTypewriter } from "@/components/company/hero-fixes-typewriter";
import { getPlatformModules } from "@/lib/i18n/modules";

const FutureReadyOffer = dynamic(
  () =>
    import("@/components/company/future-ready-offer").then((m) => ({
      default: m.FutureReadyOffer,
    })),
  { ssr: true }
);

const PartnersRow = dynamic(
  () =>
    import("@/components/company/partners-row").then((m) => ({
      default: m.PartnersRow,
    })),
  { ssr: true }
);

const PwaInstallBand = dynamic(
  () =>
    import("@/components/pwa/pwa-install-band").then((m) => ({
      default: m.PwaInstallBand,
    })),
  { ssr: true }
);

export function HomePage() {
  const t = useTranslations("marketing.home");
  const tCommon = useTranslations("common");
  const tm = useTranslations("modules");

  const homepageModuleGrid = getPlatformModules(tm).filter(
    (module) => module.showOnHomepageGrid !== false
  );

  const heroFixes = t("heroFixesList")
    .split("|")
    .map((line) => line.trim())
    .filter(Boolean);

  const trustPillars = [
    { icon: Wallet, title: t("trustLocal"), desc: t("trustLocalDesc") },
    { icon: FileSpreadsheet, title: t("trustSimple"), desc: t("trustSimpleDesc") },
    { icon: Clock, title: t("trustSupport"), desc: t("trustSupportDesc") },
    { icon: Smartphone, title: t("trustAffordable"), desc: t("trustAffordableDesc") },
  ];

  const roles = [
    {
      badge: t("adminBadge"),
      floatingBadge: t("adminActiveUserPresence"),
      title: t("adminTitle"),
      description: t("adminDescription"),
      features: [t("adminFeature1"), t("adminFeature2"), t("adminFeature3")],
      cta: t("adminCta"),
      href: "/features#academic",
      image: "/images/role_admin.jpg",
      icon: <Users className="h-6 w-6" />,
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
    },
    {
      badge: t("parentBadge"),
      floatingBadge: t("parentActiveUserPresence"),
      title: t("parentTitle"),
      description: t("parentDescription"),
      features: [t("parentFeature1"), t("parentFeature2"), t("parentFeature3")],
      cta: t("parentCta"),
      href: "/features#parent-portal",
      image: "/images/role_parent.jpg",
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-mkt-canvas">
      {/* Hero — full-bleed, centered */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-[calc(env(safe-area-inset-top)+4rem)] pb-20 md:pt-24 md:pb-24">
        <HeroVideoBackground />

        <aside className="pointer-events-none absolute bottom-10 left-5 z-20 hidden flex-col items-center gap-4 lg:flex xl:left-8">
          <span className="pointer-events-none rotate-180 text-[10px] font-medium uppercase tracking-[0.35em] text-white/50 [writing-mode:vertical-rl]">
            {tCommon("follow")}
          </span>
          <span className="h-10 w-px bg-white/25" aria-hidden />
          <div className="pointer-events-auto flex flex-col items-center gap-3">
            {(
              [
                { label: "LinkedIn", href: companyIdentity.social.linkedin, icon: Linkedin },
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
                <span className="text-amber-500">.app</span>
              </span>
              <HeroFixesTypewriter
                fixes={heroFixes}
                className="mt-2 block text-[0.92em] font-bold text-white sm:mt-3"
              />
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
                href={companyIdentity.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
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

      {/* Trust pillars */}
      <section className="border-t border-mkt-ink/10 bg-mkt-canvas py-12 sm:py-16">
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
                  className="flex items-start gap-3 border border-mkt-ink/10 p-4 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mkt-ink/15 text-amber-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-mkt-ink">{pillar.title}</p>
                    <p className="mt-1 text-sm leading-snug text-mkt-ink/50">{pillar.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compact role cards */}
      <section className="bg-mkt-canvas py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-2xl text-center text-sm uppercase tracking-[0.16em] text-mkt-ink/50 sm:text-base">
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
                  className="group flex h-full flex-col overflow-hidden border border-mkt-ink/10 transition-colors hover:border-mkt-ink/30"
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
                    <h3 className="text-lg font-semibold text-mkt-ink sm:text-xl">{role.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-mkt-ink/50">
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

      {/* Detailed role rows */}
      <section className="relative overflow-hidden border-t border-mkt-ink/10 bg-mkt-canvas py-16 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-20">
            <h2 className="font-display text-2xl tracking-tight text-mkt-ink sm:text-4xl md:text-5xl">
              {t("rolesSectionTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm uppercase tracking-[0.14em] text-mkt-ink/50 sm:mt-6 sm:text-base">
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
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-mkt-ink/10">
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
                      "absolute -bottom-4 hidden items-center gap-3 border border-mkt-ink/15 bg-mkt-canvas/90 px-4 py-3 backdrop-blur-sm sm:flex",
                      i % 2 === 0 ? "-right-4" : "-left-4"
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mkt-ink">
                      {role.floatingBadge}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-5 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">
                    {role.icon}
                    {role.badge}
                  </div>
                  <h3 className="font-display text-2xl leading-tight tracking-tight text-mkt-ink sm:text-3xl md:text-4xl">
                    {role.title}
                  </h3>
                  <p className="text-base leading-relaxed text-mkt-ink/55 sm:text-lg">
                    {role.description}
                  </p>
                  <ul className="space-y-3">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-mkt-ink/65">
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

      {/* About */}
      <section
        id="about"
        className="scroll-mt-24 border-b border-mkt-ink/10 bg-mkt-canvas pb-16 pt-20 sm:pb-20 sm:pt-24"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl tracking-tight text-mkt-ink sm:text-3xl">
            {t("aboutTitle")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mkt-ink/60 sm:text-lg">
            {t("aboutBody")}
          </p>
        </div>
      </section>

      <FutureReadyOffer variant="home" />

      {/* Modules teaser */}
      <section className="border-t border-mkt-ink/10 bg-mkt-canvas py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-2xl tracking-tight text-mkt-ink sm:text-4xl">
              {t("modulesSectionTitle")}
            </h2>
            <p className="mt-3 text-base text-mkt-ink/55">{t("modulesSectionSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homepageModuleGrid.map((m, idx) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className={m.span}
                >
                  <Link
                    href={`/modules/${m.slug}`}
                    className="group flex h-full flex-col border border-mkt-ink/10 bg-mkt-canvas p-6 transition-colors hover:border-mkt-navy/30 dark:hover:border-mkt-ink/30 sm:p-7"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-mkt-navy text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-mkt-ink">{m.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-mkt-ink/50">
                      {m.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
                      {t("learnMore")}
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-sm font-semibold text-mkt-navy hover:text-amber-600"
            >
              {t("allFeatures")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PartnersRow />
      <PwaInstallBand />
    </div>
  );
}
