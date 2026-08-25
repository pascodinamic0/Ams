/** Cap hung DNS / offline fetches so middleware does not stall for tens of seconds. */
const FETCH_TIMEOUT_MS = 8_000;

function isCallerAbort(error: unknown, timeout: AbortSignal): boolean {
  if (timeout.aborted) return false;
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return false;
  }
  const name = String((error as { name: string }).name);
  return name === "AbortError" || name === "TimeoutError";
}

/**
 * auth-js `console.error`s the raw TypeError when `fetch` throws.
 * Return a 503 instead so token refresh fails as a retryable auth error.
 *
 * Do not convert React/Next cancellation into a fake PostgREST body — that
 * surfaces as `getX error: {}` in the App Router overlay.
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
  } catch (error) {
    if (isCallerAbort(error, timeout)) {
      throw error;
    }
    return new Response(
      JSON.stringify({
        message: "Network error",
        code: "NETWORK_ERROR",
        details: timeout.aborted
          ? `Request exceeded ${FETCH_TIMEOUT_MS}ms`
          : error instanceof Error
            ? error.message
            : "fetch failed",
        hint: "Retryable; check connectivity or Supabase status.",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
