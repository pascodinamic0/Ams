import { getTranslations } from "next-intl/server";
import { ContactPage } from "@/components/company/contact-page";
import { JsonLdScript } from "@/components/company/json-ld-script";
import { companyIdentity } from "@/lib/company/identity";
import { buildPageMetadata } from "@/lib/company/page-metadata";
import { organizationJsonLd, webPageJsonLd } from "@/lib/company/seo";

export async function generateMetadata() {
  const t = await getTranslations("marketing.contact");

  return buildPageMetadata({
    title: `${t("title")} | ${companyIdentity.productName}`,
    description: t("subtitle"),
    path: "/contact",
    images: ["/images/blog/kinshasa-local-support.jpg"],
  });
}

export default async function ContactRoute() {
  const t = await getTranslations("marketing.contact");

  return (
    <>
      <JsonLdScript
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: t("title"),
            description: t("subtitle"),
            path: "/contact",
          }),
        ]}
      />
      <ContactPage />
    </>
  );
}
