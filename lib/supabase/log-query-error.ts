/** Fields we can read off a PostgREST / supabase-js error without relying on enumerable keys. */
export type QueryErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function isTransientQueryError(error: QueryErrorLike): boolean {
  const message = error.message ?? "";
  const code = error.code ?? "";
  const hint = error.hint ?? "";
  return (
    code === "NETWORK_ERROR" ||
    message === "Network error" ||
    message.startsWith("AbortError:") ||
    message.startsWith("TimeoutError:") ||
    hint.includes("Request was aborted")
  );
}

/**
 * Timeout / offline is converted to a 503 by supabaseFetch. Returning [] is
 * enough; console.error of the Error object becomes a persistent Next.js
 * overlay (`getX error: {}`).
 */
export function logQueryError(label: string, error: QueryErrorLike): void {
  if (isTransientQueryError(error)) return;
  console.error(label, error.message, error.code, error.details, error.hint);
}
