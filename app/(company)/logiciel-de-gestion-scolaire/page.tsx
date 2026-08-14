import type { Metadata } from "next";
import { MoneyPage } from "@/components/company/money-page";
import { JsonLdScript } from "@/components/company/json-ld-script";
import { companyIdentity } from "@/lib/company/identity";
import { logicielGestionScolaireFr } from "@/lib/company/money-page-content";
import { buildPageMetadata } from "@/lib/company/page-metadata";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/company/seo";

const content = logicielGestionScolaireFr;

export const metadata: Metadata = buildPageMetadata({
  title: `${content.title} | ${companyIdentity.productName}`,
  description: content.metaDescription,
  path: content.path,
});

export default function LogicielDeGestionScolairePage() {
  return (
    <>
      <JsonLdScript
        data={[
          webPageJsonLd({
            name: content.title,
            description: content.metaDescription,
            path: content.path,
          }),
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: content.title, path: content.path },
          ]),
        ]}
      />
      <MoneyPage content={content} />
    </>
  );
}
