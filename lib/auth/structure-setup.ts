/** Routes reachable while the school structure wizard is still required. */
export const STRUCTURE_SETUP_EXEMPT_PREFIXES = [
  "/onboarding/school",
  "/settings",
  "/pending",
  "/auth",
  "/login",
];

export function isStructureSetupExempt(pathname: string): boolean {
  return STRUCTURE_SETUP_EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function shouldNeedStructureSetup(options: {
  role: string | null | undefined;
  schoolStatus: "pending" | "approved" | "suspended" | null;
  structureSetupCompletedAt: string | null | undefined;
}): boolean {
  return (
    options.role === "academic_admin" &&
    options.schoolStatus === "approved" &&
    !options.structureSetupCompletedAt
  );
}
