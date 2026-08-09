import Link from "next/link";
import { getLocale, getMessages } from "next-intl/server";
import { BrandLogo } from "@/components/company/brand-logo";
import { AppIntlProvider } from "@/components/i18n/app-intl-provider";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <AppIntlProvider locale={locale} messages={messages}>
      <div className="marketing-surface flex min-h-[100dvh] flex-col bg-mkt-canvas text-mkt-ink">
        <header className="relative z-10 shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 md:px-6">
          <Link href="/" className="inline-flex">
            <BrandLogo size={36} />
          </Link>
        </header>
        <main className="relative flex min-h-0 flex-1 flex-col items-center justify-start px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-4 md:justify-center md:px-6 md:pt-0">
          <div className="w-full max-w-2xl">{children}</div>
        </main>
      </div>
    </AppIntlProvider>
  );
}
