import { CredentialManager, FreeFireAPI, encrypt, resolveObVersion } from 'ffapis';

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
// Sumber kredensialnya dua lapis:
//   a. akun guest daftaran sendiri via `ffapis.register()` - dicoba duluan
//      karena itu niat asli kode ini (jangan ngandelin akun bersama). Tapi
//      dari sandbox endpoint-nya balas `404 error_not_found` di semua
//      varian parameter, jadi kemungkinan besar sudah diblokir per-IP atau
//      guest register-nya memang sudah dimatikan Garena.
//   b. kredensial embedded milik ffapis (`credentials.json`, 109 akun IND)
//      sebagai jaring pengaman - tanpa ini semua section tambahan bakal
//      kosong terus kalau register sudah mati. Dimuternya lewat
//      `getNextCredential()` supaya bebannya nggak numpuk di satu akun.
const GARENA_CLIENT_ID = '100067';
const GARENA_CLIENT_SECRET = '2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3';
const GARENA_GRANT_URL = 'https://ffmconnect.live.gop.garenanow.com/oauth/guest/token/grant';
const GARENA_MAJOR_LOGIN_URL = 'https://loginbp.ggblueshark.com/MajorLogin';
const LOGIN_TIMEOUT_MS = 8000;
const SESSION_MAX_AGE_MS = 30 * 60 * 1000;
const OWN_REGISTER_BUDGET_MS = 6000;
const POOL_RETRY_LIMIT = 3;
// Response MajorLogin diawali blok 64 byte yang BUKAN protobuf (kalau nggak
// dipotong, byte pertamanya kebaca jadi satu field sampah aneh), baru
// sesudahnya ada payload yang bisa dibaca: field 8 = token, 10 = serverUrl.
const MAJOR_LOGIN_PREFIX = 64;

type GuestCredential = { uid: string; passwordHash: string };

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Timeout versi promise yang NGGAK membatalkan task aslinya. Dipakai buat
// `register()` yang API-nya nggak menerima AbortSignal, jadi kalau endpointnya
// ngegantung request tetap lanjut ke kredensial berikutnya tanpa nunggu.
function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        console.log('garena_register_error', err instanceof Error ? err.message : err);
        resolve(null);
      }
    );
  });
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
  const res = await fetchWithTimeout(
    GARENA_GRANT_URL,
    {
      method: 'POST',
      headers: { 'User-Agent': GARENA_UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    },
    LOGIN_TIMEOUT_MS
  );
  let body: { open_id?: string; access_token?: string; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    // body bukan JSON - biarkan kosong, ditangkap di bawah
  }
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
  const res = await fetchWithTimeout(
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
    LOGIN_TIMEOUT_MS
  );
  const buf = Buffer.from(await res.arrayBuffer());
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

async function buildSession(): Promise<GarenaSession> {
  // (a) akun sendiri dulu
  const own = await raceTimeout(
    (async (): Promise<GuestCredential> => {
      const reg = await new FreeFireAPI().register('IND');
      return { uid: reg.uid, passwordHash: reg.passwordHash };
    })(),
    OWN_REGISTER_BUDGET_MS
  );
  if (own) {
    try {
      const session = await loginGuest(own);
      sessionCache = { value: session, at: Date.now() };
      console.log('garena_session source=own uid=' + own.uid);
      return session;
    } catch (err) {
      console.log('garena_session_own_login_error', err instanceof Error ? err.message : err);
    }
  }

  // (b) kredensial embedded ffapis
  const pool = new CredentialManager('IND');
  let lastError = '';
  for (let attempt = 0; attempt < POOL_RETRY_LIMIT; attempt++) {
    const cred = pool.getNextCredential();
    if (!cred) break;
    try {
      const session = await loginGuest({ uid: String(cred.uid), passwordHash: String(cred.password) });
      sessionCache = { value: session, at: Date.now() };
      console.log('garena_session source=pool uid=' + cred.uid);
      return session;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.log('garena_session_pool_error uid=' + cred.uid, lastError);
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
  // (field 5). Tanpa flag itu response-nya jauh lebih tipis.
  const personalShowPayload = Buffer.concat([
    encIntField(1, uidNum),
    encIntField(2, 7),
    encIntField(3, 1),
    encIntField(4, 1),
    encIntField(5, 1),
  ]);

  const [personalShowRes, wishlistRes, brStatsRes, csStatsRes] = await Promise.allSettled([
    garenaRpc(session, '/GetPlayerPersonalShow', personalShowPayload),
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
