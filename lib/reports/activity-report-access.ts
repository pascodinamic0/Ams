import { normalizeRole } from "@/lib/auth/rbac";

export const ACTIVITY_REPORT_ROLES = new Set([
  "academic_admin",
  "principal",
  "super_admin",
  "finance_officer",
  "accountant",
]);

export type ActivityReportPortal = "academic" | "finance";

export function canViewActivityReport(role: string | null | undefined): boolean {
  return ACTIVITY_REPORT_ROLES.has(normalizeRole(role));
}

export function getActivityReportBasePath(
  portal: ActivityReportPortal
): string {
  return portal === "finance"
    ? "/finance/reports/activity"
    : "/academic/reports";
}

export function getActivityReportHomePath(
  portal: ActivityReportPortal
): string {
  return portal === "finance" ? "/finance" : "/academic";
}
