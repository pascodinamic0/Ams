import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getClasses, getSections } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { ClassForm } from "./class-form";
import { DeleteClassButton } from "./delete-button";

export default async function ClassesPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const [classes, sections] = await Promise.all([
    branchId ? getClasses(branchId) : getClasses(),
    branchId ? getSections(branchId) : getSections(),
  ]);
  const tableData = classes.map((row) => ({
    ...row,
    actions: <DeleteClassButton id={row.id as string} name={String(row.name)} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("classesTitle")}</h1>
      {branchId ? (
        <ClassForm branchId={branchId} sections={sections.map((s) => ({ id: s.id, name: s.name }))} />
      ) : (
        <p className="text-sm text-stone-500">{t("linkSchoolForClasses")}</p>
      )}
      {classes.length === 0 ? (
        <EmptyState title={t("noClassesYet")} description={t("createFirstClass")} />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: tc("name"), accessorKey: "name", sortable: true },
            { id: "grade", header: t("grade"), accessorKey: "grade" },
            { id: "section", header: t("sectionsTitle"), accessorKey: "section_name" },
            { id: "capacity", header: t("capacity"), accessorKey: "capacity" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
