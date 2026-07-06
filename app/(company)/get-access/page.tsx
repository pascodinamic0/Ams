import { getTranslations } from "next-intl/server";
import { GetAccessPageClient } from "@/components/company/get-access-page-client";
import { companyIdentity } from "@/lib/company/identity";

export default async function GetAccessPage() {
  const t = await getTranslations("marketing.getAccess");

  const copy = {
    heroBadge: t("heroBadge"),
    heroTitle: t("heroTitle"),
    heroTitleHighlight: t("heroTitleHighlight", {
      productName: companyIdentity.productName,
    }),
    heroSubtitle: t("heroSubtitle", { productName: companyIdentity.productName }),
    createSchoolAccount: t("createSchoolAccount"),
    alreadyHaveAccount: t("alreadyHaveAccount"),
    journeyTitle: t("journeyTitle"),
    journeySubtitle: t("journeySubtitle"),
    stepLabels: ["01", "02", "03", "04"].map((number) => t("stepLabel", { number })),
    step1Title: t("step1Title"),
    step1Desc: t("step1Desc"),
    step2Title: t("step2Title"),
    step2Desc: t("step2Desc"),
    step3Title: t("step3Title"),
    step3Desc: t("step3Desc"),
    step4Title: t("step4Title"),
    step4Desc: t("step4Desc"),
    includedTitle: t("includedTitle"),
    includedSubtitle: t("includedSubtitle"),
    included: [
      t("included1"),
      t("included2"),
      t("included3"),
      t("included4"),
      t("included5"),
      t("included6"),
      t("included7"),
      t("included8"),
    ],
    createMySchoolAccount: t("createMySchoolAccount"),
    joinRevolution: t("joinRevolution"),
  };

  return <GetAccessPageClient copy={copy} />;
}
