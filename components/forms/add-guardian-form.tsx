"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { addGuardianToStudent } from "@/lib/actions/student-onboarding";
import { guardianOnboardingSchema, type GuardianOnboardingData } from "@/lib/validations/student-onboarding";
import { toast } from "@/lib/toast";

interface Props {
  studentId: string;
  schoolId: string;
}

export function AddGuardianForm({ studentId, schoolId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: GuardianOnboardingData) {
    setLoading(true);
    try {
      const result = await addGuardianToStudent(studentId, schoolId, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Guardian added");
      router.push(`/academic/students/${studentId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper
      schema={guardianOnboardingSchema}
      defaultValues={{ relation: "guardian" }}
      onSubmit={onSubmit}
    >
      <Card>
        <CardHeader>
          <CardTitle>Add guardian</CardTitle>
          <p className="text-sm text-stone-500">Link a new guardian to this student.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddGuardianFields />
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.push(`/academic/students/${studentId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add guardian"}
          </Button>
        </CardFooter>
      </Card>
    </FormWrapper>
  );
}

function AddGuardianFields() {
  const { register, formState: { errors } } = useFormContext<GuardianOnboardingData>();

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="name" required>Full name</Label>
        <Input id="name" {...register("name")} error={!!errors.name} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" {...register("email")} error={!!errors.email} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input id="whatsapp" type="tel" {...register("whatsapp")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="relation">Relation to child</Label>
        <Select
          id="relation"
          options={[
            { value: "father", label: "Father" },
            { value: "mother", label: "Mother" },
            { value: "guardian", label: "Guardian" },
            { value: "other", label: "Other" },
          ]}
          {...register("relation")}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Home address</Label>
        <Textarea id="address" rows={2} {...register("address")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="workplace">Workplace</Label>
        <Input id="workplace" {...register("workplace")} />
      </div>
    </>
  );
}
