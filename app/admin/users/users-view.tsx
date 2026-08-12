"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportButton } from "@/components/ui/export-button";
import { SearchInput } from "@/components/ui/search-input";
import type { UserListItem } from "@/lib/db/users";
import { UserRoleBadge } from "./user-role-badge";

const ROLE_FILTERS = [
  { id: "all", labelKey: "allUsers" },
  { id: "super_admin", labelKey: "filterSuperAdmins" },
  { id: "academic_admin", labelKey: "filterAcademicAdmins" },
  { id: "admin_coordinator", labelKey: "filterAdminCoordinators" },
  { id: "registrar", labelKey: "filterRegistrars" },
  { id: "admissions_officer", labelKey: "filterAdmissions" },
  { id: "pedagogy_coordinator", labelKey: "filterPedagogy" },
  { id: "principal", labelKey: "filterPrincipals" },
  { id: "teacher", labelKey: "filterTeachers" },
  { id: "finance_officer", labelKey: "filterFinance" },
  { id: "cashier", labelKey: "filterCashiers" },
  { id: "accountant", labelKey: "filterAccountants" },
  { id: "operations_manager", labelKey: "filterOperations" },
  { id: "operations_officer", labelKey: "filterOperationsOfficers" },
  { id: "discipline_officer", labelKey: "filterDiscipline" },
  { id: "supervisor", labelKey: "filterSupervisors" },
  { id: "pedagogical_council_member", labelKey: "filterPedagogicalCouncil" },
  { id: "student", labelKey: "filterStudents" },
  { id: "parent", labelKey: "filterParents" },
  { id: "analytics", labelKey: "filterAnalytics" },
] as const;

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function UserCell({ name, email }: { name: string | null; email: string }) {
  const t = useTranslations("admin");
  const initials = getInitials(name, email);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary-hover dark:bg-primary-light/60 dark:text-primary">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-stone-900 dark:text-white">
          {name?.trim() || t("unnamedUser")}
        </p>
        <p className="truncate text-xs text-stone-500 dark:text-stone-400">{email}</p>
      </div>
    </div>
  );
}

function SchoolCell({
  schoolName,
  role,
}: {
  schoolName: string | null;
  role: string;
}) {
  const t = useTranslations("admin");
  if (role === "super_admin") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {t("platform")}
      </span>
    );
  }

  if (!schoolName) {
    return <span className="text-sm text-stone-400">{t("unassigned")}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-300">
      <svg
        className="h-4 w-4 shrink-0 text-stone-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <span className="truncate">{schoolName}</span>
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
  color,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {label}
            </p>
            <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-white">
              {value}
            </p>
            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{hint}</p>
          </div>
          <div className={`rounded-xl p-2.5 ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UsersView({ users }: { users: UserListItem[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const handleSearch = useCallback((value: string) => {
    setSearch(value.trim().toLowerCase());
  }, []);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length };
    for (const user of users) {
      counts[user.role] = (counts[user.role] ?? 0) + 1;
    }
    return counts;
  }, [users]);

  const stats = useMemo(() => {
    const admins = users.filter((u) =>
      [
        "super_admin",
        "academic_admin",
        "admin_coordinator",
        "registrar",
        "admissions_officer",
        "pedagogy_coordinator",
        "principal",
      ].includes(u.role)
    ).length;
    const staff = users.filter((u) =>
      [
        "teacher",
        "finance_officer",
        "cashier",
        "accountant",
        "operations_manager",
        "operations_officer",
        "discipline_officer",
        "supervisor",
        "pedagogical_council_member",
        "analytics",
      ].includes(u.role)
    ).length;
    const learners = users.filter((u) => ["student", "parent"].includes(u.role)).length;
    const schools = new Set(
      users.map((u) => u.school_name).filter((name): name is string => Boolean(name))
    ).size;

    return { total: users.length, admins, staff, learners, schools };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;

      if (!search) return true;

      const haystack = [
        user.name ?? "",
        user.email,
        user.role.replace(/_/g, " "),
        user.school_name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [users, search, roleFilter]);

  const tableData = useMemo(
    () =>
      filteredUsers.map((user) => ({
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        role: user.role,
        school_name: user.school_name ?? "",
        user_display: <UserCell name={user.name} email={user.email} />,
        role_display: <UserRoleBadge role={user.role} />,
        school_display: (
          <SchoolCell schoolName={user.school_name} role={user.role} />
        ),
      })),
    [filteredUsers]
  );

  const exportData = filteredUsers.map((user) => ({
    name: user.name ?? "",
    email: user.email,
    role: user.role.replace(/_/g, " "),
    school: user.school_name ?? (user.role === "super_admin" ? t("platform") : ""),
  }));

  if (users.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
        title={t("noUsersYet")}
        description={t("noUsersYetDesc")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("totalUsers")}
          value={stats.total}
          hint={t("acrossAllSchools")}
          color="text-primary bg-primary-light dark:text-primary dark:bg-primary-light/40"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <StatCard
          label={t("administrators")}
          value={stats.admins}
          hint={t("superAndAcademicAdmins")}
          color="text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
        <StatCard
          label={t("staff")}
          value={stats.staff}
          hint={t("teachersAndOperations")}
          color="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          label={t("learnersAndFamilies")}
          value={stats.learners}
          hint={t("schoolsRepresented", { count: stats.schools })}
          color="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          }
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 bg-stone-50/80 dark:bg-stone-900/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>{t("userDirectory")}</CardTitle>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {t("usersShown", { filtered: filteredUsers.length, total: users.length })}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder={t("searchUsersPlaceholder")}
                  onSearch={handleSearch}
                />
              </div>
              <ExportButton
                data={exportData}
                filename="platform-users.csv"
                columns={[
                  { key: "name", label: tc("name") },
                  { key: "email", label: tc("email") },
                  { key: "role", label: t("colRole") },
                  { key: "school", label: t("colSchool") },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((filter) => {
              const count = roleCounts[filter.id] ?? 0;
              if (filter.id !== "all" && count === 0) return null;

              const active = roleFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setRoleFilter(filter.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-stone-600 ring-1 ring-slate-200 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-300 dark:ring-slate-700 dark:hover:bg-stone-700"
                  }`}
                >
                  {t(filter.labelKey)}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      active
                        ? "bg-primary text-white"
                        : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-stone-900 dark:text-white">
                {t("noUsersMatch")}
              </p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {t("tryDifferentSearch")}
              </p>
            </div>
          ) : (
            <DataTable
              data={tableData}
              columns={[
                {
                  id: "user",
                  header: t("colUser"),
                  accessorKey: "user_display",
                },
                {
                  id: "role",
                  header: t("colRole"),
                  accessorKey: "role_display",
                },
                {
                  id: "school",
                  header: t("colSchool"),
                  accessorKey: "school_display",
                },
              ]}
              emptyMessage={t("noUsersFound")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
