"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export function SignOutButton({
  variant = "primary",
}: {
  variant?: "primary" | "outline" | "ghost";
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} onClick={handleLogout}>
      Sign out
    </Button>
  );
}
