"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";

const { office, contact } = companyIdentity;

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  office.addressFormatted
)}`;

function supportIsOpenNow(now = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Kinshasa",
    weekday: "short",
  }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Kinshasa",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now)
  );
  const isWeekday = weekday !== "Sat" && weekday !== "Sun";

  return isWeekday && hour >= 8 && hour < 18;
}

export function ContactPage() {
  const t = useTranslations("marketing.contact");
  const [officeOpen, setOfficeOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setOfficeOpen(supportIsOpenNow());
  }, []);

  return (
    <div className="bg-mkt-canvas">
      <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
        <Image
          src="/images/blog/kinshasa-local-support.jpg"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] brightness-75 contrast-110"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-mkt-navy via-mkt-navy/55 to-mkt-navy/25"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 top-1/4 hidden select-none font-display text-[18vw] leading-none tracking-tight text-white/[0.06] lg:block">
          KINSHASA
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              {companyIdentity.origin}
            </p>
            <h1 className="mt-5 font-display text-[2rem] leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4rem]">
              <span className="block">{t("heroTitleLine1")}</span>
              <span className="mt-1 block text-white/70">{t("heroTitleLine2")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:mt-6 sm:text-lg">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("heroCtaPrimary")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/5"
              >
                {t("heroCtaSecondary")}
              </a>
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              {office.label} / {office.timezone}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-mkt-ink/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {t("pathsEyebrow")}
          </p>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-mkt-ink sm:text-4xl">
            {t("pathsTitle")}
          </h2>

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col border border-mkt-ink/10 p-6 sm:p-8"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mkt-ink/35">
                01
              </p>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-mkt-ink sm:text-3xl">
                {t("newSchoolTitle")}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mkt-ink/55 sm:text-base">
                {t("newSchoolBody")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-mkt-inverse px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-mkt-inverse-ink transition-transform hover:scale-[1.02]"
                >
                  {t("newSchoolCta")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  href="/get-access"
                  className="inline-flex items-center justify-center rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
                >
                  {t("newSchoolSecondary")}
                </Link>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="flex flex-col border border-mkt-ink/10 p-6 sm:p-8"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mkt-ink/35">
                02
              </p>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-mkt-ink sm:text-3xl">
                {t("existingTitle")}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mkt-ink/55 sm:text-base">
                {t("existingBody")}
              </p>
              <div className="mt-8">
                <a
                  href={`mailto:${contact.supportEmail}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-mkt-ink/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mkt-ink transition-colors hover:border-mkt-ink hover:bg-mkt-ink/5"
                >
                  {t("existingCta")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="border-t border-mkt-ink/10 pb-24 pt-16 sm:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
              {t("officeEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-2xl tracking-tight text-mkt-ink sm:text-4xl">
              {t("officeTitle")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mkt-ink/55 sm:text-base">
              {t("officeBody")}
            </p>
          </div>

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            <div className="relative min-h-[28rem] overflow-hidden border border-mkt-ink/10">
              <Image
                src="/images/blog/kinshasa-private-school-city.jpg"
                alt={t("cityImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-75 contrast-110"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-amber-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <p className="font-display text-2xl tracking-tight text-white">
                  {office.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {office.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-500 hover:text-amber-400"
                >
                  {t("officeMap")}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between border border-amber-500/40 bg-amber-500/5 p-6 transition-colors hover:border-amber-500/70 sm:col-span-2 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 text-amber-500">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-amber-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="mt-6">
                  <p className="font-semibold text-mkt-ink">{t("whatsappSupport")}</p>
                  <p className="mt-1 text-sm text-amber-500">{contact.phoneDisplay}</p>
                  <p className="mt-2 text-xs text-mkt-ink/45">{t("whatsappHint")}</p>
                </div>
              </a>

              <a
                href={`mailto:${contact.email}`}
                className="group flex flex-col justify-between border border-mkt-ink/10 p-5 transition-colors hover:border-mkt-ink/25 sm:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-mkt-ink/15 text-mkt-ink/60 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="mt-5">
                  <p className="font-semibold text-mkt-ink">{t("generalEnquiries")}</p>
                  <p className="mt-1 break-all text-sm text-mkt-ink/50">{contact.email}</p>
                </div>
              </a>

              <a
                href={`mailto:${contact.supportEmail}`}
                className="group flex flex-col justify-between border border-mkt-ink/10 p-5 transition-colors hover:border-mkt-ink/25 sm:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-mkt-ink/15 text-mkt-ink/60 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="mt-5">
                  <p className="font-semibold text-mkt-ink">{t("technicalSupport")}</p>
                  <p className="mt-1 break-all text-sm text-mkt-ink/50">
                    {contact.supportEmail}
                  </p>
                </div>
              </a>

              <div className="flex flex-col justify-between border border-mkt-ink/10 p-5 sm:col-span-2 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-mkt-ink/15 text-mkt-ink/60">
                    <Clock className="h-5 w-5" />
                  </div>
                  {officeOpen !== null ? (
                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mkt-ink/50">
                      <span
                        className={
                          officeOpen
                            ? "h-1.5 w-1.5 rounded-full bg-amber-500"
                            : "h-1.5 w-1.5 rounded-full bg-mkt-ink/25"
                        }
                        aria-hidden
                      />
                      {officeOpen ? t("openNow") : t("closedNow")}
                    </span>
                  ) : null}
                </div>
                <div className="mt-5">
                  <p className="font-semibold text-mkt-ink">{t("supportHours")}</p>
                  <p className="mt-1 text-sm text-mkt-ink/50">{office.supportHours}</p>
                  <p className="mt-2 text-xs leading-relaxed text-mkt-ink/40">
                    {t("hoursHint")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-12 text-sm text-mkt-ink/40">
            {t("legalNote")}{" "}
            <Link href="/privacy" className="font-medium text-amber-500 hover:text-amber-400">
              {t("privacyPolicy")}
            </Link>{" "}
            {t("orEmail")}{" "}
            <a
              href={`mailto:${contact.legalEmail}`}
              className="font-medium text-amber-500 hover:text-amber-400"
            >
              {contact.legalEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
