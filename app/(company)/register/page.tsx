"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { buildAuthCallbackUrl } from "@/lib/auth/app-url";
import { companyIdentity } from "@/lib/company/identity";
import { registerSchoolOrganization } from "@/lib/actions/school-registration";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type RegisterFormData = {
  school_name: string;
  admin_email: string;
  password: string;
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const registerSteps = [
    { step: "1", label: t("registerStep1") },
    { step: "2", label: t("registerStep2") },
    { step: "3", label: t("registerStep3") },
    { step: "4", label: t("registerStep4") },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden flex-col justify-center bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 p-12 lg:flex lg:w-[45%]">
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            {t("registerBrandTitle")}
          </h2>
          <p className="mt-4 text-teal-200">
            {t("registerBrandSubtitle", { productName: companyIdentity.productName })}
          </p>
          <div className="mt-8 space-y-3">
            {registerSteps.map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/40 text-xs font-bold text-white">
                  {s.step}
                </div>
                <span className="text-sm text-teal-200">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {t("registerTitle")}
            </h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {t("registerFormSubtitle", { productName: companyIdentity.productName })}
            </p>
          </div>

          <Suspense fallback={<RegisterOAuthSkeleton />}>
            <RegisterOAuthSection />
          </Suspense>

          <AuthDivider label={t("orRegisterWithEmail")} />

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover dark:text-primary"
            >
              {t("signInLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth");
  const tv = useTranslations("validation");

  const registerSchema = useMemo(
    () =>
      z.object({
        school_name: z.string().min(1, tv("schoolNameRequired")),
        admin_email: z.string().email(tv("invalidEmail")),
        password: z.string().min(8, tv("passwordMinLength")),
      }),
    [tv]
  );

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.admin_email,
        password: data.password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(),
          data: {
            school_name: data.school_name,
            name: data.school_name,
            role: "academic_admin",
          },
        },
      });
      if (error) throw error;
      if (!authData.user) throw new Error(t("registrationFailed"));

      if (!authData.user.identities?.length) {
        throw new Error(t("accountAlreadyExists"));
      }

      const org = await registerSchoolOrganization({
        userId: authData.user.id,
        schoolName: data.school_name,
        adminEmail: data.admin_email,
      });

      if (org.error) {
        throw new Error(org.error);
      }

      if (authData.session) {
        window.location.assign("/pending");
        return;
      }

      const successParams = new URLSearchParams({
        school: data.school_name,
        email: data.admin_email,
      });
      window.location.assign(`/register/success?${successParams.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper schema={registerSchema} onSubmit={onSubmit} className="space-y-5">
      <RegisterFormFields loading={loading} />
    </FormWrapper>
  );
}

function RegisterOAuthSection() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  return <GoogleAuthButton intent="register" />;
}

function RegisterOAuthSkeleton() {
  return (
    <div className="h-10 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
  );
}

function RegisterFormFields({ loading }: { loading: boolean }) {
  const t = useTranslations("auth");
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegisterFormData>();
  const password = watch("password");

  return (
    <>
      <div>
        <Label htmlFor="school_name" required>
          {t("schoolName")}
        </Label>
        <Input
          id="school_name"
          placeholder="Greenfield Academy"
          error={!!errors.school_name}
          {...register("school_name")}
        />
        {errors.school_name && (
          <p className="mt-1.5 text-sm text-red-500">{errors.school_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="admin_email" required>
          {t("adminEmail")}
        </Label>
        <Input
          id="admin_email"
          type="email"
          placeholder="admin@school.com"
          error={!!errors.admin_email}
          {...register("admin_email")}
        />
        {errors.admin_email && (
          <p className="mt-1.5 text-sm text-red-500">{errors.admin_email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" required>
          {t("password")}
        </Label>
        <Input
          id="password"
          type="password"
          error={!!errors.password}
          {...register("password")}
        />
        <PasswordStrength password={password ?? ""} />
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("creatingAccount")}
          </span>
        ) : (
          t("createSchoolAccount")
        )}
      </Button>
    </>
  );
}
