import { CredentialManager, encrypt, protoHandler, resolveObVersion } from 'ffapis';

// ---------------------------------------------------------------------------
// Protobuf varint (encoder + decoder) tangan.
//
// Kenapa manual: `ffapis` memang punya encoder/decoder lewat `protoHandler`,
// tapi dia cuma mau encode/decode pakai .proto descriptor yang di-embed di
// dalam library-nya. Sebagian endpoint yang kita butuh di sini (wishlist,
// badge history, spark, lone wolf, role) NGGAK ADA descriptor-nya sama
// sekali di ffapis, dan sebagian field lain (avatar, title, pin, rank, CS
// rank) ada di descriptor `AccountInfoBasic` tapi ke-TRIM jadi cuma sebagian
// kecil. Karena protokolnya cuma protobuf varint biasa, encode/decode-nya
// ditulis sendiri di sini - dan angka field-nya sudah diverifikasi mentah
// balikan server Garena live (bukan tebakan).
// ---------------------------------------------------------------------------

// Varint-nya dihitung pakai aritmatika Number biasa, bukan BigInt, karena
// tsconfig app ini targetnya ES2017. Aman karena semua nilai yang lewat di
// sini (tag field, uid, timestamp unix, item id, damage) jauh di bawah 2^53,
// jadi nggak ada risiko overflow floating point.
function encVarint(value: number): Buffer {
  let rest = Math.floor(value);
  const out: number[] = [];
  while (rest >= 0x80) {
    out.push((rest % 0x80) | 0x80);
    rest = Math.floor(rest / 0x80);
  }
  out.push(rest);
  return Buffer.from(out);
}

function encIntField(field: number, value: number): Buffer {
  return Buffer.concat([encVarint(field * 8), encVarint(value)]);
}

function encStrField(field: number, value: string): Buffer {
  const bytes = Buffer.from(value, 'utf8');
  return Buffer.concat([encVarint(field * 8 + 2), encVarint(bytes.length), bytes]);
}

type ProtoField = { num: number; wire: number; int: number; bytes: Buffer | null };

function readVarint(buf: Buffer, index: number): { value: number; next: number } | null {
  let value = 0;
  let multiplier = 1;
  let i = index;
  while (i < buf.length) {
    const byte = buf[i];
    i += 1;
    value += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) return { value, next: i };
    multiplier *= 0x80;
  }
  return null;
}

function readFields(buf: Buffer): ProtoField[] {
  const fields: ProtoField[] = [];
  let i = 0;
  while (i < buf.length) {
    const tag = readVarint(buf, i);
    if (!tag) break;
    i = tag.next;
    const num = Math.floor(tag.value / 8);
    const wire = tag.value % 8;

    if (wire === 0) {
      const v = readVarint(buf, i);
      if (!v) break;
      i = v.next;
      fields.push({ num, wire, int: v.value, bytes: null });
    } else if (wire === 2) {
      const len = readVarint(buf, i);
      if (!len) break;
      i = len.next;
      const size = len.value;
      if (size < 0 || i + size > buf.length) break;
      fields.push({ num, wire, int: 0, bytes: buf.subarray(i, i + size) });
      i += size;
    } else if (wire === 5) {
      i += 4;
    } else if (wire === 1) {
      i += 8;
    } else {
      break;
    }
  }
  return fields;
}

const numOf = (fields: ProtoField[], num: number): number | null => {
  const found = fields.find((f) => f.num === num && f.wire === 0);
  return found ? found.int : null;
};

const textOf = (fields: ProtoField[], num: number): string | null => {
  const found = fields.find((f) => f.num === num && f.wire === 2);
  return found?.bytes ? found.bytes.toString('utf8') : null;
};

const subsOf = (fields: ProtoField[], num: number): ProtoField[][] =>
  fields.filter((f) => f.num === num && f.wire === 2 && f.bytes).map((f) => readFields(f.bytes as Buffer));

