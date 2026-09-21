import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PayIndexPage() {
  const t = await getTranslations("pay");
  return <EmptyState title={t("invalidLink")} description={t("invalidLinkDesc")} />;
}
