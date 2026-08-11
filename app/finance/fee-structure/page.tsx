import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeeStructures, getClasses, getSchoolCampusId } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatSchoolYear } from "@/lib/academic/school-year";
import { FeeStructureForm } from "./fee-structure-form";
import { DeleteFeeStructureButton } from "./delete-button";

export default async function FeeStructurePage() {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? "";
  const campusId = schoolId ? await getSchoolCampusId(schoolId) : null;

  const [structures, classes] = schoolId
    ? await Promise.all([
        getFeeStructures({ schoolId }),
        getClasses({ schoolId }),
      ])
    : [[], []];

  const tableData = structures.map((row) => ({
    ...row,
    school_year: formatSchoolYear(row.school_year),
    actions: <DeleteFeeStructureButton id={row.id as string} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("feeStructureTitle")}</h1>
      {schoolId && campusId ? (
        <FeeStructureForm
          branchId={campusId}
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        />
      ) : (
        <p className="text-sm text-stone-500">{t("assignSchoolFeeStructure")}</p>
      )}
      {structures.length === 0 ? (
        <EmptyState
          title={t("noFeeStructures")}
          description={t("noFeeStructuresDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: tc("name"), accessorKey: "name", sortable: true },
            {
              id: "school_year",
              header: t("colSchoolYear"),
              accessorKey: "school_year",
              sortable: true,
            },
            { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
            { id: "class_name", header: t("colClass"), accessorKey: "class_name" },
            { id: "description", header: tc("description"), accessorKey: "description" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
