import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getSchoolCurrencyForSchool } from "@/lib/db";
import { getPendingEnrollments } from "@/lib/db/pending-enrollments";
import { getTranslations } from "next-intl/server";
import { ConfirmEnrollmentForm } from "./confirm-enrollment-form";

export default async function PendingEnrollmentsPage() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const [rows, currency] = await Promise.all([
    getPendingEnrollments(scope),
    profile?.school_id
      ? getSchoolCurrencyForSchool(profile.school_id)
      : Promise.resolve({ code: "USD" }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pendingEnrollmentsTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("pendingEnrollmentsSubtitle")}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={t("noPendingEnrollments")}
          description={t("noPendingEnrollmentsDesc")}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <ConfirmEnrollmentForm
              key={row.student_id}
              row={row}
              schoolId={scope.schoolId}
              currencyCode={currency.code}
            />
          ))}
        </div>
      )}
    </div>
  );
}
