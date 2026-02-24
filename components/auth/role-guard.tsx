"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const userRole = (user.user_metadata?.role as string) ?? "student";
      if (roles.includes(userRole) || (roles.includes("admin") && userRole === "super_admin")) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    };
    check();
  }, [roles, router]);

  if (allowed === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Access denied
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          You do not have permission to view this page.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Go home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
