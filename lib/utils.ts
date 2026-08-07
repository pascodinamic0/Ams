import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type PersonNameParts = {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
};

/** Join first / middle / last, skipping blanks. */
export function formatPersonName(parts: PersonNameParts | string | null | undefined): string {
  if (typeof parts === "string") return parts.trim();
  if (!parts) return "";
  return [parts.first_name, parts.middle_name, parts.last_name]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

/** Best-effort split of a full name into first / middle / last. */
export function splitPersonName(fullName: string): {
  first_name: string;
  middle_name?: string;
  last_name: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  if (parts.length === 2) return { first_name: parts[0], last_name: parts[1] };
  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}
