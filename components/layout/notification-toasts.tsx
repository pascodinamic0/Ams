"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useShellBadges } from "@/components/layout/shell-badges-provider";
import { createClient } from "@/lib/supabase/client";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

/** Subscribe to new notifications and pop a toast as they arrive. */
export function NotificationToasts() {
  const router = useRouter();
  const { refresh, bumpUnreadNotifications } = useShellBadges();
  const t = useTranslations("notifications");
  const seenIds = useRef(new Set<string>());
  const refreshRef = useRef(refresh);
  const bumpRef = useRef(bumpUnreadNotifications);
  const viewLabelRef = useRef(t("view"));

  refreshRef.current = refresh;
  bumpRef.current = bumpUnreadNotifications;
  viewLabelRef.current = t("view");

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled || !user) return;

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const row = payload.new as NotificationRow;
            if (!row?.id || seenIds.current.has(row.id)) return;
            seenIds.current.add(row.id);

            // Cap memory for long sessions
            if (seenIds.current.size > 200) {
              const oldest = seenIds.current.values().next().value;
              if (oldest) seenIds.current.delete(oldest);
            }

            if (!row.is_read) {
              bumpRef.current(1);
            }
            refreshRef.current();
            router.refresh();

            if (
              typeof document !== "undefined" &&
              document.visibilityState !== "visible"
            ) {
              return;
            }

            toast.info(row.title, {
              id: row.id,
              description: row.body ?? undefined,
              duration: 7000,
              action: {
                label: viewLabelRef.current,
                onClick: () => router.push("/notifications"),
              },
            });
          }
        )
        .subscribe();
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [router]);

  return null;
}
