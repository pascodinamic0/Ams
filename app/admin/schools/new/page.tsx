"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { OnboardingStepper } from "@/components/ui/onboarding-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TemplatePicker } from "@/components/schools/template-picker";
import { toast } from "@/lib/toast";
import { createSchool } from "@/lib/actions/schools";
import {
  getWebsiteTemplate,
  isWebsiteTemplateId,
  type WebsiteTemplateId,
} from "@/lib/schools/website-templates";

const THEME_COLORS: Record<string, { primary: string; secondary: string }> = {
  teal: { primary: "#0d9488", secondary: "#0f766e" },
  blue: { primary: "#3b82f6", secondary: "#1d4ed8" },
  green: { primary: "#22c55e", secondary: "#15803d" },
  navy: { primary: "#1e3a8a", secondary: "#172554" },
  burgundy: { primary: "#881337", secondary: "#4c0519" },
  amber: { primary: "#f59e0b", secondary: "#d97706" },
};

function NewSchoolForm() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");

  const STEPS = [
    { id: "1", title: t("stepSchoolDetails") },
    { id: "2", title: t("stepDomain") },
    { id: "3", title: t("stepColors") },
    { id: "4", title: t("stepWebsiteTemplate") },
  ];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    admin_email: "",
    domain: "",
    theme: "teal",
    template: "modern" as WebsiteTemplateId,
  });

  useEffect(() => {
    if (templateParam && isWebsiteTemplateId(templateParam)) {
      setForm((f) => ({ ...f, template: templateParam }));
      const meta = getWebsiteTemplate(templateParam);
      if (meta) {
        setForm((f) => ({
          ...f,
          template: templateParam,
          theme: templateParam === "modern" ? "teal" : f.theme,
        }));
      }
    }
  }, [templateParam]);

  const colors = THEME_COLORS[form.theme] ?? THEME_COLORS.teal;
  const selectedTemplate = getWebsiteTemplate(form.template);

  async function onComplete() {
    const result = await createSchool({
      name: form.name,
      adminEmail: form.admin_email || undefined,
      customDomain: form.domain || undefined,
      themePrimaryColor: colors.primary,
      themeSecondaryColor: colors.secondary,
      websiteTemplate: form.template,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("schoolCreatedToast"));
    router.push("/admin/schools");
  }

  return (
    <div className={step === 3 ? "mx-auto max-w-5xl" : "mx-auto max-w-2xl"}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("newSchoolTitle")}</h1>
        <Link
          href="/admin/websites"
          className="text-sm text-primary hover:underline dark:text-primary"
        >
          {t("browseAllTemplates")}
        </Link>
      </div>

      {selectedTemplate && step === 3 && (
        <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
          {t("templatePickerHint")}{" "}
          <Link
            href={selectedTemplate.previewPath}
            target="_blank"
            className="font-medium text-primary hover:underline dark:text-primary"
          >
            {t("previewTemplate", { name: selectedTemplate.name })}
          </Link>
        </p>
      )}

      <OnboardingStepper
        steps={STEPS}
        currentStep={step}
        onNext={() => setStep((s) => s + 1)}
        onBack={() => setStep((s) => s - 1)}
        onComplete={onComplete}
      >
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>{t("schoolNameLabel")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("adminEmailLabel")}</Label>
              <Input
                type="email"
                value={form.admin_email}
                onChange={(e) => setForm((f) => ({ ...f, admin_email: e.target.value }))}
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <Label>{t("customDomainLabel")}</Label>
            <Input
              placeholder={t("customDomainPlaceholder")}
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
            />
            <p className="mt-2 text-sm text-stone-500">
              {t("dnsInstructions")}
            </p>
          </div>
        )}
        {step === 2 && (
          <div>
            <Label>{t("colorPaletteLabel")}</Label>
            <Select
              options={[
                { value: "teal", label: t("themeTeal") },
                { value: "blue", label: t("themeBlue") },
                { value: "green", label: t("themeGreen") },
                { value: "navy", label: t("themeNavy") },
                { value: "burgundy", label: t("themeBurgundy") },
                { value: "amber", label: t("themeAmber") },
              ]}
              value={form.theme}
              onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
            />
            <div className="mt-4 flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-lg border"
                style={{ backgroundColor: colors.primary }}
              />
              <span
                className="h-10 w-10 rounded-lg border"
                style={{ backgroundColor: colors.secondary }}
              />
              <span className="text-sm text-stone-500">{t("colorPreview")}</span>
            </div>
          </div>
        )}
        {step === 3 && (
          <TemplatePicker
            value={form.template}
            onChange={(template) => setForm((f) => ({ ...f, template }))}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
          />
        )}
      </OnboardingStepper>
    </div>
  );
}

export default function NewSchoolPage() {
  const tc = useTranslations("common");

  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl animate-pulse">{tc("loading")}</div>}>
      <NewSchoolForm />
    </Suspense>
  );
}
