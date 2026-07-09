"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resolvePostAuthDestination } from "@/lib/actions/post-auth-redirect";
import { toast } from "@/lib/toast";
import { companyIdentity } from "@/lib/company/identity";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const t = useTranslations("auth");
  const brandFeatures = [
    t("brandFeature1"),
    t("brandFeature2"),
    t("brandFeature3"),
    t("brandFeature4"),
  ];

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="relative hidden flex-col justify-center overflow-hidden border-r border-white/10 bg-black p-12 lg:flex lg:w-[45%]">
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="relative">
          <blockquote className="font-display text-2xl leading-snug tracking-wide text-white">
            &ldquo;{t("brandQuote")}&rdquo;
          </blockquote>
          <div className="mt-8 space-y-4">
            {brandFeatures.map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/60">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-500/40 text-amber-500">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-2xl tracking-wide text-white">
              {t("welcomeBack")}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {t("signInSubtitle", { productName: companyIdentity.productName })}
            </p>
          </div>

          <Suspense fallback={<LoginSkeleton />}>
            <LoginOAuthSection />
            <AuthDivider />
            <LoginFormContent />
          </Suspense>

          <p className="mt-6 text-center text-sm text-white/45">
            {t("noAccount")}{" "}
            <Link href="/get-access" className="font-medium text-amber-500 hover:text-amber-400">
              {t("getAccess")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginOAuthSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (!errorParam) return;

    toast.error(decodeURIComponent(errorParam));

    const nextParams = new URLSearchParams(window.location.search);
    nextParams.delete("error");
    const query = nextParams.toString();
    router.replace(query ? `/login?${query}` : "/login", { scroll: false });
  }, [errorParam, router]);

  return <GoogleAuthButton intent="login" redirect={redirectParam} />;
}

function LoginSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 animate-pulse rounded-lg bg-white/10" />
      <div className="h-10 animate-pulse rounded-lg bg-white/10" />
      <div className="h-10 animate-pulse rounded-lg bg-white/10" />
    </div>
  );
}

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth");
  const tv = useTranslations("validation");

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(tv("invalidEmail")),
        password: z.string().min(1, tv("passwordRequired")),
      }),
    [tv]
  );

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;

      let destination = redirectParam ?? "/admin";

      if (authData.user) {
        destination = await resolvePostAuthDestination({
          userId: authData.user.id,
          redirect: redirectParam,
        });
      }

      toast.success(t("signInSuccess"));
      window.location.assign(destination);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("signInFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormWrapper schema={loginSchema} onSubmit={onSubmit} className="space-y-5">
      <LoginFormFields loading={loading} />
    </FormWrapper>
  );
}

function LoginFormFields({ loading }: { loading: boolean }) {
  const t = useTranslations("auth");
  const {
    register,
    formState: { errors },
  } = useFormContext<LoginFormData>();

  return (
    <>
      <div>
        <Label htmlFor="email" required>
          {t("email")}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@school.com"
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" required>
            {t("password")}
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-amber-500 hover:text-amber-400"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          error={!!errors.password}
          {...register("password")}
        />
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
            {t("signingIn")}
          </span>
        ) : (
          t("signIn")
        )}
      </Button>
    </>
  );
}
