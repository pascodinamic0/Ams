"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import type { StaffListItem } from "@/lib/db/staff";
import { toast } from "@/lib/toast";
import { formatMoney } from "@/lib/currency";

export function StaffPayAmountsPanel({
  schoolId,
  branchId,
  staff,
  currencyCode,
  month,
  year,
  excludedStaffIds,
}: {
  schoolId: string;
  branchId?: string;
  staff: StaffListItem[];
  currencyCode: string;
  month: number;
  year: number;
  excludedStaffIds: string[];
}) {
  const router = useRouter();
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(
    () => new Set(excludedStaffIds)
  );
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(staff.map((member) => [member.id, String(member.monthly_salary)]))
  );

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  useEffect(() => {
    setAmounts(
      Object.fromEntries(staff.map((member) => [member.id, String(member.monthly_salary)]))
    );
  }, [staff]);

  useEffect(() => {
    setExcluded(new Set(excludedStaffIds));
  }, [excludedStaffIds]);

  async function handleSync() {
    setSyncing(true);
    const result = await syncSchoolTeamPayees(schoolId, branchId);
    setSyncing(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.data
        ? t("staffRosterSyncedAdded", { count: result.data.created })
        : t("staffRosterSynced")
    );
    router.refresh();
  }

  async function handleSave(staffId: string) {
    setSavingId(staffId);
    const result = await setStaffPayrollAmount(
      staffId,
      Number(amounts[staffId] ?? 0)
    );
    setSavingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("payAmountSaved"));
    router.refresh();
  }

  async function handleIncludeToggle(staffId: string, included: boolean) {
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

    if (result.error) {
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

  const excludedCount = excluded.size;
  const includedCount = staff.length - excludedCount;

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 p-4 dark:border-stone-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("staffPayAmounts")}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {t("staffPayAmountsHint", { month: monthLabel })}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {t("includedExcludedCount", {
              included: includedCount,
              excluded: excludedCount,
              month: monthLabel,
            })}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleSync} disabled={syncing}>
          {syncing ? t("syncing") : t("refreshStaffRoster")}
        </Button>
      </div>

      {staff.length === 0 ? (
        <p className="text-sm text-stone-500">
          {t("noStaffOnRoster")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
            <thead className="bg-stone-50 dark:bg-stone-900/60">
              <tr>
                <th className="px-3 py-2 text-left">{t("payThisMonth")}</th>
                <th className="px-3 py-2 text-left">{t("colStaff")}</th>
                <th className="px-3 py-2 text-left">{t("colRole")}</th>
                <th className="px-3 py-2 text-left">{t("department")}</th>
                <th className="px-3 py-2 text-left">{t("amountToPay")}</th>
                <th className="px-3 py-2 text-left">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {staff.map((member) => {
                const isExcluded = excluded.has(member.id);
                return (
                  <tr
                    key={member.id}
                    className={isExcluded ? "bg-stone-50/80 opacity-70 dark:bg-stone-900/40" : undefined}
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        id={`pay-month-${member.id}`}
                        checked={!isExcluded}
                        disabled={togglingId === member.id}
                        onChange={(e) =>
                          handleIncludeToggle(member.id, e.target.checked)
                        }
                        label={isExcluded ? t("excluded") : t("included")}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={member.name}
                          avatarUrl={member.photo_url}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.email ? (
                            <p className="text-xs text-stone-500">{member.email}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">{member.role ?? t("colStaff")}</td>
                    <td className="px-3 py-2">{member.department ?? "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex max-w-xs items-center gap-2">
                        <Label htmlFor={`staff-amount-${member.id}`} className="sr-only">
                          {tc("amount")}
                        </Label>
                        <Input
                          id={`staff-amount-${member.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[member.id] ?? "0"}
                          disabled={isExcluded}
                          onChange={(e) =>
                            setAmounts((prev) => ({
                              ...prev,
                              [member.id]: e.target.value,
                            }))
                          }
                        />
                        <span className="whitespace-nowrap text-xs text-stone-500">
                          {formatMoney(Number(amounts[member.id] ?? 0), currencyCode)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSave(member.id)}
                        disabled={savingId === member.id || isExcluded}
                      >
                        {savingId === member.id ? tc("saving") : t("saveAmount")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
