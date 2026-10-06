/** Request headers set by the proxy. Never trust these from the browser. */
export const AUTH_HEADERS = {
  userId: "x-ams-user-id",
  email: "x-ams-email",
  role: "x-ams-role",
  name: "x-ams-name",
  schoolId: "x-ams-school-id",
  branchId: "x-ams-branch-id",
  schoolName: "x-ams-school-name",
  schoolLogo: "x-ams-school-logo",
} as const;

export function clearAuthHeaders(headers: Headers) {
  for (const name of Object.values(AUTH_HEADERS)) {
    headers.delete(name);
  }
}

export type ForwardedAuth = {
  userId: string;
  email: string;
  role: string;
  name: string;
  schoolId: string | null;
  branchId: string | null;
  schoolName: string | null;
  schoolLogoUrl: string | null;
};

export function writeAuthHeaders(headers: Headers, auth: ForwardedAuth) {
  headers.set(AUTH_HEADERS.userId, auth.userId);
  headers.set(AUTH_HEADERS.email, auth.email);
  headers.set(AUTH_HEADERS.role, auth.role);
  headers.set(AUTH_HEADERS.name, encodeURIComponent(auth.name));
  if (auth.schoolId) headers.set(AUTH_HEADERS.schoolId, auth.schoolId);
  if (auth.branchId) headers.set(AUTH_HEADERS.branchId, auth.branchId);
  if (auth.schoolName) {
    headers.set(AUTH_HEADERS.schoolName, encodeURIComponent(auth.schoolName));
  }
  if (auth.schoolLogoUrl) {
    headers.set(AUTH_HEADERS.schoolLogo, encodeURIComponent(auth.schoolLogoUrl));
  }
}

export function readEncodedHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
