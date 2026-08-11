import Link from "next/link";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { BrandLogo } from "@/components/company/brand-logo";
import { AppIntlProvider } from "@/components/i18n/app-intl-provider";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const timeZone = await getTimeZone();
  const messages = await getMessages();

  return (
    <AppIntlProvider locale={locale} timeZone={timeZone} messages={messages}>
      <div className="marketing-surface flex min-h-[100dvh] flex-col">
        <header className="relative z-10 shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 md:px-6">
          <Link href="/" className="inline-flex">
            <BrandLogo size={36} />
          </Link>
        </header>
        <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-12 md:px-6">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    </AppIntlProvider>
  );
}
