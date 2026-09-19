import { hmacSha256Hex, timingSafeEqual } from './crypto';
import { getSigningSecret } from './env';

// Dipakai KHUSUS buat panggilan server-ke-server dalam app ini sendiri
// (contoh: app/stalk/[[...uid]]/page.tsx manggil /api/ff dari
// generateMetadata buat bikin OG tags - itu jalan di server/Worker, bukan
// browser). Beda dari header 'x-internal-ssr: 1' yang lama (yang cuma
// dipakai buat dedup notif Telegram, nilainya gampang ditiru siapapun),
// signature ini di-HMAC pakai FP_SIGNING_SECRET yang cuma diketahui server
// - jadi nggak bisa dipalsukan dari luar buat nge-skip handshake token.
//
// PENTING: fungsi sign di sini cuma boleh dipanggil dari kode yang beneran
// jalan di server (Server Component / API route), NGGAK boleh diimpor ke
// komponen client manapun.

const INTERNAL_MARKER = 'internal-ssr-generateMetadata';

export const INTERNAL_SSR_SIG_HEADER = 'x-internal-ssr-sig';

export async function signInternalRequest(): Promise<string> {
  return hmacSha256Hex(getSigningSecret(), INTERNAL_MARKER);
}

export async function verifyInternalRequest(sig: string | undefined): Promise<boolean> {
  if (!sig) return false;
  const expected = await hmacSha256Hex(getSigningSecret(), INTERNAL_MARKER);
  return timingSafeEqual(expected, sig);
}
