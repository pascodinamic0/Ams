"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createEventRegistration } from "@/lib/actions/event-registrations";
import { toast } from "@/lib/toast";
import type { PublicSchoolEvent } from "@/lib/db/public-events";

export function EventBookingForm({
  event,
  primary,
}: {
  event: PublicSchoolEvent;
  primary: string;
}) {
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await createEventRegistration({
      event_id: event.id,
      registrant_name: form.get("registrant_name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || undefined,
      party_size: Number(form.get("party_size") || 1),
      notes: (form.get("notes") as string) || undefined,
    });

    setLoading(false);

    if (result.error) {
      const message =
        typeof result.error === "string" ? result.error : "Please check the form and try again";
      toast.error(message);
      return;
    }

    setReferenceId(result.data?.id ?? null);
    toast.success("Booking request submitted");
    e.currentTarget.reset();
  }

  if (referenceId) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <h3 className="font-semibold">Booking received</h3>
        <p className="mt-2 text-sm">
          Your request has been sent to the events team. Reference:{" "}
          <span className="font-mono font-medium">{referenceId}</span>
        </p>
        {event.booking_procedure && (
          <p className="mt-3 text-sm">{event.booking_procedure}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h3 className="font-semibold">Book this event</h3>
      {event.booking_procedure && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.booking_procedure}</p>
      )}
      <div>
        <Label>Your name</Label>
        <Input name="registrant_name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" required />
        </div>
        <div>
          <Label>Phone</Label>
          <Input name="phone" type="tel" />
        </div>
      </div>
      <div>
        <Label>Number of attendees</Label>
        <Input name="party_size" type="number" min={1} max={20} defaultValue={1} required />
      </div>
      <div>
        <Label>Notes (optional)</Label>
        <Textarea name="notes" rows={2} placeholder="Dietary needs, accessibility, etc." />
      </div>
      <Button type="submit" disabled={loading} style={{ backgroundColor: primary }}>
        {loading ? "Submitting..." : "Submit booking"}
      </Button>
    </form>
  );
}
