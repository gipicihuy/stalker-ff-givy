import type { NextApiRequest, NextApiResponse } from 'next';
import { issueToken } from '../../lib/security/token';
import { checkRateLimit, getBlacklistStatus } from '../../lib/security/doClient';
import { getClientIp } from '../../lib/security/request';

// Endpoint token dibatasin lebih longgar daripada endpoint utama (satu
// "stalk" bisa butuh 1-2 token: satu buat /api/ff, satu lagi kalau user
// lanjut search nickname), tapi tetap dijaga rate limit-nya sendiri biar
// nggak jadi celah buat scraper nge-generate token secara masif.
const TOKEN_RATE_LIMIT = 30;
const TOKEN_RATE_WINDOW_MS = 60_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} tidak diizinkan` });
  }

  const ip = getClientIp(req);

  const bl = await getBlacklistStatus(ip);
  if (bl.blacklisted) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const rate = await checkRateLimit(ip, TOKEN_RATE_LIMIT, TOKEN_RATE_WINDOW_MS);
  if (!rate.allowed) {
    res.setHeader('Retry-After', '5');
    return res.status(429).json({ error: 'rate_limited' });
  }

  const issued = await issueToken();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    token: issued.token,
    challenge: issued.challenge,
    difficulty: issued.difficulty,
    exp: issued.exp,
  });
}
