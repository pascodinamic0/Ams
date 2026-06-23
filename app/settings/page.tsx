"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { InstallAppButton } from "@/components/pwa/install-app-button";
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

type ProfileInfo = {
  email: string;
  fullName: string;
  role: string;
  initial: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: row } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();

      const fullName = row?.name || user.email?.split("@")[0] || "User";
      setProfile({
        email: user.email ?? "",
        fullName,
        role: row?.role ?? "user",
        initial: fullName.charAt(0).toUpperCase(),
      });
    }
    loadProfile();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account preferences and security
        </p>
      </div>

      <AccountCard profile={profile} />
      <AppInstallCard />
      <SecurityCard />
    </div>
  );
}

function AccountCard({ profile }: { profile: ProfileInfo | null }) {
  if (!profile) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {profile.initial}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{profile.fullName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
            <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {profile.role}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppInstallCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Install app</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Install ShuleOS on your phone, tablet, or laptop for quick access and
          offline attendance support.
        </p>
      </CardHeader>
      <CardContent>
        <InstallAppButton />
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

      const { error } = await supabase.auth.updateUser({ password: data.new_password });
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
        <CardTitle>Security</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Change your account password.
        </p>
      </CardHeader>
      <CardContent>
        {done ? (
          <p className="text-green-600">Password changed successfully.</p>
        ) : (
          <FormWrapper schema={changePasswordSchema} onSubmit={onSubmit} className="space-y-5">
            <ChangePasswordFields loading={loading} />
          </FormWrapper>
        )}
      </CardContent>
    </Card>
  );
}

function ChangePasswordFields({ loading }: { loading: boolean }) {
  const { register, watch, formState: { errors } } = useFormContext<ChangePasswordData>();
  const newPassword = watch("new_password");

  return (
    <>
      <div>
        <Label htmlFor="current_password" required>Current password</Label>
        <Input id="current_password" type="password" error={!!errors.current_password} {...register("current_password")} />
        {errors.current_password && <p className="mt-1.5 text-sm text-red-500">{errors.current_password.message}</p>}
      </div>
      <div>
        <Label htmlFor="new_password" required>New password</Label>
        <Input id="new_password" type="password" error={!!errors.new_password} {...register("new_password")} />
        <PasswordStrength password={newPassword ?? ""} />
        {errors.new_password && <p className="mt-1.5 text-sm text-red-500">{errors.new_password.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirm_password" required>Confirm new password</Label>
        <Input id="confirm_password" type="password" error={!!errors.confirm_password} {...register("confirm_password")} />
        {errors.confirm_password && <p className="mt-1.5 text-sm text-red-500">{errors.confirm_password.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</Button>
    </>
  );
}
