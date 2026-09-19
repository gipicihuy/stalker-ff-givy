import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, consumeNonce, getBlacklistStatus } from './doClient';
import { verifyToken, tokenNonceOf } from './token';
import { verifyInternalRequest, INTERNAL_SSR_SIG_HEADER } from './internal';
import { TOKEN_TTL_MS, TOKEN_HEADER, POW_NONCE_HEADER, SIG_HEADER } from './constants';

export interface GuardOptions {
  // Nama endpoint dipakai sebagai "path" pengikat signature - lihat
  // lib/security/token.ts. Harus persis sama dengan yang dipakai client.
  path: string;
  rateLimit: number;
  rateWindowMs: number;
  // Origin tambahan yang diizinkan selain origin request itu sendiri
  // (kosongin kalau cukup same-origin saja, yang berlaku buat app ini).
  extraAllowedOrigins?: string[];
  // false buat endpoint yang pakai signed-URL (img.ts) sebagai gantinya,
  // karena dipanggil lewat <img src> biasa yang nggak bisa nempelin header.
  requireHandshake: boolean;
}

export type GuardResult = { ok: true } | { ok: false; status: number; body: { error: string } };

export async function guardRequest(
  req: NextApiRequest,
  ip: string,
  requestOrigin: string,
  opts: GuardOptions
): Promise<GuardResult> {
  // 0) Panggilan server-ke-server terpercaya dalam app ini sendiri (mis.
  // generateMetadata bikin OG tags) - diverifikasi lewat HMAC, bukan cuma
  // header polos, jadi nggak bisa dipalsukan dari luar buat nge-skip
  // seluruh proteksi di bawah.
  const internalSig = req.headers[INTERNAL_SSR_SIG_HEADER] as string | undefined;
  if (internalSig && (await verifyInternalRequest(internalSig))) {
    return { ok: true };
  }

  // 1) Blacklist (IP yang pernah kena honeypot)
  const bl = await getBlacklistStatus(ip);
  if (bl.blacklisted) {
    return { ok: false, status: 403, body: { error: 'forbidden' } };
  }

  // 2) Origin/Referer. Kita cuma nolak kalau header-nya ADA tapi nunjuk ke
  // domain lain - bukan nolak gara-gara header-nya kosong, karena beberapa
  // browser/situasi sah nggak selalu ngirim Origin di same-origin fetch.
  const origin = req.headers['origin'] as string | undefined;
  const referer = req.headers['referer'] as string | undefined;
  const allowed = new Set([requestOrigin, ...(opts.extraAllowedOrigins || [])]);

  if (origin && !allowed.has(origin)) {
    return { ok: false, status: 403, body: { error: 'bad_origin' } };
  }
  if (!origin && referer) {
    try {
      if (!allowed.has(new URL(referer).origin)) {
        return { ok: false, status: 403, body: { error: 'bad_origin' } };
      }
    } catch {
      // Referer bukan URL valid - abaikan, jangan tolak cuma gara-gara ini.
    }
  }

  // 3) Rate limit per-IP, state-nya di Durable Object (konsisten di semua
  // edge/region, beda dari Map in-memory yang cuma hidup per-isolate).
  const rate = await checkRateLimit(ip, opts.rateLimit, opts.rateWindowMs);
  if (!rate.allowed) {
    return { ok: false, status: 429, body: { error: 'rate_limited' } };
  }

  // 4) Handshake token (HMAC, 30 detik) + proof-of-work + request signature
  if (opts.requireHandshake) {
    const token = req.headers[TOKEN_HEADER] as string | undefined;
    const powNonce = req.headers[POW_NONCE_HEADER] as string | undefined;
    const reqSig = req.headers[SIG_HEADER] as string | undefined;

    if (!token || !powNonce || !reqSig) {
      return { ok: false, status: 401, body: { error: 'missing_handshake' } };
    }

    const verify = await verifyToken({ token, powNonce, reqSig, path: opts.path });
    if (!verify.ok) {
      return { ok: false, status: 401, body: { error: `handshake_${verify.reason}` } };
    }

    const nonce = tokenNonceOf(token);
    if (!nonce) {
      return { ok: false, status: 401, body: { error: 'handshake_malformed' } };
    }
    // Single-use: token yang sama nggak boleh dipakai dua kali (replay).
    const consumed = await consumeNonce(ip, nonce, TOKEN_TTL_MS + 5_000);
    if (!consumed.fresh) {
      return { ok: false, status: 401, body: { error: 'handshake_replay' } };
    }
  }

  return { ok: true };
}

export function sendGuardRejection(res: NextApiResponse, result: Extract<GuardResult, { ok: false }>) {
  if (result.status === 429) res.setHeader('Retry-After', '5');
  res.status(result.status).json(result.body);
}
