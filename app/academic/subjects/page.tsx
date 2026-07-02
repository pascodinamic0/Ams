import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getSubjects } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { SubjectForm } from "./subject-form";

export default async function SubjectsPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const subjects = branchId ? await getSubjects(branchId) : await getSubjects();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("subjectsTitle")}</h1>
      {branchId && <SubjectForm branchId={branchId} />}
      {subjects.length === 0 ? (
        <EmptyState title={t("noSubjectsYet")} description={t("addSubjectsDesc")} />
      ) : (
        <DataTable data={subjects} columns={[{ id: "name", header: tc("name"), accessorKey: "name", sortable: true }]} />
      )}
    </div>
  );
}
