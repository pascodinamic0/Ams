import type { User } from "@supabase/supabase-js";

const PASSWORD_SETUP_PATHS = new Set([
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/hash",
  "/forgot-password",
]);

export function userMustSetPassword(user: User | null | undefined): boolean {
  return user?.app_metadata?.must_set_password === true;
}

export function isPasswordSetupPath(pathname: string): boolean {
  if (PASSWORD_SETUP_PATHS.has(pathname)) return true;
  return pathname.startsWith("/auth/");
}
