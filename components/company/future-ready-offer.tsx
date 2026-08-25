"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  GraduationCap,
  Zap,
  Wifi,
  Monitor,
  Globe,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { cn } from "@/lib/utils";

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
  const showDescriptions = variant === "page";
  const showCtas = variant === "page";

  return (
    <section
      className={cn(
        "bg-mkt-canvas py-16 sm:py-24",
        variant === "page" && "pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl tracking-tight text-mkt-ink sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mkt-ink/60 sm:text-lg">
              {t("intro")}
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {PILLAR_KEYS.map((key, i) => {
                const Icon = PILLAR_ICONS[key];
                return (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mkt-navy text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-mkt-ink">{t(`${key}Title`)}</p>
                      {showDescriptions ? (
                        <p className="mt-1 text-sm leading-snug text-mkt-ink/55">
                          {t(`${key}Desc`)}
                        </p>
                      ) : null}
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            {showCtas ? (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-access"
                  className="inline-flex items-center justify-center rounded-full bg-mkt-navy px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.02]"
                >
                  {t("ctaPrimary")}
                </Link>
                <Link
                  href={companyIdentity.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-mkt-navy/30 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-navy transition-colors hover:border-mkt-navy hover:bg-mkt-navy/5"
                >
                  {t("ctaSecondary")}
                </Link>
              </div>
            ) : (
              <Link
                href="/offre"
                className="mt-8 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600 hover:text-amber-500"
              >
                {t("seeFullOffer")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto flex w-full max-w-sm justify-center lg:max-w-none"
          >
            <div
              className="relative flex aspect-square w-full max-w-[22rem] flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--color-mkt-navy-light),var(--color-mkt-navy))] p-8 shadow-xl shadow-mkt-navy/20 sm:max-w-[24rem] sm:p-10"
              aria-hidden
            >
              <ul className="space-y-5 text-white">
                {PILLAR_KEYS.map((key) => {
                  const Icon = PILLAR_ICONS[key];
                  return (
                    <li key={key} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.5} />
                      <span className="text-sm font-medium sm:text-base">
                        {t(`${key}Short`)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
