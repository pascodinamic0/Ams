import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudents, getFeeStructures, getClasses, getSchoolById } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { BulkDemandForm } from "./bulk-demand-form";

export default async function BulkAccountDemandPage() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [students, feeStructures, classes, school] = await Promise.all([
    getStudents({ ...scope, status: "active" }),
    scope.branchId ? getFeeStructures(scope.branchId) : getFeeStructures(),
    scope.branchId ? getClasses(scope.branchId) : getClasses(),
    profile?.school_id ? getSchoolById(profile.school_id) : Promise.resolve(null),
  ]);
  const schoolName = school?.name ?? null;

  if (feeStructures.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("bulkDemandTitle")}</h1>
        <EmptyState
          title={t("noFeeStructures")}
          description={t("noFeeStructuresDesc")}
        />
        <Link
          href="/finance/fee-structure"
          className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          {t("feeStructures")}
        </Link>
      </div>
    );
  }

  return (
    <BulkDemandForm
      schoolName={schoolName}
      students={students.map((s) => ({
        id: s.id,
        name: s.name,
        student_id: s.student_id,
        class_id: s.class_id,
        class_name: s.class_name,
      }))}
      feeStructures={feeStructures.map((f) => ({
        id: f.id,
        name: f.name,
        amount: f.amount,
        class_id: f.class_id,
      }))}
      classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      labels={{
        title: t("bulkDemandTitle"),
        subtitle: t("bulkDemandSubtitle"),
        backToInvoices: t("backToInvoices"),
        selectClass: t("selectClassFilter"),
        allClasses: t("allClasses"),
        feeStructure: t("colFeeType"),
        dueDate: t("colDueDate"),
        description: t("demandDescription"),
        descriptionPlaceholder: t("demandDescriptionPlaceholder"),
        skipExisting: t("skipExistingDemands"),
        selectAll: t("selectAllAccounts"),
        clearSelection: t("clearSelection"),
        previewTitle: t("demandPreviewTitle"),
        noStudents: t("noStudentsForDemand"),
        colStudent: t("colStudent"),
        colStudentId: t("colStudentId"),
        colClass: t("colClass"),
        colAmount: t("demandAmount"),
        selectedCount: t("selectedAccountsCount"),
        generate: t("generateDemands"),
        generating: t("generatingDemands"),
        success: t("demandsCreatedSuccess"),
        noneSelected: t("noAccountsSelected"),
      }}
    />
  );
}
