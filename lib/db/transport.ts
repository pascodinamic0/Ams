import { createClient } from "@/lib/supabase/server";

export type TransportRouteListItem = {
  id: string;
  name: string;
  description: string | null;
  vehicle_count: number;
};

export type TransportVehicleListItem = {
  id: string;
  route_id: string;
  route_name: string;
  name: string;
  capacity: number | null;
  student_count: number;
};

export type TransportMappingListItem = {
  id: string;
  student_id: string;
  student_name: string;
  vehicle_id: string;
  vehicle_name: string;
  route_name: string;
};

export type StudentTransport = {
  student_id: string;
  route_name: string;
  route_description: string | null;
  vehicle_name: string;
  vehicle_capacity: number | null;
};

async function resolveBranchIds(
  branchId?: string,
  schoolId?: string
): Promise<string[] | null> {
  if (branchId) return [branchId];
  if (!schoolId) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("branches").select("id").eq("school_id", schoolId);
  return (data ?? []).map((b) => b.id);
}

export async function getTransportRoutes(options?: {
  branchId?: string;
  schoolId?: string;
}): Promise<TransportRouteListItem[]> {
  const supabase = await createClient();
  const branchIds = await resolveBranchIds(options?.branchId, options?.schoolId);

  let query = supabase
    .from("transport_routes")
    .select("id, name, description, transport_vehicles(id)")
    .order("name");

  if (branchIds) {
    if (branchIds.length === 0) return [];
    query = query.in("branch_id", branchIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getTransportRoutes error:", error);
    return [];
  }

  return (data ?? []).map((route) => {
    const vehicles = (route.transport_vehicles as Array<{ id: string }> | null) ?? [];
    return {
      id: route.id,
      name: route.name,
      description: route.description,
      vehicle_count: vehicles.length,
    };
  });
}

export async function getTransportVehicles(options?: {
  branchId?: string;
  schoolId?: string;
  routeId?: string;
}): Promise<TransportVehicleListItem[]> {
  const supabase = await createClient();
  const routes = await getTransportRoutes(options);
  const routeIds = options?.routeId ? [options.routeId] : routes.map((r) => r.id);
  if (routeIds.length === 0) return [];

  const routeNameById = new Map(routes.map((r) => [r.id, r.name]));

  const { data, error } = await supabase
    .from("transport_vehicles")
    .select("id, route_id, name, capacity, transport_student_mapping(id)")
    .in("route_id", routeIds)
    .order("name");

  if (error) {
    console.error("getTransportVehicles error:", error);
    return [];
  }

  return (data ?? []).map((vehicle) => {
    const mappings =
      (vehicle.transport_student_mapping as Array<{ id: string }> | null) ?? [];
    return {
      id: vehicle.id,
      route_id: vehicle.route_id,
      route_name: routeNameById.get(vehicle.route_id) ?? "Unknown",
      name: vehicle.name,
      capacity: vehicle.capacity,
      student_count: mappings.length,
    };
  });
}

export async function getTransportStudentMappings(options?: {
  branchId?: string;
  schoolId?: string;
}): Promise<TransportMappingListItem[]> {
  const supabase = await createClient();
  const vehicles = await getTransportVehicles(options);
  const vehicleIds = vehicles.map((v) => v.id);
  if (vehicleIds.length === 0) return [];

  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  const { data, error } = await supabase
    .from("transport_student_mapping")
    .select(`
      id,
      student_id,
      vehicle_id,
      students(first_name, last_name)
    `)
    .in("vehicle_id", vehicleIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getTransportStudentMappings error:", error);
    return [];
  }

  return (data ?? []).map((mapping) => {
    const student = mapping.students as { first_name?: string; last_name?: string } | null;
    const vehicle = vehicleById.get(mapping.vehicle_id);
    return {
      id: mapping.id,
      student_id: mapping.student_id,
      student_name: student
        ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
        : "Unknown",
      vehicle_id: mapping.vehicle_id,
      vehicle_name: vehicle?.name ?? "Unknown",
      route_name: vehicle?.route_name ?? "Unknown",
    };
  });
}

export async function getTransportForStudent(
  studentId: string
): Promise<StudentTransport | null> {
  const rows = await getTransportForStudents([studentId]);
  return rows[0] ?? null;
}

export async function getTransportForStudents(
  studentIds: string[]
): Promise<StudentTransport[]> {
  if (studentIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transport_student_mapping")
    .select(`
      student_id,
      transport_vehicles(
        name,
        capacity,
        transport_routes(name, description)
      )
    `)
    .in("student_id", studentIds);

  if (error) {
    console.error("getTransportForStudents error:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const vehicle = row.transport_vehicles as {
      name?: string;
      capacity?: number | null;
      transport_routes?: { name?: string; description?: string | null } | null;
    } | null;
    const route = vehicle?.transport_routes;
    return {
      student_id: row.student_id,
      route_name: route?.name ?? "Unknown",
      route_description: route?.description ?? null,
      vehicle_name: vehicle?.name ?? "Unknown",
      vehicle_capacity: vehicle?.capacity ?? null,
    };
  });
}

export async function getTransportStats(options?: {
  branchId?: string;
  schoolId?: string;
}) {
  const routes = await getTransportRoutes(options);
  const vehicles = await getTransportVehicles(options);
  const mappings = await getTransportStudentMappings(options);

  return {
    routes: routes.length,
    vehicles: vehicles.length,
    studentsAssigned: mappings.length,
  };
}
