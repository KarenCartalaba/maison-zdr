# Redis — Upstash

## Provider

**Upstash** (serverless Redis): https://upstash.com

- Pay-per-request pricing
- REST API + TCP (ioredis) support
- HTTPS URLs (`rediss://`)

## Environment Variable

```env
REDIS_URL=rediss://default:xxx@guided-adder-200919.upstash.io:6379
```

## Setup (`src/lib/redis.ts`)

Uses `ioredis` with graceful degradation — if Redis is unavailable, caching is silently disabled.

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
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
```

## Cache Helpers

| Function | Description |
|----------|-------------|
| `cacheGet<T>(key)` | Get cached value (JSON parsed) |
| `cacheSet(key, value, ttl?)` | Set cache with TTL (default 5 min) |
| `cacheInvalidate(key)` | Delete a single key |
| `cacheInvalidatePattern(pattern)` | Delete all keys matching pattern (uses SCAN) |
| `isRedisConnected()` | Check connection status |

## Where Caching Is Used

| Service | Key Pattern | TTL |
|---------|------------|-----|
| GetMe | `user:{id}` | 10 min |
| Events list | `events:all` | 5 min |
| Event detail | `event:{id}` | 5 min |
| News list | `news:all` | 5 min |
| News detail | `news:{id}` | 5 min |
| Admin dashboard | `admin:dashboard:{id}` | 5 min |

## Cache Invalidation

When data is mutated (create/update/delete), the relevant cache keys are invalidated:

```typescript
// After updating an event:
await cacheInvalidate(`event:${eventId}`);
await cacheInvalidatePattern("events:*");

// After updating user profile:
await cacheInvalidate(`user:${userId}`);
```

## Graceful Degradation

If Redis is down or `REDIS_URL` is not set:
- All cache helpers return `null` (reads) or do nothing (writes)
- App continues working without caching
- Console warning: "Redis connection failed — caching disabled"
