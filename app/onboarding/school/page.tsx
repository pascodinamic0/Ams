"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Check,
  GraduationCap,
  Layers3,
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
  SECTION_LETTERS,
  buildClassName,
  countPlannedClasses,
  defaultGradeIdsForLevel,
  type SchoolLevel,
  type SectionLetter,
} from "@/lib/schools/structure-presets";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type StepId = "level" | "grades" | "sections" | "confirm";

const STEPS: StepId[] = ["level", "grades", "sections", "confirm"];

const STEP_ICONS = {
  level: Building2,
  grades: GraduationCap,
  sections: Layers3,
  confirm: ListChecks,
} as const;

const ambientByStep = [
  "bg-amber-500/15 left-[8%] top-[18%]",
  "bg-amber-400/12 right-[6%] top-[28%]",
  "bg-orange-500/10 left-[20%] bottom-[12%]",
  "bg-amber-500/12 right-[12%] bottom-[18%]",
];

export default function SchoolStructureOnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding.structure");
  const tc = useTranslations("common");
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [schoolName, setSchoolName] = useState("");
  const [level, setLevel] = useState<SchoolLevel | null>(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [customGrades, setCustomGrades] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState("");
  const [sections, setSections] = useState<SectionLetter[]>(["A"]);

  useEffect(() => {
    async function load() {
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
  }, [router]);

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

  const plannedCount = countPlannedClasses(selectedGrades, sections);
  const previewNames = useMemo(() => {
    const names: string[] = [];
    for (const grade of selectedGrades) {
      for (const section of sections) {
        names.push(buildClassName(grade, section));
        if (names.length >= 8) return names;
      }
    }
    return names;
  }, [selectedGrades, sections]);

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

  function toggleSection(letter: SectionLetter) {
    setSections((current) => {
      if (current.includes(letter)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== letter);
      }
      return [...current, letter].sort();
    });
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
    if (currentStep === "sections" && sections.length === 0) {
      toast.error(t("sectionsRequired"));
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

    setSaving(true);
    try {
      const result = await createSchoolStructure({
        school_level: level,
        grades: selectedGrades,
        sections,
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
        <div className="h-3 w-28 animate-pulse rounded-full bg-mkt-ink/10" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-mkt-ink/10" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded bg-mkt-ink/5" />
        <div className="h-56 animate-pulse border border-mkt-ink/10 bg-mkt-ink/[0.03]" />
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

      <div className="space-y-6 sm:space-y-7">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {t("badge")}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-mkt-ink sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mkt-ink/55">
            {t("subtitle", { school: schoolName })}
          </p>
        </motion.div>

        <div className="space-y-3">
          <div className="relative h-px bg-mkt-ink/10">
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
                    animate={{ scale: active ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border",
                      complete
                        ? "border-amber-500 bg-amber-500 text-black"
                        : active
                          ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-500"
                          : "border-mkt-ink/15 text-mkt-ink/35"
                    )}
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
                      active || complete ? "text-mkt-ink/70" : "text-mkt-ink/30"
                    )}
                  >
                    {t(`steps.${step}.title`)}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-mkt-ink/45 sm:text-left">
            {t("stepProgress", {
              current: stepIndex + 1,
              total: STEPS.length,
              title: t(`steps.${currentStep}.title`),
            })}
          </p>
        </div>

        <div className="relative min-h-[280px] overflow-hidden border border-mkt-ink/10 bg-mkt-ink/[0.02]">
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
              className="p-5 sm:p-7"
            >
              <div className="mb-5 flex items-start gap-3">
                <motion.div
                  initial={reduceMotion ? false : { rotate: -8, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/40 text-amber-600 dark:text-amber-500"
                >
                  <StepIcon className="h-5 w-5" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-mkt-ink">
                    {t(`steps.${currentStep}.title`)}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-mkt-ink/55">
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
                          "border px-4 py-3 text-left transition",
                          active
                            ? "border-amber-500 bg-amber-500/15 text-mkt-ink"
                            : "border-mkt-ink/10 bg-mkt-ink/[0.03] text-mkt-ink/70 hover:border-mkt-ink/25 hover:text-mkt-ink"
                        )}
                      >
                        <p className="text-sm font-semibold">
                          {t(`levels.${value}.label`)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-mkt-ink/50">
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
                                : "border-mkt-ink/15 bg-mkt-ink/[0.03] text-mkt-ink/70 hover:border-mkt-ink/30"
                            )}
                          >
                            {grade.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-mkt-ink/55">{t("customGradesOnly")}</p>
                  )}

                  <div className="space-y-2 border-t border-mkt-ink/10 pt-4">
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
                            className="rounded-full border border-amber-500/50 bg-amber-500/15 px-3 py-1 text-sm text-amber-800 dark:text-amber-100"
                          >
                            {grade} ×
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {currentStep === "sections" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {SECTION_LETTERS.map((letter) => {
                      const active = sections.includes(letter);
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => toggleSection(letter)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center border text-sm font-semibold transition",
                            active
                              ? "border-amber-500 bg-amber-500 text-black"
                              : "border-mkt-ink/15 bg-mkt-ink/[0.03] text-mkt-ink/70 hover:border-mkt-ink/30"
                          )}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-mkt-ink/55">
                    {t("sectionsHint", { count: plannedCount })}
                  </p>
                </div>
              )}

              {currentStep === "confirm" && (
                <div className="space-y-4">
                  <div className="border border-mkt-ink/10 bg-mkt-ink/[0.04] p-4">
                    <p className="text-sm text-mkt-ink/70">
                      {t("confirmSummary", {
                        level: level ? t(`levels.${level}.label`) : "",
                        grades: selectedGrades.length,
                        sections: sections.join(", "),
                        classes: plannedCount,
                      })}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-mkt-ink/45">
                      {t("noStudentsNote")}
                    </p>
                  </div>
                  {previewNames.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-mkt-ink/45">
                        {t("previewLabel")}
                      </p>
                      <ul className="space-y-1 text-sm text-mkt-ink/65">
                        {previewNames.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                        {plannedCount > previewNames.length ? (
                          <li className="text-mkt-ink/45">
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
                className="rounded-full text-mkt-ink/70 hover:bg-mkt-ink/5 hover:text-mkt-ink"
              >
                {tc("back")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => void handleSkip()}
                className="rounded-full text-mkt-ink/50 hover:bg-mkt-ink/5 hover:text-mkt-ink/80"
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
            className="rounded-full bg-amber-500 text-black hover:bg-amber-400"
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
