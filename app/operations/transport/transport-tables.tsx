"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import {
  DeleteRouteButton,
  DeleteVehicleButton,
  UnassignButton,
} from "./transport-forms";

type RouteRow = {
  id: string;
  name: string;
  description: string | null;
  vehicle_count: number;
};

type VehicleRow = {
  id: string;
  route_name: string;
  name: string;
  capacity: number | null;
  student_count: number;
};

type MappingRow = {
  id: string;
  student_name: string;
  route_name: string;
  vehicle_name: string;
};

export function TransportRoutesTable({ routes }: { routes: RouteRow[] }) {
  const t = useTranslations("operations");
  const tc = useTranslations("common");

  const tableData = routes.map((row) => ({
    ...row,
    actions: <DeleteRouteButton id={row.id} />,
  }));

  return (
    <DataTable
      data={tableData}
      columns={[
        { id: "name", header: t("colRoute"), accessorKey: "name", sortable: true },
        { id: "description", header: tc("description"), accessorKey: "description" },
        { id: "vehicle_count", header: t("colVehicles"), accessorKey: "vehicle_count" },
        { id: "actions", header: "", accessorKey: "actions" },
      ]}
    />
  );
}

export function TransportVehiclesTable({ vehicles }: { vehicles: VehicleRow[] }) {
  const t = useTranslations("operations");

  const tableData = vehicles.map((row) => ({
    ...row,
    actions: <DeleteVehicleButton id={row.id} />,
  }));

  return (
    <DataTable
      data={tableData}
      columns={[
        { id: "route_name", header: t("colRoute"), accessorKey: "route_name", sortable: true },
        { id: "name", header: t("colVehicle"), accessorKey: "name", sortable: true },
        { id: "capacity", header: t("colCapacity"), accessorKey: "capacity" },
        { id: "student_count", header: t("colStudents"), accessorKey: "student_count" },
        { id: "actions", header: "", accessorKey: "actions" },
      ]}
    />
  );
}

export function TransportMappingsTable({ mappings }: { mappings: MappingRow[] }) {
  const t = useTranslations("operations");

  const tableData = mappings.map((row) => ({
    ...row,
    actions: <UnassignButton mappingId={row.id} />,
  }));

  return (
    <DataTable
      data={tableData}
      columns={[
        { id: "student_name", header: t("colStudent"), accessorKey: "student_name", sortable: true },
        { id: "route_name", header: t("colRoute"), accessorKey: "route_name" },
        { id: "vehicle_name", header: t("colVehicle"), accessorKey: "vehicle_name" },
        { id: "actions", header: "", accessorKey: "actions" },
      ]}
    />
  );
}
