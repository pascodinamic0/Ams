import { HomePage } from "@/components/company/home-page";
import { JsonLdScript } from "@/components/company/json-ld-script";
import { organizationJsonLd, softwareApplicationJsonLd } from "@/lib/company/seo";

export default function Home() {
  return (
    <>
      <JsonLdScript data={[organizationJsonLd(), softwareApplicationJsonLd()]} />
      <HomePage />
    </>
  );
}
