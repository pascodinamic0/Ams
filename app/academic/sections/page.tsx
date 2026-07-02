import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getSections } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { SectionForm } from "./section-form";

export default async function SectionsPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const sections = branchId ? await getSections(branchId) : await getSections();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("sectionsTitle")}</h1>
      {branchId && <SectionForm branchId={branchId} />}
      {sections.length === 0 ? (
        <EmptyState title={t("noSectionsYet")} description={t("createSectionDesc")} />
      ) : (
        <DataTable data={sections} columns={[{ id: "name", header: tc("name"), accessorKey: "name", sortable: true }]} />
      )}
    </div>
  );
}
