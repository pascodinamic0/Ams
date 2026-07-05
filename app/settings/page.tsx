"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { UserAvatar } from "@/components/layout/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { uploadUserAvatar } from "@/lib/profile/avatar";
import { toast } from "@/lib/toast";

type ChangePasswordData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type ProfileInfo = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tRoles = useTranslations("roles");
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: row } = await supabase
        .from("profiles")
        .select("name, role, avatar_url")
        .eq("id", user.id)
        .single();

      const fullName = row?.name || user.email?.split("@")[0] || "User";
      setProfile({
        id: user.id,
        email: user.email ?? "",
        fullName,
        role: row?.role ?? "user",
        avatarUrl: row?.avatar_url ?? null,
      });
    }
    loadProfile();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("subtitle")}
        </p>
      </div>

      <AccountCard
        profile={profile}
        roleLabel={profile ? tRoles(profile.role as "student") : ""}
        onAvatarUpdated={(avatarUrl) =>
          setProfile((current) => (current ? { ...current, avatarUrl } : current))
        }
      />
      <LanguageCard />
      <AppInstallCard />
      <SecurityCard />
    </div>
  );
}

function AccountCard({
  profile,
  roleLabel,
  onAvatarUpdated,
}: {
  profile: ProfileInfo | null;
  roleLabel: string;
  onAvatarUpdated: (avatarUrl: string) => void;
}) {
  const t = useTranslations("settings");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-16 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
        </CardContent>
      </Card>
    );
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const avatarUrl = await uploadUserAvatar(file, profile.id);
      onAvatarUpdated(avatarUrl);
      toast.success(t("avatarUpdated"));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("avatarUpdateFailed"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="group relative rounded-full ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={t("changeAvatar")}
          >
            <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="lg" />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <Camera className="h-5 w-5" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div>
            <p className="font-medium text-stone-900 dark:text-white">{profile.fullName}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">{profile.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-hover dark:bg-primary-light dark:text-primary">
              {roleLabel || profile.role}
            </span>
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
              {uploading ? t("avatarUploading") : t("avatarHint")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageCard() {
  const t = useTranslations("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("language")}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("languageDescription")}
        </p>
      </CardHeader>
      <CardContent>
        <LanguageSwitcher variant="buttons" />
      </CardContent>
    </Card>
  );
}

function AppInstallCard() {
  const t = useTranslations("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("installApp")}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("installAppDescription")}
        </p>
      </CardHeader>
      <CardContent>
        <InstallAppButton />
      </CardContent>
    </Card>
  );
}

function SecurityCard() {
  const t = useTranslations("settings");
  const tv = useTranslations("validation");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const changePasswordSchema = useMemo(
    () =>
      z
        .object({
          current_password: z.string().min(1, tv("currentPasswordRequired")),
          new_password: z
            .string()
            .min(8, tv("passwordMinLength"))
            .regex(/[A-Z]/, tv("passwordUppercase"))
            .regex(/[a-z]/, tv("passwordLowercase"))
            .regex(/\d/, tv("passwordNumber")),
          confirm_password: z.string().min(1, tv("confirmPasswordRequired")),
        })
        .refine((d) => d.new_password === d.confirm_password, {
          message: tv("passwordsDoNotMatch"),
          path: ["confirm_password"],
        }),
    [tv]
  );

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
          toast.error(tv("currentPasswordIncorrect"));
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password: data.new_password });
      if (error) throw error;

      toast.success(t("passwordUpdated"));
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("passwordUpdateFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("security")}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("securityDescription")}
        </p>
      </CardHeader>
      <CardContent>
        {done ? (
          <p className="text-green-600">{t("passwordChanged")}</p>
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
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { register, watch, formState: { errors } } = useFormContext<ChangePasswordData>();
  const newPassword = watch("new_password");

  return (
    <>
      <div>
        <Label htmlFor="current_password" required>{t("currentPassword")}</Label>
        <Input id="current_password" type="password" error={!!errors.current_password} {...register("current_password")} />
        {errors.current_password && <p className="mt-1.5 text-sm text-red-500">{errors.current_password.message}</p>}
      </div>
      <div>
        <Label htmlFor="new_password" required>{t("newPassword")}</Label>
        <Input id="new_password" type="password" error={!!errors.new_password} {...register("new_password")} />
        <PasswordStrength password={newPassword ?? ""} />
        {errors.new_password && <p className="mt-1.5 text-sm text-red-500">{errors.new_password.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirm_password" required>{t("confirmNewPassword")}</Label>
        <Input id="confirm_password" type="password" error={!!errors.confirm_password} {...register("confirm_password")} />
        {errors.confirm_password && <p className="mt-1.5 text-sm text-red-500">{errors.confirm_password.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>{loading ? tc("updating") : t("updatePassword")}</Button>
    </>
  );
}
