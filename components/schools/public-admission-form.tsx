"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { createAdmission } from "@/lib/actions/admissions";
import { toast } from "@/lib/toast";

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

export function PublicAdmissionForm({
  schoolId,
  schoolName,
  slug,
}: {
  schoolId: string;
  schoolName: string;
  slug: string;
}) {
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [guardianCanPickup, setGuardianCanPickup] = useState(false);
  const [addOtherPickup, setAddOtherPickup] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const otherName = (form.get("pickup_name") as string)?.trim() || "";
    const otherPhone = (form.get("pickup_phone") as string)?.trim() || "";
    const otherRelationship = (form.get("pickup_relationship") as string)?.trim() || "";

    const pickup_persons =
      addOtherPickup && otherName && otherPhone && otherRelationship
        ? [{ full_name: otherName, phone: otherPhone, relationship: otherRelationship }]
        : [];

    const result = await createAdmission(schoolId, {
      student_name: form.get("student_name") as string,
      dob: (form.get("dob") as string) || undefined,
      guardian_name: form.get("guardian_name") as string,
      guardian_email: form.get("guardian_email") as string,
      guardian_phone: (form.get("guardian_phone") as string) || undefined,
      relation: "guardian",
      guardian_can_pickup: guardianCanPickup,
      pickup_persons,
      source: "online",
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

    setReferenceId(result.data?.id ?? null);
    toast.success("Application submitted. We'll contact you soon.");
    e.currentTarget.reset();
    setGuardianCanPickup(false);
    setAddOtherPickup(false);
  }

  if (referenceId) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-bold">Application received</h1>
        <p className="mt-2 text-stone-600">
          Thank you for applying to {schoolName}.
        </p>
        <p className="mt-6 rounded-lg border bg-stone-50 p-4 text-sm">
          Reference: <span className="font-mono font-medium">{referenceId}</span>
        </p>
        <Link
          href={`/schools/${slug}`}
          className="mt-6 block text-center text-sm text-stone-600 hover:underline"
        >
          Back to school
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold">Admissions</h1>
      <p className="mt-2 text-stone-600">Apply to {schoolName}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label>Student name</Label>
          <Input name="student_name" required />
        </div>
        <div>
          <Label>Date of birth</Label>
          <Input name="dob" type="date" />
        </div>
        <div>
          <Label>Guardian name</Label>
          <Input name="guardian_name" required />
        </div>
        <div>
          <Label>Guardian email</Label>
          <Input name="guardian_email" type="email" required />
        </div>
        <div>
          <Label>Guardian phone</Label>
          <Input name="guardian_phone" type="tel" />
        </div>

        <div className="space-y-3 rounded-lg border border-stone-200 p-4">
          <p className="text-sm font-medium">Who may pick up from school</p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-stone-300"
              checked={guardianCanPickup}
              onChange={(e) => setGuardianCanPickup(e.target.checked)}
            />
            <span>
              This guardian is authorized to pick up the child
              <span className="mt-0.5 block text-xs text-stone-500">
                Must be specified even when the guardian will collect the child.
              </span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded border-stone-300"
              checked={addOtherPickup}
              onChange={(e) => setAddOtherPickup(e.target.checked)}
            />
            Add another authorized person
          </label>
          {addOtherPickup && (
            <div className="space-y-3 border-t border-stone-200 pt-3">
              <div>
                <Label>Full name</Label>
                <Input name="pickup_name" required={addOtherPickup} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="pickup_phone" type="tel" required={addOtherPickup} />
              </div>
              <div>
                <Label>Relationship</Label>
                <Select
                  name="pickup_relationship"
                  placeholder="Select relationship"
                  options={pickupRelationshipOptions}
                  required={addOtherPickup}
                />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
      <Link
        href={`/schools/${slug}`}
        className="mt-6 block text-center text-sm text-stone-600 hover:underline"
      >
        Back to school
      </Link>
    </div>
  );
}
