"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/layout/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { uploadUserAvatar } from "@/lib/profile/avatar";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ProfileState = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function UserAvatarMenu() {
  const router = useRouter();
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: row } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      const name = row?.name || user.email?.split("@")[0] || "User";
      setProfile({
        id: user.id,
        name,
        email: user.email ?? "",
        avatarUrl: row?.avatar_url ?? null,
      });
    }

    loadProfile();
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const avatarUrl = await uploadUserAvatar(file, profile.id);
      setProfile((current) => (current ? { ...current, avatarUrl } : current));
      toast.success(t("avatarUpdated"));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("avatarUpdateFailed"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const displayName = profile?.name ?? "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative rounded-full ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={t("changeAvatar")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar
          name={displayName}
          avatarUrl={profile?.avatarUrl}
          size="sm"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
          <Camera className="h-3.5 w-3.5" />
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              name={displayName}
              avatarUrl={profile?.avatarUrl}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-900 dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                {profile?.email}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              role="menuitem"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover",
                uploading && "cursor-not-allowed opacity-70"
              )}
            >
              <Camera className="h-4 w-4" />
              {uploading ? t("avatarUploading") : t("changeAvatar")}
            </button>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {tNav("settings")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
