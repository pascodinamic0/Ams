"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/layout/user-avatar";
import {
  setStaffPayrollAmount,
  setStaffPayrollMonthInclusion,
  syncSchoolTeamPayees,
} from "@/lib/actions/payroll";
import type { PayrollListItem } from "@/lib/db/payroll";
import { formatMoney } from "@/lib/currency";
import { toast } from "@/lib/toast";
import { PayrollRowActions } from "./payroll-row-actions";

export type PayrollSheetPerson = {
  staffId: string;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  photoUrl: string | null;
  monthlySalary: number;
  excluded: boolean;
  payroll: PayrollListItem | null;
};

function amountFor(person: PayrollSheetPerson) {
  return person.payroll?.amount ?? person.monthlySalary;
}

export function PayrollSheet({
  schoolId,
  branchId,
  people,
  currencyCode,
  month,
  year,
}: {
  schoolId?: string;
  branchId?: string;
  people: PayrollSheetPerson[];
  currencyCode: string;
  month: number;
  year: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(
    () => new Set(people.filter((person) => person.excluded).map((person) => person.staffId))
  );
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(people.map((person) => [person.staffId, String(amountFor(person))]))
  );

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    setAmounts(
      Object.fromEntries(people.map((person) => [person.staffId, String(amountFor(person))]))
    );
    setExcluded(new Set(people.filter((person) => person.excluded).map((person) => person.staffId)));
  }, [people]);

  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const status = searchParams.get("status") ?? "";
  const position = searchParams.get("position") ?? "";
  const department = searchParams.get("department") ?? "";

  const visible = useMemo(() => {
    return people
      .filter((person) => {
        if (position && person.role !== position) return false;
        if (department && person.department !== department) return false;
        if (status === "paid" && person.payroll?.status !== "paid") return false;
        if (status === "pending" && person.payroll?.status !== "pending") return false;
        if (!search) return true;
        const haystack = [
          person.name,
          person.email,
          person.role,
          person.department,
          person.staffId,
          person.payroll?.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => {
        const aOut = excluded.has(a.staffId);
        const bOut = excluded.has(b.staffId);
        if (aOut !== bOut) return aOut ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
  }, [people, position, department, status, search, excluded]);

  const excludedCount = people.filter((person) => excluded.has(person.staffId)).length;
  const includedCount = people.length - excludedCount;

  async function handleSync() {
    if (!schoolId) return;
    setSyncing(true);
    const result = await syncSchoolTeamPayees(schoolId, branchId);
    setSyncing(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      "data" in result && result.data
        ? t("staffRosterSyncedAdded", { count: result.data.created })
        : t("staffRosterSynced")
    );
    router.refresh();
  }

  async function handleSave(staffId: string) {
    setSavingId(staffId);
    const result = await setStaffPayrollAmount(staffId, Number(amounts[staffId] ?? 0));
    setSavingId(null);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("payAmountSaved"));
    router.refresh();
  }

  async function handleIncludeToggle(staffId: string, included: boolean) {
    if (!schoolId) return;
    setTogglingId(staffId);
    setExcluded((prev) => {
      const next = new Set(prev);
      if (included) next.delete(staffId);
      else next.add(staffId);
      return next;
    });

    const result = await setStaffPayrollMonthInclusion({
      staffId,
      schoolId,
      month,
      year,
      included,
    });
    setTogglingId(null);

    if ("error" in result && result.error) {
      setExcluded((prev) => {
        const next = new Set(prev);
        if (included) next.add(staffId);
        else next.delete(staffId);
        return next;
      });
      toast.error(result.error);
      return;
    }

    toast.success(
      included
        ? t("includedInPayroll", { month: monthLabel })
        : t("excludedFromMonthPayroll", { month: monthLabel })
    );
    router.refresh();
  }

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-stone-500">
          {t("includedExcludedCount", {
            included: includedCount,
            excluded: excludedCount,
            month: monthLabel,
          })}
        </p>
        {schoolId ? (
          <Button type="button" variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            {syncing ? t("syncing") : t("refreshStaffRoster")}
          </Button>
        ) : null}
      </div>

      {people.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-stone-500">
          {t("noStaffOnRoster")}
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-stone-500">
          {tc("noResults")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full table-fixed divide-y divide-stone-200 text-sm dark:divide-stone-800">
            <thead className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900">
              <tr>
                <th className="w-12 px-3 py-2 text-left font-medium">{t("included")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("fullName")}</th>
                <th className="w-36 px-3 py-2 text-left font-medium">{t("amountToPay")}</th>
                <th className="w-28 px-3 py-2 text-left font-medium">{tc("status")}</th>
                <th className="w-32 px-3 py-2 text-left font-medium">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {visible.map((person) => {
                const isExcluded = excluded.has(person.staffId);
                const isPaid = person.payroll?.status === "paid";
                const savedAmount = String(amountFor(person));
                const draft = amounts[person.staffId] ?? savedAmount;
                const dirty = draft !== savedAmount;
                return (
                  <tr
                    key={person.staffId}
                    className={
                      isExcluded ? "bg-stone-50/80 text-stone-500 dark:bg-stone-900/40" : undefined
                    }
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        id={`pay-month-${person.staffId}`}
                        checked={!isExcluded}
                        disabled={!schoolId || isPaid || togglingId === person.staffId}
                        aria-label={isExcluded ? t("excluded") : t("included")}
                        onChange={(e) => handleIncludeToggle(person.staffId, e.target.checked)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar name={person.name} avatarUrl={person.photoUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{person.name}</p>
                          <p className="truncate text-xs text-stone-500">
                            {[person.role ?? t("colStaff"), person.department]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {isPaid ? (
                        <span className="tabular-nums">
                          {formatMoney(person.payroll?.amount ?? 0, currencyCode)}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor={`staff-amount-${person.staffId}`} className="sr-only">
                            {tc("amount")}
                          </Label>
                          <Input
                            id={`staff-amount-${person.staffId}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft}
                            disabled={isExcluded}
                            onChange={(e) =>
                              setAmounts((prev) => ({
                                ...prev,
                                [person.staffId]: e.target.value,
                              }))
                            }
                            className="h-8 w-full min-w-0"
                          />
                          {dirty ? (
                            <Button
                              type="button"
                              size="sm"
                              className="shrink-0"
                              onClick={() => handleSave(person.staffId)}
                              disabled={savingId === person.staffId || isExcluded}
                            >
                              {savingId === person.staffId ? tc("saving") : tc("save")}
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill
                        payroll={person.payroll}
                        excluded={isExcluded}
                        paidLabel={t("statusPaid")}
                        pendingLabel={t("statusPending")}
                        excludedLabel={t("excluded")}
                        notGeneratedLabel={t("notGenerated")}
                      />
                      {person.payroll?.payment_date ? (
                        <p className="mt-0.5 text-xs text-stone-500">{person.payroll.payment_date}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <PayrollRowActions
                        row={
                          person.payroll ?? {
                            id: "",
                            staff_id: person.staffId,
                            staff_name: person.name,
                            staff_position: person.role,
                            staff_department: person.department,
                            staff_photo_url: person.photoUrl,
                            amount: Number(draft) || 0,
                            status: "pending",
                            payment_date: null,
                            payment_method: null,
                            reference_number: null,
                            notes: null,
                            payroll_month: month,
                            payroll_year: year,
                          }
                        }
                        schoolId={schoolId}
                        compact
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusPill({
  payroll,
  excluded,
  paidLabel,
  pendingLabel,
  excludedLabel,
  notGeneratedLabel,
}: {
  payroll: PayrollListItem | null;
  excluded: boolean;
  paidLabel: string;
  pendingLabel: string;
  excludedLabel: string;
  notGeneratedLabel: string;
}) {
  if (payroll?.status === "paid") {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
        {paidLabel}
      </span>
    );
  }
  if (payroll?.status === "pending") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
        {pendingLabel}
      </span>
    );
  }
  if (excluded) {
    return (
      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
        {excludedLabel}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-stone-200 px-2 py-0.5 text-xs text-stone-500 dark:border-stone-700">
      {notGeneratedLabel}
    </span>
  );
}
