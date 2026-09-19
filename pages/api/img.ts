import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyImageSignature } from '../../lib/security/imageSign';
import { checkRateLimit, getBlacklistStatus } from '../../lib/security/doClient';
import { getClientIp } from '../../lib/security/request';

// Proxy gambar internal. /api/ff sekarang cuma ngasih tau path proxy ini
// (bukan URL CDN aslinya) buat avatar/icon/title/dsb. Whitelist host di
// bawah supaya endpoint ini nggak disalahgunakan jadi open proxy buat narik
// URL sembarangan.
const ALLOWED_HOSTS = new Set(['cdn.jsdelivr.net', 'raw.githubusercontent.com']);

// Endpoint ini dipanggil browser lewat <img src="..."> biasa, jadi nggak
// bisa dikasih handshake token via header kayak /api/ff & /api/search.
// Sebagai gantinya: setiap path yang diterbitin /api/ff sudah ditempelin
// signature+expiry (lihat lib/security/imageSign.ts) saat response
// dibangun, dan di sini kita cuma mau ngelayanin path yang signature-nya
// valid - jadi /api/img nggak bisa dipakai buat enumerasi UID/gambar
// sembarangan langsung, harus lewat /api/ff dulu.
const IMG_RATE_LIMIT = 60;
const IMG_RATE_WINDOW_MS = 60_000;

function decodeTarget(u: string): string | null {
  try {
    const decoded = Buffer.from(u, 'base64url').toString('utf-8');
    const parsed = new URL(decoded);
    if (parsed.protocol !== 'https:') return null;
    if (!ALLOWED_HOSTS.has(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const ip = getClientIp(req);

  const bl = await getBlacklistStatus(ip);
  if (bl.blacklisted) return res.status(403).end();

  const rate = await checkRateLimit(ip, IMG_RATE_LIMIT, IMG_RATE_WINDOW_MS);
  if (!rate.allowed) {
    res.setHeader('Retry-After', '5');
    return res.status(429).end();
  }

  const raw = req.query.u;
  const uStr = Array.isArray(raw) ? raw[0] : raw;
  if (!uStr) return res.status(400).end();

  const expRaw = req.query.e;
  const sigRaw = req.query.t;
  const expStr = Array.isArray(expRaw) ? expRaw[0] : expRaw;
  const sigStr = Array.isArray(sigRaw) ? sigRaw[0] : sigRaw;

  // Signature dihitung atas path relatif TANPA e/t (persis string yang
  // di-sign di lib/security/imageSign.ts pas /api/ff bikin URL ini).
  const pathWithoutSig = `/api/img?u=${uStr}`;
  const sigValid = await verifyImageSignature(pathWithoutSig, expStr, sigStr);
  if (!sigValid) return res.status(403).end();

  const targetUrl = decodeTarget(uStr);
  if (!targetUrl) return res.status(400).end();

  try {
    const upstream = await fetch(targetUrl, { cache: 'no-store' });
    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status === 404 ? 404 : 502).end();
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const buf = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    // Cache lama & agresif - ini aset gambar statis dari CDN pihak ketiga.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    res.status(200).send(buf);
  } catch (err) {
    console.error('img_proxy_error', err);
    res.status(502).end();
  }
}
