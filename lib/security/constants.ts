// Konstanta yang dipakai bareng oleh server (pages/api/*) dan client
// (komponen React di app/). Sengaja nggak ada secret apapun di sini -
// file ini boleh ke-bundle ke JS yang dikirim ke browser.

export const TOKEN_TTL_MS = 30_000; // handshake token expired 30 detik
export const POW_DIFFICULTY = 4; // jumlah leading hex-zero yang wajib ditemuin client (~65k percobaan avg)
export const IMAGE_TOKEN_TTL_MS = 5 * 60_000; // signed image URL: 5 menit (longgar, dipakai lewat <img src> biasa)
export const HONEYPOT_BLACKLIST_TTL_MS = 24 * 60 * 60_000; // 24 jam

export const TOKEN_HEADER = 'x-fp-token';
export const POW_NONCE_HEADER = 'x-fp-pow';
export const SIG_HEADER = 'x-fp-sig';

// Nama endpoint (dipakai sebagai "path" pengikat signature - lihat
// lib/security/token.ts). Client & server harus pakai string yang sama
// persis buat endpoint yang sama.
export const GUARD_PATHS = {
  ff: '/api/ff',
  search: '/api/search',
  babu: '/api/babu',
} as const;
