import type { SupabaseClient } from "@supabase/supabase-js";

export function slugifySchoolName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateSchoolCode(name: string): string {
  const slug = slugifySchoolName(name);
  const parts = slug.split("-").filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }
  return (slug.slice(0, 3) || "SCH").toUpperCase();
}

export async function resolveUniqueSchoolSlug(
  supabase: SupabaseClient,
  baseName: string
): Promise<string> {
  const baseSlug = slugifySchoolName(baseName);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("schools")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
  return slug;
}

export async function resolveUniqueSchoolCode(
  supabase: SupabaseClient,
  name: string
): Promise<string> {
  let code = generateSchoolCode(name);
  let codeAttempt = 0;
  while (true) {
    const { data: existingCode } = await supabase
      .from("schools")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existingCode) break;
    codeAttempt++;
    code = `${generateSchoolCode(name)}${codeAttempt}`;
  }
  return code;
}

export const DEFAULT_BRANCH_NAME = "Main Campus";
