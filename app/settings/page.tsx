"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/\d/, "Must include a number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account preferences and security
        </p>
      </div>

      <AccountCard />
      <SecurityCard />
    </div>
  );
}

function AccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            S
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Super Admin
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              pascodinamic00@gmail.com
            </p>
            <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              super_admin
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityCard() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(data: ChangePasswordData) {
    setLoading(true);
    try {
      const supabase = createClient();

      // Re-authenticate with current password first
      const { data: session } = await supabase.auth.getSession();
      const email = session?.session?.user?.email;

      if (email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: data.current_password,
        });
        if (signInError) {
          toast.error("Current password is incorrect");
          return;
        }
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Security</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950">
            <svg
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Change your account password. Use a strong password with at least 8
          characters.
        </p>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-4 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Password changed successfully</p>
              <p className="mt-0.5 text-sm opacity-80">
                Your new password is active. You may be asked to sign in again on other devices.
              </p>
            </div>
          </div>
        ) : (
          <FormWrapper
            schema={changePasswordSchema}
            onSubmit={onSubmit}
            className="space-y-5"
          >
            <ChangePasswordFields loading={loading} />
          </FormWrapper>
        )}
      </CardContent>
    </Card>
  );
}

function ChangePasswordFields({ loading }: { loading: boolean }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ChangePasswordData>();
  const newPassword = watch("new_password");

  return (
    <>
      <div>
        <Label htmlFor="current_password" required>
          Current password
        </Label>
        <Input
          id="current_password"
          type="password"
          placeholder="Your current password"
          error={!!errors.current_password}
          {...register("current_password")}
        />
        {errors.current_password && (
          <p className="mt-1.5 text-sm text-red-500">
            {errors.current_password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="new_password" required>
          New password
        </Label>
        <Input
          id="new_password"
          type="password"
          placeholder="At least 8 characters"
          error={!!errors.new_password}
          {...register("new_password")}
        />
        <PasswordStrength password={newPassword ?? ""} />
        {errors.new_password && (
          <p className="mt-1.5 text-sm text-red-500">
            {errors.new_password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirm_password" required>
          Confirm new password
        </Label>
        <Input
          id="confirm_password"
          type="password"
          placeholder="Repeat new password"
          error={!!errors.confirm_password}
          {...register("confirm_password")}
        />
        {errors.confirm_password && (
          <p className="mt-1.5 text-sm text-red-500">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Updating...
            </span>
          ) : (
            "Update password"
          )}
        </Button>
        <p className="text-xs text-slate-400">
          You&apos;ll stay logged in after changing your password.
        </p>
      </div>
    </>
  );
}
