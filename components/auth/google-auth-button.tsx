"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { buildAuthCallbackUrl } from "@/lib/auth/app-url";
import type { GoogleOAuthIntent } from "@/lib/auth/google-oauth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  intent = "login",
  redirect,
  label,
}: {
  intent?: GoogleOAuthIntent;
  redirect?: string | null;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth");
  const buttonLabel =
    label ??
    (intent === "register" ? t("continueWithGoogle") : t("signInWithGoogle"));

  async function handleClick() {
    setLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = buildAuthCallbackUrl({ intent, redirect });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      if (!data.url) {
        throw new Error("Google sign-in could not be started. Please try again.");
      }

      window.location.assign(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("signInFailed"));
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-3 rounded-full border-stone-300 dark:border-white/20 bg-transparent text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-white/5"
      size="lg"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {t("redirecting")}
        </span>
      ) : (
        <>
          <GoogleIcon />
          {buttonLabel}
        </>
      )}
    </Button>
  );
}
