import type { NextApiRequest, NextApiResponse } from 'next';
import { handleFf } from '../ff';
import { checkRateLimit } from '../../../lib/security/doClient';
import { sha256Hex, timingSafeEqual } from '../../../lib/security/crypto';

const V1_RATE_LIMIT = 20;
const V1_RATE_WINDOW_MS = 10_000;
const V1_IMAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function configuredKeys(): string[] {
  return String(process.env.API_V1_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

function readKey(req: NextApiRequest): string {
  const header = req.headers['x-api-key'];
  const fromHeader = Array.isArray(header) ? header[0] : header;
  if (fromHeader) return String(fromHeader).trim();
  const auth = String(req.headers['authorization'] || '');
  if (/^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, '').trim();
  const q = req.query.apikey ?? req.query.key;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  return fromQuery ? String(fromQuery).trim() : '';
}

function matchKey(provided: string, keys: string[]): string | null {
  let matched: string | null = null;
  for (const key of keys) {
    if (timingSafeEqual(key, provided)) matched = key;
  }
  return matched;
}

function pickItem(item: any) {
  if (!item) return null;
  return { id: item.id, name: item.name, type: item.type ?? null, image: item.icon ?? null };
}

function pickList(list: any) {
  return Array.isArray(list) ? list.map(pickItem) : [];
}

function withOutfit(body: any) {
  const p = body?.player || {};
  return {
    ...body,
    outfit: {
      clothes: pickList(p.equippedOutfitItems),
      weaponSkins: pickList(p.equippedWeaponOutfitItems),
      lookChanger: pickList(p.equippedLookChangerItems),
      arrivalAnimation: pickList(p.equippedArrivalAnimationItems),
      banner: pickItem(p.equippedBanner),
      title: pickItem(p.equippedTitle),
      pin: pickItem(p.equippedPin),
      character: pickItem(p.equippedCharacter),
      avatar: pickItem(p.equippedAvatar),
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: 'error', error: `Method ${req.method} tidak diizinkan` });
  }

  const keys = configuredKeys();
  if (keys.length === 0) {
    return res.status(503).json({ status: 'error', error: 'api_v1_not_configured' });
  }

  const provided = readKey(req);
  const matched = provided ? matchKey(provided, keys) : null;
  if (!matched) {
    return res.status(401).json({ status: 'error', error: 'invalid_api_key' });
  }

  const keyId = (await sha256Hex(matched)).slice(0, 16);
  const rate = await checkRateLimit(`v1:${keyId}`, V1_RATE_LIMIT, V1_RATE_WINDOW_MS);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((rate.retryAfterMs || 1000) / 1000))));
    return res.status(429).json({ status: 'error', error: 'rate_limited' });
  }

  return handleFf(req, res, {
    skipGuard: true,
    skipNotif: true,
    imageTtlMs: V1_IMAGE_TTL_MS,
    cacheControl: 'private, no-store',
    transform: withOutfit,
  });
}
