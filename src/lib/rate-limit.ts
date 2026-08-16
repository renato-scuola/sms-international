/**
 * Rate limiter in memoria, senza dipendenze e senza database.
 *
 * Nota: su piattaforme serverless lo stato vive nella singola istanza e si azzera
 * ai cold start, quindi il limite è "best effort". Serve a fermare i doppi click
 * e gli script banali, non è una difesa anti-abuso completa. La difesa vera resta
 * la quota lato gateway.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5_000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Secondi da attendere prima del prossimo tentativo utile. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Pulizia opportunistica: evita che la mappa cresca senza limiti.
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
      if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfter: 0,
  };
}

/** Ricava l'IP del chiamante dagli header inoltrati dal proxy/CDN. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
