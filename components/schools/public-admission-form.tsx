"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { createAdmission } from "@/lib/actions/admissions";
import { toast } from "@/lib/toast";

const pickupRelationshipKeys = [
  { value: "uncle", key: "relUncle" },
  { value: "aunt", key: "relAunt" },
  { value: "grandparent", key: "relGrandparent" },
  { value: "sibling", key: "relSibling" },
  { value: "driver", key: "relDriver" },
  { value: "nanny", key: "relNanny" },
  { value: "family_friend", key: "relFamilyFriend" },
  { value: "other", key: "relOther" },
] as const;

export function PublicAdmissionForm({
  schoolId,
  schoolName,
  slug,
}: {
  schoolId: string;
  schoolName: string;
  slug: string;
}) {
  const t = useTranslations("schools.enrollment");
  const tf = useTranslations("schools.forms");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [guardianCanPickup, setGuardianCanPickup] = useState(false);
  const [addOtherPickup, setAddOtherPickup] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const otherName = (form.get("pickup_name") as string)?.trim() || "";
    const otherPhone = (form.get("pickup_phone") as string)?.trim() || "";
    const otherRelationship = (form.get("pickup_relationship") as string)?.trim() || "";

    const pickup_persons =
      addOtherPickup && otherName && otherPhone && otherRelationship
        ? [{ full_name: otherName, phone: otherPhone, relationship: otherRelationship }]
        : [];

    const result = await createAdmission(schoolId, {
      student_name: form.get("student_name") as string,
      dob: (form.get("dob") as string) || undefined,
      guardian_name: form.get("guardian_name") as string,
      guardian_email: form.get("guardian_email") as string,
      guardian_phone: (form.get("guardian_phone") as string) || undefined,
      relation: "guardian",
      guardian_can_pickup: guardianCanPickup,
      pickup_persons,
      source: "online",
    });

    setLoading(false);

    if ("error" in result && result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : typeof result.error === "object" && result.error !== null
            ? Object.values(result.error).flat().filter(Boolean)[0] ??
              t("checkForm")
            : t("checkForm");
      toast.error(String(message));
      return;
    }

    setReferenceId("data" in result ? result.data?.id ?? null : null);
    toast.success(t("applicationSubmittedToast"));
    e.currentTarget.reset();
    setGuardianCanPickup(false);
    setAddOtherPickup(false);
  }

  if (referenceId) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-bold">{t("applicationReceived")}</h1>
        <p className="mt-2 text-stone-600">
          {t("thankYouApplying", { schoolName })}
        </p>
        <p className="mt-6 rounded-lg border bg-stone-50 p-4 text-sm">
          {t("reference")} <span className="font-mono font-medium">{referenceId}</span>
        </p>
        <Link
          href={`/schools/${slug}`}
          className="mt-6 block text-center text-sm text-stone-600 hover:underline"
        >
          {t("backToSchool")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold">{t("admissions")}</h1>
      <p className="mt-2 text-stone-600">{t("applyTo", { schoolName })}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label>{t("studentName")}</Label>
          <Input name="student_name" required />
        </div>
        <div>
          <Label>{t("dateOfBirth")}</Label>
          <Input name="dob" type="date" />
        </div>
        <div>
          <Label>{t("guardianName")}</Label>
          <Input name="guardian_name" required />
        </div>
        <div>
          <Label>{t("guardianEmail")}</Label>
          <Input name="guardian_email" type="email" required />
        </div>
        <div>
          <Label>{t("guardianPhone")}</Label>
          <Input name="guardian_phone" type="tel" />
        </div>

        <div className="space-y-3 rounded-lg border border-stone-200 p-4">
          <p className="text-sm font-medium">{t("whoMayPickup")}</p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-stone-300"
              checked={guardianCanPickup}
              onChange={(e) => setGuardianCanPickup(e.target.checked)}
            />
            <span>
              {t("guardianAuthorizedPickup")}
              <span className="mt-0.5 block text-xs text-stone-500">
                {t("guardianAuthorizedPickupHint")}
              </span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded border-stone-300"
              checked={addOtherPickup}
              onChange={(e) => setAddOtherPickup(e.target.checked)}
            />
            {t("addAnotherAuthorized")}
          </label>
          {addOtherPickup && (
            <div className="space-y-3 border-t border-stone-200 pt-3">
              <div>
                <Label>{tf("fullName")}</Label>
                <Input name="pickup_name" required={addOtherPickup} />
              </div>
              <div>
                <Label>{tc("phone")}</Label>
                <Input name="pickup_phone" type="tel" required={addOtherPickup} />
              </div>
              <div>
                <Label>{t("relationship")}</Label>
                <Select
                  name="pickup_relationship"
                  placeholder={t("selectRelationship")}
                  options={pickupRelationshipKeys.map((opt) => ({
                    value: opt.value,
                    label: t(opt.key),
                  }))}
                  required={addOtherPickup}
                />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? tf("submitting") : tf("submitApplication")}
        </Button>
      </form>
      <Link
        href={`/schools/${slug}`}
        className="mt-6 block text-center text-sm text-stone-600 hover:underline"
      >
        {t("backToSchool")}
      </Link>
    </div>
  );
}
