import Link from "next/link";
import { BrandLogo } from "@/components/company/brand-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-white">
      <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <Link href="/" className="inline-flex">
          <BrandLogo size={32} />
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
