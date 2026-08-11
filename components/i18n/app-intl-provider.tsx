"use client";

import { NextIntlClientProvider } from "next-intl";

type AppIntlProviderProps = {
  locale: string;
  timeZone: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
};

/**
 * Client-side intl boundary. Prefer this over importing NextIntlClientProvider
 * directly in a Server Layout when nesting with other client providers
 * (e.g. next-themes) -- the server async wrapper can lose context if a sibling
 * Server Component render fails and React retries on the client.
 */
export function AppIntlProvider({
  locale,
  timeZone,
  messages,
  children,
}: AppIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} timeZone={timeZone} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
