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

/** Returns a user-safe message when server Supabase env is missing or mismatched. */
export function getServiceRoleConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return "Server configuration error. Contact support.";
  }

  const urlRef = getProjectRefFromUrl(url);
  const keyRef = getProjectRefFromJwt(serviceKey);
  if (urlRef && keyRef && urlRef !== keyRef) {
    return `Supabase service role key is for project "${keyRef}" but the app is configured for "${urlRef}". Update SUPABASE_SERVICE_ROLE_KEY in Vercel to match the AMC project.`;
  }

  return null;
}

/** Ensures server-side service role key belongs to the same Supabase project as the public URL. */
export function assertServiceRoleMatchesProject() {
  const error = getServiceRoleConfigError();
  if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(error);
  }
}
