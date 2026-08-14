"use server";

import { actionError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";
import { getTranslations } from "next-intl/server";
import {
  campusVisitBookingSchema,
  eventRegistrationSchema,
  type CampusVisitBookingFormData,
  type EventRegistrationFormData,
} from "@/lib/validations/operations";

export async function createEventRegistration(input: EventRegistrationFormData) {
  const parsed = eventRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id, booking_enabled, purpose, public_on_website, branch_id, branches(school_id, schools(slug, public_site_enabled, status))"
    )
    .eq("id", parsed.data.event_id)
    .maybeSingle();

  if (eventError || !event) {
    return await actionError("slotUnavailable");
  }

  if (!event.booking_enabled) {
    return await actionError("bookingClosed");
  }

  const isBookable =
    event.purpose === "campus_visit" || event.public_on_website === true;

  if (!isBookable) {
    return await actionError("eventNotOpenBooking");
  }

  const branches = event.branches as
    | { school_id: string; schools: { slug: string; public_site_enabled: boolean; status: string } | { slug: string; public_site_enabled: boolean; status: string }[] | null }
    | { school_id: string; schools: { slug: string; public_site_enabled: boolean; status: string } | { slug: string; public_site_enabled: boolean; status: string }[] | null }[]
    | null;
  const branch = Array.isArray(branches) ? branches[0] : branches;
  const schoolsRaw = branch?.schools ?? null;
  const school = Array.isArray(schoolsRaw) ? schoolsRaw[0] : schoolsRaw;

  if (!school?.public_site_enabled || school.status !== "approved") {
    return await actionError("onlineBookingUnavailable");
  }

  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: parsed.data.event_id,
      registrant_name: parsed.data.registrant_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      party_size: parsed.data.party_size,
      notes: parsed.data.notes,
      admission_application_id: parsed.data.admission_application_id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/operations/events");
  revalidatePath("/academic/admissions");
  if (school.slug) {
    revalidatePath(`/schools/${school.slug}/visit`);
    revalidatePath(`/schools/${school.slug}/events`);
  }
  return { data: { id: data.id } };
}

export async function bookCampusVisitSlot(input: CampusVisitBookingFormData) {
  const parsed = campusVisitBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const admin = adminResult.client;

  const { data: admission, error: admissionError } = await admin
    .from("admission_applications")
    .select("id, school_id, student_name, guardian_email, guardian_name, guardian_phone, status, requires_campus_visit")
    .eq("id", parsed.data.admission_application_id)
    .maybeSingle();

  if (admissionError || !admission) {
    return await actionError("applicationNotFoundEnroll");
  }

  if (admission.guardian_email.toLowerCase() !== parsed.data.guardian_email.toLowerCase()) {
    return await actionError("emailMismatchEnrollment");
  }

  if (!admission.requires_campus_visit) {
    return await actionError("applicationNotEligibleVisit");
  }

  const { data: event, error: eventError } = await admin
    .from("events")
    .select("id, title, date, purpose, booking_enabled, branch_id, branches(school_id)")
    .eq("id", parsed.data.event_id)
    .maybeSingle();

  if (eventError || !event) {
    return await actionError("visitSlotNotFound");
  }

  const branches = event.branches as
    | { school_id: string }
    | { school_id: string }[]
    | null;
  const eventSchoolId = Array.isArray(branches)
    ? branches[0]?.school_id
    : branches?.school_id;
  if (
    event.purpose !== "campus_visit" ||
    !event.booking_enabled ||
    eventSchoolId !== admission.school_id
  ) {
    return await actionError("slotNotForEnrollmentVisits");
  }

  const { data: existing } = await admin
    .from("event_registrations")
    .select("id")
    .eq("admission_application_id", admission.id)
    .maybeSingle();

  if (existing) {
    return await actionError("visitAlreadyBooked");
  }

  const te = await getTranslations("errors");
  const enrollmentNote = te("enrollmentApplicationNote", {
    studentName: admission.student_name,
    ref: admission.id.slice(0, 8),
  });
  const notes = parsed.data.notes
    ? `${enrollmentNote}. ${parsed.data.notes}`
    : enrollmentNote;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: parsed.data.event_id,
      registrant_name: parsed.data.registrant_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      party_size: parsed.data.party_size,
      notes,
      admission_application_id: admission.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/operations/events");
  revalidatePath("/academic/admissions");
  const { data: branchRow } = await admin
    .from("branches")
    .select("schools(slug)")
    .eq("id", event.branch_id)
    .maybeSingle();
  const schools = branchRow?.schools as { slug: string } | { slug: string }[] | null;
  const schoolSlug = Array.isArray(schools) ? schools[0]?.slug : schools?.slug;
  if (schoolSlug) {
    revalidatePath(`/schools/${schoolSlug}/visit`);
  }
  return {
    data: {
      id: data.id,
      eventTitle: event.title,
      eventDate: event.date,
    },
  };
}

export async function updateEventRegistrationStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_registrations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  revalidatePath("/academic/admissions");
  return {} as { error?: string };
}
