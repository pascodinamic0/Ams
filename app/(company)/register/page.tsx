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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Register your school
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Create your school account to get started
      </p>
      <FormWrapper
        schema={registerSchema}
        onSubmit={onSubmit}
        className="mt-8 space-y-4"
      >
        <RegisterFormFields loading={loading} />
      </FormWrapper>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium hover:underline">
          Login
        </Link>
      </p>
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
        <Label htmlFor="school_name" required>School name</Label>
        <Input
          id="school_name"
          placeholder="Your School"
          error={!!errors.school_name}
          {...register("school_name")}
        />
        {errors.school_name && (
          <p className="mt-1 text-sm text-red-500">{errors.school_name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="admin_email" required>Admin email</Label>
        <Input
          id="admin_email"
          type="email"
          placeholder="admin@school.com"
          error={!!errors.admin_email}
          {...register("admin_email")}
        />
        {errors.admin_email && (
          <p className="mt-1 text-sm text-red-500">{errors.admin_email.message}</p>
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
        <PasswordStrength password={password ?? ""} />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </>
  );
}
