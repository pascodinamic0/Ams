import { createClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export async function uploadUserAvatar(file: File, userId: string) {
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Image must be 5MB or smaller");
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (profileError) throw profileError;

  return avatarUrl;
}

export async function removeUserAvatar(userId: string) {
  const supabase = createClient();

  const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  if (files?.length) {
    await supabase.storage
      .from(AVATAR_BUCKET)
      .remove(files.map((file) => `${userId}/${file.name}`));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}
