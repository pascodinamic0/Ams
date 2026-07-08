import { EmptyState } from "@/components/ui/empty-state";
import {
  getTransportRoutes,
  getTransportVehicles,
  getTransportStudentMappings,
  getStudents,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import {
  RouteForm,
  VehicleForm,
  StudentMappingForm,
} from "./transport-forms";
import {
  TransportRoutesTable,
  TransportVehiclesTable,
  TransportMappingsTable,
} from "./transport-tables";

export default async function TransportPage() {
  const t = await getTranslations("operations");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [routes, vehicles, mappings, students] = await Promise.all([
    getTransportRoutes(scope),
    getTransportVehicles(scope),
    getTransportStudentMappings(scope),
    getStudents(scope),
  ]);

  const branchId = profile?.branch_id ?? "";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("transportTitle")}</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("routesSection")}</h2>
        {branchId ? (
          <RouteForm branchId={branchId} />
        ) : (
          <p className="text-sm text-stone-500">{t("assignBranchRoutes")}</p>
        )}
        {routes.length === 0 ? (
          <EmptyState title={t("noRoutes")} description={t("noRoutesDesc")} />
        ) : (
          <TransportRoutesTable routes={routes} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("vehiclesSection")}</h2>
        <VehicleForm routes={routes.map((r) => ({ id: r.id, name: r.name }))} />
        {vehicles.length === 0 ? (
          <EmptyState title={t("noVehicles")} description={t("noVehiclesDesc")} />
        ) : (
          <TransportVehiclesTable vehicles={vehicles} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("studentMappingSection")}</h2>
        <StudentMappingForm
          vehicles={vehicles}
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          assignedStudentIds={mappings.map((m) => m.student_id)}
        />
        {mappings.length === 0 ? (
          <EmptyState title={t("noAssignments")} description={t("noAssignmentsDesc")} />
        ) : (
          <TransportMappingsTable mappings={mappings} />
        )}
      </section>
    </div>
  );
}
