"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { completePasswordSetup } from "@/lib/actions/password-setup";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);
  const tv = useTranslations("validation");

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      const supabase = createClient();
      const hash = window.location.hash.replace(/^#/, "");
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        window.history.replaceState(null, "", window.location.pathname);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      if (!user) {
        setSessionMissing(true);
        setSessionReady(true);
        return;
      }
      setSessionReady(true);
    }

    void ensureSession();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const result = await completePasswordSetup(data.password);
      if (result.error) throw new Error(result.error);

      toast.success(t("passwordUpdated"));
      window.location.assign(result.data?.destination ?? "/onboarding");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("passwordUpdateFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (!sessionReady) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center bg-mkt-canvas px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-mkt-ink/10" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-mkt-ink/5" />
      </div>
    );
  }

  if (sessionMissing) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center bg-mkt-canvas px-4 py-8">
        <h1 className="font-display text-2xl tracking-tight text-mkt-ink">
          {t("inviteLinkExpiredTitle")}
        </h1>
        <p className="mt-2 text-muted">{t("inviteLinkExpired")}</p>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-muted transition-colors hover:text-foreground"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center bg-mkt-canvas px-4 py-8">
      <h1 className="font-display text-2xl tracking-tight text-mkt-ink">
        {t("resetPasswordTitle")}
      </h1>
      <p className="mt-2 text-muted">{t("resetPasswordSubtitle")}</p>
      <FormWrapper
        schema={resetPasswordSchema}
        onSubmit={onSubmit}
        className="mt-8 space-y-4"
      >
        <ResetPasswordFormFields loading={loading} />
      </FormWrapper>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm text-muted transition-colors hover:text-foreground"
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
