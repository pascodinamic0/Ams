import Link from "next/link";
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { companyIdentity } from "@/lib/company/identity";
import { getTranslations } from "next-intl/server";

const { office, contact } = companyIdentity;

export default async function ContactPage() {
  const t = await getTranslations("marketing.contact");

  const channels = [
    {
      icon: Mail,
      title: t("generalEnquiries"),
      detail: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: MessageSquare,
      title: t("whatsappSupport"),
      detail: contact.phoneDisplay,
      href: contact.whatsappUrl,
    },
    {
      icon: Mail,
      title: t("technicalSupport"),
      detail: contact.supportEmail,
      href: `mailto:${contact.supportEmail}`,
    },
    {
      icon: Clock,
      title: t("supportHours"),
      detail: office.supportHours,
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-black pb-24 pt-[calc(env(safe-area-inset-top)+7.5rem)] sm:pt-40 md:pt-44 lg:pt-48">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          {companyIdentity.origin}
        </p>
        <h1 className="mt-5 font-display text-3xl tracking-tight text-white md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/55 sm:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-10 border border-white/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-amber-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">{office.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/50">
                {office.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-white/35">
                {office.timezone}
              </p>
              <a
                href={`tel:${contact.phone}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
              >
                <Phone className="h-4 w-4" />
                {contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {channels.map(({ icon: Icon, title, detail, href }) => (
            <div
              key={title}
              className="flex items-start gap-4 border border-white/10 p-5 transition-colors hover:border-white/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">{title}</p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-1 text-sm text-amber-500 transition-colors hover:text-amber-400"
                  >
                    {detail}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-white/50">{detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/40">
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
    </div>
  );
}
