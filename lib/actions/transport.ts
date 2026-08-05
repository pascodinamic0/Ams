"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess, assertStudentAccess } from "@/lib/auth/assert";
import { OPERATIONS_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import {
  transportRouteSchema,
  transportVehicleSchema,
  transportMappingSchema,
  transportBulkMappingSchema,
  type TransportRouteFormData,
  type TransportVehicleFormData,
  type TransportMappingFormData,
  type TransportBulkMappingFormData,
} from "@/lib/validations/operations";

async function assertTransportRouteAccess(routeId: string) {
  const supabase = await createClient();
  const { data: route } = await supabase
    .from("transport_routes")
    .select("branch_id")
    .eq("id", routeId)
    .maybeSingle();
  if (!route) return { ok: false as const, error: "Transport route not found" };

  const access = await assertBranchAccess(
    route.branch_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!access.ok) return access;
  return { ...access, branchId: route.branch_id };
}

async function assertTransportVehicleAccess(vehicleId: string) {
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("transport_vehicles")
    .select("route_id, transport_routes(branch_id)")
    .eq("id", vehicleId)
    .maybeSingle();
  if (!vehicle) return { ok: false as const, error: "Transport vehicle not found" };

  const branchId =
    (vehicle.transport_routes as { branch_id?: string } | null)?.branch_id ??
    null;
  if (!branchId) {
    return { ok: false as const, error: "Transport route not found" };
  }

  const access = await assertBranchAccess(branchId, OPERATIONS_PORTAL_ROLES);
  if (!access.ok) return access;
  return { ...access, branchId, routeId: vehicle.route_id };
}

async function assertTransportMappingAccess(mappingId: string) {
  const supabase = await createClient();
  const { data: mapping } = await supabase
    .from("transport_student_mapping")
    .select("student_id, vehicle_id")
    .eq("id", mappingId)
    .maybeSingle();
  if (!mapping) {
    return { ok: false as const, error: "Transport assignment not found" };
  }

  const vehicleAccess = await assertTransportVehicleAccess(mapping.vehicle_id);
  if (!vehicleAccess.ok) return vehicleAccess;

  const studentAccess = await assertStudentAccess(
    mapping.student_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!studentAccess.ok) return studentAccess;
  if (studentAccess.schoolId !== vehicleAccess.schoolId) {
    return { ok: false as const, error: "Student does not belong to this school" };
  }

  return vehicleAccess;
}

export async function createTransportRoute(input: TransportRouteFormData) {
  const parsed = transportRouteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(
    parsed.data.branch_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transport_routes")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return { data: { id: data.id } };
}

export async function deleteTransportRoute(id: string) {
  const access = await assertTransportRouteAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("transport_routes")
    .delete()
    .eq("id", id)
    .eq("branch_id", access.branchId);
  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return {};
}

export async function createTransportVehicle(input: TransportVehicleFormData) {
  const parsed = transportVehicleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertTransportRouteAccess(parsed.data.route_id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transport_vehicles")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return { data: { id: data.id } };
}

export async function deleteTransportVehicle(id: string) {
  const access = await assertTransportVehicleAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase.from("transport_vehicles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return {};
}

export async function assignStudentToVehicle(input: TransportMappingFormData) {
  const parsed = transportMappingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const vehicleAccess = await assertTransportVehicleAccess(parsed.data.vehicle_id);
  if (!vehicleAccess.ok) return { error: vehicleAccess.error };

  const studentAccess = await assertStudentAccess(
    parsed.data.student_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!studentAccess.ok) return { error: studentAccess.error };
  if (studentAccess.schoolId !== vehicleAccess.schoolId) {
    return { error: "Student does not belong to this school" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transport_student_mapping")
    .upsert(
      {
        student_id: parsed.data.student_id,
        vehicle_id: parsed.data.vehicle_id,
      },
      { onConflict: "student_id" }
    )
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return { data: { id: data.id } };
}

export async function bulkAssignStudentsToVehicle(input: TransportBulkMappingFormData) {
  const parsed = transportBulkMappingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const vehicleAccess = await assertTransportVehicleAccess(parsed.data.vehicle_id);
  if (!vehicleAccess.ok) return { error: vehicleAccess.error };

  for (const studentId of parsed.data.student_ids) {
    const studentAccess = await assertStudentAccess(
      studentId,
      OPERATIONS_PORTAL_ROLES
    );
    if (!studentAccess.ok) return { error: studentAccess.error };
    if (studentAccess.schoolId !== vehicleAccess.schoolId) {
      return { error: "One or more students do not belong to this school" };
    }
  }

  const supabase = await createClient();
  const rows = parsed.data.student_ids.map((student_id) => ({
    student_id,
    vehicle_id: parsed.data.vehicle_id,
  }));

  const { error } = await supabase
    .from("transport_student_mapping")
    .upsert(rows, { onConflict: "student_id" });

  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return { data: { count: rows.length } };
}

export async function unassignStudentFromVehicle(mappingId: string) {
  const access = await assertTransportMappingAccess(mappingId);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("transport_student_mapping")
    .delete()
    .eq("id", mappingId);

  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return {};
}
