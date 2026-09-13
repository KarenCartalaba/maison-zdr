/**
 * Shared helpers for surfacing backend errors in the UI.
 *
 * The axios interceptor flattens validation failures onto the thrown error
 * (`error.errors` = [{ path, message }], `error.message` = server message),
 * but these helpers also read `error.response.data` directly so they work
 * with any error shape.
 */

export interface ServerFieldError {
  path: string;
  message: string;
}

/**
 * Convert backend `errors: [{ path: "body.email", message }]`
 * into `{ email: "message" }` for inline form display.
 * The `body.` prefix (from Zod request schemas) is stripped.
 */
export function getFieldErrors(err: any): Record<string, string> {
  const out: Record<string, string> = {};
  const list: ServerFieldError[] =
    err?.errors ?? err?.response?.data?.errors ?? [];
  if (!Array.isArray(list)) return out;
  for (const e of list) {
    if (!e || typeof e.message !== "string") continue;
    const field = String(e.path ?? "").replace(/^body\./, "");
    if (field && !(field in out)) out[field] = e.message;
  }
  return out;
}

/**
 * Best-effort human-readable message: server message first,
 * then the error's own message, then the caller fallback.
 */
export function getErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.message || err?.message || fallback;
}
