import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  branch_id: z.string().uuid("Branch is required"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  quantity: z.coerce.number().int().min(0).default(1),
});

export const bookIssueSchema = z.object({
  book_id: z.string().uuid("Book is required"),
  student_id: z.string().uuid("Student is required"),
  due_at: z.string().min(1, "Due date is required"),
});

export const transportRouteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch_id: z.string().uuid("Branch is required"),
  description: z.string().optional(),
});

export const transportVehicleSchema = z.object({
  route_id: z.string().uuid("Route is required"),
  name: z.string().min(1, "Name is required"),
  capacity: z.coerce.number().int().positive().optional(),
});

export const transportMappingSchema = z.object({
  student_id: z.string().uuid("Student is required"),
  vehicle_id: z.string().uuid("Vehicle is required"),
});

export const transportBulkMappingSchema = z.object({
  vehicle_id: z.string().uuid("Vehicle is required"),
  student_ids: z
    .array(z.string().uuid("Invalid student"))
    .min(1, "Select at least one student"),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  branch_id: z.string().uuid("Branch is required"),
  date: z.string().min(1, "Date is required"),
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
  registrant_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  party_size: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().optional(),
  admission_application_id: z.string().uuid().optional(),
});

export const campusVisitBookingSchema = eventRegistrationSchema.extend({
  admission_application_id: z.string().uuid("Application reference is required"),
  guardian_email: z.string().email("Invalid email"),
});

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  school_id: z.string().uuid("School is required"),
  branch_id: z.string().uuid().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.string().optional(),
  department: z.string().optional(),
  monthly_salary: z.coerce.number().min(0, "Monthly salary must be zero or positive").default(0),
  employment_status: z.enum(["active", "inactive"]).default("active"),
  photo_url: z.string().url("Invalid photo URL").optional().or(z.literal("")),
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
