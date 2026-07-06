import { getTranslations } from "next-intl/server";
import { CompanyLayoutShell } from "@/components/company/company-layout-shell";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("marketing.nav");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("marketing.footer");

  return (
    <CompanyLayoutShell
      labels={{
        menu: tCommon("menu"),
        openMenu: tCommon("openMenu"),
        closeMenu: tCommon("closeMenu"),
        home: t("home"),
        features: t("features"),
        getAccess: t("getAccess"),
        contact: t("contact"),
        login: t("login"),
        getStarted: t("getStarted"),
      }}
      footerLabels={{
        taglineSuffix: tFooter("taglineSuffix"),
        platform: tFooter("platform"),
        legal: tFooter("legal"),
        support: tFooter("support"),
        features: t("features"),
        getAccess: t("getAccess"),
        login: t("login"),
        register: t("register"),
        privacyPolicy: tFooter("privacyPolicy"),
        termsOfService: tFooter("termsOfService"),
        cookiePolicy: tFooter("cookiePolicy"),
        documentation: tFooter("documentation"),
        contact: tFooter("contact"),
        forgotPassword: tFooter("forgotPassword"),
        copyright: tFooter("copyright"),
        productOf: tFooter("productOf"),
        privacy: tFooter("privacy"),
        terms: tFooter("terms"),
        cookies: tFooter("cookies"),
        allSystemsOperational: tFooter("allSystemsOperational"),
      }}
    >
      {children}
    </CompanyLayoutShell>
  );
}
