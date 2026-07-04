import Link from "next/link";
import { BrandLogo } from "@/components/company/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-[#0c1222]">
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-2 md:px-6">
        <Link href="/" className="inline-flex">
          <BrandLogo size={36} />
        </Link>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
