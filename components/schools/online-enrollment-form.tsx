"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CampusVisitSlotPicker } from "@/components/schools/campus-visit-slot-picker";
import { submitOnlineEnrollment } from "@/lib/actions/admissions";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { toast } from "@/lib/toast";

const STEPS = ["Student", "Family", "Review", "Campus visit"];

export function OnlineEnrollmentForm({
  schoolId,
  schoolName,
  slug,
  schoolAddress,
  primary,
  campusVisitSlots = [],
}: {
  schoolId: string;
  schoolName: string;
  slug: string;
  schoolAddress: string | null;
  primary: string;
  campusVisitSlots?: PublicSchoolEvent[];
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_name: "",
    dob: "",
    gender: "",
    class_applying: "",
    guardian_name: "",
    guardian_email: "",
    guardian_phone: "",
    relation: "guardian",
    address: "",
    notes: "",
  });

  const hasVisitSlots = campusVisitSlots.length > 0;
  const visibleSteps = hasVisitSlots ? STEPS : STEPS.slice(0, 3);

  async function handleSubmit() {
    setLoading(true);
    const result = await submitOnlineEnrollment(schoolId, {
      ...form,
      gender: form.gender || undefined,
      notes: form.notes || undefined,
      relation: form.relation as "father" | "mother" | "guardian" | "other",
    });
    setLoading(false);

    if (result.error) {
      const message =
        typeof result.error === "string" ? result.error : "Please check the form and try again";
      toast.error(message);
      return;
    }

    const id = result.data?.id ?? null;
    setReferenceId(id);

    if (hasVisitSlots && id) {
      setStep(3);
    }
  }

  if (referenceId && hasVisitSlots && step === 3) {
    return (
      <CampusVisitSlotPicker
        slots={campusVisitSlots}
        admissionApplicationId={referenceId}
        guardianName={form.guardian_name}
        guardianEmail={form.guardian_email}
        guardianPhone={form.guardian_phone}
        studentName={form.student_name}
        schoolName={schoolName}
        schoolAddress={schoolAddress}
        slug={slug}
        primary={primary}
      />
    );
  }

  if (referenceId && !hasVisitSlots) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">Application submitted</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Thank you for starting enrollment at {schoolName}.
        </p>
        <div className="mt-6 space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/40">
          <p className="text-sm">
            Reference number: <span className="font-mono font-semibold">{referenceId}</span>
          </p>
          <p className="text-sm leading-relaxed">
            Your basic information has been received. To complete enrollment, please visit the school
            in person with this reference number, a valid ID, and any required documents.
          </p>
          {schoolAddress && (
            <p className="text-sm">
              <span className="font-medium">Campus address:</span> {schoolAddress}
            </p>
          )}
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The admissions team will review your application and may contact you before your visit.
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

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Online enrollment</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Submit your details online
        {hasVisitSlots
          ? ", then book a campus visit to complete enrollment in person."
          : `, then visit ${schoolName} to complete enrollment in person.`}
      </p>

      <div className="mt-6 flex gap-2">
        {visibleSteps.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium ${
              i <= step
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <div>
              <Label>Student full name</Label>
              <Input
                value={form.student_name}
                onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  options={[
                    { value: "", label: "Select" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Grade or class applying for</Label>
              <Input
                value={form.class_applying}
                onChange={(e) => setForm((f) => ({ ...f, class_applying: e.target.value }))}
                placeholder="e.g. Grade 5"
                required
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <Label>Parent or guardian name</Label>
              <Input
                value={form.guardian_name}
                onChange={(e) => setForm((f) => ({ ...f, guardian_name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.guardian_email}
                  onChange={(e) => setForm((f) => ({ ...f, guardian_email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={form.guardian_phone}
                  onChange={(e) => setForm((f) => ({ ...f, guardian_phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Relation to student</Label>
              <Select
                options={[
                  { value: "father", label: "Father" },
                  { value: "mother", label: "Mother" },
                  { value: "guardian", label: "Guardian" },
                  { value: "other", label: "Other" },
                ]}
                value={form.relation}
                onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
              />
            </div>
            <div>
              <Label>Home address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                required
              />
            </div>
            <div>
              <Label>Additional notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3 rounded-xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
            <p><span className="font-medium">Student:</span> {form.student_name}</p>
            <p><span className="font-medium">DOB:</span> {form.dob}</p>
            <p><span className="font-medium">Class:</span> {form.class_applying}</p>
            <p><span className="font-medium">Guardian:</span> {form.guardian_name}</p>
            <p><span className="font-medium">Contact:</span> {form.guardian_email} / {form.guardian_phone}</p>
            <p><span className="font-medium">Address:</span> {form.address}</p>
            <p className="pt-2 text-zinc-600 dark:text-zinc-400">
              {hasVisitSlots
                ? "After submitting, you will book a campus visit slot to complete enrollment in person."
                : "After submitting, you will receive a reference number and instructions to visit the school to complete enrollment."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={loading} style={{ backgroundColor: primary }}>
            {loading ? "Submitting..." : hasVisitSlots ? "Submit & book visit" : "Submit application"}
          </Button>
        )}
      </div>
    </div>
  );
}
