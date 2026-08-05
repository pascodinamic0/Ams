"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createFeeCheckoutSession } from "@/lib/actions/stripe-checkout";
import { toast } from "@/lib/toast";

export function StripePayButton({ invoiceId }: { invoiceId: string }) {
  const t = useTranslations("parent");
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  function onPay() {
    startTransition(async () => {
      const result = await createFeeCheckoutSession(invoiceId);
      if (result.error || !result.url) {
        toast.error(result.error ?? t("stripeCheckoutFailed"));
        return;
      }
      setRedirecting(true);
      window.location.href = result.url;
    });
  }

  return (
    <Button
      type="button"
      onClick={onPay}
      disabled={pending || redirecting}
      className="w-full sm:w-auto"
    >
      {pending || redirecting ? t("stripeRedirecting") : t("payWithCard")}
    </Button>
  );
}
