"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { getDashboardForRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const tv = useTranslations("validation");

  const resetPasswordSchema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, tv("passwordMinLength")),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: tv("passwordsDoNotMatch"),
          path: ["confirmPassword"],
        }),
    [tv]
  );

  async function onSubmit(data: ResetPasswordFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      let destination = "/login";

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        destination = getDashboardForRole(profile?.role);
      }

      toast.success(t("passwordUpdated"));
      router.push(destination);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("passwordUpdateFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <h1 className="font-display text-2xl tracking-wide text-stone-900 dark:text-white">
        {t("resetPasswordTitle")}
      </h1>
      <p className="mt-2 text-stone-500 dark:text-white/50">{t("resetPasswordSubtitle")}</p>
      <FormWrapper
        schema={resetPasswordSchema}
        onSubmit={onSubmit}
        className="mt-8 space-y-4"
      >
        <ResetPasswordFormFields loading={loading} />
      </FormWrapper>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-stone-400 dark:text-white/45 transition-colors hover:text-stone-900 dark:hover:text-white"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}

function ResetPasswordFormFields({ loading }: { loading: boolean }) {
  const t = useTranslations("auth");
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResetPasswordFormData>();
  const password = watch("password");

  return (
    <>
      <div>
        <Label htmlFor="password" required>
          {t("newPassword")}
        </Label>
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
        <Label htmlFor="confirmPassword" required>
          {t("confirmPassword")}
        </Label>
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
        {loading ? t("resetting") : t("updatePassword")}
      </Button>
    </>
  );
}
