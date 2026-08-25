"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { companyPartners } from "@/lib/company/partners";

export function PartnersRow() {
  const t = useTranslations("marketing.partners");

  if (companyPartners.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-mkt-ink/10 bg-mkt-canvas py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-xl tracking-tight text-mkt-ink sm:text-2xl">
          {t("title")}
        </h2>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
          {companyPartners.map((partner) => {
            const logo = (
              <Image
                src={partner.logoSrc}
                alt={partner.name}
                width={140}
                height={48}
                className="h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-12"
              />
            );

            return (
              <li key={partner.name}>
                {partner.href ? (
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
