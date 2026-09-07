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

// Skor relevansi nickname hasil pencarian terhadap keyword yang diketik user.
// Makin kecil = makin cocok/diprioritaskan. Dipakai buat sorting, bukan filter
// (semua hasil dari API tetap ditampilkan, cuma urutannya yang diatur ulang).
function relevanceScore(nickname: string, keyword: string): number {
  const n = (nickname || '').toLowerCase();
  const k = keyword.toLowerCase();
  if (n === k) return 0; // exact match persis
  if (n.startsWith(k)) return 1; // diawali keyword
  if (n.includes(k)) return 2; // mengandung keyword di tengah/akhir
  return 3; // cuma nyangkut dari fuzzy match API, gak match langsung
}

function sortByRelevance<T extends { nickname?: string }>(results: T[], keyword: string): T[] {
  return [...results].sort((a, b) => {
    const scoreA = relevanceScore(a.nickname || '', keyword);
    const scoreB = relevanceScore(b.nickname || '', keyword);
    if (scoreA !== scoreB) return scoreA - scoreB;
    // Tie-breaker: nickname yang panjangnya lebih deket ke keyword dianggap
    // lebih relevan (mis. "givy." lebih related ke "givy." drpd "givy.123").
    const lenDiffA = Math.abs((a.nickname || '').length - keyword.length);
    const lenDiffB = Math.abs((b.nickname || '').length - keyword.length);
    return lenDiffA - lenDiffB;
  });
}

async function searchWithRetry(keyword: string, attempts = 10) {
  // GANTI AKUN GUEST DI SETIAP PERCOBAAN. Sebelumnya sempat dicoba reuse 1
  // session buat semua percobaan (biar hemat login), lalu di-refine jadi
  // "rotate kalau kelihatan kering" — dua-duanya masih bikin user harus
  // klik search 2x buat dapet hasil lengkap, karena beberapa akun guest
  // ternyata konsisten cuma ngasih hasil pas-pasan (misal 3-4 doang) di
  // ambang batas yang kepake buat nentuin "kering", padahal akun lain bisa
  // dapet 10+ match buat keyword yang sama. Endpoint FuzzySearchAccountByName
  // di server Garena kelihatannya membatasi/scoping hasil per akun yang
  // request, bukan cuma random per-hit.
  //
  // Pool akun guest yang ada lumayan besar (~250+ gabungan semua region),
  // jadi sekarang tiap percobaan pakai login guest yang baru & beda-beda,
  // hasilnya di-merge (dedupe by accountid) biar cakupannya maksimal dalam
  // SATU kali klik search.
  //
  // STOP CRITERION: sebelumnya pakai flat cap (EARLY_STOP_AT = 12) yang
  // ternyata bikin akun tertentu (yang legit match, cth. keyword pendek/umum
  // kayak "givy") gak ke-cover kalau kebetulan udah kekumpul 12 akun LAIN
  // duluan dari attempt-attempt awal — padahal beberapa attempt berikutnya
  // yang gak sempet jalan justru bisa nemu akun yang dicari. Sekarang
  // berhenti berdasarkan "diminishing returns": kalau beberapa attempt
  // beruntun udah gak nambahin akun BARU sama sekali, baru dianggap hasil
  // udah stabil/lengkap dan berhenti — bukan asal kepotong di angka tetap.
  const STALE_STREAK_LIMIT = 3; // berhenti kalau 3x berturut-turut gak ada akun baru
  const HARD_CAP = 40; // pengaman biar list gak membengkak gak wajar & tetep kebatasi total attempt

  const merged = new Map();
  let lastErrorMessage: string | null = null;
  let anySucceeded = false;
  let staleStreak = 0;

  for (let i = 0; i < attempts; i++) {
    const api = new FreeFireAPI();
    const attempt = await searchOnce(api, keyword);

    if (!attempt.ok) {
      lastErrorMessage = attempt.message;
      continue;
    }

    anySucceeded = true;
    const sizeBefore = merged.size;
    for (const p of attempt.results) merged.set(p.accountid, p);
    const gainedNew = merged.size > sizeBefore;

    if (merged.size >= HARD_CAP) break;

    staleStreak = gainedNew ? 0 : staleStreak + 1;
    if (staleStreak >= STALE_STREAK_LIMIT) break;
  }

  return {

    results: sortByRelevance(Array.from(merged.values()), keyword),
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
      // Eksperimental: headpic (avatar id) sekarang dicoba di-decode dari
      // response search (lihat decodeWithFallback di vendor/ffapis). Kalau
      // decode-nya jatuh ke skema fallback (gagal), field ini bakal absen/0
      // - makanya di-treat sebagai optional & falsy-safe di frontend.
      headpic: p.headpic || null,
    }));
    // JANGAN di-cache. Endpoint ini sengaja didesain buat ngasih hasil yang
    // paling lengkap/bervariasi tiap kali dipanggil (lihat komentar di
    // searchWithRetry) - kalau di-cache pake s-maxage, CDN/edge (situs ini
    // jalan di Cloudflare via opennextjs-cloudflare) bakal ngunci hasil dari
    // request pertama buat keyword yang sama selama masa cache-nya, bikin
    // semua perbaikan di retry logic jadi sia-sia karena origin gak
    // ke-hit ulang.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ status: 'ok', results: mapped });
  } catch (error) {
    console.error('[api/search] unexpected failure:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'Server pencarian lagi bermasalah, coba lagi sebentar.' });
  }
}
