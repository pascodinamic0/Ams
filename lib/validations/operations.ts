import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "titleRequired"),
  branch_id: z.string().uuid("branchRequired"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  quantity: z.coerce.number().int().min(0).default(1),
});

export const bookIssueSchema = z.object({
  book_id: z.string().uuid("bookRequired"),
  student_id: z.string().uuid("studentRequired"),
  due_at: z.string().min(1, "dueDateRequired"),
});

export const transportRouteSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  branch_id: z.string().uuid("branchRequired"),
  description: z.string().optional(),
});

export const transportVehicleSchema = z.object({
  route_id: z.string().uuid("routeRequired"),
  name: z.string().min(1, "nameRequired"),
  capacity: z.coerce.number().int().positive().optional(),
});

export const transportMappingSchema = z.object({
  student_id: z.string().uuid("studentRequired"),
  vehicle_id: z.string().uuid("vehicleRequired"),
});

export const transportBulkMappingSchema = z.object({
  vehicle_id: z.string().uuid("vehicleRequired"),
  student_ids: z
    .array(z.string().uuid("invalidStudent"))
    .min(1, "selectAtLeastOneStudent"),
});

export const eventSchema = z.object({
  title: z.string().min(1, "titleRequired"),
  branch_id: z.string().uuid("branchRequired"),
  date: z.string().min(1, "dateRequired"),
  type: z.enum(["event", "holiday"]).default("event"),
  purpose: z.enum(["general", "campus_visit"]).default("general"),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string().optional(),
  public_on_website: z.boolean().default(true),
  booking_enabled: z.boolean().default(false),
  booking_procedure: z.string().optional(),
});

export const eventRegistrationSchema = z.object({
  event_id: z.string().uuid(),
  registrant_name: z.string().min(1, "nameRequired"),
  email: z.string().email("invalidEmail"),
  phone: z.string().optional(),
  party_size: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().optional(),
  admission_application_id: z.string().uuid().optional(),
});

export const campusVisitBookingSchema = eventRegistrationSchema.extend({
  admission_application_id: z.string().uuid("applicationReferenceRequired"),
  guardian_email: z.string().email("invalidEmail"),
});

export const staffSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  school_id: z.string().uuid("schoolRequired"),
  branch_id: z.string().uuid().optional().nullable(),
  email: z.string().email("invalidEmail").optional().or(z.literal("")),
  role: z.string().optional(),
  department: z.string().optional(),
  monthly_salary: z.coerce.number().min(0, "monthlySalaryZeroOrPositive").default(0),
  employment_status: z.enum(["active", "inactive"]).default("active"),
  photo_url: z.string().url("invalidPhotoUrl").optional().or(z.literal("")),
});

export type BookFormData = z.infer<typeof bookSchema>;
export type BookIssueFormData = z.infer<typeof bookIssueSchema>;
export type TransportRouteFormData = z.infer<typeof transportRouteSchema>;
export type TransportVehicleFormData = z.infer<typeof transportVehicleSchema>;
export type TransportMappingFormData = z.infer<typeof transportMappingSchema>;
export type TransportBulkMappingFormData = z.infer<typeof transportBulkMappingSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;
export type CampusVisitBookingFormData = z.infer<typeof campusVisitBookingSchema>;
export type StaffFormData = z.infer<typeof staffSchema>;