// ---------------------------------------------------------------------------
// Transport ke server game Garena.
//
// Body-nya di-encrypt pake `encrypt()` dari ffapis (AES-128-CBC + PKCS7) biar
// satu-satunya tempat key/IV-nya di-hardcode cuma di settings.json milik
// ffapis, bukan di-fork dua kali di sini.
//
// Header-nya sengaja DITULIS EKSPLISIT, bukan pakai `getCommonHeaders()` dari
// ffapis. `getCommonHeaders()` ikut nempelin `Expect: 100-continue` dan
// `Connection: Keep-Alive`, dan dua header itu bikin fetch di runtime
// Node/Workers gagal di level koneksi ("fetch failed") sebelum sempat
// minta balasan dari server. `ReleaseVersion` tetap diambil dari
// `resolveObVersion()` biar ikut FF_OB_VERSION env, sama seperti ffapis.
// ---------------------------------------------------------------------------

const GARENA_UA = 'Dalvik/2.1.0 (Linux; U; Android 13; CPH2095 Build/RKQ1.211119.001)';

const RPC_TIMEOUT_MS = 3500;

export type GarenaSession = { token: string | null; serverUrl: string | null };

async function garenaRpc(session: GarenaSession, path: string, payload: Buffer): Promise<Buffer> {
  const { token, serverUrl } = session;
  if (!token || !serverUrl) throw new Error('garena_session_kosong');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(`${serverUrl}${path}`, {
      method: 'POST',
      headers: {
        'User-Agent': GARENA_UA,
        'Content-Type': 'application/octet-stream',
        'X-Unity-Version': '2018.4.11f1',
        'X-GA': 'v1 1',
        ReleaseVersion: resolveObVersion(),
        'X-GA-SV': String(Math.floor(Date.now() / 1000)),
        Authorization: `Bearer ${token}`,
      },
      // Buffer mentah nggak diterima sebagai BodyInit di runtime fetch
      // (baik di Node maupun Workers), jadi dikonversi dulu ke Uint8Array -
      // sama persis kayak yang dilakuin ffapis di toBodyInit().
      body: new Uint8Array(await encrypt(payload)),
      signal: controller.signal,
    });
    const buf = Buffer.from(await res.arrayBuffer());
    if (!res.ok) throw new Error(`garena_${path.replace(/^\//, '')}_http_${res.status}`);
    return buf;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Tipe data hasil parse.
// ---------------------------------------------------------------------------

export type WishlistItem = { itemId: number | null; addedAt: number | null };

export type BadgeHistoryItem = {
  badgeId: number | null;
  level: number | null;
  iconKey: string | null;
  nameKey: string | null;
};

// `SparkInfo` (PlayerPersonalShow field 15 = spark milik akun, field 16 = spark
// collab). `state` diambil dari enum SparkState resmi:
// 0 NONE, 1 ACTIVE, 2 DORMANT, 3 EXTINGUISHED.
export type SparkInfo = {
  state: number | null;
  level: number | null;
  exp: number | null;
  loginStreakDays: number | null;
  temper: number | null;
  appearanceStage: number | null;
};

export type RoleStat = {
  seasonId: number | null;
  gamemode: number | null;
  matchmode: number | null;
  roleId: number | null;
  scores: number | null;
  proficients: number | null;
  proficientLv: number | null;
  isSelected: boolean | null;
};

export type AccountExtra = {
  avatarId: number | null;
  bannerId: number | null;
  titleId: number | null;
  pinId: number | null;
  brRank: number | null;
  brRankPoints: number | null;
  brMaxRank: number | null;
  csRank: number | null;
  csRankPoints: number | null;
  csMaxRank: number | null;
  badgeCnt: number | null;
  badgeId: number | null;
  seasonId: number | null;
  loneWolfRank: number | null;
  loneWolfPoints: number | null;
  primeLevel: number | null;
  releaseVersion: string | null;
};

export type DetailedStats = Record<string, number | null>;

export type BrModeStats = {
  mode: 'solo' | 'duo' | 'squad';
  gamesPlayed: number | null;
  wins: number | null;
  kills: number | null;
  detailed: DetailedStats;
};

export type CsStats = {
  gamesPlayed: number | null;
  wins: number | null;
  kills: number | null;
  detailed: DetailedStats;
};

export type GarenaExtra = {
  accountExtra: AccountExtra | null;
  spark: SparkInfo | null;
  diamondTopup: number | null;
  roleStats: RoleStat[];
  badgeHistory: BadgeHistoryItem[];
  wishlist: WishlistItem[];
  brModes: BrModeStats[];
  csStats: CsStats | null;
};

// ---------------------------------------------------------------------------
// Parser.
//
// Nama field `detailed` di bawah diambil apa adanya dari descriptor
// `PlayerStats.json` / `PlayerCSStats.json` milik ffapis - jadi bukan istilah
// yang dikarang. Field `AccountInfoBasic` yang ke-trim di descriptor ffapis
// diambil dari proto `PlayerPersonalShow.proto` (repo 0xMe/FreeFire-Api), yang
// urutannya sudah dicek ke data live: field 66/67 di sana bernama
// `hipporank`/`hipporankingpoints` (codename internal, isinya ranked mode
// bertaruh emas 1v1 yang di klien disebut Lone Wolf), field 61 berisi data
// OccupationSeasonInfo (per-occupasi tiap musim), dan field 15 berisi SparkInfo.
// ---------------------------------------------------------------------------

const BR_DETAIL_FIELDS: Record<number, string> = {
  1: 'deaths',
  2: 'top10Times',
  3: 'topNTimes',
  4: 'distanceTravelled',
  5: 'survivalTime',
  6: 'revives',
  7: 'highestKills',
  8: 'damage',
  9: 'roadkills',
  10: 'headshots',
  11: 'headshotKills',
  12: 'knockdown',
  13: 'pickups',
};

const CS_DETAIL_FIELDS: Record<number, string> = {
  1: 'mvpCount',
  2: 'doubleKills',
  3: 'tripleKills',
  4: 'fourKills',
  5: 'damage',
  6: 'headshotKills',
  7: 'knockdowns',
  8: 'revivals',
  9: 'assists',
  10: 'deaths',
  11: 'streakWins',
  12: 'throwingKills',
  13: 'oneGameMostDamage',
  14: 'oneGameMostKills',
  15: 'ratingPoints',
  16: 'ratingEnabledGames',
  17: 'headshotCount',
  18: 'hitCount',
};

// Urutan field 1/2/3 di response GetPlayerStats = solostats/duostats/quadstats
// sesuai descriptor `PlayerStats.json`, jadi mapping ini bukan tebakan.
const BR_MODE_BY_FIELD: Record<number, BrModeStats['mode']> = { 1: 'solo', 2: 'duo', 3: 'squad' };

function parseDetailed(fields: ProtoField[], mapping: Record<number, string>): DetailedStats {
  const out: DetailedStats = {};
  for (const f of fields) {
    const key = mapping[f.num];
    if (key && f.wire === 0) out[key] = f.int;
  }
  return out;
}

function parseAccountExtra(basic: ProtoField[]): AccountExtra {
  return {
    avatarId: numOf(basic, 12),
    bannerId: numOf(basic, 11),
    titleId: numOf(basic, 48),
    pinId: numOf(basic, 33),
    brRank: numOf(basic, 14),
    brRankPoints: numOf(basic, 15),
    brMaxRank: numOf(basic, 35),
    csRank: numOf(basic, 30),
    csRankPoints: numOf(basic, 31),
    csMaxRank: numOf(basic, 36),
    badgeCnt: numOf(basic, 18),
    badgeId: numOf(basic, 19),
    seasonId: numOf(basic, 20),
    loneWolfRank: numOf(basic, 66),
    loneWolfPoints: numOf(basic, 67),
    // Proto external nulis field ini di nomor 74, tapi di response beneran
    // dapetnya di 76 (urutan field atas kadang geser antar build). Isinya
    // kebukti: {1: accountid, 2: primelevel, 3: privilegeidlist} - sama
    // persis bentuk PrimePrivilegeDetail, jadi nggak mungkin nomor lain.
    primeLevel: numOf(subsOf(basic, 76)[0] || [], 2),
    releaseVersion: textOf(basic, 50),
  };
}

function parseRoles(basic: ProtoField[]): RoleStat[] {
  return subsOf(basic, 61).map((entry) => {
    const detail = subsOf(entry, 3)[0];
    const selected = detail ? numOf(detail, 5) : null;
    return {
      seasonId: numOf(entry, 1),
      gamemode: numOf(entry, 2),
      matchmode: numOf(entry, 4),
      roleId: detail ? numOf(detail, 1) : null,
      scores: detail ? numOf(detail, 2) : null,
      proficients: detail ? numOf(detail, 3) : null,
      proficientLv: detail ? numOf(detail, 4) : null,
      isSelected: selected == null ? null : selected !== 0,
    };
  });
}

function parseSpark(fields: ProtoField[]): SparkInfo | null {
  const spark = subsOf(fields, 15)[0];
  if (!spark || spark.length === 0) return null;
  return {
    state: numOf(spark, 1),
    level: numOf(spark, 2),
    exp: numOf(spark, 3),
    loginStreakDays: numOf(spark, 4),
    temper: numOf(spark, 5),
    appearanceStage: numOf(spark, 9),
  };
}

function parseDiamondTopup(fields: ProtoField[]): number | null {
  const box = subsOf(fields, 10)[0];
  return box ? numOf(box, 1) : null;
}

function parseBadgeHistory(buf: Buffer): BadgeHistoryItem[] {
  return readFields(buf)
    .filter((f) => f.num === 5 && f.bytes)
    .map((f) => {
      const entry = readFields(f.bytes as Buffer);
      return {
        badgeId: numOf(entry, 3),
        level: numOf(entry, 1),
        iconKey: textOf(entry, 5),
        nameKey: textOf(entry, 7),
      };
    });
}

function parseWishlist(buf: Buffer): WishlistItem[] {
  return readFields(buf)
    .filter((f) => f.num === 1 && f.bytes)
    .map((f) => {
      const entry = readFields(f.bytes as Buffer);
      return { itemId: numOf(entry, 1), addedAt: numOf(entry, 2) };
    });
}

function parseBrModes(buf: Buffer): BrModeStats[] {
  const out: BrModeStats[] = [];
  for (const f of readFields(buf)) {
    const mode = BR_MODE_BY_FIELD[f.num];
    if (!mode || !f.bytes) continue;
    const entry = readFields(f.bytes);
    const detailed = subsOf(entry, 5)[0];
    out.push({
      mode,
      gamesPlayed: numOf(entry, 2),
      wins: numOf(entry, 3),
      kills: numOf(entry, 4),
      detailed: detailed ? parseDetailed(detailed, BR_DETAIL_FIELDS) : {},
    });
  }
  return out;
}

function parseCsStats(buf: Buffer): CsStats | null {
  const first = readFields(buf).find((f) => f.num === 1 && f.bytes);
  if (!first) return null;
  const entry = readFields(first.bytes as Buffer);
  const detailed = subsOf(entry, 5)[0];
  return {
    gamesPlayed: numOf(entry, 2),
    wins: numOf(entry, 3),
    kills: numOf(entry, 4),
    detailed: detailed ? parseDetailed(detailed, CS_DETAIL_FIELDS) : {},
  };
}

// ---------------------------------------------------------------------------
// Sesi Garena sendiri: grant token + MajorLogin.
//
// Kenapa ditulis sendiri, bukan lewat `api.login()` milik ffapis? Tiga
// alasan, semuanya diuji langsung ke endpoint-nya:
//   1. `_getGarenaToken()` ngirim password apa adanya, padahal endpoint grant
//      cuma menerima SHA-256-nya dalam HURUF BESAR (dites: hash uppercase ->
//      200 + access_token, angka mentah -> {"error":"auth_error"}, hash
//      lowercase -> auth_error juga).
//   2. Header MajorLogin ffapis nggak pernah menyertakan `X-GA-SV` (unix
//      timestamp). Tanpa header itu server balas `400 SignError1`; dengan
//      `X-GA-SV` request yang identik balas 200.
//   3. `getCommonHeaders()` ffapis nyisipin `Expect: 100-continue`, yang di
//      Node/undici langsung melempar "expect header not supported" sebelum
//      request-nya sempat dikirim.
// Header login di sini sengaja dibikin sama persis sama `garenaRpc()` di
// bawah (sudah terbukti jalan buat empat RPC), jadi dua jalur konsisten.
//
// Sumber kredensial: kredensial embedded milik ffapis (`credentials.json`,
// 109 akun IND), dimuternya lewat `getNextCredential()` supaya bebannya nggak
// numpuk di satu akun. Niat awalnya nyoba daftar akun guest sendiri dulu,
// tapi endpoint `guest/register` Garena sudah mati - dari sandbox balas
// `404 error_not_found` di SEMUA varian parameter (source/client_type/app_id),
// jadi tiap kali nungguin register itu cuma buang waktu. Scraper Go yang jadi
// acuan port ini juga langsung pakai akun service tanpa register.
const GARENA_CLIENT_ID = '100067';
const GARENA_CLIENT_SECRET = '2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3';
const GARENA_GRANT_URL = 'https://ffmconnect.live.gop.garenanow.com/oauth/guest/token/grant';
const GARENA_MAJOR_LOGIN_URL = 'https://loginbp.ggblueshark.com/MajorLogin';
// Timeout per percobaan login. Angkanya turun dari 8000: endpoint grant /
// MajorLogin Garena emang sesekali nyangkut, dan kalau dibiarin 8 detik
// tiga percobaan bisa nyedot ~48 detik di cold start - kelihatan banget pas
// diuji (pernah ada sesi yang makan 35 detik cuma gara-gara nunggu baca
// body). 5 detik masih lewat buat login normal (ukuran penuh ~1,5 detik).
const LOGIN_TIMEOUT_MS = 5000;
const SESSION_MAX_AGE_MS = 30 * 60 * 1000;
const POOL_RETRY_LIMIT = 3;
// Total waktu maksimal buat MEMBANGUN satu sesi. Tiap percobaan udah dibatesin
// LOGIN_TIMEOUT_MS, tapi kalau jaringan lagi jelek semua akun bisa pada gagal -
// tanpa plafon ini, 3 percobaan x (grant + major = 2x timeout) = ~30 detik
// nahan seluruh request. 8 detik dipilih biar sejalur sama EXTRA_BUDGET_MS di
// pages/api/ff.ts: sesi yang belum jadi pas budget data tambahan habis memang
// nggak akan sempat kepakai juga.
const SESSION_BUILD_BUDGET_MS = 8000;
// Kredensial yang gagal dicoba lagi setelah jeda ini. Tanpa jeda, akun yang
// emang rusak / di-throttle server bakal dicoba ulang tiap sesi perlu
// dibangun ulang, dan tiap percobaan makan waktu penuh timeout login.
const CRED_COOLDOWN_MS = 10 * 60 * 1000;
// Response MajorLogin diawali blok 64 byte yang BUKAN protobuf (kalau nggak
// dipotong, byte pertamanya kebaca jadi satu field sampah aneh), baru
// sesudahnya ada payload yang bisa dibaca: field 8 = token, 10 = serverUrl.
const MAJOR_LOGIN_PREFIX = 64;

type GuestCredential = { uid: string; passwordHash: string };

// Fetch + baca body-nya di bawah SATU timeout. Versi sebelumnya (fetch doang)
// justru bahaya: timer-nya dilepas begitu header masuk, jadi baca
// `res.json()` / `res.arrayBuffer()` yang nyangkut nggak pernah dibatasi -
// itu yang bikin sesi pernah makan 35 detik. Kalau timeout keburu kepakai
// saat baca body, sinyal abort-nya tetap nutup koneksi.
async function fetchBounded<T>(
  url: string,
  init: RequestInit,
  ms: number,
  read: (res: Response) => Promise<T>
): Promise<{ res: Response; data: T }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const data = await read(res);
    return { res, data };
  } finally {
    clearTimeout(timer);
  }
}

