import type { NextApiRequest, NextApiResponse } from 'next';
import {
  checkAdminPassword,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  isAdminConfigured,
  isAdminSession,
} from '../../../lib/security/adminAuth';
import { checkRateLimit } from '../../../lib/security/doClient';
import { getClientIp, getRequestOrigin } from '../../../lib/security/request';

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 60_000;

function sameOrigin(req: NextApiRequest): boolean {
  const origin = req.headers['origin'] as string | undefined;
  return !origin || origin === getRequestOrigin(req);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (!isAdminConfigured()) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ loggedIn: await isAdminSession(req) });
  }

  if (!sameOrigin(req)) {
    return res.status(403).json({ error: 'bad_origin' });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearAdminSessionCookie());
    return res.status(200).json({ loggedIn: false });
  }

  if (req.method === 'POST') {
    const rate = await checkRateLimit(`adminlogin:${getClientIp(req)}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((rate.retryAfterMs || 1000) / 1000))));
      return res.status(429).json({ error: 'terlalu banyak percobaan, tunggu sebentar' });
    }
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!(await checkAdminPassword(password))) {
      return res.status(401).json({ error: 'password salah' });
    }
    res.setHeader('Set-Cookie', await createAdminSessionCookie());
    return res.status(200).json({ loggedIn: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: 'method_not_allowed' });
}
