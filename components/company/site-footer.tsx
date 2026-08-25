"use client";

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";
import type { CompanyFooterLabels } from "@/lib/company/layout-labels";

export function SiteFooter({
  className = "",
  labels,
}: {
  className?: string;
  labels: CompanyFooterLabels;
}) {
  const legalQuickLinks = [
    { label: labels.privacy, href: "/privacy" },
    { label: labels.terms, href: "/terms" },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: companyIdentity.social.linkedin, icon: Linkedin },
  ];

  return (
    <footer
      className={`border-t border-mkt-ink/10 bg-mkt-canvas py-6 sm:py-8 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-center text-sm text-mkt-ink/45 sm:text-left">
          &copy; {new Date().getFullYear()} {companyIdentity.legalName}. {labels.copyright}{" "}
          <span className="text-mkt-ink/35">·</span>{" "}
          {companyIdentity.productName} {labels.productOf}{" "}
          <a
            href={companyIdentity.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400"
          >
            Digni Digital
          </a>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <nav
            aria-label={labels.legal}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-mkt-ink/45"
          >
            {legalQuickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-mkt-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-mkt-ink/15 text-mkt-ink/50 transition-colors hover:border-mkt-navy hover:text-mkt-navy"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
