"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CampusVisitSlotPicker } from "@/components/schools/campus-visit-slot-picker";
import { submitOnlineEnrollment } from "@/lib/actions/admissions";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import type { PublicClassListItem } from "@/lib/db/classes";
import { normalizeGender, type Gender } from "@/lib/validations/student";
import { formatClassOptionLabel, isClassFull, seatsRemaining } from "@/lib/utils/class-options";
import { toast } from "@/lib/toast";

const STEP_KEYS = ["stepStudent", "stepFamily", "stepReview", "stepCampusVisit"] as const;

const emptyPickup = {
  full_name: "",
  phone: "",
  relationship: "",
};

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

export function OnlineEnrollmentForm({
  schoolId,
  schoolName,
  slug,
  schoolAddress,
  primary,
  campusVisitSlots = [],
  classes = [],
  hideIntro = false,
}: {
  schoolId: string;
  schoolName: string;
  slug: string;
  schoolAddress: string | null;
  primary: string;
  campusVisitSlots?: PublicSchoolEvent[];
  classes?: PublicClassListItem[];
  hideIntro?: boolean;
}) {
  const t = useTranslations("schools.enrollment");
  const tf = useTranslations("schools.forms");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_name: "",
    dob: "",
    gender: "" as "" | Gender,
    class_id: "",
    class_applying: "",
    guardian_name: "",
    guardian_email: "",
    guardian_phone: "",
    relation: "guardian",
    address: "",
    notes: "",
    guardian_can_pickup: false,
    pickup_persons: [] as Array<{ full_name: string; phone: string; relationship: string }>,
  });

  const hasVisitSlots = campusVisitSlots.length > 0;
  const visibleSteps = hasVisitSlots ? STEP_KEYS : STEP_KEYS.slice(0, 3);
  const selectedClass = classes.find((c) => c.id === form.class_id);
  const selectedClassFull = selectedClass ? isClassFull(selectedClass) : false;
  const selectedSeatsRemaining = selectedClass ? seatsRemaining(selectedClass) : null;

  function handleClassChange(classId: string) {
    const cls = classes.find((c) => c.id === classId);
    setForm((f) => ({
      ...f,
      class_id: classId,
      class_applying: cls?.name ?? "",
    }));
  }

  function pickupLabel(value: string) {
    const found = pickupRelationshipKeys.find((opt) => opt.value === value);
    return found ? t(found.key) : value.replace(/_/g, " ");
  }

  async function handleSubmit() {
    setLoading(true);
    const result = await submitOnlineEnrollment(schoolId, {
      ...form,
      class_id: form.class_id,
      gender: normalizeGender(form.gender) ?? undefined,
      notes: form.notes || undefined,
      relation: form.relation as "father" | "mother" | "guardian" | "other",
      pickup_persons: form.pickup_persons.filter(
        (p) => p.full_name.trim() && p.phone.trim() && p.relationship.trim()
      ),
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

    const id = "data" in result ? result.data?.id ?? null : null;
    setReferenceId(id);

    if (hasVisitSlots && id) {
      setStep(3);
    }
  }

  if (referenceId && hasVisitSlots && step === 3) {
    return (
      <CampusVisitSlotPicker
        slots={campusVisitSlots}
        admissionApplicationId={referenceId}
        guardianName={form.guardian_name}
        guardianEmail={form.guardian_email}
        guardianPhone={form.guardian_phone}
        studentName={form.student_name}
        schoolName={schoolName}
        schoolAddress={schoolAddress}
        slug={slug}
        primary={primary}
      />
    );
  }

  if (referenceId && !hasVisitSlots) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">{t("applicationSubmitted")}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {t("thankYouEnrollment", { schoolName })}
        </p>
        <div className="mt-6 space-y-4 rounded-2xl border border-primary-200 bg-primary-light p-6 dark:border-primary-900 dark:bg-primary-light/40">
          <p className="text-sm">
            {t("referenceNumber")} <span className="font-mono font-semibold">{referenceId}</span>
          </p>
          <p className="text-sm leading-relaxed">
            {t("basicInfoReceived")}
          </p>
          {schoolAddress && (
            <p className="text-sm">
              <span className="font-medium">{t("campusAddress")}</span> {schoolAddress}
            </p>
          )}
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t("admissionsMayContact")}
          </p>
        </div>
        <Link
          href={`/schools/${slug}`}
          className="mt-6 inline-block text-sm font-medium hover:underline"
          style={{ color: primary }}
        >
          {t("backToSchoolWebsite")}
        </Link>
      </div>
    );
  }

  return (
    <div className={hideIntro ? "max-w-xl" : "mx-auto max-w-xl"}>
      {!hideIntro && (
        <>
          <h1 className="text-2xl font-bold">{t("onlineEnrollment")}</h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            {t("submitDetailsOnline")}
            {hasVisitSlots
              ? t("thenBookVisit")
              : t("thenVisitSchool", { schoolName })}
          </p>
        </>
      )}

      <div className={hideIntro ? "flex gap-1.5 sm:gap-2" : "mt-6 flex gap-1.5 sm:gap-2"}>
        {visibleSteps.map((key, i) => (
          <div
            key={key}
            className={`flex-1 rounded-lg px-1.5 py-2 text-center text-[10px] font-medium leading-tight sm:px-3 sm:text-xs ${
              i <= step
                ? "bg-primary-light text-teal-800 dark:bg-primary-light dark:text-teal-200"
                : "bg-stone-100 text-stone-500 dark:bg-stone-900"
            }`}
          >
            {t(key)}
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <div>
              <Label>{t("studentFullName")}</Label>
              <Input
                value={form.student_name}
                onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("dateOfBirth")}</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>{t("gender")}</Label>
                <Select
                  options={[
                    { value: "", label: t("select") },
                    { value: "male", label: t("male") },
                    { value: "female", label: t("female") },
                  ]}
                  value={form.gender}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      gender: normalizeGender(e.target.value) ?? "",
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>{t("selectClassApplying")}</Label>
              {classes.length > 0 ? (
                <>
                  <Select
                    options={[
                      { value: "", label: t("selectClassPlaceholder") },
                      ...classes.map((c) => ({
                        value: c.id,
                        label: formatClassOptionLabel(c),
                      })),
                    ]}
                    value={form.class_id}
                    onChange={(e) => handleClassChange(e.target.value)}
                    required
                  />
                  {selectedClass && selectedSeatsRemaining != null && !selectedClassFull ? (
                    <p className="mt-1 text-xs text-stone-500">
                      {t("classSeatsRemaining", { count: selectedSeatsRemaining })}
                    </p>
                  ) : null}
                  {selectedClassFull ? (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                      {t("classFullWarning")}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-stone-500">{t("noClassesAvailableOnline")}</p>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <Label>{t("parentOrGuardianName")}</Label>
              <Input
                value={form.guardian_name}
                onChange={(e) => setForm((f) => ({ ...f, guardian_name: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{tc("email")}</Label>
                <Input
                  type="email"
                  value={form.guardian_email}
                  onChange={(e) => setForm((f) => ({ ...f, guardian_email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>{tc("phone")}</Label>
                <Input
                  type="tel"
                  value={form.guardian_phone}
                  onChange={(e) => setForm((f) => ({ ...f, guardian_phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>{t("relationToStudent")}</Label>
              <Select
                options={[
                  { value: "father", label: t("father") },
                  { value: "mother", label: t("mother") },
                  { value: "guardian", label: t("guardian") },
                  { value: "other", label: t("other") },
                ]}
                value={form.relation}
                onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("homeAddress")}</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                required
              />
            </div>
            <div>
              <Label>{t("additionalNotes")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-stone-200 p-4 dark:border-stone-800">
              <div>
                <p className="text-sm font-medium">{t("whoMayPickup")}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {t("pickupHint")}
                </p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-stone-300"
                  checked={form.guardian_can_pickup}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guardian_can_pickup: e.target.checked }))
                  }
                />
                <span>
                  {t("guardianAuthorizedPickupSchool")}
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {t("guardianAuthorizedPickupRequired")}
                  </span>
                </span>
              </label>

              {form.pickup_persons.map((person, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t("authorizedPersonN", { n: index + 1 })}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          pickup_persons: f.pickup_persons.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      {tc("remove")}
                    </Button>
                  </div>
                  <div>
                    <Label>{tf("fullName")}</Label>
                    <Input
                      value={person.full_name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          pickup_persons: f.pickup_persons.map((p, i) =>
                            i === index ? { ...p, full_name: e.target.value } : p
                          ),
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>{tc("phone")}</Label>
                      <Input
                        type="tel"
                        value={person.phone}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pickup_persons: f.pickup_persons.map((p, i) =>
                              i === index ? { ...p, phone: e.target.value } : p
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>{t("relationship")}</Label>
                      <Select
                        options={pickupRelationshipKeys.map((opt) => ({
                          value: opt.value,
                          label: t(opt.key),
                        }))}
                        value={person.relationship}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pickup_persons: f.pickup_persons.map((p, i) =>
                              i === index ? { ...p, relationship: e.target.value } : p
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    pickup_persons: [...f.pickup_persons, { ...emptyPickup }],
                  }))
                }
              >
                {t("addAnotherAuthorized")}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3 rounded-xl border border-stone-200 p-5 text-sm dark:border-stone-800">
            <p><span className="font-medium">{t("reviewStudent")}</span> {form.student_name}</p>
            <p><span className="font-medium">{t("reviewDob")}</span> {form.dob}</p>
            <p><span className="font-medium">{t("reviewClass")}</span> {form.class_applying}</p>
            <p><span className="font-medium">{t("reviewGuardian")}</span> {form.guardian_name}</p>
            <p><span className="font-medium">{t("reviewContact")}</span> {form.guardian_email} / {form.guardian_phone}</p>
            <p><span className="font-medium">{t("reviewAddress")}</span> {form.address}</p>
            <p>
              <span className="font-medium">{t("reviewGuardianPickup")}</span>{" "}
              {form.guardian_can_pickup ? t("authorized") : t("notAuthorized")}
            </p>
            {form.pickup_persons.length > 0 && (
              <div>
                <p className="font-medium">{t("otherAuthorizedPickup")}</p>
                <ul className="mt-1 list-inside list-disc text-stone-600 dark:text-stone-400">
                  {form.pickup_persons.map((p, i) => (
                    <li key={i}>
                      {p.full_name} · {p.phone} · {pickupLabel(p.relationship)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="pt-2 text-stone-600 dark:text-stone-400">
              {hasVisitSlots
                ? t("afterSubmitBookVisit")
                : t("afterSubmitReference")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {tc("back")}
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            {tc("next")}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (classes.length > 0 && !form.class_id)}
            style={{ backgroundColor: primary }}
          >
            {loading ? tf("submitting") : hasVisitSlots ? t("submitAndBookVisit") : tf("submitApplication")}
          </Button>
        )}
      </div>
    </div>
  );
}
