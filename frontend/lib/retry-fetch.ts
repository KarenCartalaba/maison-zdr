/**
 * Client-side retry helpers for public detail/list fetches.
 *
 * Context: the shared axios instance (services/axios.ts:103-189) queues
 * concurrent 401s behind one refresh and replays the original request. When
 * that refresh blips (network error, no HTTP response), the caller's promise
 * rejects once even though a later attempt succeeds. A view that renders its
 * error state on that first rejection would flash "Not Found" before the
 * retry could bring the real record in.
 */

/**
 * Transient = worth exactly one automatic retry:
 * - no HTTP response at all (network blip / timeout / refresh-queue hiccup);
 * - 5xx or 429 (server-side hiccup).
 * Every other status is a real answer (404 above all) — retrying it would
 * only delay the honest "not found" render.
 */
export function isTransientFetchError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } } | null)
    ?.response?.status;
  if (!status) return true; // network-level failure
  return status >= 500 || status === 429;
}

/**
 * Run `fetcher` once; on a transient failure wait `delayMs` and run it once
 * more. The second outcome (success or failure) is final, so callers settle
 * exactly once: `loading` can stay true through the retry and only flips false
 * when the request has genuinely settled.
 */
export async function fetchWithOneRetry<T>(
  fetcher: () => Promise<T>,
  delayMs = 500
): Promise<T> {
  try {
    return await fetcher();
  } catch (error) {
    if (!isTransientFetchError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return await fetcher();
  }
}
