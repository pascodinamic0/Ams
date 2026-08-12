export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Default IANA timezone for next-intl formatting (DRC / WAT). */
export const defaultTimeZone = "Africa/Kinshasa";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export const LOCALE_COOKIE = "AMS_LOCALE";

export function isValidLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}
