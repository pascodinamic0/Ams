"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Check,
  GraduationCap,
  ListChecks,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  createSchoolStructure,
  skipSchoolStructureSetup,
} from "@/lib/actions/school-structure";
import {
  GRADE_PRESETS_BY_LEVEL,
  SCHOOL_LEVELS,
  defaultGradeIdsForLevel,
  type SchoolLevel,
} from "@/lib/schools/structure-presets";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type StepId = "level" | "grades" | "confirm";

const STEPS: StepId[] = ["level", "grades", "confirm"];

const STEP_ICONS = {
  level: Building2,
  grades: GraduationCap,
  confirm: ListChecks,
} as const;

const ambientByStep = [
  "bg-amber-500/15 left-[8%] top-[18%]",
  "bg-amber-400/12 right-[6%] top-[28%]",
  "bg-orange-500/10 left-[20%] bottom-[12%]",
];

function SchoolStructureOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding.structure");
  const tc = useTranslations("common");
  const reduceMotion = useReducedMotion();
  const isDevPreview =
    process.env.NODE_ENV === "development" &&
    searchParams.get("preview") === "1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [schoolName, setSchoolName] = useState("");
  const [level, setLevel] = useState<SchoolLevel | null>(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [customGrades, setCustomGrades] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState("");

  useEffect(() => {
    async function load() {
      if (isDevPreview) {
        setSchoolName("Groupe Scolaire L'Aricharde");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/onboarding/school");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, school_id, onboarding_completed_at")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_completed_at) {
        router.replace("/onboarding");
        return;
      }

      if (profile.role !== "academic_admin" || !profile.school_id) {
        router.replace("/");
        return;
      }

      const { data: school } = await supabase
        .from("schools")
        .select("name, status, school_level, structure_setup_completed_at")
        .eq("id", profile.school_id)
        .single();

      if (!school || school.status !== "approved") {
        router.replace("/pending");
        return;
      }

      const { data: branches } = await supabase
        .from("branches")
        .select("id")
        .eq("school_id", profile.school_id);

      const branchIds = (branches ?? []).map((b) => b.id);
      let classCount = 0;
      if (branchIds.length > 0) {
        const { count } = await supabase
          .from("classes")
          .select("id", { count: "exact", head: true })
          .in("branch_id", branchIds);
        classCount = count ?? 0;
      }

      if (school.structure_setup_completed_at && classCount > 0) {
        router.replace("/academic/classes");
        return;
      }

      setSchoolName(school.name);
      if (school.school_level) {
        const existingLevel = school.school_level as SchoolLevel;
        setLevel(existingLevel);
        setSelectedGradeIds(defaultGradeIdsForLevel(existingLevel));
      }
      setLoading(false);
    }

    void load();
  }, [router, isDevPreview]);

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const StepIcon = STEP_ICONS[currentStep];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const presetGrades = level ? GRADE_PRESETS_BY_LEVEL[level] : [];

  const selectedGrades = useMemo(() => {
    const fromPresets = presetGrades
      .filter((g) => selectedGradeIds.includes(g.id))
      .map((g) => g.grade);
    return [...fromPresets, ...customGrades];
  }, [presetGrades, selectedGradeIds, customGrades]);

  const plannedCount = selectedGrades.length;
  const previewNames = useMemo(
    () => selectedGrades.slice(0, 8),
    [selectedGrades]
  );

  function goToStep(nextIndex: number) {
    if (nextIndex === stepIndex) return;
    setDirection(nextIndex > stepIndex ? 1 : -1);
    setStepIndex(nextIndex);
  }

  function selectLevel(next: SchoolLevel) {
    setLevel(next);
    setSelectedGradeIds(defaultGradeIdsForLevel(next));
    if (next !== "other") {
      setCustomGrades([]);
      setCustomDraft("");
    }
  }

  function toggleGradeId(id: string) {
    setSelectedGradeIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addCustomGrade() {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (
      customGrades.some((g) => g.toLowerCase() === trimmed.toLowerCase()) ||
      presetGrades.some((g) => g.grade.toLowerCase() === trimmed.toLowerCase())
    ) {
      toast.error(t("duplicateGrade"));
      return;
    }
    setCustomGrades((current) => [...current, trimmed]);
    setCustomDraft("");
  }

  function removeCustomGrade(grade: string) {
    setCustomGrades((current) => current.filter((item) => item !== grade));
  }

  function handleNext() {
    if (currentStep === "level" && !level) {
      toast.error(t("levelRequired"));
      return;
    }
    if (currentStep === "grades" && selectedGrades.length === 0) {
      toast.error(t("gradesRequired"));
      return;
    }
    goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
  }

  async function handleCreate() {
    if (!level) {
      toast.error(t("levelRequired"));
      return;
    }
    if (selectedGrades.length === 0) {
      toast.error(t("gradesRequired"));
      return;
    }

    if (isDevPreview) {
      toast.success(t("createSuccess", { count: plannedCount }));
      return;
    }

    setSaving(true);
    try {
      const result = await createSchoolStructure({
        school_level: level,
        grades: selectedGrades,
      });
      if ("error" in result && result.error) throw new Error(result.error);
      toast.success(
        t("createSuccess", {
          count: ("data" in result && result.data?.createdCount) || plannedCount,
        })
      );
      window.location.assign(
        ("data" in result && result.data?.destination) || "/academic"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("createFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    if (isDevPreview) {
      toast.success(t("skipSuccess"));
      return;
    }

    setSaving(true);
    try {
      const result = await skipSchoolStructureSetup();
      if ("error" in result && result.error) throw new Error(result.error);
      toast.success(t("skipSuccess"));
      window.location.assign(
        ("data" in result && result.data?.destination) || "/academic"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("skipFailed")
      );
    } finally {
      setSaving(false);
    }
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
            {t("badge")}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-white sm:text-4xl">
            {t("title", { school: schoolName })}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            {t("subtitle")}
          </p>
        </motion.div>

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
                    if (index < stepIndex && !saving) goToStep(index);
                  }}
                  disabled={index > stepIndex || saving}
                  className={cn(
                    "group flex flex-1 flex-col items-center gap-2 disabled:cursor-default",
                    index < stepIndex && "cursor-pointer"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  <motion.span
                    animate={{
                      scale: active ? 1.08 : 1,
                      borderColor:
                        active || complete
                          ? "rgb(245 158 11)"
                          : "rgba(255,255,255,0.15)",
                      backgroundColor: complete
                        ? "rgb(245 158 11)"
                        : active
                          ? "rgba(245,158,11,0.12)"
                          : "rgba(0,0,0,0)",
                      color: complete
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
                    {t(`steps.${step}.title`)}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-white/40 sm:text-left">
            {t("stepProgress", {
              current: stepIndex + 1,
              total: STEPS.length,
              title: t(`steps.${currentStep}.title`),
            })}
          </p>
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
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
                    {t(`steps.${currentStep}.title`)}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {t(`steps.${currentStep}.description`)}
                  </p>
                </div>
              </div>

              {currentStep === "level" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {SCHOOL_LEVELS.map((value) => {
                    const active = level === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectLevel(value)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left transition",
                          active
                            ? "border-amber-500 bg-amber-500/15 text-white"
                            : "border-white/10 bg-black/30 text-white/70 hover:border-white/25 hover:text-white"
                        )}
                      >
                        <p className="text-sm font-semibold">
                          {t(`levels.${value}.label`)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">
                          {t(`levels.${value}.hint`)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentStep === "grades" && (
                <div className="space-y-4">
                  {presetGrades.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {presetGrades.map((grade) => {
                        const active = selectedGradeIds.includes(grade.id);
                        return (
                          <button
                            key={grade.id}
                            type="button"
                            onClick={() => toggleGradeId(grade.id)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm transition",
                              active
                                ? "border-amber-500 bg-amber-500 text-black"
                                : "border-white/15 bg-black/30 text-white/70 hover:border-white/30"
                            )}
                          >
                            {grade.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">{t("customGradesOnly")}</p>
                  )}

                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <Label htmlFor="custom_grade">{t("customGradeLabel")}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom_grade"
                        value={customDraft}
                        onChange={(event) => setCustomDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomGrade();
                          }
                        }}
                        placeholder={t("customGradePlaceholder")}
                        className="border-white/15 bg-black/50 text-white placeholder:text-white/30 focus:ring-amber-500"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addCustomGrade}
                        disabled={!customDraft.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">{t("addGrade")}</span>
                      </Button>
                    </div>
                    {customGrades.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {customGrades.map((grade) => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => removeCustomGrade(grade)}
                            className="rounded-full border border-amber-500/50 bg-amber-500/15 px-3 py-1 text-sm text-amber-100"
                          >
                            {grade} ×
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {currentStep === "confirm" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <p className="text-sm text-white/70">
                      {t("confirmSummary", {
                        level: level ? t(`levels.${level}.label`) : "",
                        grades: selectedGrades.length,
                        classes: plannedCount,
                      })}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/40">
                      {t("noStudentsNote")}
                    </p>
                  </div>
                  {previewNames.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/40">
                        {t("previewLabel")}
                      </p>
                      <ul className="space-y-1 text-sm text-white/65">
                        {previewNames.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                        {plannedCount > previewNames.length ? (
                          <li className="text-white/40">
                            {t("previewMore", {
                              count: plannedCount - previewNames.length,
                            })}
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => goToStep(stepIndex - 1)}
                className="text-white/70 hover:bg-white/5 hover:text-white"
              >
                {tc("back")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => void handleSkip()}
                className="text-white/50 hover:bg-white/5 hover:text-white/80"
              >
                {t("skip")}
              </Button>
            )}
          </div>

          <Button
            type="button"
            disabled={saving}
            onClick={() => {
              if (isLastStep) void handleCreate();
              else handleNext();
            }}
            className="bg-amber-500 text-black hover:bg-amber-400"
          >
            {saving
              ? tc("saving")
              : isLastStep
                ? t("createClasses", { count: plannedCount })
                : tc("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SchoolStructureFallback() {
  return (
    <div className="space-y-5">
      <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
      <div className="h-10 w-64 animate-pulse rounded-lg bg-white/10" />
      <div className="h-4 w-full max-w-sm animate-pulse rounded bg-white/5" />
      <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
    </div>
  );
}

export default function SchoolStructureOnboardingPageRoute() {
  return (
    <Suspense fallback={<SchoolStructureFallback />}>
      <SchoolStructureOnboardingPage />
    </Suspense>
  );
}
