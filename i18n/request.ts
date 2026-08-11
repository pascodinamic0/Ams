import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  defaultLocale,
  defaultTimeZone,
  isValidLocale,
  LOCALE_COOKIE,
  locales,
  type Locale,
} from "./config";

async function loadMessages(locale: string) {
  const [
    common,
    nav,
    auth,
    validation,
    errors,
    settings,
    marketing,
    modules,
    blog,
    onboarding,
    pwa,
    roles,
    schools,
    admin,
    academic,
    finance,
    operations,
    teacher,
    parent,
    student,
    analytics,
    messages,
    outreach,
    notifications,
    billing,
  ] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/nav.json`),
    import(`../messages/${locale}/auth.json`),
    import(`../messages/${locale}/validation.json`),
    import(`../messages/${locale}/errors.json`),
    import(`../messages/${locale}/settings.json`),
    import(`../messages/${locale}/marketing.json`),
    import(`../messages/${locale}/modules.json`),
    import(`../messages/${locale}/blog.json`),
    import(`../messages/${locale}/onboarding.json`),
    import(`../messages/${locale}/pwa.json`),
    import(`../messages/${locale}/roles.json`),
    import(`../messages/${locale}/schools.json`),
    import(`../messages/${locale}/admin.json`),
    import(`../messages/${locale}/academic.json`),
    import(`../messages/${locale}/finance.json`),
    import(`../messages/${locale}/operations.json`),
    import(`../messages/${locale}/teacher.json`),
    import(`../messages/${locale}/parent.json`),
    import(`../messages/${locale}/student.json`),
    import(`../messages/${locale}/analytics.json`),
    import(`../messages/${locale}/messages.json`),
    import(`../messages/${locale}/outreach.json`),
    import(`../messages/${locale}/notifications.json`),
    import(`../messages/${locale}/billing.json`),
  ]);

  return {
    common: common.default,
    nav: nav.default,
    auth: auth.default,
    validation: validation.default,
    errors: errors.default,
    settings: settings.default,
    marketing: marketing.default,
    modules: modules.default,
    blog: blog.default,
    onboarding: onboarding.default,
    pwa: pwa.default,
    roles: roles.default,
    schools: schools.default,
    admin: admin.default,
    academic: academic.default,
    finance: finance.default,
    operations: operations.default,
    teacher: teacher.default,
    parent: parent.default,
    student: student.default,
    analytics: analytics.default,
    messages: messages.default,
    outreach: outreach.default,
    notifications: notifications.default,
    billing: billing.default,
  };
}

async function resolveSchoolLocale(): Promise<Locale | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id, schools(locale)")
      .eq("id", user.id)
      .maybeSingle();

    const school = profile?.schools as { locale?: string } | { locale?: string }[] | null;
    const localeValue = Array.isArray(school) ? school[0]?.locale : school?.locale;
    return isValidLocale(localeValue) ? localeValue : null;
  } catch {
    return null;
  }
}

function resolveVisitorLocale(cookieLocale: string | undefined, acceptLanguage: string | null): Locale {
  if (isValidLocale(cookieLocale)) return cookieLocale;

  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((part) => part.split(";")[0]?.trim().slice(0, 2).toLowerCase())
      .find((code) => locales.includes(code as (typeof locales)[number]));
    if (preferred && isValidLocale(preferred)) {
      return preferred;
    }
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const schoolLocale = await resolveSchoolLocale();
  if (schoolLocale) {
    return {
      locale: schoolLocale,
      timeZone: defaultTimeZone,
      messages: await loadMessages(schoolLocale),
    };
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = (await headers()).get("accept-language");
  const locale = resolveVisitorLocale(cookieLocale, acceptLanguage);

  return {
    locale,
    timeZone: defaultTimeZone,
    messages: await loadMessages(locale),
  };
});
