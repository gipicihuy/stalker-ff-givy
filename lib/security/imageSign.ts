import { hmacSha256Hex, timingSafeEqual } from './crypto';
import { getSigningSecret } from './env';
import { IMAGE_TOKEN_TTL_MS } from './constants';

// /api/img dipanggil browser lewat tag <img src="..."> biasa, jadi nggak
// bisa nempelin custom header (beda dari /api/ff, /api/search, /api/babu
// yang dipanggil lewat fetch()). Sebagai gantinya, setiap URL proxy gambar
// yang kita keluarin dari /api/ff ditempelin query param signature (`t`)
// + expiry (`e`) yang di-HMAC server-side saat itu juga. /api/img cuma mau
// ngelayanin path yang beneran baru diterbitin dia sendiri lewat endpoint
// utama - bukan URL hasil tebak-tebakan/enumerasi UID langsung ke /api/img.

export async function signImagePath(rawPath: string): Promise<string> {
  const secret = getSigningSecret();
  const exp = Date.now() + IMAGE_TOKEN_TTL_MS;
  const sig = await hmacSha256Hex(secret, `${rawPath}|${exp}`);
  const sep = rawPath.includes('?') ? '&' : '?';
  return `${rawPath}${sep}e=${exp}&t=${sig}`;
}

export async function verifyImageSignature(
  pathWithoutSig: string,
  exp: string | undefined,
  sig: string | undefined
): Promise<boolean> {
  if (!exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || Date.now() > expNum) return false;
  const secret = getSigningSecret();
  const expected = await hmacSha256Hex(secret, `${pathWithoutSig}|${exp}`);
  return timingSafeEqual(expected, sig);
}
