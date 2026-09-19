import { getCloudflareContext } from '@opennextjs/cloudflare';

// CloudflareEnv di-generate otomatis oleh `wrangler types` (lihat
// cloudflare-env.d.ts) berdasarkan binding di wrangler.jsonc - dipakai
// langsung di sini (bukan interface custom) supaya tipe EDGE_GUARD
// (DurableObjectNamespace<EdgeGuardDO>) nggak konflik generic-nya.
export type GuardEnv = Partial<CloudflareEnv>;

export function getGuardEnv(): GuardEnv {
  try {
    return getCloudflareContext().env || {};
  } catch {
    // Di luar Workers runtime (mis. `next dev` biasa, bukan
    // `opennextjs-cloudflare preview`), getCloudflareContext() throw.
    return {};
  }
}

export function getSigningSecret(): string {
  const env = getGuardEnv();
  const secret = env.FP_SIGNING_SECRET || process.env.FP_SIGNING_SECRET;
  if (!secret) {
    // Fallback INI CUMA BUAT DEV LOKAL. Di production wajib di-set lewat:
    //   npx wrangler secret put FP_SIGNING_SECRET
    // Kalau fallback ini yang kepakai di production, proteksi token/sig
    // jauh lebih lemah karena predictable oleh siapapun yang baca source.
    return 'dev-insecure-fallback-secret-change-me';
  }
  return secret;
}
