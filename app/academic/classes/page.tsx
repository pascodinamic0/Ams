import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getClasses } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { ClassCapacityEditor } from "./class-capacity-editor";
import { ClassForm } from "./class-form";
import { DeleteClassButton } from "./delete-button";

export default async function ClassesPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const classes = branchId ? await getClasses(branchId) : await getClasses();
  const tableData = classes.map((row) => ({
    ...row,
    enrollment: (
      <ClassCapacityEditor
        key={`${row.id}-${row.capacity ?? "none"}`}
        id={row.id}
        studentCount={row.student_count}
        capacity={row.capacity}
      />
    ),
    actions: <DeleteClassButton id={row.id} name={row.name} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("classesTitle")}</h1>
      {branchId ? (
        <ClassForm branchId={branchId} />
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
            { id: "enrollment", header: t("capacity"), accessorKey: "enrollment" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
