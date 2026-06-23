import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isValidLocale, LOCALE_COOKIE, locales } from "./config";

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
  ] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/nav.json`),
    import(`../messages/${locale}/auth.json`),
    import(`../messages/${locale}/validation.json`),
    import(`../messages/${locale}/errors.json`),
    import(`../messages/${locale}/settings.json`),
    import(`../messages/${locale}/marketing.json`),
    import(`../messages/${locale}/modules.json`),
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
  };
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale = isValidLocale(cookieLocale) ? cookieLocale : defaultLocale;

  if (!isValidLocale(cookieLocale)) {
    const acceptLanguage = (await headers()).get("accept-language");
    if (acceptLanguage) {
      const preferred = acceptLanguage
        .split(",")
        .map((part) => part.split(";")[0]?.trim().slice(0, 2).toLowerCase())
        .find((code) => locales.includes(code as (typeof locales)[number]));
      if (preferred && isValidLocale(preferred)) {
        locale = preferred;
      }
    }
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
