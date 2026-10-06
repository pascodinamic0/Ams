const BLANK_MESSAGE = /^(?:\{\}|\[object Object\]|undefined|null)$/i;

const UNREACHABLE_MESSAGE =
  /^(?:network error|failed to fetch|fetch failed|load failed|networkerror when attempting to fetch resource\.?)$/i;

function readMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

function readStatus(error: unknown): number {
  if (!error || typeof error !== "object" || !("status" in error)) return NaN;
  return Number((error as { status: unknown }).status);
}

/** True when the client never got a useful server error (timeout, offline, 503). */
export function isUnreachableClientError(error: unknown): boolean {
  const status = readStatus(error);
  if (status === 0 || status === 502 || status === 503 || status === 504) return true;
  const message = readMessage(error).trim();
  return !message || BLANK_MESSAGE.test(message) || UNREACHABLE_MESSAGE.test(message);
}

/** Swap `{}` and transport failures for a sentence the user can act on. */
export function readableErrorMessage(error: unknown, fallback: string): string {
  if (isUnreachableClientError(error)) return fallback;
  const message = readMessage(error).trim();
  return message || fallback;
}
