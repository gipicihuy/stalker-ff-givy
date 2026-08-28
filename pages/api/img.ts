import type { NextApiRequest, NextApiResponse } from 'next';

// Proxy gambar internal. /api/ff sekarang cuma ngasih tau path proxy ini
// (bukan URL CDN aslinya) buat avatar/icon/title/dsb. Whitelist host di
// bawah supaya endpoint ini nggak disalahgunakan jadi open proxy buat narik
// URL sembarangan.
const ALLOWED_HOSTS = new Set(['cdn.jsdelivr.net', 'raw.githubusercontent.com']);

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

  const raw = req.query.u;
  const uStr = Array.isArray(raw) ? raw[0] : raw;
  if (!uStr) return res.status(400).end();

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
