"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createClient } from "@/lib/supabase/client";
import { mapPhoneAuthError } from "@/lib/auth/phone-auth-errors";
import { maskE164, normalizeToE164 } from "@/lib/phone/e164";
import { toast } from "@/lib/toast";

const RESEND_COOLDOWN_SEC = 60;

type LinkStep = "idle" | "otp";

type PhoneLinkFormData = {
  phone: string;
};

type PhoneVerifyFormData = {
  otp: string;
};

export function PhoneLinkCard() {
  const t = useTranslations("settings");
  const tv = useTranslations("validation");
  const ta = useTranslations("auth");

  const [linkedPhone, setLinkedPhone] = useState<string | null>(null);
  const [step, setStep] = useState<LinkStep>("idle");
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    async function loadPhone() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLinkedPhone(user?.phone ?? null);
    }
    loadPhone();
  }, []);

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
          .min(6, ta("phoneOtpLength"))
          .max(6, ta("phoneOtpLength"))
          .regex(/^\d{6}$/, ta("phoneOtpLength")),
      }),
    [ta]
  );

  async function startLink(rawPhone: string) {
    const normalized = normalizeToE164(rawPhone);
    if (!normalized) {
      toast.error(tv("invalidPhone"));
      return;
    }

    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ phone: normalized });
      if (error) throw error;

      setPendingPhone(normalized);
      setStep("otp");
      setResendIn(RESEND_COOLDOWN_SEC);
      toast.success(ta("phoneOtpSentWhatsApp"));
    } catch (err) {
      const message = err instanceof Error ? err.message : ta("phoneOtpSendFailed");
      toast.error(ta(mapPhoneAuthError(message)));
    } finally {
      setSending(false);
    }
  }

  async function confirmLink(token: string) {
    if (!pendingPhone) return;

    setVerifying(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        phone: pendingPhone,
        token,
        type: "phone_change",
      });
      if (error) throw error;

      setLinkedPhone(pendingPhone);
      setStep("idle");
      setPendingPhone(null);
      toast.success(t("phoneLinked"));
    } catch (err) {
      const message = err instanceof Error ? err.message : ta("phoneOtpInvalid");
      toast.error(ta(mapPhoneAuthError(message)));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("phoneLinkTitle")}</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("phoneLinkDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkedPhone && step === "idle" ? (
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
            {t("phoneLinkedValue", { phone: maskE164(linkedPhone) })}
          </p>
        ) : null}

        {step === "otp" && pendingPhone ? (
          <>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {ta("phoneOtpPrompt", { phone: maskE164(pendingPhone) })}
            </p>
            <FormWrapper
              schema={otpSchema}
              onSubmit={(data) => confirmLink(data.otp)}
              className="space-y-4"
            >
              <PhoneVerifyFields verifying={verifying} />
            </FormWrapper>
            <button
              type="button"
              disabled={sending || resendIn > 0}
              className="text-sm font-medium text-primary hover:text-primary-hover disabled:opacity-50"
              onClick={() => startLink(pendingPhone)}
            >
              {resendIn > 0
                ? ta("phoneResendIn", { seconds: resendIn })
                : ta("phoneResendCode")}
            </button>
          </>
        ) : (
          <FormWrapper
            schema={phoneSchema}
            onSubmit={(data) => startLink(data.phone)}
            className="space-y-4"
          >
            <PhoneLinkFields sending={sending} defaultPhone={linkedPhone ?? ""} />
          </FormWrapper>
        )}
      </CardContent>
    </Card>
  );
}

function PhoneLinkFields({
  sending,
  defaultPhone,
}: {
  sending: boolean;
  defaultPhone: string;
}) {
  const t = useTranslations("settings");
  const ta = useTranslations("auth");
  const {
    register,
    formState: { errors },
  } = useFormContext<PhoneLinkFormData>();

  return (
    <>
      <div>
        <Label htmlFor="settings-phone" required>
          {ta("phoneNumber")}
        </Label>
        <Input
          id="settings-phone"
          type="tel"
          defaultValue={defaultPhone}
          placeholder="+243 822 000 000"
          error={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="mt-1.5 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>
      <Button type="submit" disabled={sending}>
        {sending ? ta("phoneSendingCode") : t("phoneLinkAction")}
      </Button>
    </>
  );
}

function PhoneVerifyFields({ verifying }: { verifying: boolean }) {
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  const {
    register,
    formState: { errors },
  } = useFormContext<PhoneVerifyFormData>();

  return (
    <>
      <div>
        <Label htmlFor="settings-phone-otp" required>
          {ta("phoneOtpLabel")}
        </Label>
        <Input
          id="settings-phone-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          error={!!errors.otp}
          {...register("otp")}
        />
        {errors.otp && (
          <p className="mt-1.5 text-sm text-red-500">{errors.otp.message}</p>
        )}
      </div>
      <Button type="submit" disabled={verifying}>
        {verifying ? ta("phoneVerifying") : tc("confirm")}
      </Button>
    </>
  );
}
