"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createAssignment } from "@/lib/actions/assignments";
import { assignmentSchema, type AssignmentFormData } from "@/lib/validations/teacher";
import { toast } from "@/lib/toast";

interface Props {
  classes: { id: string; name: string }[];
}

export function AssignmentForm({ classes }: Props) {
  const t = useTranslations("teacher");
  const router = useRouter();

  async function onSubmit(data: AssignmentFormData) {
    const result = await createAssignment(data);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("createAssignmentFailed"));
      return;
    }
    toast.success(t("assignmentCreated"));
    router.refresh();
  }

  return (
    <FormWrapper
      schema={assignmentSchema}
      defaultValues={{ class_id: classes[0]?.id ?? "" }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
    >
      <AssignmentFormFields classes={classes} />
    </FormWrapper>
  );
}

function AssignmentFormFields({ classes }: { classes: { id: string; name: string }[] }) {
  const t = useTranslations("teacher");
  const tc = useTranslations("common");
  const { register, formState: { errors, isSubmitting } } = useFormContext<AssignmentFormData>();

  return (
    <>
      <div className="sm:col-span-2">
        <Label htmlFor="title" required>{t("titleLabel")}</Label>
        <Input id="title" {...register("title")} error={!!errors.title} />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="class_id" required>{t("classLabel")}</Label>
        <select
          id="class_id"
          {...register("class_id")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.class_id && <p className="mt-1 text-sm text-red-500">{errors.class_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="due_date">{t("dueDateLabel")}</Label>
        <Input id="due_date" type="datetime-local" {...register("due_date")} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">{tc("description")}</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {t("createAssignmentBtn")}
        </Button>
      </div>
    </>
  );
}
