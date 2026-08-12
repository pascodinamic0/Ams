import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";
import en from "@/messages/en/email.json";
import fr from "@/messages/fr/email.json";

type Dict = Record<string, unknown>;

function lookup(obj: Dict, path: string): string | undefined {
  let current: unknown = obj;
  for (const part of path.split(".")) {
    if (typeof current !== "object" || current === null || !(part in current)) {
      return undefined;
    }
    current = (current as Dict)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, values?: Record<string, string>) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

export function tEmail(
  locale: string | null | undefined,
  key: string,
  values?: Record<string, string>
) {
  const loc: Locale = isValidLocale(locale) ? locale : defaultLocale;
  const dict = (loc === "fr" ? fr : en) as Dict;
  const raw = lookup(dict, key) ?? lookup(en as Dict, key) ?? key;
  return interpolate(raw, values);
}
