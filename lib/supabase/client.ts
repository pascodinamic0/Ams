import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { supabaseFetch } from "@/lib/supabase/fetch";

const BROWSER_CLIENT_KEY = "__amsSupabaseBrowserClient";

type BrowserClientGlobal = typeof globalThis & {
  [BROWSER_CLIENT_KEY]?: SupabaseClient;
};

/**
 * One browser client per tab.
 * Turbopack can evaluate this module twice in dev; a module-local singleton
 * would then start two token refreshes and abort one with "Failed to fetch".
 */
export function createClient() {
  const g = globalThis as BrowserClientGlobal;
  if (g[BROWSER_CLIENT_KEY]) return g[BROWSER_CLIENT_KEY];

  const { url, anonKey } = getSupabasePublicEnv();
  const client = createBrowserClient(url, anonKey, {
    isSingleton: true,
    global: { fetch: supabaseFetch },
    auth: {
      // Server middleware already refreshes via getUser(). Skip navigator.locks
      // so React Strict Mode remounts cannot abort an in-flight refresh fetch.
      lock: async (_name, _acquireTimeout, fn) => fn(),
    },
  });

  void client.auth.initialize().catch(() => {});
  g[BROWSER_CLIENT_KEY] = client;
  return client;
}
