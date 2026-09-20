/// <reference types="@cloudflare/workers-types" />
// Reference eksplisit di atas WAJIB ada - jangan diandelin ke ambient type
// yang "nebeng" kepake gak langsung gara-gara file lain (mis.
// @opennextjs/cloudflare) kebetulan nge-pull tipe itu lewat import
// package-nya sendiri. Itu rapuh: bisa beda hasil antara lokal vs CI
// tergantung urutan/cara resolusi module TypeScript-nya (ini beneran kejadian
// - build sempat gagal di Cloudflare Pages walau lolos tsc lokal).
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { EdgeGuardDO } from '../../src/durable-objects/edge-guard';

// SENGAJA nggak pakai/extend `CloudflareEnv` (interface global yang
// di-generate `wrangler types` ke cloudflare-env.d.ts). File itu di-gitignore
// dan di CI/Cloudflare Pages build server `wrangler types` NGGAK dijalankan
// otomatis - jadi `CloudflareEnv` di sana cuma resolve ke interface kosong
// bawaan @opennextjs/cloudflare, dan build gagal ("Property 'EDGE_GUARD'
// does not exist"). Deklarasi manual di sini berdiri sendiri, jadi kompil
// di mana aja (lokal maupun CI) tanpa gantung ke file generated tersebut.
export interface GuardEnv {
  EDGE_GUARD?: DurableObjectNamespace<EdgeGuardDO>;
  FP_SIGNING_SECRET?: string;
}

export function getGuardEnv(): GuardEnv {
  try {
    return (getCloudflareContext().env as unknown as GuardEnv) || {};
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
