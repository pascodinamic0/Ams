/** Cap hung DNS / offline fetches so middleware does not stall for tens of seconds. */
const MIDDLEWARE_FETCH_TIMEOUT_MS = 4_000;
/**
 * Server and browser data queries share one fetch wrapper. A 4s cap aborted
 * reachable PostgREST calls (students counts, invoice filters) and the
 * dashboard then logged `getX error: {}`.
 */
const DATA_FETCH_TIMEOUT_MS = 20_000;

function isCallerAbort(error: unknown, timeout: AbortSignal): boolean {
  if (timeout.aborted) return false;
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return false;
  }
  const name = String((error as { name: string }).name);
  return name === "AbortError" || name === "TimeoutError";
}

const NETWORK_ERROR_MESSAGE = "Network error";

function readResponseMessage(response: Response): string {
  const message = (response as Response & { message?: unknown }).message;
  return typeof message === "string" ? message.trim() : "";
}

/**
 * auth-js treats 502/503/504 as retryable and reads `response.message`
 * without parsing the body. A Fetch Response has no `message`, so
 * `JSON.stringify(response)` becomes `"{}"` and that string is what
 * toasts and `console.error` show — including real gateway 503s, not
 * only fetches that throw.
 */
function stampRetryableMessage(response: Response, message: string): Response {
  const readable =
    message.trim() && message.trim() !== "{}" ? message.trim() : NETWORK_ERROR_MESSAGE;
  try {
    Object.defineProperty(response, "message", {
      value: readable,
      configurable: true,
    });
    return response;
  } catch {
    return networkFailureResponse(readable);
  }
}

async function messageFromBody(response: Response): Promise<string> {
  try {
    const text = (await response.clone().text()).trim();
    if (!text || text === "{}") return NETWORK_ERROR_MESSAGE;
    try {
      const data = JSON.parse(text) as {
        message?: unknown;
        error?: unknown;
        msg?: unknown;
      };
      const fromBody = [data?.message, data?.msg, data?.error].find(
        (value) => typeof value === "string" && value.trim() && value.trim() !== "{}"
      );
      if (typeof fromBody === "string") return fromBody.trim();
    } catch {
      if (!text.startsWith("<")) return text.replace(/\s+/g, " ").slice(0, 180);
    }
  } catch {
    // Body already read, or not cloneable.
  }
  return NETWORK_ERROR_MESSAGE;
}

async function withRetryableMessage(response: Response): Promise<Response> {
  if (response.status !== 502 && response.status !== 503 && response.status !== 504) {
    return response;
  }
  const existing = readResponseMessage(response);
  if (existing && existing !== "{}") return response;
  return stampRetryableMessage(response, await messageFromBody(response));
}

function networkFailureResponse(details: string): Response {
  const response = new Response(
    JSON.stringify({
      message: NETWORK_ERROR_MESSAGE,
      code: "NETWORK_ERROR",
      details,
      hint: "Retryable; check connectivity or Supabase status.",
    }),
    {
      status: 503,
      statusText: NETWORK_ERROR_MESSAGE,
      headers: { "Content-Type": "application/json" },
    }
  );
  Object.defineProperty(response, "message", {
    value: NETWORK_ERROR_MESSAGE,
    configurable: true,
  });
  return response;
}

/**
 * auth-js `console.error`s the raw TypeError when `fetch` throws.
 * Return a 503 instead so token refresh fails as a retryable auth error.
 *
 * Do not convert React/Next cancellation into a fake PostgREST body — that
 * surfaces as `getX error: {}` in the App Router overlay.
 */
export function createSupabaseFetch(timeoutMs: number) {
  return async function supabaseFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal =
      init?.signal && typeof AbortSignal.any === "function"
        ? AbortSignal.any([init.signal, timeout])
        : timeout;

    try {
      return await withRetryableMessage(await fetch(input, { ...init, signal }));
    } catch (error) {
      if (isCallerAbort(error, timeout)) {
        throw error;
      }
      return networkFailureResponse(
        timeout.aborted
          ? `Request exceeded ${timeoutMs}ms`
          : error instanceof Error
            ? error.message
            : "fetch failed"
      );
    }
  };
}

/** Data-plane fetch. Middleware keeps the shorter cap below. */
export const supabaseFetch = createSupabaseFetch(DATA_FETCH_TIMEOUT_MS);

/** Auth/session fetches in middleware and the proxy. */
export const supabaseMiddlewareFetch = createSupabaseFetch(
  MIDDLEWARE_FETCH_TIMEOUT_MS
);
