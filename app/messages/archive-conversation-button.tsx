"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Archive, ArchiveRestore } from "lucide-react";
import { setConversationArchived } from "@/lib/actions/conversations";
import { Button } from "@/components/ui/button";

interface Props {
  conversationId: string;
  archived: boolean;
}

export function ArchiveConversationButton({ conversationId, archived }: Props) {
  const t = useTranslations("messages");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  function handleClick() {
    setBusy(true);
    startTransition(async () => {
      try {
        const nextArchived = !archived;
        const result = await setConversationArchived(conversationId, nextArchived);
        if (result.error) {
          toast.error(t("archiveFailed"));
          return;
        }
        toast.success(nextArchived ? t("conversationArchived") : t("conversationUnarchived"));
        if (nextArchived) {
          router.push("/messages");
        } else {
          router.refresh();
        }
      } finally {
        setBusy(false);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={busy || pending}
      className="h-8 gap-1.5 px-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
      title={archived ? t("unarchive") : t("archive")}
    >
      {archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
      <span className="hidden sm:inline">{archived ? t("unarchive") : t("archive")}</span>
    </Button>
  );
}
