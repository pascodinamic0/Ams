import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { BrandLogo } from "@/components/company/brand-logo";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="marketing-surface flex min-h-[100dvh] flex-col">
        <header className="relative z-10 shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 md:px-6">
          <Link href="/" className="inline-flex">
            <BrandLogo size={36} />
          </Link>
        </header>
        <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-12 md:px-6">
          <div className="w-full max-w-lg">{children}</div>
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
