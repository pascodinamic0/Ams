/**
 * Staff invite / reset passwords are a 4-digit or 4-letter PIN.
 *
 * Supabase Auth (GoTrue) floors password length at 6 characters, so we store
 * the PIN with a fixed suffix. Login expands the same way before auth.
 */

export const STAFF_PIN_LENGTH = 4;

/** Matches exactly 4 digits, or exactly 4 letters (any case). */
export const STAFF_PIN_PATTERN = /^(?:\d{4}|[A-Za-z]{4})$/;

/**
 * Appended to a valid PIN before Auth stores or verifies it.
 * Not a secret - it only lifts the PIN past GoTrue's 6-character floor.
 */
export const STAFF_PIN_SUFFIX = "#shuleos";

export function isStaffPin(value: string): boolean {
  return STAFF_PIN_PATTERN.test(value.trim());
}

/** Letter PINs are stored lowercase so sign-in is case-insensitive for letters. */
export function normalizeStaffPin(value: string): string {
  const trimmed = value.trim();
  if (/^[A-Za-z]{4}$/.test(trimmed)) return trimmed.toLowerCase();
  return trimmed;
}

/** Expand a 4-char staff PIN for Auth; leave longer passwords unchanged. */
export function expandStaffPin(value: string): string {
  const normalized = normalizeStaffPin(value);
  if (STAFF_PIN_PATTERN.test(normalized)) {
    return `${normalized}${STAFF_PIN_SUFFIX}`;
  }
  return value;
}
