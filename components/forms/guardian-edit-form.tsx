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
import { updateGuardian } from "@/lib/actions/guardians";
import { guardianSchema, type GuardianFormData } from "@/lib/validations";
import { toast } from "@/lib/toast";

interface Props {
  guardianId: string;
  studentId: string;
  defaultValues: GuardianFormData;
}

export function GuardianEditForm({ guardianId, studentId, defaultValues }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: GuardianFormData) {
    setLoading(true);
    try {
      const result = await updateGuardian(guardianId, data);
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to update guardian");
        return;
      }
      toast.success("Guardian updated");
      router.push(`/academic/students/${studentId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper schema={guardianSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Guardian details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <GuardianEditFields />
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
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </FormWrapper>
  );
}

function GuardianEditFields() {
  const { register, formState: { errors } } = useFormContext<GuardianFormData>();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name" required>First name</Label>
          <Input id="first_name" {...register("first_name")} error={!!errors.first_name} />
          {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="middle_name">Middle name</Label>
          <Input id="middle_name" {...register("middle_name")} error={!!errors.middle_name} />
          {errors.middle_name && <p className="text-sm text-red-500">{errors.middle_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name" required>Last name</Label>
          <Input id="last_name" {...register("last_name")} error={!!errors.last_name} />
          {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
        </div>
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
