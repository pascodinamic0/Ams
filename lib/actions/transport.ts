"use server";

import { revalidatePath } from "next/cache";
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

export async function createTransportRoute(input: TransportRouteFormData) {
  const parsed = transportRouteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
  const supabase = await createClient();
  const { error } = await supabase.from("transport_routes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return {};
}

export async function createTransportVehicle(input: TransportVehicleFormData) {
  const parsed = transportVehicleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
  const supabase = await createClient();
  const { error } = await supabase.from("transport_vehicles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return {};
}

export async function assignStudentToVehicle(input: TransportMappingFormData) {
  const parsed = transportMappingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
  const supabase = await createClient();
  const { error } = await supabase
    .from("transport_student_mapping")
    .delete()
    .eq("id", mappingId);

  if (error) return { error: error.message };
  revalidatePath("/operations/transport");
  return {};
}
