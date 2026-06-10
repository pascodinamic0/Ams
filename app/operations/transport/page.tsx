import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getTransportRoutes,
  getTransportVehicles,
  getTransportStudentMappings,
  getStudents,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  RouteForm,
  VehicleForm,
  StudentMappingForm,
  DeleteRouteButton,
  DeleteVehicleButton,
  UnassignButton,
} from "./transport-forms";

export default async function TransportPage() {
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
      <h1 className="text-2xl font-bold">Transport</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Routes</h2>
        {branchId ? (
          <RouteForm branchId={branchId} />
        ) : (
          <p className="text-sm text-slate-500">Assign a branch to your profile to add routes.</p>
        )}
        {routes.length === 0 ? (
          <EmptyState title="No routes yet" description="Create transport routes for your school" />
        ) : (
          <DataTable
            data={routeTableData}
            columns={[
              { id: "name", header: "Route", accessorKey: "name", sortable: true },
              { id: "description", header: "Description", accessorKey: "description" },
              { id: "vehicle_count", header: "Vehicles", accessorKey: "vehicle_count" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Vehicles</h2>
        <VehicleForm routes={routes.map((r) => ({ id: r.id, name: r.name }))} />
        {vehicles.length === 0 ? (
          <EmptyState title="No vehicles yet" description="Add vehicles to your routes" />
        ) : (
          <DataTable
            data={vehicleTableData}
            columns={[
              { id: "route_name", header: "Route", accessorKey: "route_name", sortable: true },
              { id: "name", header: "Vehicle", accessorKey: "name", sortable: true },
              { id: "capacity", header: "Capacity", accessorKey: "capacity" },
              { id: "student_count", header: "Students", accessorKey: "student_count" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Student mapping</h2>
        <StudentMappingForm
          vehicles={vehicles}
          students={students.map((s) => ({ id: s.id, name: s.name }))}
        />
        {mappings.length === 0 ? (
          <EmptyState title="No assignments yet" description="Assign students to vehicles" />
        ) : (
          <DataTable
            data={mappingTableData}
            columns={[
              { id: "student_name", header: "Student", accessorKey: "student_name", sortable: true },
              { id: "route_name", header: "Route", accessorKey: "route_name" },
              { id: "vehicle_name", header: "Vehicle", accessorKey: "vehicle_name" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </section>
    </div>
  );
}
