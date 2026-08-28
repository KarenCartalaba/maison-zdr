import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL not set — caching disabled");
}

let redis: Redis | null = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
    lazyConnect: true,
    enableReadyCheck: true,
    connectTimeout: 5000,
    commandTimeout: 3000,
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.connect().catch(() => {
    console.warn("⚠️ Redis connection failed — caching disabled");
    redis = null;
  });
}

// ==================== Cache Helpers ====================

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get a cached value by key.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Set a cache value with optional TTL (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Silently fail — caching is best-effort
  }
}

/**
 * Invalidate (delete) a single cache key.
 */
export async function cacheInvalidate(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

/**
 * Invalidate all cache keys matching a prefix pattern.
 * Uses SCAN to avoid blocking the Redis server.
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Silently fail
  }
}

/**
 * Check if Redis is connected.
 */
export function isRedisConnected(): boolean {
  return redis !== null && redis.status === "ready";
}

export { redis };
