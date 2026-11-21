import type { NextApiRequest, NextApiResponse } from 'next';
import { handleFf } from '../ff';
import { checkRateLimit } from '../../../lib/security/doClient';
import { verifyApiKey } from '../../../lib/security/apiKeys';

const V1_RATE_LIMIT = 20;
const V1_RATE_WINDOW_MS = 10_000;
const V1_IMAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readKey(req: NextApiRequest): string {
  const q = req.query.apikey ?? req.query.key;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  if (fromQuery) return String(fromQuery).trim();
  const header = req.headers['x-api-key'];
  const fromHeader = Array.isArray(header) ? header[0] : header;
  return fromHeader ? String(fromHeader).trim() : '';
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

  const provided = readKey(req);
  let verdict;
  try {
    verdict = await verifyApiKey(provided);
  } catch (err) {
    console.error('api_v1_verify_error', err);
    return res.status(503).json({ status: 'error', error: 'api_v1_unavailable' });
  }
  if (!verdict.valid) {
    const error = verdict.reason === 'expired' ? 'api_key_expired' : verdict.reason === 'revoked' ? 'api_key_revoked' : 'invalid_api_key';
    return res.status(401).json({ status: 'error', error });
  }

  const rate = await checkRateLimit(`v1:${verdict.id}`, V1_RATE_LIMIT, V1_RATE_WINDOW_MS);
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
