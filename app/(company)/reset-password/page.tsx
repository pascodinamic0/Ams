"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: ResetPasswordFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      toast.success("Password updated");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Reset password
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Enter your new password
      </p>
      <FormWrapper
        schema={resetPasswordSchema}
        onSubmit={onSubmit}
        className="mt-8 space-y-4"
      >
        <ResetPasswordFormFields loading={loading} />
      </FormWrapper>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        Back to login
      </Link>
    </div>
  );
}

function ResetPasswordFormFields({ loading }: { loading: boolean }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResetPasswordFormData>();
  const password = watch("password");

  return (
    <>
      <div>
        <Label htmlFor="password" required>New password</Label>
        <Input
          id="password"
          type="password"
          error={!!errors.password}
          {...register("password")}
        />
        <PasswordStrength password={password ?? ""} />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword" required>Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          error={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </Button>
    </>
  );
}
