"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStepper } from "@/components/ui/onboarding-stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "@/lib/toast";

const STEPS = [
  { id: "1", title: "School details" },
  { id: "2", title: "Domain" },
  { id: "3", title: "Colors" },
  { id: "4", title: "Template" },
];

export default function NewSchoolPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    admin_email: "",
    domain: "",
    theme: "blue",
    template: "modern",
  });

  function onComplete() {
    toast.success("School created. Their site is ready at /schools/" + form.name.toLowerCase().replace(/\s/g, "-"));
    router.push("/admin/schools");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Add School</h1>
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
                { value: "green", label: "Green" },
                { value: "navy", label: "Navy" },
                { value: "burgundy", label: "Burgundy" },
              ]}
              value={form.theme}
              onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
            />
          </div>
        )}
        {step === 3 && (
          <div>
            <Label>Website template</Label>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {["modern", "classic", "minimal"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, template: t }))}
                  className={`rounded-lg border-2 p-4 text-left capitalize ${
                    form.template === t
                      ? "border-zinc-900 dark:border-zinc-100"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </OnboardingStepper>
    </div>
  );
}
