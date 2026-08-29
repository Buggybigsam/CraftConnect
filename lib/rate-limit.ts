// Simple in-memory sliding-window rate limiter, keyed by an identifier (typically
// client IP). Good enough for a single-instance Next.js deployment on an academic
// project; not shared across serverless instances, so treat it as a soft guard
// rather than a strict global limit.

type Bucket = {
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()

// Periodically clear out buckets that haven't been touched recently so the map
// doesn't grow unbounded over a long-running process.
const MAX_BUCKET_AGE_MS = 10 * 60 * 1000
let lastSweep = Date.now()

function sweep(now: number) {
  if (now - lastSweep < MAX_BUCKET_AGE_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    const latest = bucket.timestamps[bucket.timestamps.length - 1]
    if (latest === undefined || now - latest > MAX_BUCKET_AGE_MS) {
      buckets.delete(key)
    }
  }
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterMs: number
}

/**
 * Sliding-window rate limit check. Returns ok:false once `limit` requests have
 * been made by `key` within `windowMs`.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key) ?? { timestamps: [] }
  const windowStart = now - windowMs
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart)

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket)
    const retryAfterMs = bucket.timestamps[0] + windowMs - now
    return { ok: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) }
  }

  bucket.timestamps.push(now)
  buckets.set(key, bucket)
  return { ok: true, remaining: limit - bucket.timestamps.length, retryAfterMs: 0 }
}

/** Best-effort client IP extraction for environments behind a proxy/CDN. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp

  return "unknown"
}

export function rateLimitResponse(result: RateLimitResult) {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": Math.ceil(result.retryAfterMs / 1000).toString(),
    },
  })
}
