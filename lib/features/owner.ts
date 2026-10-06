/** Platform owner inbox. Must match platform_settings.owner_email in the database. */
export const DEFAULT_PLATFORM_OWNER_EMAIL = "pascodinamic00@gmail.com";

export function platformOwnerEmail(): string {
  return (process.env.OWNER_EMAIL || DEFAULT_PLATFORM_OWNER_EMAIL).trim().toLowerCase();
}

export function isPlatformOwner(
  email: string | null | undefined,
  role: string | null | undefined
): boolean {
  if (role !== "super_admin") return false;
  const normalized = email?.trim().toLowerCase() ?? "";
  return normalized.length > 0 && normalized === platformOwnerEmail();
}
