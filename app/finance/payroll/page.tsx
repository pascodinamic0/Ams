import {
  getPayroll,
  getPayrollExcludedStaffIds,
  getSchoolCurrencyForSchool,
  getStaff,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getLocale, getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";
import type { PayrollListItem } from "@/lib/db/payroll";
import type { StaffListItem } from "@/lib/db/staff";
import { PayrollGenerateForm } from "./payroll-form";
import { PayrollFilters } from "./payroll-filters";
import { PayrollMonthActions } from "./payroll-month-actions";
import { PayrollSheet, type PayrollSheetPerson } from "./payroll-sheet";

type PageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    status?: string;
    search?: string;
    position?: string;
    department?: string;
  }>;
};

function toSheetPerson(
  member: StaffListItem,
  payroll: PayrollListItem | null,
  excluded: boolean
): PayrollSheetPerson {
  return {
    staffId: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    department: member.department,
    photoUrl: member.photo_url,
    monthlySalary: member.monthly_salary,
    excluded,
    payroll,
  };
}

export default async function PayrollPage({ searchParams }: PageProps) {
  const t = await getTranslations("finance");
  const locale = await getLocale();
  const profile = await getCurrentProfile();
  const params = await searchParams;
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const now = new Date();
  const activeMonth = Number(params.month ?? now.getMonth() + 1);
  const activeYear = Number(params.year ?? now.getFullYear());
  const activeLabel = new Date(Date.UTC(activeYear, activeMonth - 1, 1)).toLocaleDateString(
    locale,
    { month: "long", year: "numeric" }
  );

  const [currency, staffRoster, payroll, excludedStaffIds] = await Promise.all([
      getSchoolCurrencyForSchool(profile?.school_id),
      scope.schoolId
        ? getStaff({
            schoolId: scope.schoolId,
            activeOnly: true,
          })
        : Promise.resolve([] as StaffListItem[]),
      getPayroll({
        ...scope,
        month: activeMonth,
        year: activeYear,
      }),
      scope.schoolId
        ? getPayrollExcludedStaffIds({
            schoolId: scope.schoolId,
            month: activeMonth,
            year: activeYear,
          })
        : Promise.resolve([] as string[]),
    ]);

  const formatCurrency = (value: number) => formatMoney(value, currency.code);
  const excluded = new Set(excludedStaffIds);
  const payrollByStaff = new Map(payroll.map((row) => [row.staff_id, row]));
  const seen = new Set<string>();

  const people: PayrollSheetPerson[] = staffRoster.map((member) => {
    seen.add(member.id);
    return toSheetPerson(member, payrollByStaff.get(member.id) ?? null, excluded.has(member.id));
  });

  for (const row of payroll) {
    if (seen.has(row.staff_id)) continue;
    people.push({
      staffId: row.staff_id,
      name: row.staff_name,
      email: null,
      role: row.staff_position,
      department: row.staff_department,
      photoUrl: row.staff_photo_url,
      monthlySalary: row.amount,
      excluded: false,
      payroll: row,
    });
  }

  const includedPeople = people.filter((person) => !person.excluded);
  const totalEmployees = includedPeople.length;
  const paidEmployees = includedPeople.filter((person) => person.payroll?.status === "paid").length;
  const remainingPayroll = payroll
    .filter((row) => row.status !== "paid")
    .reduce((sum, row) => sum + row.amount, 0);
  const positions = [...new Set(people.map((person) => person.role).filter(Boolean))] as string[];
  const departments = [
    ...new Set(people.map((person) => person.department).filter(Boolean)),
  ] as string[];

  const stats = [
    {
      label: t("totalEmployees"),
      value: String(totalEmployees),
      detail: t("payrollPaidCount", { count: paidEmployees }),
    },
    {
      label: t("remainingPayroll"),
      value: formatCurrency(remainingPayroll),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{t("payrollTitle")}</h1>
          <p className="text-sm capitalize text-stone-500">{activeLabel}</p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
            {t("generatePayrollHint")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <PayrollGenerateForm
            key={`${activeYear}-${activeMonth}`}
            schoolId={scope.schoolId}
            branchId={scope.branchId}
            defaultMonth={activeMonth}
            defaultYear={activeYear}
          />
          <PayrollMonthActions
            compact
            month={activeMonth}
            year={activeYear}
            schoolId={scope.schoolId}
            branchId={scope.branchId}
            label={activeLabel}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-r border-stone-200 px-3 py-2 last:border-r-0 dark:border-stone-800"
          >
            <dt className="text-[11px] leading-tight text-stone-500">{stat.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums">{stat.value}</dd>
            {stat.detail ? (
              <p className="text-xs text-stone-500">{stat.detail}</p>
            ) : null}
          </div>
        ))}
      </dl>

      <PayrollFilters positions={positions} departments={departments} />

      <PayrollSheet
        schoolId={scope.schoolId}
        branchId={scope.branchId}
        people={people}
        currencyCode={currency.code}
        month={activeMonth}
        year={activeYear}
      />
    </div>
  );
}