async function guestGrant(cred: GuestCredential): Promise<{ openId: string; accessToken: string }> {
  const params = new URLSearchParams({
    uid: cred.uid,
    password: cred.passwordHash,
    response_type: 'token',
    client_type: '2',
    client_secret: GARENA_CLIENT_SECRET,
    client_id: GARENA_CLIENT_ID,
  });
  const { res, data: body } = await fetchBounded(
    GARENA_GRANT_URL,
    {
      method: 'POST',
      headers: { 'User-Agent': GARENA_UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    },
    LOGIN_TIMEOUT_MS,
    async (r) => {
      try {
        return (await r.json()) as { open_id?: string; access_token?: string; error?: string };
      } catch {
        // body bukan JSON - biarkan kosong, ditangkap di bawah
        return {};
      }
    }
  );
  if (!body.open_id || !body.access_token) throw new Error(`garena_grant_${body.error || res.status}`);
  return { openId: body.open_id, accessToken: body.access_token };
}

async function majorLogin(openId: string, accessToken: string): Promise<GarenaSession> {
  // Nomor field request: 22 = open_id, 23 = "4", 29 = access_token, 99 = "4".
  const payload = Buffer.concat([
    encStrField(22, openId),
    encStrField(23, '4'),
    encStrField(29, accessToken),
    encStrField(99, '4'),
  ]);
  const { res, data: buf } = await fetchBounded(
    GARENA_MAJOR_LOGIN_URL,
    {
      method: 'POST',
      headers: {
        'User-Agent': GARENA_UA,
        'X-Unity-Version': '2018.4.11f1',
        'X-GA': 'v1 1',
        ReleaseVersion: resolveObVersion(),
        // Wajib - tanpa ini server balas 400 SignError1.
        'X-GA-SV': String(Math.floor(Date.now() / 1000)),
        Authorization: 'Bearer',
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(await encrypt(payload)),
    },
    LOGIN_TIMEOUT_MS,
    async (r) => Buffer.from(await r.arrayBuffer())
  );
  if (!res.ok) throw new Error(`garena_major_login_http_${res.status}_${buf.toString('utf8', 0, 60)}`);
  const fields = readFields(buf.subarray(MAJOR_LOGIN_PREFIX));
  const token = textOf(fields, 8);
  const serverUrl = textOf(fields, 10);
  if (!token || !serverUrl) throw new Error('garena_major_login_response_kosong');
  return { token, serverUrl };
}

async function loginGuest(cred: GuestCredential): Promise<GarenaSession> {
  const { openId, accessToken } = await guestGrant(cred);
  return majorLogin(openId, accessToken);
}

let sessionCache: { value: GarenaSession; at: number } | null = null;
let sessionInFlight: Promise<GarenaSession> | null = null;

// Kredensial pool yang barusan gagal, beserta kapan boleh dicoba lagi.
// CredentialManager selalu mulai dari akun pertama, jadi tanpa catatan ini
// akun yang rusak (lihat `4718507406` yang selalu `response_kosong`) bakal
// dicoba ulang di SETIAP pembangunan sesi dan nahan loop-nya selama timeout.
const credCooldownUntil = new Map<string, number>();

async function buildSession(): Promise<GarenaSession> {
  // Langsung pakai kredensial embedded - lihat catatan soal `guest/register`
  // yang sudah mati di atas, jadi nggak ada langkah daftar akun sendiri lagi.
  const pool = new CredentialManager('IND');
  const poolSize = pool.getPoolSize() || 1;

  // Titik mulainya digeser acak dulu. CredentialManager selalu mulai dari
  // index 0, dan akun pertama itu ternyata ada yang rusak permanen (`4718507406`
  // jawabannya selalu kosong / nggak pernah nyambung) - kalau tiap build mulai
  // dari situ, cold start tiap isolate kebagian bayar timeout-nya penuh.
  // Acak di 109 akun bikin kemungkinan nyangkut akun yang sama jauh lebih
  // kecil, sementara rotasi dalam tetap jalan (dan akun gagal tetap kena
  // cooldown lewat logika bawah).
  const startOffset = Math.floor(Math.random() * poolSize);
  for (let i = 0; i < startOffset; i++) pool.getNextCredential();

  const buildStart = Date.now();
  let lastError = '';
  let failures = 0;
  // Batas scan-nya pool size biar loop tetap berhenti kalau semua kredensial
  // lagi cooldown (getNextCredential-nya muter balik ke awal), plus plafon
  // waktu biar jaringan yang lagi jelek nggak nahan request selama puluhan detik.
  for (
    let scanned = 0;
    scanned < poolSize && failures < POOL_RETRY_LIMIT && Date.now() - buildStart < SESSION_BUILD_BUDGET_MS;
    scanned++
  ) {
    const cred = pool.getNextCredential();
    if (!cred) break;
    const uid = String(cred.uid);
    const until = credCooldownUntil.get(uid) || 0;
    if (until > Date.now()) continue;
    try {
      const session = await loginGuest({ uid, passwordHash: String(cred.password) });
      sessionCache = { value: session, at: Date.now() };
      credCooldownUntil.delete(uid);
      console.log('garena_session source=pool uid=' + uid);
      return session;
    } catch (err) {
      failures++;
      lastError = err instanceof Error ? err.message : String(err);
      credCooldownUntil.set(uid, Date.now() + CRED_COOLDOWN_MS);
      console.log('garena_session_pool_error uid=' + uid, lastError);
    }
  }
  throw new Error(`garena_session_unavailable ${lastError}`);
}

export async function ensureGarenaSession(): Promise<GarenaSession> {
  if (sessionCache && Date.now() - sessionCache.at < SESSION_MAX_AGE_MS) return sessionCache.value;
  if (sessionInFlight) return sessionInFlight;
  sessionInFlight = buildSession().finally(() => {
    sessionInFlight = null;
  });
  return sessionInFlight;
}

// Buang sesi yang lagi kepakai supaya panggilan berikutnya login ulang dengan
// akun lain dari pool. Dipakai buat dua hal: sesi yang ditolak server
// (401/400) dan pencarian nickname - server Garena nge-scope hasil
// FuzzySearchAccountByName per akun, jadi akun yang sama bolak-balik sering
// cuma balikin hasil yang itu-itu aja.
export function invalidateGarenaSession() {
  sessionCache = null;
}

export type SearchAccount = {
  accountid: string;
  nickname: string;
  region: string | null;
  level: number | null;
  exp: number | null;
  liked: number | null;
  lastloginat: number | null;
};

function parseSearchAccounts(buf: Buffer): SearchAccount[] {
  const out: SearchAccount[] = [];
  for (const f of readFields(buf)) {
    if (f.num !== 1 || !f.bytes) continue;
    const info = readFields(f.bytes);
    const accountid = numOf(info, 1);
    const nickname = textOf(info, 3);
    if (!accountid || !nickname) continue;
    out.push({
      accountid: String(accountid),
      nickname,
      region: textOf(info, 5),
      level: numOf(info, 6),
      exp: numOf(info, 7),
      liked: numOf(info, 21),
      lastloginat: numOf(info, 24),
    });
  }
  return out;
}

// Pencarian nickname langsung ke Garena: `/FuzzySearchAccountByName` (nama
// endpointnya ada di settings.json ffapis, bukan `SearchAccountByName` yang
// lebih dulu dicoba waktu port ini - endpoint itu balas 19 byte nggak kebaca).
// Sesi yang dipakai sama dengan jalur /api/ff, jadi request pencarian yang
// jalan di isolate hangat nggak nambah login sama sekali.
export async function searchAccountsByName(keyword: string): Promise<SearchAccount[]> {
  const session = await ensureGarenaSession();
  const buf = await garenaRpc(session, '/FuzzySearchAccountByName', encStrField(1, keyword));
  return parseSearchAccounts(buf);
}

// Profil lengkap lewat RPC yang sama (`/GetPlayerPersonalShow`), cuma
// response-nya didekode pake descriptor milik ffapis biar bentuk object-nya
// (`basicinfo`, `clanbasicinfo`, `petinfo`, `socialinfo`, `creditscoreinfo`)
// sama persis dengan yang diharapkan normalizeProfileData - jadi nggak ada
// mapping field yang perlu ditulis ulang di sini.
//
// Kenapa transportnya bukan `api.getPlayerProfile()` ffapis? Karena httpPost
// bawaan ffapis nyisipin header `Expect: 100-continue` yang ditolak runtime
// fetch di Node/Workers (`fetch failed`). Itu sebabnya selama ini jalur
// "ffapis" selalu kalah balapan sama Ahmyth: dia udah login duluan tapi
// HTTP-nya nggak pernah tembus.
//
// Panggilan untuk UID yang sama di-dedup selagi masih jalan: jalur profil
// dan jalur data tambahan minta endpoint ini di request yang sama, dan dua
// request paralel ke server Garena pake token yang sama ternyata saling
// nahan sampai salah satunya kena RPC timeout (3,5 detik). Yang dibagi
// buffer mentahnya, masing-masing jalur tetap decode sendiri (profil pake
// descriptor ffapis, data tambahan pake parser manual kita).
const personalShowRawInFlight = new Map<string, Promise<Buffer>>();

function getPersonalShowRaw(uid: string): Promise<Buffer> {
  const running = personalShowRawInFlight.get(uid);
  if (running) return running;
  const job = (async () => {
    const session = await ensureGarenaSession();
    const payload = Buffer.concat([
      encIntField(1, Number(uid)),
      encIntField(2, 7),
      encIntField(3, 1),
      encIntField(4, 1),
      encIntField(5, 1),
    ]);
    return garenaRpc(session, '/GetPlayerPersonalShow', payload);
  })().finally(() => {
    personalShowRawInFlight.delete(uid);
  });
  personalShowRawInFlight.set(uid, job);
  return job;
}

export async function fetchPersonalShow(uid: string): Promise<any> {
  const buf = await getPersonalShowRaw(uid);
  return protoHandler.decode('PlayerPersonalShow.proto', 'response', buf) as any;
}

// ---------------------------------------------------------------------------
// Ambil semua data tambahan dari Garena, sekaligus.
//
// Empat RPC dijalankan paralel. `Promise.allSettled` dipakai (bukan
// `Promise.all`) supaya SATU endpoint yang gagal/timeout nggak bikin sisanya
// ikut kebuang - wishlist misalnya bisa kosong tapi career stats tetap
// kebawa. Hasil yang gagal selalu diisi nilai kosong/null, jadi caller nggak
// perlu null-check di mana-mana.
// ---------------------------------------------------------------------------

export async function fetchGarenaExtra(uid: string): Promise<GarenaExtra> {
  // Sesi-nya diurus di sini (lihat ensureGarenaSession() di atas), jadi
  // caller nggak perlu punya session sama sekali - termasuk nggak bergantung
  // pada siapa pun yang "menang balapan" login di request ini.
  const session = await ensureGarenaSession();
  const uidNum = Number(uid);

  // Field 3=1 (needGalleryInfo) itu yang bikin server ngirim badge history
  // (field 5). Tanpa flag itu response-nya jauh lebih tipis. Payload-nya
  // persis sama dengan yang dipake jalur profil, jadi lewat dedup yang sama.
  const [personalShowRes, wishlistRes, brStatsRes, csStatsRes] = await Promise.allSettled([
    getPersonalShowRaw(uid),
    garenaRpc(session, '/GetWishListItems', encIntField(1, uidNum)),
    garenaRpc(session, '/GetPlayerStats', Buffer.concat([encIntField(1, uidNum), encIntField(2, 0)])),
    garenaRpc(session, '/GetPlayerTCStats', Buffer.concat([encIntField(1, uidNum), encIntField(3, 15), encIntField(4, 0)])),
  ]);

  const extra: GarenaExtra = {
    accountExtra: null,
    spark: null,
    diamondTopup: null,
    roleStats: [],
    badgeHistory: [],
    wishlist: [],
    brModes: [],
    csStats: null,
  };

  if (personalShowRes.status === 'fulfilled') {
    const fields = readFields(personalShowRes.value);
    const basic = subsOf(fields, 1)[0];
    if (basic) {
      extra.accountExtra = parseAccountExtra(basic);
      extra.roleStats = parseRoles(basic);
    }
    extra.spark = parseSpark(fields);
    extra.diamondTopup = parseDiamondTopup(fields);
    extra.badgeHistory = parseBadgeHistory(personalShowRes.value);
  }

  if (wishlistRes.status === 'fulfilled') extra.wishlist = parseWishlist(wishlistRes.value);
  if (brStatsRes.status === 'fulfilled') extra.brModes = parseBrModes(brStatsRes.value);
  if (csStatsRes.status === 'fulfilled') extra.csStats = parseCsStats(csStatsRes.value);

  return extra;
}

// Pemanasan sesi: login Garena dimulai sejak module ini di-load, bukan nunggu
// request pertama masuk. Cold start udah makan waktu baca bundle + resolve
// module, jadi grant + MajorLogin (~1,5-3 detik sehat, lebih kalau kredensial
// pertama lagi bermasalah) ditumpukin di situ - request pertama lebih sering
// tinggal nunggu sesi yang hampir jadi. Kegagalan di sini sengaja diem-kan:
// jalur request tetap manggil ensureGarenaSession() sendiri, dan dialah yang
// nentuin hasil akhirnya (termasuk retry ke kredensial berikutnya).
ensureGarenaSession().catch(() => {});
