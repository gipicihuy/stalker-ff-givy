import type { NextApiRequest, NextApiResponse } from 'next';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { FreeFireAPI } from 'ffapis';
import { guardRequest, sendGuardRejection } from '../../lib/security/guard';
import { GUARD_PATHS } from '../../lib/security/constants';
import { getRequestOrigin } from '../../lib/security/request';
import { acquireProbe, getHealth, markDown, markUp, retryAfterSec, type SearchHealth } from '../../lib/searchHealth';

// Sama persis pola waitUntil di pages/api/ff.ts: kirim notif Telegram di
// background tanpa nge-block response ke user, lewat ctx.waitUntil kalau
// jalan di Cloudflare Workers, fallback ke fire-and-forget biasa kalau
// nggak kedetect (mis. lokal via `next dev`).
function waitUntil(promise: Promise<unknown>) {
  try {
    getCloudflareContext().ctx.waitUntil(promise);
  } catch {
    promise.catch(() => {});
  }
}

function getBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/OPR\/|Opera/i.test(ua)) return 'Opera';
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Browser';
  if (/UCBrowser/i.test(ua)) return 'UC Browser';
  if (/YaBrowser/i.test(ua)) return 'Yandex Browser';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua)) return 'Safari';
  if (/MSIE|Trident/i.test(ua)) return 'Internet Explorer';
  return 'Unknown Browser';
}

function getDevice(ua: string): string {
  if (/iPad/i.test(ua)) return 'iPad (iOS)';
  if (/iPhone/i.test(ua)) return 'iPhone (iOS)';
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return 'Android Phone';
  if (/Android/i.test(ua)) return 'Android Tablet';
  if (/Windows NT/i.test(ua)) return 'Windows PC';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown Device';
}

function escMdPlain(value: any): string {
  const s = value === null || value === undefined || value === '' ? '-' : String(value);
  return s.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function escMdCode(value: any): string {
  const s = value === null || value === undefined || value === '' ? '-' : String(value);
  return s.replace(/[`\\]/g, '\\$&');
}

// Satu pesan Telegram per pencarian nickname - dikirim di background (lewat
// waitUntil), gak nge-block response ke user. Nunjukin keyword yang dicari,
// berapa hasil yang ketemu, sama info visitor (IP/device/browser) biar
// setara sama notif "FF Stalker Hit" pas orang stalk by UID.
async function sendNicknameSearchNotif(
  req: NextApiRequest,
  keyword: string,
  resultCount: number,
  origin: string
) {
  const botToken = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!botToken || !chatId) return;

  const ip = getIP(req);
  const ua = String(req.headers['user-agent'] || '');
  const browser = getBrowser(ua);
  const device = getDevice(ua);
  const ts = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const apiUrl = `${origin}/api/search?q=${encodeURIComponent(keyword)}`;

  const text = [
    `>🔎 *FF Nickname Search Hit*`,
    ``,
    `📛 *Keyword* › ${escMdPlain(keyword)}`,
    `📊 *Hasil*   › ${escMdPlain(resultCount)} akun`,
    ``,
    `*🌐 Visitor Info*`,
    `🔌 *IP*      › \`${escMdCode(ip)}\``,
    `🖥 *Device*  › ${escMdPlain(device)}`,
    `🌏 *Browser* › ${escMdPlain(browser)}`,
    ``,
    `*🔗 Endpoint*`,
    `⚙️ *API Kita* › \`${escMdCode(apiUrl)}\``,
    ``,
    `>🕐 ${escMdPlain(ts)}`,
  ].join('\n');

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' }),
  });
  if (!res.ok) {
    console.error('telegram_sendMessage_failed', res.status, await res.text());
  }
}

