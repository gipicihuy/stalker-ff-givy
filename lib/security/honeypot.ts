import type { NextApiRequest, NextApiResponse } from 'next';
import { blacklistIp } from './doClient';
import { getClientIp } from './request';
import { HONEYPOT_BLACKLIST_TTL_MS } from './constants';

// Endpoint umpan: nggak pernah di-link dari UI/JS manapun di app ini, tapi
// namanya sengaja masuk akal (mis. "bulk lookup", "debug/export") supaya
// scraper yang suka nebak-nebak/enumerasi path /api/* kepancing. IP yang
// hit endpoint ini diblacklist di Durable Object yang sama dengan rate
// limiter, jadi request berikutnya ke endpoint asli (ff/search/img/babu)
// langsung ditolak di layer guard, apapun handshake-nya.
export function createHoneypotHandler(reason: string) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const ip = getClientIp(req);
    await blacklistIp(ip, HONEYPOT_BLACKLIST_TTL_MS, reason);

    // Respons dibikin generik & agak lambat (tanpa nunda beneran, cukup
    // status ambigu) supaya nggak langsung ketauan ini honeypot dari
    // response shape-nya - tapi juga nggak dikasih real data apapun.
    res.status(404).json({ error: 'not_found' });
  };
}
