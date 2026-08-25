import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FutureReadyOffer } from "@/components/company/future-ready-offer";
import { JsonLdScript } from "@/components/company/json-ld-script";
import { organizationJsonLd } from "@/lib/company/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.offer");
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default function OffrePage() {
  return (
    <>
      <JsonLdScript data={organizationJsonLd()} />
      <FutureReadyOffer variant="page" />
    </>
  );
}
