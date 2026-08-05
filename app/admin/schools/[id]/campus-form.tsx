"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBranch } from "@/lib/actions/branches";
import { toast } from "@/lib/toast";

export function CampusForm({
  branchId,
  schoolId,
  initialName,
  initialAddress,
}: {
  branchId: string;
  schoolId: string;
  initialName: string;
  initialAddress: string | null;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress ?? "");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateBranch({
        id: branchId,
        name,
        school_id: schoolId,
        address: address.trim() || undefined,
      });
      if (result.error) {
        const message =
          typeof result.error === "string"
            ? result.error
            : t("campusSaveFailed");
        toast.error(message);
        return;
      }
      toast.success(t("campusSaved"));
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
          {t("campusNameLabel")}
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
          {t("campusAddressLabel")}
        </label>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={pending}
        />
      </div>
      <Button type="submit" size="sm" disabled={pending || !name.trim()}>
        {t("campusSave")}
      </Button>
    </form>
  );
}
