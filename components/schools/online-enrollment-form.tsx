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

const emptyPickup = {
  full_name: "",
  phone: "",
  relationship: "",
};

const pickupRelationshipOptions = [
  { value: "uncle", label: "Uncle" },
  { value: "aunt", label: "Aunt" },
  { value: "grandparent", label: "Grandparent" },
  { value: "sibling", label: "Sibling" },
  { value: "driver", label: "Driver" },
  { value: "nanny", label: "Nanny / caregiver" },
  { value: "family_friend", label: "Family friend" },
  { value: "other", label: "Other" },
];

export function OnlineEnrollmentForm({
  schoolId,
  schoolName,
  slug,
  schoolAddress,
  primary,
  campusVisitSlots = [],
  hideIntro = false,
}: {
  schoolId: string;
  schoolName: string;
  slug: string;
  schoolAddress: string | null;
  primary: string;
  campusVisitSlots?: PublicSchoolEvent[];
  hideIntro?: boolean;
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
    guardian_can_pickup: false,
    pickup_persons: [] as Array<{ full_name: string; phone: string; relationship: string }>,
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
      pickup_persons: form.pickup_persons.filter(
        (p) => p.full_name.trim() && p.phone.trim() && p.relationship.trim()
      ),
    });
    setLoading(false);

    if (result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : typeof result.error === "object" && result.error !== null
            ? Object.values(result.error).flat().filter(Boolean)[0] ??
              "Please check the form and try again"
            : "Please check the form and try again";
      toast.error(String(message));
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
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Thank you for starting enrollment at {schoolName}.
        </p>
        <div className="mt-6 space-y-4 rounded-2xl border border-primary-200 bg-primary-light p-6 dark:border-primary-900 dark:bg-primary-light/40">
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
          <p className="text-sm text-stone-600 dark:text-stone-400">
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
    <div className={hideIntro ? "max-w-xl" : "mx-auto max-w-xl"}>
      {!hideIntro && (
        <>
          <h1 className="text-2xl font-bold">Online enrollment</h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            Submit your details online
            {hasVisitSlots
              ? ", then book a campus visit to complete enrollment in person."
              : `, then visit ${schoolName} to complete enrollment in person.`}
          </p>
        </>
      )}

      <div className={hideIntro ? "flex gap-2" : "mt-6 flex gap-2"}>
        {visibleSteps.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium ${
              i <= step
                ? "bg-primary-light text-teal-800 dark:bg-primary-light dark:text-teal-200"
                : "bg-stone-100 text-stone-500 dark:bg-stone-900"
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

            <div className="space-y-3 rounded-xl border border-stone-200 p-4 dark:border-stone-800">
              <div>
                <p className="text-sm font-medium">Who may pick up from school</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  Gate staff need a named authorized person. Mark the guardian and/or add someone else.
                </p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-stone-300"
                  checked={form.guardian_can_pickup}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardian_can_pickup: e.target.checked }))
                  }
                />
                <span>
                  This guardian is authorized to pick up the child from school
                  <span className="mt-0.5 block text-xs text-stone-500">
                    Required to specify even when the guardian will collect the child.
                  </span>
                </span>
              </label>

              {form.pickup_persons.map((person, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Authorized person {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          pickup_persons: f.pickup_persons.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Full name</Label>
                    <Input
                      value={person.full_name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          pickup_persons: f.pickup_persons.map((p, i) =>
                            i === index ? { ...p, full_name: e.target.value } : p
                          ),
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={person.phone}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pickup_persons: f.pickup_persons.map((p, i) =>
                              i === index ? { ...p, phone: e.target.value } : p
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Select
                        options={pickupRelationshipOptions}
                        value={person.relationship}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pickup_persons: f.pickup_persons.map((p, i) =>
                              i === index ? { ...p, relationship: e.target.value } : p
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    pickup_persons: [...f.pickup_persons, { ...emptyPickup }],
                  }))
                }
              >
                Add another authorized person
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3 rounded-xl border border-stone-200 p-5 text-sm dark:border-stone-800">
            <p><span className="font-medium">Student:</span> {form.student_name}</p>
            <p><span className="font-medium">DOB:</span> {form.dob}</p>
            <p><span className="font-medium">Class:</span> {form.class_applying}</p>
            <p><span className="font-medium">Guardian:</span> {form.guardian_name}</p>
            <p><span className="font-medium">Contact:</span> {form.guardian_email} / {form.guardian_phone}</p>
            <p><span className="font-medium">Address:</span> {form.address}</p>
            <p>
              <span className="font-medium">Guardian pickup:</span>{" "}
              {form.guardian_can_pickup ? "Authorized" : "Not authorized"}
            </p>
            {form.pickup_persons.length > 0 && (
              <div>
                <p className="font-medium">Other authorized pickup:</p>
                <ul className="mt-1 list-inside list-disc text-stone-600 dark:text-stone-400">
                  {form.pickup_persons.map((p, i) => (
                    <li key={i}>
                      {p.full_name} · {p.phone} · {p.relationship.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="pt-2 text-stone-600 dark:text-stone-400">
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
