"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export default function PublicAdmissionsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      toast.success("Application submitted. We'll contact you soon.");
      const ref = "REF-" + Date.now();
      alert("Reference: " + ref);
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold">Admissions</h1>
      <p className="mt-2 text-zinc-600">Apply to {slug.replace(/-/g, " ")}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label>Student name</Label>
          <Input name="student_name" required />
        </div>
        <div>
          <Label>Date of birth</Label>
          <Input name="dob" type="date" required />
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
          <Input name="guardian_phone" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
      <Link href={`/schools/${slug}`} className="mt-6 block text-center text-sm text-zinc-600 hover:underline">
        Back to school
      </Link>
    </div>
  );
}