function getIP(req: NextApiRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const fwdIp = Array.isArray(fwd) ? fwd[0] : fwd?.split(',')[0]?.trim();
  return fwdIp || (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || '127.0.0.1';
}

// Rate limit endpoint ini sekarang ditegakkan di lib/security/guard.ts lewat
// Durable Object EdgeGuardDO (konsisten di seluruh edge), bukan Map
// in-memory per-isolate kayak sebelumnya.
const SEARCH_RATE_LIMIT = 8;
const SEARCH_RATE_WINDOW_MS = 10_000;

// Dedup notif Telegram, sama polanya kayak di pages/api/ff.ts: kalau IP
// yang sama baru aja notif buat keyword yang sama dalam beberapa detik
// terakhir (double-click, dsb), skip notif keduanya. Response ke user
// tetap jalan normal.
const NOTIF_DEDUP_WINDOW_MS = 20_000;
const NOTIF_DEDUP_STALE_MS = NOTIF_DEDUP_WINDOW_MS * 6;
const recentNotifs = new Map<string, number>();

function shouldSkipNotif(ip: string, keyword: string): boolean {
  const now = Date.now();

  if (Math.random() < 0.01) {
    for (const [key, ts] of recentNotifs) {
      if (now - ts > NOTIF_DEDUP_STALE_MS) recentNotifs.delete(key);
    }
  }

  const key = `${ip}:${keyword.toLowerCase()}`;
  const lastSentAt = recentNotifs.get(key);
  if (lastSentAt && now - lastSentAt < NOTIF_DEDUP_WINDOW_MS) return true;

  recentNotifs.set(key, now);
  return false;
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
  // FAIL FAST: kalau server Garena lagi nolak semua login (mis. versi OB game
  // baru naik tapi ffapis masih kirim versi lama -> MajorLogin 503 terus),
  // lanjut sampai `attempts` cuma nembak login berkali-kali ke Garena tanpa
  // hasil. Berhenti setelah N kegagalan BERUNTUN. Angkanya sengaja 4 (bukan
  // 2-3): kalau cuma sebagian akun guest di pool yang mati, 4x gagal beruntun
  // jarang kejadian jadi search normal nggak ikut kena, tapi kalau semuanya
  // mati kita berhenti di percobaan ke-4, bukan ke-10.
  const FAIL_STREAK_LIMIT = 4;

  const merged = new Map();
  let lastErrorMessage: string | null = null;
  let anySucceeded = false;
  let staleStreak = 0;
  let failStreak = 0;

  for (let i = 0; i < attempts; i++) {
    const api = new FreeFireAPI();
    const attempt = await searchOnce(api, keyword);

    if (!attempt.ok) {
      lastErrorMessage = attempt.message;
      failStreak += 1;
      if (failStreak >= FAIL_STREAK_LIMIT) {
        console.error(`[api/search] berhenti setelah ${failStreak} kegagalan beruntun (percobaan ke-${i + 1}/${attempts}):`, attempt.message);
        break;
      }
      continue;
    }

    failStreak = 0;
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

const MAINTENANCE_MESSAGE =
  'Pencarian nickname sedang dalam pemeliharaan, untuk sementara gunakan By UID terlebih dahulu, fitur akan aktif kembali secara otomatis setelah pemeliharaan selesai';
const PROBE_KEYWORD = 'givy';
const PROBE_TIMEOUT_MS = 8_000;

function sendMaintenance(res: NextApiResponse, health: SearchHealth, reason?: string | null) {
  const retryAfter = retryAfterSec(health);
  res.setHeader('Retry-After', String(retryAfter));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({
    error: MAINTENANCE_MESSAGE,
    maintenance: true,
    retryAfter,
    ...(reason ? { reason } : {}),
  });
}

// Tes ringan ke Garena (1 login + 1 search) buat mastiin pencarian udah
// normal lagi. Dibatasi timeout biar request status nggak ikut ngegantung
// kalau Garena lagi lambat, bukan cuma nolak.
async function probeSearch(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<{ ok: false }>((resolve) => {
    timer = setTimeout(() => resolve({ ok: false }), PROBE_TIMEOUT_MS);
  });
  try {
    const r = await Promise.race([searchOnce(new FreeFireAPI(), PROBE_KEYWORD), timeout]);
    return r.ok;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// GET /api/search?status=1 -> { maintenance, retryAfter }. Dipakai frontend
// buat nampilin label "Maintenance" di tab By Nickname dan nge-disable input.
// Kalau statusnya lagi down dan masa tunggunya udah habis, request ini juga
// yang ngetes Garena (satu request saja yang dapat giliran) supaya pencarian
// otomatis nyala lagi begitu Garena pulih, tanpa nunggu ada user yang gagal.
async function handleStatusCheck(res: NextApiResponse) {
  let health = await getHealth();
  if (health.down && (await acquireProbe())) {
    health = (await probeSearch()) ? await markUp() : await markDown();
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ maintenance: health.down, retryAfter: retryAfterSec(health) });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} tidak diizinkan` });
  }

  const isStatusCheck = req.query.status === '1';

  const ip = getIP(req);
  const guard = await guardRequest(req, ip, getRequestOrigin(req), {
    path: GUARD_PATHS.search,
    rateLimit: SEARCH_RATE_LIMIT,
    rateWindowMs: SEARCH_RATE_WINDOW_MS,
    // Cek status cuma ngembaliin up/down (bukan data player), jadi nggak
    // perlu handshake token+PoW tiap kali; blacklist, origin, dan rate limit
    // tetap berlaku.
    requireHandshake: !isStatusCheck,
  });
  if (!guard.ok) return sendGuardRejection(res, guard);

  if (isStatusCheck) return handleStatusCheck(res);

  const { q } = req.query;
  const keyword = String(q || '').trim();

  if (!keyword || keyword.length < 3) {
    return res.status(400).json({ error: 'Nickname minimal 3 karakter.' });
  }

  // Circuit breaker: kalau pencarian lagi diputus (Garena nolak semua login),
  // jangan tembak Garena lagi, langsung jawab maintenance. Begitu masa
  // tunggunya habis, SATU request boleh jadi "probe": pencarian nyata
  // request itu sendiri yang dipakai buat ngecek apakah Garena sudah pulih.
  const health = await getHealth();
  let probing = false;
  if (health.down) {
    probing = Date.now() >= health.until && (await acquireProbe());
    if (!probing) return sendMaintenance(res, health);
  }

  try {
    const { results, failed, errorMessage } = await searchWithRetry(keyword);

    if (failed) {
      return sendMaintenance(res, await markDown(), errorMessage);
    }
    if (probing) await markUp();

    const mapped = results.map((p: any) => ({
      accountid: String(p.accountid),
      nickname: p.nickname,
      level: p.level,
      region: p.region,
    }));
    // JANGAN di-cache. Endpoint ini sengaja didesain buat ngasih hasil yang
    // paling lengkap/bervariasi tiap kali dipanggil (lihat komentar di
    // searchWithRetry) - kalau di-cache pake s-maxage, CDN/edge (situs ini
    // jalan di Cloudflare via opennextjs-cloudflare) bakal ngunci hasil dari
    // request pertama buat keyword yang sama selama masa cache-nya, bikin
    // semua perbaikan di retry logic jadi sia-sia karena origin gak
    // ke-hit ulang.
    res.setHeader('Cache-Control', 'no-store');

    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
    const origin = `${proto}://${host}`;
    if (!shouldSkipNotif(ip, keyword)) {
      waitUntil(
        sendNicknameSearchNotif(req, keyword, mapped.length, origin).catch((err) => {
          console.error('telegram_notif_error', err);
        })
      );
    }

    return res.status(200).json({ status: 'ok', results: mapped });
  } catch (error) {
    console.error('[api/search] unexpected failure:', error instanceof Error ? error.message : error);
    if (probing) await markDown().catch(() => {});
    return res.status(502).json({ error: 'Server pencarian lagi bermasalah, coba lagi sebentar.' });
  }
}
