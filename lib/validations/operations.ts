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

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  branch_id: z.string().uuid("Branch is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["event", "holiday"]).default("event"),
  description: z.string().optional(),
});

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  school_id: z.string().uuid("School is required"),
  branch_id: z.string().uuid().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookSchema>;
export type BookIssueFormData = z.infer<typeof bookIssueSchema>;
export type TransportRouteFormData = z.infer<typeof transportRouteSchema>;
export type TransportVehicleFormData = z.infer<typeof transportVehicleSchema>;
export type TransportMappingFormData = z.infer<typeof transportMappingSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type StaffFormData = z.infer<typeof staffSchema>;
