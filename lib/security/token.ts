import { hmacSha256Hex, randomHex, sha256Hex, timingSafeEqual, countLeadingHexZeros } from './crypto';
import { getSigningSecret } from './env';
import { TOKEN_TTL_MS, POW_DIFFICULTY } from './constants';

// Token = base64url(payload) + "." + hmac_hex(payload)
// payload = `${nonce}.${iat}.${exp}.${challenge}`
//
// - nonce: dipakai buat single-use enforcement (dicek+ditandai lewat
//   Durable Object di lib/security/doClient.ts, bukan di sini - file ini
//   stateless).
// - iat/exp: window validitas 30 detik.
// - challenge: seed proof-of-work yang klien wajib selesaikan (lihat
//   verifyToken di bawah).

function base64urlEncode(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64url');
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf-8');
}

export interface IssuedToken {
  token: string;
  challenge: string;
  difficulty: number;
  exp: number;
}

export async function issueToken(): Promise<IssuedToken> {
  const secret = getSigningSecret();
  const nonce = randomHex(16);
  const iat = Date.now();
  const exp = iat + TOKEN_TTL_MS;
  const challenge = randomHex(8);
  const payload = `${nonce}.${iat}.${exp}.${challenge}`;
  const sig = await hmacSha256Hex(secret, payload);
  const token = `${base64urlEncode(payload)}.${sig}`;
  return { token, challenge, difficulty: POW_DIFFICULTY, exp };
}

export interface TokenVerifyInput {
  token: string;
  powNonce: string;
  reqSig: string;
  path: string;
}

export type TokenVerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'malformed' | 'bad_signature' | 'expired' | 'bad_pow' | 'bad_req_sig';
    };

export async function verifyToken(input: TokenVerifyInput): Promise<TokenVerifyResult> {
  const { token, powNonce, reqSig, path } = input;
  const secret = getSigningSecret();

  const lastDot = token.lastIndexOf('.');
  if (lastDot <= 0) return { ok: false, reason: 'malformed' };
  const encodedPayload = token.slice(0, lastDot);
  const providedSig = token.slice(lastDot + 1);

  let payload: string;
  try {
    payload = base64urlDecode(encodedPayload);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const parts = payload.split('.');
  if (parts.length !== 4) return { ok: false, reason: 'malformed' };
  const [nonce, iatStr, expStr, challenge] = parts;
  const iat = Number(iatStr);
  const exp = Number(expStr);
  if (!nonce || !challenge || !Number.isFinite(iat) || !Number.isFinite(exp)) {
    return { ok: false, reason: 'malformed' };
  }

  const expectedSig = await hmacSha256Hex(secret, payload);
  if (!timingSafeEqual(expectedSig, providedSig)) return { ok: false, reason: 'bad_signature' };

  const now = Date.now();
  // Toleransi 2 detik buat clock skew di sisi "belum boleh dipakai" -
  // expiry-nya sendiri tetap ketat sesuai exp yang di-issue (30 detik).
  if (now < iat - 2000 || now > exp) return { ok: false, reason: 'expired' };

  if (!powNonce) return { ok: false, reason: 'bad_pow' };
  const powHash = await sha256Hex(`${challenge}:${powNonce}`);
  if (countLeadingHexZeros(powHash) < POW_DIFFICULTY) return { ok: false, reason: 'bad_pow' };

  // Request signature: mengikat token ini ke endpoint + pow-nonce spesifik
  // ini. Nggak pakai secret (client emang gak dikasih secret-nya) - ini
  // fungsi hash publik, tapi cukup buat nolak request yang cuma
  // copy-paste token/URL dari satu request ke request lain tanpa
  // benar-benar menjalankan kode client (raising the bar, bukan
  // membuktikan identitas kriptografis).
  if (!reqSig) return { ok: false, reason: 'bad_req_sig' };
  const expectedReqSig = await sha256Hex(`${token}|${path}|${powNonce}`);
  if (!timingSafeEqual(expectedReqSig, reqSig)) return { ok: false, reason: 'bad_req_sig' };

  return { ok: true };
}

export function tokenNonceOf(token: string): string | null {
  const lastDot = token.lastIndexOf('.');
  if (lastDot <= 0) return null;
  try {
    const payload = base64urlDecode(token.slice(0, lastDot));
    return payload.split('.')[0] || null;
  } catch {
    return null;
  }
}
