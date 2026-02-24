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
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 space-y-4">
        <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function LoginPageContent() {
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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Login
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Sign in to your account
      </p>
      <FormWrapper
        schema={loginSchema}
        onSubmit={onSubmit}
        className="mt-8 space-y-4"
      >
        <LoginFormFields loading={loading} />
      </FormWrapper>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/get-access" className="font-medium hover:underline">
          Get access
        </Link>
      </p>
    </div>
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
        <Label htmlFor="email" required>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@school.com"
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password" required>Password</Label>
        <Input
          id="password"
          type="password"
          error={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <Link
        href="/forgot-password"
        className="block text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        Forgot password?
      </Link>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </>
  );
}
