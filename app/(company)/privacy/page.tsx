import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/company/legal-page";
import { companyIdentity } from "@/lib/company/identity";

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("marketing.legal");
  const { productName } = companyIdentity;
  const privacyEmail = companyIdentity.contact.privacyEmail;

  return (
    <LegalPage
      title={t("privacyTitle")}
      description={t("privacyDescription", { productName })}
      lastUpdated="June 8, 2026"
    >
      <h2>{t("privacyH1")}</h2>
      <p>
        {t("privacyP1", {
          legalName: companyIdentity.legalName,
          productName,
          office: companyIdentity.office.label,
        })}
      </p>

      <h2>{t("privacyH2")}</h2>
      <ul>
        <li>
          <strong>{t("privacyAccount")}</strong> {t("privacyAccountBody")}
        </li>
        <li>
          <strong>{t("privacySchool")}</strong> {t("privacySchoolBody")}
        </li>
        <li>
          <strong>{t("privacyUsage")}</strong> {t("privacyUsageBody")}
        </li>
        <li>
          <strong>{t("privacyComms")}</strong> {t("privacyCommsBody", { productName })}
        </li>
      </ul>

      <h2>{t("privacyH3")}</h2>
      <p>{t("privacyUseIntro")}</p>
      <ul>
        <li>{t("privacyUse1", { productName })}</li>
        <li>{t("privacyUse2")}</li>
        <li>{t("privacyUse3")}</li>
        <li>{t("privacyUse4")}</li>
        <li>{t("privacyUse5")}</li>
      </ul>

      <h2>{t("privacyH4")}</h2>
      <p>{t("privacyP4")}</p>

      <h2>{t("privacyH5")}</h2>
      <p>{t("privacyP5")}</p>

      <h2>{t("privacyH6")}</h2>
      <p>
        {t("privacyP6", { email: privacyEmail })}
      </p>

      <h2>{t("privacyH7")}</h2>
      <p>
        {t("privacyP7", { email: privacyEmail })}{" "}
        <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
      </p>
    </LegalPage>
  );
}
