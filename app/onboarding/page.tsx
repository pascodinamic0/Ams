import { Suspense } from "react";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { AppIntlProvider } from "@/components/i18n/app-intl-provider";
import { pickClientMessages } from "@/lib/i18n/client-messages";
import { OnboardingFallback, OnboardingPageContent } from "./onboarding-client";

/**
 * Server wrapper so `useTranslations` keeps a local NextIntlClientProvider if
 * React retries the client tree after a failed server render.
 */
export default async function OnboardingPage() {
  const locale = await getLocale();
  const timeZone = await getTimeZone();
  const messages = pickClientMessages(await getMessages(), "/onboarding");

  return (
    <AppIntlProvider locale={locale} timeZone={timeZone} messages={messages}>
      <Suspense fallback={<OnboardingFallback />}>
        <OnboardingPageContent />
      </Suspense>
    </AppIntlProvider>
  );
}
