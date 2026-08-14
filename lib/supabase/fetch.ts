/** Cap hung DNS / offline fetches so middleware does not stall for tens of seconds. */
const FETCH_TIMEOUT_MS = 8_000;

/**
 * auth-js `console.error`s the raw TypeError when `fetch` throws.
 * Return a 503 instead so token refresh fails as a retryable auth error.
 */
export async function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const signal =
    init?.signal && typeof AbortSignal.any === "function"
      ? AbortSignal.any([init.signal, timeout])
      : timeout;

  try {
    return await fetch(input, { ...init, signal });
  } catch {
    return new Response(JSON.stringify({ message: "Network error" }), {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" },
    });
  }
}
