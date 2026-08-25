"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowRight as ArrowIcon,
  Wallet,
  FileSpreadsheet,
  Clock,
  Smartphone,
  Linkedin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { HeroVideoBackground } from "@/components/company/hero-video-background";
import { HeroMobileSubtitle } from "@/components/company/hero-mobile-subtitle";
import { HeroFixesTypewriter } from "@/components/company/hero-fixes-typewriter";
import { FutureReadyOffer } from "@/components/company/future-ready-offer";
import { PartnersRow } from "@/components/company/partners-row";
import { PwaInstallBand } from "@/components/pwa/pwa-install-band";
import { getPlatformModules } from "@/lib/i18n/modules";

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
