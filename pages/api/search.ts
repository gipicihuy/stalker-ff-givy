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

async function searchWithRetry(keyword: string, attempts = 5) {
  // Pakai 1 instance/session buat semua percobaan selama sesi itu keliatan
  // "sehat" (ngasih hasil). Sebelumnya tiap percobaan bikin FreeFireAPI() baru
  // -> login guest baru ke server Garena tiap kali, yang boros dan gampang
  // kena limit/gagal auth di sisi Garena.
  //
  // Kenapa attempts > 1 & di-merge: endpoint FuzzySearchAccountByName di
  // server Garena keliatannya cuma balikin subset acak dari kandidat yang
  // cocok tiap kali di-hit (bukan hasil lengkap & deterministik), makanya
  // hasilnya beda-beda tiap request walau query sama persis. Beberapa kali
  // percobaan digabung (dedupe by accountid) biar cakupannya lebih lengkap
  // & konsisten, dengan early-stop kalau udah dapet cukup banyak biar gak
  // buang-buang waktu/quota kalau hasilnya emang udah lengkap dari awal.
  //
  // BUG YANG DIPERBAIKI: akun guest tertentu ternyata bisa "kering" -
  // search-nya sukses (gak error) tapi hasilnya dikit banget terus walau
  // di-retry pake session yang sama persis, kayaknya fuzzy-search-nya
  // scoped/limited per akun yang request. Sebelumnya ini gak ke-cover:
  // 5x retry pake 1 akun yang kering ya tetep aja hasil dikit -> user harus
  // klik search sekali lagi (dapet akun baru yang random) baru hasilnya
  // lengkap. Sekarang: kalau session yang sedang dipakai udah dicoba
  // REFRESH_AFTER_ATTEMPTS kali dan hasil gabungannya masih di bawah
  // MIN_RESULTS_BEFORE_REFRESH, otomatis ganti ke akun guest baru buat sisa
  // percobaan yang ada, tanpa nunggu user klik ulang.
  const REFRESH_AFTER_ATTEMPTS = 2;
  const MIN_RESULTS_BEFORE_REFRESH = 3;
  const EARLY_STOP_AT = 12;

  let api = new FreeFireAPI();
  let attemptsOnCurrentSession = 0;
  const merged = new Map();
  let lastErrorMessage: string | null = null;
  let anySucceeded = false;

  for (let i = 0; i < attempts; i++) {
    const attempt = await searchOnce(api, keyword);
    attemptsOnCurrentSession += 1;

    if (!attempt.ok) {
      lastErrorMessage = attempt.message;
      // Session ini error -> langsung ganti akun guest buat percobaan berikutnya.
      api = new FreeFireAPI();
      attemptsOnCurrentSession = 0;
      continue;
    }

    anySucceeded = true;
    for (const p of attempt.results) merged.set(p.accountid, p);
    if (merged.size >= EARLY_STOP_AT) break;

    const isLastAttempt = i === attempts - 1;
    const sessionLooksKering =
      attemptsOnCurrentSession >= REFRESH_AFTER_ATTEMPTS && merged.size < MIN_RESULTS_BEFORE_REFRESH;
    if (sessionLooksKering && !isLastAttempt) {
      api = new FreeFireAPI();
      attemptsOnCurrentSession = 0;
    }
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
    }));
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ status: 'ok', results: mapped });
  } catch (error) {
    console.error('[api/search] unexpected failure:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'Server pencarian lagi bermasalah, coba lagi sebentar.' });
  }
}
