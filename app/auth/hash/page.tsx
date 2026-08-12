"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/company/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { resolvePostAuthDestination } from "@/lib/actions/post-auth-redirect";

/**
 * Implicit-flow fallback: invite/recovery tokens arrive in the URL hash.
 * The server never sees the hash, so /auth/callback rewrites here instead of
 * bouncing to login and dropping the session.
 */
export default function AuthHashPage() {
  const t = useTranslations("auth");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function consumeHash() {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const error =
        params.get("error_description") ||
        params.get("error") ||
        new URLSearchParams(window.location.search).get("error");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (error) {
        if (!cancelled) {
          setMessage(decodeURIComponent(error.replace(/\+/g, " ")));
        }
        return;
      }

      if (!accessToken || !refreshToken) {
        if (!cancelled) {
          setMessage(t("inviteLinkExpired"));
        }
        return;
      }

      const supabase = createClient();
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError || !data.user) {
        if (!cancelled) {
          setMessage(sessionError?.message ?? t("inviteLinkExpired"));
        }
        return;
      }

      const next =
        type === "invite" || type === "recovery"
          ? "/reset-password"
          : await resolvePostAuthDestination({ userId: data.user.id });

      window.location.replace(next);
    }

    void consumeHash();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="marketing-surface flex min-h-[100dvh] flex-col bg-mkt-canvas text-mkt-ink">
      <header className="shrink-0 border-b border-border px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 md:px-6">
        <Link href="/" className="inline-flex">
          <BrandLogo size={36} />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
        <h1 className="font-display text-2xl tracking-tight text-mkt-ink">
          {message ? t("inviteLinkExpiredTitle") : t("activatingInvite")}
        </h1>
        <p className="mt-2 text-muted">
          {message ?? t("activatingInviteSubtitle")}
        </p>
        {message ? (
          <Link
            href="/login"
            className="mt-6 block text-center text-sm text-muted transition-colors hover:text-foreground"
          >
            {t("backToLogin")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
