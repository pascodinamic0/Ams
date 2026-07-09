"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { buildAuthCallbackUrl } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthCallbackUrl({ redirect: "/reset-password" }),
      });
      setSent(true);
      toast.success(t("resetLinkSentToast"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("resetEmailFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl tracking-wide text-white">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="mt-2 text-white/50">{t("forgotPasswordSubtitle")}</p>
        {sent ? (
          <p className="mt-8 text-white/55">{t("resetLinkSentMessage")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email" required>
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("sending") : t("sendResetLink")}
            </Button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-white/45 transition-colors hover:text-white"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
