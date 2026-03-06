type RateWindow = {
  count: number;
  resetAtMs: number;
};

const memoryBuckets = new Map<string, RateWindow>();
const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
const redisToken = process.env.RATE_LIMIT_REDIS_TOKEN;

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimitMemory(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || current.resetAtMs <= now) {
    memoryBuckets.set(key, {
      count: 1,
      resetAtMs: now + windowMs
    });
    return { ok: true as const, retryAfterSec: 0 };
  }

  if (current.count >= limit) {
    return {
      ok: false as const,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAtMs - now) / 1000))
    };
  }

  current.count += 1;
  memoryBuckets.set(key, current);
  return { ok: true as const, retryAfterSec: 0 };
}

async function checkRateLimitRedis(key: string, limit: number, windowMs: number) {
  if (!redisUrl || !redisToken) return checkRateLimitMemory(key, limit, windowMs);

  try {
    const incrResponse = await fetch(`${redisUrl}/incr/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`
      },
      cache: "no-store"
    });
    if (!incrResponse.ok) return checkRateLimitMemory(key, limit, windowMs);
    const incrData = (await incrResponse.json()) as { result?: number };
    const count = Number(incrData.result ?? 0);

    if (count === 1) {
      await fetch(`${redisUrl}/pexpire/${encodeURIComponent(key)}/${windowMs}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`
        },
        cache: "no-store"
      });
    }

    if (count > limit) {
      const ttlResponse = await fetch(`${redisUrl}/pttl/${encodeURIComponent(key)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${redisToken}`
        },
        cache: "no-store"
      });
      const ttlData = ttlResponse.ok ? (((await ttlResponse.json()) as { result?: number }).result ?? windowMs) : windowMs;
      return { ok: false as const, retryAfterSec: Math.max(1, Math.ceil(Number(ttlData) / 1000)) };
    }

    return { ok: true as const, retryAfterSec: 0 };
  } catch {
    return checkRateLimitMemory(key, limit, windowMs);
  }
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  return checkRateLimitRedis(key, limit, windowMs);
}
