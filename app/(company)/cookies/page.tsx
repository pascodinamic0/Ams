import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/company/legal-page";
import { companyIdentity } from "@/lib/company/identity";

export default async function CookiePolicyPage() {
  const t = await getTranslations("marketing.legal");
  const { productName } = companyIdentity;

  return (
    <LegalPage
      title={t("cookiesTitle")}
      description={t("cookiesDescription", { productName })}
      lastUpdated="June 8, 2026"
    >
      <h2>{t("cookiesH1")}</h2>
      <p>{t("cookiesP1")}</p>

      <h2>{t("cookiesH2")}</h2>
      <ul>
        <li>
          <strong>{t("cookiesEssential")}</strong> {t("cookiesEssentialBody")}
        </li>
        <li>
          <strong>{t("cookiesPreference")}</strong> {t("cookiesPreferenceBody")}
        </li>
        <li>
          <strong>{t("cookiesAnalytics")}</strong> {t("cookiesAnalyticsBody")}
        </li>
      </ul>

      <h2>{t("cookiesH3")}</h2>
      <p>{t("cookiesP3")}</p>

      <h2>{t("cookiesH4")}</h2>
      <p>{t("cookiesP4", { productName })}</p>

      <h2>{t("cookiesH5")}</h2>
      <p>{t("cookiesP5")}</p>

      <h2>{t("cookiesH6")}</h2>
      <p>
        {t("cookiesP6", { email: companyIdentity.contact.privacyEmail })}
      </p>
    </LegalPage>
  );
}
