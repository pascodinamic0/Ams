"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent, deleteEvent } from "@/lib/actions/events";
import { toast } from "@/lib/toast";

const DEFAULT_BOOKING_PROCEDURE =
  "Complete the online registration form below. Our team will confirm your booking by email. Please arrive 15 minutes before the event starts.";

const DEFAULT_CAMPUS_VISIT_PROCEDURE =
  "Bring a valid ID and any required documents for your child. Check in at the front office 10 minutes before your scheduled time.";

export function EventForm({ branchId }: { branchId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"event" | "holiday">("event");
  const [purpose, setPurpose] = useState<"general" | "campus_visit">("general");
  const [description, setDescription] = useState("");
  const [publicOnWebsite, setPublicOnWebsite] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [bookingProcedure, setBookingProcedure] = useState(DEFAULT_BOOKING_PROCEDURE);
  const [loading, setLoading] = useState(false);

  const isHoliday = type === "holiday";
  const isCampusVisit = !isHoliday && purpose === "campus_visit";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createEvent({
      title,
      date,
      type,
      purpose: isHoliday ? "general" : purpose,
      description: description || undefined,
      location: location || undefined,
      start_time: startTime || undefined,
      branch_id: branchId,
      public_on_website: isHoliday ? false : isCampusVisit ? false : publicOnWebsite,
      booking_enabled: isHoliday ? false : isCampusVisit ? true : bookingEnabled,
      booking_procedure: isHoliday
        ? undefined
        : isCampusVisit
          ? bookingProcedure || DEFAULT_CAMPUS_VISIT_PROCEDURE
          : bookingEnabled || bookingProcedure
            ? bookingProcedure || DEFAULT_BOOKING_PROCEDURE
            : undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to create event");
      return;
    }
    toast.success(
      isCampusVisit
        ? "Campus visit slot created for online enrollment"
        : publicOnWebsite && !isHoliday
          ? "Event published to school website"
          : "Event created"
    );
    setTitle("");
    setDate("");
    setStartTime("");
    setLocation("");
    setDescription("");
    setPurpose("general");
    setPublicOnWebsite(true);
    setBookingEnabled(false);
    setBookingProcedure(DEFAULT_BOOKING_PROCEDURE);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div>
        <h2 className="text-lg font-semibold">Add event or holiday</h2>
        <p className="text-sm text-slate-500">
          Events marked for the website appear on the school&apos;s public site automatically.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label>Start time (optional)</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <Label>Type</Label>
          <select
            value={type}
            onChange={(e) => {
              const next = e.target.value as "event" | "holiday";
              setType(next);
              if (next === "holiday") setPurpose("general");
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
        {!isHoliday && (
          <div>
            <Label>Purpose</Label>
            <select
              value={purpose}
              onChange={(e) => {
                const next = e.target.value as "general" | "campus_visit";
                setPurpose(next);
                if (next === "campus_visit") {
                  setPublicOnWebsite(false);
                  setBookingEnabled(true);
                  setBookingProcedure(DEFAULT_CAMPUS_VISIT_PROCEDURE);
                  if (!title) setTitle("Campus visit");
                }
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="general">General event</option>
              <option value="campus_visit">Campus visit slot (enrollment)</option>
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <Label>Location (optional)</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main hall, sports field"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What families should know about this event"
          />
        </div>
      </div>

      {!isHoliday && isCampusVisit && (
        <div className="space-y-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm font-medium">Campus visit slot</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This time slot appears on the online enrollment page for families to book after they
            submit an application. Set a start time so families know when to arrive.
          </p>
          <div>
            <Label>Visit instructions (shown after booking)</Label>
            <Textarea
              value={bookingProcedure}
              onChange={(e) => setBookingProcedure(e.target.value)}
              rows={3}
              placeholder={DEFAULT_CAMPUS_VISIT_PROCEDURE}
            />
          </div>
        </div>
      )}

      {!isHoliday && !isCampusVisit && (
        <div className="space-y-3 rounded-lg border border-dashed p-4 dark:border-slate-700">
          <p className="text-sm font-medium">School website</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publicOnWebsite}
              onChange={(e) => setPublicOnWebsite(e.target.checked)}
              className="rounded"
            />
            Show on public school website
          </label>
          {publicOnWebsite && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bookingEnabled}
                  onChange={(e) => setBookingEnabled(e.target.checked)}
                  className="rounded"
                />
                Allow online registration / booking
              </label>
              <div>
                <Label>
                  {bookingEnabled ? "Booking instructions (shown after registration)" : "How to attend"}
                </Label>
                <Textarea
                  value={bookingProcedure}
                  onChange={(e) => setBookingProcedure(e.target.value)}
                  rows={3}
                  placeholder={DEFAULT_BOOKING_PROCEDURE}
                />
              </div>
            </>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add event"}
      </Button>
    </form>
  );
}

export function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    const result = await deleteEvent(id);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to delete event");
      return;
    }
    toast.success("Event deleted");
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>
      Delete
    </Button>
  );
}
