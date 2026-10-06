import { EmptyState } from "@/components/ui/empty-state";
import { getFeeStructures, getClasses, getSchoolCampusId } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { FeeStructurePanel } from "./fee-structure-panel";

export default async function FeeStructurePage() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? "";
  const campusId = schoolId ? await getSchoolCampusId(schoolId) : null;

  const [structures, classes] = schoolId
    ? await Promise.all([
        getFeeStructures({ schoolId }),
        getClasses({ schoolId }),
      ])
    : [[], []];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("feeStructureTitle")}</h1>
      {schoolId && campusId ? (
        <FeeStructurePanel
          branchId={campusId}
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          structures={structures}
        />
      ) : (
        <>
          <p className="text-sm text-stone-500">{t("assignSchoolFeeStructure")}</p>
          {structures.length === 0 ? (
            <EmptyState
              title={t("noFeeStructures")}
              description={t("noFeeStructuresDesc")}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
