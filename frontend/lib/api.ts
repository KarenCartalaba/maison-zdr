import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Server-side fetch helper for Next.js App Router.
 * Forwards cookies to the backend for authenticated requests.
 * Uses Next.js fetch caching with configurable revalidation.
 */
export async function serverFetch<T = any>(
  path: string,
  options?: {
    method?: string;
    body?: any;
    revalidate?: number | false;
    tags?: string[];
  }
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method: options?.method || "GET",
    headers,
    cache: "no-store",
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Use Next.js ISR revalidation (only works with cache: "force-cache" or default)
  if (options?.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate };
    delete fetchOptions.cache; // Remove no-store when using revalidate
  }

  if (options?.tags) {
    if (!fetchOptions.next) fetchOptions.next = {};
    fetchOptions.next.tags = options.tags;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, fetchOptions);

    if (!response.ok) {
      // Return the error response body as-is so callers can handle it
      const errorData = await response.json().catch(() => null);
      return {
        code: response.status,
        status: "error",
        message: errorData?.message || `HTTP ${response.status}`,
        data: null,
      } as unknown as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Server fetch failed for ${path}:`, error);
    return {
      code: 500,
      status: "error",
      message: "Server fetch failed",
      data: null,
    } as unknown as T;
  }
}

/**
 * Server-side fetch with Redis-friendly caching.
 * Good for public data that changes infrequently (events, gallery).
 */
export async function serverFetchCached<T = any>(
  path: string,
  revalidateSeconds: number = 300
): Promise<T> {
  return serverFetch<T>(path, { revalidate: revalidateSeconds });
}

/**
 * Server-side fetch for authenticated requests.
 * Always bypasses Next.js cache (dynamic).
 */
export async function serverFetchAuth<T = any>(
  path: string,
  options?: { method?: string; body?: any }
): Promise<T> {
  return serverFetch<T>(path, { ...options, revalidate: false });
}
