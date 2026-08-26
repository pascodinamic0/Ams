"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  Globe,
  Monitor,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { cn } from "@/lib/utils";

const OFFER_PHOTO = "/images/role_director_office.jpg";

type PillarKey =
  | "pillar1"
  | "pillar2"
  | "pillar3"
  | "pillar4"
  | "pillar5"
  | "pillar6";

const PILLAR_ICONS: Record<PillarKey, LucideIcon> = {
  pillar1: BarChart3,
  pillar2: GraduationCap,
  pillar3: Zap,
  pillar4: Wifi,
  pillar5: Monitor,
  pillar6: Globe,
};

const PILLAR_KEYS: PillarKey[] = [
  "pillar1",
  "pillar2",
  "pillar3",
  "pillar4",
  "pillar5",
  "pillar6",
];

type FutureReadyOfferProps = {
  variant?: "home" | "page";
  className?: string;
};

export function FutureReadyOffer({
  variant = "home",
  className,
}: FutureReadyOfferProps) {
  const t = useTranslations("marketing.offer");
  const reduceMotion = useReducedMotion();
  const isPage = variant === "page";

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <>
      <section
        id={variant === "home" ? "offer" : undefined}
        className={cn(
          "relative overflow-hidden",
          isPage && "pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40",
          className
        )}
      >
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={OFFER_PHOTO}
            alt=""
            fill
            sizes="100vw"
            quality={75}
            loading="lazy"
            className="object-cover object-[center_30%] brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mkt-navy via-mkt-navy/80 to-mkt-navy/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.75, ease }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              {t("eyebrow")}
            </p>

            <h2 className="mt-5 font-display text-[1.85rem] leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {t("title")}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:mt-6 sm:text-lg">
              {t("intro")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link
                href="/get-access"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mkt-navy transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-mkt-navy"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href={companyIdentity.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {t("ctaSecondary")}
              </Link>
            </div>

            {variant === "home" ? (
              <Link
                href="/offre"
                className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white"
              >
                {t("seeFullOffer")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}

            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45 sm:mt-8">
              {t("proofLine")}
            </p>

            <ul className="mt-10 flex flex-wrap gap-2 sm:mt-12 sm:gap-2.5">
              {PILLAR_KEYS.map((key, i) => {
                const Icon = PILLAR_ICONS[key];
                return (
                  <motion.li
                    key={key}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.45, ease }}
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                      <Icon
                        className="h-4 w-4 shrink-0 text-amber-500"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {t(`${key}Short`)}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </section>

      {isPage ? (
        <section className="border-t border-mkt-ink/10 bg-mkt-canvas pb-24 pt-16 sm:pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-mkt-ink/10 bg-mkt-ink/10 sm:grid-cols-2">
              {PILLAR_KEYS.map((key, i) => {
                const Icon = PILLAR_ICONS[key];
                return (
                  <motion.li
                    key={key}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease }}
                    className="flex gap-4 bg-mkt-canvas p-6 sm:p-7"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mkt-navy text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-mkt-ink">
                        {t(`${key}Title`)}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-mkt-ink/55">
                        {t(`${key}Desc`)}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
