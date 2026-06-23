"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  blue: { primary: "#3b82f6", secondary: "#1d4ed8" },
  green: { primary: "#22c55e", secondary: "#15803d" },
  navy: { primary: "#1e3a8a", secondary: "#172554" },
  burgundy: { primary: "#881337", secondary: "#4c0519" },
  indigo: { primary: "#4f46e5", secondary: "#7c3aed" },
};

const STEPS = [
  { id: "1", title: "School details" },
  { id: "2", title: "Domain" },
  { id: "3", title: "Colors" },
  { id: "4", title: "Website template" },
];

function NewSchoolForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    admin_email: "",
    domain: "",
    theme: "blue",
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
          theme: templateParam === "modern" ? "indigo" : f.theme,
        }));
      }
    }
  }, [templateParam]);

  const colors = THEME_COLORS[form.theme] ?? THEME_COLORS.blue;
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
    const slug = result.data?.slug ?? form.name.toLowerCase().replace(/\s/g, "-");
    toast.success("School created. Enable their public site from the academic dashboard when ready.");
    router.push("/admin/schools");
  }

  return (
    <div className={step === 3 ? "mx-auto max-w-5xl" : "mx-auto max-w-2xl"}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Add School</h1>
        <Link
          href="/admin/websites"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Browse all templates
        </Link>
      </div>

      {selectedTemplate && step === 3 && (
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Choose a pre-built website design. Each template includes a public homepage and
          admissions path.{" "}
          <Link
            href={selectedTemplate.previewPath}
            target="_blank"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Preview {selectedTemplate.name}
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
              <Label>School name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Admin email</Label>
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
            <Label>Custom domain (optional)</Label>
            <Input
              placeholder="www.school.edu"
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
            />
            <p className="mt-2 text-sm text-zinc-500">
              We&apos;ll provide DNS instructions to connect
            </p>
          </div>
        )}
        {step === 2 && (
          <div>
            <Label>Color palette</Label>
            <Select
              options={[
                { value: "blue", label: "Blue" },
                { value: "indigo", label: "Indigo" },
                { value: "green", label: "Green" },
                { value: "navy", label: "Navy" },
                { value: "burgundy", label: "Burgundy" },
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
              <span className="text-sm text-zinc-500">Preview of your brand colors</span>
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
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl animate-pulse">Loading...</div>}>
      <NewSchoolForm />
    </Suspense>
  );
}
