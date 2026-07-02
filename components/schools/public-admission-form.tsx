"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAdmission } from "@/lib/actions/admissions";
import { toast } from "@/lib/toast";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await createAdmission(schoolId, {
      student_name: form.get("student_name") as string,
      dob: (form.get("dob") as string) || undefined,
      guardian_name: form.get("guardian_name") as string,
      guardian_email: form.get("guardian_email") as string,
      guardian_phone: (form.get("guardian_phone") as string) || undefined,
      relation: "guardian",
      source: "online",
    });

    setLoading(false);

    if (result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : "Please check the form and try again";
      toast.error(message);
      return;
    }

    setReferenceId(result.data?.id ?? null);
    toast.success("Application submitted. We'll contact you soon.");
    e.currentTarget.reset();
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
