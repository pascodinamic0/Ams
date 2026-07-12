"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Check, ImagePlus, Sparkles, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { CameraCaptureModal } from "@/components/profile/camera-capture-modal";
import { createClient } from "@/lib/supabase/client";
import { uploadUserAvatar } from "@/lib/profile/avatar";
import {
  completeProfileOnboarding,
  updateProfileName,
} from "@/lib/actions/profile-onboarding";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type StepId = "welcome" | "profile" | "photo";

const STEPS: StepId[] = ["welcome", "profile", "photo"];

const STEP_ICONS = {
  welcome: Sparkles,
  profile: UserRound,
  photo: Camera,
} as const;

const ambientByStep = [
  "bg-amber-500/15 left-[8%] top-[18%]",
  "bg-amber-400/12 right-[6%] top-[28%]",
  "bg-orange-500/10 left-[20%] bottom-[12%]",
];

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tRoles = useTranslations("roles");
  const tc = useTranslations("common");
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
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
  const StepIcon = STEP_ICONS[currentStep];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function goToStep(nextIndex: number) {
    if (nextIndex === stepIndex) return;
    setDirection(nextIndex > stepIndex ? 1 : -1);
    setStepIndex(nextIndex);
  }

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
        goToStep(stepIndex + 1);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("account.saveFailed")
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
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

  async function uploadPhoto(file: File) {
    if (!userId) {
      throw new Error(t("account.photoUploadFailed"));
    }

    setUploading(true);
    try {
      const url = await uploadUserAvatar(file, userId);
      setAvatarUrl(url);
      toast.success(t("account.photoUploaded"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("account.photoUploadFailed")
      );
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadPhoto(file);
    } catch {
      // Toast already shown in uploadPhoto
    } finally {
      event.target.value = "";
    }
  }

  async function handleCameraCapture(file: File) {
    await uploadPhoto(file);
  }

  const slideVariants = {
    enter: (dir: number) =>
      reduceMotion
        ? { opacity: 0 }
        : {
            opacity: 0,
            x: dir > 0 ? 56 : -56,
            y: 12,
            scale: 0.96,
            filter: "blur(6px)",
          },
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) =>
      reduceMotion
        ? { opacity: 0 }
        : {
            opacity: 0,
            x: dir > 0 ? -40 : 40,
            y: -8,
            scale: 0.98,
            filter: "blur(4px)",
          },
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded bg-white/5" />
        <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ambient glow that drifts with each step */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={`glow-${stepIndex}`}
            className={cn(
              "absolute h-64 w-64 rounded-full blur-[100px]",
              ambientByStep[stepIndex]
            )}
            initial={reduceMotion ? { opacity: 0.35 } : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>

      <div className="space-y-7">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            {t("account.badge")}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-white sm:text-4xl">
            {t("account.title")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
            {t("account.subtitle")}
          </p>
        </motion.div>

        {/* Progress rail */}
        <div className="space-y-3">
          <div className="relative h-px bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 origin-left bg-amber-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, index) => {
              const active = index === stepIndex;
              const complete = index < stepIndex;
              const Icon = STEP_ICONS[step];

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    if (index < stepIndex && !saving && !uploading) {
                      goToStep(index);
                    }
                  }}
                  disabled={index > stepIndex || saving || uploading}
                  className={cn(
                    "group flex flex-1 flex-col items-center gap-2 disabled:cursor-default",
                    index < stepIndex && "cursor-pointer"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  <motion.span
                    animate={{
                      scale: active ? 1.08 : 1,
                      borderColor: active || complete ? "rgb(245 158 11)" : "rgba(255,255,255,0.15)",
                      backgroundColor:
                        complete
                          ? "rgb(245 158 11)"
                          : active
                            ? "rgba(245,158,11,0.12)"
                            : "rgba(0,0,0,0)",
                      color:
                        complete
                          ? "rgb(0 0 0)"
                          : active
                            ? "rgb(245 158 11)"
                            : "rgba(255,255,255,0.35)",
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border"
                  >
                    {complete ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </motion.span>
                  <span
                    className={cn(
                      "hidden text-[10px] font-semibold uppercase tracking-[0.16em] sm:block",
                      active || complete ? "text-white/70" : "text-white/30"
                    )}
                  >
                    {t(`account.steps.${step}.title`)}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-white/40 sm:text-left">
            {t("account.stepProgress", {
              current: stepIndex + 1,
              total: STEPS.length,
              title: t(`account.steps.${currentStep}.title`),
            })}
          </p>
        </div>

        {/* Step stage */}
        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: reduceMotion ? 0.15 : 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="p-6 sm:p-7"
            >
              <div className="mb-5 flex items-start gap-3">
                <motion.div
                  initial={reduceMotion ? false : { rotate: -8, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/40 text-amber-500"
                >
                  <StepIcon className="h-5 w-5" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {t(`account.steps.${currentStep}.title`)}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {t(`account.steps.${currentStep}.description`)}
                  </p>
                </div>
              </div>

              {currentStep === "welcome" && (
                <div className="space-y-3 border border-white/10 bg-black/40 p-4">
                  <p className="text-sm leading-relaxed text-white/70">
                    {t("account.welcomeBody", { role: roleLabel })}
                  </p>
                  {email ? (
                    <p className="text-xs uppercase tracking-[0.14em] text-white/40">
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
                    className="mt-1.5 border-white/15 bg-black/50 text-white placeholder:text-white/30 focus:ring-amber-500"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-white/40">
                    {t("account.displayNameHint")}
                  </p>
                </div>
              )}

              {currentStep === "photo" && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <motion.div
                    initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                    className="relative"
                  >
                    <div className="absolute -inset-3 rounded-full bg-amber-500/10 blur-xl" />
                    <UserAvatar
                      name={name}
                      avatarUrl={avatarUrl}
                      size="lg"
                      className="relative h-20 w-20 text-2xl ring-2 ring-amber-500/30"
                    />
                  </motion.div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <div>
                    <p className="font-medium text-white">{name}</p>
                    <p className="mt-1 text-sm text-white/45">
                      {uploading
                        ? t("account.photoUploading")
                        : avatarUrl
                          ? t("account.photoReady")
                          : t("account.photoPrompt")}
                    </p>
                  </div>
                  <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="w-full rounded-full border-white/25 bg-transparent text-white hover:bg-white/5 sm:w-auto"
                    >
                      <ImagePlus className="mr-1.5 h-4 w-4" />
                      {t("account.uploadPhoto")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCameraOpen(true)}
                      disabled={uploading}
                      className="w-full rounded-full border-white/25 bg-transparent text-white hover:bg-white/5 sm:w-auto"
                    >
                      <Camera className="mr-1.5 h-4 w-4" />
                      {t("account.takePhoto")}
                    </Button>
                  </div>
                  <CameraCaptureModal
                    isOpen={cameraOpen}
                    onClose={() => setCameraOpen(false)}
                    onCapture={handleCameraCapture}
                    disabled={uploading}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => goToStep(Math.max(stepIndex - 1, 0))}
            disabled={stepIndex === 0 || saving || uploading}
            className="rounded-full text-white/60 hover:bg-white/5 hover:text-white"
          >
            {tc("back")}
          </Button>
          {isLastStep ? (
            <Button
              onClick={handleComplete}
              disabled={saving || uploading}
              className="rounded-full bg-white px-6 text-black hover:bg-white/90 focus:ring-amber-500"
            >
              {saving ? tc("saving") : t("account.finish")}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={saving || uploading}
              className="rounded-full bg-white px-6 text-black hover:bg-white/90 focus:ring-amber-500"
            >
              {saving ? tc("saving") : tc("next")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
