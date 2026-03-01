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
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.admin_email,
        password: data.password,
        options: { data: { school_name: data.school_name } },
      });
      if (error) throw error;
      toast.success("Account created. Check your email to confirm.");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

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
          <h2 className="text-3xl font-bold leading-tight text-white">
            Get your school up and running in minutes
          </h2>
          <p className="mt-4 text-indigo-200">
            Create your account, complete the 4-step school setup, and your team
            can start using AMS today.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { step: "1", label: "Register your school" },
              { step: "2", label: "Set domain & colors" },
              { step: "3", label: "Choose your site template" },
              { step: "4", label: "Invite your team" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/40 text-xs font-bold text-white">
                  {s.step}
                </div>
                <span className="text-sm text-indigo-200">{s.label}</span>
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
              Register your school
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create your school account to get started with AMS
            </p>
          </div>

          <FormWrapper
            schema={registerSchema}
            onSubmit={onSubmit}
            className="space-y-5"
          >
            <RegisterFormFields loading={loading} />
          </FormWrapper>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterFormFields({ loading }: { loading: boolean }) {
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
          School name
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
          Admin email
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
          Password
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
            Creating account...
          </span>
        ) : (
          "Create school account"
        )}
      </Button>
    </>
  );
}
