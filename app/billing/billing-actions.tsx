"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
} from "@/lib/actions/billing";
import { toast } from "@/lib/toast";

export function SubscribeButton({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("billing");
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    const result = await createBillingCheckoutSession();
    setPending(false);
    if (result.error || !result.url) {
      toast.error(result.error ?? t("checkoutFailed"));
      return;
    }
    window.location.href = result.url;
  }

  return (
    <Button onClick={onClick} disabled={disabled || pending} size="lg">
      {pending ? "..." : t("subscribeCta")}
    </Button>
  );
}

export function ManageBillingButton({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("billing");
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    const result = await createBillingPortalSession();
    setPending(false);
    if (result.error || !result.url) {
      toast.error(result.error ?? t("portalFailed"));
      return;
    }
    window.location.href = result.url;
  }

  return (
    <Button onClick={onClick} disabled={disabled || pending} variant="outline">
      {pending ? "..." : t("manageCta")}
    </Button>
  );
}

export function BillingStatusToasts({
  success,
  canceled,
}: {
  success: boolean;
  canceled: boolean;
}) {
  const t = useTranslations("billing");
  const router = useRouter();

  useEffect(() => {
    if (success) {
      toast.success(t("successToast"));
      router.replace("/billing");
      router.refresh();
      return;
    }
    if (canceled) {
      toast.info(t("canceledToast"));
      router.replace("/billing");
    }
  }, [success, canceled, router, t]);

  return null;
}
