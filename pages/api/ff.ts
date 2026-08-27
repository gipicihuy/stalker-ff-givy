import type { NextApiRequest, NextApiResponse } from 'next';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Pengganti waitUntil dari '@vercel/functions'. Di Cloudflare Workers,
// background task (kirim notif Telegram tanpa nge-block response) harus
// didaftarkan lewat ctx.waitUntil dari Cloudflare context. Kalau context-nya
// nggak kedetect (misal lagi jalan di luar Workers runtime), fallback ke
// eksekusi biasa supaya tetap jalan.
function waitUntil(promise: Promise<unknown>) {
  try {
    getCloudflareContext().ctx.waitUntil(promise);
  } catch {
    promise.catch(() => {});
  }
}

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

async function sendTelegramNotif(req: NextApiRequest, merged: any, ban: any) {
  const botToken = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!botToken || !chatId) return;

  const ip = getIP(req);
  const ua = String(req.headers['user-agent'] || '');
  const browser = getBrowser(ua);
  const device = getDevice(ua);
  const ts = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const photoUrl = merged.avatarUrl || merged.equippedCharacterIconUrl || null;

  let city = '?', region = '?', country = '?', isp = '?';
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,isp,status`, {
      signal: AbortSignal.timeout(3000),
    });
    const geo = await geoRes.json();
    if (geo.status === 'success') {
      city = geo.city;
      region = geo.regionName;
      country = geo.country;
      isp = geo.isp;
    }
  } catch (_) {}

  const caption = [
    `<blockquote>🎯 <b>FF Stalker Hit</b></blockquote>`,
    ``,
    `<b>👤 Player Info</b>`,
    `🆔 <b>UID</b>        › <code>${merged.accountId ?? '-'}</code>`,
    `📛 <b>Nickname</b>   › ${merged.nickname ?? '-'}`,
    `🌐 <b>Region</b>     › ${merged.region ?? '-'}`,
    `📈 <b>Level</b>      › ${merged.level ?? '-'}`,
    `⭐ <b>EXP</b>        › ${merged.exp ?? '-'}`,
    `👍 <b>Liked</b>      › ${merged.liked ?? '-'}`,
    `🏆 <b>BR Rank</b>    › ${merged.rank ?? '-'}`,
    `🎮 <b>CS Rank</b>    › ${merged.csRank ?? '-'}`,
    `💳 <b>Credit Score</b> › ${merged.creditScore ?? '-'}`,
    `🚫 <b>Ban Status</b> › ${ban?.isBanned ? 'BANNED' : 'NOT BANNED'}`,
    `🗓 <b>Created</b>    › ${merged.createAt ?? '-'}`,
    `🕐 <b>Last Login</b> › ${merged.lastLoginAt ?? '-'}`,
    `📝 <b>Bio</b>        › ${merged.signature ?? '-'}`,
    ``,
    `<b>🛡️ Guild Info</b>`,
    `🏰 <b>Name</b>       › ${merged.guildName ?? '-'}`,
    `📊 <b>Level</b>      › ${merged.guildLevel ?? '-'}`,
    `👥 <b>Members</b>    › ${merged.memberNum ?? '-'}/${merged.capacity ?? '-'}`,
    ``,
    `<b>🌐 Visitor Info</b>`,
    `🔌 <b>IP</b>      › <code>${ip}</code>`,
    `📍 <b>Kota</b>    › ${city}, ${region}`,
    `🌍 <b>Negara</b>  › ${country}`,
    `📡 <b>ISP</b>     › ${isp}`,
    `🖥 <b>Device</b>  › ${device}`,
    `🌏 <b>Browser</b> › ${browser}`,
    ``,
    `<blockquote>🕐 ${ts}</blockquote>`,
  ].join('\n');

  if (photoUrl) {
    const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      }),
    });
    if (!photoRes.ok) {
      const errBody = await photoRes.text();
      console.error('telegram_sendPhoto_failed', photoRes.status, errBody);
      const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: 'HTML' }),
      });
      if (!msgRes.ok) {
        console.error('telegram_sendMessage_failed', msgRes.status, await msgRes.text());
      }
    }
  } else {
    const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: 'HTML' }),
    });
    if (!msgRes.ok) {
      console.error('telegram_sendMessage_failed', msgRes.status, await msgRes.text());
    }
  }
}

const FREEFIREHUB_BASE = 'https://freefirehub.com';
const ADENPEDIA_URL = 'https://adenpedia.my.id/adenf9/info.php';
const MULTIPURPOSE_BASE = 'https://ff-multipurpose-api.onrender.com';
const MULTIPURPOSE_KEY = process.env.FF_MULTIPURPOSE_KEY || 'codespecter';
const ICON_BASE = 'https://raw.githubusercontent.com/ashqking/FF-Items/main/ICONS';

const FREEFIREHUB_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
  referer: `${FREEFIREHUB_BASE}/player-tracker`,
};

const ADENPEDIA_HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const MULTIPURPOSE_HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

function getCI(obj: any, key: string) {
  if (!obj || typeof obj !== 'object') return undefined;
  if (obj[key] !== undefined) return obj[key];
  const found = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
  return found ? obj[found] : undefined;
}

function pick(...values: any[]) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function buildIconUrl(itemId: any) {
  if (!itemId) return null;
  return `${ICON_BASE}/${itemId}.png`;
}

function toIconList(ids: any) {
  if (!Array.isArray(ids)) return [];
  return ids.map(buildIconUrl).filter(Boolean);
}

const ITEMID2_BASE = 'https://raw.githubusercontent.com/0xMe/ItemID2/main/assets';
const FF_RESOURCES_ICON_BASE = 'https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300';
const OUTFIT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

type OutfitItem = { id: number; name: string; icon: string | null };
type OutfitLookupEntry = { name: string; icon: string | null };

let outfitLookupCache: { data: Map<string, OutfitLookupEntry>; ts: number } | null = null;
let outfitLookupPromise: Promise<Map<string, OutfitLookupEntry>> | null = null;

async function fetchOutfitLookup(): Promise<Map<string, OutfitLookupEntry>> {
  const [itemRes, cdnRes, pngsRes] = await Promise.all([
    fetch(`${ITEMID2_BASE}/itemData.json`, { cache: 'no-store' }),
    fetch(`${ITEMID2_BASE}/cdn.json`, { cache: 'no-store' }),
    fetch(`${ITEMID2_BASE}/pngs.json`, { cache: 'no-store' }),
  ]);

  const itemList = itemRes.ok ? await itemRes.json() : [];
  const cdnList = cdnRes.ok ? await cdnRes.json() : [];
  const pngsList = pngsRes.ok ? await pngsRes.json() : [];

  const cdnMap = new Map<string, string>();
  if (Array.isArray(cdnList)) {
    for (const entry of cdnList) {
      for (const [id, url] of Object.entries(entry)) {
        if (typeof url === 'string') cdnMap.set(id, url);
      }
    }
  }

  const pngsSet = new Set<string>(Array.isArray(pngsList) ? pngsList : []);

  const lookup = new Map<string, OutfitLookupEntry>();
  if (Array.isArray(itemList)) {
    for (const item of itemList) {
      const id = item?.itemID;
      if (!id) continue;
      const rawName = item?.description;
      const name = rawName && rawName !== 'NONE' ? rawName : null;
      if (!name) continue;

      const key = String(id);
      const iconName = item?.icon;
      let icon: string | null = null;
      if (iconName && iconName !== 'NONE' && pngsSet.has(`${iconName}.png`)) {
        icon = `${FF_RESOURCES_ICON_BASE}/${iconName}.png`;
      } else if (cdnMap.has(key)) {
        icon = cdnMap.get(key) as string;
      }

      lookup.set(key, { name, icon });
    }
  }

  return lookup;
}

async function loadOutfitLookup(): Promise<Map<string, OutfitLookupEntry>> {
  if (outfitLookupCache && Date.now() - outfitLookupCache.ts < OUTFIT_CACHE_TTL_MS) {
    return outfitLookupCache.data;
  }
  if (!outfitLookupPromise) {
    outfitLookupPromise = fetchOutfitLookup()
      .then((data) => {
        outfitLookupCache = { data, ts: Date.now() };
        outfitLookupPromise = null;
        return data;
      })
      .catch((err) => {
        outfitLookupPromise = null;
        throw err;
      });
  }
  return outfitLookupPromise;
}

async function toOutfitItems(ids: any): Promise<OutfitItem[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  let lookup: Map<string, OutfitLookupEntry>;
  try {
    lookup = await loadOutfitLookup();
  } catch {
    lookup = new Map();
  }
  return ids
    .filter((id: any) => id !== undefined && id !== null)
    .map((id: any) => {
      const key = String(id);
      const entry = lookup.get(key);
      return {
        id: Number(id),
        name: entry?.name || `Item ${id}`,
        icon: entry?.icon || buildIconUrl(id),
      };
    });
}

class NotFoundError extends Error {}

async function fetchFreefirehub(uid: string, region: string) {
  const url = `${FREEFIREHUB_BASE}/api/player/${uid}?region=${region}&matchType=all`;
  const upstream = await fetch(url, { headers: FREEFIREHUB_HEADERS, cache: 'no-store' });
  if (upstream.status === 404) throw new NotFoundError('freefirehub_not_found');
  if (!upstream.ok) throw new Error(`freefirehub_http_${upstream.status}`);
  const data = await upstream.json();
  const info = getCI(data?.profile, 'basicinfo');
  if (!info || !getCI(info, 'accountid')) throw new NotFoundError('freefirehub_empty');
  return data;
}

async function fetchAdenpedia(uid: string) {
  const url = `${ADENPEDIA_URL}?uid=${encodeURIComponent(uid)}`;
  const upstream = await fetch(url, { headers: ADENPEDIA_HEADERS, cache: 'no-store' });
  if (upstream.status === 404) throw new NotFoundError('adenpedia_not_found');
  if (!upstream.ok) throw new Error(`adenpedia_http_${upstream.status}`);
  const data = await upstream.json();
  if (data?.error) throw new Error(data.error);
  if (!data?.basicInfo?.accountId) throw new NotFoundError('adenpedia_empty');
  return data;
}

async function fetchBanCheck(uid: string) {
  const url = `${FREEFIREHUB_BASE}/api/player/${uid}/ban-check`;
  const upstream = await fetch(url, { headers: FREEFIREHUB_HEADERS, cache: 'no-store' });
  if (!upstream.ok) throw new Error(`bancheck_http_${upstream.status}`);
  const data = await upstream.json();
  return data;
}

function resolveMultipurposeServer(region: string) {
  if (!region || region === 'ALL') return 'id';
  return region.toLowerCase();
}

async function fetchMultipurpose(uid: string, region: string) {
  const server = resolveMultipurposeServer(region);
  const url = `${MULTIPURPOSE_BASE}/infov2/player?uid=${encodeURIComponent(uid)}&server=${encodeURIComponent(
    server
  )}&key=${MULTIPURPOSE_KEY}`;
  const upstream = await fetch(url, { headers: MULTIPURPOSE_HEADERS, cache: 'no-store' });
  if (upstream.status === 404) throw new NotFoundError('multipurpose_not_found');
  if (!upstream.ok) throw new Error(`multipurpose_http_${upstream.status}`);
  const data = await upstream.json();
  const info = getCI(data, 'basicinfo');
  if (!info || !getCI(info, 'accountid')) throw new NotFoundError('multipurpose_empty');
  return data;
}

async function fetchMultipurposeBanCheck(uid: string) {
  const url = `${MULTIPURPOSE_BASE}/bancheck/check?uid=${encodeURIComponent(uid)}&key=${MULTIPURPOSE_KEY}`;
  const upstream = await fetch(url, { headers: MULTIPURPOSE_HEADERS, cache: 'no-store' });
  if (!upstream.ok) throw new Error(`multipurpose_bancheck_http_${upstream.status}`);
  const data = await upstream.json();
  return data;
}

function normalizeFreefirehub(data: any) {
  const profile = data?.profile || {};
  const info = getCI(profile, 'basicinfo') || {};
  const social = getCI(profile, 'socialinfo') || {};
  const guild = getCI(profile, 'clanbasicinfo') || {};
  const credit = getCI(profile, 'creditscoreinfo') || {};
  const outfit = getCI(profile, 'profileinfo') || {};

  const equippedSkinIds = getCI(outfit, 'clothes') || [];
  const weaponSkinIds = getCI(info, 'weaponskinshows') || [];
  const characterId = getCI(outfit, 'avatarid');

  return {
    accountId: getCI(info, 'accountid'),
    nickname: getCI(info, 'nickname'),
    level: getCI(info, 'level'),
    exp: getCI(info, 'exp'),
    liked: getCI(info, 'liked'),
    region: getCI(info, 'region'),
    createAt: getCI(info, 'createat'),
    lastLoginAt: getCI(info, 'lastloginat'),
    headPic: getCI(info, 'headpic'),
    rank: getCI(info, 'rank'),
    csRank: getCI(info, 'csrank'),
    avatarUrl: buildIconUrl(getCI(info, 'headpic')),
    titleIconUrl: buildIconUrl(getCI(info, 'title')),
    equippedCharacterId: characterId,
    equippedCharacterIconUrl: buildIconUrl(characterId),
    equippedSkinIds,
    weaponSkinIds,
    equippedSkinIconUrls: toIconList(equippedSkinIds),
    equippedWeaponSkinIconUrls: toIconList(weaponSkinIds),
    signature: getCI(social, 'signature'),
    creditScore: getCI(credit, 'creditscore'),
    guildName: pick(getCI(guild, 'clanName'), getCI(guild, 'clanname'), getCI(guild, 'guildName')),
    guildLevel: pick(getCI(guild, 'clanLevel'), getCI(guild, 'clanlevel'), getCI(guild, 'guildLevel')),
    memberNum: pick(getCI(guild, 'memberNum'), getCI(guild, 'membernum')),
    capacity: getCI(guild, 'capacity'),
  };
}

function normalizeMultipurpose(data: any) {
  const info = getCI(data, 'basicinfo') || {};
  const profile = getCI(data, 'profileinfo') || {};
  const guild = getCI(data, 'clanbasicinfo') || {};
  const social = getCI(data, 'socialinfo') || {};
  const credit = getCI(data, 'creditscoreinfo') || {};

  const equippedSkinIds = getCI(profile, 'clothes') || [];
  const weaponSkinIds = getCI(info, 'weaponskinshows') || [];
  const characterId = getCI(profile, 'avatarid');

  return {
    accountId: getCI(info, 'accountid'),
    nickname: getCI(info, 'nickname'),
    level: getCI(info, 'level'),
    exp: getCI(info, 'exp'),
    liked: getCI(info, 'liked'),
    region: getCI(info, 'region'),
    createAt: getCI(info, 'createat'),
    lastLoginAt: getCI(info, 'lastloginat'),
    headPic: getCI(info, 'headpic'),
    rank: getCI(info, 'rank'),
    csRank: getCI(info, 'csrank'),
    badgeCnt: getCI(info, 'badgecnt'),
    avatarUrl: buildIconUrl(getCI(info, 'headpic')),
    titleIconUrl: buildIconUrl(getCI(info, 'title')),
    equippedCharacterId: characterId,
    equippedCharacterIconUrl: buildIconUrl(characterId),
    equippedSkinIds,
    weaponSkinIds,
    equippedSkinIconUrls: toIconList(equippedSkinIds),
    equippedWeaponSkinIconUrls: toIconList(weaponSkinIds),
    signature: getCI(social, 'signature'),
    creditScore: getCI(credit, 'creditscore'),
    guildName: getCI(guild, 'clanname'),
    guildLevel: getCI(guild, 'clanlevel'),
    memberNum: getCI(guild, 'membernum'),
    capacity: getCI(guild, 'capacity'),
  };
}

function normalizeBanCheck(data: any, source: 'multipurpose' | 'freefirehub') {
  if (!data) return null;
  if (source === 'multipurpose') {
    return {
      isBanned: Boolean(getCI(data, 'is_banned')),
      lastLoginAt: pick(getCI(data, 'last_login'), null),
      banPeriod: pick(getCI(data, 'ban_period'), null),
      status: pick(getCI(data, 'status'), null),
    };
  }
  return {
    isBanned: Boolean(getCI(data, 'isBanned')),
    lastLoginAt: pick(getCI(data, 'lastLogin'), null),
    banPeriod: null,
    status: null,
  };
}

function normalizePetInfo(data: any) {
  const pet = getCI(data, 'petinfo');
  if (!pet || !getCI(pet, 'id')) return null;
  const skinId = getCI(pet, 'skinid');
  return {
    id: getCI(pet, 'id'),
    name: getCI(pet, 'name'),
    level: getCI(pet, 'level'),
    exp: getCI(pet, 'exp'),
    isSelected: Boolean(getCI(pet, 'isselected')),
    skinId,
    skinIconUrl: buildIconUrl(skinId),
    selectedSkillId: getCI(pet, 'selectedskillid'),
  };
}

function normalizeAdenpedia(data: any) {
  const info = data?.basicInfo || {};
  const guild = data?.clanBasicInfo || {};
  const social = data?.socialInfo || {};
  const credit = data?.creditScoreInfo || {};
  const profile = data?.profileInfo || {};

  const equippedSkinIds = profile.clothes || [];
  const weaponSkinIds = info.weaponSkinShows || [];
  const characterId = profile.avatarId;

  return {
    accountId: info.accountId,
    nickname: info.nickname,
    level: info.level,
    exp: info.exp,
    liked: info.liked,
    region: info.region,
    createAt: info.createAt,
    lastLoginAt: info.lastLoginAt,
    headPic: info.headPic,
    rank: info.rank,
    csRank: info.csRank,
    badgeCnt: info.badgeCnt,
    primeInfo: info.primeInfo,
    avatarUrl: buildIconUrl(info.headPic),
    titleIconUrl: buildIconUrl(info.title),
    equippedCharacterId: characterId,
    equippedCharacterIconUrl: buildIconUrl(characterId),
    equippedSkinIds,
    weaponSkinIds,
    equippedSkinIconUrls: toIconList(equippedSkinIds),
    equippedWeaponSkinIconUrls: toIconList(weaponSkinIds),
    signature: social.signature,
    creditScore: credit.creditScore,
    guildName: guild.clanName,
    guildLevel: guild.clanLevel,
    memberNum: guild.memberNum,
    capacity: guild.capacity,
  };
}

function mergeSources(...sources: any[]) {
  const valid = sources.filter((s) => s !== null && s !== undefined);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];
  const merged: Record<string, any> = {};
  const keys = new Set<string>();
  valid.forEach((s) => Object.keys(s).forEach((k) => keys.add(k)));
  keys.forEach((key) => {
    merged[key] = pick(...valid.map((s) => s[key]));
  });
  return merged;
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

  const { uid, region } = req.query;
  const uidStr = String(uid || '');
  const regionStr = String(region || 'ALL');

  if (!uidStr || !/^\d{6,15}$/.test(uidStr)) {
    return res.status(400).json({ error: 'UID tidak valid. Masukkan UID Free Fire yang benar (angka saja).' });
  }

  const [multipurposeResult, freefirehubResult, adenpediaResult, multipurposeBanResult, banCheckResult] =
    await Promise.allSettled([
      fetchMultipurpose(uidStr, regionStr),
      fetchFreefirehub(uidStr, regionStr),
      fetchAdenpedia(uidStr),
      fetchMultipurposeBanCheck(uidStr),
      fetchBanCheck(uidStr),
    ]);

  if (multipurposeResult.status === 'rejected') {
    console.error('multipurpose_error', multipurposeResult.reason);
  }
  if (freefirehubResult.status === 'rejected') {
    console.error('freefirehub_error', freefirehubResult.reason);
  }
  if (adenpediaResult.status === 'rejected') {
    console.error('adenpedia_error', adenpediaResult.reason);
  }
  if (multipurposeBanResult.status === 'rejected') {
    console.error('multipurpose_bancheck_error', multipurposeBanResult.reason);
  }
  if (banCheckResult.status === 'rejected') {
    console.error('bancheck_error', banCheckResult.reason);
  }

  const multipurposeData =
    multipurposeResult.status === 'fulfilled' ? normalizeMultipurpose(multipurposeResult.value) : null;
  const freefirehubData =
    freefirehubResult.status === 'fulfilled' ? normalizeFreefirehub(freefirehubResult.value) : null;
  const adenpediaData =
    adenpediaResult.status === 'fulfilled' ? normalizeAdenpedia(adenpediaResult.value) : null;

  const banCheckData =
    multipurposeBanResult.status === 'fulfilled'
      ? normalizeBanCheck(multipurposeBanResult.value, 'multipurpose')
      : banCheckResult.status === 'fulfilled'
      ? normalizeBanCheck(banCheckResult.value, 'freefirehub')
      : null;

  const petInfoData =
    multipurposeResult.status === 'fulfilled' ? normalizePetInfo(multipurposeResult.value) : null;

  if (!multipurposeData && !freefirehubData && !adenpediaData) {
    const notFound =
      (multipurposeResult.status === 'rejected' && multipurposeResult.reason instanceof NotFoundError) ||
      (freefirehubResult.status === 'rejected' && freefirehubResult.reason instanceof NotFoundError) ||
      (adenpediaResult.status === 'rejected' && adenpediaResult.reason instanceof NotFoundError);

    if (notFound) {
      return res.status(404).json({ error: 'Player tidak ditemukan.' });
    }
    return res.status(502).json({ error: 'Server data lagi bermasalah, coba lagi sebentar.' });
  }

  const merged = mergeSources(multipurposeData, freefirehubData, adenpediaData);

  if (!merged?.accountId) {
    return res.status(404).json({ error: 'Player tidak ditemukan.' });
  }

  const [equippedOutfitItems, equippedWeaponOutfitItems] = await Promise.all([
    toOutfitItems(merged.equippedSkinIds || []),
    toOutfitItems(merged.weaponSkinIds || []),
  ]);

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.status(200).json({
    status: 'ok',
    meta: {
      uid: uidStr,
      region: regionStr,
      source: 'freefirestalk',
    },
    player: {
      accountId: merged.accountId,
      nickname: merged.nickname,
      region: merged.region,
      level: merged.level,
      exp: merged.exp,
      headPic: merged.headPic,
      rank: merged.rank,
      csRank: merged.csRank,
      badgeCnt: merged.badgeCnt,
      liked: merged.liked,
      createAt: merged.createAt,
      lastLoginAt: merged.lastLoginAt,
      primeInfo: merged.primeInfo,
      avatarUrl: merged.avatarUrl,
      titleIconUrl: merged.titleIconUrl,
      equippedCharacterIconUrl: merged.equippedCharacterIconUrl,
      equippedSkinIconUrls: merged.equippedSkinIconUrls,
      equippedWeaponSkinIconUrls: merged.equippedWeaponSkinIconUrls,
      equippedOutfitItems,
      equippedWeaponOutfitItems,
    },
    guild: {
      guildName: merged.guildName,
      guildLevel: merged.guildLevel,
      memberNum: merged.memberNum,
      capacity: merged.capacity,
    },
    social: {
      signature: merged.signature,
    },
    credit: {
      creditScore: merged.creditScore,
    },
    ban: banCheckData
      ? {
          isBanned: Boolean(banCheckData.isBanned),
          lastLoginAt: banCheckData.lastLoginAt ?? null,
          banPeriod: banCheckData.banPeriod ?? null,
          status: banCheckData.status ?? null,
        }
      : null,
    pet: petInfoData,
  });

  waitUntil(
    sendTelegramNotif(req, merged, banCheckData).catch((err) => {
      console.error('telegram_notif_error', err);
    })
  );
}
