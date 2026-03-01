"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 p-12 lg:flex lg:w-[45%]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">
            A
          </div>
          <span className="text-lg font-bold text-white">AMS</span>
        </Link>

        <div>
          <blockquote className="text-2xl font-semibold leading-snug text-white">
            "The operating system for schools — everything your team needs in one
            platform."
          </blockquote>
          <div className="mt-8 space-y-4">
            {[
              "Academic management & timetables",
              "Finance, fees & invoices",
              "Parent & student portals",
              "Analytics & reporting",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-indigo-200">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/30">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-indigo-400">
          © {new Date().getFullYear()} AMS. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to your AMS account to continue
            </p>
          </div>

          <Suspense fallback={<LoginSkeleton />}>
            <LoginFormContent />
          </Suspense>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/get-access"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Get access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      toast.success("Logged in successfully");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
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
  const {
    register,
    formState: { errors },
  } = useFormContext<LoginFormData>();

  return (
    <>
      <div>
        <Label htmlFor="email" required>
          Email address
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
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Forgot password?
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
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </>
  );
}
