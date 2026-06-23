export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Francais",
};

export const LOCALE_COOKIE = "AMS_LOCALE";

export function isValidLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}
