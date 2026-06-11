"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookCampusVisitSlot } from "@/lib/actions/event-registrations";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { toast } from "@/lib/toast";

function formatSlotDate(date: string, time: string | null) {
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!time) return formatted;
  return `${formatted} at ${time.slice(0, 5)}`;
}

export function CampusVisitSlotPicker({
  slots,
  admissionApplicationId,
  guardianName,
  guardianEmail,
  guardianPhone,
  studentName,
  schoolName,
  schoolAddress,
  slug,
  primary,
}: {
  slots: PublicSchoolEvent[];
  admissionApplicationId: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  studentName: string;
  schoolName: string;
  schoolAddress: string | null;
  slug: string;
  primary: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(slots[0]?.id ?? null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<{
    eventTitle: string;
    eventDate: string;
    registrationId: string;
  } | null>(null);

  const selected = slots.find((s) => s.id === selectedId);

  async function handleBook() {
    if (!selected) return;
    setLoading(true);
    const result = await bookCampusVisitSlot({
      event_id: selected.id,
      admission_application_id: admissionApplicationId,
      guardian_email: guardianEmail,
      registrant_name: guardianName,
      email: guardianEmail,
      phone: guardianPhone || undefined,
      party_size: 1,
      notes: notes || undefined,
    });
    setLoading(false);

    if (result.error) {
      const message =
        typeof result.error === "string" ? result.error : "Could not book this slot. Try another time.";
      toast.error(message);
      return;
    }

    setBooked({
      eventTitle: result.data?.eventTitle ?? selected.title,
      eventDate: selected.date,
      registrationId: result.data?.id ?? "",
    });
    toast.success("Campus visit booked");
  }

  if (booked) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">You&apos;re all set</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your enrollment application and campus visit are scheduled at {schoolName}.
        </p>
        <div className="mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-sm">
            Application reference:{" "}
            <span className="font-mono font-semibold">{admissionApplicationId}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Campus visit:</span> {booked.eventTitle}
          </p>
          <p className="text-sm">
            <span className="font-medium">When:</span>{" "}
            {formatSlotDate(booked.eventDate, selected?.start_time ?? null)}
          </p>
          {selected?.location && (
            <p className="text-sm">
              <span className="font-medium">Where:</span> {selected.location}
            </p>
          )}
          {schoolAddress && (
            <p className="text-sm">
              <span className="font-medium">School address:</span> {schoolAddress}
            </p>
          )}
          {selected?.booking_procedure && (
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {selected.booking_procedure}
            </p>
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Bring a valid ID and any documents for {studentName}. The admissions team may contact you
            before your visit.
          </p>
        </div>
        <Link
          href={`/schools/${slug}`}
          className="mt-6 inline-block text-sm font-medium hover:underline"
          style={{ color: primary }}
        >
          Back to school website
        </Link>
      </div>
    );
  }

  if (slots.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Book your campus visit</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Choose a time to visit {schoolName} and complete enrollment for {studentName} in person.
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Application reference: <span className="font-mono">{admissionApplicationId}</span>
      </p>

      <div className="mt-6 space-y-3">
        {slots.map((slot) => (
          <label
            key={slot.id}
            className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
              selectedId === slot.id
                ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
            }`}
          >
            <input
              type="radio"
              name="campus_slot"
              value={slot.id}
              checked={selectedId === slot.id}
              onChange={() => setSelectedId(slot.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium">{slot.title}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {formatSlotDate(slot.date, slot.start_time)}
              </p>
              {slot.location && (
                <p className="mt-1 text-sm text-zinc-500">{slot.location}</p>
              )}
              {slot.description && (
                <p className="mt-2 text-sm text-zinc-500">{slot.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <Label>Notes for admissions (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Accessibility needs, preferred language, etc."
          className="mt-1"
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Link
          href={`/schools/${slug}`}
          className="text-sm text-zinc-500 hover:underline"
        >
          Skip for now
        </Link>
        <Button
          type="button"
          onClick={handleBook}
          disabled={loading || !selected}
          style={{ backgroundColor: primary }}
        >
          {loading ? "Booking..." : "Confirm campus visit"}
        </Button>
      </div>
    </div>
  );
}
