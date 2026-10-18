import { encrypt, resolveObVersion } from 'ffapis';

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

export type SparkInfo = { level: number | null; points: number | null };

export type RoleStat = {
  seasonId: number | null;
  gamemode: number | null;
  matchmode: number | null;
  roleId: number | null;
  field2: number | null;
  field3: number | null;
  field4: number | null;
  field5: number | null;
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
// yang dikarang. Yang NGGAK ada di descriptor mana pun (wishlist, badge
// history, spark, lone wolf, role, dan field `AccountInfoBasic` yang
// ke-trim) dinamai dari angka field-nya langsung.
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

// Urutan field 1/2/3 di response GetPlayerStats = tiga mode BR. Angka fieldnya
// bukan nama modenya, jadi mapping di sini berdasarkan urutan yang dipakai
// server (solo, duo, squad).
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
    return {
      seasonId: numOf(entry, 1),
      gamemode: numOf(entry, 2),
      matchmode: numOf(entry, 4),
      roleId: detail ? numOf(detail, 1) : null,
      field2: detail ? numOf(detail, 2) : null,
      field3: detail ? numOf(detail, 3) : null,
      field4: detail ? numOf(detail, 4) : null,
      field5: detail ? numOf(detail, 5) : null,
    };
  });
}

function parseSpark(fields: ProtoField[]): SparkInfo | null {
  const spark = subsOf(fields, 15)[0];
  if (!spark) return null;
  return { level: numOf(spark, 1), points: numOf(spark, 2) };
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
// Ambil semua data tambahan dari Garena, sekaligus.
//
// Empat RPC dijalankan paralel. `Promise.allSettled` dipakai (bukan
// `Promise.all`) supaya SATU endpoint yang gagal/timeout nggak bikin sisanya
// ikut kebuang - wishlist misalnya bisa kosong tapi career stats tetap
// kebawa. Hasil yang gagal selalu diisi nilai kosong/null, jadi caller nggak
// perlu null-check di mana-mana.
// ---------------------------------------------------------------------------

export async function fetchGarenaExtra(session: GarenaSession, uid: string): Promise<GarenaExtra> {
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
