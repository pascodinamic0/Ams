import Link from "next/link";
import { BrandLogo } from "@/components/company/brand-logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-[#0c1222]">
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 md:px-6">
        <Link href="/" className="inline-flex">
          <BrandLogo size={36} />
        </Link>
      </header>
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-12 md:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
