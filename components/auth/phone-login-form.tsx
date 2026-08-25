"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { resolvePostAuthDestination } from "@/lib/actions/post-auth-redirect";
import { mapPhoneAuthError } from "@/lib/auth/phone-auth-errors";
import { normalizeToE164, maskE164 } from "@/lib/phone/e164";
import { toast } from "@/lib/toast";

const RESEND_COOLDOWN_SEC = 60;

type PhoneStep = "number" | "otp";

type PhoneNumberFormData = {
  phone: string;
};

type PhoneOtpFormData = {
  otp: string;
};

export function PhoneLoginForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [step, setStep] = useState<PhoneStep>("number");
  const [e164, setE164] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const phoneSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .min(1, tv("phoneRequired"))
          .refine((value) => normalizeToE164(value) !== null, {
            message: tv("invalidPhone"),
          }),
      }),
    [tv]
  );

  const otpSchema = useMemo(
    () =>
      z.object({
        otp: z
          .string()
          .min(6, t("phoneOtpLength"))
          .max(6, t("phoneOtpLength"))
          .regex(/^\d{6}$/, t("phoneOtpLength")),
      }),
    [t]
  );

  async function sendOtp(rawPhone: string) {
    const normalized = normalizeToE164(rawPhone);
    if (!normalized) {
      toast.error(tv("invalidPhone"));
      return;
    }

    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalized,
        options: {
          channel: "whatsapp",
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setE164(normalized);
      setStep("otp");
      setResendIn(RESEND_COOLDOWN_SEC);
      toast.success(t("phoneOtpSentWhatsApp"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("phoneOtpSendFailed");
      toast.error(t(mapPhoneAuthError(message)));
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp(token: string) {
    if (!e164) return;

    setVerifying(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164,
        token,
        type: "sms",
      });

      if (error) throw error;

      let destination = redirectParam ?? "/admin";
      if (data.user) {
        destination = await resolvePostAuthDestination({
          userId: data.user.id,
          redirect: redirectParam,
        });
      }

      toast.success(t("signInSuccess"));
      window.location.assign(destination);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("phoneOtpInvalid");
      toast.error(t(mapPhoneAuthError(message)));
    } finally {
      setVerifying(false);
    }
  }

  if (step === "otp" && e164) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted">
          {t("phoneOtpPrompt", { phone: maskE164(e164) })}
        </p>

        <FormWrapper schema={otpSchema} onSubmit={(data) => verifyOtp(data.otp)} className="space-y-5">
          <PhoneOtpFields verifying={verifying} />
        </FormWrapper>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            className="font-medium text-primary hover:text-primary-hover"
            onClick={() => {
              setStep("number");
              setE164(null);
            }}
          >
            {t("phoneChangeNumber")}
          </button>
          <button
            type="button"
            disabled={sending || resendIn > 0}
            className="font-medium text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => sendOtp(e164)}
          >
            {resendIn > 0
              ? t("phoneResendIn", { seconds: resendIn })
              : t("phoneResendCode")}
          </button>
        </div>

        <p className="text-center text-sm text-muted">
          {t("phoneNoAccount")}{" "}
          <Link href="/get-access" className="font-medium text-primary hover:text-primary-hover">
            {t("getAccess")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">{t("phoneLoginHint")}</p>

      <FormWrapper
        schema={phoneSchema}
        onSubmit={(data) => sendOtp(data.phone)}
        className="space-y-5"
      >
        <PhoneNumberFields sending={sending} />
      </FormWrapper>

      <p className="text-center text-sm text-muted">
        {t("phoneNoAccount")}{" "}
        <Link href="/get-access" className="font-medium text-primary hover:text-primary-hover">
          {t("getAccess")}
        </Link>
      </p>
    </div>
  );
}

function PhoneNumberFields({ sending }: { sending: boolean }) {
  const t = useTranslations("auth");
  const {
    register,
    formState: { errors },
  } = useFormContext<PhoneNumberFormData>();

  return (
    <>
      <div>
        <Label htmlFor="phone-login" required>
          {t("phoneNumber")}
        </Label>
        <Input
          id="phone-login"
          type="tel"
          autoComplete="tel"
          placeholder="+243 822 000 000"
          className="border-border bg-surface text-foreground placeholder:text-muted-foreground"
          error={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="mt-1.5 text-sm text-red-500">{errors.phone.message}</p>
        )}
        <p className="mt-1.5 text-xs text-muted">{t("phoneWhatsAppDelivery")}</p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={sending}>
        {sending ? t("phoneSendingCode") : t("phoneSendCode")}
      </Button>
    </>
  );
}

function PhoneOtpFields({ verifying }: { verifying: boolean }) {
  const t = useTranslations("auth");
  const {
    register,
    formState: { errors },
  } = useFormContext<PhoneOtpFormData>();

  return (
    <>
      <div>
        <Label htmlFor="phone-otp" required>
          {t("phoneOtpLabel")}
        </Label>
        <Input
          id="phone-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="border-border bg-surface text-foreground placeholder:text-muted-foreground tracking-[0.3em]"
          error={!!errors.otp}
          {...register("otp")}
        />
        {errors.otp && (
          <p className="mt-1.5 text-sm text-red-500">{errors.otp.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={verifying}>
        {verifying ? t("phoneVerifying") : t("phoneVerifyAndSignIn")}
      </Button>
    </>
  );
}
