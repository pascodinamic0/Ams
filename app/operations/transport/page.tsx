import { DataTable } from "@/components/ui/data-table";
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
  DeleteRouteButton,
  DeleteVehicleButton,
  UnassignButton,
} from "./transport-forms";

export default async function TransportPage() {
  const t = await getTranslations("operations");
  const tc = await getTranslations("common");
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
  const routeTableData = routes.map((row) => ({
    ...row,
    actions: <DeleteRouteButton id={String(row.id)} />,
  }));
  const vehicleTableData = vehicles.map((row) => ({
    ...row,
    actions: <DeleteVehicleButton id={String(row.id)} />,
  }));
  const mappingTableData = mappings.map((row) => ({
    ...row,
    actions: <UnassignButton mappingId={String(row.id)} />,
  }));

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
          <DataTable
            data={routeTableData}
            columns={[
              { id: "name", header: t("colRoute"), accessorKey: "name", sortable: true },
              { id: "description", header: tc("description"), accessorKey: "description" },
              { id: "vehicle_count", header: t("colVehicles"), accessorKey: "vehicle_count" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("vehiclesSection")}</h2>
        <VehicleForm routes={routes.map((r) => ({ id: r.id, name: r.name }))} />
        {vehicles.length === 0 ? (
          <EmptyState title={t("noVehicles")} description={t("noVehiclesDesc")} />
        ) : (
          <DataTable
            data={vehicleTableData}
            columns={[
              { id: "route_name", header: t("colRoute"), accessorKey: "route_name", sortable: true },
              { id: "name", header: t("colVehicle"), accessorKey: "name", sortable: true },
              { id: "capacity", header: t("colCapacity"), accessorKey: "capacity" },
              { id: "student_count", header: t("colStudents"), accessorKey: "student_count" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("studentMappingSection")}</h2>
        <StudentMappingForm
          vehicles={vehicles}
          students={students.map((s) => ({ id: s.id, name: s.name }))}
        />
        {mappings.length === 0 ? (
          <EmptyState title={t("noAssignments")} description={t("noAssignmentsDesc")} />
        ) : (
          <DataTable
            data={mappingTableData}
            columns={[
              { id: "student_name", header: t("colStudent"), accessorKey: "student_name", sortable: true },
              { id: "route_name", header: t("colRoute"), accessorKey: "route_name" },
              { id: "vehicle_name", header: t("colVehicle"), accessorKey: "vehicle_name" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </section>
    </div>
  );
}
