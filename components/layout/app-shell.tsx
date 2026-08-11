import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { AppIntlProvider } from "@/components/i18n/app-intl-provider";
import {
  AppShellClient,
  type AppShellMobileMode,
  type AppShellProps,
} from "@/components/layout/app-shell-client";
import { pickClientMessages } from "@/lib/i18n/client-messages";

export type { AppShellMobileMode, AppShellProps };

/**
 * Server wrapper around the interactive shell.
 *
 * When a nested Server Component fails during SSR, React may retry the client
 * shell without the root `NextIntlClientProvider`. Passing messages into a
 * local client provider keeps `useTranslations` working in that fallback path.
 */
export async function AppShell(props: AppShellProps) {
  const locale = await getLocale();
  const timeZone = await getTimeZone();
  const messages = pickClientMessages(await getMessages(), "/");

  return (
    <AppIntlProvider locale={locale} timeZone={timeZone} messages={messages}>
      <AppShellClient {...props} />
    </AppIntlProvider>
  );
}
