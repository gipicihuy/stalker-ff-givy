// Konstanta branding & helper metadata untuk "Free Fire Stalk".
// Dipakai bareng-bareng oleh root layout dan halaman /stalk biar konsisten.

export const SITE_NAME = 'Free Fire Stalk';
export const SITE_TAGLINE = 'Cek Info Akun Free Fire Lewat UID';
export const SITE_DESCRIPTION =
  'Free Fire Stalk adalah alat cek info akun Free Fire lewat UID secara gratis dan cepat. Lihat nickname, level, rank, guild, hingga status banned hanya dengan memasukkan UID.';
export const THEME_COLOR = '#fabf00';
export const BACKGROUND_COLOR = '#14161b';

// Dipakai sebagai fallback kalau app belum tahu domain deploy-nya sendiri
// (misal saat build statis / belum di-set NEXT_PUBLIC_SITE_URL di Cloudflare).
export const FALLBACK_SITE_URL = 'https://freefirestalk.pages.dev';

export function getConfiguredSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
}
