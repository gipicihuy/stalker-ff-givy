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

async function searchOnce(api: FreeFireAPI, keyword: string) {
  try {
    return { ok: true as const, results: await api.searchAccount(keyword) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    // DEBUG: full stack biar ketauan persis baris mana yg throw "length out of range".
    // getErrorMessage() di vendor/ffapis buang stack asli, jadi ini stack dari titik
    // catch di ffapis's searchAccount (masih lebih baik daripada cuma message).
    console.error('[api/search] searchAccount failed:', message, '\nSTACK:', stack);
    return { ok: false as const, message };
  }
}

async function searchWithRetry(keyword: string, attempts = 3) {
  // Pakai 1 instance/session buat semua percobaan. Sebelumnya tiap percobaan
  // bikin FreeFireAPI() baru -> login guest baru ke server Garena tiap kali,
  // yang boros dan gampang kena limit/gagal auth di sisi Garena.
  const api = new FreeFireAPI();
  const merged = new Map();
  let lastErrorMessage: string | null = null;
  let anySucceeded = false;

  for (let i = 0; i < attempts; i++) {
    const attempt = await searchOnce(api, keyword);
    if (!attempt.ok) {
      lastErrorMessage = attempt.message;
      continue;
    }
    anySucceeded = true;
    for (const p of attempt.results) merged.set(p.accountid, p);
  }

  return {
    results: Array.from(merged.values()),
    // Cuma dianggap "gagal total" kalau semua percobaan error, bukan cuma
    // hasilnya kosong (kosong = memang gak ketemu akunnya).
    failed: !anySucceeded && lastErrorMessage !== null,
    errorMessage: lastErrorMessage,
  };
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

  if (!keyword || keyword.length < 3) {
    return res.status(400).json({ error: 'Nickname minimal 3 karakter.' });
  }

  try {
    const { results, failed, errorMessage } = await searchWithRetry(keyword);

    if (failed) {
      return res.status(502).json({
        error: 'Server pencarian lagi bermasalah, coba lagi sebentar.',
        reason: errorMessage,
      });
    }

    const mapped = results.map((p: any) => ({
      accountid: String(p.accountid),
      nickname: p.nickname,
      level: p.level,
      region: p.region,
    }));
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ status: 'ok', results: mapped });
  } catch (error) {
    console.error('[api/search] unexpected failure:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'Server pencarian lagi bermasalah, coba lagi sebentar.' });
  }
}
