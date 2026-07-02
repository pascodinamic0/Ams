import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getTransportForStudents,
} from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function ParentTransportPage() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescTransport")} />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);
  if (!guardian) {
    return (
      <EmptyState
        title={t("noGuardianProfile")}
        description={t("noGuardianProfileDescShort")}
      />
    );
  }

  const children = await getLinkedStudentsForGuardian(guardian.id);
  const transportRows = await getTransportForStudents(children.map((c) => c.id));
  const transportByStudent = new Map(transportRows.map((tr) => [tr.student_id, tr]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("transportTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("transportSubtitle")}</p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={t("noStudentsLinked")}
          description={t("noStudentsLinkedDesc")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => {
            const transport = transportByStudent.get(child.id);
            return (
              <div
                key={child.id}
                className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900"
              >
                <p className="font-semibold text-stone-900 dark:text-white">{child.name}</p>
                <p className="text-xs text-stone-500">{child.class_name ?? t("noClass")}</p>
                {!transport ? (
                  <p className="mt-4 text-sm text-stone-500">{t("noTransportAssignment")}</p>
                ) : (
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-stone-500">{t("route")}</dt>
                      <dd className="font-medium text-stone-900 dark:text-white">
                        {transport.route_name}
                      </dd>
                      {transport.route_description && (
                        <dd className="text-stone-500">{transport.route_description}</dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-stone-500">{t("vehicle")}</dt>
                      <dd className="font-medium text-stone-900 dark:text-white">
                        {transport.vehicle_name}
                        {transport.vehicle_capacity != null && (
                          <span className="ml-2 text-stone-500">
                            ({t("capacity", { count: transport.vehicle_capacity })})
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
