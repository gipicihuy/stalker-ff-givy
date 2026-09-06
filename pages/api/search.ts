import type { NextApiRequest, NextApiResponse } from 'next';
import { FreeFireAPI } from 'ffapis';

function getIP(req: NextApiRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const fwdIp = Array.isArray(fwd) ? fwd[0] : fwd?.split(',')[0]?.trim();
  return fwdIp || (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || '127.0.0.1';
}

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_STALE_MS = RATE_LIMIT_WINDOW_MS * 6;

type RateBucket = { count: number; windowStart: number };
const rateBuckets = new Map<string, RateBucket>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (Math.random() < 0.01) {
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.windowStart > RATE_LIMIT_STALE_MS) rateBuckets.delete(key);
    }
  }

  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

async function searchOnce(keyword: string) {
  const api = new FreeFireAPI();
  try {
    return await api.searchAccount(keyword);
  } catch {
    return [];
  }
}

async function searchWithRetry(keyword: string, attempts = 5) {
  const merged = new Map();
  for (let i = 0; i < attempts; i++) {
    const results = await searchOnce(keyword);
    for (const p of results) merged.set(p.accountid, p);
  }
  return Array.from(merged.values());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} tidak diizinkan` });
  }

  const ip = getIP(req);
  if (isRateLimited(ip)) {
    res.setHeader('Retry-After', '10');
    return res.status(429).json({ error: 'Terlalu banyak request. Tunggu beberapa detik lalu coba lagi.' });
  }

  const { q } = req.query;
  const keyword = String(q || '').trim();

  if (!keyword || keyword.length < 2) {
    return res.status(400).json({ error: 'Nickname minimal 2 karakter.' });
  }

  try {
    const results = await searchWithRetry(keyword);
    const mapped = results.map((p: any) => ({
      accountid: String(p.accountid),
      nickname: p.nickname,
      level: p.level,
      region: p.region,
    }));
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ status: 'ok', results: mapped });
  } catch {
    return res.status(502).json({ error: 'Server pencarian lagi bermasalah, coba lagi sebentar.' });
  }
}
