"use client";

import {
  useForm,
  FormProvider,
  UseFormProps,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface FormWrapperProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues?: UseFormProps<T>["defaultValues"];
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className = "",
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    // @ts-expect-error - Zod 4 / RHF resolver type mismatch
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit as (data: FieldValues) => void)}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  );
}
