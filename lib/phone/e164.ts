const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/** Strip spaces, dashes, and parentheses from a phone string. */
export function stripPhoneFormatting(value: string): string {
  return value.replace(/[\s\-().]/g, "");
}

/**
 * Normalize user input to E.164 when possible.
 * Defaults to DRC (+243) when no country code is present.
 */
export function normalizeToE164(
  raw: string,
  defaultCountryCode = "+243"
): string | null {
  const trimmed = stripPhoneFormatting(raw.trim());
  if (!trimmed) return null;

  let digits = trimmed;
  if (digits.startsWith("+")) {
    digits = `+${digits.slice(1).replace(/\D/g, "")}`;
  } else if (digits.startsWith("00")) {
    digits = `+${digits.slice(2).replace(/\D/g, "")}`;
  } else {
    const local = digits.replace(/\D/g, "");
    const cc = defaultCountryCode.replace(/\D/g, "");
    if (local.startsWith("0")) {
      digits = `+${cc}${local.slice(1)}`;
    } else if (local.startsWith(cc)) {
      digits = `+${local}`;
    } else {
      digits = `+${cc}${local}`;
    }
  }

  if (!E164_PATTERN.test(digits)) return null;
  return digits;
}

export function isValidE164(value: string): boolean {
  return E164_PATTERN.test(value);
}

/** Mask phone for display, e.g. +243822***8097 */
export function maskE164(value: string): string {
  if (value.length <= 6) return value;
  return `${value.slice(0, 6)}***${value.slice(-4)}`;
}
