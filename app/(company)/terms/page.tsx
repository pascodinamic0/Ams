import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/company/legal-page";
import { companyIdentity } from "@/lib/company/identity";

export default async function TermsOfServicePage() {
  const t = await getTranslations("marketing.legal");
  const { productName } = companyIdentity;

  return (
    <LegalPage
      title={t("termsTitle")}
      description={t("termsDescription", { productName })}
      lastUpdated="June 8, 2026"
    >
      <h2>{t("termsH1")}</h2>
      <p>{t("termsP1", { productName })}</p>

      <h2>{t("termsH2")}</h2>
      <p>{t("termsP2", { productName })}</p>

      <h2>{t("termsH3")}</h2>
      <ul>
        <li>{t("termsLi1")}</li>
        <li>{t("termsLi2")}</li>
        <li>{t("termsLi3", { productName })}</li>
        <li>{t("termsLi4")}</li>
      </ul>

      <h2>{t("termsH4")}</h2>
      <p>{t("termsP4", { productName })}</p>

      <h2>{t("termsH5")}</h2>
      <p>{t("termsP5")}</p>

      <h2>{t("termsH6")}</h2>
      <p>{t("termsP6")}</p>

      <h2>{t("termsH7")}</h2>
      <p>{t("termsP7", { productName })}</p>

      <h2>{t("termsH8")}</h2>
      <p>{t("termsP8")}</p>

      <h2>{t("termsH9")}</h2>
      <p>{t("termsP9", { city: companyIdentity.office.city })}</p>

      <h2>{t("termsH10")}</h2>
      <p>
        {t("termsP10", {
          email: companyIdentity.contact.legalEmail,
          address: companyIdentity.office.addressFormatted,
        })}
      </p>
    </LegalPage>
  );
}
