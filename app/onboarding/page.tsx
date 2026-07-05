"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { uploadUserAvatar } from "@/lib/profile/avatar";
import {
  completeProfileOnboarding,
  updateProfileName,
} from "@/lib/actions/profile-onboarding";
import { toast } from "@/lib/toast";

type StepId = "welcome" | "profile" | "photo";

const STEPS: StepId[] = ["welcome", "profile", "photo"];

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tRoles = useTranslations("roles");
  const tc = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/onboarding");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, avatar_url, onboarding_completed_at")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed_at) {
        router.replace("/");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");
      setRole(profile?.role ?? "student");
      setName(
        profile?.name?.trim() ||
          user.email?.split("@")[0] ||
          "User"
      );
      setAvatarUrl(profile?.avatar_url ?? null);
      setLoading(false);
    }

    void loadProfile();
  }, [router]);

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const roleLabel = tRoles(role as "student");

  async function handleNext() {
    if (currentStep === "profile") {
      const trimmed = name.trim();
      if (!trimmed) {
        toast.error(t("account.nameRequired"));
        return;
      }

      setSaving(true);
      try {
        const result = await updateProfileName(trimmed);
        if ("error" in result && result.error) throw new Error(result.error);
        setName(trimmed);
        setStepIndex((index) => index + 1);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("account.saveFailed")
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const result = await completeProfileOnboarding();
      if ("error" in result && result.error) throw new Error(result.error);
      toast.success(t("account.completeSuccess"));
      window.location.assign(
        ("data" in result && result.data?.destination) || "/"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("account.completeFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      const url = await uploadUserAvatar(file, userId);
      setAvatarUrl(url);
      toast.success(t("account.photoUploaded"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("account.photoUploadFailed")
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
        <div className="h-64 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">{t("account.badge")}</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 dark:text-white">
          {t("account.title")}
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t("account.subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                index <= stepIndex
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "bg-stone-200 text-stone-500 dark:bg-zinc-700"
              }`}
            >
              {index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-8 ${
                  index < stepIndex
                    ? "bg-stone-900 dark:bg-stone-100"
                    : "bg-stone-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-stone-600 dark:text-stone-400">
        {t("account.stepProgress", {
          current: stepIndex + 1,
          total: STEPS.length,
          title: t(`account.steps.${currentStep}.title`),
        })}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t(`account.steps.${currentStep}.title`)}</CardTitle>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t(`account.steps.${currentStep}.description`)}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {currentStep === "welcome" && (
            <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900/50">
              <p className="text-sm text-stone-700 dark:text-stone-300">
                {t("account.welcomeBody", { role: roleLabel })}
              </p>
              {email ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {t("account.signedInAs", { email })}
                </p>
              ) : null}
            </div>
          )}

          {currentStep === "profile" && (
            <div>
              <Label htmlFor="display_name" required>
                {t("account.displayName")}
              </Label>
              <Input
                id="display_name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("account.displayNamePlaceholder")}
                className="mt-1.5"
              />
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                {t("account.displayNameHint")}
              </p>
            </div>
          )}

          {currentStep === "photo" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="group relative rounded-full ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={t("account.uploadPhoto")}
              >
                <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" />
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
                <p className="font-medium text-stone-900 dark:text-white">{name}</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {uploading
                    ? t("account.photoUploading")
                    : avatarUrl
                      ? t("account.photoReady")
                      : t("account.photoPrompt")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
          disabled={stepIndex === 0 || saving || uploading}
        >
          {tc("back")}
        </Button>
        {isLastStep ? (
          <Button
            onClick={handleComplete}
            disabled={saving || uploading}
          >
            {saving ? tc("saving") : t("account.finish")}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={saving || uploading}>
            {saving ? tc("saving") : tc("next")}
          </Button>
        )}
      </div>
    </div>
  );
}
