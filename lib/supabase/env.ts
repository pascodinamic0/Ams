function getProjectRefFromUrl(url: string) {
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

function getProjectRefFromJwt(jwt: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1]!, "base64url").toString("utf8")
    ) as { ref?: string };
    return payload.ref ?? null;
  } catch {
    return null;
  }
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
    );
  }

  return { url, anonKey };
}

/** Ensures server-side service role key belongs to the same Supabase project as the public URL. */
export function assertServiceRoleMatchesProject() {
  const { url } = getSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return;

  const urlRef = getProjectRefFromUrl(url);
  const keyRef = getProjectRefFromJwt(serviceKey);
  if (urlRef && keyRef && urlRef !== keyRef) {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is for project "${keyRef}" but NEXT_PUBLIC_SUPABASE_URL points to "${urlRef}". Copy the service_role key from the matching project in Supabase Dashboard → Settings → API.`
    );
  }
}
