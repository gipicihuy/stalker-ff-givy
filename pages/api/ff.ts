import type { NextApiRequest, NextApiResponse } from 'next';

const FREEFIREHUB_BASE = 'https://freefirehub.com';
const ADENPEDIA_URL = 'https://adenpedia.my.id/adencs/info.php';
const ICON_BASE = 'https://raw.githubusercontent.com/ashqking/FF-Items/main/ICONS';

const FREEFIREHUB_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
  referer: `${FREEFIREHUB_BASE}/player-tracker`,
};

const ADENPEDIA_HEADERS = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Referer: 'https://adenpedia.my.id/',
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

async function fetchFreefirehub(uid: string, region: string) {
  const url = `${FREEFIREHUB_BASE}/api/player/${uid}?region=${region}&matchType=all`;
  const upstream = await fetch(url, { headers: FREEFIREHUB_HEADERS, cache: 'no-store' });
  if (!upstream.ok) throw new Error(`freefirehub_http_${upstream.status}`);
  const data = await upstream.json();
  const info = getCI(data?.profile, 'basicinfo');
  if (!info || !getCI(info, 'accountid')) throw new Error('freefirehub_empty');
  return data;
}

async function fetchAdenpedia(uid: string) {
  const url = `${ADENPEDIA_URL}?uid=${encodeURIComponent(uid)}`;
  const upstream = await fetch(url, { headers: ADENPEDIA_HEADERS, cache: 'no-store' });
  if (!upstream.ok) throw new Error(`adenpedia_http_${upstream.status}`);
  const data = await upstream.json();
  if (!data?.basicInfo?.accountId) throw new Error('adenpedia_empty');
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

function normalizeAdenpedia(data: any) {
  const info = data?.basicInfo || {};
  const guild = data?.clanBasicInfo || {};
  const social = data?.socialInfo || {};
  const credit = data?.creditScoreInfo || {};

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
    signature: social.signature,
    creditScore: credit.creditScore,
    guildName: guild.clanName,
    guildLevel: guild.clanLevel,
    memberNum: guild.memberNum,
    capacity: guild.capacity,
  };
}

function mergeSources(primary: any, fallback: any) {
  if (!primary) return fallback;
  if (!fallback) return primary;
  const merged: Record<string, any> = {};
  const keys = new Set([...Object.keys(primary), ...Object.keys(fallback)]);
  keys.forEach((key) => {
    merged[key] = pick(primary[key], fallback[key]);
  });
  return merged;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} tidak diizinkan` });
  }

  const { uid, region } = req.query;
  const uidStr = String(uid || '');
  const regionStr = String(region || 'ALL');

  if (!uidStr || !/^\d{6,15}$/.test(uidStr)) {
    return res.status(400).json({ error: 'UID tidak valid. Masukkan UID Free Fire yang benar (angka saja).' });
  }

  const [freefirehubResult, adenpediaResult] = await Promise.allSettled([
    fetchFreefirehub(uidStr, regionStr),
    fetchAdenpedia(uidStr),
  ]);

  if (freefirehubResult.status === 'rejected') {
    console.error('freefirehub_error', freefirehubResult.reason);
  }
  if (adenpediaResult.status === 'rejected') {
    console.error('adenpedia_error', adenpediaResult.reason);
  }

  const freefirehubData =
    freefirehubResult.status === 'fulfilled' ? normalizeFreefirehub(freefirehubResult.value) : null;
  const adenpediaData =
    adenpediaResult.status === 'fulfilled' ? normalizeAdenpedia(adenpediaResult.value) : null;

  if (!freefirehubData && !adenpediaData) {
    return res.status(502).json({ error: 'Server data lagi bermasalah, coba lagi sebentar.' });
  }

  const merged = mergeSources(freefirehubData, adenpediaData);

  if (!merged?.accountId) {
    return res.status(404).json({ error: 'Data tidak ditemukan untuk UID ini.' });
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  return res.status(200).json({
    basicInfo: {
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
    },
    guildBasicInfo: {
      guildName: merged.guildName,
      guildLevel: merged.guildLevel,
      memberNum: merged.memberNum,
      capacity: merged.capacity,
    },
    socialInfo: {
      signature: merged.signature,
    },
    creditScoreInfo: {
      creditScore: merged.creditScore,
    },
  });
}
