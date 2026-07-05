"use client";

import { cn } from "@/lib/utils";

type UserAvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initial = (name.trim().charAt(0) || "U").toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-primary-light font-semibold text-primary-hover dark:bg-primary-light/50 dark:text-primary",
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initial}</span>
      )}
    </div>
  );
}
