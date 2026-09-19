// Helper kriptografi berbasis Web Crypto (SubtleCrypto), tersedia di Node
// 20+, Edge Runtime, maupun Cloudflare Workers - dipilih supaya kode ini
// portable di ketiga runtime tanpa dependency tambahan.

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Hex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  return toHex(digest);
}

let hmacKeyCache: { secret: string; key: CryptoKey } | null = null;

async function getHmacKey(secret: string): Promise<CryptoKey> {
  if (hmacKeyCache && hmacKeyCache.secret === secret) return hmacKeyCache.key;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  hmacKeyCache = { secret, key };
  return key;
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toHex(sig);
}

// Constant-time-ish compare buat nge-hindarin timing attack pas
// membandingkan signature/token yang di-generate server vs yang dikirim
// client. Panjang beda -> langsung dianggap gak sama.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hitung jumlah leading-zero hex character pada sebuah hex digest - dipakai
// buat verifikasi proof-of-work ringan (client harus nemuin nonce yang
// bikin hash-nya diawali N nol heksadesimal).
export function countLeadingHexZeros(hex: string): number {
  let count = 0;
  for (const ch of hex) {
    if (ch === '0') count += 1;
    else break;
  }
  return count;
}
