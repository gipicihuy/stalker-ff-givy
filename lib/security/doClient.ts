import { getGuardEnv } from './env';

// --- Fallback in-memory (CUMA buat `next dev` lokal) -----------------------
// Kalau lagi jalan di luar Cloudflare Workers runtime (belum lewat
// `opennextjs-cloudflare preview`/deploy), binding EDGE_GUARD nggak ada.
// Supaya `npm run dev` tetap bisa dipakai develop UI tanpa harus selalu
// `wrangler dev`, kita fallback ke Map per-isolate - PERSIS seperti
// rate-limiter lama yang sudah ada di ff.ts/search.ts sebelum ini. Fallback
// ini TIDAK dipakai di production (di Workers, binding EDGE_GUARD selalu
// ada selama wrangler.jsonc di-deploy apa adanya).
type RateBucket = { count: number; windowStart: number };
const devRateBuckets = new Map<string, RateBucket>();
const devNonces = new Map<string, number>();
const devBlacklist = new Map<string, { until: number; reason: string }>();

function devRate(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const stored = devRateBuckets.get(ip);
  let bucket: RateBucket;
  if (!stored || now - stored.windowStart > windowMs) {
    bucket = { count: 1, windowStart: now };
  } else {
    bucket = { count: stored.count + 1, windowStart: stored.windowStart };
  }
  devRateBuckets.set(ip, bucket);
  const allowed = bucket.count <= limit;
  return { allowed, remaining: Math.max(0, limit - bucket.count), retryAfterMs: allowed ? 0 : bucket.windowStart + windowMs - now };
}

function devConsumeNonce(ip: string, nonce: string, ttlMs: number) {
  const key = `${ip}:${nonce}`;
  const now = Date.now();
  const existing = devNonces.get(key);
  if (existing && existing > now) return { fresh: false };
  devNonces.set(key, now + ttlMs);
  return { fresh: true };
}

function devBlacklistSet(ip: string, ttlMs: number, reason?: string) {
  const until = Date.now() + ttlMs;
  devBlacklist.set(ip, { until, reason: reason || 'unspecified' });
  return { blacklisted: true, until };
}

function devBlacklistStatus(ip: string) {
  const entry = devBlacklist.get(ip);
  const blacklisted = !!entry && entry.until > Date.now();
  return { blacklisted, until: blacklisted ? entry!.until : 0, reason: blacklisted ? entry!.reason : null };
}

// --- Client asli (production, via Durable Object binding) ------------------

function getStub(ip: string) {
  const env = getGuardEnv();
  if (!env.EDGE_GUARD) return null;
  const id = env.EDGE_GUARD.idFromName(ip);
  return env.EDGE_GUARD.get(id);
}

async function callDO(ip: string, path: string, body: unknown): Promise<any> {
  const stub = getStub(ip);
  if (!stub) return null; // sinyal ke caller: pakai fallback dev
  const res = await stub.fetch(`https://edge-guard.internal${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function checkRateLimit(ip: string, limit: number, windowMs: number) {
  const result = await callDO(ip, '/rate', { limit, windowMs });
  if (result) return result as { allowed: boolean; remaining: number; retryAfterMs: number };
  return devRate(ip, limit, windowMs);
}

export async function consumeNonce(ip: string, nonce: string, ttlMs: number) {
  const result = await callDO(ip, '/consume-nonce', { nonce, ttlMs });
  if (result) return result as { fresh: boolean };
  return devConsumeNonce(ip, nonce, ttlMs);
}

export async function blacklistIp(ip: string, ttlMs: number, reason?: string) {
  const result = await callDO(ip, '/blacklist', { ttlMs, reason });
  if (result) return result as { blacklisted: boolean; until: number };
  return devBlacklistSet(ip, ttlMs, reason);
}

export async function getBlacklistStatus(ip: string) {
  const stub = getStub(ip);
  if (!stub) return devBlacklistStatus(ip);
  const res = await stub.fetch('https://edge-guard.internal/status', { method: 'POST', body: '{}' });
  return res.json() as Promise<{ blacklisted: boolean; until: number; reason: string | null }>;
}
